import { computed, ref } from 'vue'
import type { LogEntry } from '~/lib/domain'
import { shouldShowOnboarding } from '~/lib/onboarding/gate'
import { STARTER } from '~/lib/onboarding/starter'
import { useAppStatus } from '~/stores/appStatus'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useActivityStore } from '~/stores/activity'

const ONBOARDED_KEY = 'munbeop.onboarded'

function readFlag(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(ONBOARDED_KEY) === '1'
}

export function useOnboarding() {
  const appStatus = useAppStatus()
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const grammarStore = useGrammarStore()
  const contextsStore = useContextsStore()

  const onboarded = ref(readFlag())
  const open = ref(false)

  const shouldShow = computed(() =>
    shouldShowOnboarding({
      ready: appStatus.status === 'ready',
      logEmpty: logStore.entries.length === 0,
      onboarded: onboarded.value,
    }),
  )

  // The persistent zero-state stays available as a manual entry point even
  // after the user skips (flag set), as long as they have no entries yet.
  const showEmptyPlot = computed(
    () => appStatus.status === 'ready' && logStore.entries.length === 0,
  )

  function markOnboarded() {
    onboarded.value = true
    if (typeof localStorage !== 'undefined') localStorage.setItem(ONBOARDED_KEY, '1')
  }

  function start() {
    open.value = true
  }

  function skip() {
    markOnboarded()
    open.value = false
  }

  /** Write the guided sentence as a real diary entry + SRS row, then close. */
  async function complete(sentence: string): Promise<LogEntry | null> {
    const grammar = grammarStore.items.find((g) => g.ko === STARTER.grammarKo)
    const ctx = contextsStore.active[0]
    if (!grammar || !ctx) {
      // Broken starter or no contexts — never trap a new user on a dead overlay.
      markOnboarded()
      open.value = false
      return null
    }
    const entry = await logStore.add({
      ko: grammar.ko,
      sentence,
      feedback: 'easy',
      errorNote: null,
      reviewState: 'unreviewed',
      contextId: ctx.id,
      contextName: ctx.name,
    })
    void activity.record()
    await srsStore.markSeen(grammar.ko)
    await srsStore.recalculate(grammar.ko)
    markOnboarded()
    open.value = false
    return entry
  }

  return { open, shouldShow, showEmptyPlot, start, skip, complete }
}

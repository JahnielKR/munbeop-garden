import { computed, ref, watch } from 'vue'
import type { LogEntry } from '~/lib/domain'
import { shouldShowOnboarding } from '~/lib/onboarding/gate'
import { STARTER } from '~/lib/onboarding/starter'
import { useAppStatus } from '~/stores/appStatus'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'
import { useStudySession } from '~/composables/useStudySession'

const ONBOARDED_KEY = 'munbeop.onboarded'

function flagKey(userId: string): string {
  return `${ONBOARDED_KEY}.${userId}`
}

function readFlag(userId: string | null): boolean {
  if (!userId || typeof localStorage === 'undefined') return false
  return localStorage.getItem(flagKey(userId)) === '1'
}

export function useOnboarding() {
  const appStatus = useAppStatus()
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const grammarStore = useGrammarStore()
  const contextsStore = useContextsStore()
  const auth = useAuthStore()
  const studySession = useStudySession()

  const onboarded = ref(readFlag(auth.user?.id ?? null))
  const open = ref(false)

  watch(
    () => auth.user?.id ?? null,
    (userId) => {
      onboarded.value = readFlag(userId)
      open.value = false
    },
  )

  const hasStudyData = computed(() => {
    if (logStore.entries.length > 0) return true
    if (Object.values(activity.map).some((day) => day.count > 0)) return true
    const currentGrammar = new Set(grammarStore.items.map((grammar) => grammar.ko))
    return Object.keys(srsStore.map).some((ko) => currentGrammar.has(ko))
  })

  const shouldShow = computed(() =>
    shouldShowOnboarding({
      ready: appStatus.status === 'ready',
      logEmpty: !hasStudyData.value,
      onboarded: onboarded.value,
    }),
  )

  // The persistent zero-state stays available as a manual entry point even
  // after the user skips (flag set), as long as they have no entries yet.
  const showEmptyPlot = computed(() => appStatus.status === 'ready' && !hasStudyData.value)

  function markOnboarded() {
    const userId = auth.user?.id
    if (!userId) return
    onboarded.value = true
    if (typeof localStorage !== 'undefined') localStorage.setItem(flagKey(userId), '1')
  }

  function start() {
    studySession.begin()
    open.value = true
  }

  function skip() {
    markOnboarded()
    open.value = false
  }

  /** Write the guided sentence as a real diary entry + SRS row, then close. */
  async function complete(sentence: string): Promise<LogEntry | null> {
    const ownerUserId = auth.user?.id
    if (!ownerUserId || !studySession.isCurrent()) return null
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
    if (auth.user?.id !== ownerUserId || !studySession.isCurrent()) return null
    void activity.record('onboarding')
    await srsStore.markSeen(grammar.ko)
    if (auth.user?.id !== ownerUserId || !studySession.isCurrent()) return null
    markOnboarded()
    open.value = false
    return entry
  }

  return { open, shouldShow, showEmptyPlot, hasStudyData, start, skip, complete }
}

import { computed, onMounted, ref, watch } from 'vue'
import { particleGrammarKos, particleMastery } from '~/lib/particle-lab'
import { PARTICLES } from '~/seed/particles'
import { useSrsStore } from '~/stores/srs'

/** UI-side memory (never via the storage adapter), like garden.milestonesSeen. */
const EARNED_KEY = 'particle-lab.masterEarned'

function readEarned(): boolean {
  try {
    return window.localStorage.getItem(EARNED_KEY) === '1'
  } catch {
    return false
  }
}
function writeEarned() {
  try {
    window.localStorage.setItem(EARNED_KEY, '1')
  } catch {
    /* ignore quota / SSR */
  }
}

/**
 * 조사 마스터 — derived achievement over the 11 lab particles. Earned-ness is
 * read from SRS (mastery === 'tree' for all); sticky once reached, with a
 * one-shot celebration the first time it flips, like useGardenCelebration.
 */
export function useParticleMaster() {
  const srs = useSrsStore()
  const grammarKos = particleGrammarKos(PARTICLES)
  const view = computed(() => particleMastery(grammarKos, srs.map, 'tree'))

  const acknowledged = ref(false) // persisted once earned
  const celebrate = ref(false)
  const ready = ref(false)
  onMounted(() => {
    acknowledged.value = readEarned()
    ready.value = true
  })

  watch(
    [() => view.value.earned, ready],
    () => {
      if (!ready.value || import.meta.server) return
      if (!view.value.earned) return
      if (acknowledged.value) return // already earned in a past session
      writeEarned()
      acknowledged.value = true
      celebrate.value = true // surface exactly once
    },
    { immediate: true },
  )

  /** Badge shows when currently earned OR ever earned (never un-earns). */
  const earned = computed(() => view.value.earned || acknowledged.value)
  function dismiss() {
    celebrate.value = false
  }

  return {
    perParticle: computed(() => view.value.perParticle),
    doneCount: computed(() => view.value.doneCount),
    total: computed(() => view.value.total),
    earned,
    celebrate,
    dismiss,
  }
}

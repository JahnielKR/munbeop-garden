import { computed, onMounted, ref, watch } from 'vue'
import { particleGrammarKos, particleMastery } from '~/lib/particle-lab'
import { PARTICLES } from '~/seed/particles'
import { useSrsStore } from '~/stores/srs'
import { useSettingsStore } from '~/stores/settings'

/**
 * 조사 마스터 — derived achievement over the 11 lab particles. Earned-ness is
 * read from SRS (mastery === 'tree' for all; already per-user). Its sticky
 * "ever earned" acknowledgement used to be a GLOBAL localStorage flag that
 * leaked across accounts on a shared device; it now lives in the account-synced
 * settings blob (labEarned.particle), like the other labs.
 */
export function useParticleMaster() {
  const srs = useSrsStore()
  const settings = useSettingsStore()
  const grammarKos = particleGrammarKos(PARTICLES)
  const view = computed(() => particleMastery(grammarKos, srs.map, 'tree'))

  const celebrate = ref(false)
  const ready = ref(false)
  // Gate the watch until mounted so a pre-hydration transient can't fire a
  // spurious celebration before SRS/settings are in hand.
  onMounted(() => {
    ready.value = true
  })

  watch(
    [() => view.value.earned, ready],
    () => {
      if (!ready.value || import.meta.server) return
      if (!view.value.earned) return
      if (settings.labEarned.particle) return // already earned in a past session
      void settings.markLabEarned('particle')
      celebrate.value = true // surface exactly once
    },
    { immediate: true },
  )

  /** Badge shows when currently earned OR ever earned (never un-earns). */
  const earned = computed(() => view.value.earned || settings.labEarned.particle)
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

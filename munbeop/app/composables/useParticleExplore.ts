import { computed, ref } from 'vue'
import type { LabSentence, ParticleId, SpeechLevel } from '~/lib/domain'
import { indexOfParticle, particleIds, readingFor } from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'
import { useActivityStore } from '~/stores/activity'

/**
 * Explore-mode session: sentence navigation + per-sentence OFF set.
 * The OFF set resets when navigating — each sentence starts fully ON.
 */
export function useParticleExplore() {
  const sentences = PARTICLE_SENTENCES
  const index = ref(0)

  // Explore has no "answer"; one tick marks the day active.
  void useActivityStore().record()
  const off = ref<Set<ParticleId>>(new Set())
  // Sticky global preference — unlike `off`, it is NOT reset on navigation.
  const level = ref<SpeechLevel>('polite')
  function setLevel(l: SpeechLevel) {
    level.value = l
  }

  const sentence = computed<LabSentence>(() => sentences[index.value]!)
  const reading = computed(() => readingFor(sentence.value, off.value))
  /** True for multi-OFF combos without an explicit reading → generic nuance. */
  const isFallback = computed(() => off.value.size > 0 && reading.value === null)
  const trans = computed(() => reading.value?.trans ?? sentence.value.trans)
  const nuance = computed(() => {
    if (isFallback.value) return null
    return reading.value ? (reading.value.nuance ?? null) : sentence.value.nuance
  })
  const legendIds = computed(() => particleIds(sentence.value))

  function toggle(id: ParticleId) {
    const next = new Set(off.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    off.value = next
  }

  function go(i: number) {
    if (i < 0 || i >= sentences.length) return
    index.value = i
    off.value = new Set()
  }

  /** Deep link ?focus=<particleId> — jump to first sentence containing it. */
  function focusParticle(id: ParticleId) {
    const i = indexOfParticle(sentences, id)
    if (i >= 0) go(i)
  }

  return {
    sentences,
    index,
    sentence,
    off,
    level,
    setLevel,
    trans,
    nuance,
    isFallback,
    legendIds,
    toggle,
    go,
    focusParticle,
  }
}

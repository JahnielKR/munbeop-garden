<script setup lang="ts">
import type { LabSentence, ParticleId, SpeechLevel } from '~/lib/domain'
import TokenChip from './TokenChip.vue'

/**
 * Renders eojeols as chip groups: tokens inside an eojeol sit flush
 * (no gap — Korean particles attach to their noun), eojeols are spaced.
 */
interface Props {
  sentence: LabSentence
  off: ReadonlySet<ParticleId>
  showGloss?: boolean
  level?: SpeechLevel
}
withDefaults(defineProps<Props>(), { showGloss: true, level: 'polite' })
const emit = defineEmits<{ toggle: [id: ParticleId] }>()
</script>

<template>
  <div class="sentence" data-testid="particle-sentence">
    <span v-for="(eojeol, i) in sentence.eojeols" :key="i" class="eojeol">
      <TokenChip
        v-for="(tok, j) in eojeol"
        :key="j"
        :token="tok"
        :off="tok.kind === 'particle' && off.has(tok.particleId)"
        :show-gloss="showGloss"
        :level="level"
        @toggle="tok.kind === 'particle' ? emit('toggle', tok.particleId) : undefined"
      />
    </span>
  </div>
</template>

<style scoped>
.sentence {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 8px;
}
.eojeol {
  display: inline-flex;
  align-items: flex-start;
  gap: 0;
}
@media (max-width: 480px) {
  .sentence { gap: 10px; }
}
</style>

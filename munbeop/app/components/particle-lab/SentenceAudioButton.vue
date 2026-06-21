<script setup lang="ts">
import type { SpeechLevel } from '~/lib/domain'
import { useParticleAudio } from '~/composables/useParticleAudio'

/** 🔊 button that plays a sentence's pre-generated TTS clip at a speech level. */
interface Props {
  sentenceId: string
  level?: SpeechLevel
}
const props = defineProps<Props>()
const { t } = useI18n()
const { playSentence } = useParticleAudio()
</script>

<template>
  <button
    type="button"
    class="audio-btn"
    :aria-label="t('particles.explore.play_audio')"
    data-testid="sentence-audio"
    @click="playSentence(props.sentenceId, props.level ?? 'polite')"
  >
    <span aria-hidden="true">🔊</span>
  </button>
</template>

<style scoped>
.audio-btn {
  align-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--surface);
  border: 2px solid var(--border);
  font-size: var(--text-md);
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    border-color var(--motion-quick) var(--ease-out);
}
.audio-btn:hover {
  transform: translate(-1px, -1px);
  border-color: var(--accent);
}
.audio-btn:active {
  transform: translate(0, 0);
}
.audio-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

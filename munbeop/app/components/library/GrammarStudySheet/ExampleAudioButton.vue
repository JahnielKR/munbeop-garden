<!-- app/components/library/GrammarStudySheet/ExampleAudioButton.vue -->
<script setup lang="ts">
import { useExampleAudio } from '~/composables/useExampleAudio'
import Icon from '~/components/ui/Icon.vue'

/** Pixel speaker button that plays a grammar example's pre-generated TTS clip. */
interface Props {
  sentence: string
}
const props = defineProps<Props>()
const { t } = useI18n()
const { playExample } = useExampleAudio()
</script>

<template>
  <button
    type="button"
    class="audio-btn"
    :aria-label="t('library.examples.play_audio')"
    data-testid="example-audio"
    @click="playExample(props.sentence)"
  >
    <Icon name="speaker" :size="16" />
  </button>
</template>

<style scoped>
.audio-btn {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--paper-deep, var(--surface));
  color: var(--text);
  border: 2px solid var(--ink-line);
  box-shadow: var(--shadow-pixel-sm);
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out),
    border-color var(--motion-quick) var(--ease-out);
}
.audio-btn:hover {
  transform: translate(-1px, -1px);
  border-color: var(--ink);
  box-shadow: var(--shadow-pixel-md);
}
.audio-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--shadow-color);
}
.audio-btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

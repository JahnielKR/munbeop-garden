<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LocalizedString } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import { useTypewriter } from '~/composables/useTypewriter'

/**
 * IntroCinematic — ambient narrative opener.
 *
 * Splits the level's narrative into paragraphs (`\n\n`) and reveals them one
 * at a time with a typewriter. Tap anywhere: flush the current paragraph if
 * still typing, otherwise advance; after the last paragraph, emit `done`.
 * A skip button fast-forwards the whole cinematic.
 */

interface Props {
  narrative: LocalizedString
  /** Korean NPC voice line shown above the narrative (and later, played as TTS). */
  voiceLine: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ done: [] }>()

const { tl } = useLocalized()
const { t } = useI18n()

const paragraphs = computed(() =>
  tl(props.narrative)
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean),
)

const pIndex = ref(0)
const currentParagraph = computed(() => paragraphs.value[pIndex.value] ?? '')
const { rendered, done, skip } = useTypewriter(currentParagraph, { speed: 22 })

function onTap() {
  if (!done.value) {
    skip()
    return
  }
  if (pIndex.value < paragraphs.value.length - 1) {
    pIndex.value++
  } else {
    emit('done')
  }
}
</script>

<template>
  <div
    class="cinematic"
    data-testid="cinematic-root"
    role="button"
    tabindex="0"
    @click="onTap"
    @keydown.enter="onTap"
    @keydown.space.prevent="onTap"
  >
    <p class="cinematic__voice" data-testid="cinematic-voice">{{ voiceLine }}</p>

    <p class="cinematic__text" data-testid="cinematic-text">{{ rendered }}</p>

    <div class="cinematic__footer">
      <span class="cinematic__pager" aria-hidden="true">
        {{ pIndex + 1 }} / {{ paragraphs.length }}
      </span>
      <span class="cinematic__tap">{{ t('escape.tap_to_continue') }}</span>
      <button
        type="button"
        class="cinematic__skip"
        data-testid="cinematic-skip"
        @click.stop="emit('done')"
      >
        {{ t('escape.skip') }} ▸▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.cinematic {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 32px 24px;
  background: radial-gradient(ellipse at 50% 20%, #2c2017 0%, #160f08 70%);
  color: #f3e6c8;
  cursor: pointer;
  outline: none;
}
.cinematic__voice {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #ffd9a0;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.6);
}
.cinematic__text {
  margin: 0;
  max-width: 560px;
  min-height: 7.5em;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 16px;
  line-height: 1.9;
  text-align: center;
  white-space: pre-wrap;
}
.cinematic__footer {
  display: flex;
  align-items: center;
  gap: 22px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(243, 230, 200, 0.55);
}
.cinematic__tap {
  animation: cinematic-blink 1.6s steps(2) infinite;
}
.cinematic__skip {
  font: inherit;
  color: inherit;
  background: transparent;
  border: 1px solid rgba(243, 230, 200, 0.4);
  padding: 8px 12px;
  cursor: pointer;
}
.cinematic__skip:hover {
  border-color: rgba(243, 230, 200, 0.9);
  color: rgba(243, 230, 200, 0.95);
}
@keyframes cinematic-blink {
  50% {
    opacity: 0.25;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cinematic__tap {
    animation: none;
  }
}
</style>

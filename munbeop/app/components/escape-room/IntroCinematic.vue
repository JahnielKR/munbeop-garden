<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { LocalizedString } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import { useTypewriter } from '~/composables/useTypewriter'
import { useEscapeRoomAudio } from '~/composables/useEscapeRoomAudio'

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
  /** Optional full-bleed illustration behind the narrative. */
  image?: string
  /** Korean NPC voice line shown above the narrative (and later, played as TTS). */
  voiceLine: string
  /** Already-resolved URL of the spoken voice line; played while the cinematic is shown. */
  voiceAudio?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ done: [] }>()

const { tl } = useLocalized()
const { t } = useI18n()
const audio = useEscapeRoomAudio()
const continueButton = ref<HTMLButtonElement | null>(null)

onMounted(() => {
  if (props.voiceAudio) audio.playVoice(props.voiceAudio)
  nextTick(() => continueButton.value?.focus({ preventScroll: true }))
})
onBeforeUnmount(() => {
  if (props.voiceAudio) audio.stopVoice()
})

/** Stop the spoken line, then bubble `done` so the parent advances. */
function finish() {
  if (props.voiceAudio) audio.stopVoice()
  emit('done')
}

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
    finish()
  }
}
</script>

<template>
  <div
    class="cinematic"
    data-testid="cinematic-root"
    @click="onTap"
  >
    <img v-if="image" :src="image" alt="" class="cinematic__art" >
    <p class="cinematic__voice" data-testid="cinematic-voice">{{ voiceLine }}</p>

    <p class="cinematic__text" data-testid="cinematic-text">{{ rendered }}</p>

    <div class="cinematic__footer">
      <span class="cinematic__pager" aria-hidden="true">
        {{ pIndex + 1 }} / {{ paragraphs.length }}
      </span>
      <button
        ref="continueButton"
        type="button"
        class="cinematic__tap"
        data-testid="cinematic-continue"
        @click.stop="onTap"
      >
        {{ t('escape.tap_to_continue') }}
      </button>
      <button
        type="button"
        class="cinematic__skip"
        data-testid="cinematic-skip"
        @click.stop="finish"
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
  isolation: isolate;
  overflow-y: auto;
}
.cinematic::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      180deg,
      rgba(8, 7, 10, 0.28) 0%,
      rgba(8, 7, 10, 0.52) 45%,
      rgba(8, 7, 10, 0.82) 100%
    ),
    radial-gradient(ellipse at 50% 38%, transparent 0%, rgba(8, 7, 10, 0.38) 78%);
  pointer-events: none;
}
.cinematic__art {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}
.cinematic > :not(.cinematic__art) {
  position: relative;
  z-index: 2;
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
  padding: 18px 22px;
  border: 1px solid rgba(255, 225, 174, 0.24);
  border-radius: 10px;
  background: rgba(13, 10, 8, 0.68);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(3px);
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
  font: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  animation: cinematic-blink 1.6s steps(2) infinite;
}
.cinematic__tap:focus-visible,
.cinematic__skip:focus-visible {
  outline: 2px solid #ffd9a0;
  outline-offset: 3px;
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
@media (max-height: 560px) and (orientation: landscape) {
  .cinematic {
    justify-content: flex-start;
    gap: 10px;
    padding: 12px 18px;
  }
  .cinematic__voice {
    font-size: 18px;
  }
  .cinematic__text {
    min-height: 0;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.55;
  }
  .cinematic__footer {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '~/lib/domain'
import { guideFor } from '~/lib/pronunciation'
import { examplesFor } from '~/lib/grammar-examples'
import { usePronunciationAudio } from '~/composables/usePronunciationAudio'
import ExampleAudioButton from './ExampleAudioButton.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()
const { playSyllable, playAll } = usePronunciationAudio()

const guide = computed(() => guideFor(props.grammar.ko))

/** Row 2: the grammar living in the SHORTEST available example (reuses the
 *  examples bank's audio). Falls back to the canonical example (no audio). */
const sentence = computed(() => {
  const bank = examplesFor(props.grammar.ko)
  if (bank.length) {
    const shortest = [...bank].sort((a, b) => a.sentence.length - b.sentence.length)[0]!
    return { ko: shortest.sentence, trans: tl(shortest.trans), hasAudio: true }
  }
  if (props.grammar.example) {
    return { ko: props.grammar.example, trans: props.grammar.trans ? tl(props.grammar.trans) : '', hasAudio: false }
  }
  return null
})
</script>

<template>
  <section v-if="guide" class="pron-section">
    <h3 class="section-title">{{ t('library.pronunciation.title') }}</h3>

    <!-- Row 1 — the grammar alone, sounded out by parts. -->
    <div class="pron-row">
      <span class="pron-row__label">{{ t('library.pronunciation.by_parts') }}</span>
      <div class="pron-parts">
        <button
          v-for="(syl, i) in guide.parts"
          :key="i"
          type="button"
          class="pron-chip"
          lang="ko"
          :title="t('library.pronunciation.play_syllable')"
          @click="playSyllable(syl)"
        >{{ syl }}</button>
        <button
          type="button"
          class="pron-all"
          :aria-label="t('library.pronunciation.play_all')"
          :title="t('library.pronunciation.play_all')"
          @click="playAll(guide.parts)"
        ><span aria-hidden="true">▶</span></button>
      </div>
    </div>

    <!-- Row 2 — the grammar in a short sentence, natural. -->
    <div v-if="sentence" class="pron-row">
      <span class="pron-row__label">{{ t('library.pronunciation.in_sentence') }}</span>
      <p class="pron-sentence" lang="ko">
        <ExampleAudioButton v-if="sentence.hasAudio" :sentence="sentence.ko" />
        <span class="pron-sentence__ko">{{ sentence.ko }}</span>
      </p>
      <p v-if="sentence.trans" class="pron-sentence__trans">{{ sentence.trans }}</p>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.pron-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0;
}
.pron-row__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.pron-parts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.pron-chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  color: var(--ink);
  background: var(--paper-deep, var(--surface));
  border: 2px solid var(--ink-line);
  padding: 6px 12px;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    border-color var(--motion-quick) var(--ease-out);
}
.pron-chip:hover { transform: translate(-1px, -1px); border-color: var(--ink); }
.pron-chip:active { transform: translate(0, 0); }
.pron-chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.pron-all {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 12px;
  color: var(--ink);
  background: var(--accent, var(--paper-deep));
  border: 2px solid var(--ink-line);
  cursor: pointer;
  transition: transform var(--motion-quick) var(--ease-out);
}
.pron-all:hover { transform: translate(-1px, -1px); }
.pron-all:active { transform: translate(0, 0); }
.pron-all:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.pron-sentence {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
}
.pron-sentence__trans {
  margin: 2px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
}
</style>

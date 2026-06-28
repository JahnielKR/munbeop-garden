<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Grammar, GrammarExample, SpeechLevel } from '~/lib/domain'
import { examplesFor } from '~/lib/grammar-examples'
import ExampleAudioButton from './ExampleAudioButton.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const REGISTER_KO: Record<SpeechLevel, string> = {
  formal: '합니다체',
  polite: '해요체',
  casual: '반말',
}
const REGISTER_ARIA: Record<SpeechLevel, string> = {
  formal: 'library.examples.register_formal',
  polite: 'library.examples.register_polite',
  casual: 'library.examples.register_casual',
}

// Only the authored bank renders here. The canonical `grammar.example` lives in
// MeaningSection alone — echoing it here produced the "above == below" duplicate.
// examplesFor is async (it loads the grammar's TOPIK-level seed chunk on demand),
// so the bank fills in once the chunk resolves.
const bank = ref<GrammarExample[]>([])
watch(
  () => [props.grammar.ko, props.grammar.deckId] as const,
  async ([ko, deckId]) => {
    const result = await examplesFor(ko, deckId)
    // Ignore a stale resolve if the grammar changed while the chunk loaded.
    if (props.grammar.ko === ko) bank.value = result
  },
  { immediate: true },
)
</script>

<template>
  <section v-if="bank.length" class="examples-section">
    <h3 class="section-title">{{ t('library.modal.section.examples') }}</h3>
    <ul class="examples">
      <li v-for="(ex, i) in bank" :key="i" class="example">
        <p class="example__ko" lang="ko">
          <ExampleAudioButton :sentence="ex.sentence" />
          <span class="example__sentence">{{ ex.sentence }}</span>
          <span class="example__chip" lang="ko" :aria-label="t(REGISTER_ARIA[ex.level])">{{ REGISTER_KO[ex.level] }}</span>
        </p>
        <p class="example__trans">{{ tl(ex.trans) }}</p>
      </li>
    </ul>
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
.examples {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.example {
  border-left: 3px solid var(--ink-line);
  padding-left: 10px;
}
.example__ko {
  margin: 0 0 2px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}
.example__chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
  border: 1px solid var(--ink-line);
  padding: 2px 5px;
  white-space: nowrap;
}
.example__trans {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
}
</style>

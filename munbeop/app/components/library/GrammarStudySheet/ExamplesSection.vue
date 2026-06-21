<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar, SpeechLevel } from '~/lib/domain'
import { examplesFor } from '~/lib/grammar-examples'

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

const bank = computed(() => examplesFor(props.grammar.ko))
const fallback = computed(() =>
  bank.value.length === 0 && props.grammar.example
    ? {
        sentence: props.grammar.example,
        trans: props.grammar.trans ? tl(props.grammar.trans) : '',
      }
    : null,
)
</script>

<template>
  <section v-if="bank.length || fallback" class="examples-section">
    <h3 class="section-title">{{ t('library.modal.section.examples') }}</h3>
    <ul class="examples">
      <li v-for="(ex, i) in bank" :key="i" class="example">
        <p class="example__ko" lang="ko">
          <span class="example__sentence">{{ ex.sentence }}</span>
          <span class="example__chip" lang="ko" :aria-label="t(REGISTER_ARIA[ex.level])">{{ REGISTER_KO[ex.level] }}</span>
        </p>
        <p class="example__trans">{{ tl(ex.trans) }}</p>
      </li>
      <li v-if="fallback" class="example">
        <p class="example__ko" lang="ko">{{ fallback.sentence }}</p>
        <p v-if="fallback.trans" class="example__trans">{{ fallback.trans }}</p>
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
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}
.example__chip {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
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

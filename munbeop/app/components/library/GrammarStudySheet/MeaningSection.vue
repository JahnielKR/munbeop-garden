<script setup lang="ts">
import type { Grammar } from '~/lib/domain'

interface Props {
  grammar: Grammar
}
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <section class="meaning-section">
    <h3 class="section-title">{{ t('library.modal.section.meaning') }}</h3>
    <p class="meaning">{{ tl(grammar.meaning) }}</p>
    <div v-if="grammar.example" class="example">
      <p class="example__ko">{{ grammar.example }}</p>
      <p v-if="grammar.trans" class="example__trans">{{ tl(grammar.trans) }}</p>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  margin: 0 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.meaning {
  margin: 0 0 12px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--ink);
}
.example {
  background: var(--paper);
  border-left: 4px solid var(--jade);
  padding: 10px 12px;
}
.example__ko {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  color: var(--ink);
}
.example__trans {
  margin: 4px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Grammar } from '~/lib/domain'
import { pairsFor } from '~/lib/grammar-pairs'
import PairDrill from './PairDrill.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const emit = defineEmits<{ navigate: [ko: string] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const rows = computed(() => pairsFor(props.grammar.ko))
const openId = ref<string | null>(null)
function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <section v-if="rows.length" class="confused-section">
    <h3 class="section-title">{{ t('library.confused.title') }}</h3>
    <div v-for="row in rows" :key="row.pair.id" class="confused">
      <p class="confused__head">
        <button
          type="button"
          class="confused__chip"
          lang="ko"
          :title="t('library.confused.open_hint')"
          @click="emit('navigate', row.otherKo)"
        >{{ row.otherKo }}</button>
      </p>
      <p class="confused__note">{{ tl(row.pair.note) }}</p>
      <button
        type="button"
        class="confused__cta"
        :aria-expanded="openId === row.pair.id"
        :data-testid="`confused-test-${row.pair.id}`"
        @click="toggle(row.pair.id)"
      >
        {{ t('library.confused.test_cta') }}
      </button>
      <PairDrill v-if="openId === row.pair.id" :pair="row.pair" />
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
.confused {
  border-left: 3px solid var(--ink-line);
  padding-left: 10px;
  margin-bottom: 12px;
}
.confused__head {
  margin: 0 0 4px;
}
.confused__chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
  background: var(--paper-deep, transparent);
  border: 1px solid var(--ink-line);
  padding: 2px 7px;
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
/* A small chevron hints the chip opens that grammar's study sheet. */
.confused__chip::after {
  content: ' ›';
  color: var(--ink-soft);
}
.confused__chip:hover {
  background: var(--paper);
  transform: translate(-1px, -1px);
}
.confused__chip:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.confused__note {
  margin: 0 0 6px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.confused__cta {
  padding: 5px 12px;
  background: var(--paper-deep);
  border: 2px solid var(--ink-line);
  color: var(--ink);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.confused__cta:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

<script setup lang="ts">
import type { DomainProgress } from '~/lib/numbers-market/sets'

interface Props {
  perDomain: DomainProgress[]
  doneCount: number
  total: number
  earned: boolean
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="master" :class="{ 'master--earned': earned }">
    <span class="master__title" lang="ko">{{ t('numberMarket.master.title') }}</span>
    <span class="master__count">{{ t('numberMarket.master.progress', { done: doneCount, total }) }}</span>
    <span class="master__pips">
      <span
        v-for="d in perDomain"
        :key="d.id"
        class="master__pip"
        :class="{ 'master__pip--done': d.done }"
        :title="d.ko"
      />
    </span>
  </div>
</template>

<style scoped>
.master { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); }
.master--earned { border-color: var(--accent-bright, #2e7d32); }
.master__title { font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: var(--ink); }
.master__count { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.master__pips { display: inline-flex; gap: 6px; margin-left: auto; }
.master__pip { width: 10px; height: 10px; background: var(--border); }
.master__pip--done { background: var(--accent-bright, #2e7d32); }
</style>

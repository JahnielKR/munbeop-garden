<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import { useLogStore } from '~/stores/log'
const logStore = useLogStore()
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <BilingualTitle ko="일기" :latin="t('title.log')" />
    <div v-if="logStore.entries.length === 0" class="empty">{{ t('empty.log') }}</div>
    <ul v-else class="list">
      <li v-for="e in logStore.entries.slice(0, 20)" :key="e.id" class="entry">
        <div class="entry__head">
          <span class="entry__ko">{{ e.ko }}</span>
          <span class="entry__date">{{ new Date(e.date).toLocaleString() }}</span>
        </div>
        <div class="entry__sentence">{{ e.sentence }}</div>
        <div class="entry__meta">
          {{ e.contextName }} ·
          {{ e.feedback === 'easy' ? t('practice.fb_easy') : t('practice.fb_hard') }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
}
.entry {
  background: var(--paper-warm);
  border-left: 3px solid var(--sky);
  padding: 12px 16px;
}
.entry__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.entry__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
}
.entry__date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink-soft);
}
.entry__sentence {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
}
.entry__meta {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 4px;
}
</style>

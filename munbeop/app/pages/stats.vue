<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <BilingualTitle ko="통계" :latin="t('title.stats')" />
    <div class="empty">{{ t('empty.stats') }}</div>
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
</style>

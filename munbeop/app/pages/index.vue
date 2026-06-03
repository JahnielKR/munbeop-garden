<script setup lang="ts">
definePageMeta({ surface: 'game' })

const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">내 정원</span>
      <span class="title__es">{{ t('title.garden') }}</span>
    </h1>
    <div class="empty">
      <p>{{ t('empty.garden') }}</p>
      <p>
        <NuxtLink to="/practice">→ {{ t('common.go_to_practice') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.title__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 32px;
  color: var(--jade);
}
.title__es {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--ink);
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: 'Inter', sans-serif;
  color: var(--muted);
  line-height: 1.6;
}
.empty a {
  color: var(--jade);
  text-decoration: underline;
}
</style>

<!-- app/components/sentence-garden/SentenceCard.vue -->
<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <span class="sg-card" lang="ko">{{ text }}</span>
</template>

<style scoped>
.sg-card {
  display: inline-block;
  font-family: var(--font-ko, 'Noto Sans KR', sans-serif);
  font-size: var(--text-lg);
  color: var(--ink);
  background: var(--paper-warm, var(--surface));
  border: 2px solid var(--border);
  box-shadow: 2px 2px 0 var(--shadow-cream);
  padding: 8px 14px;
}
</style>

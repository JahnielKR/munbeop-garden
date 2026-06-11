<script setup lang="ts">
interface Props {
  title: string
  body: string
}
defineProps<Props>()
</script>

<template>
  <section class="coming-soon">
    <h3 class="coming-soon__title">{{ title }}</h3>
    <p class="coming-soon__body">{{ body }}</p>
  </section>
</template>

<style scoped>
.coming-soon {
  border: 2px dashed var(--ink-line);
  background: var(--paper);
  padding: 12px 14px;
  margin-top: 16px;
  opacity: 0.8;
}
.coming-soon__title {
  margin: 0 0 4px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}
.coming-soon__body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
</style>

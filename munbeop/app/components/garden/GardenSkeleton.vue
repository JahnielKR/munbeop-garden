<!-- app/components/garden/GardenSkeleton.vue -->
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="garden-skeleton" role="status" :aria-label="t('garden.loading')">
    <div class="garden-skeleton__plot" aria-hidden="true">
      <span class="garden-skeleton__seed">🌱</span>
    </div>
  </div>
</template>

<style scoped>
.garden-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}
.garden-skeleton__plot {
  width: 160px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 3px dashed var(--border-strong, var(--border));
  border-radius: 8px;
  animation: garden-skeleton-pulse 1.4s var(--ease-out, ease-in-out) infinite;
}
.garden-skeleton__seed {
  font-size: 40px;
  filter: saturate(0.4);
}
@keyframes garden-skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .garden-skeleton__plot { animation: none; }
}
</style>

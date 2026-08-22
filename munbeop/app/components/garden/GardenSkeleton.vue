<!-- app/components/garden/GardenSkeleton.vue -->
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="garden-skeleton" role="status" :aria-label="t('garden.loading')">
    <div class="garden-skeleton__plot" aria-hidden="true">
      <svg class="garden-skeleton__seed" viewBox="0 0 16 16" shape-rendering="crispEdges">
        <path d="M7 6h2v9H7zM1 2h5v1h2v5H5V7H3V5H1zM10 1h5v4h-1v2h-5V3h1z" />
        <path class="garden-skeleton__earth" d="M2 13h12v3H2z" />
      </svg>
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
  border: 3px solid var(--border-strong);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
  animation: garden-skeleton-pulse 1.2s var(--ease-step-3) infinite;
}
.garden-skeleton__seed {
  width: 48px;
  height: 48px;
  fill: var(--jade);
}
.garden-skeleton__earth {
  fill: var(--border-strong);
}
@keyframes garden-skeleton-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.9;
  }
}
@media (prefers-reduced-motion: reduce) {
  .garden-skeleton__plot {
    animation: none;
  }
}
</style>

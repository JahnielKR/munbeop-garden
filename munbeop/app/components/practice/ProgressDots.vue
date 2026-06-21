<script setup lang="ts">
interface Props {
  total: number
  progress: number
  /** Accessible name for the progressbar (screen readers). */
  label?: string
}
defineProps<Props>()
</script>

<template>
  <div
    class="dots"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuenow="progress"
    :aria-valuemax="total"
    :aria-label="label"
  >
    <span
      v-for="i in total"
      :key="i"
      class="dot"
      :class="{ 'dot--done': i - 1 < progress, 'dot--current': i - 1 === progress }"
    />
  </div>
</template>

<style scoped>
.dots {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 14px 0;
}
.dot {
  width: 12px;
  height: 12px;
  background: var(--border);
  transition:
    transform var(--motion-base) var(--ease-out),
    background var(--motion-base) var(--ease-out);
}
.dot--current {
  background: var(--accent);
  transform: scale(1.3);
}
.dot--done {
  background: var(--accent-bright);
}
</style>

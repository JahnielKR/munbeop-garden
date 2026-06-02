<script setup lang="ts">
interface Props {
  total: number
  progress: number
}
defineProps<Props>()
</script>

<template>
  <div class="dots">
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
  transition: all 0.3s cubic-bezier(0.3, 1.3, 0.5, 1);
}
.dot--current {
  background: var(--red);
  transform: scale(1.3);
  box-shadow: 0 0 0 4px rgba(194, 62, 62, 0.2);
}
.dot--done {
  background: var(--jade);
}
</style>

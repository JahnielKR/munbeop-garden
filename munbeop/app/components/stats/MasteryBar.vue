<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  label: string; seedling: number; plant: number; tree: number; total: number; pct: number
}>()
const w = (part: number) => (props.total ? Math.round((part / props.total) * 100) : 0)
const seg = computed(() => ({ s: w(props.seedling), p: w(props.plant), t: w(props.tree) }))
</script>

<template>
  <div class="row" data-test="mastery-row">
    <span class="label">{{ label }}</span>
    <div class="bar">
      <div class="bar__seg seg--seedling" data-test="bar-seg" :style="{ width: seg.s + '%' }" />
      <div class="bar__seg seg--plant" data-test="bar-seg" :style="{ width: seg.p + '%' }" />
      <div class="bar__seg seg--tree" data-test="bar-seg" :style="{ width: seg.t + '%' }" />
    </div>
    <span class="pct">{{ pct }}%</span>
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; gap: 10px; }
.label { width: 64px; font-family: var(--font-mono, monospace); font-size: 12px; color: var(--text); }
.bar { flex: 1; height: 14px; display: flex; overflow: hidden; border: 2px solid var(--border); background: var(--surface); }
.bar__seg { height: 100%; }
.seg--seedling { background: var(--heat-1); }
.seg--plant { background: var(--heat-2); }
.seg--tree { background: var(--heat-4); }
.pct { width: 78px; text-align: right; font-family: var(--font-mono, monospace); font-size: 12px; color: var(--text); }
</style>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  label: string; seedling: number; plant: number; tree: number; total: number; pct: number
}>()
// Cumulative rounding: three independent Math.round()s can sum to 101 and clip
// the tree tail under `overflow: hidden`. Rounding the running totals instead
// keeps the segments summing to the covered percentage (never > 100), while any
// unseen remainder (covered < total) stays as empty bar.
const seg = computed(() => {
  const total = props.total
  if (!total) return { s: 0, p: 0, t: 0 }
  const cum = (n: number) => Math.round((n / total) * 100)
  const s = cum(props.seedling)
  const sp = cum(props.seedling + props.plant)
  const spt = cum(props.seedling + props.plant + props.tree)
  return { s, p: sp - s, t: spt - sp }
})
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
.label { width: 64px; font-family: var(--font-mono, monospace); font-size: var(--text-sm); color: var(--text); }
.bar { flex: 1; height: 14px; display: flex; overflow: hidden; border: 2px solid var(--border); background: var(--surface); }
.bar__seg { height: 100%; }
.seg--seedling { background: var(--heat-1); }
.seg--plant { background: var(--heat-2); }
.seg--tree { background: var(--heat-4); }
.pct { width: 78px; text-align: right; font-family: var(--font-mono, monospace); font-size: var(--text-sm); color: var(--text); }
</style>

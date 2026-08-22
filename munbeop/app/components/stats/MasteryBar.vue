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
const learned = computed(() => props.plant + props.tree)
</script>

<template>
  <div class="row" data-test="mastery-row">
    <span class="label">{{ label }}</span>
    <div
      class="bar"
      role="progressbar"
      :aria-label="label"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="pct"
      :aria-valuetext="`${pct}% · ${learned}/${total}`"
    >
      <div class="bar__seg seg--seedling" data-test="bar-seg" :style="{ width: seg.s + '%' }" />
      <div class="bar__seg seg--plant" data-test="bar-seg" :style="{ width: seg.p + '%' }" />
      <div class="bar__seg seg--tree" data-test="bar-seg" :style="{ width: seg.t + '%' }" />
    </div>
    <span class="summary">
      <strong class="pct">{{ pct }}%</strong>
      <small class="count">{{ learned }}/{{ total }}</small>
    </span>
  </div>
</template>

<style scoped>
.row { display: grid; grid-template-columns: 76px minmax(0, 1fr) 96px; align-items: center; gap: var(--space-3); }
.label {
  color: var(--text);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  line-height: 1.6;
}
.bar {
  height: 18px;
  display: flex;
  overflow: hidden;
  border: 2px solid var(--border-strong);
  background: var(--surface-muted);
  box-shadow: inset 2px 2px 0 color-mix(in srgb, var(--shadow-color) 18%, transparent);
}
.bar__seg { height: 100%; }
.seg--seedling { background: var(--mastery-seedling); }
.seg--plant { background: var(--mastery-plant); }
.seg--tree { background: var(--mastery-tree); }
.summary { display: flex; align-items: baseline; justify-content: flex-end; gap: 6px; white-space: nowrap; }
.pct {
  color: var(--text);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}
.count {
  color: var(--text-soft);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 520px) {
  .row { grid-template-columns: 1fr auto; gap: var(--space-2); }
  .bar { grid-column: 1 / -1; grid-row: 2; }
}
</style>

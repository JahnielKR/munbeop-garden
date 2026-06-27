<script setup lang="ts">
import { NUMBER_DOMAINS } from '~/lib/numbers-market/sets'

defineEmits<{ select: [id: string] }>()
const { t } = useI18n()
</script>

<template>
  <div class="picker">
    <button
      v-for="d in NUMBER_DOMAINS"
      :key="d.id"
      type="button"
      class="picker__item"
      data-testid="domain-pick"
      @click="$emit('select', d.id)"
    >
      <span lang="ko">{{ d.ko }}</span>
      <span class="picker__label">{{ t(d.labelKey) }}</span>
    </button>
  </div>
</template>

<style scoped>
.picker { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.picker__item { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; color: var(--ink); }
.picker__item:hover { border-color: var(--ink); }
.picker__item:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.picker__label { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
</style>

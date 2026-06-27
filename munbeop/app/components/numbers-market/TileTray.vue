<script setup lang="ts">
interface Props {
  pool: string[]
  built: string[]
  phase: 'building' | 'right' | 'wrong' | 'done'
}
defineProps<Props>()
const emit = defineEmits<{
  place: [index: number]
  undo: [index: number]
  clear: []
  submit: []
}>()
const { t } = useI18n()
</script>

<template>
  <div class="tray">
    <div
      class="tray__built"
      :class="{ 'tray__built--right': phase === 'right', 'tray__built--wrong': phase === 'wrong' }"
      lang="ko"
    >
      <button
        v-for="(tile, i) in built"
        :key="`b-${i}-${tile}`"
        type="button"
        class="tile tile--built"
        data-testid="built-tile"
        :disabled="phase !== 'building'"
        :aria-label="t('numberMarket.undo')"
        @click="emit('undo', i)"
      >{{ tile }}</button>
      <span v-if="built.length === 0" class="tray__hint">{{ t('numberMarket.build_hint') }}</span>
    </div>

    <div class="tray__pool" lang="ko">
      <button
        v-for="(tile, i) in pool"
        :key="`p-${i}-${tile}`"
        type="button"
        class="tile"
        data-testid="pool-tile"
        :disabled="phase !== 'building'"
        @click="emit('place', i)"
      >{{ tile }}</button>
    </div>

    <div class="tray__actions">
      <button
        type="button"
        class="tray__btn"
        :disabled="phase !== 'building' || built.length === 0"
        @click="emit('clear')"
      >
        {{ t('numberMarket.clear') }}
      </button>
      <button
        type="button"
        class="tray__btn tray__btn--primary"
        data-testid="tile-submit"
        :disabled="phase !== 'building' || built.length === 0"
        @click="emit('submit')"
      >{{ t('numberMarket.submit') }}</button>
    </div>
  </div>
</template>

<style scoped>
.tray { display: flex; flex-direction: column; gap: 16px; }
.tray__built {
  min-height: 56px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  padding: 12px; background: var(--paper-deep, var(--surface)); border: 2px dashed var(--ink-line);
}
.tray__built--right { border-color: var(--accent-bright, #2e7d32); border-style: solid; }
.tray__built--wrong { border-color: var(--danger, #c62828); border-style: solid; }
.tray__hint { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.tray__pool { display: flex; flex-wrap: wrap; gap: 8px; }
.tile {
  font-family: 'Noto Sans KR', sans-serif; font-size: 18px; padding: 10px 14px;
  background: var(--paper, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer;
}
.tile:hover:not(:disabled) { border-color: var(--ink); transform: translate(-1px, -1px); }
.tile:disabled { opacity: 0.55; cursor: default; }
.tile--built { background: var(--paper-deep, var(--surface)); }
.tray__actions { display: flex; gap: 10px; }
.tray__btn { font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 16px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); color: var(--ink); cursor: pointer; }
.tray__btn--primary { background: var(--accent, #2e7d32); color: var(--paper, #fff); border-color: var(--accent, #2e7d32); }
.tray__btn:disabled { opacity: 0.5; cursor: default; }
.tile:focus-visible, .tray__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

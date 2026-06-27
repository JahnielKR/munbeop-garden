<script setup lang="ts">
interface Props {
  timeLeft: number
  score: number
  combo: number
  best: number
}
defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="hud">
    <span class="hud__time" :class="{ 'hud__time--low': timeLeft <= 10 }" role="timer">⏱ {{ timeLeft }}</span>
    <span class="hud__score">{{ t('numberMarket.score') }} {{ score }}</span>
    <span v-if="combo >= 2" class="hud__combo" role="status">🔥 {{ combo }}</span>
    <span class="hud__best">{{ t('numberMarket.speed.best') }} {{ best }}</span>
  </div>
</template>

<style scoped>
.hud { display: flex; align-items: center; gap: 14px; padding: 8px 12px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); font-family: 'Press Start 2P', monospace; font-size: 11px; color: var(--ink); }
.hud__time--low { color: var(--danger, #c62828); }
.hud__combo { color: var(--accent-bright, #2e7d32); }
.hud__best { margin-left: auto; color: var(--ink-soft); }
</style>

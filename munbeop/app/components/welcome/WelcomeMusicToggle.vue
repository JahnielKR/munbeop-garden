<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()
const { state, ready, toggle } = useWelcomeMusic()

const isOn = computed(() => state.value === 'on')
const label = computed(() =>
  isOn.value ? t('welcome.toggle.music_off') : t('welcome.toggle.music_on'),
)
</script>

<template>
  <button
    type="button"
    class="music-toggle"
    :class="{ 'music-toggle--dim': !ready && !isOn }"
    :aria-label="label"
    :aria-pressed="isOn"
    @click="toggle"
  >
    <span class="music-toggle__icon" aria-hidden="true">
      <span v-if="isOn">♪</span>
      <span v-else>♬</span>
    </span>
  </button>
</template>

<style scoped>
.music-toggle {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: var(--always-cream);
  border: 3px solid var(--gold);
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
}
.music-toggle:hover {
  background: var(--gold);
  color: var(--always-dark);
  transform: scale(1.05);
}
.music-toggle--dim { opacity: 0.55; }
.music-toggle:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}
</style>

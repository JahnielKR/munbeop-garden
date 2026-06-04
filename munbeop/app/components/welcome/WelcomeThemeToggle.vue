<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ theme: 'light' | 'dark'; disabled?: boolean }>()
const emit = defineEmits<{ toggle: [] }>()

const { t } = useI18n()
const isLight = computed(() => props.theme === 'light')
const label = computed(() =>
  isLight.value ? t('welcome.toggle.theme_to_dark') : t('welcome.toggle.theme_to_light'),
)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="label"
    :aria-pressed="!isLight"
    :disabled="props.disabled"
    @click="emit('toggle')"
  >
    <span class="theme-toggle__icon" aria-hidden="true">
      <span v-if="isLight">☀</span>
      <span v-else>☾</span>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: var(--always-cream);
  border: 3px solid var(--gold);
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
}
.theme-toggle:hover:not(:disabled) {
  background: var(--gold);
  color: var(--always-dark);
  transform: scale(1.05);
}
.theme-toggle:disabled { opacity: 0.4; cursor: not-allowed; }
.theme-toggle:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
}
</style>

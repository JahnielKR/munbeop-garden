<script setup lang="ts">
/**
 * ThemePicker — segmented 3-way control for the theme preference.
 * Light / Auto (follows the OS) / Dark. A native radiogroup so keyboard
 * and screen-reader users get standard semantics.
 */
import type { Theme } from '~/composables/useTheme'

const props = defineProps<{ modelValue: Theme }>()
const emit = defineEmits<{ 'update:modelValue': [Theme] }>()
const { t } = useI18n()

const OPTIONS: { value: Theme; labelKey: string }[] = [
  { value: 'light', labelKey: 'settings.appearance.theme.light' },
  { value: 'system', labelKey: 'settings.appearance.theme.auto' },
  { value: 'dark', labelKey: 'settings.appearance.theme.dark' },
]

function select(v: Theme) {
  if (v !== props.modelValue) emit('update:modelValue', v)
}
</script>

<template>
  <div class="theme-picker" role="radiogroup" :aria-label="t('settings.appearance.theme.label')">
    <button
      v-for="opt in OPTIONS"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="opt.value === modelValue"
      :tabindex="opt.value === modelValue ? 0 : -1"
      class="theme-picker__opt"
      :class="{ 'theme-picker__opt--active': opt.value === modelValue }"
      :data-value="opt.value"
      @click="select(opt.value)"
    >
      {{ t(opt.labelKey) }}
    </button>
  </div>
</template>

<style scoped>
.theme-picker {
  display: inline-flex;
  gap: 0;
  border: 2px solid var(--border);
  box-shadow: var(--shadow-button);
  width: fit-content;
}
.theme-picker__opt {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  color: var(--text-soft);
  background: var(--surface);
  border: none;
  border-right: 2px solid var(--border);
  padding: 10px 14px;
  cursor: pointer;
  transition: background-color var(--motion-quick) var(--ease-out);
}
.theme-picker__opt:last-child {
  border-right: none;
}
.theme-picker__opt:hover {
  color: var(--text);
}
.theme-picker__opt--active {
  background: var(--accent);
  color: var(--text-on-accent);
}
.theme-picker__opt:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
:lang(th) .theme-picker__opt,
:lang(vi) .theme-picker__opt,
:lang(ja) .theme-picker__opt {
  font-size: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .theme-picker__opt {
    transition: none;
  }
}
</style>

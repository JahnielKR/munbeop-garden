<!-- app/components/register-drill/ModeTabs.vue -->
<script setup lang="ts">
import type { RegisterMode } from '~/lib/domain'

interface Props { mode: RegisterMode }
defineProps<Props>()
defineEmits<{ select: [mode: RegisterMode] }>()

const TABS: { id: RegisterMode; key: string }[] = [
  { id: 'level', key: 'register.mode_level' },
  { id: 'honor', key: 'register.mode_honor' },
]
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="$t('register.title')">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      type="button"
      role="tab"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': mode === tab.id }"
      :aria-selected="mode === tab.id"
      :data-testid="`register-mode-${tab.id}`"
      @click="$emit('select', tab.id)"
    >
      {{ $t(tab.key) }}
    </button>
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: 6px; }
.tabs__tab {
  flex: 1; min-width: 0; padding: 10px 12px; background: var(--paper-deep); border: 2px solid var(--border);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em; color: var(--text-soft);
  cursor: pointer; transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.tabs__tab:hover { color: var(--text); }
.tabs__tab--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.tabs__tab:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

<script setup lang="ts">
import type { LocaleCode } from '~/lib/domain'
import { useLocaleStore } from '~/stores/locale'

const { locale, locales, setLocale, t } = useI18n()
const localeStore = useLocaleStore()

const options = computed(() => locales.value as Array<{ code: string; name: string }>)

// Persist locale changes alongside vue-i18n updates. We write through the
// localeStore so the next page load (handled in layouts/default.vue's
// onMounted) restores the same value.
function onChange(e: Event) {
  const code = (e.target as HTMLSelectElement).value as LocaleCode
  void setLocale(code)
  localeStore.set(code)
}
</script>

<template>
  <label class="loc">
    <span class="loc__label">{{ t('common.language') }}</span>
    <select class="loc__select" :value="locale" @change="onChange">
      <option v-for="o in options" :key="o.code" :value="o.code">{{ o.name }}</option>
    </select>
  </label>
</template>

<style scoped>
.loc {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.loc__label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  color: var(--ink-soft);
  text-transform: uppercase;
}
.loc__select {
  background: var(--paper);
  color: var(--ink);
  border: 2px solid var(--border);
  padding: 6px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}
.loc__select:focus {
  border-color: var(--jade);
}
</style>

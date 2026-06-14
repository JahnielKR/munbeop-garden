<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLocaleStore } from '~/stores/locale'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useSettingsStore } from '~/stores/settings'

// useI18n() must be called from inside the layout's setup() — never from
// a defineNuxtPlugin handler. The latter triggers a fatal 'SyntaxError: 26'
// during client init on Nuxt 4 + @nuxtjs/i18n v9 (see prior commit history).
const { setLocale, locale } = useI18n()
const localeStore = useLocaleStore()

// Hydrate all stores in parallel, then restore the user's saved locale.
// Stores are now async (Plan 2) so we await before reading localeStore.current.
onMounted(async () => {
  await Promise.all([
    useGrammarStore().hydrate(),
    useContextsStore().hydrate(),
    useSrsStore().hydrate(),
    useLogStore().hydrate(),
    localeStore.hydrate(),
  ])
  // Cloud preferences win: override the device theme/locale just loaded above.
  await useSettingsStore().hydrate()
  if (locale.value !== localeStore.current) {
    void setLocale(localeStore.current)
  }
})
</script>

<template>
  <AppShell>
    <slot />
  </AppShell>
</template>

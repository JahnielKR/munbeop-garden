<script setup lang="ts">
import AppShell from '~/components/layout/AppShell.vue'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

// Hydrate stores from storage once when the app boots.
onMounted(() => {
  useGrammarStore().hydrate()
  useContextsStore().hydrate()
  useSrsStore().hydrate()
  useLogStore().hydrate()
})
</script>

<template>
  <AppShell>
    <slot />
  </AppShell>
</template>

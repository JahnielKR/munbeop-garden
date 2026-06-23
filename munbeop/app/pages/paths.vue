<!-- app/pages/paths.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import PathCard from '~/components/paths/PathCard.vue'
import { usePaths } from '~/composables/usePaths'
import { useGrammarStore } from '~/stores/grammar'

definePageMeta({ surface: 'study' })

const { t } = useI18n()
const grammarStore = useGrammarStore()
const { paths } = usePaths()

onMounted(async () => {
  if (grammarStore.items.length === 0) {
    try {
      await grammarStore.hydrate()
    } catch (err) {
      console.error('paths: grammar hydration failed', err)
    }
  }
})
</script>

<template>
  <div class="page">
    <BilingualTitle ko="진도" :latin="t('paths.title')" />
    <p class="page__lead">{{ t('paths.lead') }}</p>
    <div class="page__list">
      <PathCard v-for="p in paths" :key="p.deckId" :name="p.name" :progress="p.progress" />
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.page__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.page__list { display: flex; flex-direction: column; gap: 16px; }
</style>

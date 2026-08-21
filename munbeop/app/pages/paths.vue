<!-- app/pages/paths.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import PathCard from '~/components/paths/PathCard.vue'
import { usePaths } from '~/composables/usePaths'
import { useGrammarStore } from '~/stores/grammar'

definePageMeta({ surface: 'study' })

const { t } = useI18n()
const grammarStore = useGrammarStore()
const { paths } = usePaths()
const loading = ref(grammarStore.items.length === 0 || grammarStore.decks.length === 0)
const loadFailed = ref(false)

async function loadPaths() {
  loading.value = true
  loadFailed.value = false
  try {
    await grammarStore.hydrate()
  } catch (err) {
    loadFailed.value = true
    console.error('paths: grammar hydration failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (loading.value) await loadPaths()
})
</script>

<template>
  <div class="page">
    <BilingualTitle ko="진도" :latin="t('paths.title')" />
    <p class="page__lead">{{ t('paths.lead') }}</p>
    <div v-if="loading" class="page__skeleton" role="status" aria-live="polite" data-test="paths-loading">
      <span class="page__sr">{{ t('paths.loading') }}</span>
      <div v-for="n in 3" :key="n" class="page__skeleton-row" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
    <div v-else-if="loadFailed" class="page__status" role="alert" data-test="paths-error">
      <p>{{ t('errors.data_failed') }}</p>
      <button type="button" data-test="paths-retry" @click="loadPaths">{{ t('errors.retry') }}</button>
    </div>
    <div v-else-if="paths.length" class="page__list">
      <PathCard v-for="p in paths" :key="p.deckId" :name="p.name" :progress="p.progress" />
    </div>
    <p v-else class="page__status" role="status" data-test="paths-empty">{{ t('paths.empty') }}</p>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; max-width: 680px; }
.page__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.page__list { display: flex; flex-direction: column; gap: 16px; }
.page__status { margin: 0; padding: 20px 0; color: var(--text-soft); font-family: var(--font-ui); }
.page__status p { margin: 0 0 12px; }
.page__status button {
  min-width: 44px;
  min-height: 44px;
  padding: 10px 16px;
  border: 2px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-button);
  cursor: pointer;
  font: inherit;
}
.page__status button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.page__skeleton { display: flex; flex-direction: column; gap: 16px; }
.page__skeleton-row {
  height: 104px;
  padding: 18px;
  border: 2px solid var(--border);
  background: var(--surface);
  animation: paths-pulse 1.4s ease-in-out infinite;
}
.page__skeleton-row span { display: block; height: 12px; width: 42%; background: var(--paper-deep); }
.page__skeleton-row span + span { width: 75%; margin-top: 18px; }
.page__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@keyframes paths-pulse { 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .page__skeleton-row { animation: none; } }
</style>

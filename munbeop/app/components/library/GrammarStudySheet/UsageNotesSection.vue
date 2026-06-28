<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Grammar, LocalizedString } from '~/lib/domain'
import { notesFor } from '~/lib/usage-notes'
import ComingSoonSection from './ComingSoonSection.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

// Notes are looked up by ko (like examples / pronunciation), NOT read off the
// Grammar object — the Supabase catalog doesn't carry them, so reading the
// object would always show "coming soon" for logged-in users. The lookup is
// async: notesFor loads the grammar's TOPIK-level seed chunk on demand, so the
// ~5 MB catalog never ships in the route chunk. `loaded` gates the ComingSoon
// fallback so it doesn't flash while the chunk is in flight.
const localized = ref<LocalizedString | undefined>(undefined)
const loaded = ref(false)
watch(
  () => [props.grammar.ko, props.grammar.deckId] as const,
  async ([ko, deckId]) => {
    loaded.value = false
    const result = await notesFor(ko, deckId)
    // Ignore a stale resolve if the grammar changed while the chunk loaded.
    if (props.grammar.ko !== ko) return
    localized.value = result
    loaded.value = true
  },
  { immediate: true },
)
const notes = computed(() => (localized.value ? tl(localized.value) : ''))
</script>

<template>
  <ComingSoonSection
    v-if="loaded && !localized"
    :title="t('library.modal.section.usage_notes')"
    :body="t('library.modal.coming_soon.usage_notes')"
  />
  <section v-else-if="localized" class="usage-notes-section">
    <h3 class="section-title">{{ t('library.modal.section.usage_notes') }}</h3>
    <p class="notes">{{ notes }}</p>
  </section>
</template>

<style scoped>
.section-title {
  margin: 16px 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.notes {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
  line-height: 1.55;
  white-space: pre-wrap;
}
</style>

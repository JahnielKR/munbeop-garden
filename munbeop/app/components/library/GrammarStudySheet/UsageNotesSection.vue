<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '~/lib/domain'
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
// object would always show "coming soon" for logged-in users.
const localized = computed(() => notesFor(props.grammar.ko))
const notes = computed(() => (localized.value ? tl(localized.value) : ''))
</script>

<template>
  <ComingSoonSection
    v-if="!localized"
    :title="t('library.modal.section.usage_notes')"
    :body="t('library.modal.coming_soon.usage_notes')"
  />
  <section v-else class="usage-notes-section">
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

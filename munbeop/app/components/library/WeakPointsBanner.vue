<script setup lang="ts">
/**
 * "Plants that need care" call-to-action for the Library. Shown only when the
 * learner has struggling grammar (leeches). Purely presentational: it reports
 * the count and emits intent — the page wires `view` to the mastery filter and
 * `rescue` to the guided rescue drill on the worst grammar.
 */
import Button from '~/components/ui/Button.vue'

defineProps<{ count: number }>()
defineEmits<{ view: []; rescue: [] }>()

const { t } = useI18n()
</script>

<template>
  <div class="weak" role="region" :aria-label="t('library.weak.label')">
    <p class="weak__text">{{ t('library.weak.summary', { n: count }) }}</p>
    <div class="weak__actions">
      <Button variant="secondary" size="sm" data-testid="weak-view" @click="$emit('view')">
        {{ t('library.weak.view') }}
      </Button>
      <Button size="sm" data-testid="weak-rescue" @click="$emit('rescue')">
        {{ t('library.weak.rescue') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.weak {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-left: 6px solid var(--red);
  padding: 12px 16px;
}
.weak__text {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}
.weak__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>

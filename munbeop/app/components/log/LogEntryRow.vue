<script setup lang="ts">
import { computed } from 'vue'
import { isPendingReview, type LogEntry } from '~/lib/domain'
import Badge from '~/components/ui/Badge.vue'
import Button from '~/components/ui/Button.vue'
import Icon from '~/components/ui/Icon.vue'

const props = defineProps<{ entry: LogEntry }>()
defineEmits<{ review: [number]; delete: [number] }>()
const { t } = useI18n()
const pending = computed(() => isPendingReview(props.entry))
</script>

<template>
  <li
    class="entry"
    :class="{ 'entry--pending': pending, 'entry--reviewed': entry.reviewState !== 'unreviewed' }"
  >
    <div class="entry__head">
      <span class="entry__ko">{{ entry.ko }}</span>
      <span class="entry__date">{{ new Date(entry.date).toLocaleString() }}</span>
    </div>
    <div class="entry__sentence">{{ entry.sentence }}</div>
    <p v-if="entry.errorNote" class="entry__note" data-test="entry-note">
      <span class="entry__note-label">{{ t('journal.note_label') }}:</span> {{ entry.errorNote }}
    </p>
    <div class="entry__foot">
      <span class="entry__meta">
        {{ entry.contextName }} ·
        {{ entry.feedback === 'easy' ? t('practice.fb_easy') : t('practice.fb_hard') }}
        <span v-if="entry.errorDimension" class="entry__dim">
          · {{ t(`dimension.${entry.errorDimension}`) }}
        </span>
      </span>
      <Button
        v-if="pending"
        variant="secondary"
        size="sm"
        class="review-btn"
        data-testid="mark-reviewed"
        data-test="mark-reviewed"
        @click="$emit('review', entry.id)"
      >
        {{ t('journal.mark_reviewed') }}
      </Button>
      <Badge
        v-else-if="entry.reviewState !== 'unreviewed'"
        variant="jade"
        class="reviewed-badge"
        data-testid="reviewed-badge"
        data-test="reviewed-badge"
      >
        <Icon name="check" :size="12" />
        <span>{{ t('journal.reviewed') }}</span>
      </Badge>
      <Button
        variant="secondary"
        size="sm"
        class="delete-btn"
        data-testid="delete-entry"
        :aria-label="t('journal.delete')"
        :title="t('journal.delete')"
        @click="$emit('delete', entry.id)"
      >
        <Icon name="close" :size="12" />
      </Button>
    </div>
  </li>
</template>

<style scoped>
.entry {
  position: relative;
  background: var(--surface);
  border: 2px solid var(--border);
  border-left: 6px solid var(--sky);
  box-shadow: var(--bevel), var(--shadow-card);
  padding: 14px 16px;
}
.entry--pending {
  border-left-color: var(--gold);
}
.entry--reviewed {
  border-left-color: var(--jade);
}
.entry__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.entry__ko {
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: 15px;
}
.entry__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-soft);
}
.entry__sentence {
  font-family: var(--font-ko);
  font-size: 15px;
}
.entry__note {
  margin: 6px 0 0;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-soft);
}
.entry__note-label {
  font-weight: 600;
  color: var(--ink);
}
.entry__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.entry__meta {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--text-soft);
}
.entry__dim {
  color: var(--ink);
}
.review-btn {
  --border-strong: var(--gold);
}
.reviewed-badge {
  flex-shrink: 0;
}
.delete-btn {
  margin-left: auto;
  color: var(--danger);
}
</style>

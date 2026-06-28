<script setup lang="ts">
import { computed } from 'vue'
import { isPendingReview, type LogEntry } from '~/lib/domain'

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
      <button
        v-if="pending"
        type="button"
        class="review-btn"
        data-testid="mark-reviewed"
        data-test="mark-reviewed"
        @click="$emit('review', entry.id)"
      >
        {{ t('journal.mark_reviewed') }}
      </button>
      <span
        v-else-if="entry.reviewState !== 'unreviewed'"
        class="reviewed-badge"
        data-testid="reviewed-badge"
        data-test="reviewed-badge"
      >
        ✓ {{ t('journal.reviewed') }}
      </span>
      <button
        type="button"
        class="delete-btn"
        data-testid="delete-entry"
        :aria-label="t('journal.delete')"
        :title="t('journal.delete')"
        @click="$emit('delete', entry.id)"
      >
        ✕
      </button>
    </div>
  </li>
</template>

<style scoped>
.entry { background: var(--paper-warm); border-left: 3px solid var(--sky); padding: 12px 16px; }
.entry--pending { border-left-color: var(--gold, #d4a017); }
.entry--reviewed { border-left-color: var(--jade, #3f9d6b); }
.entry__head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
.entry__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 15px; }
.entry__date { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-soft); }
.entry__sentence { font-family: 'Noto Sans KR', sans-serif; font-size: 15px; }
.entry__note { margin: 6px 0 0; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink-soft); }
.entry__note-label { font-weight: 600; color: var(--ink); }
.entry__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
.entry__meta { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.entry__dim { color: var(--ink); }
.review-btn { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: var(--ink); background: var(--paper); border: 1.5px solid var(--gold, #d4a017); border-radius: 999px; padding: 4px 12px; cursor: pointer; transition: background var(--motion-quick, 120ms) ease; }
.review-btn:hover { background: var(--paper-deep, var(--paper-warm)); }
.review-btn:focus-visible { outline: 2px solid var(--focus-ring, var(--sky)); outline-offset: 2px; }
.reviewed-badge { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: var(--jade, #3f9d6b); }
.delete-btn { margin-left: auto; background: none; border: none; cursor: pointer; color: var(--ink-soft); font-size: 14px; line-height: 1; padding: 4px; }
.delete-btn:hover { color: var(--danger, var(--red)); }
.delete-btn:focus-visible { outline: 2px solid var(--focus-ring, var(--sky)); outline-offset: 2px; }
</style>

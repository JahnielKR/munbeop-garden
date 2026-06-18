<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import { useLogStore } from '~/stores/log'
import { useToast } from '~/composables/useToast'
import { isPendingReview } from '~/lib/domain'

const logStore = useLogStore()
const { t } = useI18n()
const toast = useToast()

// Close the loop the garden promises: the rain weather points the user here to
// "clear the sky", so each still-pending entry gets a control to mark it
// reviewed. That flips reviewState out of 'unreviewed', which drops it from the
// garden's pendingReviews count (shared predicate: isPendingReview).
async function markReviewed(id: number) {
  await logStore.setReviewState(id, 'correct')
  toast.success(t('journal.reviewed'))
}
</script>

<template>
  <div class="page">
    <BilingualTitle ko="일기" :latin="t('title.log')" />
    <div v-if="logStore.entries.length === 0" class="empty">{{ t('empty.log') }}</div>
    <ul v-else class="list">
      <li
        v-for="e in logStore.entries.slice(0, 20)"
        :key="e.id"
        class="entry"
        :class="{
          'entry--pending': isPendingReview(e),
          'entry--reviewed': e.reviewState !== 'unreviewed',
        }"
      >
        <div class="entry__head">
          <span class="entry__ko">{{ e.ko }}</span>
          <span class="entry__date">{{ new Date(e.date).toLocaleString() }}</span>
        </div>
        <div class="entry__sentence">{{ e.sentence }}</div>
        <p v-if="e.errorNote" class="entry__note" data-test="entry-note">
          <span class="entry__note-label">{{ t('journal.note_label') }}:</span> {{ e.errorNote }}
        </p>
        <div class="entry__foot">
          <span class="entry__meta">
            {{ e.contextName }} ·
            {{ e.feedback === 'easy' ? t('practice.fb_easy') : t('practice.fb_hard') }}
          </span>
          <button
            v-if="isPendingReview(e)"
            type="button"
            class="review-btn"
            data-test="mark-reviewed"
            @click="markReviewed(e.id)"
          >
            {{ t('journal.mark_reviewed') }}
          </button>
          <span
            v-else-if="e.reviewState !== 'unreviewed'"
            class="reviewed-badge"
            data-test="reviewed-badge"
          >
            ✓ {{ t('journal.reviewed') }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
}
.entry {
  background: var(--paper-warm);
  border-left: 3px solid var(--sky);
  padding: 12px 16px;
}
/* A still-pending entry is what the garden's rain is pointing at — flag it. */
.entry--pending {
  border-left-color: var(--gold, #d4a017);
}
.entry--reviewed {
  border-left-color: var(--jade, #3f9d6b);
}
.entry__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.entry__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
}
.entry__date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink-soft);
}
.entry__sentence {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
}
.entry__note {
  margin: 6px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
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
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
}
.review-btn {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--gold, #d4a017);
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background var(--motion-quick, 120ms) ease;
}
.review-btn:hover {
  background: var(--paper-deep, var(--paper-warm));
}
.review-btn:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
.reviewed-badge {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--jade, #3f9d6b);
}
</style>

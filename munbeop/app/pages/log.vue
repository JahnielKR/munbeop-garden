<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import MistakeFeed from '~/components/log/MistakeFeed.vue'
import LogEntryRow from '~/components/log/LogEntryRow.vue'
import { useLogStore } from '~/stores/log'
import { useToast } from '~/composables/useToast'

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
    <template v-else>
      <MistakeFeed :entries="logStore.entries" @review="markReviewed" />
      <ul class="list">
        <LogEntryRow
          v-for="e in logStore.entries.slice(0, 20)"
          :key="e.id"
          :entry="e"
          @review="markReviewed"
        />
      </ul>
    </template>
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
</style>

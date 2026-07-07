<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import MistakeFeed from '~/components/log/MistakeFeed.vue'
import LogEntryRow from '~/components/log/LogEntryRow.vue'
import { useLogStore } from '~/stores/log'
import { useToast } from '~/composables/useToast'

const logStore = useLogStore()
const { t } = useI18n()
const toast = useToast()

// The journal used to show only the 20 newest entries with no way to reach the
// rest. Now it's browsable: filter by text, page through with "load more", and
// delete an entry. All client-side over the in-memory log (the store already
// holds every entry); delete is the one cloud write.
const PAGE = 20
const search = ref('')
const visibleCount = ref(PAGE)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return logStore.entries
  return logStore.entries.filter(
    (e) =>
      e.ko.toLowerCase().includes(q) ||
      e.sentence.toLowerCase().includes(q) ||
      (e.errorNote ?? '').toLowerCase().includes(q) ||
      e.contextName.toLowerCase().includes(q),
  )
})
const visible = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => filtered.value.length > visibleCount.value)

// A new query starts paging from the top.
watch(search, () => {
  visibleCount.value = PAGE
})
function loadMore() {
  visibleCount.value += PAGE
}

// Close the loop the garden promises: the rain weather points the user here to
// "clear the sky", so each still-pending entry gets a control to mark it
// reviewed. That flips reviewState out of 'unreviewed', which drops it from the
// garden's pendingReviews count (shared predicate: isPendingReview).
async function markReviewed(id: number) {
  const ok = await logStore.setReviewState(id, 'correct')
  if (ok) toast.success(t('journal.reviewed'))
  else toast.error(t('errors.save_failed'))
}

const pendingDelete = ref<number | null>(null)
function askDelete(id: number) {
  pendingDelete.value = id
}
function cancelDelete() {
  pendingDelete.value = null
}
async function confirmDelete() {
  const id = pendingDelete.value
  if (id === null) return
  pendingDelete.value = null
  const ok = await logStore.deleteEntry(id)
  if (ok) toast.success(t('journal.deleted'))
  else toast.error(t('errors.save_failed'))
}
</script>

<template>
  <div class="page">
    <BilingualTitle ko="일기" :latin="t('title.log')" />
    <div v-if="logStore.entries.length === 0" class="empty">{{ t('empty.log') }}</div>
    <template v-else>
      <!-- Mistakes summary stays for browsing; hidden while searching so the
           query owns the view. -->
      <MistakeFeed v-if="!search.trim()" :entries="logStore.entries" @review="markReviewed" />

      <input
        v-model="search"
        type="search"
        class="search"
        :placeholder="t('journal.search_placeholder')"
        :aria-label="t('journal.search_placeholder')"
        data-testid="journal-search"
      >

      <p v-if="filtered.length === 0" class="empty">{{ t('journal.no_results') }}</p>
      <template v-else>
        <ul class="list">
          <LogEntryRow
            v-for="e in visible"
            :key="e.id"
            :entry="e"
            @review="markReviewed"
            @delete="askDelete"
          />
        </ul>
        <button v-if="hasMore" type="button" class="load-more" data-testid="load-more" @click="loadMore">
          {{ t('journal.load_more') }}
        </button>
      </template>
    </template>

    <Modal
      :open="pendingDelete !== null"
      :title="t('journal.delete_confirm_title')"
      :close-label="t('journal.cancel')"
      @close="cancelDelete"
    >
      <h2 class="del__title">{{ t('journal.delete_confirm_title') }}</h2>
      <p class="del__body">{{ t('journal.delete_confirm_body') }}</p>
      <div class="del__actions">
        <Button variant="secondary" size="sm" @click="cancelDelete">{{ t('journal.cancel') }}</Button>
        <Button variant="danger" size="sm" @click="confirmDelete">{{ t('journal.delete') }}</Button>
      </div>
    </Modal>
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
.search {
  width: 100%;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  padding: 10px 12px;
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-size: var(--text-md);
  line-height: 1.5;
}
.search:focus-visible {
  border-color: var(--border-strong);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
}
.load-more {
  align-self: center;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  background: var(--paper);
  border: 2px solid var(--border-strong, var(--border));
  border-radius: 999px;
  padding: 8px 20px;
  cursor: pointer;
}
.load-more:hover {
  background: var(--paper-deep, var(--paper-warm));
}
.load-more:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.del__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 13px;
  margin: 0 0 12px;
  color: var(--ink);
}
.del__body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  margin: 0 0 20px;
  color: var(--ink);
}
.del__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

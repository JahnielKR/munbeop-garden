<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
import type { LogEntry } from '~/lib/domain'
import { groupPendingByKo } from '~/lib/log/group'
import LogEntryRow from './LogEntryRow.vue'

const props = defineProps<{ entries: LogEntry[] }>()
defineEmits<{ review: [number] }>()
const { t } = useI18n()
const groups = computed(() => groupPendingByKo(props.entries))
</script>

<template>
  <section v-if="groups.length" class="feed" data-testid="mistake-feed">
    <h2 class="feed__title">{{ t('journal.revisit_title') }}</h2>
    <div v-for="g in groups" :key="g.ko" class="feed__group">
      <div class="feed__group-head">
        <span class="feed__ko">{{ g.ko }}</span>
        <span class="feed__count">{{ t('journal.revisit_count', { n: g.entries.length }) }}</span>
        <NuxtLink class="feed__practice" :to="`/practice/ruleta?focus=${g.ko}`">
          {{ t('journal.revisit_practice') }}
        </NuxtLink>
      </div>
      <ul class="feed__list">
        <LogEntryRow v-for="e in g.entries" :key="e.id" :entry="e" @review="$emit('review', $event)" />
      </ul>
    </div>
  </section>
</template>

<style scoped>
.feed { display: flex; flex-direction: column; gap: 14px; }
.feed__title { margin: 0; font-family: 'Press Start 2P', 'Noto Sans KR', monospace; font-size: 13px; color: var(--text); }
.feed__group { display: flex; flex-direction: column; gap: 8px; }
.feed__group-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.feed__ko { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; font-size: 16px; color: var(--ink); }
.feed__count { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.feed__practice { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--link); text-decoration: underline; }
.feed__practice:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.feed__list { list-style: none; display: flex; flex-direction: column; gap: 8px; padding: 0; margin: 0; }
</style>

<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const srs = useSrsStore()
const log = useLogStore()

const state = computed(() => srs.peek(props.grammar.ko))
const info = computed(() => getMasteryInfo(state.value.mastery))

const lastSeenLabel = computed(() => {
  const ts = state.value.lastSeen
  if (!ts) return t('library.modal.srs.last_seen_never')
  return new Date(ts).toLocaleDateString()
})

const timesPracticed = computed(() =>
  log.entries.filter((e) => e.ko === props.grammar.ko).length,
)
</script>

<template>
  <section class="srs-section">
    <h3 class="section-title">{{ t('library.modal.section.your_progress') }}</h3>
    <div class="row">
      <span class="row__label">{{ t('library.modal.srs.mastery_label') }}</span>
      <span class="row__value">
        <MasteryIcon :level="state.mastery" :size="12" />
        {{ t(info.labelKey) }}
      </span>
    </div>
    <div class="row">
      <span class="row__label">{{ t('library.modal.srs.last_seen') }}</span>
      <span class="row__value">{{ lastSeenLabel }}</span>
    </div>
    <div class="row">
      <span class="row__label">{{ t('library.modal.srs.times_practiced') }}</span>
      <span class="row__value">{{ timesPracticed }}</span>
    </div>
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
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--ink-line);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
}
.row:last-child {
  border-bottom: none;
}
.row__label {
  color: var(--ink-soft);
}
.row__value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ink);
  font-weight: 600;
}
</style>

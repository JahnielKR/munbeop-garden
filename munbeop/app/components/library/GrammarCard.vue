<script setup lang="ts">
/**
 * One grammar card for the Library — ko + localized meaning + optional
 * example/trans + mastery badge. Extracted from pages/library.vue (was
 * duplicated in the deck sections and the orphan section). Reused by both
 * the grouped deck view and the flat search-results list. Reads its own
 * mastery from the SRS store so the page stays thin. Emits `click`.
 */
import Badge from '~/components/ui/Badge.vue'
import Card from '~/components/ui/Card.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import { getMasteryInfo } from '~/lib/srs'
import type { Grammar } from '~/lib/domain'
import { useSrsStore } from '~/stores/srs'

const props = defineProps<{ grammar: Grammar }>()
defineEmits<{ click: [] }>()

const { tl } = useLocalized()
const { t } = useI18n()
const srsStore = useSrsStore()

const level = computed(() => srsStore.ensure(props.grammar.ko).mastery)
const info = computed(() => getMasteryInfo(level.value))
const accent = computed<'jade' | 'gold' | 'sky'>(() => {
  if (info.value.cls === 'mastery-tree') return 'jade'
  if (info.value.cls === 'mastery-plant') return 'gold'
  return 'sky'
})
</script>

<template>
  <Card :accent="accent" clickable @click="$emit('click')">
    <div class="item__head">
      <span class="item__ko">{{ grammar.ko }}</span>
      <Badge>
        <MasteryIcon :level="level" :size="10" />
        <span>{{ t(info.labelKey) }}</span>
      </Badge>
    </div>
    <div class="item__meaning">{{ tl(grammar.meaning) }}</div>
    <div v-if="grammar.example" class="item__example">{{ grammar.example }}</div>
    <div v-if="grammar.trans" class="item__trans">{{ tl(grammar.trans) }}</div>
  </Card>
</template>

<style scoped>
.item__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}
.item__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
}
.item__meaning {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  font-size: 14px;
}
.item__example {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
  margin-top: 8px;
}
.item__trans {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 2px;
}
</style>

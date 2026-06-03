<script setup lang="ts">
import PixelCard from '~/components/ui/PixelCard.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import { getMasteryInfo } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'

const grammarStore = useGrammarStore()
const srsStore = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()

const items = computed(() =>
  grammarStore.items.map((g) => {
    const level = srsStore.ensure(g.ko).mastery
    return {
      grammar: g,
      level,
      info: getMasteryInfo(level),
    }
  }),
)
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">도서관</span>
      <span class="title__es">{{ t('title.library') }}</span>
    </h1>
    <p class="lead">{{ t('library.lead') }}</p>

    <div class="grid">
      <PixelCard
        v-for="item in items"
        :key="item.grammar.ko"
        :accent="
          item.info.cls === 'mastery-tree'
            ? 'jade'
            : item.info.cls === 'mastery-plant'
              ? 'gold'
              : 'indigo'
        "
      >
        <div class="item__head">
          <span class="item__ko">{{ item.grammar.ko }}</span>
          <span class="item__badge">
            <MasteryIcon :level="item.level" :size="10" />
            <span>{{ t(item.info.labelKey) }}</span>
          </span>
        </div>
        <div class="item__meaning">{{ tl(item.grammar.meaning) }}</div>
        <div v-if="item.grammar.example" class="item__example">{{ item.grammar.example }}</div>
        <div v-if="item.grammar.trans" class="item__trans">{{ tl(item.grammar.trans) }}</div>
      </PixelCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.title__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 32px;
  color: var(--jade);
}
.title__es {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--ink);
}
.lead {
  font-family: 'Inter', sans-serif;
  color: var(--muted);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
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
.item__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--muted);
}
.item__meaning {
  font-family: 'Inter', sans-serif;
  color: var(--muted);
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
  color: var(--muted);
  margin-top: 2px;
}
</style>

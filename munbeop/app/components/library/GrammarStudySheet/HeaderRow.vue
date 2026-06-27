<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import Badge from '~/components/ui/Badge.vue'
import MasteryIcon from '~/components/practice/MasteryIcon.vue'
import SpineBreadcrumb from './SpineBreadcrumb.vue'

interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const srs = useSrsStore()
const level = computed(() => srs.peek(props.grammar.ko).mastery)
const info = computed(() => getMasteryInfo(level.value))
</script>

<template>
  <header class="header">
    <SpineBreadcrumb :ko="grammar.ko" />
    <div class="header__main">
      <h2 class="header__ko">{{ grammar.ko }}</h2>
      <Badge>
        <MasteryIcon :level="level" :size="10" />
        <span>{{ t(info.labelKey) }}</span>
      </Badge>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 3px solid var(--ink-line);
  background: var(--paper-deep, var(--paper));
  z-index: 1;
}
.header__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.header__ko {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: var(--ink);
}
</style>

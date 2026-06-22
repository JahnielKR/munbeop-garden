<script setup lang="ts">
import { NuxtLink } from '#components'
import type { Leech } from '~/lib/srs'

interface Props {
  leeches: Leech[]
}
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const careLink = (ko: string) => `/practice/rescue?ko=${encodeURIComponent(ko)}`
</script>

<template>
  <section v-if="leeches.length" class="block" data-testid="struggling-plants">
    <h2 class="block__title">{{ t('stats.struggling.title') }}</h2>
    <p class="block__sub">{{ t('stats.struggling.sub') }}</p>
    <div class="care">
      <div v-for="l in leeches" :key="l.ko" class="care__row" data-test="struggling-row">
        <div class="care__grammar">
          <span class="care__ko" lang="ko">{{ l.ko }}</span>
          <span v-if="l.meaning" class="care__meaning">· {{ tl(l.meaning) }}</span>
        </div>
        <div class="care__right">
          <span v-if="l.dominantDimension" class="care__chip" lang="ko">
            {{ t(`dimension.${l.dominantDimension}`) }}
          </span>
          <NuxtLink class="care__cta" data-test="struggling-care" :to="careLink(l.ko)">
            {{ t('stats.struggling.care') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.block__title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}
.block__sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin: 0 0 8px;
}
.care {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.care__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 8px;
  padding: 9px 12px;
}
.care__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
}
.care__meaning {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  margin-left: 4px;
}
.care__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.care__chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: var(--ink-soft);
  border: 1px solid var(--ink-line, var(--border));
  border-radius: 6px;
  padding: 2px 7px;
}
.care__cta {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  background: var(--paper);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 999px;
  padding: 4px 12px;
}
.care__cta:hover {
  background: var(--paper-deep);
}
.care__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>

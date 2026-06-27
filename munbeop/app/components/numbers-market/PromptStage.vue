<script setup lang="ts">
import type { MarketItem, LocaleCode } from '~/lib/domain'
import { localized } from '~/lib/domain'

interface Props {
  item: MarketItem
  reveal?: boolean
}
defineProps<Props>()
const { t, locale } = useI18n()

const ICON: Record<string, string> = {
  counting: '🍎', 'sino-basics': '🔢', time: '🕒', money: '💰', dates: '📅', phone: '📞',
}
</script>

<template>
  <div class="stage" :data-domain="item.domain">
    <span class="stage__icon" aria-hidden="true">{{ ICON[item.domain] }}</span>
    <span class="stage__display" lang="ko">{{ item.display }}</span>
    <span class="stage__gloss">{{ localized(item.trans, locale as LocaleCode) }}</span>
    <p v-if="reveal" class="stage__answer" role="status" lang="ko">{{ item.answer }}</p>
    <p v-if="reveal" class="stage__hint">{{ t('numberMarket.build_hint') }}</p>
  </div>
</template>

<style scoped>
.stage { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; background: var(--paper-deep, var(--surface)); border: 2px solid var(--ink-line); }
.stage__icon { font-size: 32px; }
.stage__display { font-family: 'Noto Sans KR', sans-serif; font-size: 40px; color: var(--ink); letter-spacing: 1px; }
.stage__gloss { font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink-soft); }
.stage__answer { margin: 8px 0 0; font-family: 'Noto Sans KR', sans-serif; font-size: 22px; color: var(--accent-bright, #2e7d32); }
.stage__hint { margin: 0; font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
</style>

<script setup lang="ts">
import LocaleSwitcher from './LocaleSwitcher.vue'

interface NavItem {
  to: string
  labelKey: string
  emoji: string
  ko: string
}

const items: NavItem[] = [
  { to: '/', labelKey: 'nav.garden', emoji: '🏡', ko: '내 정원' },
  { to: '/practice', labelKey: 'nav.practice', emoji: '🎲', ko: '연습' },
  { to: '/library', labelKey: 'nav.library', emoji: '📚', ko: '도서관' },
  { to: '/stats', labelKey: 'nav.stats', emoji: '📊', ko: '통계' },
  { to: '/log', labelKey: 'nav.log', emoji: '📖', ko: '일기' },
  { to: '/settings', labelKey: 'nav.settings', emoji: '🤖', ko: '설정' },
]
const { t } = useI18n()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <span class="sidebar__brand-ko">문법</span>
      <span class="sidebar__brand-name">Garden</span>
    </div>
    <nav class="sidebar__nav">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        active-class="sidebar__link--active"
      >
        <span class="sidebar__emoji">{{ item.emoji }}</span>
        <span class="sidebar__label">{{ t(item.labelKey) }}</span>
        <span class="sidebar__ko">{{ item.ko }}</span>
      </NuxtLink>
    </nav>
    <div class="sidebar__footer">
      <LocaleSwitcher />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 220px;
  background: var(--paper-warm);
  border-right: 2px solid var(--border);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sidebar__brand {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.sidebar__brand-ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 26px;
  color: var(--jade);
}
.sidebar__brand-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--ink);
}
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar__link {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--muted);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
}
.sidebar__link:hover {
  background: var(--paper-deep);
  color: var(--ink);
}
.sidebar__link--active {
  background: var(--paper-deep);
  color: var(--ink);
  border-left-color: var(--jade);
}
.sidebar__label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
}
.sidebar__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: var(--muted);
}
.sidebar__emoji {
  font-size: 18px;
  line-height: 1;
}
.sidebar__footer {
  margin-top: auto;
}
</style>

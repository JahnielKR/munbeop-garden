<script setup lang="ts">
import AccountWidget from './AccountWidget.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'
import Icon, { type IconName } from '~/components/ui/Icon.vue'

interface NavItem {
  to: string
  labelKey: string
  icon: IconName
  ko: string
}

const items: NavItem[] = [
  { to: '/', labelKey: 'nav.garden', icon: 'home', ko: '내 정원' },
  { to: '/practice', labelKey: 'nav.practice', icon: 'practice', ko: '연습' },
  { to: '/library', labelKey: 'nav.library', icon: 'library', ko: '도서관' },
  { to: '/stats', labelKey: 'nav.stats', icon: 'stats', ko: '통계' },
  { to: '/log', labelKey: 'nav.log', icon: 'log', ko: '일기' },
  { to: '/settings', labelKey: 'nav.settings', icon: 'settings', ko: '설정' },
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
        <Icon :name="item.icon" :size="18" />
        <span class="sidebar__label">{{ t(item.labelKey) }}</span>
        <span class="sidebar__ko">{{ item.ko }}</span>
      </NuxtLink>
    </nav>
    <div class="sidebar__footer">
      <AccountWidget />
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
  color: var(--accent);
}
.sidebar__brand-name {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  color: var(--text);
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
  color: var(--text-soft);
  text-decoration: none;
  border-left: 3px solid transparent;
  outline: none;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.sidebar__link:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.sidebar__link:focus-visible {
  background: var(--surface-hover);
  color: var(--text);
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
.sidebar__link--active {
  background: var(--surface-hover);
  color: var(--text);
  border-left-color: var(--accent);
}
.sidebar__label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
}
.sidebar__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: var(--ink-soft);
}
.sidebar__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

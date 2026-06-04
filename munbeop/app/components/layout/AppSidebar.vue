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
  /* Pixel-art per user feedback. CJK falls through Noto Sans KR
   * for ja locale labels; Thai / Vietnamese drop into system-ui.
   * The KO half (.sidebar__ko below) stays Noto Sans KR because
   * Korean is the content language and needs smooth Hangul.
   * 10 px sized so the longest EN nav label fits the 220 px sidebar.
   * white-space:nowrap prevents the grid's 1fr column from rounding
   * the cell to a sub-pixel boundary that forces "My Garden" onto
   * two lines (the grid was allocating 82.17 px to a span whose
   * actual width was 82.17, so any rounding broke it). */
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.03em;
  line-height: 1.4;
  white-space: nowrap;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
/* Thai / Vietnamese tone marks + stacked diacritics, and Japanese
 * kanji strokes, all lose detail at 10 px. Bump one step so the
 * glyphs stay legible. (Korean is content-not-chrome, never shows
 * here — the .sidebar__ko subtitle is a separate selector below.) */
:lang(th) .sidebar__label,
:lang(vi) .sidebar__label,
:lang(ja) .sidebar__label {
  font-size: 13px;
}
.sidebar__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: var(--text-soft);
  white-space: nowrap;
}
.sidebar__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

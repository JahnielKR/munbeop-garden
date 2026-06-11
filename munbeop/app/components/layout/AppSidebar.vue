<script setup lang="ts">
import AccountWidget from './AccountWidget.vue'
import LocaleSwitcher from './LocaleSwitcher.vue'
import Icon, { type IconName } from '~/components/ui/Icon.vue'

interface NavItem {
  to: string
  labelKey: string
  icon: IconName
}

// Korean subtitles used to ride alongside each label (내 정원, 연습,
// 도서관…). They were dropped per user feedback because longer i18n
// labels (FR "Herboristerie", ID "Perpustakaan") plus the Hangul
// subtitle blew past the 220 px sidebar width and wrapped or got
// truncated. The brand mark 문법 stays — that's the product name,
// not a translation crutch.
const items: NavItem[] = [
  { to: '/', labelKey: 'nav.garden', icon: 'home' },
  { to: '/practice', labelKey: 'nav.practice', icon: 'practice' },
  { to: '/library', labelKey: 'nav.library', icon: 'library' },
  { to: '/stats', labelKey: 'nav.stats', icon: 'stats' },
  { to: '/log', labelKey: 'nav.log', icon: 'log' },
  { to: '/settings', labelKey: 'nav.settings', icon: 'settings' },
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
/* Brand gold + ink pixel outline (classic Zelda trick for legible yellow
 * on any surface). Outline uses --always-dark, not --ink, on purpose —
 * in dark mode --ink is light and would ruin the contour. */
.sidebar__brand-ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 26px;
  color: var(--gold);
  text-shadow:
    2px 0 0 var(--always-dark),
    -2px 0 0 var(--always-dark),
    0 2px 0 var(--always-dark),
    0 -2px 0 var(--always-dark),
    2px 2px 0 var(--always-dark);
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
  grid-template-columns: 24px 1fr;
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
  /* Pixel font for the chrome; CJK falls through Noto Sans KR for ja
   * locale labels; Thai / Vietnamese drop into system-ui. 10 px
   * fits the longest EN label inside the 220 px sidebar. */
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
 * glyphs stay legible. */
:lang(th) .sidebar__label,
:lang(vi) .sidebar__label,
:lang(ja) .sidebar__label {
  font-size: 13px;
}
.sidebar__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

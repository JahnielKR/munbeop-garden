<script setup lang="ts">
import Icon, { type IconName } from '~/components/ui/Icon.vue'

interface MobileNavItem {
  to: string
  icon: IconName
  labelKey: string
}

const items: MobileNavItem[] = [
  { to: '/', icon: 'home', labelKey: 'nav.garden' },
  { to: '/practice', icon: 'practice', labelKey: 'nav.practice' },
  { to: '/library', icon: 'library', labelKey: 'nav.library' },
  { to: '/stats', icon: 'stats', labelKey: 'nav.stats' },
  { to: '/log', icon: 'log', labelKey: 'nav.log' },
  { to: '/settings', icon: 'settings', labelKey: 'nav.settings' },
]

const { t } = useI18n()
</script>

<template>
  <nav class="mobile-nav">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :aria-label="t(item.labelKey)"
      class="mobile-nav__link"
      active-class="mobile-nav__link--active"
    >
      <Icon :name="item.icon" :size="20" />
      <span class="mobile-nav__label">{{ t(item.labelKey) }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--paper-warm);
  border-top: 2px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.mobile-nav__link {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  height: 100%;
  min-width: 0;
  text-decoration: none;
  color: var(--text-soft);
  border-top: 3px solid transparent;
  outline: none;
  padding: 6px 4px;
}
.mobile-nav__link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
.mobile-nav__link--active {
  color: var(--accent);
  border-top-color: var(--accent);
  background: var(--surface-hover);
}
.mobile-nav__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 7px;
  letter-spacing: 0.04em;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
</style>

<script setup lang="ts">
import Icon, { type IconName } from '~/components/ui/Icon.vue'

interface MobileNavItem {
  to: string
  icon: IconName
}

const items: MobileNavItem[] = [
  { to: '/', icon: 'home' },
  { to: '/practice', icon: 'practice' },
  { to: '/library', icon: 'library' },
  { to: '/stats', icon: 'stats' },
  { to: '/settings', icon: 'settings' },
]
</script>

<template>
  <nav class="mobile-nav">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="mobile-nav__link"
      active-class="mobile-nav__link--active"
    >
      <Icon :name="item.icon" :size="22" />
    </NuxtLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--paper-warm);
  border-top: 2px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
}
.mobile-nav__link {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-decoration: none;
  color: var(--text-soft);
  border-top: 3px solid transparent;
  outline: none;
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
</style>

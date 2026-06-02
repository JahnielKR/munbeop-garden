<script setup lang="ts">
const items = [
  { to: '/', emoji: '🏡' },
  { to: '/practice', emoji: '🎲' },
  { to: '/library', emoji: '📚' },
  { to: '/stats', emoji: '📊' },
  { to: '/settings', emoji: '🤖' },
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
      <span class="mobile-nav__emoji">{{ item.emoji }}</span>
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
  color: var(--muted);
  border-top: 3px solid transparent;
}
.mobile-nav__link--active {
  color: var(--jade);
  border-top-color: var(--jade);
  background: var(--paper-deep);
}
.mobile-nav__emoji {
  font-size: 22px;
}
</style>

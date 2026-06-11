<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import AppSidebar from './AppSidebar.vue'
import MobileNavbar from './MobileNavbar.vue'
import Toast from '~/components/ui/Toast.vue'

const route = useRoute()
const surface = computed<'study' | 'game'>(
  () => (route.meta.surface as 'study' | 'game' | undefined) ?? 'study',
)
provide('surface', surface)

/**
 * Collapsible sidebar (garden spec §5.5): the 220px rail squeezes to 0
 * with a grid-column transition; the chevron handle stays visible on the
 * boundary. UI preference only — persisted in localStorage, never through
 * the storage adapter. Mobile keeps MobileNavbar (rail hidden anyway).
 */
const COLLAPSED_KEY = 'ui.sidebarCollapsed'

const collapsed = ref(false)

onMounted(() => {
  collapsed.value = window.localStorage.getItem(COLLAPSED_KEY) === '1'
})

watch(collapsed, (v) => {
  if (import.meta.client) window.localStorage.setItem(COLLAPSED_KEY, v ? '1' : '0')
})

const { t } = useI18n()
</script>

<template>
  <div class="shell" :class="{ 'shell--collapsed': collapsed }">
    <div class="shell__rail">
      <AppSidebar class="shell__sidebar" />
    </div>
    <main class="shell__main">
      <slot />
    </main>

    <button
      type="button"
      class="shell__collapse font-pixel"
      :aria-expanded="!collapsed"
      :aria-label="collapsed ? t('nav.sidebar_expand') : t('nav.sidebar_collapse')"
      @click="collapsed = !collapsed"
    >
      <span aria-hidden="true">{{ collapsed ? '▸' : '◂' }}</span>
    </button>

    <MobileNavbar class="shell__mobile-nav" />
    <Toast />
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  transition: grid-template-columns 240ms ease;
}
.shell--collapsed {
  grid-template-columns: 0px 1fr;
}
.shell__rail {
  overflow: hidden;
  min-width: 0;
}
.shell__sidebar {
  /* constant inner width so content clips instead of squishing mid-transition */
  width: 220px;
  min-height: 100%;
}
.shell__main {
  padding: 32px 32px 80px;
  max-width: 1200px;
  width: 100%;
}

.shell__collapse {
  position: fixed;
  top: 50%;
  left: 220px;
  transform: translate(-50%, -50%);
  z-index: 40;
  width: 22px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--paper-deep);
  color: var(--ink);
  border: 2px solid var(--ink-line);
  box-shadow: 2px 2px 0 var(--shadow-cream);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  cursor: pointer;
  transition: left 240ms ease;
}
.shell--collapsed .shell__collapse {
  left: 12px;
  transform: translateY(-50%);
}
.shell__collapse:hover {
  background: var(--hover-bg);
}
.shell__collapse:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.shell__mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .shell {
    grid-template-columns: 1fr;
  }
  .shell__rail {
    display: none;
  }
  .shell__collapse {
    display: none;
  }
  .shell__mobile-nav {
    display: flex;
  }
  .shell__main {
    padding: 16px 16px 80px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shell,
  .shell__collapse {
    transition: none;
  }
}
</style>

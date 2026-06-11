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

    <!-- Same grid cell as the rail: a zero-footprint sticky track whose
         right edge IS the rail boundary. The button hangs on that edge, so
         it rides the collapse animation via the column width and stays at
         mid-viewport while the page scrolls. Deliberately NOT position:fixed:
         the camera-stage transform makes fixed resolve against the panel,
         which drifts after window resizes. -->
    <div class="shell__handle">
      <button
        type="button"
        class="shell__collapse font-pixel"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? t('nav.sidebar_expand') : t('nav.sidebar_collapse')"
        @click="collapsed = !collapsed"
      >
        <span aria-hidden="true">{{ collapsed ? '▸' : '◂' }}</span>
      </button>
    </div>

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

/* The page scrolls inside .camera-stage__scroll; the rail pins itself to
 * that scroller's viewport so the sidebar never rides along with content.
 * overflow-x clips the fixed-width sidebar during the collapse transition;
 * overflow-y lets the sidebar scroll itself on short viewports. */
.shell__rail {
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  top: 0;
  height: 100vh;
  align-self: start;
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 0;
}
.shell__sidebar {
  /* constant inner width so content clips instead of squishing mid-transition */
  width: 220px;
  min-height: 100%;
}
.shell__main {
  grid-column: 2;
  grid-row: 1;
  padding: 32px 32px 80px;
  max-width: 1200px;
  width: 100%;
  min-width: 0;
}

.shell__handle {
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  top: 0;
  height: 100vh;
  align-self: start;
  pointer-events: none;
  z-index: 40;
}
.shell__collapse {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(50%, -50%);
  pointer-events: auto;
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
  transition: transform 240ms ease;
}
.shell--collapsed .shell__collapse {
  /* The column is 0 wide, so right:0 parks the button entirely OFF-track
   * (its right edge at x=0). Push it a full button-width inward so the
   * whole 22px handle sits on-screen against the viewport edge. */
  transform: translate(calc(100% + 2px), -50%);
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
  .shell__handle {
    display: none;
  }
  .shell__mobile-nav {
    display: flex;
  }
  .shell__main {
    grid-column: 1;
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

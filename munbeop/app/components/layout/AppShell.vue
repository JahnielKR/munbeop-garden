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
 * Collapsible sidebar (mini-rail spec 2026-06-13, supersedes garden spec
 * §5.5's squeeze-to-0): the 220px rail narrows to a 64px icon rail with a
 * grid-column transition, so navigation stays usable while collapsed. The
 * toggle lives INSIDE AppSidebar as its bottom row — the shell only owns
 * the state. UI preference only — persisted in localStorage, never through
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
</script>

<template>
  <div class="shell" :class="{ 'shell--collapsed': collapsed }">
    <div class="shell__rail">
      <AppSidebar
        class="shell__sidebar"
        :collapsed="collapsed"
        @toggle="collapsed = !collapsed"
      />
    </div>
    <main class="shell__main">
      <slot />
    </main>

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
  grid-template-columns: 64px 1fr;
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
  /* Width lives in AppSidebar itself (220px ↔ 64px with its own 240ms
   * width transition, in sync with the grid above), so the rail clips
   * the moving edge instead of squishing content mid-transition. */
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
  .shell__mobile-nav {
    display: flex;
  }
  .shell__main {
    grid-column: 1;
    padding: 16px 16px 80px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shell {
    transition: none;
  }
}
</style>

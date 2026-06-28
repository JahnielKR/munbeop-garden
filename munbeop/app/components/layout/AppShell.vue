<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import AppSidebar from './AppSidebar.vue'
import MobileNavbar from './MobileNavbar.vue'
import Toast from '~/components/ui/Toast.vue'

const { t } = useI18n()
const route = useRoute()
const surface = computed<'study' | 'game'>(
  () => (route.meta.surface as 'study' | 'game' | undefined) ?? 'study',
)
provide('surface', surface)

// Move the reading cursor into the new page on navigation. Without this a
// keyboard/screen-reader user re-tabs the whole sidebar on every route change
// and nothing signals the page changed. We skip it when the destination page
// already claimed focus inside <main> (e.g. the ruleta phase wrappers) so we
// never fight a page's own focus management.
const mainEl = ref<HTMLElement | null>(null)
watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    const el = mainEl.value
    if (el && !el.contains(document.activeElement)) el.focus()
  },
)

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
    <a class="skip-link" href="#main-content">{{ t('a11y.skip_to_content') }}</a>
    <div class="shell__rail">
      <AppSidebar
        class="shell__sidebar"
        :collapsed="collapsed"
        @toggle="collapsed = !collapsed"
      />
    </div>
    <main id="main-content" ref="mainEl" tabindex="-1" class="shell__main">
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

/* Keyboard-only escape hatch past the 7-item sidebar — off-screen until the
 * first Tab focuses it, then it slides in at the top-left. */
.skip-link {
  position: fixed;
  top: -56px;
  left: 8px;
  z-index: 200;
  padding: 8px 14px;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-strong, var(--border));
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  transition: top 120ms ease;
}
.skip-link:focus {
  top: 8px;
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
/* Programmatic focus target on route change — no visible ring (it moves the SR
 * reading position, it's not a visual control). */
.shell__main:focus {
  outline: none;
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

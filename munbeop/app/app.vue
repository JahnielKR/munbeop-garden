<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed } from 'vue'
import { useBomiStore } from '~/stores/bomi'

// Boot the Supabase auth subscription as early as possible so getSession()
// fires before the layout's onMounted runs. The layout still owns store
// hydration; this only populates useAuthStore so pickAdapter inside that
// hydration picks the right backend on the very first page load.
const { init } = useAuth()
const { hydrate: hydrateTheme } = useTheme()
const { locale } = useI18n()
const { direction, clear: clearTransitionDirection } = useRouteTransition()

// The pan is ONLY for the welcome↔in-app boundary. In-app tab-to-tab
// navigation must have NO transition (instant snap, no fade) — user
// feedback was explicit: "zero pan, zero fade inside the app".
//
// pageTransitionConfig returns `false` when direction is null (in-app
// nav), which tells NuxtPage to skip the <Transition> wrapper entirely.
// When direction is 'enter' or 'exit' (welcome↔app), we pass the pan
// config and let onAfterEnter clear the flag so the next in-app nav
// reverts to no-transition.
const pageTransitionConfig = computed<
  false | { name: string; mode: 'out-in'; onAfterEnter: () => void }
>(() => {
  const d = direction.value
  if (d === 'enter') return { name: 'pan-right', mode: 'out-in', onAfterEnter: clearTransitionDirection }
  if (d === 'exit') return { name: 'pan-left', mode: 'out-in', onAfterEnter: clearTransitionDirection }
  return false
})

// Keep <html lang="..."> in sync with the i18n locale. Required for
// CSS :lang() rules (per-locale font-size bumps for Thai / Vietnamese)
// to trigger when the user switches language. Nuxt i18n changes the
// in-memory locale but doesn't reach into document.documentElement,
// and nuxt.config's static app.head.htmlAttrs.lang overrides anything
// useHead would merge in. A direct DOM write avoids both issues and
// runs before paint in SPA mode (no FOUC) because Vue queues the
// effect inside the same microtask as the locale change.
watch(
  locale,
  (l) => {
    document.documentElement.lang = String(l)
  },
  { immediate: true },
)

// Anti-FOUC: inline script reads localStorage theme BEFORE Vue mounts.
// SPA-only build (ssr: false) means there's a brief window between HTML
// parse and Vue mount where the default light theme paints if we don't
// pre-set the data-theme attribute. The single-line script in <head>
// closes that window. Wrapped in try/catch because localStorage can
// throw in restricted contexts (private mode, sandbox).
useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('mungarden:theme');if(t==='dark')document.documentElement.dataset.theme='dark';}catch(e){}})();`,
      tagPosition: 'head',
    },
  ],
})

onMounted(() => {
  // hydrateTheme syncs the in-memory ref to the value the FOUC script
  // already applied to the DOM. setTheme later writes both back.
  hydrateTheme()
  void init()

  // Bomi inactivity tracking — global event listeners reset the
  // activity clock so the timeline (5s thinking / 25s play-hat /
  // 60s sleep) accurately reflects idle time.
  const bomi = useBomiStore()
  const ACTIVITY_EVENTS = [
    'mousemove',
    'keydown',
    'pointerdown',
    'wheel',
    'touchstart',
    'focusin',
  ] as const
  function onActivity() {
    bomi.resetActivity()
  }
  for (const evt of ACTIVITY_EVENTS) {
    window.addEventListener(evt, onActivity, { passive: true })
  }
  onUnmounted(() => {
    for (const evt of ACTIVITY_EVENTS) {
      window.removeEventListener(evt, onActivity)
    }
  })
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="pageTransitionConfig" />
  </NuxtLayout>
</template>

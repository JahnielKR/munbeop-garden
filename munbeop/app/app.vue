<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useBomiStore } from '~/stores/bomi'

// Boot the Supabase auth subscription as early as possible so getSession()
// fires before the layout's onMounted runs. The layout still owns store
// hydration; this only populates useAuthStore so pickAdapter inside that
// hydration picks the right backend on the very first page load.
const { init } = useAuth()
const { hydrate: hydrateTheme } = useTheme()

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
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WelcomePanel from '~/components/welcome/WelcomePanel.vue'

/**
 * Camera stage — the technique from idea-de-movimiento-de-landing.md.
 *
 * One 200vw wrapper holds both panels (welcome on the left, in-app on
 * the right) ALWAYS mounted. A single `transform: translateX()` on the
 * wrapper moves both panels as one rigid camera. Nothing slides
 * independently — visually it reads as ONE continuous document with
 * two slides, exactly the way the user described.
 *
 * Routing stays the source of truth: pages/welcome.vue exists as a
 * stub so the /welcome URL resolves, and this component watches the
 * route to decide which panel the camera should be looking at.
 *
 *   route at /welcome  → currentPanel = 0 → transform: translateX(0)
 *   route anywhere else → currentPanel = 1 → transform: translateX(-100vw)
 *
 * The slot is the in-app side — app.vue passes `<NuxtLayout><NuxtPage/></NuxtLayout>`
 * into it. NuxtPage renders whatever the current route matches (the
 * welcome stub when on /welcome, the real in-app page when on /, /practice, …).
 * When the user is on /welcome the in-app side is off-screen and its
 * NuxtPage just renders the stub — invisible to the user.
 *
 * Scroll lives on a child wrapper, not the panel itself. Each panel keeps
 * `transform: translateZ(0)` so it remains the containing block for its
 * position:fixed descendants (welcome chrome on the welcome side; Toast
 * + MobileNavbar on the app side). If the panel itself scrolled, every
 * browser engine slides those fixed children along with the content —
 * the bug we previously hit with the cottage. Putting the scroll on an
 * inner `.camera-stage__scroll` div sidesteps that: the panel box stays
 * still, the inner div scrolls. The welcome side doesn't get a scroller
 * because the welcome composition is intentionally a single-screen
 * surface that must never grow a scrollbar.
 *
 * CottageCorner is rendered ONE LEVEL UP, in app.vue, OUTSIDE this
 * component. It's a wallpaper — not part of the camera stage at all —
 * so it sits behind the panels with no transformed ancestor and is
 * plain viewport-fixed.
 */

const route = useRoute()
const currentPanel = computed(() => {
  const p = route.path
  return (p === '/welcome' || p === '/welcome/') ? 0 : 1
})
const stageStyle = computed(() => ({
  transform: `translateX(${-100 * currentPanel.value}vw)`,
}))
</script>

<template>
  <div class="camera-stage" :style="stageStyle">
    <div class="camera-stage__panel camera-stage__panel--welcome">
      <WelcomePanel />
    </div>
    <div class="camera-stage__panel camera-stage__panel--app">
      <div class="camera-stage__scroll">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.camera-stage {
  position: fixed;
  top: 0;
  left: 0;
  width: 200vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  /* The single transition that moves both panels in lockstep. */
  transition: transform 700ms cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}
.camera-stage__panel {
  flex: 0 0 100vw;
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  /* Containing block for descendant position:fixed children — so welcome
   * chrome stays inside the welcome panel and the app's Toast/MobileNavbar
   * resolve to the 100vw panel (NOT the 200vw wrapper, which would stretch
   * left:0/right:0 across both slides). */
  transform: translateZ(0);
}

/* Inner scroller for the in-app side. Position:absolute inside the panel
 * gives us a 100vh scroll viewport; overflow-y:auto handles per-page
 * vertical scroll. Critically, this element has NO transform/filter, so
 * fixed-positioned siblings of the slot content still resolve to the
 * panel above — they don't ride along with the scroll. */
.camera-stage__scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .camera-stage { transition: opacity 200ms linear; }
}
</style>

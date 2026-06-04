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
 * Each panel applies `transform: translateZ(0)` to itself so it becomes
 * the containing block for any descendant `position: fixed`. Without
 * that trick the welcome chrome (sidebar, dialog box, etc.) would
 * resolve to the full 200vw wrapper and bleed across the boundary.
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
      <slot />
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
  /* Establish a containing block for descendant position:fixed children
   * so the welcome chrome stays inside its own panel. Without this they
   * resolve to the 200vw wrapper and would visually bleed into the
   * neighbouring panel during the pan. */
  transform: translateZ(0);
}

@media (prefers-reduced-motion: reduce) {
  .camera-stage { transition: opacity 200ms linear; }
}
</style>

<script setup lang="ts">
// Stub route — the actual welcome UI is rendered by CameraStage in
// app.vue (see app/components/layout/CameraStage.vue). This file
// exists so the URL /welcome resolves to a real Nuxt page; the visible
// chrome lives in app/components/welcome/WelcomePanel.vue which is
// always mounted on the camera stage's left panel.
//
// Keep the `welcome` surface meta so any per-route surface styling that
// looks at route.meta.surface still picks it up; layout is false so
// NuxtLayout doesn't render anything around this stub.
definePageMeta({ layout: false, surface: 'welcome' })
</script>

<template>
  <div class="welcome-stub" aria-hidden="true" />
</template>

<style scoped>
.welcome-stub {
  /* Stays out of the way — the real welcome lives on the camera stage. */
  position: fixed;
  inset: 0;
  pointer-events: none;
}
</style>

<script setup lang="ts">
// Transparent passthrough layout for the welcome page. Exists so that
// NuxtLayout's transition (configured in app.vue) fires on the
// welcome↔in-app boundary — switching between the named "welcome"
// layout and the "default" layout is what triggers the camera pan.
//
// The actual welcome chrome (scene, sidebar, dialog, etc.) lives in
// pages/welcome.vue under this slot.
</script>

<template>
  <div class="welcome-layout">
    <slot />
  </div>
</template>

<style scoped>
.welcome-layout {
  position: fixed;
  inset: 0;
  overflow: hidden;
}
</style>

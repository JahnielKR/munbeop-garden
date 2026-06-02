<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import MobileNavbar from './MobileNavbar.vue'
import Toast from '~/components/ui/Toast.vue'
</script>

<template>
  <div class="shell">
    <AppSidebar class="shell__sidebar" />
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
}
.shell__main {
  padding: 32px 32px 80px;
  max-width: 1200px;
  width: 100%;
}
.shell__mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .shell {
    grid-template-columns: 1fr;
  }
  .shell__sidebar {
    display: none;
  }
  .shell__mobile-nav {
    display: flex;
  }
  .shell__main {
    padding: 16px 16px 80px;
  }
}
</style>

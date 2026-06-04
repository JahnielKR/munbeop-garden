<script setup lang="ts">
import { computed } from 'vue'
import WelcomeDayScene from './WelcomeDayScene.vue'
import WelcomeNightScene from './WelcomeNightScene.vue'

const props = defineProps<{ theme: 'light' | 'dark' }>()

// v5: the stage reads --stage-push from .welcome (set inline based on
// sidebarOpen) and slides laterally to make room for the sidebar. No
// mouse-driven parallax — v2.19 dropped that layer; v5 doesn't need
// it back because the ambient horizontal scroll inside each scene
// already provides perpetual motion.
const isLight = computed(() => props.theme === 'light')
</script>

<template>
  <div class="stage">
    <transition name="stage-fade">
      <WelcomeDayScene v-if="isLight" key="day" class="stage__scene" />
      <WelcomeNightScene v-else key="night" class="stage__scene" />
    </transition>
  </div>
</template>

<style scoped>
.stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* Matches the WelcomeSidebar slide curve and duration so the push
   * and the sidebar move as one rigid pair. */
  transform: translateX(var(--stage-push, 0));
  transition: transform 360ms cubic-bezier(0.1, 0.8, 0.3, 1);
  will-change: transform;
}
.stage__scene {
  position: absolute;
  inset: 0;
}
.stage-fade-enter-active,
.stage-fade-leave-active {
  transition: opacity 200ms ease-out;
}
.stage-fade-enter-from,
.stage-fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .stage { transition: transform 120ms linear; }
  .stage-fade-enter-active,
  .stage-fade-leave-active { transition: opacity 100ms linear; }
}
</style>

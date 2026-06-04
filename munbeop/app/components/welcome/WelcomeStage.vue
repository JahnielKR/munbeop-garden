<script setup lang="ts">
import { computed } from 'vue'
import WelcomeDayScene from './WelcomeDayScene.vue'
import WelcomeNightScene from './WelcomeNightScene.vue'

const props = defineProps<{ theme: 'light' | 'dark' }>()

// v7: the stage is fully passive. No mouse parallax (dropped in
// v2.19), no ambient scroll (dropped in v6), no sidebar push (dropped
// in v7 — the sidebar now drops from above, so the scene doesn't
// need to make horizontal room). All it does is cross-fade between
// the day and night scene components when the theme flips.
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
  .stage-fade-enter-active,
  .stage-fade-leave-active { transition: opacity 100ms linear; }
}
</style>

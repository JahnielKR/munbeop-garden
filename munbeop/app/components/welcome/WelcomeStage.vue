<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import WelcomeDayScene from './WelcomeDayScene.vue'
import WelcomeNightScene from './WelcomeNightScene.vue'

const props = defineProps<{ theme: 'light' | 'dark' }>()

const stage = ref<HTMLElement | null>(null)
const mouseX = ref(0.5)

function onMove(e: MouseEvent) {
  const w = window.innerWidth || 1
  mouseX.value = Math.min(1, Math.max(0, e.clientX / w))
}

onMounted(() => { window.addEventListener('pointermove', onMove, { passive: true }) })
onUnmounted(() => { window.removeEventListener('pointermove', onMove) })

const stageStyle = computed(() => ({ '--mouse-x': mouseX.value.toString() }))
const isLight = computed(() => props.theme === 'light')
</script>

<template>
  <div ref="stage" class="stage" :style="stageStyle">
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

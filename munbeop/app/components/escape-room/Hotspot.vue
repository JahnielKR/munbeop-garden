<script setup lang="ts">
import { computed } from 'vue'

/**
 * Hotspot — clickable region overlaid on a Room scene.
 *
 * Position is given in scene coordinates (default base 320×240) and rendered
 * as percentages of the parent so the scene scales responsively without
 * recalculating rects per breakpoint.
 */

interface Props {
  id: string
  /** `[x, y, w, h]` in scene base coords. */
  rect: readonly [number, number, number, number]
  sceneWidth?: number
  sceneHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  sceneWidth: 320,
  sceneHeight: 240,
})

defineEmits<{ click: [] }>()

const style = computed(() => {
  const [x, y, w, h] = props.rect
  return {
    left: `${(x / props.sceneWidth) * 100}%`,
    top: `${(y / props.sceneHeight) * 100}%`,
    width: `${(w / props.sceneWidth) * 100}%`,
    height: `${(h / props.sceneHeight) * 100}%`,
  }
})
</script>

<template>
  <button
    type="button"
    class="hotspot"
    data-testid="hotspot"
    :aria-label="id"
    :style="style"
    @click="$emit('click')"
  >
    <span class="hotspot__sr-only">{{ id }}</span>
  </button>
</template>

<style scoped>
.hotspot {
  position: absolute;
  background: transparent;
  border: 2px dashed rgba(255, 200, 80, 0.0);
  cursor: pointer;
  padding: 0;
  min-width: 44px;
  min-height: 44px;
  transition: border-color 120ms;
}
.hotspot:hover,
.hotspot:focus-visible {
  border-color: rgba(255, 200, 80, 0.85);
  outline: none;
}
.hotspot__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>

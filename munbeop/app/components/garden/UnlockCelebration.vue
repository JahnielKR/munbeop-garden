<script setup lang="ts">
/**
 * UnlockCelebration — one-shot particle burst from the crown (spec §5.4).
 *
 * Every increment of `burst` fires 10–16 species sprites outward from the
 * origin anchor for ~1.2s. Purely visual: the toast and Bomi's cheer are
 * orchestrated by the page. prefers-reduced-motion renders nothing.
 */
import { ref, watch } from 'vue'

interface Props {
  /** Increment to fire one burst. 0 = never fired. */
  burst: number
  /** 8×8 particle sprite of the celebrating species. */
  particleSrc: string
  /** Burst origin over the tree canvas (usually the crown's top anchor). */
  origin: { top: string; left: string }
}

const props = defineProps<Props>()

interface Bit {
  dx: string
  dy: string
  delay: string
  spin: string
}

const bits = ref<Bit[]>([])
let clearTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.burst,
  (n) => {
    if (!n || import.meta.server) return
    const count = 10 + Math.round(Math.random() * 6)
    bits.value = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = 36 + Math.random() * 54
      return {
        dx: `${Math.round(Math.cos(angle) * dist)}px`,
        dy: `${Math.round(Math.sin(angle) * dist * 0.8 - 18)}px`,
        delay: `${(Math.random() * 0.12).toFixed(2)}s`,
        spin: `${Math.round(Math.random() * 360 - 180)}deg`,
      }
    })
    if (clearTimer) clearTimeout(clearTimer)
    clearTimer = setTimeout(() => {
      bits.value = []
    }, 1400)
  },
)
</script>

<template>
  <div class="burst" :style="{ top: origin.top, left: origin.left }" aria-hidden="true">
    <img
      v-for="(b, i) in bits"
      :key="`${burst}-${i}`"
      class="burst__bit pixel"
      :src="particleSrc"
      alt=""
      width="16"
      height="16"
      :style="{ '--dx': b.dx, '--dy': b.dy, '--spin': b.spin, animationDelay: b.delay }"
      draggable="false"
    />
  </div>
</template>

<style scoped>
.burst {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 4;
}

.burst__bit {
  position: absolute;
  top: -8px;
  left: -8px;
  image-rendering: pixelated;
  opacity: 0;
  animation: burst-out 1.2s ease-out forwards;
  will-change: transform, opacity;
}

@keyframes burst-out {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(0.6);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), var(--dy)) rotate(var(--spin)) scale(1);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .burst__bit {
    display: none;
  }
}
</style>

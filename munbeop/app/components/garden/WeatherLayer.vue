<script setup lang="ts">
/**
 * WeatherLayer — ambient feedback over the stage (spec §5.3).
 *
 *   rain  → ≥5 unreviewed hard sentences (sky also shifts colder)
 *   mist  → 1–4 pending
 *   snow  → clear winter (dormant level)
 *   fall  → clear + full bloom: the species' petals/leaves drift down
 *
 * Weather never blocks anything — it's feedback, not punishment.
 * Particles are generated on the client after mount with deterministic
 * caps (≤20, transform/opacity only); prefers-reduced-motion hides the
 * animated bits entirely and keeps only the static mist veil.
 */
import { ref, watch } from 'vue'

export type WeatherKind = 'none' | 'snow' | 'rain' | 'mist' | 'fall'

interface Props {
  kind: WeatherKind
  /** 8×8 sprite for 'fall' (SPECIES_PARTICLE of the active species). */
  particleSrc?: string
}

const props = withDefaults(defineProps<Props>(), { particleSrc: '' })

interface Particle {
  left: string
  delay: string
  duration: string
  drift: string
}

const particles = ref<Particle[]>([])

const COUNTS: Record<WeatherKind, number> = { none: 0, mist: 0, snow: 12, rain: 18, fall: 8 }

function regenerate(kind: WeatherKind) {
  if (import.meta.server) return
  const n = COUNTS[kind]
  particles.value = Array.from({ length: n }, () => {
    const slow = kind === 'rain' ? 0.7 + Math.random() * 0.5 : 5 + Math.random() * 4
    return {
      left: `${Math.round(Math.random() * 96 + 2)}%`,
      delay: `${(Math.random() * slow).toFixed(2)}s`,
      duration: `${slow.toFixed(2)}s`,
      drift: `${Math.round(Math.random() * 26 - 13)}px`,
    }
  })
}

watch(() => props.kind, regenerate, { immediate: true })
</script>

<template>
  <div class="weather" :data-kind="kind" aria-hidden="true">
    <template v-if="kind === 'mist'">
      <div class="weather__mist weather__mist--a" />
      <div class="weather__mist weather__mist--b" />
    </template>

    <template v-else-if="kind === 'fall' && particleSrc">
      <img
        v-for="(p, i) in particles"
        :key="`${kind}-${i}`"
        class="weather__bit weather__bit--sprite pixel"
        :src="particleSrc"
        alt=""
        width="16"
        height="16"
        :style="{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, '--drift': p.drift }"
        draggable="false"
      />
    </template>

    <template v-else>
      <span
        v-for="(p, i) in particles"
        :key="`${kind}-${i}`"
        class="weather__bit"
        :class="kind === 'rain' ? 'weather__bit--rain' : 'weather__bit--snow'"
        :style="{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, '--drift': p.drift }"
      />
    </template>
  </div>
</template>

<style scoped>
.weather {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.weather__bit {
  position: absolute;
  top: -20px;
  animation-name: weather-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.weather__bit--snow {
  width: 3px;
  height: 3px;
  background: #f0f4f8;
  opacity: 0.9;
}

.weather__bit--rain {
  width: 1px;
  height: 5px;
  background: rgba(170, 200, 230, 0.75);
}

.weather__bit--sprite {
  image-rendering: pixelated;
}

@keyframes weather-fall {
  from {
    transform: translate3d(0, -24px, 0);
  }
  to {
    transform: translate3d(var(--drift, 0px), 540px, 0);
  }
}

/* mist: two soft translucent bands drifting slowly */
.weather__mist {
  position: absolute;
  left: -20%;
  width: 140%;
  height: 26%;
  background: rgba(222, 230, 238, 0.12);
  filter: blur(1px);
  animation: weather-drift 26s linear infinite alternate;
}

.weather__mist--a {
  top: 38%;
}

.weather__mist--b {
  top: 58%;
  animation-duration: 34s;
  animation-delay: -12s;
  background: rgba(222, 230, 238, 0.09);
}

@keyframes weather-drift {
  from {
    transform: translateX(-4%);
  }
  to {
    transform: translateX(4%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather__bit {
    display: none;
  }

  .weather__mist {
    animation: none;
  }
}
</style>

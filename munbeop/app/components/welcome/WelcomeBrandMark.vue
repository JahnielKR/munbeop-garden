<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const { t } = useI18n()

const glitching = ref(false)
let glitchTimer: ReturnType<typeof setTimeout> | null = null

function triggerGlitch() {
  if (typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  if (glitching.value) return
  glitching.value = true
  if (glitchTimer) clearTimeout(glitchTimer)
  glitchTimer = setTimeout(() => { glitching.value = false }, 250)
}

onUnmounted(() => { if (glitchTimer) clearTimeout(glitchTimer) })
</script>

<template>
  <div class="brand">
    <h1
      class="brand__title"
      :class="{ 'is-glitching': glitching }"
      lang="ko"
      @mouseenter="triggerGlitch"
    >
      <span class="brand__title-layer brand__title-layer--base">문법 정원</span>
      <span class="brand__title-layer brand__title-layer--red" aria-hidden="true">문법 정원</span>
      <span class="brand__title-layer brand__title-layer--cyan" aria-hidden="true">문법 정원</span>
    </h1>
    <p class="brand__subtitle">{{ t('welcome.brand.subtitle') }}</p>
  </div>
</template>

<style scoped>
.brand {
  text-align: center;
  pointer-events: none;
}
.brand__title {
  position: relative;
  display: inline-block;
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(40px, 7vw, 88px);
  margin: 0;
  letter-spacing: 0.02em;
  pointer-events: auto; /* heading needs to be interactive so hover fires */
}
.brand__title-layer {
  display: block;
  width: 100%;
  pointer-events: none;
}
.brand__title-layer--base {
  position: relative;
  color: var(--always-cream);
  text-shadow:
    0 0 12px rgba(0, 0, 0, 0.45),
    3px 3px 0 rgba(0, 0, 0, 0.35);
}
.brand__title-layer--red {
  position: absolute;
  inset: 0;
  color: rgba(255, 80, 80, 0.85);
  mix-blend-mode: screen;
  opacity: 0;
}
.brand__title-layer--cyan {
  position: absolute;
  inset: 0;
  color: rgba(80, 220, 255, 0.85);
  mix-blend-mode: screen;
  opacity: 0;
}

.brand__title.is-glitching .brand__title-layer--red {
  opacity: 1;
  animation: glitch-red 250ms steps(8) 1;
}
.brand__title.is-glitching .brand__title-layer--cyan {
  opacity: 1;
  animation: glitch-cyan 250ms steps(8) 1;
}
.brand__title.is-glitching .brand__title-layer--base {
  animation: glitch-base 250ms steps(8) 1;
}

@keyframes glitch-base {
  0%   { clip-path: polygon(0 0,   100% 0,   100% 100%, 0 100%); transform: translateX(0); }
  20%  { clip-path: polygon(0 0,   100% 0,   100% 33%,  0 33%);  transform: translateX(8px); }
  40%  { clip-path: polygon(0 33%, 100% 33%, 100% 66%,  0 66%);  transform: translateX(-6px); }
  60%  { clip-path: polygon(0 66%, 100% 66%, 100% 100%, 0 100%); transform: translateX(4px); }
  80%  { clip-path: polygon(0 0,   100% 0,   100% 100%, 0 100%); transform: translateX(0); }
  100% { clip-path: polygon(0 0,   100% 0,   100% 100%, 0 100%); transform: translateX(0); }
}
@keyframes glitch-red {
  0%, 100% { transform: translateX(-3px); }
  20%      { transform: translate(-6px, 1px); }
  60%      { transform: translate(-1px, -1px); }
}
@keyframes glitch-cyan {
  0%, 100% { transform: translateX(3px); }
  30%      { transform: translate(6px, -1px); }
  70%      { transform: translate(1px, 1px); }
}

.brand__subtitle {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: clamp(10px, 1.4vw, 14px);
  color: var(--always-cream);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  margin: 10px 0 0;
  letter-spacing: 0.05em;
}

@media (prefers-reduced-motion: reduce) {
  .brand__title.is-glitching * {
    animation: none !important;
    transform: none !important;
    clip-path: none !important;
    opacity: 0;
  }
  .brand__title-layer--base { opacity: 1 !important; }
}
</style>

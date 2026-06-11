<script setup lang="ts">
// Shared chrome for the three welcome-side info pages:
// /pricing, /features, /policies. Each page passes its title via
// the `title` prop and its body via the default slot — the shell
// owns the back button and the surrounding pixel-art frame.
//
// Back button calls router.push('/welcome'), which flips
// CameraStage's currentPanel back to 0 and pans the camera left
// the same way the in-app logout does.

import { useRouter } from '#imports'

defineProps<{ title: string }>()

const { t } = useI18n()
const router = useRouter()

function back() {
  void router.push('/welcome')
}
</script>

<template>
  <section class="section">
    <header class="section__header">
      <button
        type="button"
        class="section__back"
        :aria-label="t('welcome.menu.back')"
        @click="back"
      >
        {{ t('welcome.menu.back') }}
      </button>
      <h1 class="section__title">{{ title }}</h1>
    </header>
    <div class="section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  background: var(--paper);
  color: var(--text);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  padding: 24px clamp(20px, 5vw, 64px) 64px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.section__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}
.section__back {
  background: transparent;
  border: 3px solid var(--ink-line);
  box-shadow: 3px 3px 0 var(--shadow-cream);
  color: var(--text);
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}
.section__back:hover {
  background: var(--hover-bg);
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--shadow-cream);
}
.section__back:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--shadow-cream);
}
.section__back:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.section__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: clamp(20px, 4vw, 32px);
  color: var(--heading-accent);
  letter-spacing: 0.04em;
  margin: 0;
  line-height: 1.2;
}
.section__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 920px;
}
</style>

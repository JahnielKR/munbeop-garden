<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import { NuxtLink } from '#components'

/**
 * Distinct zero-progress state for the garden home: an inviting bare plot,
 * deliberately NOT the winter-veteran tree. Shown whenever the user has no
 * log entries; the CTA opens the guided first sentence.
 */
defineEmits<{ start: [] }>()
const { t } = useI18n()
</script>

<template>
  <section class="plot">
    <div class="plot__soil" aria-hidden="true">
      <svg class="plot__seed" viewBox="0 0 16 16" shape-rendering="crispEdges">
        <path class="plot__stem" d="M7 6h2v9H7z" />
        <path class="plot__leaf" d="M1 2h5v1h2v5H5V7H3V5H1zM10 1h5v4h-1v2h-5V3h1z" />
        <path class="plot__earth" d="M2 13h12v3H2z" />
      </svg>
    </div>
    <h2 class="plot__title">{{ t('onboarding.empty.title') }}</h2>
    <p class="plot__body">{{ t('onboarding.empty.body') }}</p>
    <Button @click="$emit('start')">{{ t('onboarding.empty.cta') }}</Button>
    <NuxtLink class="plot__placement" to="/practice/placement">{{
      t('onboarding.empty.placement_cta')
    }}</NuxtLink>
  </section>
</template>

<style scoped>
.plot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 32px 16px;
}
.plot__soil {
  position: relative;
  width: 120px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 3px solid var(--border-strong);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
}
.plot__soil::before,
.plot__soil::after {
  position: absolute;
  bottom: 8px;
  width: 6px;
  height: 4px;
  content: '';
  background: var(--border);
}
.plot__soil::before {
  left: 16px;
}
.plot__soil::after {
  right: 20px;
}
.plot__seed {
  width: 40px;
  height: 40px;
}
.plot__stem,
.plot__leaf {
  fill: var(--jade);
}
.plot__earth {
  fill: var(--border-strong);
}
.plot__title {
  margin: 0;
  font-family: var(--font-pixel-display);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text);
}
.plot__body {
  margin: 0;
  max-width: 38ch;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text-soft);
  line-height: 1.6;
}
.plot__placement {
  padding: 4px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--link);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
.plot__placement:hover {
  color: var(--text);
}
.plot__placement:active {
  transform: translateY(2px);
}
.plot__placement:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

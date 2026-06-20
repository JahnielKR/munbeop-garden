<script setup lang="ts">
import Button from '~/components/ui/Button.vue'

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
      <span class="plot__seed">🌱</span>
    </div>
    <h2 class="plot__title">{{ t('onboarding.empty.title') }}</h2>
    <p class="plot__body">{{ t('onboarding.empty.body') }}</p>
    <Button @click="$emit('start')">{{ t('onboarding.empty.cta') }}</Button>
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
  width: 120px;
  height: 60px;
  background: var(--surface);
  border: 3px dashed var(--border-strong);
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.plot__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 14px;
  color: var(--text);
}
.plot__body {
  margin: 0;
  max-width: 38ch;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  color: var(--text-soft);
  line-height: 1.6;
}
</style>

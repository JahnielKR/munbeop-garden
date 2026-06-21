<script setup lang="ts">
/**
 * Dynamic translation + nuance. Re-keyed <Transition> animates every
 * change triggered by a particle toggle (§2.3).
 */
interface Props {
  text: string
  nuance: string | null
  /** OFF combo without explicit reading → show generic colloquial note. */
  fallback?: boolean
}
withDefaults(defineProps<Props>(), { fallback: false })
const { t } = useI18n()
</script>

<template>
  <section class="panel" data-testid="translation-panel">
    <h3 class="panel__title">{{ t('particles.explore.translation_label') }}</h3>
    <div class="panel__body" aria-live="polite" aria-atomic="true">
      <Transition name="panel">
        <p :key="text" class="panel__trans">{{ text }}</p>
      </Transition>
      <Transition name="panel">
        <p v-if="nuance" :key="nuance" class="panel__nuance"><span aria-hidden="true">💡</span> {{ nuance }}</p>
        <p v-else-if="fallback" key="fallback" class="panel__nuance">
          <span aria-hidden="true">💡</span> {{ t('particles.explore.nuance_generic') }}
        </p>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: var(--paper);
  border-left: 4px solid var(--jade);
  padding: 12px 14px;
}
.panel__title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
/* Anchor the absolute-positioned leaving paragraphs so an out-in swap doesn't
 * collapse the panel body (and bounce ParticleLegend below it) on every toggle. */
.panel__body {
  position: relative;
}
.panel__trans {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-md);
  color: var(--text);
  line-height: 1.6;
}
.panel__nuance {
  margin: 8px 0 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  line-height: 1.6;
}

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity var(--motion-base) var(--ease-out),
    transform var(--motion-base) var(--ease-out);
}
/* The leaving line drops out of flow (keeping its static position) so the
 * entering line defines the height immediately — no collapse, no bounce. */
.panel-leave-active {
  position: absolute;
  width: 100%;
}
.panel-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.panel-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }
}
</style>

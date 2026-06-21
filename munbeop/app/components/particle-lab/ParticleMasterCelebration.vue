<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/** One-shot reward card when 조사 마스터 is earned. No pixel-art asset. */
interface Props {
  total: number
}
defineProps<Props>()
const emit = defineEmits<{ dismiss: [] }>()
const { t } = useI18n()

// Dialog focus management (mirrors ui/Modal.vue): focus in, trap on the single
// control, Escape to close, restore focus to the trigger on unmount.
const dismissBtn = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('dismiss')
  } else if (e.key === 'Tab') {
    // single focusable element → keep focus on it
    e.preventDefault()
    dismissBtn.value?.focus()
  }
}
onMounted(() => {
  previouslyFocused = (typeof document !== 'undefined'
    ? (document.activeElement as HTMLElement | null)
    : null)
  dismissBtn.value?.focus()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  previouslyFocused?.focus()
})
</script>

<template>
  <div
    class="cel"
    data-testid="particle-master-celebration"
    @click.self="emit('dismiss')"
  >
    <section
      class="cel__card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cel-title"
      aria-describedby="cel-body"
    >
      <span class="cel__badge" aria-hidden="true">🏅</span>
      <h2 id="cel-title" class="cel__title" lang="ko">조사 마스터!</h2>
      <p class="cel__label">{{ t('particles.master.label') }}</p>
      <p id="cel-body" class="cel__body">
        {{ t('particles.master.celebrate_body', { total }) }}
      </p>
      <button
        ref="dismissBtn"
        type="button"
        class="cel__btn"
        data-testid="cel-dismiss"
        @click="emit('dismiss')"
      >
        {{ t('particles.master.dismiss') }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.cel {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: color-mix(in srgb, var(--always-dark) 55%, transparent);
  animation: cel-fade var(--motion-quick) var(--ease-out);
}
.cel__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 360px;
  width: 100%;
  padding: 24px 20px;
  text-align: center;
  background: var(--surface);
  border: 3px solid var(--gold);
  box-shadow: var(--shadow-card);
  animation: cel-pop var(--motion-base) var(--ease-out);
}
.cel__badge {
  font-size: 44px;
  line-height: 1;
}
.cel__title {
  margin: 0;
  font-family: var(--font-ko);
  font-weight: 900;
  font-size: var(--text-xl);
  color: var(--heading-accent);
}
.cel__label {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  /* Caption text — ink-soft so it reads on the tan card in light theme
   * (gold-on-surface was ~1.5:1). Gold stays on the card border + badge. */
  color: var(--text-soft);
}
.cel__body {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text);
}
.cel__btn {
  margin-top: 6px;
  padding: 10px 20px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 3px solid var(--ink-line);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
}
.cel__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.cel__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
@keyframes cel-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes cel-pop {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .cel,
  .cel__card {
    animation: none;
  }
}
</style>

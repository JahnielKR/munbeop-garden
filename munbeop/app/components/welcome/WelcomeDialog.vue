<script setup lang="ts">
import { computed, toRef } from 'vue'

const props = defineProps<{
  text: string
  variant?: 'normal' | 'error'
}>()
const emit = defineEmits<{ dismiss: [] }>()

const textRef = toRef(props, 'text')
const { rendered, done, skip } = useTypewriter(textRef, { speed: 40 })

const open = computed(() => !!props.text)
const variantClass = computed(() => (props.variant === 'error' ? 'dialog--error' : ''))

function onActivate(e: MouseEvent | KeyboardEvent) {
  if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') return
  if (!done.value) {
    skip()
    return
  }
  emit('dismiss')
}
</script>

<template>
  <transition name="dialog">
    <div
      v-if="open"
      class="dialog"
      :class="variantClass"
      data-testid="welcome-dialog-root"
      role="dialog"
      tabindex="0"
      @click="onActivate"
      @keydown="onActivate"
    >
      <p class="dialog__text" data-testid="welcome-dialog-text">{{ rendered }}</p>
      <span v-if="done" class="dialog__arrow" aria-hidden="true">▾</span>
    </div>
  </transition>
</template>

<style scoped>
.dialog {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(700px, 92vw);
  min-height: 120px;
  background: #000;
  color: var(--always-cream);
  border: 6px solid var(--always-cream);
  box-shadow: 0 0 0 4px #000, 0 10px 30px rgba(0, 0, 0, 0.7);
  padding: 22px 28px;
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 12px;
  line-height: 1.85;
  cursor: pointer;
  z-index: 35;
}
.dialog--error { border-color: var(--red); color: #ffd1d1; }
.dialog:focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }
.dialog__text { margin: 0; }
.dialog__arrow {
  position: absolute;
  right: 18px;
  bottom: 14px;
  font-size: 18px;
  color: var(--gold);
  animation: dialog-blink 0.8s steps(2) infinite;
}
@keyframes dialog-blink {
  0%, 49% { opacity: 0; }
  50%, 100% { opacity: 1; }
}
.dialog-enter-active,
.dialog-leave-active { transition: transform 320ms ease, opacity 240ms ease; }
.dialog-enter-from   { transform: translate(-50%, 120%); opacity: 0; }
.dialog-leave-to     { transform: translate(-50%, 120%); opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active { transition: opacity 120ms linear; }
  .dialog-enter-from,
  .dialog-leave-to     { transform: translateX(-50%); }
  .dialog__arrow { animation: none; opacity: 1; }
}
</style>

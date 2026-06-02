<script setup lang="ts">
const { message, visible } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--paper-warm);
  color: var(--ink);
  border: 2px solid var(--ink);
  box-shadow: 4px 4px 0 var(--paper-deep);
  padding: 12px 18px;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  z-index: 100;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>

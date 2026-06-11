<script setup lang="ts">
const { t } = useI18n()
const emit = defineEmits<{ activate: [] }>()
const props = defineProps<{ expanded: boolean; controls: string }>()
</script>

<template>
  <button
    type="button"
    class="pulse"
    :aria-expanded="props.expanded"
    :aria-controls="props.controls"
    @click="emit('activate')"
  >
    {{ t('welcome.enter') }}
  </button>
</template>

<style scoped>
.pulse {
  background: rgba(0, 0, 0, 0.78);
  color: var(--gold);
  border: 4px solid var(--gold);
  padding: 18px 36px;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  letter-spacing: 0.05em;
  cursor: pointer;
  /* One of the very few allowed blurs — landing light glow, not UI shadow.
   * color-mix over the token so the glow follows the theme's gold forever. */
  box-shadow: 0 0 15px color-mix(in srgb, var(--gold) 45%, transparent);
  animation: pulse-zelda 1.8s ease-in-out infinite;
  transition: background 200ms ease, color 200ms ease, transform 200ms ease;
}
.pulse:hover {
  background: var(--gold);
  color: var(--always-dark);
  box-shadow: 0 0 30px var(--gold);
  animation: none;
  transform: scale(1.02);
}
.pulse:focus-visible {
  outline: 3px solid var(--always-cream);
  outline-offset: 4px;
}
@keyframes pulse-zelda {
  0%, 100% { transform: scale(1);    opacity: 0.92; }
  50%      { transform: scale(1.05); opacity: 1; box-shadow: 0 0 28px color-mix(in srgb, var(--gold) 78%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .pulse { animation: none; }
}
</style>

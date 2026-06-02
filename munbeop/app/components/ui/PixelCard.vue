<script setup lang="ts">
interface Props {
  accent?: 'red' | 'indigo' | 'jade' | 'gold'
}
withDefaults(defineProps<Props>(), { accent: 'jade' })
</script>

<template>
  <div class="pixel-card" :class="`pixel-card--${accent}`">
    <slot />
  </div>
</template>

<style scoped>
.pixel-card {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-left-width: 6px;
  padding: 18px 20px;
  box-shadow: 4px 4px 0 var(--paper-deep);
}
.pixel-card--red {
  border-left-color: var(--red);
}
.pixel-card--indigo {
  border-left-color: var(--indigo);
}
.pixel-card--jade {
  border-left-color: var(--jade);
}
.pixel-card--gold {
  border-left-color: var(--gold);
}
</style>

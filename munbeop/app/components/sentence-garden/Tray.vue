<!-- app/components/sentence-garden/Tray.vue -->
<script setup lang="ts">
import SentenceCard from './SentenceCard.vue'
import type { SGCard } from '~/composables/useSentenceGarden'

defineProps<{ cards: SGCard[]; label: string }>()
defineEmits<{ place: [card: SGCard] }>()
</script>

<template>
  <div class="sg-tray" role="group" :aria-label="label">
    <button
      v-for="card in cards"
      :key="card.id"
      type="button"
      class="sg-tray__card"
      @click="$emit('place', card)"
    >
      <SentenceCard :text="card.text" />
    </button>
  </div>
</template>

<style scoped>
.sg-tray { display: flex; flex-wrap: wrap; gap: 10px; }
.sg-tray__card { padding: 0; border: none; background: none; cursor: pointer; }
.sg-tray__card:focus-visible { outline: 2px solid var(--focus-ring, var(--gold)); outline-offset: 2px; }
</style>

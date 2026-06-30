<!-- app/components/sentence-garden/Bed.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import SentenceCard from './SentenceCard.vue'
import type { SGCard } from '~/composables/useSentenceGarden'

const props = defineProps<{
  placed: SGCard[]
  total: number
  verdict: boolean | null
  label: string
}>()
defineEmits<{ remove: [i: number] }>()

const slots = computed(() =>
  Array.from({ length: props.total }, (_, i) => props.placed[i] ?? null),
)
</script>

<template>
  <div
    class="sg-bed"
    role="group"
    :aria-label="label"
    :class="{ 'sg-bed--right': verdict === true, 'sg-bed--wrong': verdict === false }"
  >
    <component
      :is="card ? 'button' : 'div'"
      v-for="(card, i) in slots"
      :key="i"
      :type="card ? 'button' : undefined"
      class="sg-bed__slot"
      :class="{ 'sg-bed__slot--filled': !!card }"
      @click="card && $emit('remove', i)"
    >
      <SentenceCard v-if="card" :text="card.text" />
    </component>
  </div>
</template>

<style scoped>
.sg-bed { display: flex; flex-wrap: wrap; gap: 10px; min-height: 56px; }
.sg-bed__slot {
  min-width: 56px; min-height: 50px; display: flex; align-items: center; justify-content: center;
  border: 2px dashed var(--border); background: none; padding: 4px; font: inherit;
}
.sg-bed__slot--filled { border-style: solid; cursor: pointer; }
.sg-bed--right .sg-bed__slot--filled { border-color: var(--mastery-tree, #5a8f3c); }
.sg-bed--wrong .sg-bed__slot--filled { border-color: var(--red, #c0392b); }
</style>

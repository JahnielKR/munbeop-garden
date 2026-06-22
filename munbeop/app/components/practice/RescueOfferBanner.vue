<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

interface Props {
  ko: string
}
const props = defineProps<Props>()
defineEmits<{ dismiss: [] }>()
const { t } = useI18n()

const to = computed(() => `/practice/rescue?ko=${encodeURIComponent(props.ko)}`)
</script>

<template>
  <div class="rescue-offer" data-testid="rescue-offer" role="note">
    <NuxtLink class="rescue-offer__cta" :to="to">{{ t('practice.rescue_offer') }}</NuxtLink>
    <button
      type="button"
      class="rescue-offer__dismiss"
      data-testid="rescue-offer-dismiss"
      @click="$emit('dismiss')"
    >
      {{ t('practice.rescue_offer_dismiss') }}
    </button>
  </div>
</template>

<style scoped>
.rescue-offer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 8px;
}
.rescue-offer__cta {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}
.rescue-offer__cta:hover {
  text-decoration: underline;
}
.rescue-offer__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
.rescue-offer__dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--ink-soft);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  cursor: pointer;
}
.rescue-offer__dismiss:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>

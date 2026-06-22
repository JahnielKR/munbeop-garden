<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'

interface Props {
  count: number
  hasMore: boolean
}
const props = defineProps<Props>()
const { t } = useI18n()

const shown = computed(() => `${props.count}${props.hasMore ? '+' : ''}`)
</script>

<template>
  <NuxtLink
    class="ready"
    data-testid="ready-to-revisit"
    to="/practice/ruleta?revisit=due"
    :aria-label="t('garden.ready.aria', { n: shown })"
  >
    {{ t('garden.ready.label', { n: shown }) }}
  </NuxtLink>
</template>

<style scoped>
.ready {
  align-self: center;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: var(--ink);
  text-decoration: none;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 999px;
  padding: 6px 14px;
  transition: background var(--motion-quick, 120ms) ease;
}
.ready:hover {
  background: var(--paper-deep);
}
.ready:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>

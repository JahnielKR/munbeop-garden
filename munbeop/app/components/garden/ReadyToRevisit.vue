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
  padding: 8px 12px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  line-height: 1.6;
  letter-spacing: 0.04em;
  color: var(--text);
  text-decoration: none;
  background: var(--surface-elevated);
  border: 2px solid var(--jade);
  box-shadow: var(--shadow-pixel-sm);
  transform: translate(0, 0);
  transition:
    background-color var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.ready:hover {
  background: var(--surface-hover);
  box-shadow: var(--shadow-pixel-md);
  transform: translate(-1px, -1px);
}
.ready:active {
  box-shadow: none;
  transform: translate(2px, 2px);
}
.ready:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

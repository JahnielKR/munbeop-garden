<script setup lang="ts">
import type { Context } from '~/lib/domain'

interface Props {
  context: Context
}
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <div class="ctx">
    <div class="ctx__row">
      <span class="ctx__label">{{ t('practice.context_label') }}</span>
      <span class="ctx__name">{{ context.name }}</span>
    </div>
    <div class="ctx__scene">{{ tl(context.scene) }}</div>
  </div>
</template>

<style scoped>
.ctx {
  padding: 12px 14px;
  background: color-mix(in oklch, var(--sky) 14%, var(--surface));
  border-left: 3px solid var(--sky);
  margin-bottom: 12px;
}
.ctx__row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 3px;
}
.ctx__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  color: var(--text-soft);
  letter-spacing: 0.15em;
}
.ctx__name {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: var(--text);
}
.ctx__scene {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
}
</style>

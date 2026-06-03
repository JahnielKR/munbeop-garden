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
  background: rgba(88, 144, 212, 0.08);
  border-left: 3px solid var(--sky);
  margin-bottom: 12px;
}
.ctx__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 3px;
}
.ctx__label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: var(--ink-soft);
  letter-spacing: 0.15em;
}
.ctx__name {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: var(--sky);
}
.ctx__scene {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
</style>

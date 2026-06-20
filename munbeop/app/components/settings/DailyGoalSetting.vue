<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'

const { t } = useI18n()
const settings = useSettingsStore()

function onInput(v: string) {
  const n = Number(v)
  if (Number.isFinite(n)) void settings.setDailyGoal(n)
}
</script>

<template>
  <section class="goal-set" :aria-label="t('settings.daily_goal.title')">
    <h2 class="goal-set__title">{{ t('settings.daily_goal.title') }}</h2>
    <Field :label="t('settings.daily_goal.label')" html-for="daily-goal">
      <Input
        id="daily-goal"
        type="number"
        inputmode="numeric"
        :model-value="String(settings.dailyGoal)"
        @update:model-value="onInput"
      />
    </Field>
    <p class="goal-set__hint">{{ t('settings.daily_goal.hint') }}</p>
  </section>
</template>

<style scoped>
.goal-set { display: flex; flex-direction: column; gap: 8px; }
.goal-set__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px; margin: 0; color: var(--ink);
}
.goal-set__hint { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); margin: 0; }
</style>

<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'

const { t } = useI18n()
const settings = useSettingsStore()

function onToggle(e: Event) {
  void settings.setReviewReminders((e.target as HTMLInputElement).checked)
}
</script>

<template>
  <section class="reminder-set" :aria-label="t('settings.review_reminders.title')">
    <h2 class="reminder-set__title">{{ t('settings.review_reminders.title') }}</h2>
    <label class="reminder-set__row">
      <input type="checkbox" :checked="settings.reviewReminders" @change="onToggle" />
      <span>{{ t('settings.review_reminders.label') }}</span>
    </label>
    <p class="reminder-set__hint">{{ t('settings.review_reminders.hint') }}</p>
  </section>
</template>

<style scoped>
.reminder-set { display: flex; flex-direction: column; gap: 8px; }
.reminder-set__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px; margin: 0; color: var(--ink);
}
.reminder-set__row { display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--ink); }
.reminder-set__hint { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-soft); margin: 0; }
</style>

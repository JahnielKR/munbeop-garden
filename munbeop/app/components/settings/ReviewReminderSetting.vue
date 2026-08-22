<script setup lang="ts">
import { useSettingsStore } from '~/stores/settings'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'

const { t } = useI18n()
const settings = useSettingsStore()

function onToggle(value: boolean) {
  void settings.setReviewReminders(value)
}
</script>

<template>
  <section class="reminder-set" :aria-label="t('settings.review_reminders.title')">
    <h2 class="reminder-set__title">{{ t('settings.review_reminders.title') }}</h2>
    <Field
      :label="t('settings.review_reminders.label')"
      html-for="review-reminders"
      orientation="horizontal"
      :hint="t('settings.review_reminders.hint')"
    >
      <Toggle
        id="review-reminders"
        :model-value="settings.reviewReminders"
        :label="t('settings.review_reminders.label')"
        @update:model-value="onToggle"
      />
    </Field>
  </section>
</template>

<style scoped>
.reminder-set {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reminder-set__title {
  font-family: var(--font-pixel-small);
  font-size: 13px;
  margin: 0;
  color: var(--ink);
}
</style>

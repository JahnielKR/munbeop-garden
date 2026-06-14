<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'
import ContextManager from '~/components/settings/ContextManager.vue'
const { t } = useI18n()
const { theme, setTheme } = useTheme()
const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => setTheme(v ? 'dark' : 'light'),
})
</script>

<template>
  <div class="page">
    <BilingualTitle ko="설정" :latin="t('title.settings')" />
    <div class="card">
      <LocaleSwitcher />
    </div>
    <div class="card">
      <Field
        :label="t('settings.dark_mode')"
        html-for="settings-dark-mode"
        orientation="horizontal"
      >
        <Toggle
          id="settings-dark-mode"
          v-model="isDark"
          :label="t('settings.dark_mode')"
        />
      </Field>
    </div>
    <div class="card card--wide">
      <ContextManager />
    </div>
    <div class="empty">{{ t('empty.settings') }}</div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.card {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 20px;
  max-width: 320px;
}
.card--wide {
  max-width: 560px;
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
</style>

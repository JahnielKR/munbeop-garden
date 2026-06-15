<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import AccountWidget from '~/components/layout/AccountWidget.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Field from '~/components/ui/Field.vue'
import Toggle from '~/components/ui/Toggle.vue'
import Button from '~/components/ui/Button.vue'
import SettingsTabs from '~/components/settings/SettingsTabs.vue'
import ContextManager from '~/components/settings/ContextManager.vue'
import AboutSection from '~/components/settings/AboutSection.vue'
import { useSettingsStore } from '~/stores/settings'
import { useDataExport } from '~/composables/useDataExport'

const { t } = useI18n()
const { theme } = useTheme()
const settings = useSettingsStore()
const { exportData } = useDataExport()

const isDark = computed<boolean>({
  get: () => theme.value === 'dark',
  set: (v) => {
    void settings.setTheme(v ? 'dark' : 'light')
  },
})

const TABS = [
  { id: 'account', labelKey: 'settings.tabs.account' },
  { id: 'appearance', labelKey: 'settings.tabs.appearance' },
  { id: 'learning', labelKey: 'settings.tabs.learning' },
  { id: 'data', labelKey: 'settings.tabs.data' },
  { id: 'about', labelKey: 'settings.tabs.about' },
]
const active = ref('account')
</script>

<template>
  <div class="page">
    <BilingualTitle ko="설정" :latin="t('title.settings')" />
    <SettingsTabs v-model="active" :tabs="TABS" />

    <section
      v-show="active === 'account'"
      id="panel-account"
      role="tabpanel"
      aria-labelledby="tab-account"
      class="panel"
    >
      <AccountWidget />
    </section>

    <section
      v-show="active === 'appearance'"
      id="panel-appearance"
      role="tabpanel"
      aria-labelledby="tab-appearance"
      class="panel"
    >
      <LocaleSwitcher />
      <Field
        :label="t('settings.dark_mode')"
        html-for="settings-dark-mode"
        orientation="horizontal"
      >
        <Toggle id="settings-dark-mode" v-model="isDark" :label="t('settings.dark_mode')" />
      </Field>
    </section>

    <section
      v-show="active === 'learning'"
      id="panel-learning"
      role="tabpanel"
      aria-labelledby="tab-learning"
      class="panel"
    >
      <ContextManager />
    </section>

    <section
      v-show="active === 'data'"
      id="panel-data"
      role="tabpanel"
      aria-labelledby="tab-data"
      class="panel"
    >
      <BilingualTitle ko="데이터" :latin="t('settings.data.title')" level="h2" />
      <Button size="sm" @click="exportData">{{ t('settings.data.export') }}</Button>
    </section>

    <section
      v-show="active === 'about'"
      id="panel-about"
      role="tabpanel"
      aria-labelledby="tab-about"
      class="panel"
    >
      <AboutSection />
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 640px;
}
.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 20px;
}
</style>

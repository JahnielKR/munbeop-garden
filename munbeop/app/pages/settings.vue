<script setup lang="ts">
import LocaleSwitcher from '~/components/layout/LocaleSwitcher.vue'
import AccountWidget from '~/components/layout/AccountWidget.vue'
import DangerZone from '~/components/settings/DangerZone.vue'
import AccountCredentials from '~/components/settings/AccountCredentials.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import SettingsTabs from '~/components/settings/SettingsTabs.vue'
import ThemePicker from '~/components/settings/ThemePicker.vue'
import ContextManager from '~/components/settings/ContextManager.vue'
import CustomGrammarManager from '~/components/settings/CustomGrammarManager.vue'
import DailyGoalSetting from '~/components/settings/DailyGoalSetting.vue'
import ReviewReminderSetting from '~/components/settings/ReviewReminderSetting.vue'
import AboutSection from '~/components/settings/AboutSection.vue'
import DataImport from '~/components/settings/DataImport.vue'
import AvatarPickerSetting from '~/components/settings/AvatarPickerSetting.vue'
import { useSettingsStore } from '~/stores/settings'
import { useDataExport } from '~/composables/useDataExport'

const { t } = useI18n()
const { theme } = useTheme()
const settings = useSettingsStore()
const { exportData } = useDataExport()

function onTheme(next: 'light' | 'dark' | 'system') {
  void settings.setTheme(next)
}

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
      <AvatarPickerSetting />
      <AccountWidget />
      <AccountCredentials />
      <DangerZone />
    </section>

    <section
      v-show="active === 'appearance'"
      id="panel-appearance"
      role="tabpanel"
      aria-labelledby="tab-appearance"
      class="panel"
    >
      <LocaleSwitcher />
      <div class="appearance-field">
        <span class="appearance-field__label">{{ t('settings.appearance.theme.label') }}</span>
        <ThemePicker :model-value="theme" @update:model-value="onTheme" />
      </div>
    </section>

    <section
      v-show="active === 'learning'"
      id="panel-learning"
      role="tabpanel"
      aria-labelledby="tab-learning"
      class="panel"
    >
      <DailyGoalSetting />
      <ReviewReminderSetting />
      <ContextManager />
      <CustomGrammarManager />
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
      <DataImport />
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
.appearance-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.appearance-field__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  color: var(--text-soft);
  text-transform: uppercase;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
</style>

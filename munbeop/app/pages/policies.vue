<script setup lang="ts">
// Policies — public info page reached from the welcome sidebar.
// Copy is localized via the `policies.*` i18n keys (8 locales). The bodies are
// a plain-language draft (see policies.draft_note), not final legal text.
import WelcomeSectionShell from '~/components/welcome/WelcomeSectionShell.vue'

definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()

// i18n key suffixes only — heading/body text lives in i18n per locale.
const policies = ['privacy', 'terms', 'cookies', 'contact'] as const
</script>

<template>
  <WelcomeSectionShell :title="t('policies.title')">
    <p class="lead">{{ t('policies.lead') }}</p>
    <p class="draft" role="note">{{ t('policies.draft_note') }}</p>
    <div class="stack">
      <section v-for="key in policies" :key="key" class="block">
        <h2 class="block__heading">{{ t(`policies.items.${key}.heading`) }}</h2>
        <p class="block__body">{{ t(`policies.items.${key}.body`) }}</p>
      </section>
    </div>
  </WelcomeSectionShell>
</template>

<style scoped>
.lead {
  font-size: 16px;
  color: var(--text-soft);
  margin: 0;
  max-width: 60ch;
  line-height: 1.5;
}
.draft {
  font-size: 13px;
  color: var(--text-soft);
  margin: 0;
  max-width: 60ch;
  line-height: 1.5;
  font-style: italic;
  opacity: 0.85;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.block {
  border: 3px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-cream);
  background: var(--paper-deep);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.block__heading {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 12px;
  color: var(--heading-accent);
  letter-spacing: 0.04em;
  margin: 0;
}
.block__body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text);
  line-height: 1.55;
  margin: 0;
  max-width: 70ch;
}
</style>

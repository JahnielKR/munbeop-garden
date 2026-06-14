<script setup lang="ts">
// Policies — public info page reached from the welcome sidebar.
// Placeholder policy sections for now.
//
// TODO(v8.1): replace each section body with the real legal text
// (privacy, terms, cookies, contact).
import WelcomeSectionShell from '~/components/welcome/WelcomeSectionShell.vue'

definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()

interface Policy {
  heading: string
  body: string
}

const policies: Policy[] = [
  {
    heading: 'Privacy',
    body: 'We store your email, your sentences, and your mastery progress, and sync them to your account so they follow you across devices. We do not sell your data.',
  },
  {
    heading: 'Terms',
    body: 'Be kind to the garden and to other learners. Don\'t reverse-engineer the app or use it to grow grammar you do not own. Cancel any time; your data is yours to take with you.',
  },
  {
    heading: 'Cookies',
    body: 'We use a tiny amount of local storage to remember your theme, your locale, and your welcome flag — no third-party trackers, no advertising cookies.',
  },
  {
    heading: 'Contact',
    body: 'Reach the gardener at hello@mungarden.app for any policy question. We aim to reply within two business days.',
  },
]
</script>

<template>
  <WelcomeSectionShell :title="t('policies.title')">
    <p class="lead">
      The short version: your data is yours, the garden does not sell
      it, and the gardener answers email.
    </p>
    <div class="stack">
      <section v-for="p in policies" :key="p.heading" class="block">
        <h2 class="block__heading">{{ p.heading }}</h2>
        <p class="block__body">{{ p.body }}</p>
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

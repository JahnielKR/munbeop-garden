<script setup lang="ts">
// Features — public info page reached from the welcome sidebar.
// Copy is localized via the `features.*` i18n keys (8 locales).
import WelcomeSectionShell from '~/components/welcome/WelcomeSectionShell.vue'

definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()

// Structure only — the glyph plus the i18n key suffix. The name/description
// text lives in i18n so all 8 UI locales render in the user's language.
const features = [
  { glyph: '🃏', key: 'deck' },
  { glyph: '🌱', key: 'mastery' },
  { glyph: '🦋', key: 'bomi' },
  { glyph: '🌍', key: 'languages' },
  { glyph: '☁️', key: 'sync' },
  { glyph: '🌙', key: 'themes' },
] as const
</script>

<template>
  <WelcomeSectionShell :title="t('features.title')">
    <p class="lead">{{ t('features.lead') }}</p>
    <div class="grid">
      <article v-for="f in features" :key="f.key" class="card">
        <span class="card__glyph" aria-hidden="true">{{ f.glyph }}</span>
        <h2 class="card__name">{{ t(`features.items.${f.key}.name`) }}</h2>
        <p class="card__desc">{{ t(`features.items.${f.key}.desc`) }}</p>
      </article>
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}
.card {
  border: 3px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-cream);
  background: var(--paper-deep);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card__glyph {
  font-size: 28px;
  line-height: 1;
}
.card__name {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 12px;
  color: var(--heading-accent);
  letter-spacing: 0.04em;
  margin: 0;
}
.card__desc {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text);
  line-height: 1.55;
  margin: 0;
}
</style>

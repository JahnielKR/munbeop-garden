<script setup lang="ts">
// Features — public info page reached from the welcome sidebar.
// Placeholder feature blocks for now.
//
// TODO(v8.1): swap copy + iconography for the real feature list.
import WelcomeSectionShell from '~/components/welcome/WelcomeSectionShell.vue'

definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()

interface Feature {
  glyph: string
  name: string
  description: string
}

const features: Feature[] = [
  {
    glyph: '🎲',
    name: 'Grammar wheel',
    description: 'Spin three grammar points across three contexts — nine sentences per session, never the same twice.',
  },
  {
    glyph: '🌱',
    name: 'Mastery growth',
    description: 'Every save nudges a grammar point from sprout to plant to tree. Watch the garden grow as you practice.',
  },
  {
    glyph: '🦋',
    name: 'Bomi the mascot',
    description: 'A pixel companion that bobs, thinks, plays, and sleeps based on how you use the app.',
  },
  {
    glyph: '🌍',
    name: 'Eight languages',
    description: 'UI in English, Spanish, French, Portuguese, Thai, Indonesian, Vietnamese, and Japanese.',
  },
  {
    glyph: '☁️',
    name: 'Cross-device sync',
    description: 'Sign in once and your sentences, mastery, and contexts follow you across phone and desktop.',
  },
  {
    glyph: '🌙',
    name: 'Day & night themes',
    description: 'A warm parchment scheme for the day, an abyssal-blue forest for the night. Switch any time.',
  },
]
</script>

<template>
  <WelcomeSectionShell :title="t('features.title')">
    <p class="lead">
      Every tool the garden ships with — small focused pieces, all
      pointed at one goal: making Korean grammar stick.
    </p>
    <div class="grid">
      <article v-for="f in features" :key="f.name" class="card">
        <span class="card__glyph" aria-hidden="true">{{ f.glyph }}</span>
        <h2 class="card__name">{{ f.name }}</h2>
        <p class="card__desc">{{ f.description }}</p>
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

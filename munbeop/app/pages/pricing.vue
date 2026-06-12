<script setup lang="ts">
// Plans & Pricing — public info page reached from the welcome
// sidebar. Placeholder tier cards for now; copy lands in a later
// pass.
//
// TODO(v8.1): replace tier copy + numbers with the real offer.
import WelcomeSectionShell from '~/components/welcome/WelcomeSectionShell.vue'

definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()

interface Tier {
  name: string
  price: string
  cadence: string
  bullets: string[]
  featured?: boolean
}

const tiers: Tier[] = [
  {
    name: 'Sprout',
    price: 'Free',
    cadence: 'forever',
    bullets: ['Local-only progress', 'Full grammar card decks', '8 UI languages'],
  },
  {
    name: 'Grove',
    price: '$4',
    cadence: '/ month',
    bullets: ['Cross-device sync', 'Deeper stats', 'Backup & restore'],
    featured: true,
  },
  {
    name: 'Forest',
    price: '$49',
    cadence: 'one time',
    bullets: ['All Grove features', 'Lifetime access', 'Future expansions'],
  },
]
</script>

<template>
  <WelcomeSectionShell :title="t('pricing.title')">
    <p class="lead">
      Pick the plan that matches your grammar journey. Cancel any time.
    </p>
    <div class="tiers">
      <article
        v-for="tier in tiers"
        :key="tier.name"
        class="tier"
        :class="{ 'tier--featured': tier.featured }"
      >
        <h2 class="tier__name">{{ tier.name }}</h2>
        <p class="tier__price">
          <span class="tier__price-amount">{{ tier.price }}</span>
          <span class="tier__price-cadence">{{ tier.cadence }}</span>
        </p>
        <ul class="tier__bullets">
          <li v-for="b in tier.bullets" :key="b">{{ b }}</li>
        </ul>
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
.tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}
.tier {
  border: 3px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-cream);
  background: var(--paper-deep);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.tier--featured {
  border-color: var(--accent);
  box-shadow: 4px 4px 0 var(--accent);
}
.tier__name {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 14px;
  color: var(--text);
  letter-spacing: 0.04em;
  margin: 0;
}
.tier__price {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.tier__price-amount {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 24px;
  color: var(--heading-accent);
}
.tier__price-cadence {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-soft);
}
.tier__bullets {
  margin: 0;
  padding-left: 18px;
  color: var(--text);
  font-size: 14px;
  line-height: 1.55;
}
.tier__bullets li {
  margin-bottom: 4px;
}
</style>

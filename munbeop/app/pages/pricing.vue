<script setup lang="ts">
// Plans & Pricing — public info page reached from the welcome sidebar.
// Tier copy is localized via the `pricing.*` i18n keys (8 locales). The tiers
// are still a placeholder offer (nothing is charged yet — see pricing.beta_note);
// real billing/entitlement lands with the free/premium split.
import WelcomeSectionShell from '~/components/welcome/WelcomeSectionShell.vue'

definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()

// Structure only (key, brand name, price numeral, emphasis). Cadence + bullets
// resolve from i18n in the template so all 8 locales render in-language. A null
// price renders the localized "Free" label.
const tiers = [
  { key: 'sprout', name: 'Sprout', price: null, featured: false },
  { key: 'grove', name: 'Grove', price: '$4', featured: true },
  { key: 'forest', name: 'Forest', price: '$49', featured: false },
] as const
</script>

<template>
  <WelcomeSectionShell :title="t('pricing.title')">
    <p class="lead">{{ t('pricing.lead') }}</p>
    <div class="tiers">
      <article
        v-for="tier in tiers"
        :key="tier.key"
        class="tier"
        :class="{ 'tier--featured': tier.featured }"
      >
        <h2 class="tier__name">{{ tier.name }}</h2>
        <p class="tier__price">
          <span class="tier__price-amount">{{ tier.price ?? t('pricing.free') }}</span>
          <span class="tier__price-cadence">{{ t(`pricing.tiers.${tier.key}.cadence`) }}</span>
        </p>
        <ul class="tier__bullets">
          <li v-for="n in 3" :key="n">{{ t(`pricing.tiers.${tier.key}.b${n}`) }}</li>
        </ul>
      </article>
    </div>
    <p class="beta-note" role="note">{{ t('pricing.beta_note') }}</p>
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
.beta-note {
  font-size: 13px;
  color: var(--text-soft);
  margin: 0;
  max-width: 60ch;
  line-height: 1.5;
  font-style: italic;
  opacity: 0.85;
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

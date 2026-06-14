<script setup lang="ts">
import { NuxtLink } from '#components'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'

const { t } = useI18n()

const links = [
  { to: '/policies', labelKey: 'welcome.menu.policies' },
  { to: '/pricing', labelKey: 'welcome.menu.pricing' },
  { to: '/features', labelKey: 'welcome.menu.features' },
] as const
</script>

<template>
  <section class="about" :aria-label="t('settings.about.title')">
    <BilingualTitle ko="정보" :latin="t('settings.about.title')" level="h2" />
    <ul class="about__list">
      <li v-for="link in links" :key="link.to">
        <NuxtLink :to="link.to" class="about__link">{{ t(link.labelKey) }}</NuxtLink>
      </li>
      <li>
        <a class="about__link" href="mailto:hello@mungarden.app">{{ t('settings.about.contact') }}</a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.about__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.about__link {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text);
  text-decoration: none;
}
.about__link:hover {
  color: var(--heading-accent);
  text-decoration: underline;
}
.about__link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

<script setup lang="ts">
// The three info-page links that drop into the welcome sidebar,
// below WelcomeAuthOptions. Each click closes the sidebar first
// (via the `navigate` emit, handled by WelcomePanel) and then
// routes — the 200ms delay gives subidaCompuerta visible runway
// before the CameraStage pan fires, so the user sees the menu
// rise back up the way it came AND the camera slide right into
// the new section.

import { useRouter } from '#imports'

const emit = defineEmits<{ navigate: [] }>()

const { t } = useI18n()
const router = useRouter()

interface NavLink {
  path: string
  labelKey: string
}

const links: NavLink[] = [
  { path: '/pricing', labelKey: 'welcome.menu.pricing' },
  { path: '/features', labelKey: 'welcome.menu.features' },
  { path: '/policies', labelKey: 'welcome.menu.policies' },
]

function go(path: string) {
  emit('navigate')
  // Match the subidaCompuerta duration roughly so the sidebar has
  // visibly started its rise before the camera pan begins.
  setTimeout(() => { void router.push(path) }, 200)
}
</script>

<template>
  <nav class="nav" :aria-label="t('welcome.menu.section_info')">
    <p class="nav__heading">{{ t('welcome.menu.section_info') }}</p>
    <button
      v-for="link in links"
      :key="link.path"
      type="button"
      class="nav__link"
      @click="go(link.path)"
    >
      <span class="nav__arrow" aria-hidden="true">▶</span>
      <span>{{ t(link.labelKey) }}</span>
    </button>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.nav__heading {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--text-soft);
  margin: 0;
  padding-top: 4px;
  border-top: 2px dashed var(--ink-line);
  padding-top: 14px;
}
.nav__link {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--paper);
  border: 3px solid var(--ink-line);
  box-shadow: 3px 3px 0 var(--shadow-cream);
  color: var(--text);
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-align: left;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}
.nav__link:hover {
  background: var(--hover-bg);
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--shadow-cream);
}
.nav__link:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--shadow-cream);
}
.nav__link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.nav__arrow { color: var(--sky-deep); }
</style>

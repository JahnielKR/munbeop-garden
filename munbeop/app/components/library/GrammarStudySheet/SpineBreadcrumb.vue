<script setup lang="ts">
/**
 * Curriculum breadcrumb for the study sheet — shows where a grammar sits in the
 * TOPIK spine ("TOPIK 2 › theme") or which transversal section it belongs to.
 * The level links to /paths (the progression view). Renders nothing for grammar
 * that isn't in the spine (e.g. user custom grammar).
 */
import { computed } from 'vue'
import { spineContextOf } from '~/lib/library/spine-context'
import { themeTitleKey } from '~/lib/garden'
import { NuxtLink } from '#components'

const props = defineProps<{ ko: string }>()
const { t } = useI18n()

const ctx = computed(() => spineContextOf(props.ko))

// Transversal sections → their i18n label key. Keyed by GrammarSource.kind.
const SECTION_KEY = {
  auxiliaries: 'library.spine.section.auxiliaries',
  indirectSpeech: 'library.spine.section.indirectSpeech',
  additional: 'library.spine.section.additional',
  complementary: 'library.spine.section.complementary',
} as const

/** Localized label for a transversal (non-TOPIK) section; '' otherwise. */
const sectionLabel = computed(() => {
  const c = ctx.value
  return c && c.kind !== 'topik' ? t(SECTION_KEY[c.kind]) : ''
})
</script>

<template>
  <nav v-if="ctx" class="crumb" :aria-label="t('library.spine.label')">
    <template v-if="ctx.kind === 'topik'">
      <NuxtLink class="crumb__level" to="/paths">{{ t('garden.level', { n: ctx.level }) }}</NuxtLink>
      <span class="crumb__sep" aria-hidden="true">›</span>
      <!-- Theme name follows the UI locale (i18n keyed by themeId); the spine's
           themeTitle is fixed Spanish metadata, not a display string. -->
      <span class="crumb__theme">{{ t(themeTitleKey(ctx.themeId)) }}</span>
    </template>
    <span v-else class="crumb__theme">{{ sectionLabel }}</span>
  </nav>
</template>

<style scoped>
.crumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 8px;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}
.crumb__level {
  color: var(--link);
  text-decoration: none;
}
.crumb__level:hover {
  text-decoration: underline;
}
.crumb__level:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.crumb__sep {
  color: var(--ink-line);
}
.crumb__theme {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 11px;
  letter-spacing: normal;
}
</style>

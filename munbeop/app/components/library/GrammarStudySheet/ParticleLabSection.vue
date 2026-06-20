<script setup lang="ts">
import { computed } from 'vue'
import type { Grammar } from '~/lib/domain'
import { PARTICLES } from '~/seed/particles'

/** Shown only for grammars that exist in the Particle Lab catalog. */
interface Props {
  grammar: Grammar
}
const props = defineProps<Props>()
const { t } = useI18n()
const router = useRouter()

const particle = computed(() => PARTICLES.find((p) => p.grammarKo === props.grammar.ko))

async function open() {
  if (!particle.value) return
  await router.push({
    path: '/practice/particles',
    query: { mode: 'explore', focus: particle.value.id },
  })
}
</script>

<template>
  <section v-if="particle" class="lab-cta">
    <h3 class="lab-cta__title">{{ t('particles.sheet_section_title') }}</h3>
    <p class="lab-cta__body">{{ t('particles.sheet_section_body') }}</p>
    <button type="button" class="lab-cta__btn" data-testid="open-particle-lab" @click="open">
      🧩 {{ t('particles.sheet_section_cta') }}
    </button>
  </section>
</template>

<style scoped>
.lab-cta {
  border: 2px solid var(--ink-line);
  background: var(--paper);
  padding: 12px 14px;
  margin-top: 16px;
}
.lab-cta__title {
  margin: 0 0 6px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text);
  text-transform: uppercase;
}
.lab-cta__body {
  margin: 0 0 10px;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  line-height: 1.6;
}
.lab-cta__btn {
  width: 100%;
  padding: 10px 14px;
  background: var(--gold);
  color: var(--always-dark);
  border: 3px solid var(--ink-line);
  box-shadow: 4px 4px 0 var(--shadow-cream);
  font-family: var(--font-pixel-small);
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.lab-cta__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 var(--shadow-cream);
}
.lab-cta__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
</style>

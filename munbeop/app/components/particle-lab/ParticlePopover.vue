<script setup lang="ts">
import { computed } from 'vue'
import type { ParticleId } from '~/lib/domain'
import Modal from '~/components/ui/Modal.vue'
import Badge from '~/components/ui/Badge.vue'
import { useLocalized } from '~/composables/useLocalized'
import { useGrammarStore } from '~/stores/grammar'
import { particleById } from '~/seed/particles'

/**
 * Full particle info: role, hint, allomorph rule, link to the study sheet.
 * Reuses the Modal primitive (teleport + focus trap + Esc).
 */
interface Props {
  particleId: ParticleId | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()
const router = useRouter()
const grammarStore = useGrammarStore()

const def = computed(() => (props.particleId ? particleById(props.particleId) : undefined))
const hasAllomorphs = computed(
  () => def.value !== undefined && def.value.afterConsonant !== def.value.afterVowel,
)
const hasSheet = computed(
  () => def.value !== undefined && grammarStore.grammarByKo(def.value.grammarKo) !== undefined,
)
const badgeVariant = computed(() => {
  switch (def.value?.role) {
    case 'topic': return 'gold'
    case 'subject': return 'jade'
    case 'object': return 'sky'
    case 'place': return 'red'
    case 'recipient': return 'plum'
    case 'means': return 'teal'
    case 'connective': return 'rose'
    default: return 'soft'
  }
})

async function openSheet() {
  if (!def.value) return
  emit('close')
  await router.push({ path: '/library', query: { grammar: def.value.grammarKo } })
}
</script>

<template>
  <Modal
    :open="def !== undefined"
    :close-label="t('particles.popover.close')"
    :title="def?.ko"
    labelledby="particle-popover-ko"
    @close="emit('close')"
  >
    <div v-if="def" class="popover" data-testid="particle-popover">
      <div class="popover__head">
        <span id="particle-popover-ko" class="popover__ko" lang="ko">{{ def.ko }}</span>
        <Badge :variant="badgeVariant">{{ tl(def.label) }}</Badge>
      </div>

      <p class="popover__hint">{{ tl(def.hint) }}</p>

      <h4 class="popover__rule-title">{{ t('particles.popover.forms_label') }}</h4>
      <ul v-if="hasAllomorphs" class="popover__rules">
        <li lang="ko">
          <strong>{{ def.afterConsonant }}</strong>
          <span class="popover__rule-note">← {{ t('particles.popover.after_consonant') }}</span>
        </li>
        <li lang="ko">
          <strong>{{ def.afterVowel }}</strong>
          <span class="popover__rule-note">← {{ t('particles.popover.after_vowel') }}</span>
        </li>
      </ul>
      <p v-else class="popover__rules popover__rule-note">
        {{ t('particles.popover.single_form') }}
      </p>

      <button v-if="hasSheet" type="button" class="popover__cta" @click="openSheet">
        📖 {{ t('particles.popover.see_sheet') }}
      </button>
    </div>
  </Modal>
</template>

<style scoped>
.popover__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.popover__ko {
  font-family: var(--font-ko);
  font-size: 28px;
  font-weight: 900;
  color: var(--heading-accent);
}
.popover__hint {
  margin: 0 0 16px;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text);
  line-height: 1.7;
}
.popover__rule-title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.popover__rules {
  margin: 0 0 16px;
  padding: 10px 12px;
  list-style: none;
  background: var(--paper);
  border-left: 4px solid var(--gold);
  font-family: var(--font-ko);
  font-size: var(--text-md);
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.popover__rule-note {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  margin-left: 6px;
}
.popover__cta {
  width: 100%;
  padding: 12px 16px;
  background: var(--jade);
  color: var(--always-dark);
  border: 3px solid var(--ink-line);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.popover__cta:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.popover__cta:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-button-pressed);
}
.popover__cta:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
</style>

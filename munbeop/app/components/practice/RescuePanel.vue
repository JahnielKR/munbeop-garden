<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ErrorDimension, Grammar, LocalizedString } from '~/lib/domain'
import { notesFor } from '~/lib/usage-notes'
import ExamplesSection from '~/components/library/GrammarStudySheet/ExamplesSection.vue'
import ConfusedWithSection from '~/components/library/GrammarStudySheet/ConfusedWithSection.vue'
import type { RescueStage } from '~/composables/useRescueDrill'

interface Props {
  grammar: Grammar
  stage: RescueStage
  dominantDimension: ErrorDimension | null
  isLast: boolean
  canBack: boolean
}
const props = defineProps<Props>()
defineEmits<{ next: []; back: []; produce: []; navigate: [ko: string] }>()
const { t } = useI18n()
const { tl } = useLocalized()
const root = ref<HTMLElement | null>(null)

const header = computed(() =>
  props.dominantDimension
    ? t('rescue.header', { dimension: t(`dimension.${props.dominantDimension}`) })
    : t('rescue.header_plain'),
)

// Usage notes by ko (same lookup the study sheet uses), not off the Grammar
// object. Async: notesFor loads the grammar's TOPIK-level seed chunk on demand.
const usageNotes = ref<LocalizedString | undefined>(undefined)
watch(
  () => [props.grammar.ko, props.grammar.deckId] as const,
  async ([ko, deckId]) => {
    // Never show the previous grammar's note while the new seed chunk loads.
    usageNotes.value = undefined
    let result: LocalizedString | undefined
    try {
      result = await notesFor(ko, deckId)
    } catch {
      // A failed lazy chunk should leave this optional note empty, not surface
      // an unhandled Vue watcher rejection or break the rescue flow.
      return
    }
    // Ignore a stale resolve if the grammar changed while the chunk loaded.
    if (props.grammar.ko === ko && props.grammar.deckId === deckId) usageNotes.value = result
  },
  { immediate: true },
)

function focusPanel(): void {
  root.value?.focus({ preventScroll: true })
}
onMounted(focusPanel)

watch(
  () => [props.grammar.ko, props.stage] as const,
  async () => {
    await nextTick()
    focusPanel()
  },
  { flush: 'post' },
)
</script>

<template>
  <section
    ref="root"
    tabindex="-1"
    class="rescue"
    data-testid="rescue-panel"
    aria-labelledby="rescue-panel-title"
  >
    <header class="rescue__head">
      <h2 id="rescue-panel-title" class="rescue__title">{{ t('rescue.title') }}</h2>
      <p class="rescue__sub">{{ header }}</p>
      <p class="rescue__stage" lang="ko">{{ t(`rescue.stage_${stage}`) }}</p>
    </header>

    <div v-if="stage === 'reread'" class="rescue__reread">
      <p class="rescue__ko" lang="ko">{{ grammar.ko }}</p>
      <p class="rescue__meaning">{{ tl(grammar.meaning) }}</p>
      <p v-if="usageNotes" class="rescue__notes">{{ tl(usageNotes) }}</p>
    </div>

    <ExamplesSection
      v-else-if="stage === 'examples'"
      :grammar="grammar"
      include-canonical-fallback
    />

    <ConfusedWithSection
      v-else-if="stage === 'discriminate'"
      :grammar="grammar"
      @navigate="$emit('navigate', $event)"
    />

    <div v-else class="rescue__produce">
      <p class="rescue__produce-body">{{ t('rescue.produce_body') }}</p>
      <button type="button" class="rescue__cta" data-testid="rescue-produce" @click="$emit('produce')">
        {{ t('rescue.produce_cta') }}
      </button>
    </div>

    <nav class="rescue__nav">
      <button
        v-if="canBack"
        type="button"
        class="rescue__nav-btn"
        data-testid="rescue-back"
        @click="$emit('back')"
      >
        {{ t('rescue.back') }}
      </button>
      <button
        v-if="stage !== 'produce'"
        type="button"
        class="rescue__nav-btn rescue__nav-btn--primary"
        data-testid="rescue-next"
        @click="$emit('next')"
      >
        {{ t('rescue.next') }}
      </button>
    </nav>
  </section>
</template>

<style scoped>
.rescue {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 18px;
  outline: 3px solid transparent;
  outline-offset: 3px;
}
.rescue:focus {
  outline-color: var(--focus-ring, var(--sky));
}
.rescue__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rescue__title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}
.rescue__sub {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
}
.rescue__stage {
  margin: 4px 0 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--jade, #3f9d6b);
}
.rescue__reread {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rescue__ko {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}
.rescue__meaning {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
  line-height: 1.5;
}
.rescue__notes {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.6;
  white-space: pre-line;
}
.rescue__produce {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rescue__produce-body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
}
.rescue__cta {
  align-self: flex-start;
  padding: 8px 16px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 2px solid var(--ink-line);
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.rescue__nav {
  display: flex;
  gap: 10px;
}
.rescue__nav-btn {
  padding: 7px 16px;
  background: var(--paper);
  border: 1.5px solid var(--border);
  border-radius: 999px;
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.rescue__nav-btn--primary {
  border-color: var(--jade, #3f9d6b);
}
.rescue__cta:focus-visible,
.rescue__nav-btn:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>

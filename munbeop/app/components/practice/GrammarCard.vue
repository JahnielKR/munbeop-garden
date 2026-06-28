<script setup lang="ts">
import type { Context, ErrorDimension, Grammar } from '~/lib/domain'
import { isKoreanSentence } from '~/lib/korean/script'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import Badge from '~/components/ui/Badge.vue'
import Card from '~/components/ui/Card.vue'
import ContextDisplay from './ContextDisplay.vue'
import ProgressDots from './ProgressDots.vue'
import SentenceInput from './SentenceInput.vue'
import FeedbackRow from './FeedbackRow.vue'
import ErrorNoteBlock from './ErrorNoteBlock.vue'
import MasteryIcon from './MasteryIcon.vue'

interface Props {
  grammar: Grammar
  context: Context
  progress: number
  pickIndex: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [
    {
      pickIndex: number
      sentence: string
      feedback: 'easy' | 'hard'
      errorNote: string | null
      errorDimension: ErrorDimension | null
    },
  ]
}>()

const srs = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()
const masteryLevel = computed(() => srs.peek(props.grammar.ko).mastery)
const masteryInfo = computed(() => getMasteryInfo(masteryLevel.value))

const sentence = ref('')
const showErrorBlock = ref(false)
const errorNote = ref('')
const errorDimension = ref<ErrorDimension | null>(null)
// The produced sentence must be Korean (Hangul + numbers/punctuation are fine;
// other alphabets are not). Validated only on save attempt — pressing a save
// action with non-Korean text raises this flag and aborts the save. The note
// field (ErrorNoteBlock) stays multilingual by design and is never checked.
const showKoreanError = ref(false)
// Clear the warning the moment the learner starts correcting the text.
watch(sentence, () => {
  showKoreanError.value = false
})

/**
 * Gate every save path: returns true when the trimmed sentence is Korean.
 * On failure it raises the red warning and the caller must abort (no emit,
 * no advance) so a non-Korean sentence can never be saved.
 */
function passesKoreanGate(text: string): boolean {
  if (isKoreanSentence(text)) return true
  showKoreanError.value = true
  return false
}
// The example is a crutch: hidden until the learner asks for it, so they try
// producing the sentence from the grammar+meaning first. Lives outside reset()
// on purpose — it's per-grammar (this card spans 3 contexts), so once revealed
// it stays revealed for the remaining contexts of the same card; the next card
// is a fresh instance and starts hidden again.
const showExample = ref(false)

function reset() {
  sentence.value = ''
  showErrorBlock.value = false
  errorNote.value = ''
  errorDimension.value = null
  showKoreanError.value = false
}

function onEasy() {
  const text = sentence.value.trim()
  if (!text) return
  if (!passesKoreanGate(text)) return
  emit('submit', {
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'easy',
    errorNote: null,
    errorDimension: null,
  })
  reset()
}
function onHard() {
  const text = sentence.value.trim()
  if (!text) return
  if (!passesKoreanGate(text)) return
  showErrorBlock.value = true
}
function onSaveWithNote() {
  const text = sentence.value.trim()
  if (!text) return
  if (!passesKoreanGate(text)) return
  emit('submit', {
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'hard',
    errorNote: errorNote.value.trim(),
    errorDimension: errorDimension.value,
  })
  reset()
}
function onSkipNote() {
  const text = sentence.value.trim()
  if (!text) return
  if (!passesKoreanGate(text)) return
  emit('submit', {
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'hard',
    errorNote: null,
    errorDimension: errorDimension.value,
  })
  reset()
}
</script>

<template>
  <!-- gold = "the action happens here"; jade is reserved for success states -->
  <Card accent="gold">
    <div class="header">
      <div class="ko">{{ grammar.ko }}</div>
      <Badge size="md">
        <MasteryIcon :level="masteryLevel" :size="12" />
        <span>{{ t(masteryInfo.labelKey) }}</span>
      </Badge>
    </div>
    <div class="meaning">{{ tl(grammar.meaning) }}</div>
    <div v-if="grammar.example" class="example-block">
      <button
        type="button"
        class="example-toggle"
        :aria-expanded="showExample"
        @click="showExample = !showExample"
      >
        {{ showExample ? t('practice.hide_example') : t('practice.show_example') }}
      </button>
      <div v-if="showExample" class="example-reveal">
        <div class="example">{{ grammar.example }}</div>
        <div v-if="grammar.trans" class="trans">{{ tl(grammar.trans) }}</div>
      </div>
    </div>

    <ProgressDots :total="3" :progress="progress" />
    <ContextDisplay :context="context" />
    <SentenceInput v-model="sentence" :error="showKoreanError" />
    <p v-if="showKoreanError" class="sentence-error" role="alert">
      {{ t('practice.sentence_korean_only') }}
    </p>
    <FeedbackRow :disabled="!sentence.trim()" @easy="onEasy" @hard="onHard" />
    <ErrorNoteBlock
      v-if="showErrorBlock"
      v-model="errorNote"
      v-model:dimension="errorDimension"
      @save="onSaveWithNote"
      @skip="onSkipNote"
    />
  </Card>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
}
.ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: var(--ink);
}
.meaning {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  margin: 8px 0 12px;
  font-size: 15px;
}
/* Save-time warning when the sentence isn't Korean. Sits between the input
 * and the feedback buttons; the Korean tail of the copy stays Korean in every
 * locale (brand convention). */
.sentence-error {
  margin: 8px 0 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--danger, var(--red));
}
.example-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}
/* Deliberately a quiet, secondary affordance (dashed, ink-soft, Inter) — it's
 * an opt-in hint, not a primary action competing with the sentence input. */
.example-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  color: var(--ink-soft);
  background: transparent;
  border: 2px dashed var(--border-strong);
  cursor: pointer;
  transition:
    background-color var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.example-toggle:hover {
  background: var(--surface);
  color: var(--ink);
}
.example-toggle:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.example {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
}
.trans {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  margin-top: 4px;
}
</style>

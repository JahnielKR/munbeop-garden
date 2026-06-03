<script setup lang="ts">
import type { Context, Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
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
    },
  ]
}>()

const srs = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()
const masteryLevel = computed(() => srs.ensure(props.grammar.ko).mastery)
const masteryInfo = computed(() => getMasteryInfo(masteryLevel.value))

const sentence = ref('')
const showErrorBlock = ref(false)
const errorNote = ref('')

function reset() {
  sentence.value = ''
  showErrorBlock.value = false
  errorNote.value = ''
}

function onEasy() {
  const text = sentence.value.trim()
  if (!text) return
  emit('submit', {
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'easy',
    errorNote: null,
  })
  reset()
}
function onHard() {
  if (!sentence.value.trim()) return
  showErrorBlock.value = true
}
function onSaveWithNote() {
  const text = sentence.value.trim()
  if (!text) return
  emit('submit', {
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'hard',
    errorNote: errorNote.value.trim(),
  })
  reset()
}
function onSkipNote() {
  const text = sentence.value.trim()
  if (!text) return
  emit('submit', {
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'hard',
    errorNote: null,
  })
  reset()
}
</script>

<template>
  <Card accent="jade">
    <div class="header">
      <div class="ko">{{ grammar.ko }}</div>
      <div class="mastery">
        <MasteryIcon :level="masteryLevel" :size="12" />
        <span>{{ t(masteryInfo.labelKey) }}</span>
      </div>
    </div>
    <div class="meaning">{{ tl(grammar.meaning) }}</div>
    <div v-if="grammar.example" class="example">{{ grammar.example }}</div>
    <div v-if="grammar.trans" class="trans">{{ tl(grammar.trans) }}</div>

    <ProgressDots :total="3" :progress="progress" />
    <ContextDisplay :context="context" />
    <SentenceInput v-model="sentence" />
    <FeedbackRow @easy="onEasy" @hard="onHard" />
    <ErrorNoteBlock
      v-if="showErrorBlock"
      v-model="errorNote"
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
.mastery {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--ink-soft);
}
.meaning {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  margin: 8px 0 12px;
  font-size: 15px;
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

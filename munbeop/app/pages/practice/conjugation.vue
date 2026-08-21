<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import PracticeSaveStatus from '~/components/practice/PracticeSaveStatus.vue'
import DrillClassPicker from '~/components/conjugation-drill/DrillClassPicker.vue'
import ConjugationCard from '~/components/conjugation-drill/ConjugationCard.vue'
import ConjugationSummary from '~/components/conjugation-drill/ConjugationSummary.vue'
import ConjugationMasterStrip from '~/components/conjugation-drill/ConjugationMasterStrip.vue'
import ConjugationMasterCelebration from '~/components/conjugation-drill/ConjugationMasterCelebration.vue'
import { useConjugationDrill } from '~/composables/useConjugationDrill'
import { useConjugationMaster } from '~/composables/useConjugationMaster'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { classById, type DrillClassId } from '~/lib/conjugation-drill'
import type { VerbClass } from '~/lib/korean'
import type { PracticeSaveStatus as SaveStatus } from '~/lib/practice/persistence'

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const rawInitial = typeof route.query.set === 'string' ? route.query.set : null
const initial = (rawInitial && classById(rawInitial) ? rawInitial : 'mixed') as DrillClassId
const drill = useConjugationDrill(initial)
const master = useConjugationMaster()
const started = ref(false)

const overallSaveStatus = computed<SaveStatus>(() => {
  if (master.saveStatus.value === 'saving' || master.saveStatus.value === 'error') {
    return master.saveStatus.value
  }
  if (drill.saveStatus.value === 'saving' || drill.saveStatus.value === 'error') {
    return drill.saveStatus.value
  }
  if (master.saveStatus.value === 'saved') return 'saved'
  return drill.saveStatus.value
})
const persistenceLocked = computed(() => (
  overallSaveStatus.value === 'saving' || overallSaveStatus.value === 'error'
))

useGameLeaveGuard(() => started.value && (
  drill.phase.value !== 'done' || persistenceLocked.value
))

function begin(id: DrillClassId) {
  if (persistenceLocked.value || !master.resetSaveStatus()) return
  drill.selectClass(id)
  void router.replace({ query: { ...route.query, set: id } })
  drill.start()
  started.value = true
}

function changeClass() {
  if (persistenceLocked.value || drill.phase.value !== 'done') return
  started.value = false
  const query = { ...route.query }
  delete query.set
  void router.replace({ query })
}

async function onNext() {
  await drill.next()
  if (drill.phase.value === 'done' && drill.mode.value === 'normal' && drill.selectedClassId.value !== 'mixed') {
    await master.recordRound(drill.selectedClassId.value as VerbClass, drill.score.value.accuracy)
  }
}

function restart() {
  if (persistenceLocked.value || !master.resetSaveStatus()) return
  drill.start()
}
function onReplayFailed() {
  if (persistenceLocked.value || !master.resetSaveStatus()) return
  drill.replayFailed()
}
async function retrySave() {
  if (drill.saveStatus.value === 'error') await drill.retrySave()
  else await master.retrySave()
}

if (rawInitial && classById(rawInitial) && initial !== 'mixed') begin(initial)

onMounted(() => {
  // An unknown ?set= is a picker state, never a hidden mixed round.
  if (rawInitial && !classById(rawInitial)) {
    const query = { ...route.query }
    delete query.set
    void router.replace({ query })
  }
})
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="활용 연습" :latin="t('conjugation.title')" />
    <PracticeHelp mode="conjugation" />
    <p class="lab__lead">{{ t('conjugation.lead') }}</p>

    <ConjugationMasterStrip
      :per-class="master.perClass.value"
      :done-count="master.doneCount.value"
      :total="master.total.value"
      :earned="master.earned.value"
    />

    <DrillClassPicker v-if="!started" :selected="drill.selectedClassId.value" @select="begin" />

    <template v-else>
      <button
        type="button"
        class="lab__change-class"
        :disabled="persistenceLocked || drill.phase.value !== 'done'"
        data-testid="conjugation-change-class"
        @click="changeClass"
      >
        {{ t('conjugation.change_class') }}
      </button>
      <p
        v-if="drill.mode.value === 'replay' && drill.phase.value !== 'done'"
        class="lab__replay-note"
        role="status"
      >
        <span aria-hidden="true">🔁</span> {{ t('conjugation.replay_mode_label') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('conjugation.progress_label')"
      />
      <ConjugationCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        :picked="drill.picked.value"
        :next-disabled="persistenceLocked"
        @answer="drill.answer"
        @next="onNext"
      />
      <PracticeSaveStatus
        :status="overallSaveStatus"
        @retry="retrySave"
      />
      <ConjugationSummary
        v-if="drill.phase.value === 'done'"
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        :locked="persistenceLocked"
        @restart="restart"
        @replay-failed="onReplayFailed"
      />
    </template>

    <ConjugationMasterCelebration v-if="master.celebrate.value" :total="master.total.value" @dismiss="master.dismiss" />
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__replay-note {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.04em;
  color: var(--text-soft); background: var(--surface); border: 2px dashed var(--border); padding: 8px 12px;
}
.lab__change-class {
  align-self: flex-start;
  padding: 8px 12px;
  border: 2px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  cursor: pointer;
}
.lab__change-class:disabled { opacity: 0.55; cursor: wait; }
.lab__change-class:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

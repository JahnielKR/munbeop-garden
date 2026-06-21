<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DrillClassPicker from '~/components/conjugation-drill/DrillClassPicker.vue'
import ConjugationCard from '~/components/conjugation-drill/ConjugationCard.vue'
import ConjugationSummary from '~/components/conjugation-drill/ConjugationSummary.vue'
import ConjugationMasterStrip from '~/components/conjugation-drill/ConjugationMasterStrip.vue'
import ConjugationMasterCelebration from '~/components/conjugation-drill/ConjugationMasterCelebration.vue'
import { useConjugationDrill } from '~/composables/useConjugationDrill'
import { useConjugationMaster } from '~/composables/useConjugationMaster'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { DrillClassId } from '~/lib/conjugation-drill'
import type { VerbClass } from '~/lib/korean'

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const initial = (typeof route.query.set === 'string' ? route.query.set : 'mixed') as DrillClassId
const drill = useConjugationDrill(initial)
const master = useConjugationMaster()
const started = ref(false)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

function begin(id: DrillClassId) {
  drill.selectClass(id)
  void router.replace({ query: { ...route.query, set: id } })
  drill.start()
  started.value = true
}

async function onNext() {
  await drill.next()
  if (drill.phase.value === 'done' && drill.mode.value === 'normal' && drill.selectedClassId.value !== 'mixed') {
    master.recordRound(drill.selectedClassId.value as VerbClass, drill.score.value.accuracy)
  }
}

function restart() {
  drill.start()
}
function onReplayFailed() {
  drill.replayFailed()
}

if (initial !== 'mixed') begin(initial)
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="활용 연습" :latin="t('conjugation.title')" />
    <p class="lab__lead">{{ t('conjugation.lead') }}</p>

    <ConjugationMasterStrip
      :per-class="master.perClass.value"
      :done-count="master.doneCount.value"
      :total="master.total.value"
      :earned="master.earned.value"
    />

    <DrillClassPicker v-if="!started" :selected="drill.selectedClassId.value" @select="begin" />

    <template v-else>
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
        @answer="drill.answer"
        @next="onNext"
      />
      <ConjugationSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
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
</style>

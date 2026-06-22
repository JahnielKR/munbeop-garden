<!-- app/pages/practice/register.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import ModeTabs from '~/components/register-drill/ModeTabs.vue'
import SetPicker from '~/components/register-drill/SetPicker.vue'
import RegisterCard from '~/components/register-drill/RegisterCard.vue'
import RegisterSummary from '~/components/register-drill/RegisterSummary.vue'
import RegisterMasterStrip from '~/components/register-drill/RegisterMasterStrip.vue'
import RegisterMasterCelebration from '~/components/register-drill/RegisterMasterCelebration.vue'
import { useRegisterDrill } from '~/composables/useRegisterDrill'
import { useRegisterMaster } from '~/composables/useRegisterMaster'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { isValidSet, isMasterySet } from '~/lib/register-transform'
import type { RegisterMode } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const initialMode: RegisterMode = route.query.mode === 'honor' ? 'honor' : 'level'
const initialSet = typeof route.query.set === 'string' ? route.query.set : 'mixed'
const drill = useRegisterDrill(initialMode, initialSet)
const master = useRegisterMaster()
const started = ref(false)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

function onMode(m: RegisterMode) {
  drill.selectMode(m)
  started.value = false
  void router.replace({ query: { ...route.query, mode: m, set: 'mixed' } })
}

function begin(set: string) {
  drill.selectSet(set)
  void router.replace({ query: { ...route.query, mode: drill.mode.value, set } })
  drill.start()
  started.value = true
}

async function onNext() {
  await drill.next()
  if (
    drill.phase.value === 'done' &&
    drill.runMode.value === 'normal' &&
    isMasterySet(drill.mode.value, drill.selectedSet.value)
  ) {
    master.recordRound(drill.mode.value, drill.selectedSet.value, drill.score.value.accuracy)
  }
}

function restart() {
  drill.start()
}
function onReplayFailed() {
  drill.replayFailed()
}

if (initialSet !== 'mixed' && isValidSet(initialMode, initialSet)) begin(initialSet)
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="높임법 연구소" :latin="t('register.title')" />
    <p class="lab__lead">{{ t('register.lead') }}</p>

    <RegisterMasterStrip
      :per-set="master.perSet.value"
      :done-count="master.doneCount.value"
      :total="master.total.value"
      :earned="master.earned.value"
    />

    <ModeTabs :mode="drill.mode.value" @select="onMode" />

    <SetPicker v-if="!started" :mode="drill.mode.value" :selected="drill.selectedSet.value" @select="begin" />

    <template v-else>
      <p v-if="drill.runMode.value === 'replay' && drill.phase.value !== 'done'" class="lab__replay-note" role="status">
        <span aria-hidden="true">🔁</span> {{ t('register.replay_mode_label') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('register.progress_label')"
      />
      <RegisterCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        :picked="drill.picked.value"
        @answer="drill.answer"
        @next="onNext"
      />
      <RegisterSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="onReplayFailed"
      />
    </template>

    <RegisterMasterCelebration v-if="master.celebrate.value" :total="master.total.value" @dismiss="master.dismiss" />
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

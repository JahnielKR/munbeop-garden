<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import CounterCard from '~/components/counter-drill/CounterCard.vue'
import CounterSummary from '~/components/counter-drill/CounterSummary.vue'
import { useCounterDrill } from '~/composables/useCounterDrill'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { COUNTER_SETS } from '~/lib/counters/sets'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const drill = useCounterDrill()
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)

useGameLeaveGuard(() => started.value && drill.phase.value !== 'done')

function begin(setId: string) {
  drill.selectSet(setId)
  drill.start()
  started.value = true
  phase.value = 'play'
}
async function onNext() {
  await drill.next()
}
function restart() {
  phase.value = 'pick'
  started.value = false
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="수 분류사 연구소" :latin="t('counters.title')" />
    <p class="lab__lead">{{ t('counters.lead') }}</p>

    <div v-if="phase === 'pick'" class="lab__sets">
      <button
        v-for="s in COUNTER_SETS"
        :key="s.id"
        type="button"
        class="lab__set"
        data-testid="counter-set"
        @click="begin(s.id)"
      >
        <span lang="ko">{{ s.ko }}</span>
        <span class="lab__set-label">{{ t(s.labelKey) }}</span>
      </button>
    </div>

    <template v-else>
      <p v-if="drill.runMode.value === 'replay' && drill.phase.value !== 'done'" class="lab__replay" role="status">
        🔁 {{ t('counters.replay_mode') }}
      </p>
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.sessionItems.value.length"
        :progress="drill.index.value"
        :label="t('counters.progress')"
      />
      <CounterCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :options="drill.displayOptions.value"
        :phase="drill.phase.value"
        :picked="drill.picked.value"
        :verdict="drill.phase.value === 'right' ? true : drill.phase.value === 'wrong' ? false : null"
        @answer="drill.answer"
        @next="onNext"
      />
      <CounterSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        @restart="restart"
        @replay-failed="drill.replayFailed"
      />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui, 'Inter'), sans-serif; color: var(--text-soft, var(--ink-soft)); line-height: 1.6; }
.lab__sets { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.lab__set { display: flex; flex-direction: column; gap: 4px; padding: 16px; background: var(--paper-deep); border: 2px solid var(--ink-line); cursor: pointer; font-family: 'Noto Sans KR', sans-serif; font-size: 16px; color: var(--ink); }
.lab__set:hover { border-color: var(--ink); }
.lab__set:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.lab__set-label { font-family: 'Inter', sans-serif; font-size: 12px; color: var(--ink-soft); }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
</style>

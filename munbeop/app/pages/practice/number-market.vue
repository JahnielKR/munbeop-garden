<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import DomainPicker from '~/components/numbers-market/DomainPicker.vue'
import PromptStage from '~/components/numbers-market/PromptStage.vue'
import TileTray from '~/components/numbers-market/TileTray.vue'
import MarketSummary from '~/components/numbers-market/MarketSummary.vue'
import MasterStrip from '~/components/numbers-market/MasterStrip.vue'
import { useNumberMarket } from '~/composables/useNumberMarket'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import type { NumberDomain } from '~/lib/domain'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const m = useNumberMarket()
const phase = ref<'pick' | 'play'>('pick')
const started = ref(false)

useGameLeaveGuard(() => started.value && m.phase.value !== 'done')

function begin(domainId: string) {
  m.selectDomain(domainId as NumberDomain)
  m.start()
  started.value = true
  phase.value = 'play'
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
    <BilingualTitle ko="숫자 시장" :latin="t('numberMarket.title')" />
    <p class="lab__lead">{{ t('numberMarket.lead') }}</p>

    <MasterStrip
      :per-domain="m.master.perDomain.value"
      :done-count="m.master.doneCount.value"
      :total="m.master.total.value"
      :earned="m.master.earned.value"
    />

    <DomainPicker v-if="phase === 'pick'" @select="begin" />

    <template v-else>
      <p
        v-if="m.runMode.value === 'replay' && m.phase.value !== 'done'"
        class="lab__replay"
        role="status"
      >
        🔁 {{ t('numberMarket.replay_failed') }}
      </p>
      <ProgressDots
        v-if="m.phase.value !== 'done'"
        :total="m.sessionItems.value.length"
        :progress="m.index.value"
        :label="t('numberMarket.progress')"
      />
      <template v-if="m.phase.value !== 'done'">
        <PromptStage
          :item="m.item.value"
          :reveal="m.phase.value === 'right' || m.phase.value === 'wrong'"
        />
        <p v-if="m.phase.value === 'right'" class="lab__verdict lab__verdict--ok" role="status">
          ✓ {{ t('numberMarket.correct') }}
        </p>
        <p v-else-if="m.phase.value === 'wrong'" class="lab__verdict lab__verdict--no" role="status">
          ✗ {{ t('numberMarket.wrong') }}
        </p>
        <TileTray
          :pool="m.pool.value"
          :built="m.built.value"
          :phase="m.phase.value"
          @place="m.placeTile"
          @undo="m.undoTile"
          @clear="m.clearTiles"
          @submit="m.submit"
        />
        <button
          v-if="m.phase.value === 'right' || m.phase.value === 'wrong'"
          type="button"
          class="lab__next"
          @click="m.next"
        >
          {{ t('numberMarket.next') }}
        </button>
      </template>
      <MarketSummary
        v-else
        :score="m.score.value"
        :failed-items="m.failedItems.value"
        @restart="restart"
        @replay-failed="m.replayFailed"
      />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 18px; }
.lab__lead { margin: 0; font-family: 'Inter', sans-serif; color: var(--ink-soft, var(--text-soft)); line-height: 1.6; }
.lab__replay { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; color: var(--ink-soft); }
.lab__verdict { margin: 0; font-family: 'Inter', sans-serif; font-size: 15px; }
.lab__verdict--ok { color: var(--accent-bright, #2e7d32); }
.lab__verdict--no { color: var(--danger, #c62828); }
.lab__next { align-self: flex-start; font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 18px; background: var(--accent, #2e7d32); color: var(--paper, #fff); border: 2px solid var(--accent, #2e7d32); cursor: pointer; }
.lab__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

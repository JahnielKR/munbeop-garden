<!-- app/pages/practice/placement.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import PlacementCard from '~/components/placement/PlacementCard.vue'
import PlacementResult from '~/components/placement/PlacementResult.vue'
import { usePlacement } from '~/composables/usePlacement'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { Q_PER_LEVEL } from '~/lib/placement'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const placement = usePlacement()
const started = ref(false)

useGameLeaveGuard(() => started.value && placement.phase.value !== 'done')

function begin() {
  placement.start()
  started.value = true
}
function onRetake() {
  placement.start()
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="배치 테스트" :latin="t('placement.title')" />
    <p class="lab__lead">{{ t('placement.lead') }}</p>

    <div v-if="!started" class="lab__intro">
      <p class="lab__intro-detail">{{ t('placement.intro_detail') }}</p>
      <Button @click="begin">{{ t('placement.start') }}</Button>
    </div>

    <template v-else>
      <template v-if="placement.phase.value !== 'done'">
        <p class="lab__level" role="status">{{ t('placement.level_tag', { level: placement.ladder.value.currentLevel }) }}</p>
        <ProgressDots
          :total="Q_PER_LEVEL"
          :progress="placement.ladder.value.askedInLevel"
          :label="t('placement.progress_label')"
        />
        <PlacementCard
          :item="placement.item.value"
          :options="placement.displayOptions.value"
          :phase="placement.phase.value"
          :verdict="placement.phase.value === 'right' ? true : placement.phase.value === 'wrong' ? false : null"
          :picked="placement.picked.value"
          @answer="placement.answer"
          @next="placement.next"
        />
      </template>
      <PlacementResult v-else :outcome="placement.outcome.value!" @retake="onRetake" />
    </template>
  </div>
</template>

<style scoped>
.lab { display: flex; flex-direction: column; gap: 20px; }
.lab__lead { margin: 0; font-family: var(--font-ui); color: var(--text-soft); line-height: 1.6; }
.lab__intro { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
.lab__intro-detail { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.lab__level {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em;
  color: var(--text-soft); text-transform: uppercase;
}
</style>

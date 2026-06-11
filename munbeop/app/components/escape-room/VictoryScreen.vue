<script setup lang="ts">
import { computed } from 'vue'
import type { Level, RewardTier } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'

/**
 * VictoryScreen — outro narrative + tier reveal + unlocked cosmetic.
 *
 * Shown when the run completes. The tier comes from the store's complete();
 * the matching reward is read from the level definition.
 */

interface Props {
  level: Level
  tier: RewardTier
}

const props = defineProps<Props>()
defineEmits<{ exit: [] }>()

const { tl } = useLocalized()
const { t } = useI18n()

const TIER_DOTS: Record<RewardTier, string> = {
  common: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡',
}

const reward = computed(() => props.level.rewards[props.tier])
const outroParagraphs = computed(() =>
  tl(props.level.outro)
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean),
)
</script>

<template>
  <div class="victory" data-testid="victory-root">
    <p class="victory__voice" data-testid="victory-voice">{{ level.voiceOutro }}</p>
    <h2 class="victory__title">{{ t('escape.victory_title') }}</h2>

    <div class="victory__outro" data-testid="victory-outro">
      <p v-for="(p, i) in outroParagraphs" :key="i" class="victory__paragraph">{{ p }}</p>
    </div>

    <div class="victory__reward-box">
      <span class="victory__tier" data-testid="victory-tier">
        {{ TIER_DOTS[tier] }} {{ t(`escape.tier_${tier}`) }}
      </span>
      <span class="victory__unlocked-label">{{ t('escape.reward_unlocked') }}</span>
      <span class="victory__reward" data-testid="victory-reward">{{ tl(reward.name) }}</span>
      <span class="victory__reward-desc">{{ tl(reward.description) }}</span>
    </div>

    <button
      type="button"
      class="victory__exit"
      data-testid="victory-exit"
      @click="$emit('exit')"
    >
      {{ t('escape.continue') }} ▸
    </button>
  </div>
</template>

<style scoped>
.victory {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 32px 24px;
  background: radial-gradient(ellipse at 50% 0%, #5a3f2a 0%, #1d130a 75%);
  color: #f3e6c8;
  overflow-y: auto;
}
.victory__voice {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #ffd9a0;
}
.victory__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 20px;
  color: #ffe9b8;
  text-shadow: 0 3px 0 rgba(0, 0, 0, 0.55);
}
.victory__outro {
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.victory__paragraph {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  line-height: 1.8;
  text-align: center;
}
.victory__reward-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 28px;
  border: 3px solid #ffd9a0;
  background: rgba(255, 217, 160, 0.08);
  box-shadow: 0 0 22px rgba(255, 217, 160, 0.25);
}
.victory__tier {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
}
.victory__unlocked-label {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(243, 230, 200, 0.6);
}
.victory__reward {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 700;
}
.victory__reward-desc {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  color: rgba(243, 230, 200, 0.75);
  max-width: 360px;
  text-align: center;
}
.victory__exit {
  margin-top: 8px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 12px;
  padding: 14px 36px;
  background: var(--accent, #c97c5d);
  color: #fff7eb;
  border: 3px solid #3a2818;
  cursor: pointer;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.45);
}
.victory__exit:hover {
  filter: brightness(1.08);
}
</style>

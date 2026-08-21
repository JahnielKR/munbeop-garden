<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Level, RewardTier } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import { useEscapeRoomAudio } from '~/composables/useEscapeRoomAudio'

/**
 * VictoryScreen — outro narrative + tier reveal + unlocked cosmetic.
 *
 * Shown when the run completes. The tier comes from the store's complete();
 * the matching reward is read from the level definition.
 */

interface Props {
  level: Level
  tier: RewardTier
  /** Optional full-bleed farewell illustration behind the results. */
  image?: string
  /**
   * The player's built farewell sentence (the final creation slot's answer).
   * Substituted for the `{farewell}` token in the outro so the closing
   * cinematic quotes exactly what the player said. Levels without the token
   * (e.g. level 1) ignore it.
   */
  farewell?: string
  /**
   * Resolved URLs for the victory climax, passed by the orchestrator
   * (EscapeRoom). All optional: a level without them (e.g. level 1) plays a
   * silent victory. The bell tolls and the rain stops, then the monk speaks.
   */
  bellTollAudio?: string
  rainStopAudio?: string
  voiceOutroAudio?: string
}

const props = defineProps<Props>()
defineEmits<{ exit: [] }>()

const { tl } = useLocalized()
const { t } = useI18n()
const audio = useEscapeRoomAudio()

// Move focus to the outro on mount (the win clears the active slot, so focus
// would drop to <body>); the title is a role=status so the state is announced.
const root = ref<HTMLElement | null>(null)
onMounted(() => {
  root.value?.focus()
  // The climax: bell + rain-stop one-shots, then the monk's farewell line.
  if (props.bellTollAudio) audio.playSfx(props.bellTollAudio)
  if (props.rainStopAudio) audio.playSfx(props.rainStopAudio)
  if (props.voiceOutroAudio) audio.playVoice(props.voiceOutroAudio)
})

const TIER_DOTS: Record<RewardTier, string> = {
  common: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡',
}

const reward = computed(() => props.level.rewards[props.tier])
const rewardImage = computed(() => `/escape-room/${props.level.id}/${reward.value.image}`)
const outroParagraphs = computed(() =>
  tl(props.level.outro)
    .replaceAll('{farewell}', props.farewell ?? '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean),
)
</script>

<template>
  <div ref="root" class="victory" data-testid="victory-root" tabindex="-1">
    <img v-if="image" :src="image" alt="" class="victory__art" >
    <p class="victory__voice" data-testid="victory-voice">{{ level.voiceOutro }}</p>
    <h2 class="victory__title" role="status">{{ t('escape.victory_title') }}</h2>

    <div class="victory__outro" data-testid="victory-outro">
      <p v-for="(p, i) in outroParagraphs" :key="i" class="victory__paragraph">{{ p }}</p>
    </div>

    <div class="victory__reward-box">
      <img
        class="victory__reward-image"
        data-testid="victory-reward-image"
        :src="rewardImage"
        :alt="tl(reward.name)"
      >
      <span class="victory__tier" data-testid="victory-tier">
        {{ TIER_DOTS[tier] }} {{ t(`escape.tier_${tier}`) }}
      </span>
      <span class="victory__unlocked-label">{{ t('escape.reward_unlocked') }}</span>
      <span class="victory__reward" data-testid="victory-reward">{{ tl(reward.name) }}</span>
      <span class="victory__reward-desc">{{ tl(reward.description) }}</span>
    </div>

    <button type="button" class="victory__exit" data-testid="victory-exit" @click="$emit('exit')">
      {{ t('escape.continue') }} ▸
    </button>
  </div>
</template>

<style scoped>
.victory {
  /* Programmatic focus target (tabindex=-1): no visible ring, focus is for SR. */
  outline: none;
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
  isolation: isolate;
}
.victory::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(
      180deg,
      rgba(8, 7, 10, 0.32) 0%,
      rgba(8, 7, 10, 0.68) 48%,
      rgba(8, 7, 10, 0.9) 100%
    ),
    radial-gradient(ellipse at 50% 35%, transparent 0%, rgba(8, 7, 10, 0.5) 80%);
  pointer-events: none;
}
.victory__art {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
}
.victory > :not(.victory__art) {
  position: relative;
  z-index: 2;
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
  max-height: min(40vh, 340px);
  overflow-y: auto;
  padding: 16px 20px;
  border: 1px solid rgba(255, 225, 174, 0.22);
  border-radius: 10px;
  background: rgba(13, 10, 8, 0.7);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(3px);
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
.victory__reward-image {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border: 2px solid rgba(255, 225, 174, 0.6);
  border-radius: 8px;
  background: radial-gradient(circle, rgba(255, 240, 210, 0.2), rgba(8, 10, 24, 0.72));
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.38);
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
  color: var(--text-on-accent, #1a1a1a);
  border: 3px solid #3a2818;
  cursor: pointer;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.45);
}
.victory__exit:hover {
  filter: brightness(1.08);
}
</style>

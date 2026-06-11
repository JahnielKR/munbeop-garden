<script setup lang="ts">
import { computed } from 'vue'
import type { LevelBookEntry } from '~/seed/escape-room/registry'
import { REWARD_TIERS, type RewardTier } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'

/**
 * LevelPage — one sheet of the escape-room notebook.
 *
 * Shows the level's cover (taped-photo framing), title, tagline hook, mood,
 * TOPIK badge — and for playable levels the 4 reward tiers, the attempts
 * (hearts = maxErrors + 1) and the START button. Coming-soon levels render
 * the same sheet with a diagonal stamp instead of START.
 */

interface Props {
  entry: LevelBookEntry
}

const props = defineProps<Props>()
defineEmits<{ start: [levelId: string] }>()

const { tl } = useLocalized()
const { t } = useI18n()

const TIER_DOTS: Record<RewardTier, string> = {
  common: '🟢',
  rare: '🔵',
  epic: '🟣',
  legendary: '🟡',
}

const rewards = computed(() => {
  if (props.entry.status !== 'playable' || !props.entry.level) return []
  return REWARD_TIERS.map((tier) => ({
    tier,
    dot: TIER_DOTS[tier],
    label: t(`escape.tier_${tier}`),
    name: tl(props.entry.level!.rewards[tier].name),
  }))
})

/** Hearts = mistakes you can survive + the final fatal one = maxErrors + 1. */
const hearts = computed(() =>
  props.entry.status === 'playable' && props.entry.level
    ? props.entry.level.rules.maxErrors + 1
    : 0,
)
</script>

<template>
  <article class="sheet" :class="{ 'sheet--locked': entry.status !== 'playable' }">
    <!-- Taped cover photo -->
    <div class="sheet__photo">
      <img :src="entry.cover" alt="" class="sheet__cover" data-testid="page-cover" />
      <span class="sheet__tape" aria-hidden="true" />
    </div>

    <!-- Heading -->
    <header class="sheet__head">
      <span class="sheet__number">{{ t('escape.level_n', { n: entry.number }) }}</span>
      <span class="sheet__topik" data-testid="page-topik">{{
        t('escape.topik_n', { n: entry.topikLevel })
      }}</span>
    </header>
    <h2 class="sheet__title" data-testid="page-title">{{ tl(entry.title) }}</h2>
    <p class="sheet__mood">{{ tl(entry.mood) }}</p>
    <p class="sheet__tagline" data-testid="page-tagline">{{ tl(entry.tagline) }}</p>

    <!-- Playable: rewards + attempts + START -->
    <template v-if="entry.status === 'playable'">
      <div class="sheet__meta">
        <section class="sheet__rewards">
          <h3 class="sheet__meta-label">{{ t('escape.rewards') }}</h3>
          <ul class="sheet__reward-list">
            <li
              v-for="r in rewards"
              :key="r.tier"
              class="sheet__reward"
              data-testid="page-reward"
              :title="r.name"
            >
              <span aria-hidden="true">{{ r.dot }}</span>
              <span class="sheet__reward-label">{{ r.label }}</span>
            </li>
          </ul>
        </section>
        <section class="sheet__attempts">
          <h3 class="sheet__meta-label">{{ t('escape.attempts') }}</h3>
          <div class="sheet__hearts">
            <span
              v-for="i in hearts"
              :key="i"
              class="sheet__heart"
              data-testid="page-heart"
              aria-hidden="true"
              >♥</span
            >
          </div>
        </section>
      </div>

      <button
        type="button"
        class="sheet__start"
        data-testid="page-start"
        @click="$emit('start', entry.id)"
      >
        ▶ {{ t('escape.start') }}
      </button>
    </template>

    <!-- Coming soon stamp -->
    <div v-else class="sheet__stamp" data-testid="page-coming-soon">
      {{ t('escape.coming_soon') }}
    </div>
  </article>
</template>

<style scoped>
.sheet {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 26px 26px;
  background:
    repeating-linear-gradient(transparent 0 27px, rgba(116, 96, 70, 0.12) 27px 28px),
    var(--paper-warm, #fbf3e2);
  border: 2px solid var(--border, #b9a584);
  position: relative;
  min-height: 540px;
}
.sheet--locked {
  filter: saturate(0.55);
}

.sheet__photo {
  position: relative;
  align-self: center;
  width: min(100%, 380px);
  padding: 8px 8px 10px;
  background: #fff;
  border: 1px solid rgba(60, 42, 24, 0.25);
  box-shadow: 2px 3px 0 rgba(60, 42, 24, 0.25);
  transform: rotate(-1.2deg);
}
.sheet__cover {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  image-rendering: pixelated;
}
.sheet__tape {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(2deg);
  width: 84px;
  height: 22px;
  background: rgba(214, 182, 118, 0.65);
  border: 1px solid rgba(60, 42, 24, 0.15);
}

.sheet__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 6px;
}
.sheet__number {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  color: var(--ink-soft, #7a6446);
  letter-spacing: 0.08em;
}
.sheet__topik {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  padding: 4px 8px;
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
}
.sheet__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 17px;
  line-height: 1.45;
}
.sheet__mood {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft, #7a6446);
}
.sheet__tagline {
  margin: 2px 0 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-style: italic;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text, #43321d);
}

.sheet__meta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px dashed rgba(116, 96, 70, 0.45);
}
.sheet__meta-label {
  margin: 0 0 6px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft, #7a6446);
}
.sheet__reward-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
}
.sheet__reward {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
}
.sheet__hearts {
  display: flex;
  gap: 4px;
}
.sheet__heart {
  color: #c0392b;
  font-size: 20px;
  filter: drop-shadow(1px 1px 0 rgba(60, 42, 24, 0.3));
}

.sheet__start {
  align-self: center;
  margin-top: 14px;
  padding: 14px 42px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px;
  letter-spacing: 0.08em;
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
  border: 3px solid var(--border-strong, #6b5b4a);
  cursor: pointer;
  box-shadow: 4px 4px 0 rgba(60, 42, 24, 0.35);
  transition: transform 120ms, box-shadow 120ms;
}
.sheet__start:hover {
  transform: translate(-1px, -2px);
  box-shadow: 6px 7px 0 rgba(60, 42, 24, 0.35);
}
.sheet__start:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 rgba(60, 42, 24, 0.35);
}
.sheet__start:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}

.sheet__stamp {
  align-self: center;
  margin-top: auto;
  padding: 10px 26px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: #a33;
  border: 3px double #a33;
  transform: rotate(-6deg);
  opacity: 0.8;
  text-transform: uppercase;
}
</style>

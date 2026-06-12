<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import Button from '~/components/ui/Button.vue'
import PixelCardBack from './PixelCardBack.vue'
import type { DrawCard } from './cards'

/**
 * CardDraw — the table scene: the deck riffles, three cards are dealt
 * face-down, the player taps each one to flip it (CSS 3D), and once the
 * whole hand is revealed a single CTA hands control back to the page.
 *
 * The grammars are already drawn (weighted SRS pick) before this mounts;
 * the shuffle is pure theater. A shuffled deck hides the weighting
 * honestly — nobody can see the order of face-down cards.
 */
interface Props {
  cards: DrawCard[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ done: [] }>()

const { t } = useI18n()

const SHUFFLE_MS = 1500
const DEAL_STAGGER_MS = 240

const stage = ref<'shuffle' | 'table'>('shuffle')
const flipped = ref<boolean[]>(props.cards.map(() => false))
const allFlipped = computed(() => flipped.value.length > 0 && flipped.value.every(Boolean))

// Screen-reader narration: the flip is pure CSS, so each reveal (and the
// hand-complete moment) is voiced through a polite live region instead.
const liveMessage = ref('')

let dealTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  // Reduced motion: skip the riffle, the hand is simply on the table.
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    stage.value = 'table'
    return
  }
  dealTimer = setTimeout(() => {
    stage.value = 'table'
  }, SHUFFLE_MS)
})

onBeforeUnmount(() => {
  if (dealTimer) clearTimeout(dealTimer)
})

function flip(i: number) {
  if (stage.value !== 'table' || flipped.value[i]) return
  flipped.value[i] = true
  const card = props.cards[i]
  liveMessage.value = allFlipped.value
    ? `${card?.ko} · ${card?.deckName}. ${t('practice.deck_all_revealed')}`
    : `${card?.ko} · ${card?.deckName}`
}
</script>

<template>
  <div class="draw">
    <!-- riffle: five card backs hop in alternating arcs over the stack -->
    <div v-if="stage === 'shuffle'" class="shuffle" data-testid="shuffle">
      <div class="shuffle__stack" aria-hidden="true">
        <PixelCardBack
          v-for="i in 5"
          :key="i"
          class="shuffle__card"
          :class="i % 2 === 0 ? 'shuffle__card--left' : 'shuffle__card--right'"
          :color="cards[(i - 1) % cards.length]?.color ?? 'var(--ink-soft)'"
          :style="{ animationDelay: `${(i - 1) * 90}ms`, zIndex: i }"
        />
      </div>
      <p class="shuffle__label" role="status">{{ t('practice.deck_shuffling') }}</p>
    </div>

    <div v-else class="table">
      <div class="table__row">
        <button
          v-for="(card, i) in cards"
          :key="i"
          type="button"
          class="draw-card"
          :class="{ 'draw-card--flipped': flipped[i] }"
          :style="{ animationDelay: `${i * DEAL_STAGGER_MS}ms` }"
          :aria-label="flipped[i] ? undefined : t('practice.deck_flip_card', { n: i + 1 })"
          :aria-pressed="flipped[i]"
          data-testid="draw-card"
          @click="flip(i)"
        >
          <span class="draw-card__inner">
            <span class="draw-card__face draw-card__back">
              <PixelCardBack :color="card.color" />
            </span>
            <span class="draw-card__face draw-card__front" :style="{ borderColor: card.color }">
              <span class="draw-card__band" :style="{ background: card.color }">
                {{ card.deckName }}
              </span>
              <span class="draw-card__ko" lang="ko">{{ card.ko }}</span>
            </span>
          </span>
        </button>
      </div>

      <p v-if="!allFlipped" class="table__hint">{{ t('practice.deck_tap_hint') }}</p>
      <div v-else class="table__cta">
        <Button variant="primary" size="lg" data-testid="start-writing" @click="emit('done')">
          {{ t('practice.deck_start') }}
        </Button>
      </div>
    </div>

    <p class="sr-only" aria-live="polite" data-testid="flip-announcer">{{ liveMessage }}</p>
  </div>
</template>

<style scoped>
.draw {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* ---- shuffle stage ---- */
.shuffle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 24px 0 8px;
}
.shuffle__stack {
  position: relative;
  width: 110px;
  height: 160px;
}
.shuffle__card {
  position: absolute;
  inset: 0;
  width: 100px;
  animation: riffle-right 0.5s ease-in-out infinite;
}
.shuffle__card--left {
  animation-name: riffle-left;
}
@keyframes riffle-right {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  35% { transform: translate(16px, -22px) rotate(7deg); }
  70% { transform: translate(2px, 2px) rotate(0deg); }
}
@keyframes riffle-left {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  35% { transform: translate(-16px, -22px) rotate(-7deg); }
  70% { transform: translate(-2px, 2px) rotate(0deg); }
}
.shuffle__label {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 11px;
  color: var(--text-soft, var(--ink-soft));
  /* Blink via opacity, NOT visibility — visibility:hidden would yank the
   * status text out of the accessibility tree mid-announcement. */
  animation: blink 1.1s steps(2, start) infinite;
}
@keyframes blink {
  to { opacity: 0.25; }
}

/* ---- table stage ---- */
.table {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}
.table__row {
  display: flex;
  justify-content: center;
  gap: clamp(8px, 3vw, 24px);
  width: 100%;
}

.draw-card {
  position: relative;
  width: clamp(92px, 28vw, 150px);
  aspect-ratio: 5 / 7;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  perspective: 700px;
  animation: deal-in 0.5s var(--ease-out, ease-out) both;
}
@keyframes deal-in {
  from {
    transform: translateY(-46px) rotate(-6deg);
    opacity: 0;
  }
  to {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
}
.draw-card--flipped {
  cursor: default;
}
.draw-card:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 3px;
}
.draw-card:hover:not(.draw-card--flipped) .draw-card__inner {
  transform: translateY(-4px);
}

.draw-card__inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.6s var(--ease-out, ease-out);
}
.draw-card--flipped .draw-card__inner {
  transform: rotateY(180deg);
}

.draw-card__face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
}
.draw-card__back :deep(svg) {
  width: 100%;
  height: 100%;
}

.draw-card__front {
  transform: rotateY(180deg);
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  background: var(--paper-warm, var(--surface));
  border: 3px solid;
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
  overflow: hidden;
}
.draw-card__band {
  width: 100%;
  padding: 5px 4px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  text-align: center;
  color: var(--always-dark, #2d1e18);
  border-bottom: 2px solid var(--border-strong, var(--border));
}
.draw-card__ko {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 8px 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: clamp(14px, 4vw, 19px);
  line-height: 1.35;
  text-align: center;
  word-break: keep-all;
  color: var(--text, var(--ink));
}

.table__hint {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: var(--text-soft, var(--ink-soft));
}
.table__cta {
  animation: deal-in 0.4s var(--ease-out, ease-out) both;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .shuffle__card,
  .shuffle__label,
  .draw-card,
  .table__cta {
    animation: none;
  }
  .draw-card__inner {
    transition: none;
  }
}
</style>

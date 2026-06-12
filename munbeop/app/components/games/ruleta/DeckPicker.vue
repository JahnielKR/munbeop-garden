<script setup lang="ts">
import PixelCardBack from './PixelCardBack.vue'
import type { DeckOption } from './cards'

/**
 * DeckPicker — the shelf of card decks, one per TOPIK level plus the
 * mixed "all levels" mat. Props-only: the page builds the options via
 * buildDeckOptions(), so this stays mountable without stores.
 */
interface Props {
  options: DeckOption[]
}
defineProps<Props>()
defineEmits<{ select: [deckId: string | null] }>()

const { t } = useI18n()

/** Single-color decks still render a 3-card stack; "all" fans its own colors. */
function stackColors(opt: DeckOption): string[] {
  if (opt.colors.length > 1) return opt.colors
  const c = opt.colors[0] ?? 'var(--ink-soft)'
  return [c, c, c]
}

/** Stagger the mini stack: each card peeks up-right from the one below. */
function stackStyle(i: number) {
  return {
    transform: `translate(${i * 4}px, ${i * -4}px)`,
    zIndex: String(i),
  }
}
</script>

<template>
  <div class="picker" data-testid="deck-picker">
    <button
      v-for="opt in options"
      :key="opt.id ?? 'all'"
      type="button"
      class="deck"
      :class="{ 'deck--locked': opt.disabled }"
      :disabled="opt.disabled"
      :data-testid="`deck-${opt.id ?? 'all'}`"
      @click="$emit('select', opt.id)"
    >
      <span class="deck__stack" aria-hidden="true">
        <PixelCardBack
          v-for="(color, i) in stackColors(opt)"
          :key="i"
          class="deck__card"
          :color="color"
          :style="stackStyle(i)"
        />
      </span>
      <span class="deck__name">{{ opt.name }}</span>
      <span class="deck__count">{{ t('practice.deck_count', { n: opt.count }) }}</span>
      <span v-if="opt.reason" class="deck__locked-label">
        {{ opt.reason === 'excluded' ? t('practice.deck_excluded') : t('practice.deck_too_few') }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 16px;
}

.deck {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 12px 14px;
  background: var(--paper-warm, var(--surface));
  border: 3px solid var(--border-strong, var(--border));
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
  cursor: pointer;
  font: inherit;
  color: inherit;
  transform: translate(0, 0);
  transition:
    transform var(--motion-quick, 120ms) var(--ease-out, ease-out),
    box-shadow var(--motion-quick, 120ms) var(--ease-out, ease-out);
}
.deck:hover:not(:disabled),
.deck:focus-visible:not(:disabled) {
  transform: translate(-2px, -3px);
  box-shadow: var(--shadow-button-hover, 7px 8px 0 rgba(60, 42, 24, 0.35));
}
.deck:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-pixel-sm, 2px 2px 0 rgba(60, 42, 24, 0.35));
}
.deck:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}
/* Dim only the artwork and count — the deck name and the lock reason stay
 * at full contrast so the user can still read WHY the deck is locked. */
.deck--locked {
  cursor: default;
}
.deck--locked .deck__stack,
.deck--locked .deck__count {
  opacity: 0.45;
  filter: saturate(0.4);
}

.deck__stack {
  position: relative;
  width: 64px;
  height: 90px;
  margin-bottom: 10px;
}
.deck__card {
  position: absolute;
  inset: 0;
  width: 56px;
}

.deck__name {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
}
.deck__count {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  color: var(--text-soft, var(--ink-soft));
}
.deck__locked-label {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 11px;
  color: var(--text-soft, var(--ink-soft));
  text-align: center;
}
</style>

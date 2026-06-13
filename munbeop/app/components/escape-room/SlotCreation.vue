<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreationCandidate } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import HintPanel from './HintPanel.vue'

/**
 * SlotCreation — Tipo C puzzle UI (build the sentence from tiles).
 *
 * Tap a tile to append it; tap a built chip to remove it. Tap-based (not
 * drag) so mobile and desktop share one interaction. Emits the picked tile
 * indices in order; correctness is judged by the store against correctOrder.
 */

interface Props {
  candidate: CreationCandidate
  flags: { free: boolean; premium: boolean }
  /** Set when the last submission was a soft-reject; shows the NPC's gentle nudge. */
  softMessage?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  answer: [order: number[]]
  'use-free-hint': []
  'use-premium-hint': []
}>()

const { tl } = useLocalized()
const { t } = useI18n()

/** Tile indices picked so far, in order. */
const picked = ref<number[]>([])

const builtSentence = computed(() =>
  picked.value.map((i) => props.candidate.tiles[i]).join(' '),
)

function pick(index: number) {
  if (picked.value.includes(index)) return
  picked.value = [...picked.value, index]
}

function unpick(position: number) {
  picked.value = picked.value.filter((_, p) => p !== position)
}

function clear() {
  picked.value = []
}

function submit() {
  if (picked.value.length === 0) return
  emit('answer', [...picked.value])
}
</script>

<template>
  <section class="slot-creation" data-testid="slot-creation">
    <p class="slot-creation__korean" data-testid="slot-korean">
      {{ candidate.korean }}
    </p>
    <p class="slot-creation__question">{{ tl(candidate.question) }}</p>

    <!-- Built sentence -->
    <div class="slot-creation__built" data-testid="slot-built" :aria-label="builtSentence">
      <button
        v-for="(tileIndex, pos) in picked"
        :key="`${tileIndex}-${pos}`"
        type="button"
        class="slot-creation__chip"
        data-testid="slot-built-chip"
        @click="unpick(pos)"
      >
        {{ candidate.tiles[tileIndex] }}
      </button>
      <span v-if="picked.length === 0" class="slot-creation__placeholder">
        {{ t('escape.creation_help') }}
      </span>
    </div>

    <!-- Tile tray -->
    <div class="slot-creation__tray">
      <button
        v-for="(tile, i) in candidate.tiles"
        :key="i"
        type="button"
        class="slot-creation__tile"
        data-testid="slot-tile"
        :disabled="picked.includes(i)"
        @click="pick(i)"
      >
        {{ tile }}
      </button>
    </div>

    <p
      v-if="softMessage"
      class="slot-creation__soft"
      data-testid="slot-soft"
      role="status"
    >
      {{ softMessage }}
    </p>

    <div class="slot-creation__actions">
      <button
        type="button"
        class="slot-creation__clear"
        data-testid="slot-clear"
        @click="clear"
      >
        {{ t('escape.clear') }}
      </button>
      <button
        type="button"
        class="slot-creation__check"
        data-testid="slot-check"
        @click="submit"
      >
        {{ t('escape.check') }}
      </button>
    </div>

    <HintPanel
      :hints="candidate.hints"
      :flags="flags"
      @use-free="$emit('use-free-hint')"
      @use-premium="$emit('use-premium-hint')"
    />
  </section>
</template>

<style scoped>
.slot-creation {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  max-width: 560px;
  margin: 0 auto;
  background: var(--surface, #fff7eb);
  border: 3px solid var(--border-strong, #6b5b4a);
}
.slot-creation__korean {
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-size: 22px;
  margin: 0;
  padding: 12px;
  background: var(--surface-elevated, #ffe8b4);
  border-left: 4px solid var(--accent, #c97c5d);
  text-align: center;
}
.slot-creation__question {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-style: italic;
  color: var(--text-muted, #8a6f4a);
  text-align: center;
}
.slot-creation__built {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 56px;
  padding: 8px 10px;
  background: #fff;
  border: 2px dashed var(--border-strong, #6b5b4a);
}
.slot-creation__placeholder {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  color: var(--text-muted, #9a866a);
}
.slot-creation__soft {
  margin: 0;
  padding: 8px 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  color: var(--text-muted, #8a6f4a);
  background: var(--surface-elevated, #ffe8b4);
  border-left: 4px solid var(--border-strong, #6b5b4a);
}
.slot-creation__chip {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  padding: 6px 12px;
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
  border: 2px solid var(--border-strong, #6b5b4a);
  cursor: pointer;
  min-height: 40px;
}
.slot-creation__tray {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.slot-creation__tile {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  padding: 8px 14px;
  background: #fff;
  border: 2px solid var(--border-strong, #6b5b4a);
  box-shadow: 2px 2px 0 rgba(60, 42, 24, 0.3);
  cursor: pointer;
  min-height: 44px;
  transition: transform 100ms, box-shadow 100ms, opacity 100ms;
}
.slot-creation__tile:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 rgba(60, 42, 24, 0.3);
}
.slot-creation__tile:disabled {
  opacity: 0.35;
  cursor: default;
  box-shadow: none;
}
.slot-creation__actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.slot-creation__clear {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  padding: 10px 14px;
  background: transparent;
  border: 2px solid var(--border-strong, #6b5b4a);
  cursor: pointer;
  min-height: 44px;
}
.slot-creation__check {
  flex: 1;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 11px;
  padding: 10px 18px;
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
  border: 2px solid var(--border-strong, #6b5b4a);
  cursor: pointer;
  min-height: 44px;
}
.slot-creation__check:hover {
  filter: brightness(1.06);
}
</style>

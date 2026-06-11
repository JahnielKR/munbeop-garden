<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LevelBookEntry } from '~/seed/escape-room/registry'
import LevelPage from './LevelPage.vue'

/**
 * LevelBook — the flippable notebook of escape-room levels.
 *
 * One LevelPage visible at a time; prev/next flip through entries with a
 * small page-turn animation. Keyboard arrows work too. Emits `start` up
 * from the active page.
 */

interface Props {
  entries: LevelBookEntry[]
}

const props = defineProps<Props>()
defineEmits<{ start: [levelId: string] }>()

const { t } = useI18n()

const index = ref(0)
/** Drives the flip animation: 'left' | 'right' | null. */
const turning = ref<'left' | 'right' | null>(null)

const current = computed(() => props.entries[index.value] ?? null)
const isFirst = computed(() => index.value === 0)
const isLast = computed(() => index.value >= props.entries.length - 1)

function flip(dir: 'prev' | 'next') {
  if (dir === 'prev' && isFirst.value) return
  if (dir === 'next' && isLast.value) return
  turning.value = dir === 'next' ? 'left' : 'right'
  index.value += dir === 'next' ? 1 : -1
  // Animation class clears after the CSS transition window.
  window.setTimeout(() => (turning.value = null), 240)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') flip('next')
  if (e.key === 'ArrowLeft') flip('prev')
}
</script>

<template>
  <div class="book" tabindex="0" @keydown="onKeydown">
    <!-- Spiral binding -->
    <div class="book__spine" aria-hidden="true">
      <span v-for="i in 10" :key="i" class="book__ring" />
    </div>

    <div class="book__page-area">
      <Transition :name="turning === 'right' ? 'page-right' : 'page-left'" mode="out-in">
        <LevelPage
          v-if="current"
          :key="current.id"
          :entry="current"
          @start="(id) => $emit('start', id)"
        />
      </Transition>
    </div>

    <!-- Nav -->
    <div class="book__nav">
      <button
        type="button"
        class="book__nav-btn"
        data-testid="book-prev"
        :disabled="isFirst"
        :aria-label="t('escape.prev_page')"
        @click="flip('prev')"
      >
        ◀
      </button>
      <span class="book__indicator" data-testid="book-indicator">
        {{ index + 1 }} / {{ entries.length }}
      </span>
      <button
        type="button"
        class="book__nav-btn"
        data-testid="book-next"
        :disabled="isLast"
        :aria-label="t('escape.next_page')"
        @click="flip('next')"
      >
        ▶
      </button>
    </div>
  </div>
</template>

<style scoped>
.book {
  position: relative;
  max-width: 560px;
  margin: 0 auto;
  padding-left: 26px;
  outline: none;
}
.book:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 4px;
}

.book__spine {
  position: absolute;
  left: 0;
  top: 24px;
  bottom: 60px;
  width: 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  z-index: 2;
}
.book__ring {
  width: 18px;
  height: 10px;
  border: 2px solid var(--border-strong, #6b5b4a);
  border-radius: 50%;
  background: var(--paper-warm, #fbf3e2);
  box-shadow: inset 0 -2px 0 rgba(60, 42, 24, 0.2);
}

.book__page-area {
  position: relative;
  perspective: 1200px;
}

.book__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 14px;
}
.book__nav-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 10px 16px;
  min-width: 44px;
  min-height: 44px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: var(--paper-warm, #fbf3e2);
  cursor: pointer;
  box-shadow: 3px 3px 0 rgba(60, 42, 24, 0.3);
  transition: transform 100ms, box-shadow 100ms;
}
.book__nav-btn:hover:not(:disabled) {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 rgba(60, 42, 24, 0.3);
}
.book__nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.book__nav-btn:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}
.book__indicator {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
}

/* Page-turn transitions */
.page-left-enter-active,
.page-left-leave-active,
.page-right-enter-active,
.page-right-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
  transform-origin: left center;
}
.page-left-leave-to {
  transform: rotateY(-26deg) translateX(-14px);
  opacity: 0;
}
.page-left-enter-from {
  transform: translateX(22px);
  opacity: 0;
}
.page-right-leave-to {
  transform: translateX(22px);
  opacity: 0;
}
.page-right-enter-from {
  transform: rotateY(-26deg) translateX(-14px);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-left-enter-active,
  .page-left-leave-active,
  .page-right-enter-active,
  .page-right-leave-active {
    transition-duration: 1ms;
  }
}
</style>

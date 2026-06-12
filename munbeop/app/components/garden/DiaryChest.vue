<script setup lang="ts">
/**
 * DiaryChest — the practice diary lives under the roots (spec §5.1).
 *
 * Pixel chest sprite by the trunk; the badge counts diary entries still
 * waiting for review (the same number that drives the weather). Click
 * navigates to /log. Positioned by CHEST_ANCHOR inside the tree wrapper.
 */
import { CHEST_ANCHOR } from '~/lib/garden/zone-anchors'

interface Props {
  /** Unreviewed hard/error sentences (badge hidden at 0). */
  pending: number
}

const props = defineProps<Props>()

const { t } = useI18n()

const label = () =>
  props.pending > 0
    ? `${t('garden.diary_chest')} — ${t('garden.diary_pending', { n: props.pending })}`
    : t('garden.diary_chest')
</script>

<template>
  <button
    type="button"
    class="chest"
    :style="{ top: CHEST_ANCHOR.top, left: CHEST_ANCHOR.left }"
    :aria-label="label()"
    @click="navigateTo('/log')"
  >
    <img class="chest__sprite pixel" src="/img/tree/ui/chest_16.png" alt="" width="32" height="32" draggable="false" />
    <span v-if="pending > 0" class="chest__badge font-pixel">{{ pending > 9 ? '9+' : pending }}</span>
    <span class="chest__tip" role="tooltip">{{ label() }}</span>
  </button>
</template>

<style scoped>
.chest {
  position: absolute;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.chest__sprite {
  image-rendering: pixelated;
  transition: transform 120ms ease;
}

.chest:hover .chest__sprite,
.chest:focus-visible .chest__sprite {
  transform: translateY(-2px);
}

.chest:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -4px;
}

.chest__badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  background: var(--red);
  color: var(--always-cream);
  border: 2px solid var(--always-dark);
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
}

.chest__tip {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 190px;
  padding: 5px 8px;
  background: var(--paper-deep);
  color: var(--ink);
  border: 2px solid var(--ink-line);
  box-shadow: 2px 2px 0 var(--shadow-color);
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 11px;
  text-align: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 5;
}

.chest:hover .chest__tip,
.chest:focus-visible .chest__tip {
  opacity: 1;
  visibility: visible;
}

@media (prefers-reduced-motion: reduce) {
  .chest__sprite {
    transition: none;
  }
}
</style>

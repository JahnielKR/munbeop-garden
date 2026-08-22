<script setup lang="ts">
import { usePremioSummary } from '~/composables/usePremioSummary'

defineProps<{ collapsed?: boolean }>()

const { t } = useI18n()
const { totalCount, unlockedCount, tierSlots } = usePremioSummary()
</script>

<template>
  <div v-if="!collapsed" class="premios">
    <div class="premios__head">
      <span class="premios__title">{{ t('escape.premios_title') }}</span>
      <span class="premios__count" :class="{ 'premios__count--has': unlockedCount > 0 }">
        {{ unlockedCount }}/{{ totalCount }}
      </span>
    </div>
    <ul class="premios__strip">
      <li
        v-for="slot in tierSlots"
        :key="slot.tier"
        class="premio"
        :class="[`premio--${slot.tier}`, slot.unlocked ? 'premio--unlocked' : 'premio--locked']"
        :title="t(`escape.tier_${slot.tier}`)"
      >
        <img v-if="slot.unlocked" class="premio__icon" :src="slot.shown.url" alt="" >
        <span v-else class="premio__lock" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12" shape-rendering="crispEdges">
            <path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2" />
            <rect x="3.5" y="7" width="9" height="7" fill="currentColor" />
          </svg>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.premios {
  --tier-epic: #8a5cd0;
  width: 100%;
}
[data-theme='dark'] .premios {
  --tier-epic: #a982f0;
}
.premios__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.premios__title,
.premios__count {
  color: var(--ink-soft);
  font-family: var(--font-pixel-small);
  font-size: 8px;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
}
.premios__count--has {
  color: var(--gold);
}
.premios__strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.premio {
  --tier: var(--ink-line);
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  aspect-ratio: 1;
  padding: 3px;
  border: 2px solid var(--ink-line);
}
.premio__icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
.premio__lock {
  display: grid;
  place-items: center;
  color: var(--ink-soft);
  opacity: 0.55;
}
.premio--common {
  --tier: var(--jade);
}
.premio--rare {
  --tier: var(--sky);
}
.premio--epic {
  --tier: var(--tier-epic);
}
.premio--legendary {
  --tier: var(--gold);
}
.premio--unlocked {
  border-color: var(--tier);
  background: var(--paper-deep);
  box-shadow:
    inset 0 0 0 1px var(--tier),
    var(--shadow-pixel-sm);
}
.premio--unlocked.premio--legendary {
  box-shadow:
    inset 0 0 0 1px var(--always-dark),
    inset 0 0 0 2px var(--gold),
    var(--shadow-pixel-sm);
}
.premio--locked {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--ink-line) 55%, transparent);
  background: var(--paper);
  box-shadow: var(--shadow-inset);
}
.premio--locked::after {
  position: absolute;
  right: 28%;
  bottom: 3px;
  left: 28%;
  height: 0;
  border-bottom: 2px dotted var(--tier);
  opacity: 0.5;
  content: '';
}
:lang(th) .premios__title,
:lang(vi) .premios__title,
:lang(ja) .premios__title,
:lang(th) .premios__count,
:lang(vi) .premios__count,
:lang(ja) .premios__count {
  font-size: 10px;
}
</style>

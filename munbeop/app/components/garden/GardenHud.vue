<script setup lang="ts">
/**
 * GardenHud — retro status row under the garden stage (spec §5.1).
 *
 * Level + species (Korean name stays Korean in every locale), gold
 * progress bar with the numeric %, textual growth state (a11y §8: the
 * progress always exists as text, never only as graphics) and the
 * practice CTA.
 */
import { computed } from 'vue'
import Button from '~/components/ui/Button.vue'

interface Props {
  level: number
  /** Korean species name (벚꽃…) — never translated. */
  speciesKo: string
  /** Localized species name (t('garden.species.*')). */
  speciesLabel: string
  pct: number
  /** Suffix of garden.state.* — dormant | sprouting | leafy | bloom. */
  stateKey: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const stateLabel = computed(() => t(`garden.state.${props.stateKey}`))
</script>

<template>
  <div class="hud">
    <div class="hud__id">
      <span class="hud__level font-pixel">{{ t('garden.level', { n: level }) }}</span>
      <span class="hud__species"><span lang="ko">{{ speciesKo }}</span> · {{ speciesLabel }}</span>
    </div>

    <div
      class="hud__bar"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`${t('garden.level', { n: level })} — ${stateLabel}`"
    >
      <div class="hud__fill" :style="{ width: `${pct}%` }" />
      <span class="hud__pct font-pixel">{{ pct }}%</span>
    </div>

    <span class="hud__state">{{ stateLabel }}</span>

    <Button size="sm" @click="navigateTo('/practice')">
      {{ t('garden.practice_cta') }}
    </Button>
  </div>
</template>

<style scoped>
.hud {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  background: var(--paper-deep);
  border: 2px solid var(--ink-line);
  padding: 12px 16px;
}

.hud__id {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
}

.hud__level {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 11px;
  color: var(--text);
}

.hud__species {
  font-size: 13px;
  color: var(--text-soft);
}

.hud__species [lang='ko'] {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  color: var(--text);
}

.hud__bar {
  position: relative;
  flex: 1;
  min-width: 140px;
  height: 18px;
  background: var(--paper);
  border: 2px solid var(--ink-line);
}

.hud__fill {
  height: 100%;
  background: var(--gold);
  transition: width 0.6s ease;
}

.hud__pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  color: var(--ink);
  text-shadow: 0 0 2px var(--paper), 0 0 2px var(--paper);
}

.hud__state {
  font-size: 13px;
  color: var(--text-soft);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .hud__fill {
    transition: none;
  }
}

@media (max-width: 640px) {
  .hud {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .hud__bar {
    /* in the column layout the main axis is vertical: flex-basis 0% from
     * `flex: 1` would collapse the bar's height — pin it back */
    flex: 0 0 auto;
    width: 100%;
  }

  .hud__state {
    text-align: center;
  }
}
</style>

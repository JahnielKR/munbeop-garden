<script setup lang="ts">
import type { Hints } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'

/**
 * HintPanel — two-tier hint UI for a single puzzle.
 *
 * Free pista: vocab/conceptual, no penalty.
 * Premium pista: pattern/rule. Using it caps the run's reward at 🟢 Común
 * (regla canónica documentada en `docs/escape-room.md` §5/§7).
 */

interface Props {
  hints: Hints
  flags: { free: boolean; premium: boolean }
}

defineProps<Props>()
defineEmits<{ 'use-free': []; 'use-premium': [] }>()

const { tl } = useLocalized()
const { t } = useI18n()
</script>

<template>
  <div class="hint-panel">
    <!-- Pista 1 (gratis) -->
    <div class="hint-panel__row" data-testid="hint-free-row">
      <button
        v-if="!flags.free"
        type="button"
        class="hint-panel__btn hint-panel__btn--free"
        data-testid="hint-free-btn"
        @click="$emit('use-free')"
      >
        💡 {{ t('escape.hint_free') }}
      </button>
      <p v-else class="hint-panel__text hint-panel__text--free" data-testid="hint-free-text">
        {{ tl(hints.free) }}
      </p>
    </div>

    <!-- Pista 2 (cuesta tier) -->
    <div class="hint-panel__row" data-testid="hint-premium-row">
      <button
        v-if="!flags.premium"
        type="button"
        class="hint-panel__btn hint-panel__btn--premium"
        data-testid="hint-premium-btn"
        @click="$emit('use-premium')"
      >
        🔓 {{ t('escape.hint_premium') }} · {{ t('escape.hint_premium_warn') }}
      </button>
      <p
        v-else
        class="hint-panel__text hint-panel__text--premium"
        data-testid="hint-premium-text"
      >
        {{ tl(hints.premium) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.hint-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 2px dashed var(--border-strong, #6b5b4a);
  background: var(--surface, #fff7eb);
}
.hint-panel__btn {
  font-family: inherit;
  font-size: 11px;
  padding: 8px 12px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
}
.hint-panel__btn--premium {
  border-style: dotted;
  color: var(--text-muted, #8a6f4a);
}
.hint-panel__btn:hover {
  background: var(--surface-hover, #f5e9cf);
}
.hint-panel__text {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  padding: 6px 4px;
}
.hint-panel__text--premium {
  font-style: italic;
  color: var(--text-muted, #8a6f4a);
}
</style>

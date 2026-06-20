<script setup lang="ts">
import { computed } from 'vue'
import type { ParticleDef, ParticleId } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import { particleById } from '~/seed/particles'

/** Legend of particles in the current sentence. Tap an item → info popover (D3). */
interface Props {
  ids: ParticleId[]
}
const props = defineProps<Props>()
const emit = defineEmits<{ info: [id: ParticleId] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const defs = computed<ParticleDef[]>(
  () => props.ids.map((id) => particleById(id)).filter((d): d is ParticleDef => d !== undefined),
)
</script>

<template>
  <div class="legend">
    <h3 class="legend__title">{{ t('particles.explore.legend_title') }}</h3>
    <div class="legend__items">
      <button
        v-for="def in defs"
        :key="def.id"
        type="button"
        class="legend__item"
        aria-haspopup="dialog"
        data-testid="legend-item"
        @click="emit('info', def.id)"
      >
        <span class="legend__swatch" :class="`legend__swatch--${def.role}`" aria-hidden="true" />
        <span class="legend__ko" lang="ko">{{ def.ko }}</span>
        <span class="legend__label">{{ tl(def.label) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.legend__title {
  margin: 0 0 8px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.legend__items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--surface);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: transform var(--motion-quick) var(--ease-out);
}
.legend__item:hover {
  transform: translate(-1px, -1px);
}
.legend__item:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.legend__swatch {
  width: 10px;
  height: 10px;
  border: 1px solid var(--always-dark);
}
.legend__swatch--topic { background: var(--gold); }
.legend__swatch--subject { background: var(--jade); }
.legend__swatch--object { background: var(--sky); }
.legend__swatch--place { background: var(--red); }
.legend__swatch--addition { background: var(--paper-deep); }
.legend__swatch--recipient { background: var(--plum); }
.legend__swatch--means { background: var(--teal); }
.legend__swatch--connective { background: var(--rose); }
.legend__ko {
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--text);
}
.legend__label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
</style>

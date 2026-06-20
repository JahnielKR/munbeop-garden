<script setup lang="ts">
import Icon, { type IconName } from '~/components/ui/Icon.vue'
import type { CustomDeckOption } from '~/components/games/ruleta/cards'

interface Props {
  options: CustomDeckOption[]
}
defineProps<Props>()
defineEmits<{ select: [deckId: string]; create: []; edit: [deckId: string] }>()

const { t } = useI18n()
</script>

<template>
  <section class="custom-shelf" data-testid="custom-deck-shelf">
    <h2 class="custom-shelf__title">{{ t('practice.custom.section') }}</h2>

    <!-- Empty: expanded create prompt -->
    <button
      v-if="options.length === 0"
      type="button"
      class="custom-empty"
      data-testid="custom-deck-create"
      @click="$emit('create')"
    >
      <span class="custom-empty__plus" aria-hidden="true"><Icon name="deck-star" :size="22" /></span>
      <span class="custom-empty__title">{{ t('practice.custom.empty_title') }}</span>
      <span class="custom-empty__hint">{{ t('practice.custom.empty_hint') }}</span>
    </button>

    <!-- Populated: mats + trailing add tile -->
    <div v-else class="custom-grid">
      <div v-for="o in options" :key="o.id" class="custom-mat-wrap">
        <button
          type="button"
          class="custom-mat"
          :class="{ 'custom-mat--locked': o.disabled }"
          :disabled="o.disabled"
          :data-testid="`custom-deck-${o.id}`"
          @click="$emit('select', o.id)"
        >
          <span class="custom-mat__cover" aria-hidden="true" :style="{ '--mat-color': o.colors[0] }">
            <img v-if="o.imageUrl" :src="o.imageUrl" alt="" class="custom-mat__img" />
            <Icon v-else :name="(o.icon as IconName)" :size="34" />
          </span>
          <span class="custom-mat__name">{{ o.name }}</span>
          <span class="custom-mat__count">{{ t('practice.deck_count', { n: o.count }) }}</span>
          <span v-if="o.reason === 'too_few'" class="custom-mat__locked">
            {{ t('practice.custom.locked_need_six') }}
          </span>
        </button>
        <button
          type="button"
          class="custom-mat__edit"
          :data-testid="`custom-deck-edit-${o.id}`"
          :aria-label="t('practice.custom.edit')"
          @click.stop="$emit('edit', o.id)"
        >
          <Icon name="deck-edit" :size="16" />
        </button>
      </div>

      <button
        type="button"
        class="custom-mat custom-mat--add"
        data-testid="custom-deck-create"
        @click="$emit('create')"
      >
        <span class="custom-mat__cover custom-mat__cover--add" aria-hidden="true">
          <span class="custom-mat__plus">+</span>
        </span>
        <span class="custom-mat__name">{{ t('practice.custom.create') }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.custom-shelf {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.custom-shelf__title {
  margin: 0;
  font: inherit;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-soft, var(--ink-soft));
  text-align: center;
}

/* Empty state: one long rectangle, deployed, with the create prompt */
.custom-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px;
  background: transparent;
  border: 2px dashed var(--border-strong, var(--border));
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  color: inherit;
}
.custom-empty:hover,
.custom-empty:focus-visible {
  border-color: var(--focus-ring, #d8842f);
}
.custom-empty:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}
.custom-empty__plus {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-strong, var(--border));
  border-radius: 50%;
}
.custom-empty__title {
  font-weight: 600;
}
.custom-empty__hint {
  font-size: 0.85rem;
  color: var(--text-soft, var(--ink-soft));
  text-align: center;
  max-width: 32ch;
  line-height: 1.5;
}

/* Populated: larger mats (~1.5x a TOPIK mat) inside the long rectangle */
.custom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 18px;
  padding: 14px;
  border: 2px solid var(--border-strong, var(--border));
  border-radius: 10px;
}
.custom-mat-wrap {
  position: relative;
}
.custom-mat {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px 14px;
  background: var(--paper-warm, var(--surface));
  border: 3px solid var(--border-strong, var(--border));
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transform: translate(0, 0);
  transition:
    transform var(--motion-quick, 120ms) var(--ease-out, ease-out),
    box-shadow var(--motion-quick, 120ms) var(--ease-out, ease-out);
}
.custom-mat:hover:not(:disabled),
.custom-mat:focus-visible:not(:disabled) {
  transform: translate(-2px, -3px);
  box-shadow: var(--shadow-button-hover, 7px 8px 0 rgba(60, 42, 24, 0.35));
}
.custom-mat:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-pixel-sm, 2px 2px 0 rgba(60, 42, 24, 0.35));
}
.custom-mat:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}
.custom-mat--locked {
  cursor: not-allowed;
}
.custom-mat--locked .custom-mat__cover,
.custom-mat--locked .custom-mat__count {
  opacity: 0.45;
}

.custom-mat__cover {
  width: 100%;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--mat-color, var(--ink-soft));
  background: color-mix(in srgb, var(--mat-color, var(--ink-soft)) 18%, var(--surface));
  overflow: hidden;
}
.custom-mat__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.custom-mat__name {
  font-weight: 600;
  text-align: center;
}
.custom-mat__count {
  font-size: 0.8rem;
  color: var(--text-soft, var(--ink-soft));
}
.custom-mat__locked {
  font-size: 0.78rem;
  color: var(--text-soft, var(--ink-soft));
  text-align: center;
}

.custom-mat__edit {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  color: inherit;
  border: 2px solid var(--border-strong, var(--border));
  border-radius: 50%;
  cursor: pointer;
}
.custom-mat__edit:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}

.custom-mat--add {
  justify-content: center;
}
.custom-mat__cover--add {
  background: transparent;
  border: 2px dashed var(--border-strong, var(--border));
}
.custom-mat__plus {
  font-size: 2rem;
  line-height: 1;
  color: var(--text-soft, var(--ink-soft));
}
</style>

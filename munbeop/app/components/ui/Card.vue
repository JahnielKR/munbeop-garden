<script setup lang="ts">
/**
 * Card primitive (v2 polish).
 *
 * Surface-aware via `inject('surface')` from AppShell. In study chrome,
 * left accent stripe (6 px). In game chrome, border-color flips to
 * --border-strong and 4× pixel ornaments paint at the corners.
 *
 * Shadow now consumes `--shadow-card` (chunky pixel via --shadow-color,
 * theme-aware). Ornaments fill via currentColor on .card__corner, which
 * inherits --accent — that re-points per theme (jade-deep light, jade
 * bright dark) so the ornaments stay visible in both modes.
 *
 * `clickable` turns the root into a `<button>` with hover lift / press
 * sink / focus ring. `selected` thickens the border.
 */
import { inject, ref, type Ref } from 'vue'

interface Props {
  accent?: 'red' | 'sky' | 'jade' | 'gold' | 'none'
  clickable?: boolean
  selected?: boolean
}
withDefaults(defineProps<Props>(), { accent: 'jade', clickable: false, selected: false })
defineEmits<{ click: [MouseEvent] }>()

const surface = inject<Ref<'study' | 'game'>>('surface', ref('study'))
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    class="card"
    :class="[`card--${accent}`, { 'card--clickable': clickable, 'card--selected': selected }]"
    :data-surface="surface"
    @click="clickable && $emit('click', $event)"
  >
    <slot />
    <template v-if="surface === 'game'">
      <span class="card__corner card__corner--tl" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M0 0h3v1H0zM0 1h2v1H0zM0 2h1v1H0z" fill="currentColor" />
        </svg>
      </span>
      <span class="card__corner card__corner--tr" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M3 0h3v1H3zM4 1h2v1H4zM5 2h1v1H5z" fill="currentColor" />
        </svg>
      </span>
      <span class="card__corner card__corner--bl" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M0 5h3v1H0zM0 4h2v1H0zM0 3h1v1H0z" fill="currentColor" />
        </svg>
      </span>
      <span class="card__corner card__corner--br" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M3 5h3v1H3zM4 4h2v1H4zM5 3h1v1H5z" fill="currentColor" />
        </svg>
      </span>
    </template>
  </component>
</template>

<style scoped>
.card {
  position: relative;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  border-left-width: 6px;
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
  text-align: left;
  font: inherit;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.card[data-surface='game'] {
  border-color: var(--border-strong);
}
.card--red { border-left-color: var(--red); }
.card--sky { border-left-color: var(--sky); }
.card--jade { border-left-color: var(--jade); }
.card--gold { border-left-color: var(--gold); }
.card--none { border-left-width: 2px; }

.card--clickable {
  cursor: pointer;
  width: 100%;
  display: block;
}
.card--clickable:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-card-hover);
}
.card--clickable:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-pixel-sm);
}
.card--clickable:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.card--selected {
  border-color: var(--border-strong);
}

.card__corner {
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
  z-index: 1;
  color: var(--accent);
}
.card__corner--tl { top: -1px; left: -1px; }
.card__corner--tr { top: -1px; right: -1px; }
.card__corner--bl { bottom: -1px; left: -1px; }
.card__corner--br { bottom: -1px; right: -1px; }
</style>

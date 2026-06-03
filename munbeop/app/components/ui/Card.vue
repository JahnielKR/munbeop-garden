<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'

interface Props {
  accent?: 'red' | 'sky' | 'jade' | 'gold'
}
withDefaults(defineProps<Props>(), { accent: 'jade' })

const surface = inject<Ref<'study' | 'game'>>('surface', ref('study'))
</script>

<template>
  <div class="card" :class="`card--${accent}`" :data-surface="surface">
    <slot />
    <template v-if="surface === 'game'">
      <span class="card__corner card__corner--tl" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M0 0h3v1H0zM0 1h2v1H0zM0 2h1v1H0z" fill="#185f24" />
        </svg>
      </span>
      <span class="card__corner card__corner--tr" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M3 0h3v1H3zM4 1h2v1H4zM5 2h1v1H5z" fill="#185f24" />
        </svg>
      </span>
      <span class="card__corner card__corner--bl" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M0 5h3v1H0zM0 4h2v1H0zM0 3h1v1H0z" fill="#185f24" />
        </svg>
      </span>
      <span class="card__corner card__corner--br" aria-hidden="true">
        <svg viewBox="0 0 6 6" width="6" height="6" shape-rendering="crispEdges">
          <path d="M3 5h3v1H3zM4 4h2v1H4zM5 3h1v1H5z" fill="#185f24" />
        </svg>
      </span>
    </template>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-left-width: 6px;
  padding: 18px 20px;
  box-shadow: 4px 4px 0 var(--paper-deep);
}
.card[data-surface='game'] {
  border-color: var(--border-strong);
}
.card--red {
  border-left-color: var(--red);
}
.card--sky {
  border-left-color: var(--sky);
}
.card--jade {
  border-left-color: var(--jade);
}
.card--gold {
  border-left-color: var(--gold);
}
.card__corner {
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
  z-index: 1;
}
.card__corner--tl {
  top: -1px;
  left: -1px;
}
.card__corner--tr {
  top: -1px;
  right: -1px;
}
.card__corner--bl {
  bottom: -1px;
  left: -1px;
}
.card__corner--br {
  bottom: -1px;
  right: -1px;
}
</style>

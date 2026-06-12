<script setup lang="ts">
/**
 * PixelCardBack — the face-down card sprite, drawn on a 20×28 pixel grid.
 *
 * Paper frame with notched corners, a colored panel tinted per TOPIK deck,
 * and a hanji-style diamond motif. Sized by the parent via CSS width;
 * keeps 5:7 through the viewBox.
 */
interface Props {
  /** Resolved CSS color (e.g. `var(--sky)`) for the panel. */
  color: string
}
defineProps<Props>()
</script>

<template>
  <svg
    viewBox="0 0 20 28"
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="crispEdges"
    class="card-back"
    aria-hidden="true"
  >
    <!-- dark outline, notched pixel corners -->
    <rect x="2" y="0" width="16" height="1" class="card-back__ink" />
    <rect x="2" y="27" width="16" height="1" class="card-back__ink" />
    <rect x="0" y="2" width="1" height="24" class="card-back__ink" />
    <rect x="19" y="2" width="1" height="24" class="card-back__ink" />
    <rect x="1" y="1" width="1" height="1" class="card-back__ink" />
    <rect x="18" y="1" width="1" height="1" class="card-back__ink" />
    <rect x="1" y="26" width="1" height="1" class="card-back__ink" />
    <rect x="18" y="26" width="1" height="1" class="card-back__ink" />

    <!-- paper body (two overlapping rects make the corner notches) -->
    <rect x="1" y="2" width="18" height="24" class="card-back__paper" />
    <rect x="2" y="1" width="16" height="26" class="card-back__paper" />

    <!-- deck-colored panel -->
    <rect x="3" y="4" width="14" height="20" :fill="color" />
    <!-- panel bevel: light top/left, shaded bottom/right -->
    <rect x="3" y="4" width="14" height="1" fill="rgba(255, 255, 255, 0.28)" />
    <rect x="3" y="4" width="1" height="20" fill="rgba(255, 255, 255, 0.28)" />
    <rect x="3" y="23" width="14" height="1" fill="rgba(0, 0, 0, 0.22)" />
    <rect x="16" y="5" width="1" height="19" fill="rgba(0, 0, 0, 0.22)" />

    <!-- hanji diamond motif, paper-colored -->
    <rect x="9" y="11" width="2" height="1" class="card-back__paper" />
    <rect x="8" y="12" width="4" height="1" class="card-back__paper" />
    <rect x="7" y="13" width="6" height="2" class="card-back__paper" />
    <rect x="8" y="15" width="4" height="1" class="card-back__paper" />
    <rect x="9" y="16" width="2" height="1" class="card-back__paper" />
    <!-- diamond core pixel back in deck color -->
    <rect x="9" y="13" width="2" height="2" :fill="color" />

    <!-- corner dots -->
    <rect x="5" y="7" width="1" height="1" class="card-back__paper" />
    <rect x="14" y="7" width="1" height="1" class="card-back__paper" />
    <rect x="5" y="20" width="1" height="1" class="card-back__paper" />
    <rect x="14" y="20" width="1" height="1" class="card-back__paper" />
  </svg>
</template>

<style scoped>
.card-back {
  display: block;
  width: 100%;
  height: auto;
}
.card-back__ink {
  fill: var(--border-strong, var(--border));
}
.card-back__paper {
  fill: var(--paper-warm, var(--surface));
}
</style>

<script setup lang="ts">
/**
 * BomiHat — rows 5-14 of the sprite.
 *
 * Will eventually be wrapped in <motion.g> for the play-hat easter
 * egg (Task 4). For now: static group renders a straw hat with crown,
 * ribbon band, and floppy brim. transform-origin will be (16, 14) —
 * bottom-center of the brim — so the hat tips around where it meets
 * the head.
 *
 * Render order: this paints AFTER eyes so the brim can cover them
 * during extreme rotation (intentional per spec §3.12).
 */
</script>

<template>
  <g id="hat" shape-rendering="crispEdges" style="transform-origin: 16px 14px">
    <!-- Crown — straw fill rows 5-9, crown narrows toward top -->
    <!-- Row 5 (narrow top): cols 11-20 -->
    <rect x="11" y="5" width="10" height="1" fill="#f0c84a" />
    <!-- Row 6-7: cols 10-21 -->
    <rect x="10" y="6" width="12" height="2" fill="#f0c84a" />
    <!-- Crown weave-texture line (single pixel row) -->
    <rect x="11" y="7" width="10" height="1" fill="#a8741e" />
    <!-- Row 8-9: crown widens -->
    <rect x="10" y="8" width="12" height="2" fill="#f0c84a" />

    <!-- Ribbon band (rows 10-11) — wraps around crown -->
    <rect x="10" y="10" width="12" height="2" fill="#c23e3e" />
    <!-- Ribbon knot (tiny detail on left side) -->
    <rect x="9" y="10" width="1" height="2" fill="#9d2e2e" />
    <rect x="8" y="11" width="1" height="1" fill="#9d2e2e" />

    <!-- Brim (rows 12-14) — floppy, wider than crown -->
    <!-- Top of brim -->
    <rect x="6" y="12" width="20" height="1" fill="#f0c84a" />
    <!-- Middle of brim — main straw color + shadow under -->
    <rect x="5" y="13" width="22" height="1" fill="#f0c84a" />
    <!-- Bottom edge of brim — straw-shadow -->
    <rect x="5" y="14" width="22" height="1" fill="#c89030" />

    <!-- Crown left/right outline (subtle straw-shadow against face) -->
    <rect x="9" y="6" width="1" height="4" fill="#c89030" />
    <rect x="22" y="6" width="1" height="4" fill="#c89030" />
  </g>
</template>

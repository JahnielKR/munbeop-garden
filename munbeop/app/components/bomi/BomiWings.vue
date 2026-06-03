<script setup lang="ts">
/**
 * BomiWings — wing group.
 *
 * Will become a <motion.g> in Task 4 with scaleX flap animation.
 * For Task 2: static, rendered as if the wings are at rest.
 *
 * Wings paint AFTER body/abdomen so they appear behind the bee's
 * silhouette (visible only where they extend past the body). Per
 * spec §3.12 render order, they're between body and hat in the DOM.
 *
 * transform-origin will be (16, 24) — body center on wing-attachment
 * row — so flap scales toward attachment, not (0, 0).
 */
</script>

<template>
  <g id="wings" shape-rendering="crispEdges" style="transform-origin: 16px 24px">
    <!-- LEFT wing — extends from body upward and out -->
    <!-- Wing main (wing color) -->
    <rect x="3" y="20" width="5" height="4" fill="#ebe6d7" />
    <rect x="2" y="21" width="1" height="2" fill="#ebe6d7" />
    <!-- Wing shadow (rear edge) -->
    <rect x="3" y="23" width="5" height="1" fill="#a8b0a2" />

    <!-- RIGHT wing (mirror) -->
    <rect x="24" y="20" width="5" height="4" fill="#ebe6d7" />
    <rect x="29" y="21" width="1" height="2" fill="#ebe6d7" />
    <rect x="24" y="23" width="5" height="1" fill="#a8b0a2" />
  </g>
</template>

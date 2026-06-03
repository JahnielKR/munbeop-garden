<script setup lang="ts">
/**
 * Pixel-art icon primitive.
 *
 * Renders one of a fixed registry of inline SVGs at 16x16 viewBox with
 * shape-rendering:crispEdges. Sizes other than integer multiples of 16
 * are accepted (sidebar 18px, mobile-nav 22px) — slight subpixel softness
 * is the accepted tradeoff for layout fit, mitigated by crispEdges.
 *
 * All colors come from the brand palette (01-tokens.md §1.1) plus
 * `currentColor` for nav silhouettes — that lets the active sidebar link
 * color cascade onto the icon automatically.
 *
 * Mastery icons hardcode their palette so they read consistently in any
 * surface (cards, badges, modals).
 */

export type IconName =
  | 'home'
  | 'practice'
  | 'library'
  | 'stats'
  | 'log'
  | 'settings'
  | 'mastery-seedling'
  | 'mastery-plant'
  | 'mastery-tree'

interface Props {
  name: IconName
  /** Render size in px. Default 16. Integer multiples of 16 render crispest. */
  size?: number
  /** ARIA label. Empty string keeps the icon decorative (aria-hidden). */
  label?: string
}

const props = withDefaults(defineProps<Props>(), { size: 16, label: '' })
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="crispEdges"
    :aria-label="props.label || undefined"
    :aria-hidden="props.label ? undefined : true"
    role="img"
    class="icon"
  >
    <!-- home: cottage with chimney, red triangular roof, sky window, ink-soft door -->
    <template v-if="name === 'home'">
      <!-- chimney (2x2) at upper-right of roof -->
      <path d="M11 2h2v2h-2z" fill="currentColor" />
      <!-- red roof: stepped triangle, 5 rows -->
      <path
        d="M8 3h1v1H8z M7 4h3v1H7z M6 5h5v1H6z M5 6h7v1H5z M4 7h9v1H4z"
        fill="#e83838"
      />
      <!-- walls: 9x6 rectangle below roof -->
      <path d="M4 8h9v6H4z" fill="currentColor" />
      <!-- sky-blue window (left of door) -->
      <path d="M5 9h2v2H5z" fill="#5fb8e8" />
      <!-- ink-soft door (right side) -->
      <path d="M9 10h3v4H9z" fill="#4a3a1f" />
    </template>

    <!-- practice: 6-sided die showing the "5" face -->
    <template v-if="name === 'practice'">
      <!-- die outer outline (10x10 box) -->
      <path
        d="M3 3h10v1H3z M3 12h10v1H3z M3 4h1v8H3z M12 4h1v8h-1z"
        fill="currentColor"
      />
      <!-- five pips: 4 corners + center -->
      <path
        d="M5 5h1v1H5z M10 5h1v1h-1z M7 7h1v1H7z M5 10h1v1H5z M10 10h1v1h-1z"
        fill="currentColor"
      />
    </template>

    <!-- library: 3 stacked books, distinct palette spine colors -->
    <template v-if="name === 'library'">
      <!-- top book: jade-deep -->
      <path d="M3 4h10v2H3z" fill="#185f24" />
      <!-- top book page highlight -->
      <path d="M4 5h1v1H4z" fill="#f5c533" />
      <!-- middle book: red-deep -->
      <path d="M3 7h10v3H3z" fill="#9d2525" />
      <!-- middle book page highlight -->
      <path d="M4 8h1v1H4z" fill="#f5c533" />
      <!-- bottom book: gold body -->
      <path d="M3 11h10v3H3z" fill="#f5c533" />
      <!-- bottom book dark spine band (ink-soft) -->
      <path d="M3 11h10v1H3z" fill="#4a3a1f" />
    </template>

    <!-- stats: 3 ascending bars -->
    <template v-if="name === 'stats'">
      <!-- baseline (1 row) -->
      <path d="M3 13h10v1H3z" fill="currentColor" />
      <!-- bar 1: short, 2x3 -->
      <path d="M4 10h2v3H4z" fill="currentColor" />
      <!-- bar 2: medium, 2x5 -->
      <path d="M7 8h2v5H7z" fill="currentColor" />
      <!-- bar 3: tall, 2x7 -->
      <path d="M10 6h2v7h-2z" fill="currentColor" />
    </template>

    <!-- log: rolled scroll with text lines -->
    <template v-if="name === 'log'">
      <!-- top rolled end ring (currentColor) -->
      <path
        d="M4 3h8v1H4z M3 4h1v2H3z M12 4h1v2h-1z M4 5h8v1H4z"
        fill="currentColor"
      />
      <!-- scroll body fill (paper-warm) -->
      <path d="M4 6h8v6H4z" fill="#f1e5b8" />
      <!-- scroll body side rails (currentColor) -->
      <path d="M3 6h1v6H3z M12 6h1v6h-1z" fill="currentColor" />
      <!-- text lines on scroll (ink-soft) -->
      <path
        d="M5 7h5v1H5z M5 9h5v1H5z M5 11h3v1H5z"
        fill="#4a3a1f"
      />
      <!-- bottom rolled end ring -->
      <path
        d="M4 12h8v1H4z M3 13h1v1H3z M12 13h1v1h-1z M4 13h8v1H4z"
        fill="currentColor"
      />
    </template>

    <!-- settings: 4-tooth cog with center hole -->
    <template v-if="name === 'settings'">
      <!-- gear body: 8x8 square -->
      <path d="M4 4h8v8H4z" fill="currentColor" />
      <!-- 4 cardinal teeth (2x2 each, protruding) -->
      <path d="M7 2h2v2H7z" fill="currentColor" />
      <!-- top tooth -->
      <path d="M7 12h2v2H7z" fill="currentColor" />
      <!-- bottom tooth -->
      <path d="M2 7h2v2H2z" fill="currentColor" />
      <!-- left tooth -->
      <path d="M12 7h2v2h-2z" fill="currentColor" />
      <!-- right tooth -->
      <!-- chamfer the 4 outer corners (paper bg to suggest diagonal teeth) -->
      <path
        d="M4 4h1v1H4z M11 4h1v1h-1z M4 11h1v1H4z M11 11h1v1h-1z"
        fill="#f8efd0"
      />
      <!-- center hole punched out (paper) -->
      <path d="M7 7h2v2H7z" fill="#f8efd0" />
    </template>

    <!-- mastery-seedling: dirt mound + stem + 2 leaves -->
    <template v-if="name === 'mastery-seedling'">
      <!-- dirt mound (ink-soft) -->
      <path d="M5 13h6v1H5z M4 14h8v1H4z" fill="#4a3a1f" />
      <!-- stem (jade-deep) -->
      <path d="M8 8h1v5H8z" fill="#185f24" />
      <!-- left leaf (jade) -->
      <path d="M6 9h2v1H6z M5 10h2v1H5z M6 11h1v1H6z" fill="#3aa84a" />
      <!-- right leaf (jade) -->
      <path d="M9 9h2v1H9z M10 10h2v1h-2z M10 11h1v1h-1z" fill="#3aa84a" />
      <!-- stem tip highlight -->
      <path d="M8 7h1v1H8z" fill="#3aa84a" />
    </template>

    <!-- mastery-plant: bushy plant with gold fruit -->
    <template v-if="name === 'mastery-plant'">
      <!-- dirt mound -->
      <path d="M5 14h6v1H5z" fill="#4a3a1f" />
      <!-- stem (jade-deep) -->
      <path d="M8 10h1v4H8z" fill="#185f24" />
      <!-- bushy leaves (jade), wide cluster -->
      <path
        d="M6 5h5v1H6z M5 6h7v1H5z M4 7h9v1H4z M5 8h7v1H5z M6 9h5v1H6z M7 10h3v1H7z"
        fill="#3aa84a"
      />
      <!-- jade-deep accents (depth) -->
      <path d="M4 7h1v1H4z M12 7h1v1h-1z M7 9h1v1H7z" fill="#185f24" />
      <!-- gold fruit pixel -->
      <path d="M9 6h1v1H9z" fill="#f5c533" />
    </template>

    <!-- mastery-tree: trunk + round canopy + canopy shadow -->
    <template v-if="name === 'mastery-tree'">
      <!-- trunk (ink-soft), centered, 2 wide x 4 tall -->
      <path d="M7 11h2v4H7z" fill="#4a3a1f" />
      <!-- canopy body (jade) - round, stepped -->
      <path
        d="M6 2h4v1H6z M4 3h8v1H4z M3 4h10v1H3z M3 5h10v1H3z M3 6h10v1H3z M3 7h10v1H3z M4 8h8v1H4z M5 9h6v1H5z M6 10h4v1H6z"
        fill="#3aa84a"
      />
      <!-- canopy shadow (jade-deep) along right/bottom curve -->
      <path
        d="M11 4h1v1h-1z M12 5h1v3h-1z M11 8h1v1h-1z M10 9h1v1h-1z M9 10h1v1H9z"
        fill="#185f24"
      />
    </template>
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>

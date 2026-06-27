<script setup lang="ts">
/**
 * Pixel-art icon primitive.
 *
 * Renders one of a fixed registry of inline SVGs at 16x16 viewBox with
 * shape-rendering:crispEdges. Sizes other than integer multiples of 16
 * are accepted (sidebar 18px, mobile-nav 22px) — slight subpixel softness
 * is the accepted tradeoff for layout fit, mitigated by crispEdges.
 *
 * All fills consume v5 brand tokens via `var()` (the SVGs are inline, so
 * custom properties cascade into them) — every icon re-tints with the
 * active theme instead of carrying frozen v4 hex. `currentColor` drives
 * the nav silhouettes so the active sidebar link color cascades onto the
 * icon automatically.
 *
 * Mastery icons follow the same tokens; their narrative ramp (ink-soft
 * dirt → gold fruit → jade tree) is expressed per-theme by the token
 * values themselves.
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
  | 'deck-star'
  | 'deck-flame'
  | 'deck-leaf'
  | 'deck-heart'
  | 'deck-book'
  | 'deck-bolt'
  | 'deck-edit'

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
        fill="var(--red)"
      />
      <!-- walls: 9x6 rectangle below roof -->
      <path d="M4 8h9v6H4z" fill="currentColor" />
      <!-- sky-blue window (left of door) -->
      <path d="M5 9h2v2H5z" fill="var(--sky-day)" />
      <!-- ink-soft door (right side) -->
      <path d="M9 10h3v4H9z" fill="var(--ink-soft)" />
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
      <path d="M3 4h10v2H3z" fill="var(--jade-deep)" />
      <!-- top book page highlight -->
      <path d="M4 5h1v1H4z" fill="var(--gold)" />
      <!-- middle book: red-deep -->
      <path d="M3 7h10v3H3z" fill="var(--red-deep)" />
      <!-- middle book page highlight -->
      <path d="M4 8h1v1H4z" fill="var(--gold)" />
      <!-- bottom book: gold body -->
      <path d="M3 11h10v3H3z" fill="var(--gold)" />
      <!-- bottom book dark spine band (ink-soft) -->
      <path d="M3 11h10v1H3z" fill="var(--ink-soft)" />
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
      <!-- scroll body fill (paper-deep) -->
      <path d="M4 6h8v6H4z" fill="var(--paper-deep)" />
      <!-- scroll body side rails (currentColor) -->
      <path d="M3 6h1v6H3z M12 6h1v6h-1z" fill="currentColor" />
      <!-- text lines on scroll (ink-soft) -->
      <path
        d="M5 7h5v1H5z M5 9h5v1H5z M5 11h3v1H5z"
        fill="var(--ink-soft)"
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
      <!-- chamfer the 4 outer corners (surface bg "perforates" toward the sidebar) -->
      <path
        d="M4 4h1v1H4z M11 4h1v1h-1z M4 11h1v1H4z M11 11h1v1h-1z"
        fill="var(--surface)"
      />
      <!-- center hole punched out (paper) -->
      <path d="M7 7h2v2H7z" fill="var(--surface)" />
    </template>

    <!-- mastery-seedling: a sprout in a soil mound with two splayed leaves.
         Pixel-art restyled to match the garden achievement badges
         (tools/achievements/gen_badges.py i_sprouted). Theme-safe palette:
         no inverting --ink/--paper-deep, so it reads on light & dark. -->
    <template v-if="name === 'mastery-seedling'">
      <path d="M5 12h6v1H5z" fill="var(--ink-line)" />
      <path d="M4 13h8v1H4z M5 14h6v1H5z" fill="var(--ink-soft)" />
      <path d="M8 8h1v1H8z M8 9h1v1H8z M8 10h1v1H8z M8 11h1v1H8z" fill="var(--jade-deep)" />
      <path d="M5 7h2v1H5z M4 8h3v1H4z M5 9h3v1H5z" fill="var(--jade)" />
      <path d="M7 8h1v1H7z M4 9h1v1H4z" fill="var(--jade-deep)" />
      <path d="M10 7h2v1H10z M10 8h3v1H10z M9 9h3v1H9z" fill="var(--jade)" />
      <path d="M9 8h1v1H9z M12 9h1v1H12z" fill="var(--jade-deep)" />
      <path d="M8 6h1v1H8z M8 7h1v1H8z" fill="var(--jade)" />
    </template>

    <!-- mastery-plant: a young plant in a terracotta pot (achievement
         i_taking_root style). Pot tints to a glazed blue in dark mode. -->
    <template v-if="name === 'mastery-plant'">
      <path d="M5 11h7v1H5z M6 12h5v1H6z M6 13h5v1H6z M7 14h3v1H7z" fill="var(--sky)" />
      <path d="M5 11h7v1H5z" fill="var(--ink-line)" />
      <path d="M7 14h3v1H7z" fill="var(--ink-soft)" />
      <path d="M8 7h1v1H8z M8 8h1v1H8z M8 9h1v1H8z M8 10h1v1H8z" fill="var(--jade-deep)" />
      <path d="M6 5h5v1H6z M5 6h7v1H5z M6 7h2v1H6z M9 7h2v1H9z M7 8h1v1H7z M9 8h1v1H9z" fill="var(--jade)" />
      <path d="M5 6h1v1H5z M11 6h1v1H11z M7 7h1v1H7z M9 7h1v1H9z" fill="var(--jade-deep)" />
      <path d="M8 4h1v1H8z" fill="var(--jade)" />
    </template>

    <!-- mastery-tree: a blossoming cherry tree (achievement i_tree style).
         Pink canopy with cream highlights + gold blossom hearts. Cream is
         theme-invariant so the highlights stay light in dark mode. -->
    <template v-if="name === 'mastery-tree'">
      <path d="M7 10h1v1H7z M7 11h1v1H7z M7 12h1v1H7z M7 13h1v1H7z" fill="var(--ink-line)" />
      <path d="M8 10h1v1H8z M8 11h1v1H8z M8 12h1v1H8z M8 13h1v1H8z M6 14h4v1H6z" fill="var(--ink-soft)" />
      <path d="M6 2h4v1H6z M4 3h8v1H4z M3 4h10v1H3z M3 5h10v1H3z M3 6h10v1H3z M4 7h8v1H4z M5 8h6v1H5z M6 9h4v1H6z" fill="var(--rose)" />
      <path d="M5 4h2v1H5z M4 5h2v1H4z" fill="var(--always-cream)" />
      <path d="M10 4h1v1H10z M8 5h1v1H8z M9 6h1v1H9z M6 7h1v1H6z" fill="var(--gold)" />
    </template>

    <!-- deck-star: 4-point sparkle -->
    <template v-if="name === 'deck-star'">
      <path d="M7 2h2v3h3v2h-3v3H7V7H4V5h3z" fill="currentColor" />
      <path d="M3 3h1v1H3z M12 11h1v1h-1z" fill="currentColor" />
    </template>

    <!-- deck-flame -->
    <template v-if="name === 'deck-flame'">
      <path d="M8 2h1v2h1v2h1v2h1v3h-1v2H4v-2H3V8h1V6h1V4h1z" fill="currentColor" />
    </template>

    <!-- deck-leaf -->
    <template v-if="name === 'deck-leaf'">
      <path d="M4 12h1v-2h1V8h2V6h2V4h3v3h-3v2H7v2H5v2H4z" fill="currentColor" />
      <path d="M11 4h2v2h-2z" fill="currentColor" />
    </template>

    <!-- deck-heart -->
    <template v-if="name === 'deck-heart'">
      <path d="M3 4h3v1h1V4h2v1h1V4h3v5h-1v1h-1v1h-1v1h-1v1H8v-1H7v-1H6v-1H5V9H4V4z" fill="currentColor" />
    </template>

    <!-- deck-book -->
    <template v-if="name === 'deck-book'">
      <path d="M3 3h4v10H3z M9 3h4v10H9z M7 4h2v8H7z" fill="currentColor" />
    </template>

    <!-- deck-bolt -->
    <template v-if="name === 'deck-bolt'">
      <path d="M9 2h3l-2 4h3l-6 8 2-6H6z" fill="currentColor" />
    </template>

    <!-- deck-edit: pencil -->
    <template v-if="name === 'deck-edit'">
      <path d="M10 2h2v2h-2z M8 4h2v2H8z M6 6h2v2H6z M4 8h2v2H4z M3 11h2v2H3z M2 13h2v1H2z" fill="currentColor" />
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

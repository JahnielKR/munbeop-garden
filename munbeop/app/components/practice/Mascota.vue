<script setup lang="ts">
/**
 * Placeholder mascota sprite.
 *
 * Per spec 04-sprites-mascota.md §4.6, this is the v2 MVP placeholder
 * while the mascota's final identity (name, species, look) is still
 * an open question. Renders a single idle/standing pose.
 *
 * Emotional spritesheet animation (§5) and walking animation (§6)
 * are deferred to a later phase. For now: one sprite, one size, no
 * loops.
 *
 * Sprite proportions: 32x48 viewBox, default render at 96px wide
 * (3x integer scale). Palette-compliant via 01-tokens.md §1.1.
 */

interface Props {
  /** Render width in px. Height auto-scales. Default 96 (3x). */
  size?: number
  /** ARIA label. Empty keeps it decorative. */
  label?: string
}

const props = withDefaults(defineProps<Props>(), { size: 96, label: '' })
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size * 1.5"
    viewBox="0 0 32 48"
    xmlns="http://www.w3.org/2000/svg"
    shape-rendering="crispEdges"
    :aria-label="props.label || undefined"
    :aria-hidden="props.label ? undefined : true"
    role="img"
    class="mascota"
  >
    <!--
      Construction notes (32x48 grid, integer pixels only):
      rows  2-6   : jade hat brim (wide, 14 px) + crown
      row   7     : hat-brim shadow in ink-soft
      rows  8-12  : face area in paper-deep (placeholder skin tone)
      row   10    : closed eyes (2 dots, ink-soft)
      row   11    : smile (3 px curve, ink-soft)
      row   13    : inner shirt collar in paper
      rows 14-38  : overalls body (paper-deep) with vertical strap
      rows 39-46  : ink-soft boots (2 rects)
    -->

    <!-- Hat — jade, wide brim from cols 8-23 (16 wide) at row 5 -->
    <path d="M11 2h10v1H11zM10 3h12v1H10zM9 4h14v1H9zM8 5h16v1H8z" fill="#3aa84a" />
    <!-- Hat top crown — slightly raised cap on top center -->
    <path d="M13 1h6v1H13z" fill="#3aa84a" />

    <!-- Hat brim shadow (under-brim) — ink-soft, narrower than brim -->
    <path d="M10 6h12v1H10z" fill="#4a3a1f" />

    <!-- Face (placeholder skin in paper-deep, neutral non-committal) -->
    <path d="M12 7h8v5H12z" fill="#e6d4a8" />

    <!-- Closed eyes (2 ink-soft dots, row 9) -->
    <path d="M14 9h1v1H14zM17 9h1v1H17z" fill="#4a3a1f" />

    <!-- Smile (3-pixel curve, row 11) -->
    <path d="M14 11h1v1H14zM15 12h2v1H15zM17 11h1v1H17z" fill="#4a3a1f" />

    <!-- Neck / inner shirt collar (paper) -->
    <path d="M14 12h4v2H14z" fill="#f8efd0" />

    <!-- Overalls body — paper-deep with ink-soft outline -->
    <!-- outline (1px wider all sides) -->
    <path d="M9 14h14v1H9zM9 38h14v1H9zM9 14h1v25H9zM22 14h1v25h-1z" fill="#4a3a1f" />
    <!-- body fill -->
    <path d="M10 15h12v23H10z" fill="#e6d4a8" />

    <!-- Overalls strap (right shoulder over inner shirt, 2 px wide) -->
    <path d="M17 14h2v8H17z" fill="#e6d4a8" />
    <!-- strap outline -->
    <path d="M17 14h1v8H17zM18 14h1v8H18z" fill="#4a3a1f" opacity="0.6" />

    <!-- Hands at sides (small) — paper-deep peeking from overalls sleeves -->
    <path d="M9 23h2v3H9zM21 23h2v3h-2z" fill="#e6d4a8" />

    <!-- Boots (ink-soft) — 2 rectangles side by side -->
    <path d="M11 39h4v7h-4zM17 39h4v7h-4z" fill="#4a3a1f" />
    <!-- Boot toe highlights -->
    <path d="M11 45h4v1h-4zM17 45h4v1h-4z" fill="#1a1a1a" />
  </svg>
</template>

<style scoped>
.mascota {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>

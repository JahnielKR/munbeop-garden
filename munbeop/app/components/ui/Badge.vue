<script setup lang="ts">
/**
 * Badge primitive (spec 02-primitives.md §8).
 *
 * Tiny status label used for mastery level, counts ("12 new"), language
 * pills, deck colour markers, error indicators. Not interactive — if a
 * caller needs click behaviour, wrap the Badge in a <button>.
 *
 * Variants and contrast:
 *   - soft (default): `--surface-hover` bg + `--text-soft` text. The
 *     calmest variant; reads as a quiet eyebrow rather than an alert
 *   - jade / red / gold / sky: brand swatch bg with `--always-dark`
 *     text. Each of these passes ≥3:1 against the brand swatch per
 *     01-tokens.md §1.4 — even in dark mode (brand swatches are
 *     theme-invariant). Using `--always-dark` instead of `--text`
 *     keeps the badge text readable when the theme flips.
 *
 * Size:
 *   - sm: 8px PS2P, tight padding — matches the existing mastery badge
 *   - md: 10px PS2P, looser padding — for standalone pills
 *
 * The slot can hold text, or text + a sibling Icon (e.g. mastery sprite +
 * label). Layout is inline-flex with a small gap so the icon and label
 * baseline-align without bespoke wrapper CSS in every consumer.
 */
interface Props {
  variant?: 'jade' | 'red' | 'gold' | 'sky' | 'soft' | 'plum' | 'teal' | 'rose'
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  variant: 'soft',
  size: 'sm',
})
</script>

<template>
  <span class="badge" :data-variant="variant" :data-size="size">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  letter-spacing: 0.05em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  white-space: nowrap;
  line-height: 1;
  border: 1px solid var(--border);
}

.badge[data-size='sm'] {
  font-size: 8px;
  padding: 4px 6px;
}
.badge[data-size='md'] {
  font-size: 10px;
  padding: 6px 10px;
}

.badge[data-variant='soft'] {
  background: var(--surface-hover);
  color: var(--text-soft);
}
.badge[data-variant='jade'] {
  background: var(--jade);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='red'] {
  background: var(--red);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='gold'] {
  background: var(--gold);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='sky'] {
  background: var(--sky);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='plum'] {
  background: var(--plum);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='teal'] {
  background: var(--teal);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
.badge[data-variant='rose'] {
  background: var(--rose);
  color: var(--always-dark);
  border-color: var(--always-dark);
}
</style>

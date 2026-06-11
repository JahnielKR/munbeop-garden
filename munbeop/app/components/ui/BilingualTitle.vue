<script setup lang="ts">
/**
 * BilingualTitle primitive (spec 02-primitives.md §12).
 *
 * Captures the `<h1 class="title"><span ko/><span latin/></h1>` pattern
 * that lived inline in every page. Centralises:
 *   1. The bilingual hierarchy rule from 01-tokens.md §3.4 (KO sits
 *      visually dominant, Latin half subordinate at smaller size).
 *   2. The color decisions from the v5 palette: KO uses `--heading-accent`
 *      (jade-deep light 4.9:1, jade dark 9.7:1), Latin uses `--text`.
 *      `--accent`/gold is reserved for interactive elements only — as
 *      text on paper it fails contrast (1.9:1 in v5).
 *   3. The pixel-font fallback chain so JA / TH / VI labels don't drop
 *      into raw monospace when PS2P has no glyph for the Latin half.
 *
 * Three levels — `h1` (page title, 32 / 14 px), `h2` (section, 24 / 12),
 * `h3` (subsection, 20 / 11). Renders the matching semantic tag.
 *
 * `lang="ko"` on the KO span helps screen readers pronounce Hangul
 * correctly instead of attempting Latin phonetics.
 *
 * Mobile clamp: at the smallest breakpoint the KO half drops one step
 * so long Korean titles don't overflow narrow viewports.
 */
import { computed } from 'vue'

interface Props {
  ko: string
  latin: string
  level?: 'h1' | 'h2' | 'h3'
}

const props = withDefaults(defineProps<Props>(), { level: 'h1' })
const tag = computed(() => props.level)
</script>

<template>
  <component :is="tag" class="title" :class="`title--${level}`">
    <span class="title__ko" lang="ko">{{ ko }}</span>
    <span class="title__latin">{{ latin }}</span>
  </component>
</template>

<style scoped>
.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  font-weight: normal;
}
.title__ko {
  font-family: 'Noto Sans KR', sans-serif;
  color: var(--heading-accent);
  line-height: 1.3;
}
.title__latin {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  color: var(--text);
  letter-spacing: 0.05em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}

/* h1 — page title */
.title--h1 .title__ko {
  font-weight: 900;
  font-size: 32px;
}
.title--h1 .title__latin {
  font-size: 14px;
}

/* h2 — section header */
.title--h2 .title__ko {
  font-weight: 700;
  font-size: 24px;
}
.title--h2 .title__latin {
  font-size: 12px;
}

/* h3 — subsection */
.title--h3 .title__ko {
  font-weight: 700;
  font-size: 20px;
  line-height: 1.4;
}
.title--h3 .title__latin {
  font-size: 11px;
}

@media (max-width: 480px) {
  .title--h1 .title__ko { font-size: 26px; }
  .title--h2 .title__ko { font-size: 20px; }
}
</style>

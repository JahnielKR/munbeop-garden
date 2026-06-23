<!-- app/components/paths/PathCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
import type { PathProgress } from '~/lib/paths/progress'

interface Props {
  name: string
  progress: PathProgress
}
const props = defineProps<Props>()
const { t } = useI18n()

const pct = computed(() => Math.round(props.progress.pct * 100))
</script>

<template>
  <section class="path-card" data-testid="path-card">
    <header class="path-card__head">
      <h2 class="path-card__name">{{ name }}</h2>
      <span class="path-card__count">{{ t('paths.progress_label', { learned: progress.learned, total: progress.total }) }}</span>
    </header>

    <div
      class="path-card__bar"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="name"
    >
      <div class="path-card__fill" :style="{ width: pct + '%' }" />
    </div>

    <NuxtLink
      v-if="progress.nextKo"
      class="path-card__next"
      data-testid="path-next"
      :to="`/practice/ruleta?focus=${encodeURIComponent(progress.nextKo)}`"
    >
      <span class="path-card__next-label">{{ t('paths.next_label') }}</span>
      <span class="path-card__next-ko" lang="ko">{{ progress.nextKo }}</span>
      <span class="path-card__next-cta">{{ t('paths.practice_cta') }} →</span>
    </NuxtLink>
    <p v-else class="path-card__complete" data-testid="path-complete">{{ t('paths.complete') }}</p>

    <details class="path-card__list">
      <summary class="path-card__summary">{{ t('paths.list_toggle') }}</summary>
      <ol class="path-card__items">
        <li
          v-for="item in progress.items"
          :key="item.ko"
          class="path-card__item"
          :class="{
            'path-card__item--learned': item.learned,
            'path-card__item--next': item.ko === progress.nextKo,
          }"
          lang="ko"
        >
          <span class="path-card__tick" aria-hidden="true">{{ item.learned ? '✓' : '·' }}</span>
          {{ item.ko }}
        </li>
      </ol>
    </details>
  </section>
</template>

<style scoped>
.path-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--paper-warm, var(--surface));
  border: 3px solid var(--border-strong, var(--border));
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
}
.path-card__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.path-card__name { margin: 0; font-family: 'Press Start 2P', 'Noto Sans KR', monospace; font-size: 13px; }
.path-card__count { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.path-card__bar { height: 12px; background: var(--surface); border: 2px solid var(--border); overflow: hidden; }
.path-card__fill { height: 100%; background: var(--accent); transition: width var(--motion-quick, 120ms) var(--ease-out, ease-out); }
.path-card__next {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; text-decoration: none;
  background: var(--surface); border: 2px solid var(--border-strong, var(--border)); color: var(--text);
}
.path-card__next:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.path-card__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.path-card__next-label { font-family: var(--font-pixel-small); font-size: var(--text-xs); color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.06em; }
.path-card__next-ko { font-family: var(--font-ko); font-size: var(--text-lg); }
.path-card__next-cta { margin-left: auto; font-family: var(--font-pixel-small); font-size: var(--text-xs); color: var(--accent); }
.path-card__complete { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); color: var(--heading-accent); }
.path-card__summary { cursor: pointer; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--link); }
.path-card__items { margin: 8px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.path-card__item { font-family: var(--font-ko); font-size: var(--text-md); color: var(--text-soft); }
.path-card__item--learned { color: var(--text); }
.path-card__item--next { color: var(--accent); font-weight: 700; }
.path-card__tick { display: inline-block; width: 1.2em; }
</style>

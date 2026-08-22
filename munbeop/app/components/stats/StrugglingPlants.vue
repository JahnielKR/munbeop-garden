<script setup lang="ts">
import { NuxtLink } from '#components'
import Icon from '~/components/ui/Icon.vue'
import type { Leech } from '~/lib/srs'

interface Props {
  leeches: Leech[]
}
defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const careLink = (ko: string) => `/practice/rescue?ko=${encodeURIComponent(ko)}`
</script>

<template>
  <section v-if="leeches.length" class="block" data-testid="struggling-plants">
    <div class="block__head">
      <span class="block__icon" aria-hidden="true"><Icon name="deck-heart" :size="24" /></span>
      <div>
        <h2 class="block__title">{{ t('stats.struggling.title') }}</h2>
        <p class="block__sub">{{ t('stats.struggling.sub') }}</p>
      </div>
    </div>
    <div class="care">
      <div v-for="l in leeches" :key="l.ko" class="care__row" data-test="struggling-row">
        <div class="care__grammar">
          <span class="care__ko" lang="ko">{{ l.ko }}</span>
          <span v-if="l.meaning" class="care__meaning">· {{ tl(l.meaning) }}</span>
        </div>
        <div class="care__right">
          <span v-if="l.dominantDimension" class="care__chip" lang="ko">
            {{ t(`dimension.${l.dominantDimension}`) }}
          </span>
          <NuxtLink class="care__cta" data-test="struggling-care" :to="careLink(l.ko)">
            {{ t('stats.struggling.care') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--surface-elevated);
  border: 2px solid var(--border);
  border-left: 6px solid var(--jade);
  box-shadow: var(--bevel), var(--shadow-card);
}
.block__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}
.block__icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  color: var(--text);
  background: var(--surface-muted);
  border: 2px solid var(--border);
}
.block__title {
  margin: 0;
  color: var(--text);
  font-family: var(--font-pixel-display);
  font-size: var(--text-md);
  line-height: 1.6;
}
.block__sub {
  margin: var(--space-1) 0 0;
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
}
.care {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.care__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--surface);
  border: 2px solid var(--border);
  box-shadow: var(--shadow-pixel-sm);
}
.care__grammar {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.care__ko {
  color: var(--text);
  font-family: var(--font-ko);
  font-weight: 700;
  font-size: var(--text-base);
}
.care__meaning {
  color: var(--text-soft);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}
.care__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}
.care__chip {
  padding: 6px 8px;
  color: var(--text);
  background: var(--surface-muted);
  border: 2px solid var(--border-strong);
  font-family: var(--font-ko);
  font-size: var(--text-xs);
}
.care__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 8px 12px;
  color: var(--text-on-accent);
  background: var(--accent);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: 9px;
  line-height: 1.5;
  text-decoration: none;
  transition: transform var(--motion-quick) var(--ease-out), box-shadow var(--motion-quick) var(--ease-out);
}
.care__cta:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.care__cta:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-button-pressed);
}
.care__cta:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (max-width: 600px) {
  .block { padding: var(--space-4); }
  .care__row { align-items: stretch; flex-direction: column; }
  .care__right { justify-content: space-between; flex-wrap: wrap; }
  .care__cta { flex: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .care__cta { transition: none; }
}
</style>

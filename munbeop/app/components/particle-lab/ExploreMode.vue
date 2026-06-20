<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ParticleId } from '~/lib/domain'
import { PARTICLE_IDS } from '~/lib/domain'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import { useLocalized } from '~/composables/useLocalized'
import { useParticleExplore } from '~/composables/useParticleExplore'
import ParticleLegend from './ParticleLegend.vue'
import ParticlePopover from './ParticlePopover.vue'
import ParticleSentence from './ParticleSentence.vue'
import TranslationPanel from './TranslationPanel.vue'

/** Explore mode orchestrator: nav + sentence + dynamic translation + legend. */
const route = useRoute()
const { t } = useI18n()
const { tl } = useLocalized()
const explore = useParticleExplore()
const infoId = ref<ParticleId | null>(null)

onMounted(() => {
  const raw = route.query.focus
  if (typeof raw === 'string' && (PARTICLE_IDS as readonly string[]).includes(raw)) {
    explore.focusParticle(raw as ParticleId)
  }
})
</script>

<template>
  <div class="explore">
    <p class="explore__hint">{{ t('particles.explore.tap_hint') }}</p>

    <div class="explore__nav">
      <button
        type="button"
        class="explore__arrow"
        :disabled="explore.index.value === 0"
        :aria-label="t('particles.explore.prev')"
        @click="explore.go(explore.index.value - 1)"
      >
        ◄
      </button>
      <ProgressDots :total="explore.sentences.length" :progress="explore.index.value" />
      <button
        type="button"
        class="explore__arrow"
        :disabled="explore.index.value === explore.sentences.length - 1"
        :aria-label="t('particles.explore.next')"
        @click="explore.go(explore.index.value + 1)"
      >
        ►
      </button>
    </div>

    <ParticleSentence
      :sentence="explore.sentence.value"
      :off="explore.off.value"
      @toggle="explore.toggle"
    />

    <TranslationPanel
      :text="tl(explore.trans.value)"
      :nuance="explore.nuance.value ? tl(explore.nuance.value) : null"
      :fallback="explore.isFallback.value"
    />

    <ParticleLegend :ids="explore.legendIds.value" @info="infoId = $event" />

    <ParticlePopover :particle-id="infoId" @close="infoId = null" />
  </div>
</template>

<style scoped>
.explore {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.explore__hint {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  text-align: center;
}
.explore__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.explore__arrow {
  padding: 6px 10px;
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--text);
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: transform var(--motion-quick) var(--ease-out);
}
.explore__arrow:hover:not(:disabled) {
  transform: translate(-1px, -1px);
}
.explore__arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.explore__arrow:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

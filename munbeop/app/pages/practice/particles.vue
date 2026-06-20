<script setup lang="ts">
import { ref, watch } from 'vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import DrillCard from '~/components/particle-lab/DrillCard.vue'
import DrillSummary from '~/components/particle-lab/DrillSummary.vue'
import DrillSetPicker from '~/components/particle-lab/DrillSetPicker.vue'
import ExploreMode from '~/components/particle-lab/ExploreMode.vue'
import ProgressDots from '~/components/practice/ProgressDots.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { useParticleDrill } from '~/composables/useParticleDrill'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'

/**
 * 조사 연구소 · Particle Lab — game #3. Two modes synced to ?mode=:
 * 'explore' (default) and 'drill' (은/는 vs 이/가 shock filter).
 */
definePageMeta({ surface: 'game' })

type Mode = 'explore' | 'drill'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const drill = useParticleDrill(typeof route.query.set === 'string' ? route.query.set : undefined)

const mode = ref<Mode>(route.query.mode === 'drill' ? 'drill' : 'explore')

// Confirm before leaving an in-progress drill round (Explore is read-only).
useGameLeaveGuard(() => mode.value === 'drill' && drill.phase.value !== 'done')

watch(mode, async (m) => {
  await router.replace({ query: { ...route.query, mode: m } })
  if (m === 'drill') await drill.start()
})

if (mode.value === 'drill') {
  // Deep link straight into the drill.
  void drill.start()
}

async function restartDrill() {
  await drill.start()
}

async function onSelectSet(id: string) {
  drill.selectSet(id)
  await router.replace({ query: { ...route.query, mode: 'drill', set: id } })
  await drill.start()
}
</script>

<template>
  <div class="lab">
    <GameExitButton />
    <GameLeaveConfirm />
    <BilingualTitle ko="조사 연구소" :latin="t('particles.title')" />
    <p class="lab__lead">{{ t('particles.lead') }}</p>

    <div class="lab__tabs" role="group" :aria-label="t('particles.mode_label')">
      <button
        type="button"
        class="lab__tab"
        :class="{ 'lab__tab--active': mode === 'explore' }"
        :aria-pressed="mode === 'explore'"
        data-testid="tab-explore"
        @click="mode = 'explore'"
      >
        🧩 {{ t('particles.mode_explore') }}
      </button>
      <button
        type="button"
        class="lab__tab"
        :class="{ 'lab__tab--active': mode === 'drill' }"
        :aria-pressed="mode === 'drill'"
        data-testid="tab-drill"
        @click="mode = 'drill'"
      >
        ⚡ {{ t('particles.mode_drill') }}
      </button>
    </div>

    <ExploreMode v-if="mode === 'explore'" />

    <template v-else>
      <DrillSetPicker
        v-if="drill.phase.value === 'question' && drill.index.value === 0"
        :sets="drill.availableSets"
        :selected="drill.selectedSetId.value"
        @select="onSelectSet"
      />
      <ProgressDots
        v-if="drill.phase.value !== 'done'"
        :total="drill.items.value.length"
        :progress="drill.index.value"
      />
      <DrillCard
        v-if="drill.phase.value !== 'done'"
        :item="drill.item.value"
        :set="drill.set.value"
        :phase="drill.phase.value"
        :verdict="drill.verdict.value"
        :picked="drill.picked.value"
        :blocked-choices="drill.blockedChoices.value"
        @answer="drill.answer"
        @retry="drill.retry"
        @next="drill.next"
      />
      <DrillSummary
        v-else
        :score="drill.score.value"
        :failed-items="drill.failedItems.value"
        :set="drill.set.value"
        :garden-grew="drill.gardenGrew.value"
        @restart="restartDrill"
        @explore="mode = 'explore'"
      />
    </template>
  </div>
</template>

<style scoped>
.lab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.lab__lead {
  margin: 0;
  font-family: var(--font-ui);
  color: var(--text-soft);
  line-height: 1.6;
}
.lab__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  background: var(--surface);
  border: 2px solid var(--border);
  max-width: 420px;
}
.lab__tab {
  padding: 10px 12px;
  background: transparent;
  border: none;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  color: var(--text-soft);
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.lab__tab:hover {
  color: var(--text);
}
.lab__tab--active {
  background: var(--accent);
  color: var(--text-on-accent);
}
.lab__tab:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

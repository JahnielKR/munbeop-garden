<script setup lang="ts">
/**
 * 내 정원 / My Garden — home hero (spec §5.1).
 *
 * The active level's tree IS the screen: a window-to-the-garden stage
 * whose sky tracks real SRS progress, a retro HUD underneath, and Bomi
 * floating by the crown. The grove view (all 6 trees) arrives with
 * `GardenGrove` (plan Fase 5); its toggle is disabled until then.
 */
import { computed, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import Bomi from '~/components/bomi/Bomi.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Button from '~/components/ui/Button.vue'
import GardenHud from '~/components/garden/GardenHud.vue'
import GardenStage from '~/components/garden/GardenStage.vue'
import PixelTree from '~/components/garden/PixelTree.vue'
import { SPECIES_KO } from '~/lib/garden'
import { gardenStateKey, useGardenState } from '~/composables/useGardenState'

definePageMeta({ surface: 'game' })

const { t } = useI18n()

const { active } = useGardenState()

// Integer scale only (spec §7.2): x2 on narrow viewports, x3 otherwise.
const stageWrap = ref<HTMLElement | null>(null)
const { width } = useElementSize(stageWrap)
const treeScale = computed(() => (width.value > 0 && width.value < 432 ? 2 : 3))

const stateKey = computed(() => gardenStateKey(active.value.pct))
const speciesKo = computed(() => SPECIES_KO[active.value.species])
const speciesLabel = computed(() => t(`garden.species.${active.value.species}`))
</script>

<template>
  <div class="page">
    <header class="page__head">
      <BilingualTitle ko="내 정원" :latin="t('title.garden')" />
      <Button variant="secondary" size="sm" disabled>
        {{ t('garden.grove_open') }}
      </Button>
    </header>

    <div ref="stageWrap">
      <GardenStage :pct="active.pct" :scale="treeScale">
        <PixelTree :species="active.species" :progress="active.pct" :scale="treeScale" />

        <template #overlay>
          <Bomi class="page__bomi" :scale="2" pose="idle" />
        </template>
      </GardenStage>
    </div>

    <GardenHud
      :level="active.level"
      :species-ko="speciesKo"
      :species-label="speciesLabel"
      :pct="active.pct"
      :state-key="stateKey"
    />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page__bomi {
  position: absolute;
  top: 14%;
  right: 16%;
}

@media (max-width: 480px) {
  .page__bomi {
    right: 6%;
  }
}
</style>

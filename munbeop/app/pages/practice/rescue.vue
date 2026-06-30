<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'
import RescuePanel from '~/components/practice/RescuePanel.vue'
import { useRescueDrill } from '~/composables/useRescueDrill'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const grammarStore = useGrammarStore()
const logStore = useLogStore()

const ko = computed(() => (typeof route.query.ko === 'string' ? route.query.ko : ''))
const drill = useRescueDrill(ko.value)

function goProduce() {
  void router.push(`/practice/ruleta?focus=${encodeURIComponent(ko.value)}`)
}

onMounted(async () => {
  // Hard refresh / deep link mounts before layout hydration — hydrate the
  // stores the drill reads from (grammar for the sheet, log for the leech
  // signal). Idempotent and tolerant of a Supabase error.
  try {
    if (grammarStore.items.length === 0) await grammarStore.hydrate()
    if (logStore.entries.length === 0) await logStore.hydrate()
  } catch (err) {
    console.error('rescue: hydration failed', err)
  }
})
</script>

<template>
  <div class="page">
    <GameExitButton />
    <BilingualTitle ko="다시 돌보기" :latin="t('rescue.title')" />
    <PracticeHelp mode="rescue" />

    <RescuePanel
      v-if="drill.grammar.value"
      :grammar="drill.grammar.value"
      :stage="drill.stage.value"
      :dominant-dimension="drill.dominantDimension.value"
      :is-last="drill.isLast.value"
      :can-back="drill.canBack.value"
      @next="drill.next()"
      @back="drill.back()"
      @produce="goProduce"
    />
    <p v-else class="empty">{{ t('rescue.empty') }}</p>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.empty {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 28px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
</style>

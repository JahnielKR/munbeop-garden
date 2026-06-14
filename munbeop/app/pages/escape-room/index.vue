<script setup lang="ts">
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import LevelBook from '~/components/escape-room/LevelBook.vue'
import GameExitButton from '~/components/games/GameExitButton.vue'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'

/**
 * Escape Room — level notebook (libreta).
 *
 * Flip through level pages; pressing START on a playable page routes into
 * the gameplay at /escape-room/play?level=<id>.
 */

definePageMeta({ surface: 'game' })

const { t } = useI18n()
const router = useRouter()

function onStart(levelId: string) {
  router.push({ path: '/escape-room/play', query: { level: levelId } })
}
</script>

<template>
  <div class="er-index">
    <GameExitButton />
    <BilingualTitle ko="탈출" latin="Escape Room" />
    <p class="er-index__lead">{{ t('escape.book_lead') }}</p>
    <LevelBook :entries="LEVEL_REGISTRY" @start="onStart" />
  </div>
</template>

<style scoped>
.er-index {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.er-index__lead {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  color: var(--ink-soft, var(--text-soft));
  line-height: 1.6;
}
</style>

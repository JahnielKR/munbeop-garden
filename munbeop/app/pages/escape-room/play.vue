<script setup lang="ts">
import { computed } from 'vue'
import EscapeRoom from '~/components/escape-room/EscapeRoom.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { playableLevel } from '~/seed/escape-room/registry'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { useEscapeRoomStore } from '~/stores/escape-room'

/**
 * Escape Room — gameplay host.
 *
 * Resolves `?level=<id>` against the registry; unknown or coming-soon ids
 * bounce back to the notebook.
 */

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const escape = useEscapeRoomStore()

// Confirm before leaving an active run (not idle / gameover / completed).
useGameLeaveGuard(() => escape.status === 'playing')

const level = computed(() => playableLevel(String(route.query.level ?? '')))

if (!level.value) {
  router.replace('/escape-room')
}

function onExit() {
  router.push('/escape-room')
}
</script>

<template>
  <div class="er-play">
    <EscapeRoom v-if="level" :level="level" @exit="onExit" />
    <GameLeaveConfirm />
  </div>
</template>

<style scoped>
.er-play {
  min-height: 100%;
}
</style>

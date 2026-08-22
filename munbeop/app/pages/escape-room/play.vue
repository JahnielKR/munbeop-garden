<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import EscapeRoom from '~/components/escape-room/EscapeRoom.vue'
import GameLeaveConfirm from '~/components/games/GameLeaveConfirm.vue'
import { loadPlayableLevel } from '~/seed/escape-room/load-level'
import type { Level } from '~/lib/domain'
import { useGameLeaveGuard } from '~/composables/useGameLeaveGuard'
import { useEscapeRoomStore } from '~/stores/escape-room'
import { useEscapeRoomProgress } from '~/composables/useEscapeRoomProgress'

/**
 * Escape Room — gameplay host.
 *
 * Resolves `?level=<id>` through an async level loader; unknown ids bounce
 * back to the notebook without pulling every story into the gameplay chunk.
 */

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()
const escape = useEscapeRoomStore()
const { saveBlocked } = useEscapeRoomProgress()

// Confirm before leaving an active run or abandoning an outcome that still
// needs to reach the account store.
useGameLeaveGuard(() => escape.status === 'playing' || saveBlocked.value)

const level = shallowRef<Level | null>(await loadPlayableLevel(String(route.query.level ?? '')))

if (!level.value) await navigateTo('/escape-room', { replace: true })

watch(
  () => String(route.query.level ?? ''),
  async (id) => {
    const loaded = await loadPlayableLevel(id)
    if (id !== String(route.query.level ?? '')) return
    level.value = loaded
    if (!loaded) await router.replace('/escape-room')
  },
)

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

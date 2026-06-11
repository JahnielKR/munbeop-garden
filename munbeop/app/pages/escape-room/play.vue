<script setup lang="ts">
import { computed } from 'vue'
import EscapeRoom from '~/components/escape-room/EscapeRoom.vue'
import { playableLevel } from '~/seed/escape-room/registry'

/**
 * Escape Room — gameplay host.
 *
 * Resolves `?level=<id>` against the registry; unknown or coming-soon ids
 * bounce back to the notebook.
 */

definePageMeta({ surface: 'game' })

const route = useRoute()
const router = useRouter()

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
  </div>
</template>

<style scoped>
.er-play {
  min-height: 100%;
}
</style>

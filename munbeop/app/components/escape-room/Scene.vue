<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Room } from '~/lib/domain'
import Hotspot from './Hotspot.vue'

/**
 * Scene — renders a Room (data) as a clickable scene with its hotspots overlaid.
 *
 * Hotspot positioning uses scene-base percentages (see Hotspot.vue) so the
 * scene scales responsively. Background image src is built by joining
 * `imageBase` and `room.image`.
 *
 * Until art lands, missing `room.image` files render as a colored fallback
 * via the placeholder background — hotspots remain clickable for testing.
 *
 * Named `Scene.vue` (not `Room.vue`) to avoid Nuxt's auto-import collision
 * between the folder `escape-room/` and a file ending in `Room`.
 */

interface Props {
  room: Room
  /** Path prefix where assets live, e.g. `/escape-room/level-01/`. */
  imageBase: string
  /** Slot ids resolved so far — drives the solved-variant swap. */
  resolvedSlots?: readonly string[]
}

const props = withDefaults(defineProps<Props>(), { resolvedSlots: () => [] })
defineEmits<{ hotspot: [id: string] }>()

const fullSrc = (path: string) => `${props.imageBase}${path}`

/** Slot ids this room's hotspots can resolve. */
const roomSlotIds = computed(() =>
  props.room.hotspots.flatMap((h) => (h.triggersSlot ? [h.triggersSlot] : [])),
)
/** Once every slot in this room is resolved, show its solved variant (if any). */
const isSolved = computed(
  () =>
    !!props.room.solvedImage &&
    roomSlotIds.value.length > 0 &&
    roomSlotIds.value.every((s) => props.resolvedSlots.includes(s)),
)
const effectiveImage = computed(() => (isSolved.value ? props.room.solvedImage! : props.room.image))

/** Hide the <img> while its file doesn't exist; the container's sunrise
 * gradient stands in. Reset on any image change (room switch OR solved-variant
 * swap) so the new art gets a fresh load attempt. */
const imageMissing = ref(false)
watch(effectiveImage, () => (imageMissing.value = false))
</script>

<template>
  <div class="room" data-testid="room">
    <img
      v-show="!imageMissing"
      class="room__bg"
      data-testid="room-bg"
      :src="fullSrc(effectiveImage)"
      :alt="room.id"
      @error="imageMissing = true"
    >
    <Hotspot
      v-for="h in room.hotspots"
      :id="h.id"
      :key="h.id"
      :rect="h.rect"
      @click="$emit('hotspot', h.id)"
    />
  </div>
</template>

<style scoped>
.room {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 4px solid var(--border-strong, #6b5b4a);
  /* Until art lands, missing scene images fall back to this sunrise gradient. */
  background: linear-gradient(180deg, #f7c69e 0%, #f8e0bf 60%, #d5b389 100%);
}
.room__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}
</style>

<script setup lang="ts">
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
}

const props = defineProps<Props>()
defineEmits<{ hotspot: [id: string] }>()

const fullSrc = (path: string) => `${props.imageBase}${path}`
</script>

<template>
  <div class="room" data-testid="room">
    <img
      class="room__bg"
      data-testid="room-bg"
      :src="fullSrc(room.image)"
      :alt="room.id"
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
  background: #2a1f17;
  overflow: hidden;
  border: 4px solid var(--border-strong, #6b5b4a);
}
.room__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
  /* Until art lands, broken images show a soft sunrise gradient placeholder. */
  background: linear-gradient(180deg, #f7c69e 0%, #f8e0bf 60%, #d5b389 100%);
}
</style>

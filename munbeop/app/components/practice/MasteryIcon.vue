<script setup lang="ts">
/**
 * Mastery icon domain wrapper.
 *
 * Maps a MasteryLevel ('seedling' | 'plant' | 'tree') to the corresponding
 * pixel-art icon from the Icon primitive. Per
 * docs/superpowers/specs/2026-06-03-design-system-v2/04-sprites-mascota.md §3.3,
 * this lives in app/components/practice/ because it knows about a domain
 * concept (mastery levels), not a UI primitive.
 */
import type { MasteryLevel } from '~/lib/domain'
import Icon, { type IconName } from '~/components/ui/Icon.vue'

interface Props {
  level: MasteryLevel
  size?: number
}

const props = withDefaults(defineProps<Props>(), { size: 16 })

const iconName = computed<IconName>(() => `mastery-${props.level}` as IconName)
</script>

<template>
  <Icon :name="iconName" :size="props.size" />
</template>

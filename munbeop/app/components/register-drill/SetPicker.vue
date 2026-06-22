<!-- app/components/register-drill/SetPicker.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { setsForMode } from '~/lib/register-transform'
import type { RegisterMode } from '~/lib/domain'

interface Props { mode: RegisterMode; selected: string }
const props = defineProps<Props>()
defineEmits<{ select: [id: string] }>()

const sets = computed(() => setsForMode(props.mode))
</script>

<template>
  <div class="picker">
    <h2 class="picker__title">{{ $t('register.pick_set') }}</h2>
    <div class="picker__chips" role="group" :aria-label="$t('register.pick_set')">
      <button
        v-for="s in sets"
        :key="s.id"
        type="button"
        class="picker__chip"
        :class="{ 'picker__chip--active': selected === s.id }"
        :aria-pressed="selected === s.id"
        :data-testid="`register-set-${s.id}`"
        lang="ko"
        @click="$emit('select', s.id)"
      >
        {{ s.ko }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker { display: flex; flex-direction: column; gap: 8px; }
.picker__title {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.picker__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.picker__chip {
  min-width: 0; padding: 8px 12px; background: var(--paper-deep); border: 2px solid var(--border);
  font-family: var(--font-ko); font-size: var(--text-sm); color: var(--text-soft); cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.picker__chip:hover { color: var(--text); }
.picker__chip--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.picker__chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

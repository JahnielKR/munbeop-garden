<!-- app/components/placement/PlacementResult.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NuxtLink } from '#components'
import type { PlacementOutcome } from '~/lib/placement'

interface Props {
  outcome: PlacementOutcome
  saveError?: boolean
  saving?: boolean
}
const props = withDefaults(defineProps<Props>(), { saveError: false, saving: false })
defineEmits<{ retake: []; retrySave: [] }>()

const root = ref<HTMLElement | null>(null)
const ctaTo = computed(() =>
  `/practice/ruleta?deck=${encodeURIComponent(props.outcome.startingDeckId)}`,
)
onMounted(() => root.value?.focus())
</script>

<template>
  <section ref="root" tabindex="-1" class="result" data-testid="placement-result">
    <p v-if="outcome.clearedLevel === 0" class="result__lead" role="status">
      {{ $t('placement.result.just_starting') }}
    </p>
    <p v-else class="result__level" role="status">
      {{ $t('placement.result.your_level', { level: outcome.clearedLevel }) }}
    </p>

    <p class="result__start">{{ $t('placement.result.start_with', { level: outcome.startingLevel }) }}</p>

    <div v-if="saveError" class="result__save-error" role="alert">
      <p>{{ $t('errors.save_failed') }}</p>
      <button
        type="button"
        class="result__btn"
        data-testid="placement-retry-save"
        :disabled="saving"
        @click="$emit('retrySave')"
      >
        {{ $t('errors.retry') }}
      </button>
    </div>

    <div class="result__actions">
      <NuxtLink
        v-if="!saveError && !saving"
        class="result__btn result__btn--primary"
        data-testid="placement-cta"
        :to="ctaTo"
      >
        {{ $t('placement.result.cta', { level: outcome.startingLevel }) }}
      </NuxtLink>
      <button
        type="button"
        class="result__btn"
        data-testid="placement-retake"
        :disabled="saving || saveError"
        @click="$emit('retake')"
      >
        {{ $t('placement.result.retake') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.result { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; }
.result__level { margin: 0; font-family: var(--font-pixel-display); font-size: var(--text-lg); color: var(--text); }
.result__lead { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-md); color: var(--text); }
.result__start { margin: 0; font-family: var(--font-ui); font-size: var(--text-md); color: var(--text-soft); }
.result__save-error { display: flex; flex-direction: column; gap: 8px; align-items: center; color: var(--danger, #a0443e); }
.result__save-error p { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); }
.result__actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.result__btn {
  min-width: 0; padding: 10px 16px; background: var(--surface); color: var(--text); text-decoration: none;
  border: 3px solid var(--border-strong); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.result__btn--primary { background: var(--accent); color: var(--text-on-accent); }
.result__btn:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.result__btn:disabled { opacity: 0.55; cursor: wait; transform: none; box-shadow: var(--shadow-button); }
.result__btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.result:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

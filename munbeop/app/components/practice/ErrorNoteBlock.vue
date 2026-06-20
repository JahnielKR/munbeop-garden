<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import { ERROR_DIMENSIONS, type ErrorDimension } from '~/lib/domain'

interface Props {
  modelValue: string
  dimension: ErrorDimension | null
}
defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [string]
  'update:dimension': [ErrorDimension | null]
  save: []
  skip: []
}>()
const { t } = useI18n()

function toggle(current: ErrorDimension | null, d: ErrorDimension) {
  emit('update:dimension', current === d ? null : d)
}
</script>

<template>
  <div class="enote">
    <div class="enote__label">{{ t('practice.error_note_label') }}</div>
    <div class="enote__dims" role="group" :aria-label="t('dimension.prompt')">
      <button
        v-for="d in ERROR_DIMENSIONS"
        :key="d"
        type="button"
        class="enote__chip"
        :class="{ 'enote__chip--on': dimension === d }"
        :data-testid="`dim-${d}`"
        :aria-pressed="dimension === d"
        @click="toggle(dimension, d)"
      >
        {{ t(`dimension.${d}`) }}
      </button>
    </div>
    <Input
      :model-value="modelValue"
      :placeholder="t('practice.error_note_placeholder')"
      multiline
      :rows="2"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <div class="enote__actions">
      <!--
        Save with note = primary intent (user took time to articulate the
        confusion); Skip = secondary opt-out. Earlier wiring had Save as
        the `danger` variant which read as destructive — inverted the
        pedagogical intent. Restored per audit fix G8.
      -->
      <Button variant="primary" @click="$emit('save')">
        {{ t('practice.save_with_note') }}
      </Button>
      <Button variant="secondary" @click="$emit('skip')">
        {{ t('practice.skip_note') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.enote {
  margin-top: 14px;
  padding: 14px;
  background: color-mix(in oklch, var(--red) 10%, var(--surface));
  border-left: 3px solid var(--red);
}
.enote__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  color: var(--danger);
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}
.enote__dims {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.enote__chip {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  padding: 4px 10px;
  border: 1.5px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
}
.enote__chip--on {
  border-color: var(--danger, var(--red));
  background: color-mix(in oklch, var(--red) 16%, var(--surface));
}
.enote__chip:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.enote__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
</style>

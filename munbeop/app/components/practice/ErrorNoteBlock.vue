<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

interface Props {
  modelValue: string
}
defineProps<Props>()
defineEmits<{ 'update:modelValue': [string]; save: []; skip: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="enote">
    <div class="enote__label">{{ t('practice.error_note_label') }}</div>
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
.enote__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
</style>

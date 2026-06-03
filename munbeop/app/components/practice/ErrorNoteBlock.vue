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
      <Button variant="danger" @click="$emit('save')">
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
  background: rgba(194, 62, 62, 0.08);
  border-left: 3px solid var(--red);
}
.enote__label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--red);
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

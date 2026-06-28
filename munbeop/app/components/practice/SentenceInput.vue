<script setup lang="ts">
import Input from '~/components/ui/Input.vue'

interface Props {
  modelValue: string
  error?: boolean
}
withDefaults(defineProps<Props>(), { error: false })
defineEmits<{ 'update:modelValue': [string] }>()
const { t } = useI18n()
</script>

<template>
  <Input
    :model-value="modelValue"
    :placeholder="t('practice.sentence_placeholder')"
    :aria-label="t('practice.sentence_input_label')"
    multiline
    :rows="3"
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

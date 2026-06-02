<script setup lang="ts">
import PixelInput from '~/components/ui/PixelInput.vue'

interface Props {
  modelValue: string
}
defineProps<Props>()
defineEmits<{ 'update:modelValue': [string] }>()
const { t } = useI18n()
</script>

<template>
  <PixelInput
    :model-value="modelValue"
    :placeholder="t('practice.sentence_placeholder')"
    multiline
    :rows="3"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

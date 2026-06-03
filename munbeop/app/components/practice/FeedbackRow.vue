<script setup lang="ts">
import Button from '~/components/ui/Button.vue'

interface Props {
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { disabled: false })
defineEmits<{ easy: []; hard: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="fb">
    <Button variant="primary" :disabled="disabled" @click="$emit('easy')">
      {{ t('practice.fb_easy') }}
    </Button>
    <Button variant="danger" :disabled="disabled" @click="$emit('hard')">
      {{ t('practice.fb_hard') }}
    </Button>
  </div>
</template>

<style scoped>
.fb {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}
</style>

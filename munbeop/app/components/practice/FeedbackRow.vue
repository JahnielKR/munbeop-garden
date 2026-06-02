<script setup lang="ts">
import PixelButton from '~/components/ui/PixelButton.vue'
defineEmits<{ easy: []; hard: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="fb">
    <PixelButton variant="primary" @click="$emit('easy')">{{ t('practice.fb_easy') }}</PixelButton>
    <PixelButton variant="danger" @click="$emit('hard')">{{ t('practice.fb_hard') }}</PixelButton>
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

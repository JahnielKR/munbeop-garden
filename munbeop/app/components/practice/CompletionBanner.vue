<script setup lang="ts">
import Mascota from './Mascota.vue'
import PixelButton from '~/components/ui/PixelButton.vue'
import PixelCard from '~/components/ui/PixelCard.vue'
defineEmits<{ restart: [] }>()
const { t } = useI18n()
</script>

<template>
  <PixelCard accent="jade">
    <div class="banner">
      <Mascota class="banner__mascota" :size="64" />
      <div class="banner__ko">{{ t('practice.completion_ko') }}</div>
      <div class="banner__txt">{{ t('practice.completion_text') }}</div>
      <PixelButton variant="primary" @click="$emit('restart')">
        {{ t('practice.completion_restart') }}
      </PixelButton>
    </div>
  </PixelCard>
</template>

<style scoped>
.banner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.banner__mascota {
  margin-bottom: 12px;
}
.banner__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 22px;
  margin-bottom: 6px;
}
.banner__txt {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  margin-bottom: 14px;
}
</style>

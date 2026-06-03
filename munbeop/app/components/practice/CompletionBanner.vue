<script setup lang="ts">
import Bomi from '~/components/bomi/Bomi.vue'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
defineEmits<{ restart: [] }>()
const { t } = useI18n()
</script>

<template>
  <Card accent="jade">
    <div class="banner">
      <Bomi class="banner__mascota" :scale="2" pose="cheer" />
      <div class="banner__ko">{{ t('practice.completion_ko') }}</div>
      <div class="banner__txt">{{ t('practice.completion_text') }}</div>
      <Button variant="primary" @click="$emit('restart')">
        {{ t('practice.completion_restart') }}
      </Button>
    </div>
  </Card>
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

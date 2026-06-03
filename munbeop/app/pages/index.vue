<script setup lang="ts">
import Mascota from '~/components/practice/Mascota.vue'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="title">
      <span class="title__ko">내 정원</span>
      <span class="title__es">{{ t('title.garden') }}</span>
    </h1>
    <div class="greeter">
      <Mascota class="greeter__mascota" :size="96" />
      <div class="greeter__copy">
        <p class="greeter__lead">{{ t('empty.garden') }}</p>
        <p>
          <NuxtLink class="greeter__link" to="/practice">→ {{ t('common.go_to_practice') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.title__ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 32px;
  color: var(--jade);
}
.title__es {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--ink);
}
.greeter {
  background: var(--paper-warm);
  border: 2px solid var(--border);
  padding: 32px;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 24px;
}
.greeter__mascota {
  flex-shrink: 0;
}
.greeter__copy {
  flex: 1;
}
.greeter__lead {
  margin: 0 0 12px;
}
.greeter__link {
  color: var(--jade-deep);
  text-decoration: underline;
  font-weight: 600;
}
@media (max-width: 480px) {
  .greeter {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}
</style>

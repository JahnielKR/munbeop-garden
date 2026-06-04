<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="brand">
    <h1 class="brand__title" lang="ko">문법 정원</h1>
    <p class="brand__subtitle">
      {{ t('welcome.brand.subtitle') }} · <span lang="ko">화이팅</span>
    </p>
  </div>
</template>

<style scoped>
.brand {
  text-align: center;
  pointer-events: none;
}
.brand__title {
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(40px, 7vw, 88px);
  color: var(--always-cream);
  text-shadow:
    0 0 12px rgba(0, 0, 0, 0.45),
    3px 3px 0 rgba(0, 0, 0, 0.35);
  margin: 0;
  letter-spacing: 0.02em;
}
.brand__subtitle {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: clamp(10px, 1.4vw, 14px);
  color: var(--always-cream);
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
  margin: 10px 0 0;
  letter-spacing: 0.05em;
}
</style>

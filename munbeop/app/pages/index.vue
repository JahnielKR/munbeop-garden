<script setup lang="ts">
import Bomi from '~/components/bomi/Bomi.vue'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'

definePageMeta({ surface: 'game' })

const { t } = useI18n()
</script>

<template>
  <div class="page">
    <BilingualTitle ko="내 정원" :latin="t('title.garden')" />
    <div class="greeter">
      <Bomi class="greeter__mascota" :scale="3" pose="idle" />
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
  color: var(--link);
  text-decoration: underline;
  font-weight: 600;
}
.greeter__link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
@media (max-width: 480px) {
  .greeter {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}
</style>

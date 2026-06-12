<script setup lang="ts">
/**
 * GameOverScreen — soft, non-punishing fail state (Stardew-style).
 *
 * The roguelike restart is framed as the story slipping away rather than a
 * defeat: warm copy, immediate RETRY with a fresh puzzle draw.
 */

defineEmits<{ retry: []; exit: [] }>()

const { t } = useI18n()
</script>

<template>
  <div class="gameover" data-testid="gameover-root">
    <span class="gameover__icon" aria-hidden="true">🕯️</span>
    <h2 class="gameover__title" data-testid="gameover-title">
      {{ t('escape.game_over_title') }}
    </h2>
    <p class="gameover__text">{{ t('escape.game_over_text') }}</p>

    <div class="gameover__actions">
      <button
        type="button"
        class="gameover__retry"
        data-testid="gameover-retry"
        @click="$emit('retry')"
      >
        ↻ {{ t('escape.retry') }}
      </button>
      <button
        type="button"
        class="gameover__exit"
        data-testid="gameover-exit"
        @click="$emit('exit')"
      >
        {{ t('escape.back_to_book') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.gameover {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 24px;
  background: radial-gradient(ellipse at 50% 100%, #2a1d26 0%, #120c14 75%);
  color: #e8dcc8;
  text-align: center;
}
.gameover__icon {
  font-size: 44px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
}
.gameover__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 15px;
  line-height: 1.6;
  color: #f2d8a8;
}
.gameover__text {
  margin: 0;
  max-width: 440px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(232, 220, 200, 0.85);
}
.gameover__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.gameover__retry {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 12px;
  padding: 14px 34px;
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #1a1a1a);
  border: 3px solid #3a2818;
  cursor: pointer;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.45);
}
.gameover__retry:hover {
  filter: brightness(1.08);
}
.gameover__exit {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 12px;
  padding: 8px 12px;
  background: transparent;
  color: rgba(232, 220, 200, 0.7);
  border: none;
  text-decoration: underline;
  cursor: pointer;
}
.gameover__exit:hover {
  color: rgba(232, 220, 200, 1);
}
</style>

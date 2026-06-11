<script setup lang="ts">
/**
 * GameCard — one game mode in the practice hub.
 *
 * Renders as a chunky pixel card: cover area (image or emoji on gradient),
 * name, one-line description. The whole card is a link; locked cards render
 * inert with a "coming soon" ribbon.
 */

interface Props {
  to: string
  name: string
  description: string
  /** Cover image path (optional). Takes precedence over emoji. */
  image?: string
  /** Big emoji used when no image is given. */
  emoji?: string
  locked?: boolean
  /** i18n'd ribbon text for locked cards. */
  lockedLabel?: string
}

withDefaults(defineProps<Props>(), {
  image: undefined,
  emoji: '🎮',
  locked: false,
  lockedLabel: '',
})
</script>

<template>
  <component
    :is="locked ? 'div' : 'NuxtLink'"
    :to="locked ? undefined : to"
    class="game-card"
    :class="{ 'game-card--locked': locked }"
    :data-testid="`game-card-${to.replaceAll('/', '-')}`"
  >
    <div class="game-card__cover">
      <img v-if="image" :src="image" alt="" class="game-card__img" >
      <span v-else class="game-card__emoji" aria-hidden="true">{{ emoji }}</span>
      <span v-if="locked" class="game-card__ribbon">{{ lockedLabel }}</span>
    </div>
    <div class="game-card__body">
      <h3 class="game-card__name">{{ name }}</h3>
      <p class="game-card__desc">{{ description }}</p>
    </div>
  </component>
</template>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  border: 3px solid var(--border-strong, var(--border));
  background: var(--paper-warm, var(--surface));
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  box-shadow: var(--shadow-button, 4px 4px 0 rgba(60, 42, 24, 0.35));
  transform: translate(0, 0);
  transition:
    transform var(--motion-quick, 120ms) var(--ease-out, ease-out),
    box-shadow var(--motion-quick, 120ms) var(--ease-out, ease-out);
}
.game-card:hover:not(.game-card--locked),
.game-card:focus-visible:not(.game-card--locked) {
  transform: translate(-2px, -3px);
  box-shadow: var(--shadow-button-hover, 7px 8px 0 rgba(60, 42, 24, 0.35));
}
.game-card:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 2px;
}
.game-card--locked {
  opacity: 0.65;
  cursor: default;
  filter: saturate(0.4);
}

.game-card__cover {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f7c69e 0%, #e8a87c 55%, #c97c5d 100%);
  border-bottom: 3px solid var(--border-strong, var(--border));
  overflow: hidden;
}
.game-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}
.game-card__emoji {
  font-size: 56px;
  filter: drop-shadow(2px 3px 0 rgba(60, 42, 24, 0.35));
}
.game-card__ribbon {
  position: absolute;
  top: 12px;
  right: -34px;
  transform: rotate(35deg);
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  letter-spacing: 0.06em;
  padding: 5px 40px;
  pointer-events: none;
}

.game-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px 16px;
}
.game-card__name {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px;
  line-height: 1.4;
}
.game-card__desc {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-soft, var(--ink-soft));
}
:lang(th) .game-card__name,
:lang(vi) .game-card__name,
:lang(ja) .game-card__name {
  font-size: 15px;
}
</style>

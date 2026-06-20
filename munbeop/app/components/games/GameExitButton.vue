<script setup lang="ts">
import { inject } from 'vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

/**
 * Game exit control: a "← Práctica" button. Routes its click through the
 * page's leave guard (inject) so the confirm modal — when a round is in
 * progress — is the same one the sidebar/back navigation triggers. Falls back
 * to a direct push when no guard is present (e.g. the escape-room menu).
 *
 * Place it as the first child of a flex-column page (align-self: flex-start).
 */
interface Props {
  /** Destination route. Defaults to the practice hub. */
  to?: string
}
const props = withDefaults(defineProps<Props>(), { to: '/practice' })

const { t } = useI18n()
const router = useRouter()
const guard = inject(GAME_LEAVE_GUARD, null)

function onClick() {
  if (guard) guard.guardedPush(props.to)
  else void router.push(props.to)
}
</script>

<template>
  <button type="button" class="game-exit" :aria-label="t('games.exit')" @click="onClick">
    <span class="game-exit__arrow" aria-hidden="true">←</span>
    <span class="game-exit__label">{{ t('nav.practice') }}</span>
  </button>
</template>

<style scoped>
/* Pixel chrome consistent with the escape-room HUD back control and the
 * sidebar nav: bordered button on --surface, arrow + label inline. */
.game-exit {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border-strong);
  cursor: pointer;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
  transition:
    background var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.game-exit:hover {
  background: var(--surface-hover);
  transform: translate(-1px, 0);
}
.game-exit:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.game-exit__arrow {
  font-size: 12px;
  line-height: 1;
}
/* Thai / Vietnamese tone marks + Japanese kanji lose detail at 10px — bump
 * one step, same rule the sidebar nav uses. */
:lang(th) .game-exit__label,
:lang(vi) .game-exit__label,
:lang(ja) .game-exit__label {
  font-size: 13px;
}
@media (prefers-reduced-motion: reduce) {
  .game-exit {
    transition: none;
  }
}
</style>

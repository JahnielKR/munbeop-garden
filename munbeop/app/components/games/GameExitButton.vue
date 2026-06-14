<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'

/**
 * Game exit control: a "← Práctica" button that returns to the practice hub.
 *
 * When `confirm` is set (the page passes a reactive flag — e.g. a live ruleta
 * round) clicking opens a confirmation modal so a misclick can't discard the
 * round. With `confirm` false it navigates immediately. The component owns the
 * navigation so a page only needs the single tag.
 *
 * Place it as the first child of a flex-column page (it uses
 * `align-self: flex-start` so it stays compact at the top-left).
 */
interface Props {
  /** Ask before leaving. Pass a reactive flag tied to in-progress state. */
  confirm?: boolean
  /** Destination route. Defaults to the practice hub. */
  to?: string
}
const props = withDefaults(defineProps<Props>(), { confirm: false, to: '/practice' })

const { t } = useI18n()
const router = useRouter()
const showConfirm = ref(false)

function onClick() {
  if (props.confirm) showConfirm.value = true
  else leave()
}

function leave() {
  showConfirm.value = false
  void router.push(props.to)
}
</script>

<template>
  <button type="button" class="game-exit" :aria-label="t('games.exit')" @click="onClick">
    <span class="game-exit__arrow" aria-hidden="true">←</span>
    <span class="game-exit__label">{{ t('nav.practice') }}</span>
  </button>

  <Modal
    :open="showConfirm"
    :title="t('games.exit_confirm_title')"
    :close-label="t('games.exit_confirm_cancel')"
    @close="showConfirm = false"
  >
    <p class="game-exit__confirm-body">{{ t('games.exit_confirm_body') }}</p>
    <div class="game-exit__confirm-actions">
      <Button variant="secondary" @click="showConfirm = false">
        {{ t('games.exit_confirm_cancel') }}
      </Button>
      <Button variant="danger" @click="leave">
        {{ t('games.exit_confirm_leave') }}
      </Button>
    </div>
  </Modal>
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
.game-exit__confirm-body {
  margin: 0 0 20px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  color: var(--ink, var(--text));
}
.game-exit__confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
@media (prefers-reduced-motion: reduce) {
  .game-exit {
    transition: none;
  }
}
</style>

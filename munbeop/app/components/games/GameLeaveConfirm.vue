<script setup lang="ts">
import { inject } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import { GAME_LEAVE_GUARD } from '~/composables/useGameLeaveGuard'

/**
 * Confirm modal for leaving a game mid-round. Driven by the page's
 * useGameLeaveGuard() via inject — render it once per game page.
 */
const { t } = useI18n()
const guard = inject(GAME_LEAVE_GUARD, null)
</script>

<template>
  <Modal
    v-if="guard"
    :open="guard.confirmOpen.value"
    :title="t('games.exit_confirm_title')"
    :close-label="t('games.exit_confirm_cancel')"
    @close="guard.cancel()"
  >
    <p class="leave-confirm__body">{{ t('games.exit_confirm_body') }}</p>
    <div class="leave-confirm__actions">
      <Button variant="secondary" @click="guard.cancel()">
        {{ t('games.exit_confirm_cancel') }}
      </Button>
      <Button variant="danger" @click="guard.confirm()">
        {{ t('games.exit_confirm_leave') }}
      </Button>
    </div>
  </Modal>
</template>

<style scoped>
.leave-confirm__body {
  margin: 0 0 20px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  line-height: 1.6;
  color: var(--ink, var(--text));
}
.leave-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

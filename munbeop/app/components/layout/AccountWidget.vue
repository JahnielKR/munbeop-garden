<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import Button from '~/components/ui/Button.vue'

const auth = useAuthStore()
const { signOutAndExit } = useAuth()
const { t } = useI18n()

async function onSignOut() {
  // signOutAndExit navigates to /welcome so the pan-left transition
  // plays as the user "leaves the castle".
  await signOutAndExit()
}
</script>

<template>
  <!-- Accounts are mandatory: inside the app shell there is always a
       session. The only signed-out frames are the brief sign-out →
       /welcome redirect, where rendering nothing is correct. -->
  <div v-if="auth.user" class="widget">
    <div class="email">
      <span class="email__label">{{ t('auth.signed_in_as') }}</span>
      <span class="email__addr">{{ auth.user.email }}</span>
    </div>
    <Button variant="secondary" @click="onSignOut">
      {{ t('auth.sign_out') }}
    </Button>
  </div>
</template>

<style scoped>
.widget {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.email {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.email__label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-soft);
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
.email__addr {
  /* Email addresses keep mono — JetBrains Mono is the system's mono
   * face per 01-tokens.md §3.1 and is monospaced like a pixel font
   * without losing legibility for arbitrary user-typed strings. */
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text);
  word-break: break-all;
}
</style>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import PixelButton from '~/components/ui/PixelButton.vue'

const auth = useAuthStore()
const { signOut } = useAuth()
const { t } = useI18n()
const router = useRouter()

async function onSignOut() {
  await signOut()
  router.push('/')
}

function onSignIn() {
  router.push('/auth/sign-in')
}
</script>

<template>
  <div class="widget">
    <template v-if="auth.user">
      <div class="email">
        <span class="email__label">{{ t('auth.signed_in_as') }}</span>
        <span class="email__addr">{{ auth.user.email }}</span>
      </div>
      <PixelButton variant="secondary" @click="onSignOut">
        {{ t('auth.sign_out') }}
      </PixelButton>
    </template>
    <template v-else>
      <div class="anon">{{ t('auth.anonymous_banner') }}</div>
      <PixelButton variant="primary" @click="onSignIn">
        {{ t('auth.sign_in_title') }}
      </PixelButton>
    </template>
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
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}
.email__addr {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--ink);
  word-break: break-all;
}
.anon {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.4;
}
</style>

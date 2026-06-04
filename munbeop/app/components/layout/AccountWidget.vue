<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import Button from '~/components/ui/Button.vue'

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
      <Button variant="secondary" @click="onSignOut">
        {{ t('auth.sign_out') }}
      </Button>
    </template>
    <template v-else>
      <div class="anon">{{ t('auth.anonymous_banner') }}</div>
      <Button variant="primary" @click="onSignIn">
        {{ t('auth.sign_in_title') }}
      </Button>
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
.anon {
  /* Pixel-art per user feedback. The two-line banner reads in PS2P
   * at 9px with extra line-height; CJK falls through to Noto Sans KR
   * so the ja translation isn't dropped into raw monospace. */
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  letter-spacing: 0.03em;
  color: var(--text-soft);
  line-height: 1.6;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: grayscale;
  font-smooth: never;
}
/* Thai / Vietnamese diacritics get squashed at 9 px — bump for readability. */
:lang(th) .anon,
:lang(vi) .anon {
  font-size: 11px;
  line-height: 1.5;
}
</style>

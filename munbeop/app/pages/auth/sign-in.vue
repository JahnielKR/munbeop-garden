<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'

const { signIn, signUp, signInMagicLink } = useAuth()
const { t } = useI18n()
const toast = useToast()
const router = useRouter()

const mode = ref<'sign-in' | 'sign-up' | 'magic-link'>('sign-in')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function submit() {
  if (loading.value) return
  errorMsg.value = ''
  loading.value = true
  const e = email.value.trim()
  const p = password.value
  let result: { error: { message: string } | null } = { error: null }
  try {
    if (mode.value === 'sign-in') {
      result = await signIn(e, p)
    } else if (mode.value === 'sign-up') {
      result = await signUp(e, p)
    } else {
      result = await signInMagicLink(e)
      if (!result.error) toast.show(t('auth.magic_link_sent'))
    }
  } finally {
    loading.value = false
  }
  if (result.error) {
    errorMsg.value = result.error.message
    toast.show(result.error.message)
  } else if (mode.value !== 'magic-link') {
    await router.push('/')
  }
}

function switchMode(next: 'sign-in' | 'sign-up' | 'magic-link') {
  mode.value = next
  errorMsg.value = ''
}
</script>

<template>
  <div class="page">
    <Card accent="jade">
      <h1 class="title">
        {{ mode === 'sign-up' ? t('auth.sign_up_title') : t('auth.sign_in_title') }}
      </h1>

      <form class="form" @submit.prevent="submit">
        <label class="label" for="auth-email">{{ t('auth.email_label') }}</label>
        <Input
          id="auth-email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          placeholder="you@example.com"
          :error="!!errorMsg"
          required
        />

        <template v-if="mode !== 'magic-link'">
          <label class="label" for="auth-password">{{ t('auth.password_label') }}</label>
          <Input
            id="auth-password"
            v-model="password"
            type="password"
            name="password"
            :autocomplete="mode === 'sign-up' ? 'new-password' : 'current-password'"
            :error="!!errorMsg"
            required
          />
        </template>

        <div v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</div>

        <div class="actions">
          <Button type="submit" variant="primary" :loading="loading" full-width>
            {{
              mode === 'sign-up'
                ? t('auth.submit_sign_up')
                : mode === 'magic-link'
                  ? t('auth.submit_magic_link')
                  : t('auth.submit_sign_in')
            }}
          </Button>
        </div>
      </form>

      <div class="switch">
        <button v-if="mode === 'sign-in'" type="button" class="link" @click="switchMode('sign-up')">
          {{ t('auth.switch_to_sign_up') }}
        </button>
        <button v-else type="button" class="link" @click="switchMode('sign-in')">
          {{ t('auth.switch_to_sign_in') }}
        </button>
        <button v-if="mode !== 'magic-link'" type="button" class="link" @click="switchMode('magic-link')">
          {{ t('auth.submit_magic_link') }}
        </button>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.page {
  max-width: 420px;
  margin: 40px auto;
}
.title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 14px;
  color: var(--text);
  margin-bottom: 18px;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 9px;
  color: var(--text-soft);
  display: block;
  margin: 12px 0 4px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.error {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--danger);
  background: color-mix(in oklch, var(--red) 10%, var(--surface));
  border-left: 3px solid var(--red);
  padding: 8px 12px;
  margin-top: 10px;
}
.actions {
  margin-top: 18px;
}
.switch {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 18px;
}
.link {
  background: none;
  border: none;
  color: var(--link);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  text-decoration: underline;
  padding: 4px 0;
  text-align: left;
}
.link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>

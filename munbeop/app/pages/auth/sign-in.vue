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

async function submit() {
  loading.value = true
  const e = email.value.trim()
  const p = password.value
  let result: { error: { message: string } | null } = { error: null }
  if (mode.value === 'sign-in') {
    result = await signIn(e, p)
  } else if (mode.value === 'sign-up') {
    result = await signUp(e, p)
  } else {
    result = await signInMagicLink(e)
    if (!result.error) toast.show(t('auth.magic_link_sent'))
  }
  loading.value = false
  if (result.error) {
    toast.show(result.error.message)
  } else if (mode.value !== 'magic-link') {
    await router.push('/')
  }
}
</script>

<template>
  <div class="page">
    <Card accent="jade">
      <h1 class="title">
        {{ mode === 'sign-up' ? t('auth.sign_up_title') : t('auth.sign_in_title') }}
      </h1>

      <label class="label">{{ t('auth.email_label') }}</label>
      <Input v-model="email" placeholder="you@example.com" />

      <template v-if="mode !== 'magic-link'">
        <label class="label">{{ t('auth.password_label') }}</label>
        <Input v-model="password" />
      </template>

      <div class="actions">
        <Button variant="primary" :disabled="loading" @click="submit">
          {{
            mode === 'sign-up'
              ? t('auth.submit_sign_up')
              : mode === 'magic-link'
                ? t('auth.submit_magic_link')
                : t('auth.submit_sign_in')
          }}
        </Button>
      </div>

      <div class="switch">
        <button v-if="mode === 'sign-in'" type="button" class="link" @click="mode = 'sign-up'">
          {{ t('auth.switch_to_sign_up') }}
        </button>
        <button v-else type="button" class="link" @click="mode = 'sign-in'">
          {{ t('auth.switch_to_sign_in') }}
        </button>
        <button type="button" class="link" @click="mode = 'magic-link'">
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
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: var(--jade);
  margin-bottom: 18px;
}
.label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  color: var(--ink-soft);
  display: block;
  margin: 12px 0 6px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
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
  color: var(--sky);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  text-decoration: underline;
  padding: 0;
  text-align: left;
}
</style>

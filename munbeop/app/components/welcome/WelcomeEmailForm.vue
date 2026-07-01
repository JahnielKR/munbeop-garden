<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { isPasswordLongEnough } from '~/lib/auth/password'

const props = defineProps<{ mode: 'signin' | 'signup' | 'magic' }>()
const emit = defineEmits<{
  success: []
  error: [message: string]
  info:    [message: string]
}>()

const { t } = useI18n()
const { signIn, signUp, signInMagicLink, resetPassword } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

// Sign-up requires the min-length password policy (mirrors reset-password +
// AccountCredentials). Sign-in must NOT gate on length — existing accounts may
// predate the policy. Magic-link has no password field.
const canSubmit = computed(() => {
  if (loading.value) return false
  if (props.mode === 'signup') return isPasswordLongEnough(password.value)
  return true
})

watch(() => props.mode, () => { password.value = '' })

// "Forgot password?" — email a recovery link to the address already typed.
// Self-service recovery for password accounts; without it a forgotten
// password permanently strands the user (accounts are mandatory).
async function onForgotPassword() {
  const addr = email.value.trim()
  if (!addr) {
    emit('error', t('auth.reset_need_email'))
    return
  }
  const { error } = await resetPassword(addr)
  if (error) {
    emit('error', error.message)
    return
  }
  emit('info', t('auth.reset_email_sent'))
}

async function submit() {
  if (loading.value) return
  loading.value = true
  try {
    if (props.mode === 'signup') {
      const { error, needsConfirmation } = await signUp(email.value.trim(), password.value)
      if (error) {
        emit('error', error.message)
        return
      }
      // "Confirm email" is ON: there is no session yet, so don't navigate into
      // the app (it would bounce back to /welcome). Tell the user to check mail.
      if (needsConfirmation) {
        emit('info', t('auth.signup_confirm_sent'))
        return
      }
    } else {
      const result =
        props.mode === 'signin'
          ? await signIn(email.value.trim(), password.value)
          : await signInMagicLink(email.value.trim())
      if (result.error) {
        emit('error', result.error.message)
        return
      }
      if (props.mode === 'magic') {
        emit('info', t('auth.magic_link_sent'))
        return
      }
    }
    emit('success')
    const { fadeOut } = useWelcomeMusic()
    // Fire the music fade in parallel with the pan — the 700ms ramp
    // ends just as the layout-transition middleware's pan-right finishes
    // sliding the camera into the in-app surface.
    void fadeOut(700)
    await router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="email-form" @submit.prevent="submit">
    <label class="email-form__label">
      <span class="email-form__label-text">{{ t('auth.email_label') }}</span>
      <input
        v-model="email"
        class="email-form__input"
        type="email"
        autocomplete="email"
        inputmode="email"
        required
      >
    </label>
    <label v-if="props.mode !== 'magic'" class="email-form__label">
      <span class="email-form__label-text">{{ t('auth.password_label') }}</span>
      <input
        v-model="password"
        class="email-form__input"
        type="password"
        :autocomplete="props.mode === 'signup' ? 'new-password' : 'current-password'"
        required
      >
      <span v-if="props.mode === 'signup'" class="email-form__hint">
        {{ t('auth.password_min') }}
      </span>
    </label>
    <button
      type="submit"
      class="email-form__submit"
      :disabled="!canSubmit"
    >
      {{
        props.mode === 'signup'
          ? t('auth.submit_sign_up')
          : props.mode === 'magic'
            ? t('auth.submit_magic_link')
            : t('auth.submit_sign_in')
      }}
    </button>
    <button
      v-if="props.mode === 'signin'"
      type="button"
      class="email-form__forgot"
      :disabled="loading"
      @click="onForgotPassword"
    >
      {{ t('auth.forgot_password') }}
    </button>
  </form>
</template>

<style scoped>
.email-form { display: flex; flex-direction: column; gap: 10px; }
.email-form__label { display: flex; flex-direction: column; gap: 4px; }
.email-form__label-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: var(--text-soft);
}
.email-form__hint {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: var(--text-soft);
}
.email-form__input {
  border: 2px solid var(--border);
  background: var(--paper-warm);
  color: var(--text);
  padding: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}
.email-form__input:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.email-form__submit {
  margin-top: 4px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 3px solid var(--ink-soft);
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 12px;
  cursor: pointer;
}
.email-form__submit:disabled { opacity: 0.55; cursor: progress; }
.email-form__submit:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.email-form__forgot {
  align-self: center;
  margin-top: 2px;
  background: none;
  border: none;
  padding: 4px;
  color: var(--text-soft);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}
.email-form__forgot:hover { color: var(--text); }
.email-form__forgot:disabled { opacity: 0.55; cursor: progress; }
.email-form__forgot:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>

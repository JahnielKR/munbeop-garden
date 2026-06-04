<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ mode: 'signin' | 'signup' | 'magic' }>()
const emit = defineEmits<{
  success: []
  error: [message: string]
  info:    [message: string]
}>()

const { t } = useI18n()
const { signIn, signUp, signInMagicLink } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

watch(() => props.mode, () => { password.value = '' })

async function submit() {
  if (loading.value) return
  loading.value = true
  try {
    let result: { error: { message: string } | null }
    if (props.mode === 'signin') {
      result = await signIn(email.value.trim(), password.value)
    } else if (props.mode === 'signup') {
      result = await signUp(email.value.trim(), password.value)
    } else {
      result = await signInMagicLink(email.value.trim())
    }
    if (result.error) {
      emit('error', result.error.message)
      return
    }
    if (props.mode === 'magic') {
      emit('info', t('auth.magic_link_sent'))
      return
    }
    emit('success')
    const { setEnter } = useRouteTransition()
    const { fadeOut } = useWelcomeMusic()
    setEnter()
    // Fire the fade in parallel with the pan — the 700ms music ramp
    // ends just as the new scene finishes sliding in.
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
    </label>
    <button
      type="submit"
      class="email-form__submit"
      :disabled="loading"
    >
      {{
        props.mode === 'signup'
          ? t('auth.submit_sign_up')
          : props.mode === 'magic'
            ? t('auth.submit_magic_link')
            : t('auth.submit_sign_in')
      }}
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
</style>

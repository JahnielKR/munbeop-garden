<script setup lang="ts">
import { ref } from 'vue'
import WelcomeEmailForm from './WelcomeEmailForm.vue'

const emit = defineEmits<{
  dialog: [text: string, variant?: 'normal' | 'error']
  welcomed: []
}>()

const props = defineProps<{ initialEmailMode: 'signin' | 'signup' | 'magic' | null }>()

const { t } = useI18n()
const { signInWithProvider } = useAuth()
const router = useRouter()

const expanded = ref<'signin' | 'signup' | 'magic' | null>(props.initialEmailMode)
const loading = ref<'kakao' | 'google' | null>(null)

function setWelcomedFlag() {
  try { localStorage.setItem('mungarden:welcomed', '1') } catch { /* private mode */ }
  emit('welcomed')
}

async function provider(name: 'kakao' | 'google') {
  if (loading.value) return
  loading.value = name
  emit('dialog', name === 'kakao' ? t('welcome.dialog.kakao') : t('welcome.dialog.google'))
  setWelcomedFlag()
  const { error } = await signInWithProvider(name)
  if (error) {
    emit('dialog', t('welcome.dialog.error_oauth'), 'error')
    loading.value = null
  }
  // On success the browser navigates to the OAuth provider; no further work here.
}

function openEmail(mode: 'signin' | 'signup' | 'magic') {
  expanded.value = mode
  emit('dialog', mode === 'magic' ? t('welcome.dialog.magic') : t('welcome.dialog.email'))
}

function onFormSuccess() {
  setWelcomedFlag()
}
function onFormError(msg: string) {
  emit('dialog', msg, 'error')
}
function onFormInfo(msg: string) {
  emit('dialog', msg)
}

async function anonEntry() {
  emit('dialog', t('welcome.dialog.anon'))
  setWelcomedFlag()
  await router.push('/')
}
</script>

<template>
  <div class="options">
    <button
      type="button"
      class="opt opt--kakao"
      :disabled="loading !== null"
      @click="provider('kakao')"
    >
      <span class="opt__icon" aria-hidden="true">K</span>
      <span>{{ t('welcome.menu.kakao') }}</span>
      <span v-if="loading === 'kakao'" class="opt__dots">. . .</span>
    </button>

    <button
      type="button"
      class="opt opt--google"
      :disabled="loading !== null"
      @click="provider('google')"
    >
      <span class="opt__icon" aria-hidden="true">G</span>
      <span>{{ t('welcome.menu.google') }}</span>
      <span v-if="loading === 'google'" class="opt__dots">. . .</span>
    </button>

    <button type="button" class="opt" @click="openEmail('signin')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_signin') }}</span>
    </button>
    <button type="button" class="opt" @click="openEmail('signup')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_signup') }}</span>
    </button>
    <button type="button" class="opt" @click="openEmail('magic')">
      <span class="opt__arrow" aria-hidden="true">▶</span>
      <span>{{ t('welcome.menu.email_magic') }}</span>
    </button>

    <WelcomeEmailForm
      v-if="expanded"
      :mode="expanded"
      @success="onFormSuccess"
      @error="onFormError"
      @info="onFormInfo"
    />

    <hr class="options__sep">

    <button type="button" class="opt opt--anon" @click="anonEntry">
      <span>{{ t('welcome.menu.anon') }}</span>
    </button>
  </div>
</template>

<style scoped>
.options { display: flex; flex-direction: column; gap: 10px; }
.opt {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 3px solid transparent;
  color: var(--text);
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 10px;
  letter-spacing: 0.04em;
  text-align: left;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
}
.opt:hover:not(:disabled) {
  border-color: var(--gold);
  background: color-mix(in oklch, var(--gold) 10%, transparent);
  transform: translateX(2px);
}
.opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.opt:disabled { opacity: 0.55; cursor: progress; }
.opt__arrow { color: var(--gold); }
.opt__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border: 2px solid currentColor;
  font-size: 10px;
}
.opt--kakao { background: #fee500; color: var(--always-dark); border-color: var(--always-dark); }
.opt--kakao:hover:not(:disabled) { background: #ffe940; }
.opt--google { background: var(--paper-warm); border-color: var(--ink-soft); }
.opt--anon  { font-family: 'Inter', sans-serif; font-size: 12px; opacity: 0.85; }
.opt__dots  { margin-left: auto; letter-spacing: 0.2em; }
.options__sep {
  border: 0;
  border-top: 2px dashed var(--border);
  margin: 6px 0;
}
</style>

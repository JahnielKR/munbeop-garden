<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import { NuxtLink } from '#components'
import { useToast } from '~/composables/useToast'

// Standalone surface (no AppShell): the user arrives here from a recovery
// email, often before any in-app session feels "theirs". /auth/* is already
// public per isPublicPath.
definePageMeta({ layout: false, surface: 'welcome' })

const { t } = useI18n()
const toast = useToast()
const { updatePassword } = useAuth()

// 'checking' until getSession resolves; 'ready' shows the form; 'invalid'
// means the recovery link never established a session (expired / reused).
const status = ref<'checking' | 'ready' | 'invalid'>('checking')
const password = ref('')
const busy = ref(false)
const MIN_LEN = 8
const canSubmit = computed(() => password.value.length >= MIN_LEN && !busy.value)

onMounted(async () => {
  // PKCE: the recovery link's tokens are auto-exchanged for a session before
  // this resolves. A session here is what authorises updateUser({ password }).
  const { $supabase } = useNuxtApp()
  const { data } = await $supabase.auth.getSession()
  status.value = data.session ? 'ready' : 'invalid'
})

async function submit() {
  if (!canSubmit.value) return
  busy.value = true
  const { error } = await updatePassword(password.value)
  busy.value = false
  if (error) {
    toast.error(t('auth.reset_error'))
    return
  }
  toast.success(t('auth.password_updated'))
  await navigateTo('/', { replace: true })
}
</script>

<template>
  <div class="reset">
    <div class="reset__card">
      <h1 class="reset__title">{{ t('auth.reset_title') }}</h1>

      <p v-if="status === 'checking'" class="reset__msg">{{ t('auth.checking') }}</p>

      <template v-else-if="status === 'invalid'">
        <p class="reset__msg reset__msg--err">{{ t('auth.reset_invalid') }}</p>
        <NuxtLink class="reset__link" to="/welcome">{{ t('auth.back_to_sign_in') }}</NuxtLink>
      </template>

      <form v-else class="reset__form" @submit.prevent="submit">
        <Field :label="t('auth.new_password_label')" html-for="new-password">
          <Input
            id="new-password"
            v-model="password"
            type="password"
            autocomplete="new-password"
          />
        </Field>
        <p class="reset__hint">{{ t('auth.password_min') }}</p>
        <Button type="submit" :disabled="!canSubmit" :loading="busy">
          {{ t('auth.submit_new_password') }}
        </Button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.reset {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--paper);
}
.reset__card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--paper-warm);
  border: 2px solid var(--border);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
  padding: 24px;
}
.reset__title {
  margin: 0;
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.reset__msg {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text-soft);
}
.reset__msg--err {
  color: var(--danger);
}
.reset__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reset__hint {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-soft);
}
.reset__link {
  align-self: flex-start;
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
}
.reset__link:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>

<script setup lang="ts">
/**
 * AccountCredentials — email/password self-service for the settings Account
 * tab. Renders only for email-identity users (an OAuth-only account has no
 * password to rotate and changes its email through the provider), so the
 * whole section is hidden for Kakao/Google logins.
 */
import { useAuthStore } from '~/stores/auth'
import { isEmailIdentity } from '~/lib/auth/identity'
import { MIN_PASSWORD_LENGTH } from '~/lib/auth/password'
import { useToast } from '~/composables/useToast'
import BilingualTitle from '~/components/ui/BilingualTitle.vue'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()
const { reauthenticate, updatePassword, updateEmail } = useAuth()

const isEmailUser = computed(() => isEmailIdentity(authStore.user))

// ── Change password ──────────────────────────────────────────────────────
const MIN_LEN = MIN_PASSWORD_LENGTH
const currentPassword = ref('')
const newPassword = ref('')
const pwBusy = ref(false)
const canPw = computed(
  () => currentPassword.value.length > 0 && newPassword.value.length >= MIN_LEN && !pwBusy.value,
)

async function submitPassword() {
  if (!canPw.value) return
  pwBusy.value = true
  // Re-verify the current password before rotating it — a hijacked session
  // must not be able to change the password without knowing the old one.
  const reauth = await reauthenticate(currentPassword.value)
  if (reauth.error) {
    pwBusy.value = false
    toast.error(t('settings.account.password.wrong_current'))
    return
  }
  const { error } = await updatePassword(newPassword.value)
  pwBusy.value = false
  if (error) {
    toast.error(t('auth.reset_error'))
    return
  }
  currentPassword.value = ''
  newPassword.value = ''
  toast.success(t('auth.password_updated'))
}

// ── Change email ─────────────────────────────────────────────────────────
const newEmail = ref('')
const emailBusy = ref(false)
const canEmail = computed(() => /.+@.+\..+/.test(newEmail.value.trim()) && !emailBusy.value)

async function submitEmail() {
  if (!canEmail.value) return
  emailBusy.value = true
  const { error } = await updateEmail(newEmail.value.trim())
  emailBusy.value = false
  if (error) {
    toast.error(t('settings.account.email.error'))
    return
  }
  newEmail.value = ''
  toast.success(t('settings.account.email.sent'))
}
</script>

<template>
  <section v-if="isEmailUser" class="creds" :aria-label="t('settings.account.security.title')">
    <BilingualTitle ko="보안" :latin="t('settings.account.security.title')" level="h2" />

    <form class="creds__form" @submit.prevent="submitPassword">
      <Field :label="t('auth.current_password_label')" html-for="current-password">
        <Input
          id="current-password"
          v-model="currentPassword"
          type="password"
          autocomplete="current-password"
        />
      </Field>
      <Field :label="t('auth.new_password_label')" html-for="set-password">
        <Input id="set-password" v-model="newPassword" type="password" autocomplete="new-password" />
      </Field>
      <p class="creds__hint">{{ t('auth.password_min') }}</p>
      <Button type="submit" size="sm" :disabled="!canPw" :loading="pwBusy">
        {{ t('settings.account.password.submit') }}
      </Button>
    </form>

    <form class="creds__form" @submit.prevent="submitEmail">
      <Field :label="t('settings.account.email.title')" html-for="set-email">
        <Input id="set-email" v-model="newEmail" type="email" autocomplete="email" />
      </Field>
      <p class="creds__hint">{{ t('settings.account.email.hint') }}</p>
      <Button type="submit" size="sm" :disabled="!canEmail" :loading="emailBusy">
        {{ t('settings.account.email.submit') }}
      </Button>
    </form>
  </section>
</template>

<style scoped>
.creds {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.creds__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
.creds__form :deep(.field) {
  width: 100%;
}
.creds__hint {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-soft);
}
</style>

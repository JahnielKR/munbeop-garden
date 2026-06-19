<script setup lang="ts">
import { NuxtLink } from '#components'

const { t } = useI18n()
const status = ref<'checking' | 'success' | 'error'>('checking')
const toast = useToast()
const { hydrateUserStores } = useAuth()

onMounted(async () => {
  // PKCE flow: the client auto-exchanges the URL params for a session.
  // We just need to wait for getSession() to resolve and verify success.
  const { $supabase } = useNuxtApp()
  const { data, error } = await $supabase.auth.getSession()
  if (error || !data.session) {
    status.value = 'error'
    toast.show(t('auth.callback_error'))
    return
  }
  // Re-hydrate the stores now that the session exists, so the first
  // paint of the app shows the account's cloud data.
  await hydrateUserStores()
  status.value = 'success'
  toast.show(t('auth.callback_success'))
  // layout-transition.global middleware sees from=/auth/callback,
  // to=/ → sets layoutTransition='pan-right' so the camera pans in.
  await navigateTo('/', { replace: true })
})
</script>

<template>
  <div class="page">
    <p v-if="status === 'checking'">{{ t('auth.checking') }}</p>
    <p v-else-if="status === 'success'">{{ t('auth.callback_success') }}</p>
    <template v-else>
      <p>{{ t('auth.callback_error') }}</p>
      <NuxtLink class="link" to="/welcome">{{ t('auth.back_to_sign_in') }}</NuxtLink>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 420px;
  margin: 80px auto;
  text-align: center;
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
}
.link {
  display: inline-block;
  margin-top: 16px;
  color: var(--ink);
  font-weight: 600;
  text-decoration: underline;
}
.link:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>

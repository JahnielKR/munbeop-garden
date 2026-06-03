<script setup lang="ts">
const { t } = useI18n()
const status = ref<'checking' | 'success' | 'error'>('checking')
const toast = useToast()
const { runPostLoginMigration } = useAuth()

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
  // First-time magic-link sign-in: migrate any anonymous local data.
  await runPostLoginMigration()
  status.value = 'success'
  toast.show(t('auth.callback_success'))
  await navigateTo('/', { replace: true })
})
</script>

<template>
  <div class="page">
    <p v-if="status === 'checking'">{{ t('auth.checking') }}</p>
    <p v-else-if="status === 'success'">{{ t('auth.callback_success') }}</p>
    <p v-else>{{ t('auth.callback_error') }}</p>
  </div>
</template>

<style scoped>
.page {
  max-width: 420px;
  margin: 80px auto;
  text-align: center;
  font-family: 'Inter', sans-serif;
  color: var(--muted);
}
</style>

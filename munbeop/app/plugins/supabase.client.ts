import { getSupabaseClient } from '~/lib/auth/client'

// Client-only plugin — Supabase auth state lives in the browser, not on the
// server. Provides $supabase to every component / composable. Importantly,
// this plugin does NOT call useI18n() or any function that surfaces the
// Nuxt 4 + @nuxtjs/i18n 'SyntaxError: 26' regression — see the prior
// i18n-persist plugin's removal commit for context.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const client = getSupabaseClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
  )
  return {
    provide: { supabase: client },
  }
})

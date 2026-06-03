import type { SupabaseClient } from '@supabase/supabase-js'

// Tell TypeScript that the supabase.client.ts plugin's provide.supabase
// becomes the $supabase property of NuxtApp and ComponentCustomProperties.
declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient
  }
}

export {}

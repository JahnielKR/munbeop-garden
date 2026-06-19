import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

// Tell TypeScript that the supabase.client.ts plugin's provide.supabase
// becomes the $supabase property of NuxtApp and ComponentCustomProperties.
declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient<Database>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient<Database>
  }
}

export {}

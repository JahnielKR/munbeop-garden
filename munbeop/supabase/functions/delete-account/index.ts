// Supabase Edge Function (Deno) — permanently delete the calling user's
// account. Verifies the caller's JWT, then uses the service-role key to
// delete the auth.users row; ON DELETE CASCADE wipes the user_* tables.
// Deploy: `supabase functions deploy delete-account` (SUPABASE_URL,
// SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are auto-injected).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing authorization' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()
    if (userErr || !user) return json({ error: 'Invalid session' }, 401)

    const admin = createClient(url, serviceKey)
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id)
    if (delErr) return json({ error: delErr.message }, 500)

    return json({ ok: true }, 200)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

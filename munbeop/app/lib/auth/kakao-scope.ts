// Supabase's Kakao OAuth helper hard-codes the scope
// `account_email profile_image profile_nickname` in the URL it builds.
// Passing `options.scopes` to `signInWithOAuth` *appends* to that default
// rather than replacing it (proven: the URL ended up with two
// `profile_nickname` and two `profile_image` entries and `account_email`
// still present), and the Supabase dashboard exposes no Scopes field for
// the Kakao provider. Until the mungarden Kakao app gets `account_email`
// approved via the Developers console's "Request additional features"
// flow, we ask Supabase to skip its own redirect, strip `account_email`
// from the URL ourselves, and redirect manually.
export function stripAccountEmailFromKakaoUrl(url: string): string {
  const u = new URL(url)
  const scope = u.searchParams.get('scope') ?? ''
  const filtered = Array.from(
    new Set(scope.split(/\s+/).filter((s) => s && s !== 'account_email')),
  ).join(' ')
  u.searchParams.set('scope', filtered)
  return u.toString()
}

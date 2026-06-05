import { describe, it, expect } from 'vitest'
import { stripAccountEmailFromKakaoUrl } from '~/lib/auth/kakao-scope'

const BASE =
  'https://kauth.kakao.com/oauth/authorize?client_id=abc&response_type=code&state=xyz'

describe('stripAccountEmailFromKakaoUrl', () => {
  it('drops account_email when it is the first scope', () => {
    const out = stripAccountEmailFromKakaoUrl(
      `${BASE}&scope=account_email+profile_image+profile_nickname`,
    )
    expect(new URL(out).searchParams.get('scope')).toBe(
      'profile_image profile_nickname',
    )
  })

  it('deduplicates the scopes Supabase appended on top of its default', () => {
    const out = stripAccountEmailFromKakaoUrl(
      `${BASE}&scope=account_email+profile_image+profile_nickname+profile_nickname+profile_image`,
    )
    expect(new URL(out).searchParams.get('scope')).toBe(
      'profile_image profile_nickname',
    )
  })

  it('returns an empty scope string if account_email was the only one', () => {
    const out = stripAccountEmailFromKakaoUrl(`${BASE}&scope=account_email`)
    expect(new URL(out).searchParams.get('scope')).toBe('')
  })

  it('preserves every other query parameter', () => {
    const out = new URL(
      stripAccountEmailFromKakaoUrl(`${BASE}&scope=account_email+profile_image`),
    )
    expect(out.searchParams.get('client_id')).toBe('abc')
    expect(out.searchParams.get('response_type')).toBe('code')
    expect(out.searchParams.get('state')).toBe('xyz')
  })
})

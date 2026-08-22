import { expect, type Page } from '@playwright/test'
import { STORAGE_KEYS } from '../../app/lib/storage/keys'

export const E2E_BACKEND_KEY = 'munbeop.e2e.backend.v1'
export const E2E_SESSION_KEY = 'munbeop.e2e.session.v1'
export const E2E_SUPABASE_TOKEN_KEY = 'sb-e2e-auth-token'

export interface ScenarioUser {
  email: string
  data: Record<string, unknown>
  failReadsRemaining?: number
}

export interface Scenario {
  users: ScenarioUser[]
  sessionEmail?: string
}

export function userIdForEmail(email: string): string {
  return `e2e-${email.trim().toLowerCase()}`
}

function sessionFor(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const now = new Date().toISOString()
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60
  return {
    access_token: `e2e-access-${normalizedEmail}`,
    token_type: 'bearer',
    expires_in: 60 * 60,
    expires_at: expiresAt,
    refresh_token: `e2e-refresh-${normalizedEmail}`,
    user: {
      id: userIdForEmail(normalizedEmail),
      aud: 'authenticated',
      role: 'authenticated',
      email: normalizedEmail,
      email_confirmed_at: now,
      phone: '',
      confirmed_at: now,
      last_sign_in_at: now,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      identities: [],
      created_at: now,
      updated_at: now,
      is_anonymous: false,
    },
  }
}

export async function installScenario(page: Page, scenario: Scenario): Promise<void> {
  const state = {
    version: 1 as const,
    accounts: Object.fromEntries(
      scenario.users.map((user) => [
        userIdForEmail(user.email),
        {
          email: user.email.trim().toLowerCase(),
          data: user.data,
          failReadsRemaining: user.failReadsRemaining ?? 0,
          activityReceipts: {},
          journalDeletes: {},
        },
      ]),
    ),
  }
  const session = scenario.sessionEmail ? sessionFor(scenario.sessionEmail) : null
  await page.addInitScript(
    ({ backendKey, sessionKey, tokenKey, seededState, seededSession }) => {
      const guard = 'munbeop.e2e.scenario-installed.v1'
      if (sessionStorage.getItem(guard)) return
      sessionStorage.setItem(guard, '1')
      localStorage.clear()
      localStorage.setItem(backendKey, JSON.stringify(seededState))
      if (seededSession) {
        localStorage.setItem(sessionKey, JSON.stringify(seededSession))
        localStorage.setItem(tokenKey, JSON.stringify(seededSession))
      }
    },
    {
      backendKey: E2E_BACKEND_KEY,
      sessionKey: E2E_SESSION_KEY,
      tokenKey: E2E_SUPABASE_TOKEN_KEY,
      seededState: state,
      seededSession: session,
    },
  )
}

export async function backendSnapshot(page: Page): Promise<{
  accounts: Record<
    string,
    { data: Record<string, unknown>; failReadsRemaining: number; lastError?: string }
  >
}> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), E2E_BACKEND_KEY)
}

const localeValue = {
  en: 'Test grammar',
  es: 'Gramática de prueba',
  fr: 'Grammaire de test',
  'pt-BR': 'Gramática de teste',
  th: 'ไวยากรณ์ทดสอบ',
  id: 'Tata bahasa uji',
  vi: 'Ngữ pháp thử nghiệm',
  ja: 'テスト文法',
}

export const TEST_GRAMMARS = [
  { ko: '은/는', meaning: localeValue, deckId: 'topik-1' },
  { ko: '이/가', meaning: localeValue, deckId: 'topik-1' },
  { ko: '을/를', meaning: localeValue, deckId: 'topik-1' },
]

export const TEST_DECKS = [
  { id: 'topik-1', name: 'TOPIK 1', colorId: 'sky', order: 1, collapsed: false },
]

function seoulDay(ms: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ms)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

export function logEntry(
  id: number,
  options: {
    ko?: string
    feedback?: 'easy' | 'hard'
    reviewState?: 'unreviewed' | 'correct' | 'incorrect'
    errorNote?: string | null
    day?: string
  } = {},
) {
  const day = options.day ?? seoulDay(Date.now())
  return {
    id,
    ko: options.ko ?? '은/는',
    sentence: `E2E sentence ${id}`,
    feedback: options.feedback ?? 'easy',
    errorNote: options.errorNote ?? null,
    errorDimension: null,
    reviewState: options.reviewState ?? 'unreviewed',
    contextId: 'daily',
    contextName: 'Daily life',
    date: `${day}T03:00:00.000Z`,
    localDay: day,
    timeZone: 'Asia/Seoul',
    utcOffsetMinutes: 540,
    activityEventId: null,
    revision: 0,
  }
}

export function accountData(entries: ReturnType<typeof logEntry>[]) {
  const today = seoulDay(Date.now())
  return {
    [STORAGE_KEYS.grammar]: TEST_GRAMMARS,
    [STORAGE_KEYS.decks]: TEST_DECKS,
    [STORAGE_KEYS.log]: entries,
    [STORAGE_KEYS.srs]: {
      '은/는': {
        lastSeen: Date.now(),
        easyCount: 5,
        hardCount: 1,
        mastery: 'tree',
        revision: 2,
      },
      '이/가': {
        lastSeen: Date.now(),
        easyCount: 2,
        hardCount: 1,
        mastery: 'plant',
        revision: 1,
      },
    },
    [STORAGE_KEYS.activity]: { [today]: { count: Math.max(1, entries.length) } },
  }
}

export async function signInThroughWelcome(
  page: Page,
  email: string,
  password = 'test-password',
): Promise<void> {
  const enter = page.getByRole('button', { name: /ENTER/ })
  const emailChoice = page.getByRole('button', { name: 'Sign in with email' })
  if ((await enter.getAttribute('aria-expanded')) !== 'true') {
    await expect(enter).toBeVisible()
    // The pixel-art pulse intentionally moves forever and the persistent
    // welcome panel can sit outside the app viewport. A DOM click models the
    // activation without depending on impossible geometric stability.
    await enter.evaluate((button: HTMLButtonElement) => button.click())
    await expect(enter).toHaveAttribute('aria-expanded', 'true')
  }
  await emailChoice.click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/')
}

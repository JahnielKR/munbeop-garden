import { fileURLToPath } from 'node:url'
import baseConfig from './nuxt.config'
import { accountData, logEntry, userIdForEmail } from './tests/e2e/support'
import {
  E2E_BACKEND_KEY,
  E2E_SESSION_KEY,
  E2E_SUPABASE_TOKEN_KEY,
  sessionFor,
} from './tests/e2e/fixtures/backend'

const fakeAuthClient = fileURLToPath(
  new URL('./tests/e2e/fixtures/auth-client.ts', import.meta.url),
)
const fakeStorageFacade = fileURLToPath(
  new URL('./tests/e2e/fixtures/storage-facade.ts', import.meta.url),
)
const manualMode = process.env.MUNBEOP_E2E_MANUAL === '1'

function manualBootstrap(): string {
  const email = 'demo@mungarden.test'
  const session = sessionFor(email)
  const backend = {
    version: 1,
    accounts: {
      [userIdForEmail(email)]: {
        email,
        data: accountData([
          logEntry(9001),
          logEntry(9002, { feedback: 'hard', errorNote: 'Particle choice' }),
          logEntry(9003, { ko: '이/가', reviewState: 'correct' }),
        ]),
        failReadsRemaining: 0,
        activityReceipts: {},
        journalDeletes: {},
      },
    },
  }
  return `(()=>{try{if(!localStorage.getItem(${JSON.stringify(E2E_BACKEND_KEY)})){const backend=${JSON.stringify(backend)};const session=${JSON.stringify(session)};localStorage.setItem(${JSON.stringify(E2E_BACKEND_KEY)},JSON.stringify(backend));localStorage.setItem(${JSON.stringify(E2E_SESSION_KEY)},JSON.stringify(session));localStorage.setItem(${JSON.stringify(E2E_SUPABASE_TOKEN_KEY)},JSON.stringify(session));}}catch{}})();`
}

/**
 * Playwright-only Nuxt config. Keeping the resolver here means production has
 * neither an E2E environment branch nor test backend code in its module graph.
 */
export default defineNuxtConfig({
  ...baseConfig,
  ...(manualMode
    ? {
        app: {
          ...baseConfig.app,
          head: {
            ...baseConfig.app?.head,
            script: [
              ...(baseConfig.app?.head?.script ?? []),
              { innerHTML: manualBootstrap(), tagPosition: 'head' as const },
            ],
          },
        },
      }
    : {}),
  vite: {
    plugins: [
      {
        name: 'munbeop-e2e-fixture-aliases',
        enforce: 'pre',
        resolveId(id) {
          const normalized = id.replaceAll('\\', '/').replace(/\/+/g, '/').split('?')[0]!
          if (id === '~/lib/auth/client' || /\/app\/lib\/auth\/client(?:\.ts)?$/.test(normalized)) {
            return fakeAuthClient
          }
          if (
            id === '~/lib/storage/facade' ||
            /\/app\/lib\/storage\/facade(?:\.ts)?$/.test(normalized)
          ) {
            return fakeStorageFacade
          }
          return null
        },
      },
    ],
  },
})

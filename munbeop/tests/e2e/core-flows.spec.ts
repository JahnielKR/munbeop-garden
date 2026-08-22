import { expect, test } from '@nuxt/test-utils/playwright'
import { STORAGE_KEYS } from '../../app/lib/storage/keys'
import {
  accountData,
  backendSnapshot,
  installScenario,
  logEntry,
  signInThroughWelcome,
  userIdForEmail,
} from './support'

type BrowserIssue = { kind: 'console.error' | 'pageerror'; message: string }
const browserIssues = new WeakMap<import('@playwright/test').Page, BrowserIssue[]>()

test.beforeEach(async ({ context }) => {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      await route.continue()
      return
    }
    // Keep the browser fully offline from third parties without generating
    // noisy ERR_BLOCKED_BY_CLIENT console errors for optional fonts/images.
    await route.fulfill({ status: 204, body: '' })
  })
})

test.beforeEach(async ({ page }) => {
  const issues: BrowserIssue[] = []
  browserIssues.set(page, issues)
  page.on('pageerror', (error) =>
    issues.push({ kind: 'pageerror', message: error.stack ?? error.message }),
  )
  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push({ kind: 'console.error', message: message.text() })
    }
  })
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) return

  const deliberate = testInfo.title.includes('hydrate failure') ? /E2E injected read failure/ : /$a/
  const unexpected = (browserIssues.get(page) ?? []).filter(
    (issue) => !deliberate.test(issue.message),
  )
  expect(unexpected, 'unexpected browser runtime errors').toEqual([])
  await expect(page.locator('nuxt-error-overlay, vite-error-overlay, .fatal')).toHaveCount(0)
  expect((await page.locator('body').innerText()).trim(), 'page must not be blank').not.toBe('')
})

async function expectHero(page: import('@playwright/test').Page, values: string[]) {
  const cards = page.locator('[data-test="hero-card"]')
  await expect(cards).toHaveCount(4)
  for (const [index, value] of values.entries()) {
    await expect(cards.nth(index)).toContainText(value)
  }
}

test('signs in, switches account through sign-out, and isolates each account', async ({
  page,
  goto,
}) => {
  const alice = 'alice@example.test'
  const bob = 'bob@example.test'
  await installScenario(page, {
    users: [
      {
        email: alice,
        data: accountData([
          logEntry(101),
          logEntry(102, { feedback: 'hard', errorNote: 'Particle' }),
          logEntry(103),
        ]),
      },
      { email: bob, data: accountData([logEntry(201, { ko: '이/가' })]) },
    ],
  })

  await goto('/welcome', { waitUntil: 'hydration' })
  await signInThroughWelcome(page, alice)
  await goto('/stats', { waitUntil: 'hydration' })
  await expectHero(page, ['3', '1', '1 / 3', '1'])

  await goto('/settings', { waitUntil: 'hydration' })
  await expect(page.getByText(alice, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/welcome')

  await signInThroughWelcome(page, bob)
  await goto('/stats', { waitUntil: 'hydration' })
  await expectHero(page, ['1', '1', '1 / 3', '0'])

  const backend = await backendSnapshot(page)
  expect(
    (backend.accounts[userIdForEmail(alice)]!.data[STORAGE_KEYS.log] as unknown[]).length,
  ).toBe(3)
  expect((backend.accounts[userIdForEmail(bob)]!.data[STORAGE_KEYS.log] as unknown[]).length).toBe(
    1,
  )
})

test('surfaces a hydrate failure, retries it, and renders authoritative stats', async ({
  page,
  goto,
}) => {
  const email = 'retry@example.test'
  await installScenario(page, {
    sessionEmail: email,
    users: [
      {
        email,
        // Initial visibility refresh and the tracked auth hydration can overlap
        // during SPA startup. Fail both deterministic reads so the authoritative
        // tracked load, not only the background refresh, reaches error state.
        failReadsRemaining: 2,
        data: accountData([
          logEntry(301),
          logEntry(302, { feedback: 'hard', errorNote: 'Ending' }),
          logEntry(303, { reviewState: 'correct' }),
        ]),
      },
    ],
  })

  await goto('/stats', { waitUntil: 'hydration' })
  const error = page.locator('[data-test="data-error"]')
  await expect(error).toBeVisible()
  await expect(page.locator('[data-test="hero-card"]')).toHaveCount(0)

  await page.locator('[data-test="data-retry"]').click()
  await expect(error).toBeHidden()
  await expectHero(page, ['3', '1', '1 / 3', '1'])

  const backend = await backendSnapshot(page)
  expect(backend.accounts[userIdForEmail(email)]!.failReadsRemaining).toBe(0)
})

test('reviews and deletes journal entries transactionally across a reload', async ({
  page,
  goto,
}) => {
  const email = 'journal@example.test'
  await installScenario(page, {
    sessionEmail: email,
    users: [
      {
        email,
        data: accountData([
          logEntry(601, { feedback: 'hard', errorNote: 'Particle choice' }),
          logEntry(602),
        ]),
      },
    ],
  })

  await goto('/log', { waitUntil: 'hydration' })
  const search = page.getByTestId('journal-search')

  await search.fill('E2E sentence 601')
  const reviewedRow = page.locator('ul.list > li').filter({ hasText: 'E2E sentence 601' })
  await reviewedRow.getByTestId('mark-reviewed').click()
  await expect(reviewedRow.getByTestId('reviewed-badge')).toBeVisible()

  await search.fill('E2E sentence 602')
  const deletedRow = page.locator('ul.list > li').filter({ hasText: 'E2E sentence 602' })
  await deletedRow.getByTestId('delete-entry').click()
  const deleteDialog = page.getByRole('dialog', { name: 'Delete this entry?' })
  await expect(deleteDialog).toBeVisible()
  await deleteDialog.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(deletedRow).toHaveCount(0)

  await goto('/log', { waitUntil: 'hydration' })
  await page.getByTestId('journal-search').fill('E2E sentence 601')
  const persistedRow = page.locator('ul.list > li').filter({ hasText: 'E2E sentence 601' })
  await expect(persistedRow.getByTestId('reviewed-badge')).toBeVisible()
  await page.getByTestId('journal-search').fill('E2E sentence 602')
  await expect(page.getByText('E2E sentence 602', { exact: true })).toHaveCount(0)

  await goto('/stats', { waitUntil: 'hydration' })
  await expectHero(page, ['1', '1', '0 / 3', '0'])

  const backend = await backendSnapshot(page)
  const entries = backend.accounts[userIdForEmail(email)]!.data[STORAGE_KEYS.log] as Array<{
    id: number
    reviewState: string
    revision: number
  }>
  expect(entries).toHaveLength(1)
  expect(entries[0]).toMatchObject({ id: 601, reviewState: 'correct', revision: 1 })
})

test('exports a complete backup and rejects invalid import before restoring a valid one', async ({
  page,
  goto,
}) => {
  const email = 'backup@example.test'
  await installScenario(page, {
    sessionEmail: email,
    users: [
      {
        email,
        data: accountData([
          logEntry(401),
          logEntry(402, { feedback: 'hard', errorNote: 'Register' }),
          logEntry(403),
        ]),
      },
    ],
  })

  await goto('/settings', { waitUntil: 'hydration' })
  await page.getByRole('tab', { name: 'Data' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export my data (.json)' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^mungarden-export-\d{4}-\d{2}-\d{2}\.json$/)
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const exported = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
    app: string
    data: Record<string, unknown>
  }
  expect(exported.app).toBe('munbeop-garden')
  expect(exported.data[STORAGE_KEYS.log]).toHaveLength(3)

  const file = page.locator('[data-testid="import-file"]')
  await file.setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{ definitely not json'),
  })
  await expect(page.getByRole('alert')).toContainText("doesn't look like a Mungarden backup")
  let backend = await backendSnapshot(page)
  expect(
    (backend.accounts[userIdForEmail(email)]!.data[STORAGE_KEYS.log] as unknown[]).length,
  ).toBe(3)

  const replacement = [
    logEntry(501, { reviewState: 'correct' }),
    logEntry(502, { ko: '이/가', feedback: 'hard', errorNote: 'Subject' }),
  ]
  const validImport = {
    exportedAt: new Date().toISOString(),
    app: 'munbeop-garden',
    data: accountData(replacement),
  }
  await file.setInputFiles({
    name: 'valid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(validImport)),
  })
  const confirmDialog = page.getByRole('dialog')
  await expect(confirmDialog).toHaveAccessibleName('Restore this backup?')
  const reloaded = page.waitForEvent('load')
  await page.locator('[data-testid="import-confirm"]').click()
  await reloaded
  backend = await backendSnapshot(page)
  expect(backend.accounts[userIdForEmail(email)]!.lastError).toBeUndefined()
  expect(
    (backend.accounts[userIdForEmail(email)]!.data[STORAGE_KEYS.log] as unknown[]).length,
  ).toBe(2)

  await goto('/stats', { waitUntil: 'hydration' })
  await expectHero(page, ['2', '1', '0 / 3', '1'])
  backend = await backendSnapshot(page)
  expect(
    (backend.accounts[userIdForEmail(email)]!.data[STORAGE_KEYS.log] as unknown[]).length,
  ).toBe(2)
})

import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const fakeAuthClient = fileURLToPath(
  new URL('./tests/e2e/fixtures/auth-client.ts', import.meta.url),
)
const fakeStorageFacade = fileURLToPath(
  new URL('./tests/e2e/fixtures/storage-facade.ts', import.meta.url),
)

export default defineConfig<ConfigOptions>({
  testDir: './tests/e2e',
  outputDir: '.nuxt/e2e-results',
  timeout: 120_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never', outputFolder: '.nuxt/e2e-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: '.nuxt/e2e-report' }]],
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    locale: 'en',
    timezoneId: 'Asia/Seoul',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    nuxt: {
      rootDir,
      configFile: 'nuxt.e2e.config.ts',
      setupTimeout: 300_000,
      nuxtConfig: {
        alias: {
          '~/lib/auth/client': fakeAuthClient,
          '~/lib/storage/facade': fakeStorageFacade,
        },
      },
    },
  },
  projects: [{ name: 'system-chrome' }],
})

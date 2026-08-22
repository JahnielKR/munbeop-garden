import { fileURLToPath } from 'node:url'
import { createTest, url } from '@nuxt/test-utils/e2e'

process.env.MUNBEOP_E2E_MANUAL = '1'

const rootDir = fileURLToPath(new URL('../', import.meta.url))
const port = Number.parseInt(process.env.MUNBEOP_E2E_PORT ?? '3100', 10)
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('MUNBEOP_E2E_PORT must be a valid TCP port')
}

const hooks = createTest({
  rootDir,
  configFile: 'nuxt.e2e.config.ts',
  dev: false,
  browser: false,
  server: true,
  port,
  setupTimeout: 300_000,
})

let stopping = false
async function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  await hooks.afterAll()
  process.exitCode = exitCode
}

process.once('SIGINT', () => void stop())
process.once('SIGTERM', () => void stop())

try {
  await hooks.beforeAll()
  const routes = [
    ['Home', '/'],
    ['Journal', '/log'],
    ['Settings', '/settings'],
    ['Library', '/library'],
    ['Stats', '/stats'],
  ]
  console.log('\nFake E2E account ready (demo@mungarden.test):')
  for (const [label, path] of routes) console.log(`  ${label.padEnd(8)} ${url(path)}`)
  console.log('\nPress Ctrl+C to stop. Clear site storage to reseed the demo account.\n')
  await new Promise(() => {})
} catch (error) {
  console.error(error)
  await stop(1)
}

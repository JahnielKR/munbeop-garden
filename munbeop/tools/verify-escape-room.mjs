import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import ts from 'typescript'

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja']
const AUTHORED_LEVEL_IDS = Array.from(
  { length: 10 },
  (_, index) => `level-${String(index + 1).padStart(2, '0')}`,
)

function staticString(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isParenthesizedExpression(node)) return staticString(node.expression)
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return staticString(node.left) + staticString(node.right)
  }
  throw new Error(`Expected a static string, received ${ts.SyntaxKind[node.kind]}`)
}

function parseTypescript(filePath, contents) {
  const sourceFile = ts.createSourceFile(
    filePath,
    contents,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  if (sourceFile.parseDiagnostics.length > 0) {
    const details = sourceFile.parseDiagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('; ')
    throw new Error(`Could not parse ${filePath}: ${details}`)
  }
  return sourceFile
}

function stringMapFromSource(sourceFile) {
  const entries = new Map()
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      (ts.isStringLiteral(node.name) || ts.isNoSubstitutionTemplateLiteral(node.name)) &&
      (ts.isStringLiteral(node.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(node.initializer))
    ) {
      entries.set(node.name.text, node.initializer.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return entries
}

function introSourceFromLevel(sourceFile, levelId) {
  let intro = null
  const visit = (node) => {
    if (
      intro == null &&
      ts.isPropertyAssignment(node) &&
      ((ts.isIdentifier(node.name) && node.name.text === 'intro') ||
        (ts.isStringLiteral(node.name) && node.name.text === 'intro')) &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === 't'
    ) {
      intro = staticString(node.initializer.arguments[0])
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (!intro) throw new Error(`Could not extract the authored intro for ${levelId}`)
  return intro
}

async function loadExpectedIntroParagraphs() {
  const translationMaps = new Map()
  for (const locale of SUPPORTED_LOCALES.filter((candidate) => candidate !== 'es')) {
    const merged = new Map()
    for (const relativePath of [
      `app/seed/escape-room/translations/${locale}.ts`,
      `app/seed/escape-room/translations/levels-04-10/${locale}.ts`,
    ]) {
      const contents = await readFile(path.resolve(relativePath), 'utf8')
      const parsed = parseTypescript(relativePath, contents)
      for (const [source, translated] of stringMapFromSource(parsed)) {
        merged.set(source, translated)
      }
    }
    translationMaps.set(locale, merged)
  }

  const expected = {}
  for (const levelId of AUTHORED_LEVEL_IDS) {
    const relativePath = `app/seed/escape-room/${levelId}.ts`
    const contents = await readFile(path.resolve(relativePath), 'utf8')
    const source = introSourceFromLevel(parseTypescript(relativePath, contents), levelId)
    expected[levelId] = {}
    for (const locale of SUPPORTED_LOCALES) {
      const localized = locale === 'es' ? source : translationMaps.get(locale)?.get(source)
      if (!localized) {
        throw new Error(`Missing authored ${locale} intro while preparing browser QA for ${levelId}`)
      }
      expected[levelId][locale] = localized.split('\n\n')[0].trim()
    }
  }
  return expected
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    process.env['PROGRAMFILES(X86)'] &&
      path.join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
    process.env.LOCALAPPDATA &&
      path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  const detected = candidates.find((candidate) => existsSync(candidate))
  if (!detected) {
    throw new Error('Chrome/Chromium was not found. Set CHROME_PATH to its executable.')
  }
  return detected
}

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('Could not allocate a local port'))
        return
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)))
    })
  })
}

const explicitOrigin = process.argv[2]?.trim() || null
const verificationScope = process.env.ESCAPE_VERIFY_SCOPE?.trim() || 'full'
if (!['full', 'locales'].includes(verificationScope)) {
  throw new Error(
    `Unsupported ESCAPE_VERIFY_SCOPE=${JSON.stringify(verificationScope)}. Use "full" or "locales".`,
  )
}
const baselineLocale = 'en'
const devPort = explicitOrigin ? null : await availablePort()
const origin = (explicitOrigin ?? `http://127.0.0.1:${devPort}`).replace(/\/+$/u, '')
const outputDir = path.resolve('.nuxt/escape-room-visual-check')
await mkdir(outputDir, { recursive: true })
const expectedIntroParagraphs = await loadExpectedIntroParagraphs()
const profileDir = await mkdtemp(path.join(tmpdir(), 'munbeop-chrome-'))

// Supplying an origin means “verify that existing deployment”; only an omitted
// origin authorizes this script to launch its own isolated local Nuxt server.
const devServer = explicitOrigin == null
  ? spawn(
      process.execPath,
      [
        'node_modules/nuxt/bin/nuxt.mjs',
        'dev',
        '--host',
        '127.0.0.1',
        '--port',
        String(devPort),
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          NUXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
          NUXT_PUBLIC_SUPABASE_ANON_KEY: 'visual-check-key',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    )
  : null
let serverOutput = ''
let serverStartError = null
devServer?.stdout.on('data', (chunk) => (serverOutput += chunk.toString()))
devServer?.stderr.on('data', (chunk) => (serverOutput += chunk.toString()))
devServer?.once('error', (error) => (serverStartError = error))

const serverStartedAt = Date.now()
while (Date.now() - serverStartedAt < 25_000) {
  if (serverStartError || devServer?.exitCode != null || devServer?.signalCode != null) break
  try {
    const response = await fetch(origin, { signal: AbortSignal.timeout(2_000) })
    if (response.ok) break
  } catch {
    // The server is still warming up; retry until the deadline below.
  }
  await new Promise((resolve) => setTimeout(resolve, 200))
}
try {
  const response = await fetch(origin, { signal: AbortSignal.timeout(5_000) })
  if (!response.ok) throw new Error(`Dev server returned ${response.status}`)
} catch (error) {
  devServer?.kill()
  await rm(profileDir, { recursive: true, force: true }).catch(() => {})
  throw new Error(`Could not reach the visual-check server.\n${serverOutput}`, {
    cause: serverStartError ?? error,
  })
}

let chromePath
try {
  chromePath = findChrome()
} catch (error) {
  devServer?.kill()
  await rm(profileDir, { recursive: true, force: true }).catch(() => {})
  throw error
}
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-pipe',
    `--user-data-dir=${profileDir}`,
  ],
  { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'], windowsHide: true },
)

let nextId = 1
let readBuffer = Buffer.alloc(0)
const pending = new Map()
const browserEvents = []

function rejectPending(error) {
  for (const { reject, timer } of pending.values()) {
    clearTimeout(timer)
    reject(error)
  }
  pending.clear()
}

chrome.once('error', (error) => rejectPending(error))
chrome.once('exit', (code, signal) => {
  rejectPending(new Error(`Chrome exited before verification completed (${code ?? signal})`))
})

chrome.stdio[4].on('data', (chunk) => {
  readBuffer = Buffer.concat([readBuffer, chunk])
  let boundary = readBuffer.indexOf(0)
  while (boundary >= 0) {
    const raw = readBuffer.subarray(0, boundary).toString('utf8')
    readBuffer = readBuffer.subarray(boundary + 1)
    if (raw) {
      const message = JSON.parse(raw)
      if (message.id && pending.has(message.id)) {
        const { resolve, reject, timer } = pending.get(message.id)
        pending.delete(message.id)
        clearTimeout(timer)
        if (message.error) reject(new Error(message.error.message))
        else resolve(message.result)
      } else {
        browserEvents.push(message)
      }
    }
    boundary = readBuffer.indexOf(0)
  }
})

function command(method, params = {}, sessionId, timeout = 30_000) {
  const id = nextId++
  const payload = { id, method, params, ...(sessionId ? { sessionId } : {}) }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`Chrome command timed out after ${timeout}ms: ${method}`))
    }, timeout)
    pending.set(id, { resolve, reject, timer })
    chrome.stdio[3].write(`${JSON.stringify(payload)}\0`, (error) => {
      if (!error || !pending.has(id)) return
      clearTimeout(timer)
      pending.delete(id)
      reject(error)
    })
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function evaluate(expression) {
  const result = await command(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  )
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

async function waitFor(expression, timeout = 30_000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await delay(120)
  }
  const context = await evaluate(
    `({ url: location.href, text: document.body.innerText.slice(0, 500) })`,
  )
  throw new Error(`Timed out waiting for: ${expression}\n${JSON.stringify(context)}`)
}

/**
 * The product requires an authenticated account before the default layout
 * renders its page slot. This isolated visual harness deliberately points at
 * a non-existent Supabase instance, so it cannot restore a real session or
 * hydrate cloud data. The synthetic localStorage token above gets the route
 * through middleware; once Nuxt has finished its real auth bootstrap, set the
 * two Pinia gate stores to a stable test account. This stays entirely inside
 * the disposable Chrome profile and does not add a production auth bypass.
 */
async function openVisualCheckAccountGate() {
  const dataStoreIds = [
    'grammar',
    'contexts',
    'srs',
    'log',
    'activity',
    'settings',
    'locale',
    'customDecks',
  ]
  const storesReady = `(() => {
    const app = document.querySelector('#__nuxt')?.__vue_app__
    const providers = app?._context?.provides
    const pinia = providers
      ? Reflect.ownKeys(providers)
          .map((key) => providers[key])
          .find((candidate) => candidate?._s instanceof Map)
      : null
    const auth = pinia?._s?.get('auth')
    return !!auth?.ready && !auth.user && !!pinia?._s?.get('appStatus') &&
      ${JSON.stringify(dataStoreIds)}.every((id) => !!pinia._s.get(id))
  })()`
  await waitFor(storesReady)

  // Cold Linux CI can still be importing the large grammar seed after auth is
  // ready. Introducing the synthetic user in that window makes the remainder
  // of default.vue's hydration switch from the noop adapter to Supabase. Drain
  // every public store queue while the account is still anonymous; because
  // customDecks is instantiated last by the layout, these calls form a stable
  // barrier behind the layout's own hydration rather than relying on a delay.
  const hydratedAnonymously = await evaluate(`(async () => {
    const app = document.querySelector('#__nuxt')?.__vue_app__
    const providers = app?._context?.provides
    const pinia = providers
      ? Reflect.ownKeys(providers)
          .map((key) => providers[key])
          .find((candidate) => candidate?._s instanceof Map)
      : null
    const auth = pinia?._s?.get('auth')
    if (!auth?.ready || auth.user) return false
    const stores = ${JSON.stringify(dataStoreIds)}.map((id) => pinia?._s?.get(id))
    if (stores.some((store) => typeof store?.hydrate !== 'function')) return false
    await stores[0].hydrate()
    await Promise.all(stores.slice(1).map((store) => store.hydrate()))
    await new Promise((resolve) => setTimeout(resolve, 0))
    return auth.ready && !auth.user
  })()`)
  if (!hydratedAnonymously) {
    throw new Error('Could not drain the isolated visual-check hydration queues')
  }

  const opened = await evaluate(`(() => {
    const app = document.querySelector('#__nuxt')?.__vue_app__
    const providers = app?._context?.provides
    const pinia = providers
      ? Reflect.ownKeys(providers)
          .map((key) => providers[key])
          .find((candidate) => candidate?._s instanceof Map)
      : null
    const auth = pinia?._s?.get('auth')
    const appStatus = pinia?._s?.get('appStatus')
    if (!auth || !appStatus) return false
    auth.setSession({
      access_token: 'visual-check',
      refresh_token: 'visual-check',
      expires_at: 9999999999,
      token_type: 'bearer',
      user: {
        id: 'visual-check-user',
        email: 'visual-check@example.test',
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2026-01-01T00:00:00.000Z'
      }
    })
    appStatus.status = 'ready'
    return auth.ready && auth.user?.id === 'visual-check-user' && appStatus.status === 'ready'
  })()`)
  if (!opened) throw new Error('Could not open the isolated visual-check account gate')
}

async function navigate(route) {
  await command('Page.navigate', { url: `${origin}${route}` }, sessionId)
  await waitFor("document.readyState === 'complete'")
  await delay(350)
  await openVisualCheckAccountGate()
  await delay(100)
}

/**
 * Boot a fresh document with the requested saved locale already present.
 * LocalStorageAdapter stores JSON values, so the raw localStorage value must be
 * e.g. `"es"`, not `es`. Installing the write as a new-document script also
 * removes any dependency on the browser's default language or on timing a
 * post-mount store mutation. The query marker guarantees a full navigation
 * even when consecutive checks use the same authored level.
 */
async function navigateWithLocale(route, locale) {
  const { identifier } = await command(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `
        try {
          localStorage.setItem('munbeop.v1.locale', JSON.stringify(${JSON.stringify(locale)}))
        } catch {}
      `,
    },
    sessionId,
  )
  const separator = route.includes('?') ? '&' : '?'
  try {
    await navigate(
      `${route}${separator}__escape_verify_locale=${encodeURIComponent(locale)}`,
    )
    await waitFor(
      `localStorage.getItem('munbeop.v1.locale') === ${JSON.stringify(JSON.stringify(locale))}`,
    )
    await waitFor(`document.documentElement.lang === ${JSON.stringify(locale)}`)
  } finally {
    await command(
      'Page.removeScriptToEvaluateOnNewDocument',
      { identifier },
      sessionId,
    )
  }
}

async function screenshot(name) {
  const shot = await command('Page.captureScreenshot', { format: 'png' }, sessionId)
  await writeFile(path.join(outputDir, name), Buffer.from(shot.data, 'base64'))
}

async function revealFirstCinematicParagraph(expectedParagraph) {
  await waitFor("document.querySelector('[data-testid=cinematic-text]')?.textContent.length > 0")
  const paragraphComplete =
    `document.querySelector('[data-testid=cinematic-text]')?.textContent.trim()` +
    ` === ${JSON.stringify(expectedParagraph)}`
  if (!(await evaluate(paragraphComplete))) {
    await evaluate("document.querySelector('[data-testid=cinematic-continue]').click()")
  }
  await waitFor(paragraphComplete)
}

/**
 * Resolve the next authored slot through the live Pinia store. This verifier
 * is not evaluating linguistic answers; unit tests do that exhaustively. It
 * advances the real state machine so locked room navigation, completion and
 * reward rendering can be inspected without weakening progression in product.
 */
async function resolveNextSlot() {
  return evaluate(`(() => {
    let instance = document.querySelector('[data-testid=escape-room]')?.__vueParentComponent
    while (instance && !instance.setupState?.store?.answerSelection) instance = instance.parent
    let store = instance?.setupState?.store
    if (!store) {
      const app = document.querySelector('#__nuxt')?.__vue_app__
      const providers = app?._context?.provides
      const pinia = providers
        ? Reflect.ownKeys(providers)
            .map((key) => providers[key])
            .find((candidate) => candidate?._s instanceof Map)
        : null
      store = pinia?._s?.get('escape-room')
    }
    if (!store) return { error: 'escape-room store was not exposed by Vue or Pinia' }
    const slotId = store.nextSlotId
    if (!slotId) return { done: true, status: store.status }
    const level = store.currentLevel
    const slotIndex = level.slots.findIndex((slot) => slot.id === slotId)
    const slot = level.slots[slotIndex]
    const drawn = store.currentRun.slots[slotIndex]
    const candidate = slot.candidates[drawn.candidateIndex]
    let result
    if (slot.type === 'selection') result = store.answerSelection(slotId, candidate.correctIndex)
    else if (slot.type === 'completion') result = store.answerCompletion(slotId, candidate.answer)
    else result = store.answerCreation(slotId, Array.from(candidate.correctOrder))
    return { slotId, type: slot.type, result, nextSlotId: store.nextSlotId, status: store.status }
  })()`)
}

let sessionId
const report = {
  origin,
  scope: verificationScope,
  baselineLocale,
  routes: [],
  consoleErrors: [],
  screenshots: [],
}

try {
  const { targetId } = await command('Target.createTarget', { url: 'about:blank' })
  ;({ sessionId } = await command('Target.attachToTarget', { targetId, flatten: true }))
  await command('Page.enable', {}, sessionId)
  await command('Runtime.enable', {}, sessionId)
  await command('Log.enable', {}, sessionId)
  await command(
    'Page.addScriptToEvaluateOnNewDocument',
    {
      source: `
        try {
          localStorage.setItem(
            'sb-visual-check-auth-token',
            JSON.stringify({ access_token: 'visual-check', expires_at: 9999999999 })
          )
        } catch {}
      `,
    },
    sessionId,
  )
  await command(
    'Emulation.setDeviceMetricsOverride',
    { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false },
    sessionId,
  )

  if (verificationScope === 'full') {
    await navigateWithLocale('/escape-room', baselineLocale)
    await waitFor("document.querySelector('[data-testid=page-cover]')?.naturalWidth > 0")
    const covers = []
    for (let pageIndex = 0; pageIndex < 10; pageIndex += 1) {
      covers.push(
        await evaluate(`({
          src: document.querySelector('[data-testid=page-cover]').getAttribute('src'),
          loaded: document.querySelector('[data-testid=page-cover]').naturalWidth > 0,
          indicator: document.querySelector('[data-testid=book-indicator]').textContent.trim()
        })`),
      )
      if (pageIndex < 9) {
        const previousSrc = covers.at(-1).src
        await evaluate("document.querySelector('[data-testid=book-next]').click()")
        await waitFor(
          `document.querySelector('[data-testid=page-cover]')?.getAttribute('src') !== ${JSON.stringify(previousSrc)} && document.querySelector('[data-testid=page-cover]')?.naturalWidth > 0`,
        )
      }
    }
    report.routes.push({ route: '/escape-room', url: await evaluate('location.href'), covers })
    await screenshot('01-level-book-page-10.png')
    report.screenshots.push('01-level-book-page-10.png')

    for (const [levelIndex, level] of AUTHORED_LEVEL_IDS.entries()) {
      await navigate(`/escape-room/play?level=${level}`)
      await waitFor("document.querySelector('[data-testid=cinematic-root]')")
      await waitFor("document.querySelector('.cinematic__art')?.naturalWidth > 0")
      await revealFirstCinematicParagraph(expectedIntroParagraphs[level][baselineLocale])
      const intro = await evaluate(`({
        src: document.querySelector('.cinematic__art')?.getAttribute('src'),
        loaded: !!document.querySelector('.cinematic__art')?.naturalWidth,
        url: location.href
      })`)
      const introShot = `${String(levelIndex + 2).padStart(2, '0')}-${level}-intro.png`
      await screenshot(introShot)
      report.screenshots.push(introShot)
      await evaluate("document.querySelector('[data-testid=cinematic-skip]').click()")
      await waitFor("document.querySelectorAll('[data-testid=room-tab]').length === 4")

      const rooms = []
      for (let roomIndex = 0; roomIndex < 4; roomIndex += 1) {
        let unlockSteps = 0
        while (
          await evaluate(
            `document.querySelectorAll('[data-testid=room-tab]')[${roomIndex}]?.disabled === true`,
          )
        ) {
          const advance = await resolveNextSlot()
          if (advance.error || advance.done || advance.result === 'locked') {
            throw new Error(`Could not unlock room ${roomIndex + 1} in ${level}: ${JSON.stringify(advance)}`)
          }
          unlockSteps += 1
          if (unlockSteps > 10) throw new Error(`Progression loop while unlocking ${level} room ${roomIndex + 1}`)
          await delay(50)
        }
        await evaluate(`document.querySelectorAll('[data-testid=room-tab]')[${roomIndex}].click()`)
        await waitFor(
          `document.querySelectorAll('[data-testid=room-tab]')[${roomIndex}]?.getAttribute('aria-current') === 'location' && document.querySelector('[data-testid=room-bg]')?.naturalWidth > 0`,
        )
        rooms.push(
          await evaluate(`({
            title: document.querySelectorAll('[data-testid=room-tab]')[${roomIndex}].textContent.trim(),
            src: document.querySelector('[data-testid=room-bg]').getAttribute('src'),
            naturalWidth: document.querySelector('[data-testid=room-bg]').naturalWidth,
            naturalHeight: document.querySelector('[data-testid=room-bg]').naturalHeight
          })`),
        )
      }
      const roomShot = `${String(levelIndex + 12).padStart(2, '0')}-${level}-room-4.png`
      await screenshot(roomShot)
      report.screenshots.push(roomShot)

      let completionSteps = 0
      while (await evaluate("!!document.querySelector('[data-testid=escape-room]') && !document.querySelector('[data-testid=victory-root]')")) {
        const advance = await resolveNextSlot()
        if (advance.error || advance.result === 'locked') {
          throw new Error(`Could not complete ${level}: ${JSON.stringify(advance)}`)
        }
        completionSteps += 1
        if (completionSteps > 10) throw new Error(`Completion loop in ${level}`)
        await delay(50)
      }
      await waitFor("document.querySelector('[data-testid=victory-reward-image]')?.naturalWidth > 0")
      const victory = await evaluate(`({
        tier: document.querySelector('[data-testid=victory-tier]')?.textContent.trim(),
        reward: document.querySelector('[data-testid=victory-reward]')?.textContent.trim(),
        rewardImage: document.querySelector('[data-testid=victory-reward-image]')?.getAttribute('src'),
        rewardLoaded: document.querySelector('[data-testid=victory-reward-image]')?.naturalWidth > 0
      })`)
      if (level === 'level-10') {
        await screenshot('22-level-10-victory.png')
        report.screenshots.push('22-level-10-victory.png')
      }
      report.routes.push({ route: `/escape-room/play?level=${level}`, intro, rooms, victory })
    }
  }

  // A data-level dictionary audit cannot prove the browser actually hydrates
  // the saved preference and renders each locale. Exercise the real locale
  // store + Nuxt i18n bridge on one authored level and capture the complete
  // first paragraph in all eight supported UI languages.
  const expectedSkipLabels = Object.fromEntries(
    await Promise.all(
      SUPPORTED_LOCALES.map(async (locale) => {
        const messages = JSON.parse(
          await readFile(path.resolve(`i18n/locales/${locale}.json`), 'utf8'),
        )
        return [locale, `${messages.escape.skip} ▸▸`]
      }),
    ),
  )
  report.locales = []
  for (const locale of SUPPORTED_LOCALES) {
    await navigateWithLocale('/escape-room/play?level=level-04', locale)
    const expectedNarrative = expectedIntroParagraphs['level-04'][locale]
    await revealFirstCinematicParagraph(expectedNarrative)
    report.locales.push(
      await evaluate(`({
        locale: ${JSON.stringify(locale)},
        storedLocale: JSON.parse(localStorage.getItem('munbeop.v1.locale')),
        htmlLang: document.documentElement.lang,
        narrative: document.querySelector('[data-testid=cinematic-text]').textContent.trim(),
        expectedNarrative: ${JSON.stringify(expectedNarrative)},
        skipLabel: document.querySelector('[data-testid=cinematic-skip]').textContent.trim()
      })`),
    )
  }
  const renderedNarratives = new Set(report.locales.map((entry) => entry.narrative))
  if (renderedNarratives.size !== SUPPORTED_LOCALES.length) {
    throw new Error(`Locale rendering reused a narrative: ${JSON.stringify(report.locales)}`)
  }
  for (const entry of report.locales) {
    if (entry.storedLocale !== entry.locale || entry.htmlLang !== entry.locale) {
      throw new Error(`Locale state diverged for ${entry.locale}: ${JSON.stringify(entry)}`)
    }
    if (entry.narrative !== entry.expectedNarrative) {
      throw new Error(`Wrong narrative rendered for ${entry.locale}: ${JSON.stringify(entry)}`)
    }
    if (entry.skipLabel !== expectedSkipLabels[entry.locale]) {
      throw new Error(
        `Wrong skip label rendered for ${entry.locale}: ${JSON.stringify(entry.skipLabel)}`,
      )
    }
  }

  if (verificationScope === 'full') {
    await command(
      'Emulation.setDeviceMetricsOverride',
      { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
      sessionId,
    )
    for (const level of ['level-04', 'level-08', 'level-10']) {
      await navigateWithLocale(`/escape-room/play?level=${level}`, baselineLocale)
      await waitFor("document.querySelector('[data-testid=cinematic-root]')")
      await waitFor("document.querySelector('.cinematic__art')?.naturalWidth > 0")
      await revealFirstCinematicParagraph(expectedIntroParagraphs[level][baselineLocale])
      const introShot = `mobile-${level}-intro.png`
      await screenshot(introShot)
      report.screenshots.push(introShot)
      await evaluate("document.querySelector('[data-testid=cinematic-skip]').click()")
      await waitFor("document.querySelector('[data-testid=room-bg]')?.naturalWidth > 0")
      const roomShot = `mobile-${level}-room.png`
      await screenshot(roomShot)
      report.screenshots.push(roomShot)
    }
  }

  report.consoleErrors = browserEvents
    .filter(
      (event) =>
        event.method === 'Runtime.exceptionThrown' ||
        (event.method === 'Runtime.consoleAPICalled' && event.params?.type === 'error') ||
        (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error'),
    )
    .map((event) => event.params)
  report.errorOverlay = await evaluate(
    `!!document.querySelector('vite-error-overlay, nuxt-error-page, #nuxt-error, [data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay')`,
  )
  report.hasContent = await evaluate('document.body.innerText.trim().length > 0')
  report.validationIssues = [
    ...(report.consoleErrors.length > 0
      ? [`${report.consoleErrors.length} browser console error(s)`]
      : []),
    ...(report.errorOverlay ? ['framework error overlay is visible'] : []),
    ...(!report.hasContent ? ['document body is empty'] : []),
  ]

  await writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2))
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  if (report.validationIssues.length > 0) {
    throw new Error(`Browser verification failed: ${report.validationIssues.join('; ')}`)
  }
} catch (error) {
  const diagnostics = browserEvents.filter(
    (event) =>
      event.method === 'Runtime.exceptionThrown' ||
      (event.method === 'Runtime.consoleAPICalled' && event.params?.type === 'error') ||
      (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error'),
  )
  console.error(JSON.stringify(diagnostics, null, 2))
  throw error
} finally {
  chrome.kill()
  devServer?.kill()
  await delay(150)
  // Nuxt occasionally leaves this generated lock behind after a Windows
  // child process is terminated, which makes the next isolated verification
  // fail before it starts. Only remove it when this script launched the dev
  // server itself; an explicit-origin run must never touch another server.
  if (devServer) {
    await rm(path.resolve('.nuxt/nuxt.lock'), { force: true }).catch(() => {})
  }
  await rm(profileDir, { recursive: true, force: true }).catch(() => {})
}

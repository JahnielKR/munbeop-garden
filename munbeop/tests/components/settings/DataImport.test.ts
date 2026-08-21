import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DataImport from '~/components/settings/DataImport.vue'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const restore = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ restore }),
}))
// reload is imported at module-load by the component, so the mock factory runs
// before an outer const would initialize — hoist the spy with vi.hoisted.
const { reloadPage } = vi.hoisted(() => ({ reloadPage: vi.fn() }))
vi.mock('~/lib/data-transfer/reload', () => ({ reloadPage }))

const validLogEntry = {
  id: 1,
  ko: '-고 싶다',
  sentence: '한국에 가고 싶어요.',
  feedback: 'easy',
  errorNote: null,
  reviewState: 'unreviewed',
  contextId: 'polite',
  contextName: '존댓말',
  date: '2026-01-01T00:00:00.000Z',
}
const VALID = JSON.stringify({
  exportedAt: '2026-01-01T00:00:00.000Z',
  app: APP_ID,
  data: { [STORAGE_KEYS.log]: [validLogEntry] },
})

function mountIt() {
  setActivePinia(createPinia())
  return mount(DataImport, {
    global: {
      stubs: {
        Modal: {
          template: '<div v-if="open"><slot /></div>',
          props: ['open', 'title', 'closeLabel'],
        },
        Button: {
          template: '<button @click="$emit(\'click\')"><slot /></button>',
          emits: ['click'],
        },
      },
    },
  })
}

async function selectFile(w: ReturnType<typeof mountIt>, contents: string) {
  const file = new File([contents], 'backup.json', { type: 'application/json' })
  const input = w.get('[data-testid="import-file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

beforeEach(() => {
  restore.mockClear()
  restore.mockResolvedValue(undefined)
  reloadPage.mockClear()
})

describe('DataImport', () => {
  it('an invalid file shows no confirm modal and writes nothing', async () => {
    const w = mountIt()
    await selectFile(w, 'not json{')
    expect(w.find('[data-testid="import-confirm"]').exists()).toBe(false)
    expect(restore).not.toHaveBeenCalled()
  })
  it('a valid file opens the confirm modal; confirming writes + reloads', async () => {
    const w = mountIt()
    await selectFile(w, VALID)
    const confirm = w.get('[data-testid="import-confirm"]')
    await confirm.trigger('click')
    await flushPromises()
    expect(restore).toHaveBeenCalledWith({ [STORAGE_KEYS.log]: [validLogEntry] })
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })
})

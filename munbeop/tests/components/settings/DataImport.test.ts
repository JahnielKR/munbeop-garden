import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DataImport from '~/components/settings/DataImport.vue'
import { STORAGE_KEYS } from '~/lib/storage'
import { APP_ID } from '~/lib/data-transfer/keys'

const write = vi.fn(async () => {})
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn(), write, remove: vi.fn(), clear: vi.fn() }),
}))
// reload is imported at module-load by the component, so the mock factory runs
// before an outer const would initialize — hoist the spy with vi.hoisted.
const { reloadPage } = vi.hoisted(() => ({ reloadPage: vi.fn() }))
vi.mock('~/lib/data-transfer/reload', () => ({ reloadPage }))

const VALID = JSON.stringify({ exportedAt: 'x', app: APP_ID, data: { [STORAGE_KEYS.log]: [1] } })

function mountIt() {
  setActivePinia(createPinia())
  return mount(DataImport, {
    global: {
      stubs: {
        Modal: { template: '<div v-if="open"><slot /></div>', props: ['open', 'title', 'closeLabel'] },
        Button: { template: '<button @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
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
  write.mockClear()
  write.mockResolvedValue(undefined)
  reloadPage.mockClear()
})

describe('DataImport', () => {
  it('an invalid file shows no confirm modal and writes nothing', async () => {
    const w = mountIt()
    await selectFile(w, 'not json{')
    expect(w.find('[data-testid="import-confirm"]').exists()).toBe(false)
    expect(write).not.toHaveBeenCalled()
  })
  it('a valid file opens the confirm modal; confirming writes + reloads', async () => {
    const w = mountIt()
    await selectFile(w, VALID)
    const confirm = w.get('[data-testid="import-confirm"]')
    await confirm.trigger('click')
    await flushPromises()
    expect(write).toHaveBeenCalledWith(STORAGE_KEYS.log, [1])
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })
})

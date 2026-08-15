import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import ConjugationPage from '~/pages/practice/conjugation.vue'

const query = reactive<Record<string, unknown>>({})
const replace = vi.fn(async () => {})
const selectClass = vi.fn()
const start = vi.fn()
const gloss = { en: 'eat', es: 'comer', fr: 'manger', 'pt-BR': 'comer', th: 'กิน', id: 'makan', vi: 'ăn', ja: '食べる' }

const drill = {
  selectedClassId: ref('mixed'), sessionItems: ref([]), displayOptions: ref([]),
  mode: ref('normal'), index: ref(0), phase: ref('question'), picked: ref(null),
  item: ref({
    id: '먹다:-아/어요', dict: '먹다', gloss, klass: 'regular', ending: '-아/어요',
    correct: '먹어요', options: ['먹어요', '먹아요', '먹으요', '먹서요'],
  }),
  score: ref({ correct: 0, total: 0, accuracy: 0 }), failedItems: ref([]),
  saveStatus: ref('idle'), selectClass, start, replayFailed: vi.fn(), answer: vi.fn(),
  next: vi.fn(), retrySave: vi.fn(),
}

vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('useRoute', () => ({ query }))
vi.stubGlobal('useRouter', () => ({ replace }))
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.mock('~/composables/useConjugationDrill', () => ({ useConjugationDrill: () => drill }))
vi.mock('~/composables/useConjugationMaster', () => ({
  useConjugationMaster: () => ({
    perClass: ref([]), doneCount: ref(0), total: ref(9), earned: ref(false),
    celebrate: ref(false), saveStatus: ref('idle'), recordRound: vi.fn(),
    retrySave: vi.fn(async () => true), resetSaveStatus: vi.fn(() => true), dismiss: vi.fn(),
  }),
}))
vi.mock('~/composables/useGameLeaveGuard', () => ({ useGameLeaveGuard: () => {} }))

beforeEach(() => {
  for (const key of Object.keys(query)) Reflect.deleteProperty(query, key)
  replace.mockClear()
  selectClass.mockClear()
  start.mockClear()
  drill.selectedClassId.value = 'mixed'
  drill.phase.value = 'question'
  drill.saveStatus.value = 'idle'
})

describe('Conjugation page class routing', () => {
  it('normalizes an unknown ?set and leaves the class picker visible', async () => {
    query.set = 'not-a-class'
    const wrapper = shallowMount(ConjugationPage)
    await flushPromises()

    expect(start).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith({ query: {} })
    expect(wrapper.find('[data-testid="conjugation-change-class"]').exists()).toBe(false)
  })

  it('keeps an active deep-linked round intact, then allows class change after completion', async () => {
    query.set = 'p_irr'
    const wrapper = shallowMount(ConjugationPage)
    await flushPromises()
    expect(start).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="conjugation-change-class"]').exists()).toBe(true)

    const change = wrapper.get('[data-testid="conjugation-change-class"]')
    expect(change.attributes('disabled')).toBeDefined()
    await change.trigger('click')
    expect(replace).not.toHaveBeenLastCalledWith({ query: {} })

    drill.phase.value = 'done'
    await flushPromises()
    await change.trigger('click')
    expect(replace).toHaveBeenLastCalledWith({ query: {} })
    expect(wrapper.find('[data-testid="conjugation-change-class"]').exists()).toBe(false)
  })
})

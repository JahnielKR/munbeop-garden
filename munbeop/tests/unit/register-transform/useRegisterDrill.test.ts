// tests/unit/register-transform/useRegisterDrill.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRegisterDrill } from '~/composables/useRegisterDrill'

const add = vi.fn()
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k, locale: { value: 'en' } }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  add.mockClear()
})

describe('useRegisterDrill', () => {
  it('starts a round for the selected mode', () => {
    const d = useRegisterDrill('honor', 'mixed')
    d.start()
    expect(d.sessionItems.value.length).toBeGreaterThan(0)
    expect(d.sessionItems.value.every((i) => i.mode === 'honor')).toBe(true)
    expect(d.phase.value).toBe('question')
  })

  it('a wrong answer logs ONE mistake with errorDimension=register and 높임법 LAB', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    const item = d.item.value
    const wrong = item.distractors[0]
    await d.answer(wrong)
    expect(d.phase.value).toBe('wrong')
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      errorDimension: 'register',
      contextId: 'register-lab',
      contextName: '높임법 LAB',
      reviewState: 'incorrect',
      feedback: 'hard',
    })
  })

  it('a correct answer advances without logging', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    await d.answer(d.item.value.answer)
    expect(d.phase.value).toBe('right')
    expect(add).not.toHaveBeenCalled()
  })

  it('replayFailed re-drills only the missed items and suppresses logging', async () => {
    const d = useRegisterDrill('level', 'mixed')
    d.start()
    while (d.phase.value !== 'done') {
      const it = d.item.value
      if (d.index.value === 0) await d.answer(it.distractors[0])
      else await d.answer(it.answer)
      await d.next()
    }
    expect(d.failedItems.value.length).toBe(1)
    await d.replayFailed()
    expect(d.runMode.value).toBe('replay')
    expect(d.sessionItems.value.length).toBe(1)
    add.mockClear()
    const r = d.item.value
    await d.answer(r.distractors[0])
    expect(add).not.toHaveBeenCalled()
  })
})

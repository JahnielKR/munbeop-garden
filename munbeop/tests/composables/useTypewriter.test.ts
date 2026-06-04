import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useTypewriter } from '~/composables/useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('reveals one character per tick at the configured speed', async () => {
    const text = ref('hi!')
    const { rendered, done } = useTypewriter(text, { speed: 10 })
    expect(rendered.value).toBe('')
    expect(done.value).toBe(false)
    vi.advanceTimersByTime(10); await nextTick(); expect(rendered.value).toBe('h')
    vi.advanceTimersByTime(10); await nextTick(); expect(rendered.value).toBe('hi')
    vi.advanceTimersByTime(10); await nextTick(); expect(rendered.value).toBe('hi!')
    expect(done.value).toBe(true)
  })

  it('iterates by code-point (Hangul + surrogate-safe)', async () => {
    const text = ref('가나다🌱')
    const { rendered, done } = useTypewriter(text, { speed: 5 })
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가')
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가나')
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가나다')
    vi.advanceTimersByTime(5); await nextTick(); expect(rendered.value).toBe('가나다🌱')
    expect(done.value).toBe(true)
  })

  it('skip() instantly completes the line', async () => {
    const text = ref('hello world')
    const { rendered, done, skip } = useTypewriter(text, { speed: 100 })
    vi.advanceTimersByTime(100); await nextTick(); expect(rendered.value).toBe('h')
    skip()
    await nextTick()
    expect(rendered.value).toBe('hello world')
    expect(done.value).toBe(true)
  })

  it('restarts when the source text changes', async () => {
    const text = ref('one')
    const { rendered } = useTypewriter(text, { speed: 5 })
    vi.advanceTimersByTime(15); await nextTick(); expect(rendered.value).toBe('one')
    text.value = 'two'
    await nextTick()
    expect(rendered.value).toBe('')
    vi.advanceTimersByTime(15); await nextTick(); expect(rendered.value).toBe('two')
  })

  it('fires onDone exactly once when complete', async () => {
    const onDone = vi.fn()
    const text = ref('ab')
    useTypewriter(text, { speed: 5, onDone })
    vi.advanceTimersByTime(10); await nextTick()
    vi.advanceTimersByTime(20); await nextTick()
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

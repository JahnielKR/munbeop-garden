import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IntroCinematic from '~/components/escape-room/IntroCinematic.vue'

const ls = (s: string) => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const props = {
  narrative: ls('Primer párrafo.\n\nSegundo párrafo.'),
  voiceLine: '잘 잤어요?',
}

describe('IntroCinematic', () => {
  it('shows the voice line and starts on the first paragraph', async () => {
    vi.useFakeTimers()
    const w = mount(IntroCinematic, { props })
    expect(w.get('[data-testid="cinematic-voice"]').text()).toContain('잘 잤어요?')
    vi.advanceTimersByTime(3000)
    await flushPromises()
    expect(w.get('[data-testid="cinematic-text"]').text()).toContain('Primer párrafo.')
    expect(w.get('[data-testid="cinematic-text"]').text()).not.toContain('Segundo')
    vi.useRealTimers()
  })

  it('tap: first flushes the typewriter, then advances paragraphs, then emits done', async () => {
    vi.useFakeTimers()
    const w = mount(IntroCinematic, { props })
    const root = w.get('[data-testid="cinematic-root"]')
    await root.trigger('click') // flush p1
    await root.trigger('click') // → p2
    vi.advanceTimersByTime(3000)
    await flushPromises()
    expect(w.get('[data-testid="cinematic-text"]').text()).toContain('Segundo párrafo.')
    await root.trigger('click') // flush already-done p2 → next click finishes
    await root.trigger('click')
    expect(w.emitted('done')).toBeTruthy()
    vi.useRealTimers()
  })

  it('skip button emits done immediately', async () => {
    const w = mount(IntroCinematic, { props })
    await w.get('[data-testid="cinematic-skip"]').trigger('click')
    expect(w.emitted('done')).toBeTruthy()
  })
})

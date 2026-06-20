import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GuidedFirstSentence from '~/components/onboarding/GuidedFirstSentence.vue'
import { STARTER } from '~/lib/onboarding/starter'

async function flush() {
  await nextTick()
  await nextTick()
}

function mountOpen() {
  return mount(GuidedFirstSentence, {
    attachTo: document.body,
    props: { open: true },
    global: { stubs: { Teleport: false } },
  })
}

describe('GuidedFirstSentence', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('reveals the model sentence then emits complete with the composed sentence', async () => {
    const w = mountOpen()
    await flush()
    const input = document.body.querySelector('[data-testid="onboarding-blank"]') as HTMLInputElement
    input.value = STARTER.blankAnswer
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flush()
    ;(document.body.querySelector('[data-testid="onboarding-reveal"]') as HTMLElement).click()
    await flush()
    expect(document.body.textContent).toContain(STARTER.modelSentenceKo)
    ;(document.body.querySelector('[data-testid="onboarding-done"]') as HTMLElement).click()
    await flush()
    expect(w.emitted('complete')?.[0]?.[0]).toBe(STARTER.modelSentenceKo)
  })

  it('emits skip when the modal is closed', async () => {
    const w = mountOpen()
    await flush()
    ;(document.body.querySelector('.modal-close') as HTMLElement).click()
    await flush()
    expect(w.emitted('skip')).toBeTruthy()
  })
})

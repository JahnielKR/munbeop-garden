import { describe, it, expect, afterEach } from 'vitest'
import { mount, enableAutoUnmount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PracticeHelp from '~/components/practice/PracticeHelp.vue'

async function flushTransitions() {
  await nextTick()
  await nextTick()
}

enableAutoUnmount(afterEach)

afterEach(() => {
  document.body.innerHTML = ''
})

describe('PracticeHelp', () => {
  it('renders the explanation trigger for a mode that has content', () => {
    const w = mount(PracticeHelp, {
      props: { mode: 'register' },
      global: { stubs: { Teleport: false } },
    })
    const btn = w.find('.practice-help__trigger')
    expect(btn.exists()).toBe(true)
    // i18n key-echo stub returns the key.
    expect(btn.text()).toContain('practiceHelp.button')
  })

  it('opens the modal and shows the concept and its three types', async () => {
    const w = mount(PracticeHelp, {
      props: { mode: 'register' },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await w.find('.practice-help__trigger').trigger('click')
    await flushTransitions()
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    // useLocalized resolves to 'en' under the test stub.
    expect(dialog!.textContent).toContain('How Korean encodes respect')
    expect(dialog!.querySelectorAll('.practice-help__type').length).toBe(3)
  })

  it('keeps the tip hidden behind a toggle until it is clicked', async () => {
    const w = mount(PracticeHelp, {
      props: { mode: 'register' },
      attachTo: document.body,
      global: { stubs: { Teleport: false } },
    })
    await w.find('.practice-help__trigger').trigger('click')
    await flushTransitions()
    const toggle = document.body.querySelector('.practice-help__tip-toggle') as HTMLElement | null
    expect(toggle).not.toBeNull()
    // The tip body is collapsed on open.
    expect(document.body.querySelector('.practice-help__tip-body')).toBeNull()
    // Clicking the 💡 toggle reveals it.
    toggle!.click()
    await flushTransitions()
    const body = document.body.querySelector('.practice-help__tip-body')
    expect(body).not.toBeNull()
    expect(body!.textContent).toContain('Classic trap')
  })
})

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, h } from 'vue'
import Modal from '~/components/ui/Modal.vue'

async function flushTransitions() {
  await nextTick()
  await nextTick()
}

describe('Modal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  function mountModal(open: boolean, slotContent = '<p>hello</p>') {
    return mount(Modal, {
      attachTo: document.body,
      props: { open, title: 'Test', closeLabel: 'Close' },
      slots: { default: () => h('div', { innerHTML: slotContent }) },
      global: { stubs: { Teleport: false } },
    })
  }

  it('renders nothing when open=false', async () => {
    mountModal(false)
    await flushTransitions()
    expect(document.body.querySelector('.modal-overlay')).toBeNull()
  })

  it('renders overlay and slot content when open=true', async () => {
    mountModal(true, '<span class="payload">PAYLOAD</span>')
    await flushTransitions()
    const overlay = document.body.querySelector('.modal-overlay')
    expect(overlay).not.toBeNull()
    expect(document.body.querySelector('.payload')?.textContent).toBe('PAYLOAD')
  })

  it('emits "close" when overlay is clicked (not the modal body)', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    const overlay = document.body.querySelector('.modal-overlay') as HTMLElement
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does NOT emit "close" when click lands inside the modal body', async () => {
    const wrapper = mountModal(true, '<button class="inner">x</button>')
    await flushTransitions()
    const inner = document.body.querySelector('.inner') as HTMLElement
    inner.click()
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('emits "close" when Escape is pressed', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits "close" when the X button is clicked', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    const closeBtn = document.body.querySelector('.modal-close') as HTMLElement
    closeBtn.click()
    await flushTransitions()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('locks document.body scroll while open and restores on close', async () => {
    const wrapper = mountModal(true)
    await flushTransitions()
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ open: false })
    await flushTransitions()
    expect(document.body.style.overflow).toBe('')
  })

  it('keeps focus inside the modal when Tab is pressed at the last focusable', async () => {
    mountModal(
      true,
      '<button class="a">a</button><button class="b">b</button>',
    )
    await flushTransitions()
    const b = document.body.querySelector('.b') as HTMLElement
    b.focus()
    expect(document.activeElement).toBe(b)
    const evt = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(evt)
    await flushTransitions()
    const closeBtn = document.body.querySelector('.modal-close')
    expect(document.activeElement).toBe(closeBtn)
  })
})

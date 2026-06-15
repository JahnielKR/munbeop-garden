import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DangerZone from '~/components/settings/DangerZone.vue'

const deleteAccount = vi.fn()
vi.stubGlobal('useAuth', () => ({ deleteAccount }))

function mountDanger() {
  return mount(DangerZone, { attachTo: document.body, global: { stubs: { Teleport: false } } })
}

describe('DangerZone', () => {
  beforeEach(() => {
    deleteAccount.mockReset()
    deleteAccount.mockResolvedValue({ error: null })
    document.body.innerHTML = ''
  })

  it('keeps the confirm button disabled until exactly DELETE is typed', async () => {
    const wrapper = mountDanger()
    await wrapper.get('.danger__open').trigger('click')
    await nextTick()
    const confirmBtn = () => document.body.querySelector('.danger-confirm') as HTMLButtonElement
    expect(confirmBtn().disabled).toBe(true)

    const input = document.body.querySelector('#del-confirm') as HTMLInputElement
    input.value = 'delete'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(confirmBtn().disabled).toBe(true)

    input.value = 'DELETE'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    expect(confirmBtn().disabled).toBe(false)
  })

  it('calls deleteAccount when confirmed with DELETE', async () => {
    const wrapper = mountDanger()
    await wrapper.get('.danger__open').trigger('click')
    await nextTick()
    const input = document.body.querySelector('#del-confirm') as HTMLInputElement
    input.value = 'DELETE'
    input.dispatchEvent(new Event('input'))
    await nextTick()
    ;(document.body.querySelector('.danger-confirm') as HTMLButtonElement).click()
    await nextTick()
    expect(deleteAccount).toHaveBeenCalledTimes(1)
  })
})

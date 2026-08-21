import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import CameraStage from '~/components/layout/CameraStage.vue'

const route = reactive({ path: '/welcome' })
vi.stubGlobal('useRoute', () => route)

describe('CameraStage accessibility', () => {
  it('removes the off-screen panel from focus and the accessibility tree', async () => {
    route.path = '/welcome'
    const wrapper = mount(CameraStage, {
      global: {
        stubs: { WelcomePanel: { template: '<button>Welcome action</button>' } },
      },
      slots: { default: '<button>App action</button>' },
    })

    const welcome = wrapper.get('.camera-stage__panel--welcome')
    const app = wrapper.get('.camera-stage__panel--app')
    expect(welcome.attributes('aria-hidden')).toBeUndefined()
    expect(welcome.attributes('inert')).toBeUndefined()
    expect(app.attributes('aria-hidden')).toBe('true')
    expect(app.attributes('inert')).toBeDefined()

    route.path = '/pricing'
    await nextTick()

    expect(welcome.attributes('aria-hidden')).toBe('true')
    expect(welcome.attributes('inert')).toBeDefined()
    expect(app.attributes('aria-hidden')).toBeUndefined()
    expect(app.attributes('inert')).toBeUndefined()
  })
})

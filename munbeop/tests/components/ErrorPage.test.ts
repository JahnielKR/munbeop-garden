import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorPage from '~/error.vue'

const clearError = vi.fn()
vi.stubGlobal('clearError', clearError)

function textButton(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(label))
}

describe('app/error.vue (fatal boundary)', () => {
  beforeEach(() => clearError.mockReset())

  it('renders a localized alert with reload + go-home actions', () => {
    const w = mount(ErrorPage, { props: { error: { statusCode: 404, message: 'Page not found' } } })
    const card = w.find('[role="alert"]')
    expect(card.exists()).toBe(true)
    expect(w.text()).toContain('errors.fatal_title')
    expect(w.text()).toContain('errors.fatal_body')
    expect(w.text()).toContain('404') // statusCode surfaced
    expect(textButton(w, 'errors.reload')).toBeTruthy()
    expect(textButton(w, 'errors.go_home')).toBeTruthy()
  })

  it('clears the error and redirects home when "go home" is clicked', async () => {
    const w = mount(ErrorPage, { props: { error: { statusCode: 500, message: 'boom' } } })
    await textButton(w, 'errors.go_home')!.trigger('click')
    expect(clearError).toHaveBeenCalledWith({ redirect: '/' })
  })

  it('leads with reload (primary) for a chunk-load error', () => {
    const w = mount(ErrorPage, {
      props: { error: { message: 'Failed to fetch dynamically imported module: /_nuxt/abc.js' } },
    })
    const primary = w.find('button[data-variant="primary"]')
    expect(primary.exists()).toBe(true)
    expect(primary.text()).toContain('errors.reload')
  })
})

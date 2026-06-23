import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GardenSkeleton from '~/components/garden/GardenSkeleton.vue'

describe('GardenSkeleton', () => {
  it('renders a status region labelled with garden.loading', () => {
    const w = mount(GardenSkeleton, { global: { mocks: { $t: (k: string) => k } } })
    const status = w.get('[role="status"]')
    expect(status.attributes('aria-label')).toBe('garden.loading')
  })
})

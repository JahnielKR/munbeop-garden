import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '~/components/ui/Badge.vue'

describe('Badge new role variants', () => {
  for (const v of ['plum', 'teal', 'rose'] as const) {
    it(`renders the ${v} variant`, () => {
      const w = mount(Badge, { props: { variant: v }, slots: { default: 'x' } })
      expect(w.get('.badge').attributes('data-variant')).toBe(v)
    })
  }
})

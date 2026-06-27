// munbeop/tests/components/settings/AvatarPickerSetting.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import AvatarPickerSetting from '~/components/settings/AvatarPickerSetting.vue'

const choose = vi.fn()
const syncUnlocks = vi.fn().mockResolvedValue(undefined)
vi.mock('~/composables/useAvatars', () => ({
  useAvatars: () => ({
    byTier: computed(() => ({
      common: [{ id: 'seed', tier: 'common', name: { ko: '씨앗', en: 'Seed' }, rule: { kind: 'always' }, unlocked: true, progress: { current: 1, target: 1 } }],
      rare: [{ id: 'butterfly', tier: 'rare', name: { ko: '나비', en: 'Butterfly' }, rule: { kind: 'reviews', n: 100 }, unlocked: false, progress: { current: 20, target: 100 } }],
      epic: [],
      legendary: [],
    })),
    ownedCount: computed(() => 1),
    totalCount: computed(() => 2),
    chosenId: computed(() => null),
    choose,
    syncUnlocks,
    avatarUrl: (id: string) => `/img/avatars/${id}.png`,
  }),
}))
vi.mock('~/stores/auth', () => ({ useAuthStore: () => ({ user: { email: 'ana@ana.com' } }) }))

describe('AvatarPickerSetting', () => {
  it('selecting an unlocked avatar calls choose(id)', async () => {
    const w = mount(AvatarPickerSetting)
    await w.get('[data-avatar="seed"]').trigger('click')
    expect(choose).toHaveBeenCalledWith('seed')
  })

  it('"Use initial" calls choose(null)', async () => {
    const w = mount(AvatarPickerSetting)
    await w.get('[data-avatar="__initial"]').trigger('click')
    expect(choose).toHaveBeenCalledWith(null)
  })

  it('a locked avatar button is disabled and shows its requirement', () => {
    const w = mount(AvatarPickerSetting)
    const locked = w.get('[data-avatar="butterfly"]')
    expect(locked.attributes('disabled')).toBeDefined()
    expect(w.text()).toContain('settings.avatar.req.reviews')
  })

  it('shows the owned/total count', () => {
    const w = mount(AvatarPickerSetting)
    expect(w.text()).toContain('settings.avatar.owned')
  })

  it('runs syncUnlocks on mount', () => {
    mount(AvatarPickerSetting)
    expect(syncUnlocks).toHaveBeenCalled()
  })
})

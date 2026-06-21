import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TokenChip from '~/components/particle-lab/TokenChip.vue'
import type { LabToken } from '~/lib/domain'

// useI18n / useLocalized are globally stubbed in tests/setup.ts (locale 'en'),
// so tl() resolves LocalizedString values to their English string.

const particleTok: LabToken = {
  kind: 'particle', text: '는', particleId: 'topic', toggleable: true,
}
const wordTok: LabToken = {
  kind: 'word', text: '저',
  gloss: { en: 'I', es: 'yo', fr: 'je', 'pt-BR': 'eu', th: 'ฉัน', id: 'saya', vi: 'tôi', ja: '私' },
}

function mountChip(token: LabToken, off = false) {
  return mount(TokenChip, { props: { token, off } })
}

describe('TokenChip', () => {
  it('renders a word token as plain text with gloss, no button', () => {
    const w = mountChip(wordTok)
    expect(w.find('[data-testid="word-token"]').exists()).toBe(true)
    expect(w.find('button').exists()).toBe(false)
    expect(w.text()).toContain('저')
    expect(w.text()).toContain('I')
  })

  it('renders a particle as a pressed toggle button when ON', () => {
    const w = mountChip(particleTok)
    const btn = w.get('[data-testid="particle-chip"]')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(btn.classes()).toContain('chip--topic')
    expect(btn.classes()).not.toContain('chip--off')
  })

  it('shows the ghost state and aria-pressed=false when OFF', () => {
    const w = mountChip(particleTok, true)
    const btn = w.get('[data-testid="particle-chip"]')
    expect(btn.attributes('aria-pressed')).toBe('false')
    expect(btn.classes()).toContain('chip--off')
  })

  it('emits toggle on click', async () => {
    const w = mountChip(particleTok)
    await w.get('[data-testid="particle-chip"]').trigger('click')
    expect(w.emitted('toggle')).toBeTruthy()
  })

  it('colors a recipient particle with its role class', () => {
    const tok: LabToken = { kind: 'particle', text: '한테', particleId: 'recipient', toggleable: true }
    const w = mountChip(tok)
    expect(w.get('[data-testid="particle-chip"]').classes()).toContain('chip--recipient')
  })

  it('renders the level form for a word with byLevel', () => {
    const tok: LabToken = { kind: 'word', text: '학생이에요', byLevel: { formal: '학생입니다', casual: '학생이야' } }
    expect(mount(TokenChip, { props: { token: tok, level: 'formal' } }).text()).toContain('학생입니다')
    expect(mount(TokenChip, { props: { token: tok, level: 'casual' } }).text()).toContain('학생이야')
    expect(mount(TokenChip, { props: { token: tok } }).text()).toContain('학생이에요')
  })
})

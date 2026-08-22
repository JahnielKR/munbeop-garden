import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGlobalAchievements } from '~/composables/useGlobalAchievements'
import { useActivityStore } from '~/stores/activity'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'
import type { Grammar, LocalizedString, SrsState } from '~/lib/domain'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const meaning = (text: string): LocalizedString => ({
  en: text, es: text, fr: text, 'pt-BR': text, th: text, id: text, vi: text, ja: text,
})
const grammar = (ko: string, deckId: string): Grammar => ({ ko, deckId, meaning: meaning(ko) })
const tree = (): SrsState => ({
  lastSeen: null,
  easyCount: 10,
  hardCount: 0,
  mastery: 'tree',
})

describe('useGlobalAchievements', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('uses the base catalog and the historical best streak for sticky milestones', () => {
    useGrammarStore().items = [
      grammar('catalog', 'topik-1'),
      grammar('personal', 'custom'),
    ]
    useSrsStore().map = {
      catalog: tree(),
      personal: tree(),
      deleted: tree(),
    }
    useActivityStore().map = Object.fromEntries(
      Array.from({ length: 7 }, (_, index) => [
        `2026-05-${String(index + 1).padStart(2, '0')}`,
        { count: 1 },
      ]),
    )

    const { achievements } = useGlobalAchievements(new Date(2026, 5, 26, 10).getTime())
    const earned = () => new Set(achievements.value.filter((item) => item.earned).map((item) => item.id))

    expect(earned()).toContain('garden_complete')
    expect(earned()).toContain('streak_7')

    // A new personal grammar is not part of the fixed catalog milestone and
    // cannot relock a trophy the learner already earned.
    useGrammarStore().items.push(grammar('another-personal', 'custom'))
    expect(earned()).toContain('garden_complete')
  })
})

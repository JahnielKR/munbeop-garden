import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  LocalizedString,
  SelectionCandidate,
} from '~/lib/domain'

/** Fills all 8 locales with the same string. Test-only convenience. */
const ls = (s: string): LocalizedString => ({
  en: s,
  es: s,
  fr: s,
  'pt-BR': s,
  th: s,
  id: s,
  vi: s,
  ja: s,
})

const makeSelectionCandidate = (i: number): SelectionCandidate => ({
  korean: `안녕! 사과${i}가 있어요.`,
  question: ls(`Q ${i}`),
  options: [ls('A'), ls('B'), ls('C'), ls('D')],
  correctIndex: 0,
  hints: { free: ls('hint free'), premium: ls('hint premium') },
})

const makeCompletionCandidate = (i: number): CompletionCandidate => ({
  korean: `책___ 책상에 있어요.`,
  translation: ls(`The book is on the desk (#${i}).`),
  answer: '이',
  hints: { free: ls('free'), premium: ls('premium') },
})

const makeCreationCandidate = (i: number): CreationCandidate => ({
  korean: `어디에 가요?`,
  question: ls(`Where do you go? (#${i})`),
  tiles: ['카페에', '가요', '학교에'],
  correctOrder: [0, 1],
  hints: { free: ls('free'), premium: ls('premium') },
})

/**
 * Build a minimal but valid Level for tests.
 * 3 slots (one per type) × 5 candidates, 1 room, 4 rewards.
 * Pass `overrides` to mutate any top-level field.
 */
export function makeLevel(overrides: Partial<Level> = {}): Level {
  return {
    id: 'test-level',
    title: ls('Test Level'),
    tagline: ls('tagline'),
    intro: ls('intro p1\n\nintro p2'),
    outro: ls('outro p1\n\noutro p2'),
    voiceIntro: '안녕!',
    voiceOutro: '잘 가요!',
    grammarCodes: ['G003', 'G005', 'G012', 'G027'],
    topikLevel: 1,
    rooms: [
      {
        id: 'room-a',
        title: ls('Room A'),
        image: 'rooms/a.png',
        ambientAudio: 'audio/a.ogg',
        hotspots: [
          { id: 'h-a-1', rect: [0, 0, 100, 100], triggersSlot: 'slot-1' },
          { id: 'h-a-2', rect: [100, 0, 50, 50], cosmeticDetail: ls('easter egg') },
        ],
      },
    ],
    slots: [
      {
        id: 'slot-1',
        type: 'selection',
        grammarFocus: ['G027'],
        candidates: [0, 1, 2, 3, 4].map(makeSelectionCandidate),
      },
      {
        id: 'slot-2',
        type: 'completion',
        grammarFocus: ['G003'],
        candidates: [0, 1, 2, 3, 4].map(makeCompletionCandidate),
      },
      {
        id: 'slot-3',
        type: 'creation',
        grammarFocus: ['G005', 'G012'],
        candidates: [0, 1, 2, 3, 4].map(makeCreationCandidate),
      },
    ],
    rewards: {
      common: { id: 'r-c', image: 'c.png', name: ls('Common'), description: ls('Common desc') },
      rare: { id: 'r-r', image: 'r.png', name: ls('Rare'), description: ls('Rare desc') },
      epic: { id: 'r-e', image: 'e.png', name: ls('Epic'), description: ls('Epic desc') },
      legendary: {
        id: 'r-l',
        image: 'l.png',
        name: ls('Legendary'),
        description: ls('Legendary desc'),
      },
    },
    rules: {
      maxErrors: 2,
      epicTimeThresholdSeconds: 480,
      legendaryCleanRunsRequired: 3,
    },
    ...overrides,
  }
}

/** Shorthand for tests that need a localized string but don't care about content. */
export { ls }

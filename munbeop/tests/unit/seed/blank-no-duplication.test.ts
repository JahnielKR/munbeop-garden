import { describe, it, expect } from 'vitest'
import { CLOZE_ITEMS } from '~/seed/cloze'
import { PLACEMENT_ITEMS } from '~/seed/placement'
import { GRAMMAR_PAIRS } from '~/seed/grammar-pairs'

/**
 * Guards every `{}`-substitution drill (cloze, placement, confusable PairDrill)
 * against a stem-duplication authoring mistake: leaving the conjugation
 * stem/noun in the sentence right before `{}` while the option ALSO carries it,
 * so the renderer doubles it — e.g. `이 옷이 비싸{}` + `비싸지만` → `비싸비싸지만`.
 *
 * Rule: the trailing run of Hangul syllables immediately before `{}` must NOT be
 * a prefix of any option. The blank stands for the whole substituted word, so a
 * space (or sentence start) — never a repeated stem — should precede it.
 *
 * This intentionally does NOT flag the legitimate "noun/stem in sentence + bare
 * ending/particle option" pattern (`도서관{}` + `에서`, `비싸{}` + `다고 해도`)
 * or true compounds (`도와{}` + `줄게`), where the trailing run is not a prefix
 * of the option.
 */

/** Longest trailing run of Hangul syllables in `before` (stops at space/punct). */
function trailingHangul(before: string): string {
  const m = before.match(/[가-힣]+$/)
  return m ? m[0] : ''
}

interface Probe {
  dataset: string
  ko: string
  sentence: string
  options: string[]
}

const probes: Probe[] = [
  ...CLOZE_ITEMS.map((c) => ({ dataset: 'cloze', ko: c.ko, sentence: c.sentence, options: [c.answer, ...c.distractors] })),
  ...PLACEMENT_ITEMS.map((p) => ({ dataset: 'placement', ko: p.ko, sentence: p.sentence, options: [p.answer, ...p.distractors] })),
  ...GRAMMAR_PAIRS.flatMap((pair) =>
    pair.items.map((it) => ({ dataset: 'pairs', ko: `${pair.a} / ${pair.b}`, sentence: it.sentence, options: [it.optionA, it.optionB] })),
  ),
]

describe('blank-substitution drills: no stem duplication before {}', () => {
  it('no sentence repeats the option stem right before the blank', () => {
    const violations: string[] = []
    for (const p of probes) {
      const before = p.sentence.split('{}')[0] ?? ''
      const after = p.sentence.split('{}')[1] ?? ''
      const trailing = trailingHangul(before)
      if (!trailing) continue
      const offending = p.options.find((o) => o.startsWith(trailing))
      if (offending) {
        violations.push(
          `[${p.dataset}] ${p.ko} :: "${p.sentence}" + "${offending}" → "${before + offending + after}" (duplicated "${trailing}")`,
        )
      }
    }
    expect(violations, `\n${violations.join('\n')}\n`).toHaveLength(0)
  })
})

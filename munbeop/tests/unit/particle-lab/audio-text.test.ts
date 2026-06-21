import { describe, it, expect } from 'vitest'
import { tokenText } from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'
import type { LabSentence, SpeechLevel } from '~/lib/domain'

/** The exact Korean the TTS tool synthesizes per (id, level) — must match the seed. */
const GOLD: Record<string, Record<SpeechLevel, string>> = {
  's01-jeoneun': { formal: '저는 학생입니다.', polite: '저는 학생이에요.', casual: '나는 학생이야.' },
  's02-goyangi': { formal: '고양이가 우유를 마십니다.', polite: '고양이가 우유를 마셔요.', casual: '고양이가 우유를 마셔.' },
  's03-hakgyo': { formal: '학교에 갑니다.', polite: '학교에 가요.', casual: '학교에 가.' },
  's04-doseogwan': { formal: '도서관에서 공부합니다.', polite: '도서관에서 공부해요.', casual: '도서관에서 공부해.' },
  's05-jeodo': { formal: '저도 커피를 좋아합니다.', polite: '저도 커피를 좋아해요.', casual: '나도 커피를 좋아해.' },
  's06-achime': { formal: '아침에 빵을 먹습니다.', polite: '아침에 빵을 먹어요.', casual: '아침에 빵을 먹어.' },
  's07-biga': { formal: '비가 옵니다.', polite: '비가 와요.', casual: '비가 와.' },
  's08-chinguhante': { formal: '친구한테 편지를 씁니다.', polite: '친구한테 편지를 써요.', casual: '친구한테 편지를 써.' },
  's09-beoseuro': { formal: '버스로 학교에 갑니다.', polite: '버스로 학교에 가요.', casual: '버스로 학교에 가.' },
  's10-ppangman': { formal: '빵만 먹습니다.', polite: '빵만 먹어요.', casual: '빵만 먹어.' },
  's11-sagwawa': { formal: '사과와 바나나를 삽니다.', polite: '사과와 바나나를 사요.', casual: '사과와 바나나를 사.' },
  's12-ahopsibuteo': { formal: '아홉 시부터 다섯 시까지 일합니다.', polite: '아홉 시부터 다섯 시까지 일해요.', casual: '아홉 시부터 다섯 시까지 일해.' },
  's13-yeonpillo': { formal: '연필로 편지를 씁니다.', polite: '연필로 편지를 써요.', casual: '연필로 편지를 써.' },
  's14-jeodo': { formal: '저도 커피를 마십니다.', polite: '저도 커피를 마셔요.', casual: '나도 커피를 마셔.' },
}

/** Assemble a sentence's surface at a level (eojeols joined by space, + period). */
function assemble(s: LabSentence, level: SpeechLevel): string {
  return s.eojeols.map((eo) => eo.map((tok) => tokenText(tok, level)).join('')).join(' ') + '.'
}

describe('audio ↔ seed text contract', () => {
  it('the 42 synthesized strings match the seed assembly at every level', () => {
    const levels: SpeechLevel[] = ['formal', 'polite', 'casual']
    for (const s of PARTICLE_SENTENCES) {
      const gold = GOLD[s.id]
      expect(gold, `gold missing for ${s.id}`).toBeDefined()
      for (const level of levels) {
        expect(assemble(s, level), `${s.id}/${level}`).toBe(gold![level])
      }
    }
    expect(Object.keys(GOLD)).toHaveLength(PARTICLE_SENTENCES.length)
  })
})

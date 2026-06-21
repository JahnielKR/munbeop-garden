import { describe, it, expect } from 'vitest'
import { correctSpacing } from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'

/** The standard 한글 맞춤법 띄어쓰기 surface of each Explore sentence. */
const GOLD: Record<string, string> = {
  's01-jeoneun': '저는 학생이에요',
  's02-goyangi': '고양이가 우유를 마셔요',
  's03-hakgyo': '학교에 가요',
  's04-doseogwan': '도서관에서 공부해요',
  's05-jeodo': '저도 커피를 좋아해요',
  's06-achime': '아침에 빵을 먹어요',
  's07-biga': '비가 와요',
  's08-chinguhante': '친구한테 편지를 써요',
  's09-beoseuro': '버스로 학교에 가요',
  's10-ppangman': '빵만 먹어요',
  's11-sagwawa': '사과와 바나나를 사요',
  's12-ahopsibuteo': '아홉 시부터 다섯 시까지 일해요',
  's13-yeonpillo': '연필로 편지를 써요',
  's14-jeodo': '저도 커피를 마셔요',
}

describe('correctSpacing', () => {
  it('reproduces the standard spacing for all 14 sentences', () => {
    for (const s of PARTICLE_SENTENCES) expect(correctSpacing(s)).toBe(GOLD[s.id])
    expect(Object.keys(GOLD)).toHaveLength(PARTICLE_SENTENCES.length)
  })
})

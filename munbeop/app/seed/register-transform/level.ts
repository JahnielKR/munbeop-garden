// app/seed/register-transform/level.ts
import type { RegisterItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * Speech-level transform items (반말 ↔ 해요체 ↔ 합쇼체), neutral subject.
 * Starter batch — expanded to the full ~20 by the Step 8 content Workflow.
 * Drafted + Korean-lens adversarially verified; Korean wife review = final gate.
 */
export const LEVEL_ITEMS: RegisterItem[] = [
  {
    source: '저는 한국어를 공부해요.',
    mode: 'level',
    target: 'formal',
    set: 'formal',
    answer: '저는 한국어를 공부합니다.',
    distractors: ['저는 한국어를 공부해.', '나는 한국어를 공부합니다.', '저는 한국어를 공부하세요.'],
    trans: L(
      'I study Korean.',
      'Estudio coreano.',
      "J'étudie le coréen.",
      'Eu estudo coreano.',
      'ฉันเรียนภาษาเกาหลี',
      'Saya belajar bahasa Korea.',
      'Tôi học tiếng Hàn.',
      '私は韓国語を勉強します。',
    ),
    why: L(
      '합쇼체 declarative is -ㅂ/습니다: 공부하다 → 공부합니다; keep 저 (not 나) in formal speech.',
      'El declarativo de 합쇼체 es -ㅂ/습니다: 공부하다 → 공부합니다; en formal se mantiene 저 (no 나).',
      "Le déclaratif 합쇼체 est -ㅂ/습니다 : 공부하다 → 공부합니다 ; en registre formel on garde 저 (pas 나).",
      'O declarativo do 합쇼체 é -ㅂ/습니다: 공부하다 → 공부합니다; no formal mantém-se 저 (não 나).',
      'รูปบอกเล่าของ 합쇼체 คือ -ㅂ/습니다: 공부하다 → 공부합니다 และในระดับทางการใช้ 저 (ไม่ใช่ 나)',
      'Deklaratif 합쇼체 adalah -ㅂ/습니다: 공부하다 → 공부합니다; di ragam formal tetap pakai 저 (bukan 나).',
      'Dạng trần thuật 합쇼체 là -ㅂ/습니다: 공부하다 → 공부합니다; ở văn phong trang trọng giữ 저 (không phải 나).',
      '합쇼체の叙述形は-ㅂ/습니다：공부하다 → 공부합니다。フォーマルでは저のまま（나にしない）。',
    ),
  },
  {
    source: '내일 친구를 만나요.',
    mode: 'level',
    target: 'casual',
    set: 'casual',
    answer: '내일 친구를 만나.',
    distractors: ['내일 친구를 만나요.', '내일 친구를 만납니다.', '내일 친구를 만난다.'],
    trans: L(
      "I'm meeting a friend tomorrow.",
      'Mañana me veo con un amigo.',
      'Demain je vois un ami.',
      'Amanhã vou encontrar um amigo.',
      'พรุ่งนี้ฉันจะเจอเพื่อน',
      'Besok saya bertemu teman.',
      'Ngày mai tôi gặp bạn.',
      '明日友だちに会う。',
    ),
    why: L(
      '반말 (해체) drops 요: 만나요 → 만나. (만난다 is 한다체 writing style, not casual speech.)',
      '반말 (해체) quita 요: 만나요 → 만나. (만난다 es estilo escrito 한다체, no habla casual.)',
      '반말 (해체) enlève 요 : 만나요 → 만나. (만난다 est le style écrit 한다체, pas le parler familier.)',
      '반말 (해체) tira 요: 만나요 → 만나. (만난다 é estilo escrito 한다체, não fala casual.)',
      '반말 (해체) ตัด 요 ออก: 만나요 → 만나 (만난다 เป็นสไตล์เขียน 한다체 ไม่ใช่ภาษาพูดกันเอง)',
      '반말 (해체) menghapus 요: 만나요 → 만나. (만난다 gaya tulis 한다체, bukan ujaran santai.)',
      '반말 (해체) bỏ 요: 만나요 → 만나. (만난다 là văn viết 한다체, không phải lời nói thân mật.)',
      '반말（해체）は요を落とす：만나요 → 만나。（만난다は한다체の書き言葉で、話し言葉の반말ではない。）',
    ),
  },
]

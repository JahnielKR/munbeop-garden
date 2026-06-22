// app/seed/register-transform/honor.ts
import type { RegisterItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * Subject/object honorification items (-(으)시-, 께서/께, suppletion).
 * Starter batch — expanded to the full ~28 (covering the spine honorificVocab
 * table) by the Step 8 content Workflow. The speaker is NEVER self-honorified.
 * Drafted + Korean-lens adversarially verified; Korean wife review = final gate.
 */
export const HONOR_ITEMS: RegisterItem[] = [
  {
    source: '할아버지가 지금 자요.',
    mode: 'honor',
    target: 'polite',
    set: 'verb',
    answer: '할아버지께서 지금 주무세요.',
    distractors: ['할아버지께서 지금 자세요.', '할아버지가 지금 주무세요.', '할아버지께서 지금 주무셔.'],
    trans: L(
      'Grandfather is sleeping now.',
      'El abuelo está durmiendo ahora.',
      'Grand-père dort maintenant.',
      'O avô está dormindo agora.',
      'ตอนนี้คุณปู่กำลังนอนหลับ',
      'Kakek sedang tidur sekarang.',
      'Ông đang ngủ bây giờ.',
      'おじいさんは今お休みです。',
    ),
    why: L(
      'Honoring the subject: 이/가 → 께서, and 자다 has the suppletive honorific 주무시다 → 주무세요 (not 자세요).',
      'Honrar al sujeto: 이/가 → 께서, y 자다 tiene el honorífico supletivo 주무시다 → 주무세요 (no 자세요).',
      'Honorer le sujet : 이/가 → 께서, et 자다 a le suppletif honorifique 주무시다 → 주무세요 (pas 자세요).',
      'Honrar o sujeito: 이/가 → 께서, e 자다 tem o honorífico supletivo 주무시다 → 주무세요 (não 자세요).',
      'ยกย่องประธาน: 이/가 → 께서 และ 자다 มีรูปยกย่องพิเศษ 주무시다 → 주무세요 (ไม่ใช่ 자세요)',
      'Menghormati subjek: 이/가 → 께서, dan 자다 punya honorifik supletif 주무시다 → 주무세요 (bukan 자세요).',
      'Tôn kính chủ ngữ: 이/가 → 께서, và 자다 có dạng kính ngữ thay thế 주무시다 → 주무세요 (không phải 자세요).',
      '主語を高める：이/가 → 께서、자다は補充法の尊敬語주무시다 → 주무세요（자세요ではない）。',
    ),
  },
  {
    source: '선생님이 책을 읽어요.',
    mode: 'honor',
    target: 'formal',
    set: 'particle',
    answer: '선생님께서 책을 읽으십니다.',
    distractors: ['선생님이 책을 읽으십니다.', '선생님께서 책을 읽습니다.', '선생님께서 책을 읽으세요.'],
    trans: L(
      'The teacher is reading a book.',
      'El profesor está leyendo un libro.',
      'Le professeur lit un livre.',
      'O professor está lendo um livro.',
      'คุณครูกำลังอ่านหนังสือ',
      'Guru sedang membaca buku.',
      'Thầy giáo đang đọc sách.',
      '先生が本をお読みになります。',
    ),
    why: L(
      '합쇼체 honorific: 이/가 → 께서 pairs with -(으)시- + -ㅂ니다 → 읽으십니다. 께서 without 시 is inconsistent.',
      '합쇼체 honorífico: 이/가 → 께서 va con -(으)시- + -ㅂ니다 → 읽으십니다. 께서 sin 시 es inconsistente.',
      "합쇼체 honorifique : 이/가 → 께서 va avec -(으)시- + -ㅂ니다 → 읽으십니다. 께서 sans 시 est incohérent.",
      '합쇼체 honorífico: 이/가 → 께서 combina com -(으)시- + -ㅂ니다 → 읽으십니다. 께서 sem 시 é inconsistente.',
      '합쇼체 ยกย่อง: 이/가 → 께서 ใช้คู่กับ -(으)시- + -ㅂ니다 → 읽으십니다 การใช้ 께서 โดยไม่มี 시 ไม่สอดคล้องกัน',
      '합쇼체 honorifik: 이/가 → 께서 berpasangan dengan -(으)시- + -ㅂ니다 → 읽으십니다. 께서 tanpa 시 tidak konsisten.',
      '합쇼체 kính ngữ: 이/가 → 께서 đi với -(으)시- + -ㅂ니다 → 읽으십니다. Dùng 께서 mà thiếu 시 là không nhất quán.',
      '합쇼체の尊敬：이/가 → 께서は-(으)시-+-ㅂ니다 → 읽으십니다と対応。께서なのに시が無いと不整合。',
    ),
  },
]

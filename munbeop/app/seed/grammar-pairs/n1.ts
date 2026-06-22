import type { ConfusablePair } from '~/lib/domain'
import { L } from '../locale'

/** Confusable grammar/ending pairs. a/b match grammars-n{1,2,3}.ts verbatim. */
export const N1_PAIRS: ConfusablePair[] = [
  {
    id: 'an-mot',
    a: '안 + V / -지 않다',
    b: '못 + V / -지 못하다',
    note: L(
      "안 negates by choice (don't); 못 negates by inability (can't).",
      '안 niega por elección (no quiero); 못 niega por incapacidad (no puedo).',
      '안 nie par choix (ne pas vouloir) ; 못 nie par incapacité (ne pas pouvoir).',
      '안 nega por escolha (não quero); 못 nega por incapacidade (não consigo).',
      '안 ปฏิเสธโดยตั้งใจ (ไม่ทำ); 못 ปฏิเสธเพราะทำไม่ได้',
      '안 menyangkal karena pilihan (tidak mau); 못 karena tidak mampu (tidak bisa).',
      '안 phủ định do lựa chọn (không làm); 못 do không thể (không làm được).',
      '안 は意志による否定（しない）、못 は能力による否定（できない）。',
    ),
    items: [
      {
        sentence: '어제 너무 바빠서 점심을 {} 먹었어요.',
        optionA: '안',
        optionB: '못',
        answer: 'b',
        trans: L(
          "I was so busy yesterday I couldn't eat lunch.",
          'Ayer estaba tan ocupado que no pude almorzar.',
          "J'étais si occupé hier que je n'ai pas pu déjeuner.",
          'Ontem eu estava tão ocupado que não consegui almoçar.',
          'เมื่อวานยุ่งมากจนกินข้าวเที่ยงไม่ได้',
          'Kemarin saya sangat sibuk sampai tidak bisa makan siang.',
          'Hôm qua tôi bận đến mức không ăn trưa được.',
          '昨日は忙しすぎて昼ご飯を食べられませんでした。',
        ),
        why: L(
          "Being too busy blocks the action → 못 (couldn't); 안 would wrongly mean choosing not to eat.",
          'Estar muy ocupado impide la acción → 못; 안 significaría no querer comer.',
          "Trop occupé empêche l'action → 못 ; 안 voudrait dire ne pas vouloir manger.",
          'Estar ocupado impede a ação → 못; 안 significaria optar por não comer.',
          'ยุ่งจนทำไม่ได้ → 못; 안 จะแปลว่าตั้งใจไม่กิน',
          'Terlalu sibuk menghalangi → 못; 안 berarti memilih tidak makan.',
          'Quá bận nên không thể → 못; 안 nghĩa là cố ý không ăn.',
          '忙しくてできない → 못。안 だと食べない意志になる。',
        ),
      },
      {
        sentence: '저는 다이어트 중이라서 케이크를 {} 먹어요.',
        optionA: '안',
        optionB: '못',
        answer: 'a',
        trans: L(
          "I'm on a diet, so I don't eat cake.",
          'Estoy a dieta, así que no como pastel.',
          'Je suis au régime, donc je ne mange pas de gâteau.',
          'Estou de dieta, então não como bolo.',
          'ฉันกำลังลดน้ำหนัก เลยไม่กินเค้ก',
          'Saya sedang diet, jadi tidak makan kue.',
          'Tôi đang ăn kiêng nên không ăn bánh.',
          'ダイエット中なのでケーキを食べません。',
        ),
        why: L(
          "Choosing not to (diet) → 안 (don't); 못 would wrongly mean physically unable to eat cake.",
          'Es una elección (dieta) → 안; 못 significaría no poder físicamente.',
          "C'est un choix (régime) → 안 ; 못 voudrait dire en être incapable.",
          'É uma escolha (dieta) → 안; 못 significaria ser incapaz.',
          'เลือกเอง (ลดน้ำหนัก) → 안; 못 จะแปลว่ากินไม่ได้',
          'Pilihan sendiri (diet) → 안; 못 berarti tidak mampu.',
          'Do lựa chọn (ăn kiêng) → 안; 못 nghĩa là không thể.',
          '意志（ダイエット）→ 안。못 だと食べられない意味になる。',
        ),
      },
    ],
  },
]

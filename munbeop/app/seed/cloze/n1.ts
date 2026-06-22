import type { ClozeItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-1 grammar-pattern cloze items (choose the pattern that fits the blank).
 * Starter batch — expanded to the full TOPIK-1 set + Step-7 conversions by the
 * Step 9 content Workflow. ko matches grammars-n1.ts verbatim.
 * Drafted + Korean-lens adversarially verified (single-correct-answer crux).
 * Korean wife native review = documented final gate.
 */
export const N1_CLOZE: ClozeItem[] = [
  {
    ko: '-고 싶다',
    sentence: '주말에 영화를 {} 싶어요.',
    answer: '보고',
    distractors: ['봐서', '보지만', '보면'],
    trans: L(
      'I want to watch a movie this weekend.',
      'Quiero ver una película el fin de semana.',
      'Je veux regarder un film ce week-end.',
      'Quero ver um filme no fim de semana.',
      'สุดสัปดาห์นี้ฉันอยากดูหนัง',
      'Akhir pekan ini saya ingin menonton film.',
      'Cuối tuần tôi muốn xem phim.',
      '週末に映画を見たいです。',
    ),
    why: L(
      'Only -고 chains with 싶다 to mean "want to": 보고 싶어요. -아/어서/-지만/-(으)면 cannot precede 싶다.',
      'Solo -고 se une a 싶다 para "querer": 보고 싶어요. -아/어서/-지만/-(으)면 no pueden ir antes de 싶다.',
      'Seul -고 s\'unit à 싶다 pour « vouloir » : 보고 싶어요. -아/어서/-지만/-(으)면 ne peuvent précéder 싶다.',
      'Só -고 liga-se a 싶다 para "querer": 보고 싶어요. -아/어서/-지만/-(으)면 não podem vir antes de 싶다.',
      'มีแค่ -고 ที่ต่อกับ 싶다 เพื่อสื่อ "อยาก": 보고 싶어요 ส่วน -아/어서/-지만/-(으)면 ใช้นำหน้า 싶다 ไม่ได้',
      'Hanya -고 yang menyambung ke 싶다 untuk makna "ingin": 보고 싶어요. -아/어서/-지만/-(으)면 tidak bisa mendahului 싶다.',
      'Chỉ -고 mới ghép với 싶다 để diễn đạt "muốn": 보고 싶어요. -아/어서/-지만/-(으)면 không thể đứng trước 싶다.',
      '「~したい」は-고だけが싶다に接続：보고 싶어요。-아/어서/-지만/-(으)면は싶다の前に置けない。',
    ),
  },
  {
    ko: '-았/었어요',
    sentence: '어제 친구를 {}.',
    answer: '만났어요',
    distractors: ['만나요', '만날 거예요', '만나세요'],
    trans: L(
      'I met a friend yesterday.',
      'Ayer me encontré con un amigo.',
      'Hier j\'ai rencontré un ami.',
      'Ontem encontrei um amigo.',
      'เมื่อวานฉันเจอเพื่อน',
      'Kemarin saya bertemu teman.',
      'Hôm qua tôi đã gặp một người bạn.',
      '昨日友だちに会いました。',
    ),
    why: L(
      '어제 (yesterday) forces the past -았/었어요 → 만났어요; present 만나요, future 만날 거예요, and the request 만나세요 all clash with the past-time cue.',
      '어제 (ayer) exige el pasado -았/었어요 → 만났어요; el presente 만나요, el futuro 만날 거예요 y el ruego 만나세요 chocan con la marca de pasado.',
      '어제 (hier) impose le passé -았/었어요 → 만났어요 ; le présent 만나요, le futur 만날 거예요 et la demande 만나세요 contredisent le repère passé.',
      '어제 (ontem) exige o passado -았/었어요 → 만났어요; o presente 만나요, o futuro 만날 거예요 e o pedido 만나세요 contrariam a marca de passado.',
      '어제 (เมื่อวาน) บังคับรูปอดีต -았/었어요 → 만났어요; ปัจจุบัน 만나요 อนาคต 만날 거예요 และคำขอ 만나세요 ขัดกับคำบอกเวลาอดีต',
      '어제 (kemarin) menuntut bentuk lampau -았/었어요 → 만났어요; 만나요 (kini), 만날 거예요 (nanti), 만나세요 (permintaan) bertentangan dengan penanda lampau.',
      '어제 (hôm qua) buộc dùng quá khứ -았/었어요 → 만났어요; hiện tại 만나요, tương lai 만날 거예요, lời nhờ 만나세요 đều mâu thuẫn với mốc quá khứ.',
      '어제（昨日）は過去-았/었어요 → 만났어요を要求。現在만나요・未来만날 거예요・依頼만나세요は過去の時間語と矛盾。',
    ),
  },
]

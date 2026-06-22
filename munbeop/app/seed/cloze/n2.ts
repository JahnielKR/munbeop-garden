import type { ClozeItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-2 grammar-pattern cloze items. ko matches grammars-n2.ts verbatim.
 * Starter batch — expanded by the Step 9 content Workflow. Korean-lens verified;
 * Korean wife native review = documented final gate.
 */
export const N2_CLOZE: ClozeItem[] = [
  {
    ko: '-(으)ㄹ 거예요',
    sentence: '내일은 집에서 {}.',
    answer: '쉴 거예요',
    distractors: ['쉬었어요', '쉬세요', '쉬고 있어요'],
    trans: L(
      'Tomorrow I will rest at home.',
      'Mañana voy a descansar en casa.',
      'Demain je vais me reposer à la maison.',
      'Amanhã vou descansar em casa.',
      'พรุ่งนี้ฉันจะพักผ่อนที่บ้าน',
      'Besok saya akan beristirahat di rumah.',
      'Ngày mai tôi sẽ nghỉ ở nhà.',
      '明日は家で休むつもりです。',
    ),
    why: L(
      '내일 (tomorrow) forces the future -(으)ㄹ 거예요 → 쉴 거예요; past 쉬었어요, request 쉬세요, and progressive 쉬고 있어요 all clash with the future cue.',
      '내일 (mañana) exige el futuro -(으)ㄹ 거예요 → 쉴 거예요; el pasado 쉬었어요, el ruego 쉬세요 y el progresivo 쉬고 있어요 chocan con la marca de futuro.',
      '내일 (demain) impose le futur -(으)ㄹ 거예요 → 쉴 거예요 ; le passé 쉬었어요, la demande 쉬세요 et le progressif 쉬고 있어요 contredisent le repère futur.',
      '내일 (amanhã) exige o futuro -(으)ㄹ 거예요 → 쉴 거예요; o passado 쉬었어요, o pedido 쉬세요 e o progressivo 쉬고 있어요 contrariam a marca de futuro.',
      '내일 (พรุ่งนี้) บังคับรูปอนาคต -(으)ㄹ 거예요 → 쉴 거예요; อดีต 쉬었어요 คำขอ 쉬세요 และรูปกำลังทำ 쉬고 있어요 ขัดกับคำบอกเวลาอนาคต',
      '내일 (besok) menuntut bentuk akan datang -(으)ㄹ 거예요 → 쉴 거예요; lampau 쉬었어요, permintaan 쉬세요, progresif 쉬고 있어요 bertentangan dengan penanda masa depan.',
      '내일 (ngày mai) buộc dùng tương lai -(으)ㄹ 거예요 → 쉴 거예요; quá khứ 쉬었어요, lời nhờ 쉬세요, tiếp diễn 쉬고 있어요 mâu thuẫn với mốc tương lai.',
      '내일（明日）は未来-(으)ㄹ 거예요 → 쉴 거예요を要求。過去쉬었어요・依頼쉬세요・進行쉬고 있어요は未来の時間語と矛盾。',
    ),
  },
  {
    ko: '-고 있다',
    sentence: '지금 동생이 숙제를 {}.',
    answer: '하고 있어요',
    distractors: ['했어요', '할 거예요', '하세요'],
    trans: L(
      'My younger sibling is doing homework right now.',
      'Ahora mismo mi hermano menor está haciendo la tarea.',
      'En ce moment mon cadet fait ses devoirs.',
      'Agora meu irmão mais novo está fazendo a lição.',
      'ตอนนี้น้องกำลังทำการบ้าน',
      'Sekarang adik saya sedang mengerjakan PR.',
      'Bây giờ em tôi đang làm bài tập.',
      '今、弟が宿題をしています。',
    ),
    why: L(
      '지금 (right now) forces the progressive -고 있다 → 하고 있어요; past 했어요, future 할 거예요, and request 하세요 clash with the ongoing-now cue.',
      '지금 (ahora mismo) exige el progresivo -고 있다 → 하고 있어요; el pasado 했어요, el futuro 할 거예요 y el ruego 하세요 chocan con la marca de acción en curso.',
      '지금 (en ce moment) impose le progressif -고 있다 → 하고 있어요 ; le passé 했어요, le futur 할 거예요 et la demande 하세요 contredisent le repère « en cours ».',
      '지금 (agora) exige o progressivo -고 있다 → 하고 있어요; o passado 했어요, o futuro 할 거예요 e o pedido 하세요 contrariam a marca de ação em curso.',
      '지금 (ตอนนี้) บังคับรูปกำลังทำ -고 있다 → 하고 있어요; อดีต 했어요 อนาคต 할 거예요 และคำขอ 하세요 ขัดกับคำบอกว่ากำลังเกิดขึ้น',
      '지금 (sekarang) menuntut progresif -고 있다 → 하고 있어요; lampau 했어요, masa depan 할 거예요, permintaan 하세요 bertentangan dengan penanda sedang berlangsung.',
      '지금 (bây giờ) buộc dùng tiếp diễn -고 있다 → 하고 있어요; quá khứ 했어요, tương lai 할 거예요, lời nhờ 하세요 mâu thuẫn với mốc đang diễn ra.',
      '지금（今）は進行-고 있다 → 하고 있어요を要求。過去했어요・未来할 거예요・依頼하세요は進行中の時間語と矛盾。',
    ),
  },
]

import type { GrammarExample } from '~/lib/domain'
import { L } from '../locale'

/** TOPIK-1 grammar examples. ko values match grammars-n1.ts verbatim. */
export const TOPIK_1_EXAMPLES: GrammarExample[] = [
  {
    ko: '-아/어요',
    sentence: '저는 매일 학교에 가요.',
    trans: L(
      'I go to school every day.',
      'Voy a la escuela todos los días.',
      "Je vais à l'école tous les jours.",
      'Eu vou para a escola todos os dias.',
      'ฉันไปโรงเรียนทุกวัน',
      'Saya pergi ke sekolah setiap hari.',
      'Tôi đi học mỗi ngày.',
      '私は毎日学校に行きます。',
    ),
    level: 'polite',
  },
]

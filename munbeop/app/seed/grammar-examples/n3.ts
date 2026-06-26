import type { GrammarExample } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-3 grammar examples (plan Part B Tier-1, level 3). Per-FORM coverage for
 * the two-form TOPIK-3 grammars: each grammar whose `ko` names ≥2 distinct
 * surface forms shows ≥1 example per form. `ko` values match grammars-n3.ts
 * verbatim; sentences differ from each grammar's canonical `Grammar.example`.
 *
 * Drafted + Korean-lens adversarially verified by a multi-agent workflow.
 * Native (Korean wife) review is the documented final gate.
 */
export const TOPIK_3_EXAMPLES: GrammarExample[] = [
  {
    ko: '-(으)ㄴ/는 줄 알다/몰랐다',
    sentence: '불이 꺼져 있어서 아무도 없는 줄 알았어요.',
    trans: L(
      'The lights were off, so I thought nobody was here.',
      'Como las luces estaban apagadas, pensé que no había nadie.',
      "Comme les lumières étaient éteintes, je croyais qu'il n'y avait personne.",
      'As luzes estavam apagadas, então pensei que não tinha ninguém.',
      'ไฟดับอยู่ ฉันก็เลยนึกว่าไม่มีใครอยู่',
      'Lampunya mati, jadi kukira tidak ada orang.',
      'Đèn tắt nên tôi cứ tưởng không có ai ở đây.',
      '電気が消えていたので、誰もいないと思っていました。',
    ),
    level: 'polite',
  },
  {
    ko: '-(으)ㄴ/는 줄 알다/몰랐다',
    sentence: '네가 매운 음식을 못 먹는 줄 몰랐어.',
    trans: L(
      "I didn't realize you can't eat spicy food.",
      'No sabía que no podías comer comida picante.',
      'Je ne savais pas que tu ne pouvais pas manger épicé.',
      'Eu não sabia que você não conseguia comer comida picante.',
      'ฉันไม่รู้เลยว่าเธอกินเผ็ดไม่ได้',
      'Aku nggak tahu kalau kamu nggak bisa makan pedas.',
      'Tớ không biết là cậu không ăn được đồ cay.',
      '君が辛い物を食べられないなんて知らなかったよ。',
    ),
    level: 'casual',
  },
  {
    ko: '-(으)ㄹ 줄 알다/모르다',
    sentence: '제 동생은 자전거를 탈 줄 알아요.',
    trans: L(
      'My younger brother knows how to ride a bicycle.',
      'Mi hermano menor sabe andar en bicicleta.',
      'Mon petit frère sait faire du vélo.',
      'Meu irmão mais novo sabe andar de bicicleta.',
      'น้องชายของฉันขี่จักรยานเป็น',
      'Adik laki-laki saya bisa naik sepeda.',
      'Em trai tôi biết đi xe đạp.',
      '私の弟は自転車に乗れます。',
    ),
    level: 'polite',
  },
  {
    ko: '-(으)ㄹ 줄 알다/모르다',
    sentence: '저는 아직 운전할 줄 몰라요.',
    trans: L(
      "I still don't know how to drive.",
      'Todavía no sé conducir.',
      'Je ne sais pas encore conduire.',
      'Eu ainda não sei dirigir.',
      'ฉันยังขับรถไม่เป็น',
      'Saya masih belum bisa menyetir.',
      'Tôi vẫn chưa biết lái xe.',
      '私はまだ運転できません。',
    ),
    level: 'polite',
  },
  {
    ko: '-기 위해(서) / -을/를 위해(서)',
    sentence: '한국어 시험에 합격하기 위해서 매일 단어를 외워요.',
    trans: L(
      'I memorize vocabulary every day in order to pass the Korean exam.',
      'Memorizo vocabulario todos los días para aprobar el examen de coreano.',
      "Je mémorise du vocabulaire chaque jour pour réussir l'examen de coréen.",
      'Memorizo vocabulário todos os dias para passar no exame de coreano.',
      'ฉันท่องศัพท์ทุกวันเพื่อที่จะสอบภาษาเกาหลีให้ผ่าน',
      'Saya menghafal kosakata setiap hari untuk lulus ujian bahasa Korea.',
      'Tôi học thuộc từ vựng mỗi ngày để thi đỗ kỳ thi tiếng Hàn.',
      '韓国語の試験に合格するために毎日単語を覚えています。',
    ),
    level: 'polite',
  },
  {
    ko: '-기 위해(서) / -을/를 위해(서)',
    sentence: '부모님을 위해서 작은 선물을 준비했어요.',
    trans: L(
      'I prepared a small gift for my parents.',
      'Preparé un pequeño regalo para mis padres.',
      "J'ai préparé un petit cadeau pour mes parents.",
      'Preparei um pequeno presente para os meus pais.',
      'ฉันเตรียมของขวัญชิ้นเล็ก ๆ ไว้สำหรับพ่อแม่',
      'Saya menyiapkan hadiah kecil untuk orang tua saya.',
      'Tôi đã chuẩn bị một món quà nhỏ cho bố mẹ.',
      '両親のために小さなプレゼントを用意しました。',
    ),
    level: 'polite',
  },
  {
    ko: '-는다면 / -(이)라면',
    sentence: '복권에 당첨된다면 제일 먼저 부모님께 집을 사 드리고 싶어요.',
    trans: L(
      "If I won the lottery, the first thing I'd want to do is buy my parents a house.",
      'Si me tocara la lotería, lo primero que querría hacer es comprarles una casa a mis padres.',
      "Si je gagnais à la loterie, la première chose que je voudrais faire serait d'acheter une maison à mes parents.",
      'Se eu ganhasse na loteria, a primeira coisa que eu gostaria de fazer seria comprar uma casa para os meus pais.',
      'ถ้าฉันถูกลอตเตอรี่ สิ่งแรกที่อยากทำคือซื้อบ้านให้พ่อแม่',
      'Kalau aku menang lotre, hal pertama yang ingin kulakukan adalah membelikan rumah untuk orang tuaku.',
      'Nếu trúng số, điều đầu tiên tôi muốn làm là mua nhà cho bố mẹ.',
      '宝くじが当たったら、まず最初に両親に家を買ってあげたいです。',
    ),
    level: 'polite',
  },
  {
    ko: '-는다면 / -(이)라면',
    sentence: '제가 사장이라면 직원들에게 휴가를 더 많이 줄 거예요.',
    trans: L(
      "If I were the boss, I'd give the employees a lot more vacation time.",
      'Si yo fuera el jefe, les daría muchas más vacaciones a los empleados.',
      "Si j'étais le patron, je donnerais beaucoup plus de congés aux employés.",
      'Se eu fosse o chefe, daria muito mais férias aos funcionários.',
      'ถ้าฉันเป็นเจ้านาย ฉันจะให้วันหยุดกับพนักงานมากกว่านี้',
      'Kalau aku jadi bos, aku akan memberi karyawan lebih banyak cuti.',
      'Nếu tôi là sếp, tôi sẽ cho nhân viên nhiều ngày nghỉ phép hơn.',
      'もし私が社長なら、社員にもっとたくさん休暇をあげるでしょう。',
    ),
    level: 'polite',
  },
]

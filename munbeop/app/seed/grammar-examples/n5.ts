import type { GrammarExample } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-5 grammar examples (plan Part B Tier-1, level 5). Per-FORM coverage for
 * the multi-form TOPIK-5 grammars: each grammar whose `ko` names ≥2 distinct
 * surface forms shows ≥1 example per form. `ko` values match grammars-n5.ts
 * verbatim; sentences differ from each grammar's canonical `Grammar.example`.
 *
 * Drafted + Korean-lens adversarially verified by a multi-agent workflow.
 * Native (Korean wife) review is the documented final gate.
 */
export const TOPIK_5_EXAMPLES: GrammarExample[] = [
  {
    ko: '-(으)ㄴ/는 듯하다 / 듯싶다',
    sentence: '불이 다 꺼진 걸 보니 가족들이 벌써 잠든 듯해요.',
    trans: L(
      'Seeing that all the lights are off, it seems the family has already gone to sleep.',
      'Viendo que todas las luces están apagadas, parece que la familia ya se durmió.',
      'Vu que toutes les lumières sont éteintes, il semble que la famille dort déjà.',
      'Vendo que todas as luzes estão apagadas, parece que a família já dormiu.',
      'เห็นว่าไฟดับหมดแล้ว ดูเหมือนว่าคนในครอบครัวคงนอนหลับกันไปแล้ว',
      'Melihat semua lampu sudah mati, sepertinya keluarga sudah tidur.',
      'Thấy đèn đã tắt hết, có vẻ như cả nhà đã ngủ rồi.',
      '電気が全部消えているのを見ると、家族はもう寝てしまったようです。',
    ),
    level: 'polite',
  },
  {
    ko: '-(으)ㄴ/는 듯하다 / 듯싶다',
    sentence: '그 식당은 평일인데도 줄이 긴 걸 보면 꽤 유명한 듯싶어요.',
    trans: L(
      "Given the long line even on a weekday, that restaurant seems to be quite famous, I'd guess.",
      'Viendo la cola tan larga incluso entre semana, diría que ese restaurante es bastante famoso.',
      "Vu la longue file même en semaine, j'ai l'impression que ce restaurant est assez célèbre.",
      'Pela fila tão longa mesmo em dia de semana, me parece que esse restaurante é bem famoso.',
      'ดูจากที่คนต่อแถวยาวทั้งที่เป็นวันธรรมดา ร้านนั้นน่าจะดังพอสมควรเลยล่ะ',
      'Melihat antrean yang panjang padahal hari kerja, sepertinya restoran itu cukup terkenal.',
      'Nhìn hàng người xếp dài dù là ngày thường, tôi đoán quán đó khá nổi tiếng.',
      '平日なのに行列が長いのを見ると、あの店はかなり有名なようですね。',
    ),
    level: 'polite',
  },
  {
    ko: '-다고 할까 봐 / -다고 할 줄 알았다',
    sentence: '친구가 약속을 잊었다고 할까 봐 미리 문자를 보냈어요.',
    trans: L(
      "I texted in advance, afraid my friend might say he'd forgotten about our plans.",
      'Le mandé un mensaje por adelantado, por miedo a que mi amigo dijera que se había olvidado de la cita.',
      "J'ai envoyé un message à l'avance, de peur que mon ami dise qu'il avait oublié notre rendez-vous.",
      'Mandei uma mensagem com antecedência, com medo de que meu amigo dissesse que tinha esquecido do compromisso.',
      'ฉันส่งข้อความไว้ล่วงหน้า เพราะกลัวว่าเพื่อนจะบอกว่าลืมนัด',
      'Saya kirim pesan lebih dulu, khawatir teman saya bilang dia lupa janji kami.',
      'Tôi nhắn tin trước, vì sợ bạn tôi sẽ nói là đã quên mất cuộc hẹn.',
      '友達が約束を忘れたと言うかと思って、前もってメッセージを送りました。',
    ),
    level: 'polite',
  },
  {
    ko: '-다고 할까 봐 / -다고 할 줄 알았다',
    sentence: '네가 또 바쁘다고 할 줄 알았어.',
    trans: L(
      "I knew you'd say you were busy again.",
      'Ya sabía que dirías que estabas ocupado otra vez.',
      'Je savais que tu dirais encore que tu étais occupé.',
      'Eu já sabia que você ia dizer que estava ocupado de novo.',
      'ฉันรู้อยู่แล้วว่าเธอจะบอกอีกว่ายุ่ง',
      'Sudah kuduga kamu bakal bilang sibuk lagi.',
      'Tôi đã biết là cậu lại nói rằng mình bận mà.',
      'あなたがまた忙しいって言うだろうと思ってた。',
    ),
    level: 'casual',
  },
  {
    ko: '-다는데 / -다더라 / -다더니',
    sentence: '내일 비가 많이 온다는데 우산 챙기는 게 좋겠어요.',
    trans: L(
      "They say it's going to rain a lot tomorrow, so you'd better bring an umbrella.",
      'Dicen que mañana va a llover mucho, así que mejor lleva un paraguas.',
      "On dit qu'il va beaucoup pleuvoir demain, alors tu ferais mieux de prendre un parapluie.",
      'Dizem que vai chover muito amanhã, então é melhor você levar um guarda-chuva.',
      'เขาว่ากันว่าพรุ่งนี้ฝนจะตกหนัก เพราะฉะนั้นเอาร่มไปด้วยจะดีกว่านะ',
      'Katanya besok hujannya bakal deras, jadi lebih baik kamu bawa payung.',
      'Nghe nói ngày mai mưa to lắm, nên bạn mang theo ô thì hơn.',
      '明日は雨がたくさん降るそうだから、傘を持っていったほうがいいですよ。',
    ),
    level: 'polite',
  },
  {
    ko: '-다는데 / -다더라 / -다더니',
    sentence: '그 영화 진짜 무섭다더라, 혼자 보지 마.',
    trans: L(
      "I heard that movie is really scary — don't watch it alone.",
      'Oí que esa película da mucho miedo, no la veas solo.',
      "J'ai entendu dire que ce film fait vraiment peur, ne le regarde pas tout seul.",
      'Ouvi dizer que esse filme é muito assustador, não assista sozinho.',
      'ได้ยินมาว่าหนังเรื่องนั้นน่ากลัวมากเลยนะ อย่าดูคนเดียวล่ะ',
      'Katanya film itu serem banget loh, jangan nonton sendirian.',
      'Nghe nói phim đó đáng sợ lắm đấy, đừng xem một mình.',
      'あの映画、めっちゃ怖いんだってさ、一人で見ないでね。',
    ),
    level: 'casual',
  },
  {
    ko: '-다는데 / -다더라 / -다더니',
    sentence: '오늘 하루 종일 안 바쁘다더니 왜 이렇게 연락이 안 됐어?',
    trans: L(
      "You said you weren't busy all day, so why couldn't I reach you?",
      'Dijiste que no estabas nada ocupado en todo el día, ¿y por qué no pude localizarte?',
      "Tu disais que tu n'étais pas occupé de toute la journée, alors pourquoi je n'ai pas pu te joindre ?",
      'Você disse que não estava nada ocupado o dia todo, então por que não consegui falar com você?',
      'บอกว่าทั้งวันไม่ได้ยุ่งนี่ แล้วทำไมถึงติดต่อไม่ได้เลยล่ะ',
      'Katanya seharian nggak sibuk, kok malah susah dihubungi?',
      'Cậu bảo cả ngày không bận mà, sao lại khó liên lạc thế?',
      '一日中忙しくないって言ってたのに、どうしてこんなに連絡がつかなかったの？',
    ),
    level: 'casual',
  },
  {
    ko: '-아/어 뵙다 / 봬요',
    sentence: '다음 주 월요일에 본사로 회장님을 직접 찾아 뵙겠습니다.',
    trans: L(
      'I will personally call on the chairman at the head office next Monday.',
      'El próximo lunes iré en persona a la sede a presentarme ante el presidente.',
      'Lundi prochain, je me rendrai en personne au siège pour rencontrer le président.',
      'Na próxima segunda-feira irei pessoalmente à matriz para me apresentar ao presidente.',
      'วันจันทร์หน้าผมจะไปพบท่านประธานด้วยตนเองที่สำนักงานใหญ่',
      'Senin depan saya akan datang sendiri ke kantor pusat untuk menghadap Bapak Ketua.',
      'Thứ Hai tuần sau tôi sẽ đích thân đến trụ sở chính để gặp chủ tịch.',
      '来週の月曜日に本社へ伺い、会長に直接お目にかかります。',
    ),
    level: 'formal',
  },
  {
    ko: '-아/어 뵙다 / 봬요',
    sentence: '부장님, 그럼 회의 끝나고 로비에서 봬요.',
    trans: L(
      "Then, sir, I'll see you in the lobby after the meeting.",
      'Entonces, jefe, nos vemos en el vestíbulo después de la reunión.',
      'Alors, chef, on se voit dans le hall après la réunion.',
      'Então, chefe, a gente se vê no saguão depois da reunião.',
      'หัวหน้า งั้นเดี๋ยวหลังประชุมเจอกันที่ล็อบบี้นะ',
      'Kalau begitu, Pak, sampai jumpa di lobi setelah rapat ya.',
      'Trưởng phòng ơi, vậy sau cuộc họp gặp ở sảnh nhé ạ.',
      '部長、では会議が終わったらロビーでお会いしましょう。',
    ),
    level: 'polite',
  },
  {
    ko: '-(으)며 살다 / 지내다',
    sentence: '할머니는 시골에서 작은 텃밭을 가꾸며 사세요.',
    trans: L(
      'Grandmother lives tending a small vegetable garden in the countryside.',
      'La abuela vive cultivando un pequeño huerto en el campo.',
      'Grand-mère vit en cultivant un petit potager à la campagne.',
      'A vovó vive cuidando de uma pequena horta no interior.',
      'คุณยายใช้ชีวิตด้วยการดูแลแปลงผักเล็ก ๆ อยู่ในชนบท',
      'Nenek menjalani hidupnya dengan merawat kebun sayur kecil di desa.',
      'Bà sống cuộc đời mình bằng việc chăm sóc một mảnh vườn rau nhỏ ở quê.',
      '祖母は田舎で小さな畑を育てながら暮らしていらっしゃいます。',
    ),
    level: 'polite',
  },
  {
    ko: '-(으)며 살다 / 지내다',
    sentence: '요즘은 매일 운동하며 건강하게 지내고 있어요.',
    trans: L(
      "These days I'm getting by in good health, exercising every day.",
      'Últimamente me las arreglo manteniéndome sano, haciendo ejercicio todos los días.',
      'Ces jours-ci, je passe mes journées en bonne santé en faisant du sport tous les jours.',
      'Ultimamente venho levando os dias com saúde, fazendo exercícios todos os dias.',
      'ช่วงนี้ฉันใช้ชีวิตอย่างมีสุขภาพดีด้วยการออกกำลังกายทุกวัน',
      'Akhir-akhir ini saya menjalani hari-hari dengan sehat sambil berolahraga setiap hari.',
      'Dạo này tôi sống khỏe mạnh qua ngày bằng việc tập thể dục mỗi ngày.',
      '最近は毎日運動しながら健康に過ごしています。',
    ),
    level: 'polite',
  },
]

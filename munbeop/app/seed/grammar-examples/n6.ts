import type { GrammarExample } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-6 grammar examples (plan Part B Tier-1, level 6). Per-FORM coverage for
 * the multi-form, literary/archaic TOPIK-6 grammars: each grammar whose `ko`
 * names ≥2 distinct surface forms shows ≥1 example per form. `ko` values match
 * grammars-n6.ts verbatim; sentences differ from each grammar's canonical
 * `Grammar.example`.
 *
 * Drafted + Korean-lens (literary) adversarially verified by a multi-agent
 * workflow. Native (Korean wife) review is the documented final gate — these
 * elevated/archaic endings especially warrant it.
 */
export const TOPIK_6_EXAMPLES: GrammarExample[] = [
  {
    ko: '-(으)련마는 / -(으)련만',
    sentence: '비가 흠뻑 내리면 메마른 논밭에 더없이 좋으련마는 하늘은 야속하게도 구름 한 점 내주지 않는구나.',
    trans: L(
      'If rain were to pour down it would surely be a blessing for the parched fields — yet the heavens, so unkind, will not yield even a single cloud.',
      'Si la lluvia cayera a cántaros sería sin duda una bendición para los campos resecos — mas el cielo, tan cruel, no concede ni una sola nube.',
      'Si la pluie tombait à verse, ce serait à coup sûr une bénédiction pour les champs desséchés — mais le ciel, si impitoyable, ne consent pas même un seul nuage.',
      'Se a chuva caísse em abundância seria sem dúvida uma bênção para os campos ressecados — mas o céu, tão cruel, não concede nem uma única nuvem.',
      'หากฝนหลั่งลงมาชุ่มฉ่ำ ย่อมเป็นพรอันประเสริฐแก่ไร่นาที่แห้งผาก แต่ฟากฟ้าช่างไร้เมตตา ไม่ยอมประทานแม้เพียงเมฆสักก้อน',
      'Andai hujan mencurah deras, sungguh itu akan menjadi berkah bagi ladang yang kering kerontang — namun langit, betapa kejamnya, tak sudi memberi seujung awan pun.',
      'Nếu mưa trút xuống dầm dề thì hẳn sẽ là phúc lành cho ruộng đồng khô cằn — nhưng trời cao, sao mà tàn nhẫn, chẳng chịu ban cho lấy một áng mây.',
      '雨がたっぷり降れば干からびた田畑にこの上なく良かろうものを、空はつれなくも一片の雲さえ恵んではくれぬのだ。',
    ),
    level: 'formal',
  },
  {
    ko: '-(으)련마는 / -(으)련만',
    sentence: '벗이 곁에 있다면 이 먼 길도 함께 가련만 홀로 떠나는 나그네의 발걸음이 한없이 무겁기만 하구나.',
    trans: L(
      'Were a friend at my side I would surely walk even this long road together — yet the steps of this wayfarer setting off alone weigh on me without end.',
      'Si un amigo estuviera a mi lado, recorrería sin duda junto a él incluso este largo camino, mas los pasos de este caminante que parte solo me pesan sin fin.',
      'Si un ami était à mes côtés, je parcourrais sûrement avec lui même cette longue route — mais les pas de ce voyageur qui s’en va seul me pèsent sans fin.',
      'Se um amigo estivesse a meu lado eu sem dúvida percorreria junto até esta longa estrada — mas os passos deste viajante que parte sozinho me pesam sem fim.',
      'หากมีสหายเคียงข้าง ถนนอันไกลโพ้นนี้ข้าก็คงร่วมเดินไปด้วยกัน แต่ย่างก้าวของผู้จรที่ออกเดินทางเพียงลำพังนี้กลับหนักอึ้งไม่รู้สิ้น',
      'Andai ada sahabat di sisiku, jalan sejauh ini pun tentu kutempuh bersama — namun langkah pengembara yang berangkat seorang diri ini terasa berat tiada habisnya.',
      'Nếu có bạn hữu bên cạnh thì con đường xa xôi này hẳn ta cũng cùng nhau cất bước — nhưng bước chân của kẻ lữ hành ra đi đơn độc này nặng trĩu khôn cùng.',
      '友が傍らにあれば、この遠い道もともに行こうものを、独り旅立つ旅人の足取りはどこまでも重いばかりだ。',
    ),
    level: 'formal',
  },
  {
    ko: '-건대 / 생각건대 / 바라건대',
    sentence: '듣건대, 그 고을의 백성들이 오랜 가뭄으로 큰 고초를 겪고 있다 하더이다.',
    trans: L(
      'As I hear it, the people of that district are said to be suffering greatly from a long drought.',
      'Según tengo entendido, dicen que los habitantes de aquella comarca padecen grandes penurias por una prolongada sequía.',
      "À ce que l'on entend dire, les habitants de cette contrée souffriraient grandement d'une longue sécheresse.",
      'Pelo que ouço dizer, conta-se que o povo daquela região padece imensamente por causa de uma longa seca.',
      'เท่าที่ได้ยินมา ว่ากันว่าราษฎรแห่งเมืองนั้นกำลังทุกข์ยากแสนสาหัสจากภัยแล้งอันยาวนาน',
      'Sebagaimana yang kudengar, konon rakyat di daerah itu tengah menderita hebat akibat kemarau panjang.',
      'Ta nghe nói dân chúng vùng ấy đang phải chịu cảnh khốn khổ vô cùng vì hạn hán kéo dài.',
      '聞くところによれば、その地の民は長き旱魃のために甚だしき苦しみを受けているとのことである。',
    ),
    level: 'formal',
  },
  {
    ko: '-건대 / 생각건대 / 바라건대',
    sentence: '생각건대, 나라의 흥망은 결국 백성의 마음을 얻느냐 잃느냐에 달려 있는 것이다.',
    trans: L(
      'On reflection, the rise and fall of a nation ultimately rests on whether one wins or loses the hearts of the people.',
      'Bien pensado, el auge y la caída de una nación dependen, al fin, de si se gana o se pierde el corazón del pueblo.',
      "Toute réflexion faite, la grandeur et la décadence d'une nation tiennent, en définitive, à ce que l'on gagne ou perde le cœur du peuple.",
      'Refletindo bem, a ascensão e a queda de uma nação dependem, no fim, de se conquistar ou perder o coração do povo.',
      'เมื่อพิเคราะห์ดูแล้ว ความรุ่งเรืองและล่มสลายของชาติบ้านเมืองนั้น สุดท้ายย่อมขึ้นอยู่กับว่าจะได้หรือเสียซึ่งใจของราษฎร',
      'Setelah kurenungkan, jaya dan runtuhnya suatu bangsa pada akhirnya bergantung pada apakah hati rakyat diraih atau hilang.',
      'Ngẫm cho kỹ, sự hưng vong của một nước rốt cuộc tùy thuộc ở chỗ được hay mất lòng dân.',
      '思うに、国の興亡は結局のところ、民の心を得るか失うかにかかっているのである。',
    ),
    level: 'formal',
  },
  {
    ko: '-건대 / 생각건대 / 바라건대',
    sentence: '바라건대, 이 땅에 다시는 그와 같은 비극이 되풀이되지 않기를.',
    trans: L(
      'Would that such a tragedy never be repeated upon this land again.',
      'Ojalá que nunca jamás se repita en esta tierra una tragedia semejante.',
      'Puisse une telle tragédie ne plus jamais se répéter sur cette terre.',
      'Oxalá tamanha tragédia jamais se repita outra vez sobre esta terra.',
      'ขอจงอย่าให้โศกนาฏกรรมเช่นนั้นหวนกลับมาเกิดซ้ำบนผืนแผ่นดินนี้อีกเลย',
      'Semoga tragedi seperti itu tak pernah lagi terulang di atas tanah ini.',
      'Mong sao thảm kịch như thế chẳng bao giờ còn tái diễn trên mảnh đất này nữa.',
      '願わくは、この地に二度と再びそのような悲劇が繰り返されることのなきように。',
    ),
    level: 'formal',
  },
  {
    ko: '-로다 / -(이)로다',
    sentence: '아, 이 강산이 천하의 절경이로구나… 참으로 빼어난 경치로다.',
    trans: L(
      'Ah, this land is the finest sight under heaven... truly, what splendid scenery it is!',
      'Ah, esta tierra es el paisaje más bello bajo el cielo... ¡en verdad, qué espléndido paisaje es!',
      'Ah, cette terre est le plus beau site sous le ciel... en vérité, quel paysage splendide !',
      'Ah, esta terra é a vista mais bela sob o céu... em verdade, que paisagem esplêndida!',
      'อา ดินแดนนี้คือทัศนียภาพงดงามที่สุดใต้หล้า... ช่างเป็นภูมิทัศน์อันวิจิตรเหลือเกินหนอ',
      'Ah, negeri ini adalah pemandangan terindah di kolong langit... sungguh, alangkah indahnya panorama ini!',
      'Ôi, dải non sông này là tuyệt cảnh đệ nhất thiên hạ... thật là một cảnh sắc tuyệt diệu thay!',
      'ああ、この山河は天下随一の絶景… まことに見事な景色であることよ。',
    ),
    level: 'formal',
  },
  {
    ko: '-로다 / -(이)로다',
    sentence: '오랜 세월을 견뎌 온 이 한 그루 소나무야말로 이 산의 주인이로다.',
    trans: L(
      'This lone pine, having endured the long ages, is the very master of this mountain!',
      '¡Este solitario pino, que ha resistido las largas eras, es el verdadero señor de esta montaña!',
      'Ce pin solitaire, qui a enduré les longs âges, est bien le maître de cette montagne !',
      'Este pinheiro solitário, que resistiu às longas eras, é o próprio senhor desta montanha!',
      'ต้นสนโดดเดี่ยวต้นนี้ ที่ทนผ่านกาลเวลาอันยาวนานมา คือเจ้าแห่งขุนเขาลูกนี้เองหนอ',
      'Pohon pinus tunggal ini, yang telah bertahan melintasi zaman yang panjang, sungguh tuan dari gunung ini!',
      'Cây tùng đơn độc này, đã chịu đựng qua bao năm tháng dài, chính là chủ nhân của ngọn núi này vậy!',
      '長き歳月を耐え抜いてきたこの一本の松こそ、この山の主であることよ。',
    ),
    level: 'formal',
  },
]

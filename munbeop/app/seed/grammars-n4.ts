import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 4 grammar — 32 entries aligned with `seed/topik-spine.json`
 * (spine ids in topik.4 + transversal G172–G185).
 *
 * Themes (in source order):
 *   1. Discurso indirecto (núcleo)         (5)
 *   2. Aditivas y contrastivas             (9)
 *   3. Causa con resultado inesperado      (2)
 *   4. Suposición y arrepentimiento        (4)
 *   5. Cambio, modos y conformidad         (5)
 *   6. Extremo, semejanza, formalidad      (3)
 *   7. Rol, instrumento, contrafactual     (4)
 */
export const TOPIK_4_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Discurso indirecto (núcleo)
  // ─────────────────────────────────────────────────────────────────────────

  // G089 · Indirect statement
  {
    ko: '-다고 하다',
    meaning: L(
      'indirect speech (statements) — "said that ..."; contracts to -대요 in casual speech',
      'discurso indirecto (afirmaciones) — "dijo que ..."; contracción coloquial -대요',
      'discours indirect (affirmations) — «a dit que ...»; contraction orale -대요',
      'discurso indireto (afirmações) — "disse que ..."; contração falada -대요',
      'การพูดอ้อม (บอกเล่า) — "บอกว่า ..."; รูปย่อ -대요',
      'kalimat tak langsung (pernyataan) — "katanya ..."; bentuk lisan -대요',
      'tường thuật gián tiếp — "nói rằng ..."; rút gọn -대요',
      '間接話法(平叙)「〜と言う」— 口語短縮 -대요',
    ),
    example: '선생님이 내일 시험이 있다고 했어요.',
    trans: L(
      'The teacher said there’s an exam tomorrow.',
      'El profesor dijo que mañana hay examen.',
      'Le professeur a dit qu’il y a un examen demain.',
      'O professor disse que amanhã tem prova.',
      'อาจารย์บอกว่าพรุ่งนี้มีสอบ',
      'Gurunya bilang besok ada ujian.',
      'Cô giáo nói ngày mai có bài kiểm tra.',
      '先生は明日試験があると言いました。',
    ),
    deckId: 'topik-4',
  },

  // G090 · Indirect command
  {
    ko: '-(으)라고 하다',
    meaning: L(
      'indirect command — "told (someone) to ..."; contracts to -(으)래요',
      'discurso indirecto de mandato — "le dijo que (haga) ..."; contracción -(으)래요',
      'discours indirect (ordre) — «a dit de ...»; contraction -(으)래요',
      'discurso indireto (ordem) — "mandou ..."; contração -(으)래요',
      'การพูดอ้อม (สั่ง) — "บอกให้ ..."; รูปย่อ -(으)래요',
      'kalimat tak langsung (perintah) — "menyuruh ..."; bentuk lisan -(으)래요',
      'mệnh lệnh gián tiếp — "bảo ... hãy ..."; rút gọn -(으)래요',
      '間接話法(命令)「〜しろと言う」— 口語短縮 -(으)래요',
    ),
    example: '선생님이 조용히 하라고 했어요.',
    trans: L(
      'The teacher told us to be quiet.',
      'El profesor nos dijo que guardáramos silencio.',
      'Le professeur nous a dit de nous taire.',
      'O professor mandou ficarmos em silêncio.',
      'อาจารย์บอกให้เงียบ',
      'Gurunya menyuruh kami diam.',
      'Cô giáo bảo chúng tôi giữ im lặng.',
      '先生は静かにしろと言いました。',
    ),
    deckId: 'topik-4',
  },

  // G091 · Indirect question
  {
    ko: '-냐고 하다 / -(으)냐고 묻다',
    meaning: L(
      'indirect question — "asked whether / what ..."; contracts to -냬요',
      'discurso indirecto de pregunta — "preguntó si / qué ..."; contracción -냬요',
      'discours indirect (question) — «a demandé si ...»; contraction -냬요',
      'discurso indireto (pergunta) — "perguntou se ..."; contração -냬요',
      'การพูดอ้อม (ถาม) — "ถามว่า ..."; รูปย่อ -냬요',
      'kalimat tak langsung (tanya) — "menanyakan apakah ..."; bentuk lisan -냬요',
      'câu hỏi gián tiếp — "hỏi liệu ..."; rút gọn -냬요',
      '間接話法(疑問)「〜かと聞く」— 口語短縮 -냬요',
    ),
    example: '어디에 사느냐고 물었어요.',
    trans: L(
      'They asked where I live.',
      'Me preguntó dónde vivía.',
      'Il/elle m’a demandé où j’habitais.',
      'Me perguntou onde eu morava.',
      'เขาถามว่าฉันอยู่ที่ไหน',
      'Dia menanyakan saya tinggal di mana.',
      'Người ấy hỏi tôi sống ở đâu.',
      'どこに住んでいるかと聞きました。',
    ),
    deckId: 'topik-4',
  },

  // G092 · Indirect suggestion
  {
    ko: '-자고 하다',
    meaning: L(
      'indirect suggestion — "proposed that (we) ..."; contracts to -재요',
      'discurso indirecto de propuesta — "propuso que (hagamos) ..."; contracción -재요',
      'discours indirect (proposition) — «a proposé de ...»; contraction -재요',
      'discurso indireto (sugestão) — "propôs que ..."; contração -재요',
      'การพูดอ้อม (ชวน) — "ชวนว่า ..."; รูปย่อ -재요',
      'kalimat tak langsung (ajakan) — "mengajak ..."; bentuk lisan -재요',
      'lời rủ gián tiếp — "rủ rằng ..."; rút gọn -재요',
      '間接話法(勧誘)「〜しようと言う」— 口語短縮 -재요',
    ),
    example: '친구가 같이 밥 먹자고 했어요.',
    trans: L(
      'My friend proposed that we eat together.',
      'Mi amigo propuso que comiéramos juntos.',
      'Mon ami(e) a proposé qu’on mange ensemble.',
      'Meu amigo propôs comermos juntos.',
      'เพื่อนชวนกินข้าวด้วยกัน',
      'Teman saya mengajak makan bersama.',
      'Bạn tôi rủ ăn cơm cùng nhau.',
      '友達が一緒にご飯を食べようと言いました。',
    ),
    deckId: 'topik-4',
  },

  // G177 · Hearsay confirmation
  {
    ko: '-다면서요?',
    meaning: L(
      '"I heard that ..., right?" — verifies info heard from another source',
      '"me dijeron que ..., ¿es cierto?" — verifica info de terceros',
      '«il paraît que ..., n’est-ce pas ?» — vérifie une info entendue',
      '"ouvi dizer que ..., é verdade?" — verifica info de terceiros',
      '"ได้ยินมาว่า ... จริงไหม?" — ยืนยันข่าวจากคนอื่น',
      '"katanya ..., benar?" — verifikasi info dari orang lain',
      '"nghe nói ... phải không?" — kiểm chứng tin nghe được',
      '「〜らしいですね？/ 〜だそうですね？」— 第三者情報の確認',
    ),
    example: '한국에 간다면서요?',
    trans: L(
      'I heard you’re going to Korea, is that right?',
      'Me dijeron que te vas a Corea, ¿es verdad?',
      'Il paraît que tu pars en Corée, c’est vrai ?',
      'Ouvi dizer que você vai para a Coreia, é isso?',
      'ได้ยินว่าจะไปเกาหลีจริงเหรอ',
      'Katanya kamu mau ke Korea, benar?',
      'Nghe nói bạn sắp đi Hàn Quốc phải không?',
      '韓国に行くんですって？',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Aditivas y contrastivas
  // ─────────────────────────────────────────────────────────────────────────

  // G080 · Not only ... but also
  {
    ko: '-(으)ㄹ 뿐만 아니라',
    meaning: L(
      '"not only ... but also" — adds an emphatic extra element',
      '"no solo ... sino también" — añade un elemento extra con énfasis',
      '«non seulement ... mais aussi»',
      '"não só ... como também"',
      '"ไม่เพียงแต่ ... ยัง ... อีกด้วย"',
      '"tidak hanya ... tetapi juga"',
      '"không chỉ ... mà còn ..."',
      '「〜だけでなく / 〜のみならず」',
    ),
    example: '그 식당은 맛있을 뿐만 아니라 가격도 저렴해요.',
    trans: L(
      'That restaurant is not only delicious but also affordable.',
      'Ese restaurante no solo es rico, sino que también es barato.',
      'Ce restaurant est non seulement bon mais aussi abordable.',
      'Aquele restaurante não só é gostoso, como também é barato.',
      'ร้านนั้นนอกจากอร่อยแล้ว ราคายังถูกอีกด้วย',
      'Restoran itu tidak hanya enak, harganya juga murah.',
      'Nhà hàng đó không chỉ ngon mà giá còn rẻ.',
      'あの店は美味しいだけでなく、値段も安いです。',
    ),
    deckId: 'topik-4',
  },

  // G081 · Whereas / on the other hand
  {
    ko: '-는 반면에',
    meaning: L(
      '"whereas / on the other hand ..." — contrast between two related facts',
      '"mientras que / en cambio ..." — contraste entre dos hechos relacionados',
      '«tandis que / en revanche»',
      '"enquanto que / por outro lado"',
      '"ในขณะที่ / กลับกัน ..."',
      '"sementara itu / sebaliknya ..."',
      '"trong khi đó / ngược lại ..."',
      '「〜反面 / 〜の一方で」',
    ),
    example: '언니는 활발한 반면에 저는 조용해요.',
    trans: L(
      'My older sister is outgoing, whereas I’m quiet.',
      'Mi hermana mayor es activa, mientras que yo soy tranquilo.',
      'Ma sœur aînée est dynamique, tandis que moi je suis calme.',
      'Minha irmã mais velha é animada, enquanto eu sou quieto.',
      'พี่สาวเป็นคนร่าเริง ในขณะที่ฉันเป็นคนเงียบ ๆ',
      'Kakak perempuan saya periang, sementara saya pendiam.',
      'Chị tôi hoạt bát, ngược lại tôi trầm tính.',
      '姉は活発な反面、私は静かです。',
    ),
    deckId: 'topik-4',
  },

  // G082 · Despite (formal)
  {
    ko: '-에도 불구하고',
    meaning: L(
      '"in spite of / despite ..." — formal concession; common in writing',
      '"a pesar de / pese a ..." — concesión formal; frecuente en escritura',
      '«malgré / en dépit de»',
      '"apesar de / a despeito de"',
      '"แม้จะ ... ก็ตาม / ทั้งที่ ..."',
      '"meskipun demikian / kendati"',
      '"bất chấp / mặc dù vậy"',
      '「〜にもかかわらず」— 改まり',
    ),
    example: '비에도 불구하고 많은 사람들이 모였어요.',
    trans: L(
      'Despite the rain, many people gathered.',
      'A pesar de la lluvia, se reunió mucha gente.',
      'Malgré la pluie, beaucoup de gens se sont réunis.',
      'Apesar da chuva, muita gente se reuniu.',
      'แม้ฝนจะตก ก็มีคนมารวมตัวกันมากมาย',
      'Meskipun hujan, banyak orang berkumpul.',
      'Bất chấp trời mưa, rất đông người tụ tập.',
      '雨にもかかわらず、たくさんの人が集まりました。',
    ),
    deckId: 'topik-4',
  },

  // G083 · The more ..., the more ...
  {
    ko: '-(으)ㄹ수록',
    meaning: L(
      '"the more ..., the more ..." — proportional; often with 더',
      '"cuanto más ..., más ..." — proporcional; suele con 더',
      '«plus ..., plus ...» — corrélation, souvent avec 더',
      '"quanto mais ..., mais ..." — proporcional; muitas vezes com 더',
      '"ยิ่ง ... ยิ่ง ..." — มักใช้กับ 더',
      '"semakin ..., semakin ..." — sering dengan 더',
      '"càng ..., càng ..." — thường đi với 더',
      '「〜ば〜ほど」',
    ),
    example: '한국어는 공부할수록 재미있어요.',
    trans: L(
      'The more I study Korean, the more fun it gets.',
      'Cuanto más estudio coreano, más divertido me resulta.',
      'Plus j’étudie le coréen, plus c’est intéressant.',
      'Quanto mais estudo coreano, mais divertido fica.',
      'ภาษาเกาหลียิ่งเรียนยิ่งสนุก',
      'Bahasa Korea semakin dipelajari semakin seru.',
      'Tiếng Hàn càng học càng thú vị.',
      '韓国語は勉強すればするほど面白いです。',
    ),
    deckId: 'topik-4',
  },

  // G084 · As long as / to the extent that
  {
    ko: '-는 한',
    meaning: L(
      '"as long as / to the extent that ..." — sets a valid scope',
      '"siempre que / mientras / en la medida en que ..." — establece un alcance',
      '«tant que / dans la mesure où»',
      '"enquanto / na medida em que"',
      '"ตราบเท่าที่ / เท่าที่ ..."',
      '"selama / sejauh ..."',
      '"chừng nào còn ... / trong chừng mực ..."',
      '「〜限り / 〜する限り」',
    ),
    example: '가능한 한 빨리 와 주세요.',
    trans: L(
      'Please come as soon as you can.',
      'Por favor, venga lo antes posible.',
      'Venez aussi vite que possible.',
      'Por favor, venha o mais rápido possível.',
      'กรุณามาให้เร็วที่สุดเท่าที่จะทำได้',
      'Tolong datang secepat mungkin.',
      'Vui lòng đến càng sớm càng tốt.',
      '可能な限り早く来てください。',
    ),
    deckId: 'topik-4',
  },

  // G088 · On top of / besides
  {
    ko: '-(으)ㄴ/는 데다가',
    meaning: L(
      '"on top of / besides ..." — adds a same-polarity fact (good+good or bad+bad)',
      '"además / encima de eso ..." — suma hechos del mismo signo',
      '«en plus de / qui plus est»',
      '"além disso / por cima de"',
      '"นอกจาก ... แล้ว ยัง ..."',
      '"selain ..., juga ..."',
      '"hơn nữa / thêm vào đó"',
      '「〜うえに / 〜に加えて」— 同じ極性の追加',
    ),
    example: '비가 오는 데다가 바람도 강해요.',
    trans: L(
      'On top of raining, the wind is strong too.',
      'Además de que llueve, también hace mucho viento.',
      'En plus de pleuvoir, le vent est fort.',
      'Além de chover, o vento também está forte.',
      'นอกจากฝนตกแล้ว ลมยังแรงอีก',
      'Selain hujan, anginnya juga kencang.',
      'Trời mưa, hơn nữa gió còn mạnh.',
      '雨が降っているうえに風も強いです。',
    ),
    deckId: 'topik-4',
  },

  // G179 · Not only ... but also (formal)
  {
    ko: '-(으)ㄹ 뿐더러',
    meaning: L(
      '"not only ... but also (formal)" — written/literary version of -(으)ㄹ 뿐만 아니라',
      '"no solo ... sino además (formal)" — versión escrita de -(으)ㄹ 뿐만 아니라',
      '«non seulement ... mais en plus» (registre soutenu)',
      '"não só ... como também (formal)"',
      '"ไม่เพียงแต่ ... ยัง ... (ทางการ)"',
      '"tidak hanya ... bahkan juga (formal)"',
      '"không chỉ ... mà còn ... (trang trọng)"',
      '「〜のみならず / 〜だけでなく(改まり)」',
    ),
    example: '그 제품은 품질이 좋을 뿐더러 가격도 합리적이에요.',
    trans: L(
      'That product not only has good quality but also a reasonable price.',
      'Ese producto no solo tiene buena calidad, sino que además el precio es razonable.',
      'Ce produit a non seulement une bonne qualité mais aussi un prix raisonnable.',
      'Esse produto não só tem boa qualidade como também preço razoável.',
      'สินค้านั้นนอกจากคุณภาพดีแล้ว ราคายังสมเหตุสมผล',
      'Produk itu kualitasnya bagus, harga pun masuk akal.',
      'Sản phẩm đó không chỉ chất lượng tốt mà giá còn hợp lý.',
      'その製品は品質が良いのみならず価格も合理的です。',
    ),
    deckId: 'topik-4',
  },

  // G180 · On the one hand / meanwhile
  {
    ko: '-(으)ㄴ/는 한편',
    meaning: L(
      '"on the one hand / meanwhile ..." — two simultaneous aspects of one situation',
      '"por un lado / mientras tanto ..." — dos aspectos simultáneos',
      '«d’une part / parallèlement»',
      '"por um lado / ao mesmo tempo"',
      '"ในด้านหนึ่ง / ในขณะเดียวกัน ..."',
      '"di satu sisi / sementara itu ..."',
      '"một mặt / đồng thời ..."',
      '「〜一方で / 〜と同時に」',
    ),
    example: '도시는 발전하는 한편 환경 문제도 심각해졌어요.',
    trans: L(
      'On the one hand the city develops; on the other, environmental problems have worsened.',
      'Por un lado la ciudad se ha desarrollado; al mismo tiempo, los problemas ambientales se agravaron.',
      'D’une part la ville se développe ; d’autre part, les problèmes environnementaux s’aggravent.',
      'Por um lado a cidade se desenvolve; ao mesmo tempo, os problemas ambientais pioraram.',
      'เมืองพัฒนาขึ้น ขณะเดียวกันปัญหาสิ่งแวดล้อมก็แย่ลง',
      'Di satu sisi kota berkembang, di sisi lain masalah lingkungan memburuk.',
      'Một mặt thành phố phát triển, mặt khác vấn đề môi trường trở nên nghiêm trọng.',
      '都市は発展する一方で、環境問題も深刻になりました。',
    ),
    deckId: 'topik-4',
  },

  // G182 · Of course ... and also
  {
    ko: '-은/는 물론이고',
    meaning: L(
      '"of course ..., and also ..." — taken-for-granted plus addition',
      '"por supuesto ..., y además ..." — lo obvio más una adición',
      '«bien entendu ..., et en plus ...»',
      '"obviamente ..., e também ..."',
      '"... ไม่ต้องพูดถึง ... ก็ยัง ..."',
      '"... apalagi / sudah jelas ..., bahkan ..."',
      '"khỏi cần nói ..., thậm chí còn ..."',
      '「〜はもちろん / 〜はもとより」',
    ),
    example: '한국어는 물론이고 영어도 잘해요.',
    trans: L(
      'They speak Korean of course, and English well too.',
      'Por supuesto sabe coreano, y también habla bien inglés.',
      'Le coréen évidemment, et aussi très bien l’anglais.',
      'Coreano claro, e fala bem inglês também.',
      'ภาษาเกาหลีไม่ต้องพูดถึง ภาษาอังกฤษก็เก่งด้วย',
      'Bahasa Korea sudah pasti, bahasa Inggris pun lancar.',
      'Tiếng Hàn khỏi nói, tiếng Anh cũng giỏi.',
      '韓国語はもちろん、英語も上手です。',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Causa con resultado inesperado
  // ─────────────────────────────────────────────────────────────────────────

  // G085 · Because of (unexpected negative result)
  {
    ko: '-는 바람에',
    meaning: L(
      '"because of (unexpected / negative) ..." — sudden cause out of speaker’s control',
      '"a causa de (inesperado, negativo) ..." — fuera del control del hablante',
      '«à cause de (imprévu / négatif)»',
      '"por causa de (inesperado / negativo)"',
      '"พอดี ... เลย ... (ผลร้าย ฉับพลัน)"',
      '"gara-gara (kejadian tiba-tiba, biasanya buruk)"',
      '"do ... (bất ngờ, thường xấu)"',
      '「〜したせいで / 〜したばかりに」— 突発・悪影響',
    ),
    example: '갑자기 비가 오는 바람에 옷이 다 젖었어요.',
    trans: L(
      'Because it suddenly rained, my clothes got soaked.',
      'A causa de que de pronto se puso a llover, la ropa se me empapó.',
      'À cause de la pluie soudaine, mes vêtements étaient trempés.',
      'Por causa da chuva repentina, minha roupa ficou ensopada.',
      'พอจู่ ๆ ฝนตก เสื้อผ้าก็เปียกหมด',
      'Gara-gara hujan mendadak, baju saya basah kuyup.',
      'Do bất ngờ trời mưa, quần áo tôi ướt sạch.',
      '急に雨が降ったせいで服が全部濡れました。',
    ),
    deckId: 'topik-4',
  },

  // G183 · In the chaos / din of
  {
    ko: '-는 통에',
    meaning: L(
      '"in the chaos / din of ..." — prolonged disorder causing a negative result',
      '"en el alboroto de / a causa del lío de ..." — situación caótica prolongada',
      '«à cause du tumulte de / dans le chaos de»',
      '"em meio à confusão de / por causa do tumulto de"',
      '"ในความวุ่นวายของ ... / เพราะ ... ทำให้วุ่น"',
      '"karena keributan / kekacauan ..."',
      '"do sự lộn xộn của / vì cảnh hỗn loạn ..."',
      '「〜する騒ぎで / 〜のあおりで」— 長引く混乱',
    ),
    example: '아이가 우는 통에 잠을 못 잤어요.',
    trans: L(
      'With the child crying, I couldn’t sleep.',
      'Con el llanto del niño, no pude dormir.',
      'Avec l’enfant qui pleurait, je n’ai pas pu dormir.',
      'Com o choro da criança, não consegui dormir.',
      'เด็กร้องไห้วุ่นวายไปหมด เลยนอนไม่หลับ',
      'Gara-gara anak menangis terus, saya tidak bisa tidur.',
      'Vì đứa bé khóc loạn lên, tôi không ngủ được.',
      '子供が泣き騒いだせいで眠れませんでした。',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Suposición y arrepentimiento
  // ─────────────────────────────────────────────────────────────────────────

  // G086 · I suppose / it must be that
  {
    ko: '-(으)ㄹ 텐데',
    meaning: L(
      '"I suppose / must be ..., (but) ..." — firm conjecture with background',
      '"supongo que / debe de ser que ..., (pero) ..." — conjetura firme con trasfondo',
      '«je suppose que ... / il doit ..., (mais) ...»',
      '"deve estar / acho que ..., (mas) ..."',
      '"คิดว่าน่าจะ ... (แต่) ..."',
      '"saya kira ... / pasti ..., (tapi) ..."',
      '"chắc là ... (nhưng) ..."',
      '「〜だろうに / 〜はずなのに」',
    ),
    example: '피곤하실 텐데 좀 쉬세요.',
    trans: L(
      'You must be tired — please rest a bit.',
      'Debe de estar cansado, descanse un poco.',
      'Vous devez être fatigué, reposez-vous un peu.',
      'Você deve estar cansado, descanse um pouco.',
      'คุณคงเหนื่อยมาก พักหน่อยนะคะ',
      'Pasti capek, istirahatlah sebentar.',
      'Chắc anh/chị mệt rồi, nghỉ chút đi.',
      'お疲れでしょうから少し休んでください。',
    ),
    deckId: 'topik-4',
  },

  // G095 · It’s impossible that
  {
    ko: '-(으)ㄹ 리가 없다',
    meaning: L(
      '"it can’t be that / it’s impossible that ..." — logical impossibility',
      '"no puede ser que / es imposible que ..." — imposibilidad lógica',
      '«il n’est pas possible que / il ne se peut pas que»',
      '"não pode ser que / é impossível que"',
      '"เป็นไปไม่ได้ที่ ... / ไม่มีทาง ..."',
      '"tidak mungkin / mustahil ..."',
      '"không thể nào ... / không lẽ ..."',
      '「〜はずがない」',
    ),
    example: '그 사람이 거짓말을 할 리가 없어요.',
    trans: L(
      'It can’t be that they would lie.',
      'No puede ser que esa persona mienta.',
      'Il n’est pas possible que cette personne mente.',
      'Não tem como essa pessoa estar mentindo.',
      'ไม่มีทางที่คนนั้นจะโกหก',
      'Tidak mungkin orang itu berbohong.',
      'Không thể nào người ấy nói dối được.',
      'あの人が嘘をつくはずがありません。',
    ),
    deckId: 'topik-4',
  },

  // G178 · Should have done (regret)
  {
    ko: '-(으)ㄹ걸 그랬다',
    meaning: L(
      '"should have / wish I had ..." — regret for not doing in the past',
      '"debería haber ... / ojalá hubiera ..." — arrepentimiento pasado',
      '«j’aurais dû ... / si seulement j’avais ...»',
      '"deveria ter ... / quem me dera ter ..."',
      '"น่าจะ ... ตอนนั้น" — เสียดายที่ไม่ทำ',
      '"seharusnya ... / coba saja saya ..."',
      '"đáng lẽ phải ... / giá mà tôi đã ..."',
      '「〜すればよかった」— 後悔',
    ),
    example: '우산을 가져올걸 그랬어요.',
    trans: L(
      'I should have brought an umbrella.',
      'Debería haber traído el paraguas.',
      'J’aurais dû apporter un parapluie.',
      'Eu deveria ter trazido o guarda-chuva.',
      'น่าจะเอาร่มมาตั้งแต่แรก',
      'Seharusnya saya bawa payung.',
      'Đáng lẽ tôi nên mang ô.',
      '傘を持ってくればよかったです。',
    ),
    deckId: 'topik-4',
  },

  // G176 · Judging from
  {
    ko: '-(으)ㄴ/는 것을 보니',
    meaning: L(
      '"judging from / seeing that ..." — inference from observed evidence',
      '"viendo que / juzgando por ..." — deducción a partir de evidencia visible',
      '«à voir / vu que ...» — déduction à partir d’une observation',
      '"vendo que / a julgar por ..." — dedução a partir de observação',
      '"ดูจาก ... / ดูท่าทาง ..."',
      '"melihat ... / dilihat dari ..."',
      '"thấy ... thì có lẽ / nhìn ... mà đoán ..."',
      '「〜のを見ると / 〜ことからすると」',
    ),
    example: '연락이 없는 걸 보니 못 오는 것 같아요.',
    trans: L(
      'Judging by the lack of contact, it seems they can’t come.',
      'Viendo que no hay noticias, parece que no puede venir.',
      'Vu qu’il n’y a pas de nouvelles, il semble qu’il/elle ne peut pas venir.',
      'Pelo silêncio, parece que não vem.',
      'ดูจากที่ไม่มีติดต่อมา คงมาไม่ได้แล้ว',
      'Melihat tidak ada kabar, sepertinya tidak bisa datang.',
      'Thấy không có liên lạc, có lẽ không đến được.',
      '連絡がないところを見ると、来られないみたいです。',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Cambio, modos y conformidad
  // ─────────────────────────────────────────────────────────────────────────

  // G087 · Was doing X and then Y (interruption)
  {
    ko: '-다가',
    meaning: L(
      '"was doing X and then Y" — interruption / shift; same subject',
      '"estaba haciendo X y luego ..." — interrupción / cambio de acción; mismo sujeto',
      '«étais en train de ... puis ...» — interruption; même sujet',
      '"estava fazendo ... e (de repente) ..." — interrupção; mesmo sujeito',
      '"กำลังทำ ... แล้วก็ ..." — สลับการกระทำ, ผู้กระทำเดียวกัน',
      '"sedang ... lalu ..." — interupsi, subjek sama',
      '"đang ... thì ..." — gián đoạn, cùng chủ ngữ',
      '「〜していて / 〜している途中で」— 中断・転換',
    ),
    example: '공부하다가 잠이 들었어요.',
    trans: L(
      'I was studying and fell asleep.',
      'Estaba estudiando y me quedé dormido.',
      'J’étudiais et je me suis endormi.',
      'Estava estudando e acabei pegando no sono.',
      'นั่งเรียนอยู่แล้วก็เผลอหลับ',
      'Sedang belajar, lalu ketiduran.',
      'Đang học thì tôi ngủ thiếp đi.',
      '勉強していて寝てしまいました。',
    ),
    deckId: 'topik-4',
  },

  // G094 · Pretend
  {
    ko: '-(으)ㄴ/는 척하다',
    meaning: L(
      '"pretend / act as if ..." — feigning a state or action',
      '"fingir / hacer como si ..." — aparentar un estado o acción',
      '«faire semblant de / faire comme si»',
      '"fingir / fazer de conta que"',
      '"แกล้งทำเป็น ..."',
      '"berpura-pura / pura-pura ..."',
      '"giả vờ / làm như ..."',
      '「〜ふりをする」',
    ),
    example: '모르는 척했어요.',
    trans: L(
      'They pretended not to know.',
      'Fingió no saber.',
      'Il/elle a fait semblant de ne pas savoir.',
      'Fingiu não saber.',
      'แกล้งทำเป็นไม่รู้',
      'Berpura-pura tidak tahu.',
      'Người ấy giả vờ không biết.',
      '知らないふりをしました。',
    ),
    deckId: 'topik-4',
  },

  // G096 · Make someone do (periphrastic causative)
  {
    ko: '-게 하다',
    meaning: L(
      '"make / let someone do ..." — periphrastic causative; flexible with any verb',
      '"hacer / dejar que alguien haga ..." — causativo perifrástico, cualquier verbo',
      '«faire / laisser ... faire» — causatif périphrastique',
      '"fazer / deixar alguém fazer ..." — causativo perifrástico',
      '"ทำให้ / ปล่อยให้ ... ทำ ..."',
      '"membuat / membiarkan ... melakukan ..."',
      '"khiến cho / để cho ... làm ..."',
      '「〜させる / 〜ようにする」— 迂言的使役',
    ),
    example: '선생님이 학생들을 공부하게 했어요.',
    trans: L(
      'The teacher made the students study.',
      'El profesor hizo que los estudiantes estudiaran.',
      'Le professeur a fait étudier les élèves.',
      'O professor fez os alunos estudarem.',
      'อาจารย์ทำให้นักเรียนเรียนหนังสือ',
      'Guru menyuruh murid-murid belajar.',
      'Cô giáo bắt học sinh học.',
      '先生は学生たちに勉強させました。',
    ),
    deckId: 'topik-4',
  },

  // G097 · As / according to (manner / right after)
  {
    ko: '-(으)ㄴ/는 대로',
    meaning: L(
      '"as / just like / right after / as much as ..." — manner, immediacy, or full extent',
      '"tal como / en cuanto / todo lo que ..." — modo, inmediatez o alcance',
      '«comme / dès que / autant que»',
      '"do jeito que / assim que / tudo que ..."',
      '"ตามที่ / ทันทีที่ / เท่าที่ ..."',
      '"sebagaimana / segera setelah / sebanyak ..."',
      '"theo như / ngay khi / hết mức ..."',
      '「〜のとおりに / 〜しだい / 〜だけ」',
    ),
    example: '제가 하는 대로 따라 하세요.',
    trans: L(
      'Do as I do — follow me.',
      'Haga tal como yo hago.',
      'Faites comme je fais.',
      'Faça como eu faço.',
      'ทำตามที่ฉันทำเลย',
      'Lakukan sebagaimana saya melakukannya.',
      'Hãy làm theo như tôi làm.',
      '私がするとおりにしてください。',
    ),
    deckId: 'topik-4',
  },

  // G093 · Worth doing / tolerable
  {
    ko: '-(으)ㄹ 만하다',
    meaning: L(
      '"worth doing / tolerable / bearable ..." — value or sufficiency',
      '"vale la pena / es tolerable / merece ..." — valor o tolerabilidad',
      '«ça vaut la peine de / c’est supportable»',
      '"vale a pena / dá para aguentar / merece ..."',
      '"คุ้มที่จะ / พอจะ ... ได้ / น่า ..."',
      '"layak / pantas / cukup untuk ..."',
      '"đáng để ... / có thể chấp nhận ..."',
      '「〜する価値がある / 〜できる程度」',
    ),
    example: '이 영화는 볼 만해요.',
    trans: L(
      'This movie is worth watching.',
      'Esta película vale la pena verla.',
      'Ce film vaut la peine d’être vu.',
      'Esse filme vale a pena assistir.',
      'หนังเรื่องนี้น่าดู',
      'Film ini layak ditonton.',
      'Phim này đáng xem.',
      'この映画は見る価値があります。',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Extremo, semejanza, formalidad
  // ─────────────────────────────────────────────────────────────────────────

  // G172 · To the point of / so ... that
  {
    ko: '-(으)ㄹ 정도로',
    meaning: L(
      '"to the point of / so ... that ..." — extreme degree leading to a result',
      '"hasta el punto de / tan ... que ..." — grado extremo con consecuencia',
      '«au point de / à tel point que»',
      '"a ponto de / tanto ... que"',
      '"ถึงขนาดที่ ... / มากจน ..."',
      '"sampai-sampai / sehingga ..."',
      '"đến mức ... / đến nỗi ..."',
      '「〜ほど / 〜ぐらい(程度)」',
    ),
    example: '걷기 힘들 정도로 발이 아파요.',
    trans: L(
      'My feet hurt so much I can hardly walk.',
      'Me duelen tanto los pies que apenas puedo caminar.',
      'J’ai si mal aux pieds que j’ai du mal à marcher.',
      'Meus pés doem a ponto de eu mal conseguir andar.',
      'เท้าเจ็บจนแทบเดินไม่ไหว',
      'Kaki saya sakit sampai sulit berjalan.',
      'Chân tôi đau đến mức khó đi nổi.',
      '歩くのがつらいほど足が痛いです。',
    ),
    deckId: 'topik-4',
  },

  // G173 · Seems about to / as if
  {
    ko: '-(으)ㄹ 듯하다 / -(으)ㄹ 듯이',
    meaning: L(
      '"seems about to / as if ..." — imminent appearance or simile of manner',
      '"parece que va a / como si fuera a ..." — apariencia inminente o símil',
      '«on dirait que ... va / comme s’il allait»',
      '"parece que vai / como se fosse ..."',
      '"ดูเหมือนจะ ... / ราวกับว่าจะ ..."',
      '"sepertinya hampir ... / seakan akan ..."',
      '"có vẻ sắp ... / như thể ..."',
      '「〜しそうだ / 〜しそうに」— 切迫の様子・直喩',
    ),
    example: '비가 올 듯해요.',
    trans: L(
      'It looks like it’s about to rain.',
      'Parece que va a llover.',
      'On dirait qu’il va pleuvoir.',
      'Parece que vai chover.',
      'ดูเหมือนฝนจะตก',
      'Sepertinya akan hujan.',
      'Có vẻ trời sắp mưa.',
      '雨が降りそうです。',
    ),
    deckId: 'topik-4',
  },

  // G175 · Before (formal, preparation)
  {
    ko: '-기에 앞서',
    meaning: L(
      '"before / prior to ..." — formal; implies preparation or precedence',
      '"antes de (formal) ..." — implica preparación o precedencia',
      '«avant de / préalablement à» — registre formel',
      '"antes de (formal) ..." — implica preparação ou precedência',
      '"ก่อนที่จะ ... (ทางการ)" — สื่อถึงการเตรียมพร้อม',
      '"sebelum (formal)" — menyiratkan persiapan',
      '"trước khi ... (trang trọng)" — hàm ý chuẩn bị',
      '「〜に先立ち / 〜に先立って」',
    ),
    example: '시작하기에 앞서 몇 가지 안내 말씀을 드리겠습니다.',
    trans: L(
      'Before we begin, I’ll share a few announcements.',
      'Antes de comenzar, les haré algunas indicaciones.',
      'Avant de commencer, quelques annonces.',
      'Antes de começarmos, algumas orientações.',
      'ก่อนเริ่ม ขออนุญาตชี้แจงสักเล็กน้อยครับ',
      'Sebelum mulai, izinkan saya menyampaikan beberapa info.',
      'Trước khi bắt đầu, xin thông báo vài điều.',
      '始めるに先立ち、いくつかご案内申し上げます。',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 7 · Rol, instrumento, contrafactual
  // ─────────────────────────────────────────────────────────────────────────

  // G174 · As (role) vs by means of (instrument) — TOPIK trap
  {
    ko: '-(으)로서 / -(으)로써',
    meaning: L(
      '"as (in the role/capacity of)" 로서 vs "by means of / with" 로써 — classic TOPIK pair',
      '"como (en calidad de)" 로서 vs "mediante / con" 로써 — distinción típica del TOPIK',
      '«en tant que (rôle)» 로서 vs «au moyen de» 로써 — distinction classique du TOPIK',
      '"como (na qualidade de)" 로서 vs "por meio de / com" 로써 — par clássico do TOPIK',
      '"ในฐานะ ..." 로서 vs "ด้วย / โดยวิธี ..." 로써 — แยกคู่นี้ (ออกสอบ TOPIK)',
      '"sebagai (peran)" 로서 vs "dengan / lewat (alat)" 로써 — pasangan klasik TOPIK',
      '"với tư cách là" 로서 vs "bằng / qua (phương tiện)" 로써 — cặp dễ nhầm trong TOPIK',
      '「〜として(資格)」로서 vs 「〜によって(手段)」로써 — TOPIK頻出の区別',
    ),
    example: '선생님으로서 학생들에게 책임이 있어요.',
    trans: L(
      'As a teacher, I have responsibility toward my students.',
      'Como profesor, tengo responsabilidad hacia mis estudiantes.',
      'En tant qu’enseignant, j’ai des responsabilités envers mes élèves.',
      'Como professor, tenho responsabilidade com meus alunos.',
      'ในฐานะอาจารย์ ฉันมีหน้าที่รับผิดชอบนักเรียน',
      'Sebagai guru, saya bertanggung jawab atas siswa.',
      'Với tư cách là giáo viên, tôi có trách nhiệm với học sinh.',
      '教師として学生たちに責任があります。',
    ),
    deckId: 'topik-4',
  },

  // G181 · If I had ... (counterfactual past)
  {
    ko: '-았/었더라면',
    meaning: L(
      '"if I/you had ..." — past counterfactual; speculates what would have happened',
      '"si hubiera ..." — contrafactual pasado; especula sobre lo que habría pasado',
      '«si j’avais ... (au passé)» — irréel du passé',
      '"se eu tivesse ..." — contrafactual no passado',
      '"ถ้า ... ในอดีต / หากตอนนั้น ..." — สมมุติย้อนหลัง',
      '"andai dulu saya ... / kalau saja ..." — kontrafaktual lampau',
      '"giá mà (trước đây) đã ..." — phản thực quá khứ',
      '「〜していたら / 〜ていれば」— 過去の反実仮想',
    ),
    example: '그때 더 열심히 공부했더라면 시험에 합격했을 거예요.',
    trans: L(
      'If I had studied harder then, I would have passed the exam.',
      'Si hubiera estudiado más en ese momento, habría aprobado el examen.',
      'Si j’avais étudié plus à l’époque, j’aurais réussi l’examen.',
      'Se eu tivesse estudado mais naquela época, teria passado na prova.',
      'ถ้าตอนนั้นตั้งใจเรียนมากกว่านี้ คงจะสอบผ่าน',
      'Andai dulu saya belajar lebih keras, pasti lulus.',
      'Giá mà hồi đó tôi học chăm hơn, thì đã đỗ.',
      'あのときもっと一生懸命勉強していたら、試験に受かっていたでしょう。',
    ),
    deckId: 'topik-4',
  },

  // G184 · I meant X but ended up Y
  {
    ko: '-ㄴ/는다는 것이',
    meaning: L(
      '"I meant to ... but ended up ..." — unintended outcome by mistake',
      '"quería hacer A pero (sin querer) hice B" — resultado no intencional',
      '«je voulais ... mais j’ai fini par ... (par erreur)»',
      '"queria ... mas acabei ... (sem querer)"',
      '"จะ ... แต่กลับ ... โดยไม่ตั้งใจ"',
      '"niat A, malah B (tanpa sengaja)"',
      '"định ..., không ngờ lại ..."',
      '「〜しようとして / 〜するつもりが」— うっかりの結果',
    ),
    example: '인사한다는 것이 그만 큰 소리로 외쳐 버렸어요.',
    trans: L(
      'I meant to say hi, but I ended up shouting.',
      'Quería saludar, pero acabé gritando sin querer.',
      'Je voulais saluer, mais j’ai fini par crier.',
      'Eu queria cumprimentar, mas acabei gritando.',
      'จะทักทาย กลับเผลอตะโกนเสียงดัง',
      'Niatnya menyapa, malah berteriak keras.',
      'Định chào hỏi, không ngờ lại la to lên.',
      '挨拶しようとしたのに、大声を出してしまいました。',
    ),
    deckId: 'topik-4',
  },

  // G185 · Only after / not until
  {
    ko: '-고서야',
    meaning: L(
      '"only after / not until ..." — necessary precondition; realized late',
      '"solo después de / no hasta que ..." — condición previa necesaria',
      '«qu’après / pas avant que»',
      '"só depois de / só quando ..."',
      '"พอ ... แล้วถึงจะ ..." — เพิ่งจะรู้/เป็นไปได้',
      '"baru setelah ... / barulah ..."',
      '"chỉ sau khi ... mới ..."',
      '「〜してこそ / 〜してはじめて」',
    ),
    example: '실패하고서야 얼마나 어려운지 알았어요.',
    trans: L(
      'Only after failing did I realize how hard it was.',
      'Solo tras fracasar entendí lo difícil que era.',
      'Ce n’est qu’après avoir échoué que j’ai compris à quel point c’était difficile.',
      'Só depois de fracassar é que percebi como era difícil.',
      'พอล้มเหลวแล้วถึงรู้ว่ามันยากแค่ไหน',
      'Baru setelah gagal, saya tahu betapa sulitnya.',
      'Chỉ sau khi thất bại tôi mới biết khó đến đâu.',
      '失敗してはじめてどれほど難しいか分かりました。',
    ),
    deckId: 'topik-4',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 8 · Transversales que se introducen en este nivel
  // (aux G208-G231 + indirect D006-D011 + additional G234-G262 + complementary G264-G290)
  // ─────────────────────────────────────────────────────────────────────────

  // G208 · Extreme negative emphasis (aux)
  {
    ko: '-아/어 빠지다',
    meaning: L(
      '"utterly / completely (negative)" — intensifies a negative adjective',
      '"de lo más ... (negativo)" — intensifica un adjetivo negativo',
      '«complètement / on ne peut plus» — intensification négative',
      '"super / completamente ... (negativo)" — intensifica adjetivo',
      '"... จัด / ... อย่างที่สุด (เน้นทางลบ)"',
      '"sangat / paling ... (sifat buruk)"',
      '"... cùng cực / ... hết mức (tiêu cực)"',
      '「〜きっている / 〜くさい(極端な悪い性質)」',
    ),
    example: '게을러 빠진 사람이에요.',
    trans: L(
      'They’re an utterly lazy person.',
      'Es una persona perezosísima.',
      'C’est quelqu’un de complètement paresseux.',
      'É uma pessoa preguiçosa demais.',
      'เป็นคนขี้เกียจจัด',
      'Orangnya pemalas banget.',
      'Anh ta lười cùng cực.',
      'ものすごく怠けきった人です。',
    ),
    deckId: 'topik-4',
  },

  // G209 · Get it over with (aux)
  {
    ko: '-아/어 치우다',
    meaning: L(
      '"get it over with / dispatch quickly ..." — finish briskly, often a chore',
      '"despachar / quitárselo de encima ..." — acabar de una vez',
      '«expédier / en finir avec ...»',
      '"despachar / dar conta de uma vez ..."',
      '"จัดการให้เสร็จเด็ดขาด"',
      '"selesaikan sekaligus / beresin"',
      '"giải quyết cho xong / dứt điểm ..."',
      '「〜してしまう」— てきぱき片付け',
    ),
    example: '숙제를 빨리 해 치웠어요.',
    trans: L(
      'I quickly got the homework over with.',
      'Hice la tarea rápidamente, de una vez.',
      'J’ai expédié les devoirs.',
      'Despachei a lição rapidinho.',
      'จัดการการบ้านเสร็จในพริบตา',
      'Saya selesaikan PR sekaligus.',
      'Tôi làm cho xong bài tập.',
      '宿題をさっと済ませてしまいました。',
    ),
    deckId: 'topik-4',
  },

  // G211 · Even if you try, it’s useless (aux)
  {
    ko: '-아/어 봤자 / 봐야',
    meaning: L(
      '"even if you try ..., it’s pointless" — futile effort',
      '"por más que / aunque lo intentes ..., no sirve" — esfuerzo inútil',
      '«même si tu ..., ça ne sert à rien»',
      '"por mais que ..., não adianta" — esforço inútil',
      '"ต่อให้ ... ก็เปล่าประโยชน์"',
      '"meskipun ..., percuma saja"',
      '"có ... cũng vô ích"',
      '「〜したところで(無駄)」',
    ),
    example: '지금 가 봤자 늦었어요.',
    trans: L(
      'Even if you go now, it’s too late.',
      'Aunque vayas ahora, ya es tarde.',
      'Même si tu y vas maintenant, c’est trop tard.',
      'Mesmo que vá agora, já é tarde.',
      'ต่อให้ไปตอนนี้ก็สายเสียแล้ว',
      'Walaupun pergi sekarang, sudah terlambat.',
      'Có đi bây giờ thì cũng muộn rồi.',
      '今行ったところで遅いです。',
    ),
    deckId: 'topik-4',
  },

  // G214 · Retrospective realization (aux)
  {
    ko: '-고 보다 / -고 보니(까)',
    meaning: L(
      '"after doing, I realized ..." — retrospective discovery',
      '"al hacerlo, me di cuenta de que ..." — descubrimiento retrospectivo',
      '«après l’avoir fait, je me suis rendu compte que ...»',
      '"depois de fazer, percebi que ..." — descoberta retrospectiva',
      '"พอทำแล้วถึงรู้ว่า ..."',
      '"setelah dilakukan, baru sadar ..."',
      '"làm rồi mới biết ..."',
      '「〜してみると / 〜してみたら(気づき)」',
    ),
    example: '사고 보니 너무 비쌌어요.',
    trans: L(
      'After buying it, I realized it was too expensive.',
      'Después de comprarlo me di cuenta de que era muy caro.',
      'Après l’avoir acheté, je me suis aperçu que c’était trop cher.',
      'Depois de comprar, percebi que estava muito caro.',
      'พอซื้อมาแล้วถึงรู้ว่าแพงเกินไป',
      'Setelah dibeli, baru sadar terlalu mahal.',
      'Mua xong tôi mới thấy quá đắt.',
      '買ってみたら高すぎました。',
    ),
    deckId: 'topik-4',
  },

  // G215 · I’ll do it no matter what (aux extension of G167)
  {
    ko: '-고 말겠다',
    meaning: L(
      '"I will ... no matter what" — strong future determination (future use of -고 말다)',
      '"lo haré sí o sí" — uso futuro de -고 말다 con determinación firme',
      '«je le ferai coûte que coûte» — détermination future',
      '"vou ... custe o que custar" — determinação no futuro',
      '"จะ ... ให้ได้แน่นอน" — เด็ดเดี่ยว',
      '"akan ... pasti / mau bagaimanapun"',
      '"nhất định sẽ ... cho bằng được"',
      '「絶対に〜してみせる」— -고 말다 の未来用法',
    ),
    example: '이번 시험에는 꼭 합격하고 말 거예요.',
    trans: L(
      'This time I’ll pass the exam no matter what.',
      'Esta vez aprobaré el examen sí o sí.',
      'Cette fois, je réussirai l’examen coûte que coûte.',
      'Desta vez vou passar na prova de qualquer jeito.',
      'รอบนี้จะสอบให้ผ่านให้ได้',
      'Kali ini saya pasti lulus ujian, apa pun caranya.',
      'Lần này nhất định tôi sẽ đỗ.',
      '今回こそ必ず試験に合格してみせます。',
    ),
    deckId: 'topik-4',
  },

  // G221 · Should have done (full form, aux)
  {
    ko: '-았/었어야 했다',
    meaning: L(
      '"should have ..." — regret for past omission or wrong action',
      '"debería haber + participio" — arrepentimiento por omisión o error pasado',
      '«j’aurais dû ...» — regret du passé',
      '"deveria ter + particípio" — arrependimento por ação passada',
      '"น่าจะ ... ตั้งแต่ตอนนั้น" — เสียดายเรื่องอดีต',
      '"seharusnya saya ..." — penyesalan masa lalu',
      '"đáng lẽ phải ..." — hối tiếc về quá khứ',
      '「〜すべきだった / 〜するべきだった」— 過去の後悔',
    ),
    example: '더 일찍 출발했어야 했어요.',
    trans: L(
      'I should have left earlier.',
      'Debería haber salido antes.',
      'J’aurais dû partir plus tôt.',
      'Eu deveria ter saído mais cedo.',
      'น่าจะออกเดินทางก่อนหน้านี้',
      'Seharusnya saya berangkat lebih awal.',
      'Đáng lẽ tôi phải đi sớm hơn.',
      'もっと早く出発するべきでした。',
    ),
    deckId: 'topik-4',
  },

  // G222 · Since I will / since it should (aux)
  {
    ko: '-(으)ㄹ 테니까',
    meaning: L(
      '"since I’ll ... / it must be that ..., so ..." — intention or supposition used as a reason',
      '"como yo voy a / debe ser que ..., así que ..." — intención o suposición que sirve de razón',
      '«étant donné que je vais ... / il doit ..., alors ...»',
      '"como vou ... / deve ser que ..., então ..."',
      '"ฉันจะ ... ฉะนั้น / น่าจะ ... ฉะนั้น ..."',
      '"saya akan ... / pasti ..., jadi ..."',
      '"tôi sẽ ... / chắc là ..., nên ..."',
      '「〜だろうから / 〜するから(理由)」',
    ),
    example: '제가 음식을 준비할 테니까 너는 음료수를 가져와.',
    trans: L(
      'I’ll prepare the food, so you bring the drinks.',
      'Yo voy a preparar la comida, así que tú trae las bebidas.',
      'Je vais préparer à manger, donc apporte les boissons.',
      'Eu vou preparar a comida, então traga as bebidas.',
      'ฉันจะเตรียมอาหารเอง เธอเอาเครื่องดื่มมานะ',
      'Saya akan menyiapkan makanan, jadi kamu bawa minuman.',
      'Tôi sẽ chuẩn bị đồ ăn, nên bạn mang đồ uống đi.',
      '私が料理を用意しますから、あなたは飲み物を持ってきてください。',
    ),
    deckId: 'topik-4',
  },

  // G223 · In the state of (aux)
  {
    ko: '-(으)ㄴ 채(로)',
    meaning: L(
      '"in the state of ..." — keeping a previously achieved state during another action',
      '"con / en el estado de ..." — manteniendo el estado durante otra acción',
      '«en gardant ... / avec ... encore ...»',
      '"com ... ainda" — mantendo o estado',
      '"ทั้ง ... อยู่อย่างนั้น / โดยที่ ..."',
      '"dalam keadaan ... / sambil tetap ..."',
      '"trong tình trạng ... / vẫn để nguyên ..."',
      '「〜したまま」',
    ),
    example: '신발을 신은 채로 들어왔어요.',
    trans: L(
      'They came in with their shoes still on.',
      'Entró con los zapatos puestos.',
      'Il/elle est entré(e) avec ses chaussures.',
      'Entrou com os sapatos ainda nos pés.',
      'เดินเข้ามาทั้งที่ยังใส่รองเท้า',
      'Masuk dalam keadaan masih bersepatu.',
      'Người ấy bước vào mà vẫn mang nguyên giày.',
      '靴を履いたまま入ってきました。',
    ),
    deckId: 'topik-4',
  },

  // G224 · While you’re at it (aux)
  {
    ko: '-(으)ㄴ/는 김에',
    meaning: L(
      '"while you’re at it / taking the opportunity to ..." — secondary action on the fly',
      '"ya que estás / aprovechando que ..." — acción secundaria aprovechando la primera',
      '«pendant que tu y es / tant qu’à ...»',
      '"já que está / aproveitando que ..."',
      '"ในเมื่อ ... แล้ว ก็เลย ..."',
      '"mumpung sedang ..., sekalian ..."',
      '"nhân tiện đang ..., ... luôn"',
      '「〜したついでに」',
    ),
    example: '마트에 간 김에 우유도 사 왔어요.',
    trans: L(
      'Since I went to the supermarket, I bought milk too.',
      'Ya que fui al supermercado, también traje leche.',
      'Tant qu’à aller au supermarché, j’ai aussi pris du lait.',
      'Já que fui ao supermercado, trouxe leite também.',
      'ในเมื่อไปซูเปอร์แล้ว เลยซื้อนมมาด้วย',
      'Mumpung ke supermarket, sekalian beli susu.',
      'Nhân tiện đi siêu thị, tôi mua luôn sữa.',
      'スーパーに行ったついでに牛乳も買ってきました。',
    ),
    deckId: 'topik-4',
  },

  // G225 · On the way (aux)
  {
    ko: '-(으)ㄴ/는 길에',
    meaning: L(
      '"on the way (to/from) ..." — doing something during a journey',
      '"de camino a / en el camino ..." — solo con verbos de movimiento',
      '«en chemin / sur le trajet de ...»',
      '"a caminho de / no caminho ..."',
      '"ระหว่างทาง / ตอนกำลังเดินทาง ..."',
      '"di tengah jalan / sambil pergi ..."',
      '"trên đường (đi / về) ..."',
      '「〜する途中で」',
    ),
    example: '집에 오는 길에 빵을 샀어요.',
    trans: L(
      'On the way home I bought some bread.',
      'De camino a casa compré pan.',
      'Sur le chemin du retour, j’ai acheté du pain.',
      'No caminho para casa comprei pão.',
      'ระหว่างทางกลับบ้านฉันแวะซื้อขนมปัง',
      'Di perjalanan pulang, saya beli roti.',
      'Trên đường về tôi mua bánh mì.',
      '家に帰る途中でパンを買いました。',
    ),
    deckId: 'topik-4',
  },

  // G226 · Double purpose (aux)
  {
    ko: '-(으)ㄹ 겸',
    meaning: L(
      '"for X and also for Y" — two purposes combined',
      '"para X y también para Y" — doble propósito combinado',
      '«à la fois pour ... et pour ...»',
      '"para X e também para Y"',
      '"เพื่อ ... และ ... ในคราวเดียว"',
      '"sekalian untuk ... dan ..."',
      '"vừa để ... vừa để ..."',
      '「〜も〜も兼ねて」',
    ),
    example: '운동도 할 겸 친구도 만날 겸 공원에 갔어요.',
    trans: L(
      'I went to the park to both exercise and meet a friend.',
      'Fui al parque para hacer ejercicio y también ver a un amigo.',
      'Je suis allé au parc à la fois pour faire du sport et voir un ami.',
      'Fui ao parque para me exercitar e também encontrar um amigo.',
      'ฉันไปสวนทั้งเพื่อออกกำลังกายและพบเพื่อน',
      'Saya ke taman sekalian olahraga dan bertemu teman.',
      'Tôi ra công viên vừa tập thể dục vừa gặp bạn.',
      '運動も兼ねて、友達にも会いに公園に行きました。',
    ),
    deckId: 'topik-4',
  },

  // G228 · Because of being busy with (aux)
  {
    ko: '-느라(고)',
    meaning: L(
      '"because of being busy ...ing ..." — same-subject simultaneous excuse',
      '"por estar haciendo ..." — excusa de acción simultánea, mismo sujeto',
      '«à cause de / en train de ...»',
      '"por estar ...ndo ..." — desculpa simultânea',
      '"เพราะมัวแต่ ... อยู่ ..."',
      '"karena (sedang) sibuk ..."',
      '"vì mải ... nên ..."',
      '「〜していて(言い訳)」— 同主語・同時',
    ),
    example: '공부하느라고 잠을 못 잤어요.',
    trans: L(
      'I couldn’t sleep because I was busy studying.',
      'No pude dormir por estar estudiando.',
      'Je n’ai pas pu dormir parce que j’étudiais.',
      'Não consegui dormir porque estava estudando.',
      'นอนไม่หลับเพราะมัวแต่อ่านหนังสือ',
      'Tidak bisa tidur karena sibuk belajar.',
      'Vì mải học, tôi không ngủ được.',
      '勉強していて寝られませんでした。',
    ),
    deckId: 'topik-4',
  },

  // G229 · Since I noticed/heard ... (aux)
  {
    ko: '-길래',
    meaning: L(
      '"since I noticed / heard ... I did ..." — personal-reaction cause (usually 1st-person 2nd clause)',
      '"como vi / oí que ..., yo ..." — causa por reacción personal (2ª cláusula en 1ª persona)',
      '«comme j’ai vu / entendu que ..., j’ai ...»',
      '"como vi / ouvi que ..., eu ..."',
      '"พอเห็น / ได้ยินว่า ... ฉันก็เลย ..."',
      '"karena saya lihat / dengar ..., saya pun ..."',
      '"thấy / nghe ... nên tôi đã ..."',
      '「〜なので（私は）〜した」— 1人称反応',
    ),
    example: '비가 오길래 우산을 가져왔어요.',
    trans: L(
      'Since I saw it was raining, I brought an umbrella.',
      'Como vi que llovía, traje paraguas.',
      'Comme je voyais qu’il pleuvait, j’ai pris un parapluie.',
      'Como vi que estava chovendo, trouxe guarda-chuva.',
      'พอเห็นว่าฝนตก ฉันเลยเอาร่มมา',
      'Karena lihat hujan, saya bawa payung.',
      'Thấy trời mưa nên tôi mang ô đi.',
      '雨が降っていたので傘を持ってきました。',
    ),
    deckId: 'topik-4',
  },

  // G231 · Warning conditional (aux)
  {
    ko: '-다가는',
    meaning: L(
      '"if you keep doing that ..." — warning of a bad consequence',
      '"si sigues haciendo eso ..." — advertencia de consecuencia negativa',
      '«si tu continues ainsi ...» — avertissement',
      '"se continuar fazendo isso ..." — aviso de consequência ruim',
      '"ขืน ... อยู่ จะ ..." — เตือนถึงผลร้าย',
      '"kalau terus begitu, nanti ..." — peringatan',
      '"cứ thế thì rồi sẽ ..." — cảnh báo",',
      '「〜していたら(悪いことになる)」',
    ),
    example: '그렇게 늦게 자다가는 몸이 망가져요.',
    trans: L(
      'If you keep going to bed that late, your health will break down.',
      'Si sigues acostándote tan tarde, tu salud se va a estropear.',
      'Si tu continues à te coucher si tard, tu vas te ruiner la santé.',
      'Se continuar dormindo tão tarde, sua saúde vai piorar.',
      'ขืนนอนดึกแบบนี้ ร่างกายจะพังเอา',
      'Kalau terus tidur larut, badan akan rusak.',
      'Cứ ngủ muộn thế này, cơ thể sẽ hỏng mất.',
      'そんなに夜更かししていたら、体を壊しますよ。',
    ),
    deckId: 'topik-4',
  },

  // D006 · Verify hearsay (casual variant, indirect)
  {
    ko: '-다면서요? / -다며?',
    meaning: L(
      '"I heard that ..., right?" — verify rumour; 다며? is the casual form',
      '"me dijeron que ..., ¿es así?" — verifica un rumor; 다며? es la forma informal',
      '«on m’a dit que ..., non ?» — vérification, 다며? = familier',
      '"ouvi dizer que ..., né?" — verifica boato; 다며? casual',
      '"ได้ยินว่า ... จริงไหม?" — 다며? คือรูปกันเอง',
      '"katanya ..., ya kan?" — 다며? bentuk santai',
      '"nghe nói ... phải không?" — 다며? thân mật',
      '「〜だって？(口語) / 〜と聞きましたよ？」',
    ),
    example: '결혼했다며?',
    trans: L(
      'I heard you got married — really?',
      'Me dijeron que te casaste, ¿es verdad?',
      'Il paraît que tu t’es marié(e), c’est vrai ?',
      'Soube que casou, é verdade?',
      'ได้ยินว่าคุณแต่งงานแล้วเหรอ',
      'Katanya kamu sudah menikah, ya?',
      'Nghe nói bạn cưới rồi, đúng không?',
      '結婚したんだって？',
    ),
    deckId: 'topik-4',
  },

  // D007 · Disbelief / surprise (indirect)
  {
    ko: '-다니(요)?',
    meaning: L(
      '"what do you mean ...?! / you must be kidding ..." — disbelief or shock',
      '"¿cómo que ...?! / ¡¿que ...?!" — incredulidad o asombro',
      '«comment ça ...?! / quoi ?!» — incrédulité',
      '"como assim ...?! / o quê?!" — incredulidade',
      '"จะบอกว่า ... เหรอ?! ตกใจ"',
      '"masa ...?! / mana mungkin ...?!"',
      '"sao lại ...?! / chuyện gì vậy?!"',
      '「〜だなんて？！」— 驚き・信じられない',
    ),
    example: '그가 갔다니요?',
    trans: L(
      'What do you mean he left?',
      '¡¿Cómo que se fue?!',
      'Comment ça, il est parti ?!',
      'Como assim, ele foi embora?',
      'จะบอกว่าเขาไปแล้วเหรอ?!',
      'Masa dia sudah pergi?!',
      'Sao lại bảo người ấy đi rồi?!',
      '彼が行ったなんて？！',
    ),
    deckId: 'topik-4',
  },

  // D008 · I already told you (indirect)
  {
    ko: '-다니까(요)',
    meaning: L(
      '"I’m telling you ..." — insistent repetition, mild frustration',
      '"¡ya te dije que ...! / ¡que sí!" — repetición insistente con leve frustración',
      '«je te dis que ...! / mais si !» — répétition insistante',
      '"já disse que ...! / que sim!" — repetição insistente',
      '"ก็บอกแล้วไงว่า ...!"',
      '"sudah kubilang, ...!"',
      '"đã bảo là ... rồi mà!"',
      '「〜だってば」— 強い繰り返し',
    ),
    example: '안 된다니까요!',
    trans: L(
      'I’m telling you, it’s not allowed!',
      '¡Que no, ya te dije!',
      'Je te dis que c’est non !',
      'Já disse que não pode!',
      'ก็บอกแล้วว่าไม่ได้!',
      'Sudah kubilang tidak bisa!',
      'Đã bảo là không được mà!',
      'だめだってば！',
    ),
    deckId: 'topik-4',
  },

  // D009 · Polite echo question (indirect)
  {
    ko: '-다고(요)?',
    meaning: L(
      '"you said ...?" — echo with confirmation request, polite -요',
      '"¿dijiste que ...?" — pregunta de eco para confirmar',
      '«vous avez dit que ... ?» — reprise pour confirmation',
      '"você disse que ...?" — pergunta-eco para confirmar',
      '"คุณบอกว่า ... ใช่ไหม?" — ขอยืนยัน',
      '"katanya ...?" — meminta konfirmasi',
      '"bạn bảo ... à?" — yêu cầu xác nhận',
      '「〜と言いましたか？」— 丁寧な聞き返し',
    ),
    example: '다시 한다고요?',
    trans: L(
      'You’re going to do it again, you say?',
      '¿Que lo vas a hacer de nuevo?',
      'Tu dis que tu vas le refaire ?',
      'Você disse que vai fazer de novo?',
      'คุณว่าจะทำอีกครั้งเหรอ',
      'Katanya mau diulang?',
      'Bạn bảo sẽ làm lại à?',
      'もう一回やると言いましたか？',
    ),
    deckId: 'topik-4',
  },

  // D010 · Quoted modifier (indirect)
  {
    ko: '-다는 + N',
    meaning: L(
      'modifier with embedded quote — "the N that says ..." (news, rumor, idea)',
      'modificador con cita incrustada — "la N de que ..." (noticia, rumor, idea)',
      'modificateur avec citation — «la N selon laquelle ...»',
      'modificador com citação — "a N de que ..."',
      'รูปขยายที่ฝังคำพูด — "N ที่ว่า ..."',
      'pengubah dengan kutipan — "N yang menyatakan ..."',
      'bổ ngữ chứa lời dẫn — "N rằng ..."',
      '「〜という N」(伝聞・噂・考え)',
    ),
    example: '비가 온다는 소식을 들었어요.',
    trans: L(
      'I heard the news that it’s going to rain.',
      'Escuché la noticia de que va a llover.',
      'J’ai entendu dire qu’il allait pleuvoir.',
      'Soube da notícia de que vai chover.',
      'ฉันได้ยินข่าวว่าฝนจะตก',
      'Saya dengar kabar bahwa akan hujan.',
      'Tôi nghe tin nói trời sẽ mưa.',
      '雨が降るという知らせを聞きました。',
    ),
    deckId: 'topik-4',
  },

  // D011 · Indirect speech with cognition verbs (★★★ critical, indirect)
  {
    ko: '-다고 + 생각하다 / 믿다 / 듣다 / 보다 / 알다 / 느끼다 / 여기다',
    meaning: L(
      'indirect quote + cognition verb — "think / believe / hear / consider / know / feel / regard that ..."',
      'cita indirecta + verbo de cognición — "pensar / creer / escuchar / considerar / saber / sentir / tener por que ..."',
      'citation indirecte + verbe cognitif — «penser / croire / entendre / considérer / savoir / sentir / tenir pour que ...»',
      'citação indireta + verbo de cognição — "pensar / acreditar / ouvir / considerar / saber / sentir / ter como que ..."',
      'การพูดอ้อม + กริยาทางความคิด — "คิดว่า / เชื่อว่า / ได้ยินว่า / มองว่า ..."',
      'kutipan tak langsung + verba kognitif — "berpikir / percaya / mendengar / menganggap bahwa ..."',
      'lời dẫn gián tiếp + động từ nhận thức — "nghĩ / tin / nghe / coi / biết / cảm thấy rằng ..."',
      '間接話法 + 認識動詞「〜と思う / 信じる / 聞く / 見る / 知る / 感じる」',
    ),
    example: '그 사람이 정직하다고 믿어요.',
    trans: L(
      'I believe that person is honest.',
      'Creo que esa persona es honesta.',
      'Je crois que cette personne est honnête.',
      'Acredito que essa pessoa é honesta.',
      'ฉันเชื่อว่าคนนั้นซื่อสัตย์',
      'Saya percaya orang itu jujur.',
      'Tôi tin rằng người ấy thật thà.',
      'あの人は正直だと信じています。',
    ),
    deckId: 'topik-4',
  },

  // G234 · Looks like (verbs / 있다·없다, additional)
  {
    ko: '-나 보다',
    meaning: L(
      '"looks like ... / it seems ..." — conjecture based on evidence (action verbs and 있다/없다)',
      '"parece que / se ve que ..." — conjetura basada en señales (verbos de acción y 있다/없다)',
      '«on dirait que / il semble que ...» — conjecture (verbes d’action)',
      '"parece que / dá para ver que ..." — conjetura (verbos de ação)',
      '"ดูเหมือนว่า ... (กับกริยาการกระทำ และ 있다/없다)"',
      '"sepertinya ... (verba aksi, 있다/없다)"',
      '"có vẻ ... (với động từ hành động và 있다/없다)"',
      '「〜らしい / 〜のかな(動作動詞)」',
    ),
    example: '사람이 많이 모인 걸 보니 영화가 재미있나 봐요.',
    trans: L(
      'Seeing how crowded it is, the movie must be good.',
      'Por la cantidad de gente, parece que la película es buena.',
      'À voir la foule, on dirait que le film est bon.',
      'Pela multidão, parece que o filme é bom.',
      'ดูจากที่คนเยอะแบบนี้ หนังคงจะสนุก',
      'Melihat ramainya, sepertinya filmnya bagus.',
      'Thấy đông thế này, có lẽ phim hay.',
      '人が多く集まっているところを見ると、映画が面白いみたいです。',
    ),
    deckId: 'topik-4',
  },

  // G235 · Looks like (adj / past) (additional)
  {
    ko: '-(으)ㄴ가 보다',
    meaning: L(
      '"looks like ..." for adjectives (present) and verbs (past): -았/었나 보다',
      'versión adjetivo (presente) y verbo (pasado): -았/었나 보다',
      'version adjectif / passé: -았/었나 보다',
      'versão adjetivo / pretérito: -았/었나 보다',
      'ใช้กับคำคุณศัพท์ (ปัจจุบัน) และกริยาในอดีต -았/었나 보다',
      'untuk adjektiva (kini) atau verba (lampau): -았/었나 보다',
      'cho tính từ (hiện tại) hoặc động từ (quá khứ): -았/었나 보다',
      '「〜ようだ(形容詞・過去)」— -았/었나 보다',
    ),
    example: '길이 막히는 걸 보니 사고가 났나 봐요.',
    trans: L(
      'There’s a traffic jam — looks like there was an accident.',
      'Como hay atasco, parece que hubo un accidente.',
      'Vu l’embouteillage, on dirait qu’il y a eu un accident.',
      'Pelo trânsito, parece que aconteceu um acidente.',
      'ดูจากรถติด เดาว่าน่าจะเกิดอุบัติเหตุ',
      'Melihat macet begini, sepertinya ada kecelakaan.',
      'Thấy kẹt xe thế này, có lẽ đã xảy ra tai nạn.',
      '道が混んでいるので事故が起きたみたいです。',
    ),
    deckId: 'topik-4',
  },

  // G241 · Probably / should have (additional)
  {
    ko: '-(으)ㄹ걸(요)',
    meaning: L(
      'with 요 (rising): "I think / probably ..."; without 요 (falling): "should have ..."',
      'con 요 (entonación alta): "creo que / probablemente ..."; sin 요 (descendente): "debería haber ..."',
      'avec 요 (intonation montante): «probablement»; sans (descendante): «j’aurais dû»',
      'com 요 (subindo): "talvez ..."; sem 요 (descendo): "deveria ter ..."',
      '"คงจะ ..." (ขึ้นเสียง 요) / "น่าจะ ... ตอนนั้น" (ลง, เสียดาย)"',
      '"mungkin ..." (요 naik) / "seharusnya ..." (turun, sesal)',
      '"chắc là ..." (요 lên) / "đáng lẽ phải ..." (xuống, hối tiếc)',
      '「〜だろうな / 〜すればよかった」— 推量 or 後悔',
    ),
    example: '그분도 오실걸요.',
    trans: L(
      'I think they’ll come too.',
      'Creo que él/ella también vendrá.',
      'Je crois qu’il/elle viendra aussi.',
      'Acho que ele/ela também vem.',
      'คิดว่าคุณคนนั้นก็คงจะมาเหมือนกัน',
      'Sepertinya beliau juga akan datang.',
      'Chắc người đó cũng sẽ đến.',
      'あの方も来るでしょうね。',
    ),
    deckId: 'topik-4',
  },

  // G244 · Concession with simultaneity (additional)
  {
    ko: '-(으)면서도',
    meaning: L(
      '"even while ..., still ..." — same subject doing two contradictory things',
      '"aunque al mismo tiempo ..., (sin embargo) ..." — el mismo sujeto hace dos cosas contradictorias',
      '«tout en ... pourtant ...» — même sujet, deux faits opposés',
      '"ainda que ao mesmo tempo ..., ainda assim ..." — mesmo sujeito',
      '"ทั้งที่ก็ ... กลับยัง ..." — ผู้กระทำเดียวกันทำสิ่งขัดแย้ง',
      '"meskipun (saat) ..., tetap ..." — subjek sama, bertentangan',
      '"vừa ... vừa ... mà vẫn ..." — mâu thuẫn cùng chủ ngữ',
      '「〜ながらも」— 同主語の矛盾',
    ),
    example: '알면서도 모르는 척해요.',
    trans: L(
      'They know but still pretend not to.',
      'Aunque sabe, finge no saber.',
      'Tout en sachant, il/elle fait semblant de ne pas savoir.',
      'Mesmo sabendo, finge que não sabe.',
      'ทั้งที่รู้ ก็ยังแกล้งทำเป็นไม่รู้',
      'Padahal tahu, tetap pura-pura tidak tahu.',
      'Biết mà vẫn giả vờ không biết.',
      '知っていながら知らないふりをします。',
    ),
    deckId: 'topik-4',
  },

  // G250 · Movement-action transfer (additional)
  {
    ko: '-아/어다(가)',
    meaning: L(
      '"go/come do X and then carry the result to the next action ..." — transfer of result',
      '"ir/venir a hacer X y luego ..." — transferencia del resultado',
      '«faire X (ailleurs) puis ramener ...»',
      '"ir/vir fazer X e depois ..." — transferência do resultado',
      '"ไปทำ ... แล้วเอามา ..."',
      '"pergi melakukan ... lalu (membawa ke) ..."',
      '"đi làm X rồi đem (về) ..."',
      '「〜してきて / 〜してから(場所移動)」',
    ),
    example: '빵을 사다가 친구에게 줬어요.',
    trans: L(
      'I bought bread and gave it to my friend.',
      'Compré pan y se lo di a mi amigo.',
      'J’ai acheté du pain et je l’ai donné à mon ami.',
      'Comprei pão e dei para meu amigo.',
      'ไปซื้อขนมปังมาให้เพื่อน',
      'Saya beli roti lalu kasih ke teman.',
      'Tôi đi mua bánh mì rồi đưa cho bạn.',
      'パンを買ってきて友達にあげました。',
    ),
    deckId: 'topik-4',
  },

  // G256 · Proportionally (additional)
  {
    ko: '-(으)ㄴ/는 만큼',
    meaning: L(
      '"as much as / in proportion to ..." — equivalence of degree',
      '"tanto como / en la medida en que ..." — proporción o equivalencia',
      '«autant que / proportionnellement à»',
      '"tanto quanto / na medida em que ..."',
      '"เท่าที่ ... / มากเท่ากับ ..."',
      '"sebanding dengan / sebanyak ..."',
      '"tương xứng với / chừng nào ... thì ..."',
      '「〜だけ / 〜分」— 程度の対応',
    ),
    example: '노력한 만큼 결과가 나올 거예요.',
    trans: L(
      'Results will come in proportion to the effort.',
      'Los resultados saldrán en la medida del esfuerzo.',
      'Les résultats seront à la hauteur de l’effort fourni.',
      'Os resultados virão na medida do esforço.',
      'จะได้ผลลัพธ์เท่ากับที่พยายาม',
      'Hasil akan sebanding dengan usaha.',
      'Cố gắng bao nhiêu thì kết quả bấy nhiêu.',
      '努力した分だけ結果が出るでしょう。',
    ),
    deckId: 'topik-4',
  },

  // G262 · Pretend (extended uses, additional)
  {
    ko: '-(으)ㄴ/는 척 + V',
    meaning: L(
      '"pretending to ..., do ..." — combine 척 with another action (cf. -(으)ㄴ/는 척하다 in T4)',
      '"fingiendo ..., hacer ..." — combinar 척 con otra acción (cf. -(으)ㄴ/는 척하다)',
      '«faisant semblant de ..., faire ...» — combiner avec une autre action',
      '"fingindo ..., fazer ..." — combinação com outra ação',
      '"แกล้งทำเป็น ... แล้ว ..."',
      '"berpura-pura ..., kemudian ..."',
      '"giả vờ ... rồi ..."',
      '「〜ふりをして〜する」(-(으)ㄴ/는 척하다 の応用)',
    ),
    example: '못 들은 척 그냥 지나갔어요.',
    trans: L(
      'I just walked by, pretending I hadn’t heard.',
      'Pasé de largo fingiendo no haber escuchado.',
      'Je suis passé sans m’arrêter, en faisant semblant de ne pas avoir entendu.',
      'Passei direto fingindo não ter ouvido.',
      'แกล้งทำเป็นไม่ได้ยิน แล้วเดินผ่านไปเฉย ๆ',
      'Saya berlalu saja, pura-pura tidak dengar.',
      'Tôi giả vờ không nghe rồi đi luôn.',
      '聞こえなかったふりをして通り過ぎました。',
    ),
    deckId: 'topik-4',
  },

  // G264 · Discontinued past (complementary)
  {
    ko: '-았/었었-',
    meaning: L(
      'remote / discontinued past — "had been ..., but no longer ..."',
      'pasado lejano / discontinuado — "había ... (pero ya no)"',
      'passé éloigné / révolu — «avait été ... (mais plus maintenant)»',
      'pretérito remoto / descontinuado — "tinha sido ... (mas já não)"',
      '"เคย ... (ตอนนี้ไม่ใช่แล้ว)"',
      '"dahulu pernah ... (kini sudah tidak)"',
      '"trước đây từng ... (giờ thì không nữa)"',
      '「〜していた(が今は違う)」',
    ),
    example: '어렸을 때 부산에 살았었어요.',
    trans: L(
      'I lived in Busan as a child (but no longer).',
      'De niño viví en Busan (pero ya no).',
      'Enfant, j’habitais à Busan (mais plus maintenant).',
      'Quando criança, eu morava em Busan (mas não mais).',
      'ตอนเด็กฉันเคยอยู่ที่ปูซาน (ตอนนี้ไม่อยู่แล้ว)',
      'Waktu kecil saya tinggal di Busan (sekarang tidak lagi).',
      'Hồi nhỏ tôi từng sống ở Busan (giờ thì không nữa).',
      '子供のころ釜山に住んでいました（今は違います）。',
    ),
    deckId: 'topik-4',
  },

  // G269 · Cannot but / cannot help (complementary)
  {
    ko: '-지 않을 수 없다',
    meaning: L(
      '"cannot but / cannot help ...ing" — unavoidable acknowledgement or action',
      '"no puedo dejar de / no me queda más remedio que ..." — inevitable',
      '«je ne peux que / il faut bien ...» — inévitable',
      '"não posso deixar de / não me resta senão ..."',
      '"อดไม่ได้ที่จะ ... / จำเป็นต้อง ..."',
      '"tidak bisa tidak ... / mau tidak mau ..."',
      '"không thể không ... / đành phải ..."',
      '「〜ざるを得ない / 〜ないわけにはいかない」',
    ),
    example: '그 결과에 놀라지 않을 수 없었어요.',
    trans: L(
      'I couldn’t help being surprised by that result.',
      'No pude evitar sorprenderme ante ese resultado.',
      'Je n’ai pu m’empêcher d’être surpris par ce résultat.',
      'Não pude deixar de me surpreender com aquele resultado.',
      'อดไม่ได้ที่จะประหลาดใจกับผลลัพธ์นั้น',
      'Mau tidak mau saya terkejut dengan hasilnya.',
      'Tôi không thể không bất ngờ trước kết quả đó.',
      'その結果に驚かずにはいられませんでした。',
    ),
    deckId: 'topik-4',
  },

  // G277 · On top of (compact, complementary)
  {
    ko: '-(으)ㄴ/는 데(에)다(가)',
    meaning: L(
      '"on top of ... / and besides ..." — compact additive accumulation',
      '"además de / encima de eso ..." — acumulación compacta',
      '«en plus de ... / qui plus est»',
      '"além de ... / por cima ..." — adição compacta',
      '"นอกจาก ... แล้ว ยัง ..."',
      '"selain ..., juga ..."',
      '"vừa ... lại còn ..."',
      '「〜うえに(短縮)」',
    ),
    example: '늦게 일어난 데다가 차도 막혀서 지각했어요.',
    trans: L(
      'On top of waking up late, the traffic was bad, so I was late.',
      'Encima de levantarme tarde, había atasco; por eso llegué tarde.',
      'En plus de me lever tard, il y avait du trafic, donc j’étais en retard.',
      'Além de acordar tarde, ainda peguei trânsito, então me atrasei.',
      'ตื่นสายแล้วยังเจอรถติดอีก เลยมาสาย',
      'Selain bangun kesiangan, jalan juga macet, jadi terlambat.',
      'Vừa dậy muộn lại còn kẹt xe, nên tôi đến muộn.',
      '寝坊したうえに渋滞もあって遅刻しました。',
    ),
    deckId: 'topik-4',
  },

  // G278 · Fetch and give (complementary)
  {
    ko: '-아/어다(가) 주다',
    meaning: L(
      '"go and do X, then give the result to someone" — fetch-and-give compound',
      '"ir a hacer X y luego dárselo a alguien" — compuesto de movimiento + favor',
      '«aller faire X et le rapporter à qqn»',
      '"ir fazer X e dar para alguém"',
      '"ไปทำ ... แล้วเอามาให้ ..."',
      '"pergi melakukan ... lalu memberikannya untuk ..."',
      '"đi làm X rồi đưa cho ..."',
      '「〜してきてあげる」',
    ),
    example: '약을 사다 줄게요.',
    trans: L(
      'I’ll go buy the medicine for you.',
      'Voy a comprarte la medicina.',
      'Je vais t’acheter le médicament.',
      'Vou comprar o remédio para você.',
      'จะไปซื้อยามาให้',
      'Saya akan belikan obat untuk kamu.',
      'Tôi sẽ đi mua thuốc cho bạn.',
      '薬を買ってきてあげますね。',
    ),
    deckId: 'topik-4',
  },

  // G285 · The more, the more (full form, complementary; variant of G083)
  {
    ko: '-(으)면 -(으)ㄹ수록',
    meaning: L(
      '"the more X, the more Y ..." — emphatic, repeats the verb with -(으)면 and -(으)ㄹ수록',
      '"cuanto más X, más Y ..." — versión enfática que repite el verbo con -(으)면 y -(으)ㄹ수록',
      '«plus X, plus Y» — version emphatique qui répète le verbe avec -(으)면 et -(으)ㄹ수록',
      '"quanto mais X, mais Y" — versão enfática que repete o verbo com -(으)면 e -(으)ㄹ수록',
      '"ยิ่ง ... ก็ยิ่ง ..." — รูปเน้น ใช้กริยาซ้ำกับ -(으)면 และ -(으)ㄹ수록',
      '"semakin ..., semakin ..." — versi penegasan, mengulang verba dengan -(으)면 dan -(으)ㄹ수록',
      '"càng ... thì càng ..." — biến thể nhấn mạnh, lặp động từ với -(으)면 và -(으)ㄹ수록',
      '「〜ば〜ほど(強調)」— -(으)면 と -(으)ㄹ수록 で動詞を繰り返す強形',
    ),
    example: '한국어는 공부하면 공부할수록 재미있어요.',
    trans: L(
      'The more I study Korean, the more I enjoy it.',
      'Cuanto más estudio coreano, más me gusta.',
      'Plus j’étudie le coréen, plus c’est intéressant.',
      'Quanto mais estudo coreano, mais gosto.',
      'ภาษาเกาหลีเรียนยิ่งมาก ยิ่งสนุก',
      'Bahasa Korea semakin dipelajari, semakin menyenangkan.',
      'Tiếng Hàn càng học càng thấy thú vị.',
      '韓国語は勉強すればするほど面白いです。',
    ),
    deckId: 'topik-4',
  },

  // G290 · Should have (short form, complementary)
  {
    ko: '-았/었어야',
    meaning: L(
      '"should have ..." — short colloquial regret form (cf. full -았/었어야 했다)',
      '"debería haber ..." — forma corta coloquial (cf. -았/었어야 했다 completa)',
      '«j’aurais dû ...» — forme courte familière',
      '"deveria ter ..." — forma curta coloquial',
      '"น่าจะ ... ตั้งแต่ตอนนั้น (รูปย่อ)"',
      '"seharusnya ... (bentuk pendek)"',
      '"đáng lẽ phải ... (rút gọn)"',
      '「〜すればよかった(短縮)」',
    ),
    example: '좀 더 일찍 출발했어야지.',
    trans: L(
      'You should have left a bit earlier.',
      'Deberías haber salido un poco antes.',
      'Tu aurais dû partir un peu plus tôt.',
      'Você deveria ter saído mais cedo.',
      'น่าจะออกเดินทางให้เร็วกว่านี้',
      'Mestinya kamu berangkat lebih awal.',
      'Đáng lẽ bạn phải đi sớm hơn.',
      'もう少し早く出発すればよかったのに。',
    ),
    deckId: 'topik-4',
  },
]

import type { LabSentence } from '~/lib/domain'
import { L } from './locale'

/**
 * Explore-mode corpus. TOPIK 1 vocabulary only. Combos of two OFF particles
 * intentionally have no explicit reading — the resolver falls back to the
 * base translation + the generic "telegram style" nuance (i18n key).
 */
export const PARTICLE_SENTENCES: LabSentence[] = [
  {
    id: 's01-jeoneun',
    eojeols: [
      [
        { kind: 'word', text: '저', gloss: L('I (humble)', 'yo', 'je', 'eu', 'ฉัน', 'saya', 'tôi', '私') },
        { kind: 'particle', text: '는', particleId: 'topic', toggleable: true },
      ],
      [
        {
          kind: 'word',
          text: '학생이에요',
          gloss: L('am a student', 'soy estudiante', 'suis étudiant·e', 'sou estudante', 'เป็นนักเรียน', 'adalah pelajar', 'là học sinh', '学生です'),
        },
      ],
    ],
    trans: L('I am a student.', 'Yo soy estudiante.', 'Je suis étudiant·e.', 'Eu sou estudante.', 'ฉันเป็นนักเรียน', 'Saya pelajar.', 'Tôi là học sinh.', '私は学生です。'),
    nuance: L(
      '는 presents the topic: "as for me…". Standard when introducing yourself.',
      '는 presenta el tema: "en cuanto a mí…". Lo normal al presentarte.',
      '는 présente le thème : « quant à moi… ». Habituel pour se présenter.',
      '는 apresenta o tópico: "quanto a mim…". O normal ao se apresentar.',
      '는 บอกหัวเรื่อง: "สำหรับฉัน…" ใช้ตอนแนะนำตัว',
      '는 memperkenalkan topik: "mengenai saya…". Wajar saat memperkenalkan diri.',
      '는 nêu chủ đề: "về phần tôi…". Chuẩn khi tự giới thiệu.',
      '는 は主題を提示（「私について言えば」）。自己紹介の定番。',
    ),
    readings: [
      {
        off: ['topic'],
        trans: L('I\'m a student. (casual)', 'Soy estudiante. (coloquial)', 'Je suis étudiant·e. (familier)', 'Sou estudante. (casual)', 'เป็นนักเรียน (กันเอง)', 'Saya pelajar. (santai)', 'Tôi là học sinh. (thân mật)', '学生です。（くだけた言い方）'),
        nuance: L(
          'Dropping 는 sounds direct and casual — fine when it\'s obvious you mean yourself.',
          'Sin 는 suena directo y casual — normal si ya está claro que hablas de ti.',
          'Sans 는, c\'est direct et familier — naturel si on sait que tu parles de toi.',
          'Sem 는 soa direto e casual — normal se já está claro que fala de você.',
          'ตัด 는 ฟังดูตรงและเป็นกันเอง — ใช้ได้เมื่อรู้อยู่แล้วว่าพูดถึงตัวเอง',
          'Tanpa 는 terdengar langsung dan santai — wajar bila jelas membicarakan dirimu.',
          'Bỏ 는 nghe trực tiếp và thân mật — ổn khi đã rõ bạn nói về mình.',
          '는 を落とすと直接的でくだけた響き。自分の話だと明らかなら自然。',
        ),
      },
    ],
  },
  {
    id: 's02-goyangi',
    eojeols: [
      [
        { kind: 'word', text: '고양이', gloss: L('cat', 'gato', 'chat', 'gato', 'แมว', 'kucing', 'con mèo', '猫') },
        { kind: 'particle', text: '가', particleId: 'subject', toggleable: true },
      ],
      [
        { kind: 'word', text: '우유', gloss: L('milk', 'leche', 'lait', 'leite', 'นม', 'susu', 'sữa', '牛乳') },
        { kind: 'particle', text: '를', particleId: 'object', toggleable: true },
      ],
      [
        { kind: 'word', text: '마셔요', gloss: L('drinks', 'bebe', 'boit', 'bebe', 'ดื่ม', 'minum', 'uống', '飲みます') },
      ],
    ],
    trans: L('The cat drinks milk.', 'El gato bebe leche.', 'Le chat boit du lait.', 'O gato bebe leite.', 'แมวดื่มนม', 'Kucing minum susu.', 'Con mèo uống sữa.', '猫が牛乳を飲みます。'),
    nuance: L(
      '가 highlights WHO drinks; 를 marks WHAT gets drunk.',
      '가 destaca QUIÉN bebe; 를 marca QUÉ es lo bebido.',
      '가 met en relief QUI boit ; 를 marque CE QUI est bu.',
      '가 destaca QUEM bebe; 를 marca O QUE é bebido.',
      '가 เน้นว่าใครดื่ม; 를 บอกว่าดื่มอะไร',
      '가 menonjolkan SIAPA yang minum; 를 menandai APA yang diminum.',
      '가 làm nổi bật AI uống; 를 đánh dấu uống CÁI GÌ.',
      '가 は「誰が」を、를 は「何を」を示す。',
    ),
    readings: [
      {
        off: ['subject'],
        trans: L('The cat drinks milk. (casual)', 'El gato bebe leche. (coloquial)', 'Le chat boit du lait. (familier)', 'O gato bebe leite. (casual)', 'แมวดื่มนม (กันเอง)', 'Kucing minum susu. (santai)', 'Con mèo uống sữa. (thân mật)', '猫、牛乳を飲みます。（くだけた）'),
        nuance: L(
          'Without 가 the role comes from word order alone — casual but clear here.',
          'Sin 가 el rol se deduce solo del orden — casual pero claro aquí.',
          'Sans 가, le rôle vient de l\'ordre des mots — familier mais clair ici.',
          'Sem 가 o papel vem só da ordem — casual mas claro aqui.',
          'ไม่มี 가 ต้องเดาบทบาทจากลำดับคำ — กันเองแต่ยังชัด',
          'Tanpa 가 peran ditebak dari urutan kata — santai tapi masih jelas.',
          'Không có 가, vai trò suy từ trật tự từ — thân mật nhưng vẫn rõ.',
          '가 がないと役割は語順頼み。くだけているがここでは明確。',
        ),
      },
      {
        off: ['object'],
        trans: L('The cat drinks milk. (casual)', 'El gato bebe leche. (coloquial)', 'Le chat boit du lait. (familier)', 'O gato bebe leite. (casual)', 'แมวดื่มนม (กันเอง)', 'Kucing minum susu. (santai)', 'Con mèo uống sữa. (thân mật)', '猫が牛乳、飲みます。（くだけた）'),
        nuance: L(
          'Dropping 를 is THE most common omission in real speech.',
          'Omitir 를 es LA omisión más común en el habla real.',
          'Omettre 를 est L\'omission la plus courante à l\'oral.',
          'Omitir 를 é A omissão mais comum na fala real.',
          'การตัด 를 คือการละที่พบบ่อยที่สุดในภาษาพูดจริง',
          'Melepas 를 adalah pelesapan PALING umum dalam percakapan nyata.',
          'Bỏ 를 là kiểu lược phổ biến NHẤT trong khẩu ngữ.',
          '를 の省略は実際の会話で最も多い省略。',
        ),
      },
    ],
  },
  {
    id: 's03-hakgyo',
    eojeols: [
      [
        { kind: 'word', text: '학교', gloss: L('school', 'escuela', 'école', 'escola', 'โรงเรียน', 'sekolah', 'trường', '学校') },
        { kind: 'particle', text: '에', particleId: 'place-static', toggleable: true },
      ],
      [
        { kind: 'word', text: '가요', gloss: L('go', 'voy', 'vais', 'vou', 'ไป', 'pergi', 'đi', '行きます') },
      ],
    ],
    trans: L('I\'m going to school.', 'Voy a la escuela.', 'Je vais à l\'école.', 'Vou para a escola.', 'ฉันไปโรงเรียน', 'Saya pergi ke sekolah.', 'Tôi đi đến trường.', '学校に行きます。'),
    nuance: L(
      '에 marks the destination of the movement.',
      '에 marca el destino del movimiento.',
      '에 marque la destination du déplacement.',
      '에 marca o destino do movimento.',
      '에 บอกปลายทางของการเคลื่อนที่',
      '에 menandai tujuan pergerakan.',
      '에 đánh dấu đích đến của chuyển động.',
      '에 は移動の到達点を示す。',
    ),
    readings: [
      {
        off: ['place-static'],
        trans: L('I\'m going to school. (casual)', 'Voy a la escuela. (coloquial)', 'Je vais à l\'école. (familier)', 'Vou para a escola. (casual)', 'ไปโรงเรียน (กันเอง)', 'Pergi ke sekolah. (santai)', 'Đi học đây. (thân mật)', '学校行きます。（くだけた）'),
        nuance: L(
          '«학교 가요» is everyday speech — the destination is understood.',
          '«학교 가요» es habitual hablando: el destino se sobreentiende.',
          '« 학교 가요 » est courant à l\'oral : la destination va de soi.',
          '«학교 가요» é comum na fala: o destino fica subentendido.',
          '«학교 가요» พูดกันทั่วไป — ปลายทางเข้าใจได้เอง',
          '«학교 가요» lazim diucapkan — tujuannya sudah dipahami.',
          '«학교 가요» rất thường gặp khi nói — đích đến tự hiểu.',
          '「학교 가요」は日常会話で普通。行き先は文脈で分かる。',
        ),
      },
    ],
  },
  {
    id: 's04-doseogwan',
    eojeols: [
      [
        { kind: 'word', text: '도서관', gloss: L('library', 'biblioteca', 'bibliothèque', 'biblioteca', 'ห้องสมุด', 'perpustakaan', 'thư viện', '図書館') },
        { kind: 'particle', text: '에서', particleId: 'place-action', toggleable: true },
      ],
      [
        { kind: 'word', text: '공부해요', gloss: L('study', 'estudio', 'étudie', 'estudo', 'เรียน', 'belajar', 'học', '勉強します') },
      ],
    ],
    trans: L('I study at the library.', 'Estudio en la biblioteca.', 'J\'étudie à la bibliothèque.', 'Estudo na biblioteca.', 'ฉันเรียนที่ห้องสมุด', 'Saya belajar di perpustakaan.', 'Tôi học ở thư viện.', '図書館で勉強します。'),
    nuance: L(
      '에서 = where the action HAPPENS. Compare with 에 (static place / destination).',
      '에서 = lugar donde OCURRE la acción. Compárala con 에 (lugar estático / destino).',
      '에서 = lieu où l\'action SE PASSE. À comparer avec 에 (lieu statique / destination).',
      '에서 = onde a ação ACONTECE. Compare com 에 (lugar estático / destino).',
      '에서 = ที่ที่การกระทำเกิดขึ้น เทียบกับ 에 (สถานที่คงที่/ปลายทาง)',
      '에서 = tempat aksi TERJADI. Bandingkan dengan 에 (tempat statis / tujuan).',
      '에서 = nơi hành động DIỄN RA. So sánh với 에 (vị trí tĩnh / đích đến).',
      '에서 は動作が行われる場所。에（静的な場所・到達点）と比較せよ。',
    ),
    readings: [
      {
        off: ['place-action'],
        trans: L('I study… library? (sounds incomplete)', 'Estudio… ¿biblioteca? (suena incompleto)', 'J\'étudie… bibliothèque ? (incomplet)', 'Estudo… biblioteca? (soa incompleto)', 'เรียน…ห้องสมุด? (ฟังดูไม่ครบ)', 'Belajar… perpustakaan? (terasa janggal)', 'Học… thư viện? (nghe thiếu)', '勉強します…図書館？（不完全に聞こえる）'),
        nuance: L(
          '에서 is rarely dropped: without it the sentence loses its "where".',
          '에서 casi nunca se omite: sin ella la frase pierde el "dónde".',
          '에서 s\'omet rarement : sans elle, la phrase perd son « où ».',
          '에서 quase nunca cai: sem ela a frase perde o "onde".',
          '에서 แทบไม่ถูกตัด: ถ้าไม่มีประโยคจะขาด "ที่ไหน"',
          '에서 jarang dilepas: tanpanya kalimat kehilangan "di mana"-nya.',
          '에서 hiếm khi bị lược: thiếu nó câu mất nghĩa "ở đâu".',
          '에서 はめったに省略されない。ないと「どこで」が失われる。',
        ),
      },
    ],
  },
  {
    id: 's05-jeodo',
    eojeols: [
      [
        { kind: 'word', text: '저', gloss: L('I (humble)', 'yo', 'je', 'eu', 'ฉัน', 'saya', 'tôi', '私') },
        { kind: 'particle', text: '도', particleId: 'also', toggleable: true },
      ],
      [
        { kind: 'word', text: '커피', gloss: L('coffee', 'café', 'café', 'café', 'กาแฟ', 'kopi', 'cà phê', 'コーヒー') },
        { kind: 'particle', text: '를', particleId: 'object', toggleable: true },
      ],
      [
        { kind: 'word', text: '좋아해요', gloss: L('like', 'me gusta', 'aime', 'gosto', 'ชอบ', 'suka', 'thích', '好きです') },
      ],
    ],
    trans: L('I like coffee too.', 'A mí también me gusta el café.', 'Moi aussi j\'aime le café.', 'Eu também gosto de café.', 'ฉันก็ชอบกาแฟด้วย', 'Saya juga suka kopi.', 'Tôi cũng thích cà phê.', '私もコーヒーが好きです。'),
    nuance: L(
      '도 REPLACES 은/는 — never 저는도. One slot, one particle.',
      '도 REEMPLAZA a 은/는 — nunca 저는도. Un hueco, una partícula.',
      '도 REMPLACE 은/는 — jamais 저는도. Une place, une particule.',
      '도 SUBSTITUI 은/는 — nunca 저는도. Um espaço, uma partícula.',
      '도 ใช้แทน 은/는 — ห้าม 저는도 ช่องเดียว อนุภาคเดียว',
      '도 MENGGANTIKAN 은/는 — jangan 저는도. Satu slot, satu partikel.',
      '도 THAY THẾ 은/는 — không bao giờ 저는도. Một vị trí, một tiểu từ.',
      '도 は 은/는 と置き換わる（저는도 は誤り）。一つの枠に一つの助詞。',
    ),
    readings: [
      {
        off: ['also'],
        trans: L('I like coffee.', 'Me gusta el café.', 'J\'aime le café.', 'Gosto de café.', 'ฉันชอบกาแฟ', 'Saya suka kopi.', 'Tôi thích cà phê.', '私、コーヒーが好きです。'),
        nuance: L(
          'Without 도 you lose the "too". To mark plain topic you\'d say 저는.',
          'Sin 도 pierdes el "también". Para marcar tema normal dirías 저는.',
          'Sans 도, tu perds le « aussi ». Pour un simple thème : 저는.',
          'Sem 도 você perde o "também". Para tópico normal seria 저는.',
          'ไม่มี 도 จะเสียความหมาย "ด้วย" ถ้าจะบอกหัวเรื่องปกติใช้ 저는',
          'Tanpa 도 makna "juga" hilang. Untuk topik biasa pakai 저는.',
          'Không có 도 thì mất nghĩa "cũng". Đánh dấu chủ đề thường thì dùng 저는.',
          '도 がないと「も」が消える。普通の主題なら 저는 と言う。',
        ),
      },
      {
        off: ['object'],
        trans: L('I like coffee too. (casual)', 'A mí también me gusta el café. (coloquial)', 'Moi aussi j\'aime le café. (familier)', 'Eu também gosto de café. (casual)', 'ฉันก็ชอบกาแฟ (กันเอง)', 'Saya juga suka kopi. (santai)', 'Tôi cũng thích cà phê. (thân mật)', '私もコーヒー、好きです。（くだけた）'),
        nuance: L(
          'Dropping 를 here is completely natural in speech.',
          'Omitir 를 aquí es naturalísimo al hablar.',
          'Omettre 를 ici est tout à fait naturel à l\'oral.',
          'Omitir 를 aqui é super natural na fala.',
          'ตัด 를 ตรงนี้เป็นธรรมชาติมากในภาษาพูด',
          'Melepas 를 di sini sangat alami saat bicara.',
          'Bỏ 를 ở đây hoàn toàn tự nhiên khi nói.',
          'ここで 를 を落とすのは会話では完全に自然。',
        ),
      },
    ],
  },
  {
    id: 's06-achime',
    eojeols: [
      [
        { kind: 'word', text: '아침', gloss: L('morning', 'mañana', 'matin', 'manhã', 'เช้า', 'pagi', 'buổi sáng', '朝') },
        { kind: 'particle', text: '에', particleId: 'place-static', toggleable: true },
      ],
      [
        { kind: 'word', text: '빵', gloss: L('bread', 'pan', 'pain', 'pão', 'ขนมปัง', 'roti', 'bánh mì', 'パン') },
        { kind: 'particle', text: '을', particleId: 'object', toggleable: true },
      ],
      [
        { kind: 'word', text: '먹어요', gloss: L('eat', 'como', 'mange', 'como', 'กิน', 'makan', 'ăn', '食べます') },
      ],
    ],
    trans: L('In the morning I eat bread.', 'Por la mañana como pan.', 'Le matin, je mange du pain.', 'De manhã eu como pão.', 'ตอนเช้าฉันกินขนมปัง', 'Pagi hari saya makan roti.', 'Buổi sáng tôi ăn bánh mì.', '朝、パンを食べます。'),
    nuance: L(
      '에 also marks TIME: 아침에 = "in the morning". Note 빵 takes 을 (ends in consonant).',
      '에 también marca TIEMPO: 아침에 = "por la mañana". Fíjate: 빵 lleva 을 (termina en consonante).',
      '에 marque aussi le TEMPS : 아침에 = « le matin ». Note : 빵 prend 을 (finit par consonne).',
      '에 também marca TEMPO: 아침에 = "de manhã". Note: 빵 leva 을 (termina em consoante).',
      '에 ใช้บอกเวลาได้ด้วย: 아침에 = "ตอนเช้า" สังเกต 빵 ใช้ 을 (ลงท้ายพยัญชนะ)',
      '에 juga menandai WAKTU: 아침에 = "pagi hari". Catat: 빵 pakai 을 (akhiran konsonan).',
      '에 còn đánh dấu THỜI GIAN: 아침에 = "vào buổi sáng". Lưu ý: 빵 lấy 을 (kết thúc phụ âm).',
      '에 は時も示す：아침에＝「朝に」。빵 は子音終わりなので 을。',
    ),
    readings: [
      {
        off: ['place-static'],
        trans: L('I eat morning-bread(?) — ambiguous', 'Como pan de mañana(?) — ambiguo', 'Je mange du pain du matin(?) — ambigu', 'Como pão da manhã(?) — ambíguo', 'กิน "ขนมปังตอนเช้า"(?) — กำกวม', 'Makan roti pagi(?) — ambigu', 'Ăn "bánh mì buổi sáng"(?) — mơ hồ', '「朝パン」を食べる？ — 曖昧'),
        nuance: L(
          'Without 에, «아침 빵» can read as a compound ("breakfast bread"). The particle disambiguates.',
          'Sin 에, «아침 빵» puede leerse como compuesto ("pan de desayuno"). La partícula desambigua.',
          'Sans 에, « 아침 빵 » peut se lire comme un composé (« pain du matin »). La particule lève l\'ambiguïté.',
          'Sem 에, «아침 빵» pode virar composto ("pão de café da manhã"). A partícula desambigua.',
          'ถ้าไม่มี 에, «아침 빵» อาจกลายเป็นคำประสม ("ขนมปังเช้า") อนุภาคช่วยให้ชัด',
          'Tanpa 에, «아침 빵» bisa terbaca sebagai kata majemuk ("roti pagi"). Partikel menghilangkan ambiguitas.',
          'Không có 에, «아침 빵» có thể hiểu thành từ ghép ("bánh mì sáng"). Tiểu từ giúp rõ nghĩa.',
          '에 がないと「아침 빵」は複合語（朝のパン）にも読める。助詞が曖昧さを消す。',
        ),
      },
      {
        off: ['object'],
        trans: L('In the morning I eat bread. (casual)', 'Por la mañana como pan. (coloquial)', 'Le matin, je mange du pain. (familier)', 'De manhã como pão. (casual)', 'ตอนเช้ากินขนมปัง (กันเอง)', 'Pagi hari makan roti. (santai)', 'Buổi sáng ăn bánh mì. (thân mật)', '朝、パン食べます。（くだけた）'),
        nuance: L(
          'Casual and very common — the object is obvious.',
          'Casual y muy común — el objeto es obvio.',
          'Familier et très courant — l\'objet est évident.',
          'Casual e muito comum — o objeto é óbvio.',
          'กันเองและพบบ่อยมาก — กรรมชัดเจนอยู่แล้ว',
          'Santai dan sangat umum — objeknya sudah jelas.',
          'Thân mật và rất phổ biến — tân ngữ đã rõ.',
          'くだけた言い方で非常によくある。目的語は明白。',
        ),
      },
    ],
  },
  {
    id: 's07-biga',
    eojeols: [
      [
        { kind: 'word', text: '비', gloss: L('rain', 'lluvia', 'pluie', 'chuva', 'ฝน', 'hujan', 'mưa', '雨') },
        { kind: 'particle', text: '가', particleId: 'subject', toggleable: true },
      ],
      [
        { kind: 'word', text: '와요', gloss: L('comes', 'viene', 'vient', 'vem', 'มา', 'datang', 'đến', '来ます') },
      ],
    ],
    trans: L('It\'s raining. (lit. "rain comes")', 'Está lloviendo. (lit. «la lluvia viene»)', 'Il pleut. (litt. « la pluie vient »)', 'Está chovendo. (lit. "a chuva vem")', 'ฝนกำลังตก (ตรงตัว: "ฝนมา")', 'Sedang hujan. (harfiah: "hujan datang")', 'Trời đang mưa. (nghĩa đen: "mưa đến")', '雨が降っています。（直訳「雨が来る」）'),
    nuance: L(
      'Weather "shows up" as new info → always 가, never 는 here.',
      'El clima "aparece" como info nueva → siempre 가, nunca 는 aquí.',
      'La météo « surgit » comme info nouvelle → toujours 가, jamais 는 ici.',
      'O clima "surge" como info nova → sempre 가, nunca 는 aqui.',
      'สภาพอากาศ "โผล่มา" เป็นข้อมูลใหม่ → ใช้ 가 เสมอ ไม่ใช่ 는',
      'Cuaca "muncul" sebagai info baru → selalu 가, bukan 는 di sini.',
      'Thời tiết "xuất hiện" như thông tin mới → luôn là 가, không phải 는.',
      '天気は新情報として「現れる」→ ここでは常に 가。는 は不可。',
    ),
    readings: [
      {
        off: ['subject'],
        trans: L('It\'s raining. (very casual)', 'Está lloviendo. (muy coloquial)', 'Il pleut. (très familier)', 'Está chovendo. (bem casual)', 'ฝนตก (กันเองมาก)', 'Hujan. (sangat santai)', 'Mưa rồi. (rất thân mật)', '雨、降ってます。（とてもくだけた）'),
        nuance: L(
          '«비 와요» is everyday talk. But careful: «비는 와요» would sound contrastive ("as for rain, it IS raining, but…").',
          '«비 와요» se dice a diario. Ojo: «비는 와요» sonaría a contraste ("llover, llueve… pero").',
          '« 비 와요 » est du quotidien. Attention : « 비는 와요 » sonnerait contrastif (« pleuvoir, il pleut… mais »).',
          '«비 와요» é fala do dia a dia. Cuidado: «비는 와요» soaria contrastivo ("chover, chove… mas").',
          '«비 와요» พูดกันทุกวัน ระวัง: «비는 와요» จะกลายเป็นเชิงเปรียบต่าง ("ฝนน่ะตก…แต่")',
          '«비 와요» bahasa sehari-hari. Hati-hati: «비는 와요» terdengar kontras ("hujan sih hujan… tapi").',
          '«비 와요» là cách nói hằng ngày. Cẩn thận: «비는 와요» nghe như đối chiếu ("mưa thì có mưa… nhưng").',
          '「비 와요」は日常語。ただし「비는 와요」だと対比（「雨は降るが…」）に聞こえる。',
        ),
      },
    ],
  },
]

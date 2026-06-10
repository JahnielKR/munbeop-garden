import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 2 grammar — 43 entries aligned with `seed/topik-spine.json`
 * (spine ids in the topik.2 + transversal G144–G160 belonging to level 2).
 *
 * Themes (in source order):
 *   1. Habilidad y permiso              ( 1)
 *   2. Tiempo y secuencia               ( 5)
 *   3. Nominalización y conjetura       ( 3)
 *   4. Obligación, prohibición, sufic.  ( 4)
 *   5. Intención, propuesta, decisión   ( 3)
 *   6. Auxiliares del nivel             ( 4)
 *   7. Causa, contraste, comparación    ( 5)
 *   8. Preguntas indirectas y matices   ( 4)
 *   9. Reacciones y matices             ( 8)
 *   10. Pasiva básica y otros           ( 4)
 *   11. Cambio y adverbios temporales   ( 2)
 */
export const TOPIK_2_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Habilidad y permiso
  // ─────────────────────────────────────────────────────────────────────────

  // G033 · Can / cannot (ability)
  {
    ko: '-(으)ㄹ 수 있다/없다',
    meaning: L(
      'can / cannot — ability, possibility',
      'poder / no poder — habilidad o posibilidad',
      'pouvoir / ne pas pouvoir — capacité ou possibilité',
      'poder / não poder — habilidade ou possibilidade',
      '"ทำได้ / ทำไม่ได้" — ความสามารถ / ความเป็นไปได้',
      '"bisa / tidak bisa" — kemampuan atau kemungkinan',
      '"có thể / không thể" — khả năng hoặc khả thi',
      '「〜できる / 〜できない」— 可能・能力',
    ),
    example: '저는 한국어를 조금 할 수 있어요.',
    trans: L(
      'I can speak a little Korean.',
      'Puedo hablar un poco de coreano.',
      'Je peux parler un peu coréen.',
      'Eu sei falar um pouco de coreano.',
      'ฉันพูดภาษาเกาหลีได้นิดหน่อย',
      'Saya bisa berbahasa Korea sedikit.',
      'Tôi có thể nói một chút tiếng Hàn.',
      '私は韓国語が少しできます。',
    ),
    usageNotes: L(
      'Expresses ability OR possibility — "can / cannot do". Form: vowel/ㄹ stem → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다); consonant stem → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 here is a noun meaning "way / means", so the literal reading is "there exists / does not exist a way to do X". The 있다/없다 conjugates normally (있어요 / 있습니다 / 없어요 / 없어서).\n\nCompared with 못 (the TOPIK 1 inability marker): 못 is sharper and tends to mean "blocked from doing" in this specific situation, while -(으)ㄹ 수 없다 is a broader statement of impossibility or lack of capability. 운전 못 해요 sounds like "I can\'t drive (right now / for this trip)"; 운전할 수 없어요 sounds like "I don\'t / can\'t drive (as a fact about me)". For permission ("can I sit here?") Korean uses the different -아/어도 되다 — never -(으)ㄹ 수 있다 for that. In casual speech 수 commonly contracts: 갈 수 있어 → 갈 수 있어, but the spelling stays the same.',
      'Expresa capacidad O posibilidad — "poder / no poder hacer". Forma: raíz en vocal/ㄹ → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다); raíz en consonante → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 acá es un sustantivo que significa "manera / forma", así que la lectura literal es "existe / no existe una manera de hacer X". El 있다/없다 se conjuga normal (있어요 / 있습니다 / 없어요 / 없어서).\n\nComparado con 못 (el marcador de incapacidad de TOPIK 1): 못 es más cortante y suele significar "bloqueado de hacer" en esa situación puntual, mientras que -(으)ㄹ 수 없다 es una declaración más amplia de imposibilidad o falta de capacidad. 운전 못 해요 suena a "no puedo manejar (ahora / para este viaje)"; 운전할 수 없어요 suena a "no manejo (como hecho sobre mí)". Para permiso ("¿puedo sentarme acá?") el coreano usa el muy distinto -아/어도 되다 — nunca -(으)ㄹ 수 있다 para eso. En habla casual 수 suele pronunciarse comprimido, aunque la escritura no cambia.',
      'Exprime la capacité OU la possibilité — « pouvoir / ne pas pouvoir faire ». Forme : racine en voyelle ou ㄹ → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다) ; racine en consonne → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 est ici un nom signifiant « moyen, façon » : la lecture littérale est « il existe / il n\'existe pas un moyen de faire X ». Le 있다/없다 se conjugue normalement (있어요 / 있습니다 / 없어요 / 없어서).\n\nÀ comparer avec 못 (le marqueur d\'incapacité vu en TOPIK 1) : 못 est plus tranchant et indique souvent « empêché de faire » dans la situation présente, alors que -(으)ㄹ 수 없다 énonce une impossibilité ou une absence de capacité plus large. 운전 못 해요 sonne « je ne peux pas conduire (là, maintenant) » ; 운전할 수 없어요 sonne « je ne conduis pas / ne sais pas conduire (en tant que fait sur moi) ». Pour la permission (« je peux m\'asseoir ici ? »), le coréen emploie l\'autre forme -아/어도 되다 — jamais -(으)ㄹ 수 있다. À l\'oral, 수 se prononce souvent allégé, mais l\'écriture ne change pas.',
      'Expressa capacidade OU possibilidade — "poder / não poder fazer". Forma: radical em vogal/ㄹ → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다); radical em consoante → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 aqui é um substantivo que significa "maneira / jeito", então a leitura literal é "existe / não existe uma maneira de fazer X". O 있다/없다 conjuga normalmente (있어요 / 있습니다 / 없어요 / 없어서).\n\nComparado com 못 (o marcador de incapacidade do TOPIK 1): 못 é mais cortante e costuma significar "bloqueado de fazer" naquela situação, enquanto -(으)ㄹ 수 없다 é uma declaração mais ampla de impossibilidade ou falta de capacidade. 운전 못 해요 soa "não consigo dirigir (agora / nesta viagem)"; 운전할 수 없어요 soa "eu não dirijo (como fato sobre mim)". Para permissão ("posso me sentar aqui?") o coreano usa o bem diferente -아/어도 되다 — nunca -(으)ㄹ 수 있다 para isso. Na fala casual, 수 costuma sair comprimido, mas a escrita não muda.',
      'แสดงความสามารถหรือความเป็นไปได้ — "ทำได้ / ทำไม่ได้". รูป: รากลงสระ/ㄹ → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다); รากลงพยัญชนะ → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 ในที่นี้คือคำนามแปลว่า "วิธี / ทาง" ดังนั้นความหมายตามตัวอักษรคือ "มี/ไม่มี วิธีที่จะทำ X". 있다/없다 ผันปกติ (있어요 / 있습니다 / 없어요 / 없어서)\n\nเทียบกับ 못 (รูปบอก "ทำไม่ได้" จาก TOPIK 1): 못 ห้วนกว่าและมักหมายถึง "ถูกขัดในสถานการณ์นี้" ส่วน -(으)ㄹ 수 없다 บอกความเป็นไปไม่ได้/ขาดความสามารถในวงกว้างกว่า. 운전 못 해요 ฟังเหมือน "ขับไม่ได้ตอนนี้/สำหรับทริปนี้" ส่วน 운전할 수 없어요 ฟังเหมือน "ฉันขับรถไม่ได้ (เป็นข้อเท็จจริงเกี่ยวกับฉัน)". การขออนุญาต ("นั่งตรงนี้ได้ไหม?") ใช้ -아/어도 되다 เท่านั้น ห้ามใช้ -(으)ㄹ 수 있다. ในภาษาพูดเสียง 수 มักออกเสียงสั้นลงแต่ตัวสะกดไม่เปลี่ยน',
      'Mengungkapkan kemampuan ATAU kemungkinan — "bisa / tidak bisa melakukan". Bentuk: akar berakhir vokal/ㄹ → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다); akar berakhir konsonan → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 di sini adalah kata benda bermakna "cara / jalan", jadi bacaan harfiahnya adalah "ada / tidak ada cara untuk melakukan X". 있다/없다 dikonjugasi seperti biasa (있어요 / 있습니다 / 없어요 / 없어서).\n\nDibanding 못 (penanda ketakmampuan dari TOPIK 1): 못 lebih tegas dan biasanya bermakna "terhalang melakukan" dalam situasi spesifik, sementara -(으)ㄹ 수 없다 adalah pernyataan ketidakmungkinan atau ketakmampuan yang lebih umum. 운전 못 해요 terdengar "saya tidak bisa menyetir (sekarang / untuk perjalanan ini)"; 운전할 수 없어요 terdengar "saya tidak bisa menyetir (sebagai fakta tentang saya)". Untuk izin ("boleh saya duduk di sini?") bahasa Korea pakai -아/어도 되다 yang berbeda — jangan pernah -(으)ㄹ 수 있다 untuk itu. Dalam percakapan, 수 sering diucapkan dengan ringkas tapi tulisannya tidak berubah.',
      'Diễn tả khả năng HOẶC khả thi — "có thể / không thể làm". Hình thức: gốc kết nguyên âm/ㄹ → -ㄹ 수 있다/없다 (가다 → 갈 수 있다, 살다 → 살 수 있다); gốc kết phụ âm → -을 수 있다/없다 (먹다 → 먹을 수 있다). 수 ở đây là danh từ nghĩa "cách / phương cách", nên nghĩa đen là "có / không có cách để làm X". 있다/없다 chia bình thường (있어요 / 있습니다 / 없어요 / 없어서).\n\nSo với 못 (dấu hiệu bất khả từ TOPIK 1): 못 dứt khoát hơn và thường nghĩa "bị cản trong tình huống này", còn -(으)ㄹ 수 없다 phát biểu một sự bất khả hoặc thiếu năng lực rộng hơn. 운전 못 해요 nghe như "tôi không lái được (lúc này / cho chuyến này)"; 운전할 수 없어요 nghe như "tôi không lái xe (như một sự thật về tôi)". Để xin phép ("tôi ngồi đây được không?") tiếng Hàn dùng -아/어도 되다 hoàn toàn khác — không bao giờ dùng -(으)ㄹ 수 있다. Trong khẩu ngữ 수 thường được phát âm gọn lại nhưng chính tả không đổi.',
      '能力や可能性を表す「〜できる／〜できない」。形: 母音または ㄹ 語幹 → -ㄹ 수 있다/없다(가다 → 갈 수 있다、살다 → 살 수 있다); 子音語幹 → -을 수 있다/없다(먹다 → 먹을 수 있다)。수 はここでは「方法・手段」を意味する名詞で、直訳すると「Xする方法がある／ない」。있다/없다 は通常通り活用する(있어요 / 있습니다 / 없어요 / 없어서)。\n\nTOPIK 1 で習った不可能の 못 との対比: 못 はより鋭く「(その場で)できない／妨げられている」に近く、-(으)ㄹ 수 없다 はもっと広い意味の「不可能・能力の欠如」を述べる。운전 못 해요 は「(今／この旅行では)運転できない」、운전할 수 없어요 は「(私という人について)運転できない・しない」のニュアンス。許可(「ここに座ってもいいですか?」)には別物の -아/어도 되다 を使う — -(으)ㄹ 수 있다 は許可の意味では絶対に使わない。会話では 수 が圧縮されて発音されるが、表記は変わらない。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Tiempo y secuencia
  // ─────────────────────────────────────────────────────────────────────────

  // G034 · When (moment / period)
  {
    ko: '-(으)ㄹ 때',
    meaning: L(
      '"when / at the moment of" — simultaneous or habitual',
      '"cuando / en el momento de" — simultáneo o habitual',
      '"quand / au moment où" — simultané ou habituel',
      '"quando / no momento em que" — simultâneo ou habitual',
      '"เวลา / เมื่อ" — ขณะ หรือ เป็นนิสัย',
      '"ketika / waktu" — bersamaan atau kebiasaan',
      '"khi / lúc" — đồng thời hoặc thói quen',
      '「〜とき / 〜時」— 同時・習慣',
    ),
    example: '심심할 때 음악을 들어요.',
    trans: L(
      'When I’m bored, I listen to music.',
      'Cuando me aburro, escucho música.',
      'Quand je m’ennuie, j’écoute de la musique.',
      'Quando fico entediado, ouço música.',
      'เวลาเบื่อ ฉันฟังเพลง',
      'Ketika bosan, saya mendengarkan musik.',
      'Khi buồn chán, tôi nghe nhạc.',
      '退屈なとき音楽を聞きます。',
    ),
    usageNotes: L(
      'Marks the moment OR the period at which something happens — "when / while / at the time of". Form: vowel/ㄹ stem → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때, ㄹ kept); consonant stem → -을 때 (먹다 → 먹을 때). For past events ("when I went / used to"), use -았/었을 때 (어렸을 때 "when I was young"). For nouns of time the form is just N + 때 (방학 때 "during vacation", 시험 때 "at exam time").\n\nClose neighbor to watch: -(으)면 ("if / when"). -(으)ㄹ 때 frames the whole period the second clause happens IN ("while it\'s X..."), while -(으)면 frames a condition or trigger ("if it becomes X, then..."). 비가 올 때 우산을 써요 "I use an umbrella WHEN/WHILE it\'s raining"; 비가 오면 집에 있어요 "if/when it rains, I stay home". Past 았/었을 때 is for completed-then-back-to-present moments (when I arrived...); -(으)ㄹ 때 with present feels more habitual or general.',
      'Marca el momento O el período en que algo ocurre — "cuando / mientras". Forma: raíz en vocal/ㄹ → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때, ㄹ se mantiene); raíz en consonante → -을 때 (먹다 → 먹을 때). Para eventos pasados ("cuando fui / cuando era"), usá -았/었을 때 (어렸을 때 "cuando era chico/a"). Con sustantivos de tiempo se usa N + 때 (방학 때 "durante las vacaciones", 시험 때 "en época de exámenes").\n\nVecino cercano: -(으)면 ("si / cuando"). -(으)ㄹ 때 enmarca el período en que ocurre la segunda cláusula ("mientras es X..."), mientras que -(으)면 enmarca una condición o disparador ("si se vuelve X, entonces..."). 비가 올 때 우산을 써요 "uso paraguas CUANDO está lloviendo"; 비가 오면 집에 있어요 "si llueve, me quedo en casa". El pasado -았/었을 때 marca momentos puntuales (cuando llegué...); -(으)ㄹ 때 con presente suena más habitual o general.',
      'Marque le moment OU la période où quelque chose se produit — « quand / lorsque / pendant que ». Forme : racine en voyelle/ㄹ → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때, ㄹ conservé) ; racine en consonne → -을 때 (먹다 → 먹을 때). Pour des événements passés (« quand je suis allé / quand j\'étais »), employer -았/었을 때 (어렸을 때 « quand j\'étais petit »). Avec un nom de temps, on emploie N + 때 (방학 때 « pendant les vacances », 시험 때 « en période d\'examens »).\n\nVoisin proche : -(으)면 (« si / quand »). -(으)ㄹ 때 cadre la période durant laquelle se passe la deuxième proposition (« pendant que c\'est X... »), tandis que -(으)면 introduit une condition ou un déclencheur (« si ça devient X, alors... »). 비가 올 때 우산을 써요 « j\'utilise un parapluie QUAND il pleut » ; 비가 오면 집에 있어요 « s\'il pleut, je reste à la maison ». Le passé -았/었을 때 marque des moments précis (quand je suis arrivé...) ; au présent, -(으)ㄹ 때 sonne plus habituel ou général.',
      'Marca o momento OU o período em que algo acontece — "quando / enquanto". Forma: radical em vogal/ㄹ → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때, ㄹ mantido); radical em consoante → -을 때 (먹다 → 먹을 때). Para eventos passados ("quando fui / quando era"), use -았/었을 때 (어렸을 때 "quando era criança"). Com substantivos de tempo se usa N + 때 (방학 때 "durante as férias", 시험 때 "em época de provas").\n\nVizinho próximo: -(으)면 ("se / quando"). -(으)ㄹ 때 enquadra o período em que ocorre a segunda oração ("enquanto for X..."), enquanto -(으)면 enquadra uma condição ou gatilho ("se virar X, então..."). 비가 올 때 우산을 써요 "uso guarda-chuva QUANDO está chovendo"; 비가 오면 집에 있어요 "se chover, fico em casa". O passado -았/었을 때 marca momentos específicos (quando cheguei...); -(으)ㄹ 때 com presente soa mais habitual ou geral.',
      'แสดงช่วงเวลา/ขณะที่บางสิ่งเกิดขึ้น — "เวลา / เมื่อ / ตอน". รูป: รากลงสระ/ㄹ → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때 ㄹ คงไว้); รากลงพยัญชนะ → -을 때 (먹다 → 먹을 때). สำหรับเหตุการณ์อดีต ("ตอนที่ไป / สมัยเป็นเด็ก") ใช้ -았/었을 때 (어렸을 때 "ตอนเด็ก ๆ"). กับคำนามบอกเวลาใช้ N + 때 (방학 때 "ช่วงปิดเทอม", 시험 때 "ช่วงสอบ")\n\nเพื่อนบ้านที่ต้องระวัง: -(으)면 ("ถ้า / เมื่อ"). -(으)ㄹ 때 บอกช่วงเวลาที่ประโยคสองเกิดขึ้น ("ขณะที่เป็น X..."), ส่วน -(으)면 บอกเงื่อนไขหรือตัวกระตุ้น ("ถ้าเป็น X ก็..."). 비가 올 때 우산을 써요 "ใช้ร่มตอนที่ฝนตก", 비가 오면 집에 있어요 "ถ้าฝนตกฉันจะอยู่บ้าน". รูปอดีต -았/었을 때 บอกช่วงเวลาเฉพาะที่ (ตอนที่มาถึง...) ส่วน -(으)ㄹ 때 รูปปัจจุบันออกแนวเหตุการณ์ที่เกิดเป็นนิสัย/ทั่วไป',
      'Menandai momen ATAU periode saat sesuatu terjadi — "ketika / saat / waktu". Bentuk: akar berakhir vokal/ㄹ → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때 dengan ㄹ tetap); akar berakhir konsonan → -을 때 (먹다 → 먹을 때). Untuk peristiwa lampau ("ketika saya pergi / ketika kecil"), pakai -았/었을 때 (어렸을 때 "ketika masih kecil"). Untuk kata benda waktu pakai N + 때 (방학 때 "saat liburan", 시험 때 "saat ujian").\n\nTetangga dekat yang harus dibedakan: -(으)면 ("kalau / ketika"). -(으)ㄹ 때 mengerangkai periode terjadinya klausa kedua ("selama X..."), sedangkan -(으)면 mengerangkai kondisi atau pemicu ("kalau jadi X, maka..."). 비가 올 때 우산을 써요 "saya pakai payung KETIKA hujan"; 비가 오면 집에 있어요 "kalau hujan saya di rumah". Lampau -았/었을 때 menandai momen spesifik (saat saya tiba...); -(으)ㄹ 때 dengan kini terasa lebih habitual atau umum.',
      'Đánh dấu khoảnh khắc HOẶC giai đoạn mà điều gì đó xảy ra — "khi / lúc / khi đang". Hình thức: gốc kết nguyên âm/ㄹ → -ㄹ 때 (가다 → 갈 때, 살다 → 살 때 ㄹ giữ); gốc kết phụ âm → -을 때 (먹다 → 먹을 때). Cho sự kiện quá khứ ("khi tôi đi / khi còn nhỏ"), dùng -았/었을 때 (어렸을 때 "khi còn nhỏ"). Với danh từ chỉ thời gian, dùng N + 때 (방학 때 "trong kỳ nghỉ", 시험 때 "vào kỳ thi").\n\nHàng xóm cần phân biệt: -(으)면 ("nếu / khi"). -(으)ㄹ 때 đóng khung khoảng thời gian xảy ra vế hai ("trong khi là X..."), còn -(으)면 đóng khung điều kiện hoặc kích hoạt ("nếu trở thành X, thì..."). 비가 올 때 우산을 써요 "tôi dùng ô KHI đang mưa"; 비가 오면 집에 있어요 "nếu mưa thì tôi ở nhà". Quá khứ -았/었을 때 chỉ những khoảnh khắc cụ thể (khi tôi đến...); -(으)ㄹ 때 với hiện tại nghe thiên về thói quen hoặc khái quát.',
      '出来事が起こる瞬間や期間を表す「〜とき／〜時に」。形: 母音または ㄹ 語幹 → -ㄹ 때(가다 → 갈 때、살다 → 살 때 で ㄹ 保持); 子音語幹 → -을 때(먹다 → 먹을 때)。過去の出来事(「行ったとき／子どもだったころ」)には -았/었을 때 を使う(어렸을 때「子どもの頃」)。時を表す名詞には N + 때 を使う(방학 때「休み中」、시험 때「試験のとき」)。\n\n注意したい近隣の -(으)면(「もし／〜たら／〜と」)。-(으)ㄹ 때 は後節が起きる「期間・場面」を表す(「Xのあいだ…」)、-(으)면 は「条件」や「きっかけ」を表す(「Xになれば…」)。비가 올 때 우산을 써요「雨のとき傘をさす」、비가 오면 집에 있어요「雨が降ったら家にいる」。過去 -았/었을 때 は具体的な時点(「着いたとき…」)、現在の -(으)ㄹ 때 は習慣や一般論として響くことが多い。',
    ),
    deckId: 'topik-2',
  },

  // G035 · Before doing
  {
    ko: '-기 전에',
    meaning: L(
      '"before (doing)" — also N + 전에 with time nouns',
      '"antes de (hacer)" — también N + 전에 con sustantivos de tiempo',
      '"avant de (faire)" — aussi N + 전에 avec un nom de temps',
      '"antes de (fazer)" — também N + 전에 com substantivos de tempo',
      '"ก่อน ...(ทำ)" — รวมถึง N + 전에',
      '"sebelum (melakukan)" — juga N + 전에 dengan kata waktu',
      '"trước khi (làm)" — cũng N + 전에 với danh từ thời gian',
      '「〜する前に」(名詞の前は N + 전에)',
    ),
    example: '자기 전에 이를 닦아요.',
    trans: L(
      'I brush my teeth before sleeping.',
      'Me cepillo los dientes antes de dormir.',
      'Je me brosse les dents avant de dormir.',
      'Eu escovo os dentes antes de dormir.',
      'แปรงฟันก่อนนอน',
      'Saya menyikat gigi sebelum tidur.',
      'Tôi đánh răng trước khi đi ngủ.',
      '寝る前に歯を磨きます。',
    ),
    usageNotes: L(
      'Marks "before doing X". Attach -기 전에 to ANY verb stem regardless of vowel/consonant ending — no -으- helper is needed, because 기 starts the nominalizer 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). With a time noun, use N + 전에 directly: 시험 전에 ("before the exam"), 일주일 전에 ("a week ago / one week before"), 두 시간 전에 ("two hours before").\n\nThe first clause stays present-tense in form even when the meaning is past — 어제 자기 전에 책을 읽었어요 "yesterday before sleeping I read a book" (NOT 잤기 전에). Pair with -(으)ㄴ 후에 / 다음에 for "after doing X" — the two form the most common before/after frame in Korean. For ordering past events without a present-tense reading, the more literary -기에 앞서 exists but is uncommon in speech. Don\'t confuse with -기 위해서 ("in order to"), which uses the same 기 nominalizer but means purpose, not time.',
      'Marca "antes de hacer X". Pegá -기 전에 a CUALQUIER raíz verbal sin importar si termina en vocal o consonante — no necesitás el -으- de ayuda, porque 기 abre con el nominalizador 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). Con sustantivos de tiempo, va N + 전에 directo: 시험 전에 ("antes del examen"), 일주일 전에 ("hace una semana / una semana antes"), 두 시간 전에 ("dos horas antes").\n\nLa primera cláusula queda en presente aunque el sentido sea pasado — 어제 자기 전에 책을 읽었어요 "ayer antes de dormir leí un libro" (NO 잤기 전에). Se empareja con -(으)ㄴ 후에 / 다음에 para "después de hacer X" — los dos forman el marco antes/después más usado del coreano. Para ordenar eventos pasados sin lectura en presente existe el más literario -기에 앞서, pero raramente aparece en habla. No lo confundas con -기 위해서 ("para / con el fin de"), que usa el mismo nominalizador 기 pero indica propósito, no tiempo.',
      'Marque « avant de faire X ». Colle -기 전에 à n\'importe quelle racine verbale, qu\'elle finisse par voyelle ou par consonne — pas besoin du -으- de soutien, puisque 기 introduit le nominalisateur 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). Avec un nom de temps, on emploie directement N + 전에 : 시험 전에 (« avant l\'examen »), 일주일 전에 (« il y a une semaine / une semaine avant »), 두 시간 전에 (« deux heures plus tôt »).\n\nLa première proposition reste au présent dans la forme même si le sens est passé — 어제 자기 전에 책을 읽었어요 « hier, avant de dormir, j\'ai lu un livre » (et non 잤기 전에). Se combine avec -(으)ㄴ 후에 / 다음에 pour « après avoir fait X » — ces deux formes constituent le cadre avant/après le plus courant en coréen. Pour ordonner des événements passés sans lecture au présent, le plus littéraire -기에 앞서 existe, mais on l\'entend peu. À ne pas confondre avec -기 위해서 (« afin de »), qui emploie le même 기 mais marque le but, pas le temps.',
      'Marca "antes de fazer X". Anexe -기 전에 a QUALQUER radical verbal independente de terminar em vogal ou consoante — não precisa do -으- auxiliar, porque 기 abre com o nominalizador 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). Com substantivos de tempo use N + 전에 direto: 시험 전에 ("antes da prova"), 일주일 전에 ("uma semana atrás / uma semana antes"), 두 시간 전에 ("duas horas antes").\n\nA primeira oração fica no presente mesmo quando o sentido é passado — 어제 자기 전에 책을 읽었어요 "ontem antes de dormir li um livro" (NÃO 잤기 전에). Combina com -(으)ㄴ 후에 / 다음에 para "depois de fazer X" — os dois formam a moldura antes/depois mais comum em coreano. Para ordenar eventos passados sem leitura no presente, existe o mais literário -기에 앞서, mas raramente aparece na fala. Não confunda com -기 위해서 ("a fim de / para"), que usa o mesmo 기 mas indica propósito, não tempo.',
      'แสดงความหมาย "ก่อนทำ X". เกาะ -기 전에 ที่ราก "ทุก" คำกริยา ไม่ว่าจะลงสระหรือพยัญชนะ — ไม่ต้องมี -으- ช่วย เพราะ 기 ขึ้นต้นด้วยตัวเปลี่ยนเป็นนาม 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). กับคำนามบอกเวลา ใช้ N + 전에 ตรง ๆ: 시험 전에 ("ก่อนสอบ"), 일주일 전에 ("เมื่อสัปดาห์ที่แล้ว / ก่อนหน้านี้หนึ่งสัปดาห์"), 두 시간 전에 ("สองชั่วโมงก่อน")\n\nประโยคแรกอยู่ในรูปปัจจุบันแม้ความหมายเป็นอดีต — 어제 자기 전에 책을 읽었어요 "เมื่อวานก่อนนอนอ่านหนังสือ" (ห้าม 잤기 전에). คู่กับ -(으)ㄴ 후에 / 다음에 ที่แปลว่า "หลังจากทำ X" — สองตัวนี้เป็นโครงก่อน/หลังที่ใช้บ่อยที่สุดในภาษาเกาหลี. ถ้าจะเรียงเหตุการณ์อดีตโดยไม่ต้องคงรูปปัจจุบัน มีรูปเชิงวรรณกรรม -기에 앞서 อยู่ แต่ไม่ค่อยใช้ในการพูด. อย่าสับสนกับ -기 위해서 ("เพื่อ / เพื่อที่จะ") ที่ใช้ 기 ตัวเดียวกันแต่หมายถึงจุดประสงค์ ไม่ใช่เวลา',
      'Menandai "sebelum melakukan X". Tempelkan -기 전에 ke akar verba MANA SAJA, baik berakhiran vokal maupun konsonan — tidak butuh -으- penyangga, karena 기 di sini adalah nominalizer 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). Dengan kata benda waktu, langsung pakai N + 전에: 시험 전에 ("sebelum ujian"), 일주일 전에 ("seminggu lalu / seminggu sebelumnya"), 두 시간 전에 ("dua jam sebelumnya").\n\nKlausa pertama tetap bentuk kini meskipun maknanya lampau — 어제 자기 전에 책을 읽었어요 "kemarin sebelum tidur saya baca buku" (BUKAN 잤기 전에). Berpasangan dengan -(으)ㄴ 후에 / 다음에 untuk "setelah melakukan X" — keduanya membentuk kerangka sebelum/sesudah paling umum dalam bahasa Korea. Untuk mengurutkan kejadian lampau tanpa membaca sebagai kini, ada bentuk lebih bersastra -기에 앞서, tetapi jarang muncul dalam percakapan. Jangan tertukar dengan -기 위해서 ("agar / untuk"), yang juga pakai 기 tapi menandai tujuan, bukan waktu.',
      'Đánh dấu "trước khi làm X". Gắn -기 전에 vào BẤT KỲ gốc động từ nào, dù kết thúc bằng nguyên âm hay phụ âm — không cần -으- hỗ trợ, vì 기 là dạng danh từ hoá 기 (먹다 → 먹기 전에, 가다 → 가기 전에, 살다 → 살기 전에). Với danh từ chỉ thời gian, dùng N + 전에 trực tiếp: 시험 전에 ("trước kỳ thi"), 일주일 전에 ("một tuần trước"), 두 시간 전에 ("hai giờ trước đó").\n\nVế đầu giữ hình thức hiện tại dù nghĩa là quá khứ — 어제 자기 전에 책을 읽었어요 "hôm qua trước khi ngủ tôi đã đọc sách" (KHÔNG phải 잤기 전에). Cặp với -(으)ㄴ 후에 / 다음에 nghĩa "sau khi làm X" — hai cấu trúc cùng tạo khung trước/sau phổ biến nhất trong tiếng Hàn. Để sắp xếp sự kiện quá khứ mà không buộc dùng hiện tại, có dạng văn vẻ hơn -기에 앞서, nhưng hiếm khi xuất hiện trong khẩu ngữ. Đừng nhầm với -기 위해서 ("để / nhằm"), dùng cùng 기 nhưng chỉ mục đích, không phải thời gian.',
      '「Xする前に」を表す。動詞語幹に -기 전에 を直接付ける。子音語幹でも母音語幹でも -으- は不要 — 기 が名詞化接尾辞だから(먹다 → 먹기 전에、가다 → 가기 전에、살다 → 살기 전에)。時を表す名詞には N + 전에 を直接使う: 시험 전에「試験の前に」、일주일 전에「1週間前」、두 시간 전에「2時間前」。\n\n前節は意味が過去でも形は現在 — 어제 자기 전에 책을 읽었어요「昨日寝る前に本を読んだ」(잤기 전에 ではない)。「Xした後で」の -(으)ㄴ 후에 / 다음에 と組み合わせて、最もよく使う「前／後」のセットになる。文語的な -기에 앞서 もあるが会話ではめったに出ない。-기 위해서(「〜するために」)と混同しないこと — 同じ 기 を使うが、こちらは「目的」を表し、時間ではない。',
    ),
    deckId: 'topik-2',
  },

  // G036 · After doing
  {
    ko: '-(으)ㄴ 후에 / 다음에',
    meaning: L(
      '"after (doing)" — 후에 and 다음에 are interchangeable',
      '"después de (hacer)" — 후에 y 다음에 son intercambiables',
      '"après (avoir fait)" — 후에 / 다음에 sont équivalents',
      '"depois de (fazer)" — 후에 e 다음에 são intercambiáveis',
      '"หลังจาก (ทำ)" — 후에 / 다음에 ใช้แทนกันได้',
      '"setelah (melakukan)" — 후에 dan 다음에 setara',
      '"sau khi (làm)" — 후에 và 다음에 tương đương',
      '「〜した後で / 〜した次に」',
    ),
    example: '밥을 먹은 후에 산책했어요.',
    trans: L(
      'After eating, I went for a walk.',
      'Después de comer, salí a caminar.',
      'Après avoir mangé, je suis allé me promener.',
      'Depois de comer, fui caminhar.',
      'หลังจากกินข้าวก็ไปเดินเล่น',
      'Setelah makan, saya jalan-jalan.',
      'Sau khi ăn, tôi đi dạo.',
      'ご飯を食べた後で散歩しました。',
    ),
    usageNotes: L(
      'Expresses "after doing X". Form: vowel/ㄹ stem → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에); consonant stem → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 and 다음에 are interchangeable; speakers swap them freely. With time nouns the form is N + 후에 ("after N"): 한 시간 후에 ("an hour later"), 수업 후에 ("after class"), 일주일 후에 ("a week later").\n\nThe first clause uses the past-modifier -(으)ㄴ even when the whole sentence is in the future — 내일 일이 끝난 후에 만나요 "let\'s meet after work finishes tomorrow" (NOT 끝날 후에). Pair with -기 전에 ("before doing X") for the standard before/after frame. For the immediate "right after doing X" sense, use -자마자 instead (집에 가자마자 잤어요 "I slept as soon as I got home") — -(으)ㄴ 후에 leaves room for a gap, -자마자 doesn\'t.',
      'Expresa "después de hacer X". Forma: raíz en vocal/ㄹ → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에); raíz en consonante → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 y 다음에 son intercambiables; los hablantes los alternan sin pensar. Con sustantivos de tiempo va N + 후에 ("después de N"): 한 시간 후에 ("una hora después"), 수업 후에 ("después de clase"), 일주일 후에 ("una semana después").\n\nLa primera cláusula usa el modificador pasado -(으)ㄴ aunque la oración entera esté en futuro — 내일 일이 끝난 후에 만나요 "mañana nos vemos después de que termine el trabajo" (NO 끝날 후에). Combina con -기 전에 ("antes de hacer X") para el marco estándar antes/después. Para el sentido inmediato "apenas hago X", usá -자마자 (집에 가자마자 잤어요 "apenas llegué a casa me dormí") — -(으)ㄴ 후에 admite una pausa, -자마자 no.',
      'Exprime « après avoir fait X ». Forme : racine en voyelle/ㄹ → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에) ; racine en consonne → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 et 다음에 sont interchangeables ; on passe de l\'un à l\'autre sans réfléchir. Avec un nom de temps : N + 후에 (« après N ») — 한 시간 후에 (« une heure plus tard »), 수업 후에 (« après le cours »), 일주일 후에 (« une semaine plus tard »).\n\nLa première proposition emploie le modificateur passé -(으)ㄴ même quand l\'ensemble de la phrase est au futur — 내일 일이 끝난 후에 만나요 « on se voit demain après la fin du travail » (et non 끝날 후에). Se combine avec -기 전에 (« avant de faire X ») pour le cadre avant/après standard. Pour le sens immédiat « dès que je fais X », employer -자마자 (집에 가자마자 잤어요 « dès que je suis rentré, j\'ai dormi ») — -(으)ㄴ 후에 admet un intervalle, -자마자 non.',
      'Expressa "depois de fazer X". Forma: radical em vogal/ㄹ → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에); radical em consoante → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 e 다음에 são intercambiáveis; falantes alternam sem pensar. Com substantivos de tempo usa N + 후에 ("depois de N"): 한 시간 후에 ("uma hora depois"), 수업 후에 ("depois da aula"), 일주일 후에 ("uma semana depois").\n\nA primeira oração usa o modificador passado -(으)ㄴ mesmo quando a frase toda está no futuro — 내일 일이 끝난 후에 만나요 "amanhã a gente se vê depois que o trabalho terminar" (NÃO 끝날 후에). Combina com -기 전에 ("antes de fazer X") para a moldura padrão antes/depois. Para o sentido imediato "assim que faço X" use -자마자 (집에 가자마자 잤어요 "assim que cheguei em casa dormi") — -(으)ㄴ 후에 admite intervalo, -자마자 não.',
      'แปลว่า "หลังจากทำ X". รูป: รากลงสระ/ㄹ → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에); รากลงพยัญชนะ → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 และ 다음에 ใช้สลับกันได้; เจ้าของภาษาเปลี่ยนใช้โดยไม่คิดมาก. กับคำนามบอกเวลาใช้ N + 후에 ("หลังจาก N"): 한 시간 후에 ("หนึ่งชั่วโมงต่อมา"), 수업 후에 ("หลังเลิกเรียน"), 일주일 후에 ("หนึ่งสัปดาห์ต่อมา")\n\nประโยคแรกใช้ตัวขยายอดีต -(으)ㄴ แม้ทั้งประโยคจะเป็นอนาคต — 내일 일이 끝난 후에 만나요 "พรุ่งนี้เจอกันหลังเลิกงาน" (ห้าม 끝날 후에). คู่กับ -기 전에 ("ก่อนทำ X") เป็นโครงสร้างก่อน/หลังมาตรฐาน. ถ้าจะบอกความหมายทันที "พอทำ X เสร็จก็..." ให้ใช้ -자마자 (집에 가자마자 잤어요 "พอถึงบ้านก็นอนเลย") — -(으)ㄴ 후에 เว้นช่องว่างได้ ส่วน -자마자 ไม่เว้น',
      'Mengungkapkan "setelah melakukan X". Bentuk: akar vokal/ㄹ → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에); akar konsonan → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 dan 다음에 saling menggantikan; penutur asli mengganti tanpa pikir panjang. Dengan kata benda waktu pakai N + 후에 ("setelah N"): 한 시간 후에 ("satu jam kemudian"), 수업 후에 ("setelah kelas"), 일주일 후에 ("satu minggu kemudian").\n\nKlausa pertama menggunakan pemodifikasi lampau -(으)ㄴ meskipun kalimat secara keseluruhan berbentuk masa depan — 내일 일이 끝난 후에 만나요 "besok kita bertemu setelah pekerjaan selesai" (BUKAN 끝날 후에). Pasangkan dengan -기 전에 ("sebelum melakukan X") untuk kerangka sebelum/sesudah standar. Untuk makna langsung "begitu saya melakukan X" pakai -자마자 (집에 가자마자 잤어요 "begitu sampai rumah saya tidur") — -(으)ㄴ 후에 membolehkan jeda, -자마자 tidak.',
      'Diễn tả "sau khi làm X". Hình thức: gốc nguyên âm/ㄹ → -ㄴ 후에 / -ㄴ 다음에 (가다 → 간 후에 / 간 다음에, 살다 → 산 후에); gốc phụ âm → -은 후에 / -은 다음에 (먹다 → 먹은 후에). 후에 và 다음에 thay thế cho nhau; người bản ngữ đổi qua đổi lại tự nhiên. Với danh từ chỉ thời gian dùng N + 후에 ("sau N"): 한 시간 후에 ("một tiếng sau"), 수업 후에 ("sau giờ học"), 일주일 후에 ("một tuần sau").\n\nVế đầu dùng định ngữ quá khứ -(으)ㄴ ngay cả khi cả câu ở tương lai — 내일 일이 끝난 후에 만나요 "mai mình gặp sau khi xong việc" (KHÔNG phải 끝날 후에). Cặp với -기 전에 ("trước khi làm X") tạo khung trước/sau chuẩn. Để diễn tả "ngay khi vừa làm X" hãy dùng -자마자 (집에 가자마자 잤어요 "vừa về đến nhà tôi đã ngủ") — -(으)ㄴ 후에 cho phép có khoảng cách thời gian, -자마자 thì không.',
      '「Xした後で／後に」を表す。形: 母音または ㄹ 語幹 → -ㄴ 후에 / -ㄴ 다음에(가다 → 간 후에 / 간 다음에、살다 → 산 후에); 子音語幹 → -은 후에 / -은 다음에(먹다 → 먹은 후에)。후에 と 다음에 は完全に置換可能で、ネイティブは深く考えずに使い分ける。時を表す名詞には N + 후에 を使う(「Nのあとで」): 한 시간 후에「1時間後」、수업 후에「授業の後で」、일주일 후에「1週間後」。\n\n文全体が未来でも前節は過去修飾形 -(으)ㄴ を使う — 내일 일이 끝난 후에 만나요「明日仕事が終わった後で会いましょう」(끝날 후에 ではない)。-기 전에 「Xする前に」と組み合わせて、最も標準的な「前／後」のセットになる。「Xするやいなや」と即時性を出したいときは -자마자 を使う(집에 가자마자 잤어요「家に着くなり寝てしまった」)。-(으)ㄴ 후에 は間に時間を入れられるが、-자마자 は許さない。',
    ),
    deckId: 'topik-2',
  },

  // G048 · While (different subjects allowed)
  {
    ko: '-는 동안',
    meaning: L(
      '"while / during" — two actions overlap; subjects may differ (cf. -(으)면서, same subject)',
      '"mientras / durante" — dos acciones simultáneas; sujetos pueden diferir (cf. -(으)면서, mismo sujeto)',
      '"pendant que / durant" — actions parallèles; sujets différents possibles',
      '"enquanto / durante" — duas ações em paralelo; sujeitos podem diferir',
      '"ในระหว่างที่" — กระทำพร้อมกัน, ผู้กระทำต่างกันได้',
      '"selama / sementara" — aksi paralel, subjek bisa berbeda',
      '"trong khi / trong lúc" — hai hành động song song, chủ ngữ khác nhau cũng được',
      '「〜している間」— 並行(主語が異なっても可)',
    ),
    example: '음악을 듣는 동안 공부했어요.',
    trans: L(
      'I studied while listening to music.',
      'Estudié mientras escuchaba música.',
      'J’ai étudié pendant que j’écoutais de la musique.',
      'Estudei enquanto ouvia música.',
      'ฉันเรียนหนังสือไปฟังเพลงไป',
      'Saya belajar sambil mendengarkan musik.',
      'Tôi học trong khi nghe nhạc.',
      '音楽を聞いている間、勉強しました。',
    ),
    usageNotes: L(
      'Marks "while / during" — two ongoing actions or states overlap in time. Attach -는 동안 to verb stems (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). With noun + 동안, it means "for the duration of N" (한 시간 동안 "for an hour", 방학 동안 "during the vacation", 일주일 동안 "for a week").\n\nKey contrast with -(으)면서: -는 동안 ALLOWS different subjects (제가 공부하는 동안 동생은 잤어요 "while I studied, my sibling slept"), while -(으)면서 requires the SAME subject in both clauses (제가 음악을 들으면서 공부했어요 "I studied while listening to music"). Past form: -ㄴ/은 동안 used rarely; usually 았/었- goes on the second clause and 동안 stays present. With duration, 동안 is often paired with quantitative expressions: 두 시간 동안 운동했어요 "I exercised FOR two hours".',
      'Marca "mientras / durante" — dos acciones o estados que se solapan en el tiempo. Pegá -는 동안 a raíces verbales (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). Con sustantivo + 동안 significa "durante N" o "por N" (한 시간 동안 "durante una hora", 방학 동안 "durante las vacaciones", 일주일 동안 "por una semana").\n\nContraste clave con -(으)면서: -는 동안 PERMITE sujetos diferentes (제가 공부하는 동안 동생은 잤어요 "mientras yo estudiaba, mi hermano dormía"), mientras que -(으)면서 exige el MISMO sujeto en ambas cláusulas (제가 음악을 들으면서 공부했어요 "estudié mientras escuchaba música"). El pasado -ㄴ/은 동안 se usa poco; normalmente el 았/었- va en la segunda cláusula y 동안 se queda en presente. Con duración, 동안 va casi siempre con expresiones cuantitativas: 두 시간 동안 운동했어요 "hice ejercicio DURANTE dos horas".',
      'Marque « pendant que / durant » — deux actions ou états qui se chevauchent dans le temps. Colle -는 동안 à la racine verbale (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). Avec nom + 동안 cela signifie « pendant N / durant N » (한 시간 동안 « pendant une heure », 방학 동안 « pendant les vacances », 일주일 동안 « durant une semaine »).\n\nContraste crucial avec -(으)면서 : -는 동안 ADMET des sujets différents (제가 공부하는 동안 동생은 잤어요 « pendant que j\'étudiais, mon frère/ma sœur dormait »), tandis que -(으)면서 exige le MÊME sujet dans les deux propositions (제가 음악을 들으면서 공부했어요 « j\'ai étudié en écoutant de la musique »). Le passé -ㄴ/은 동안 est rare ; normalement le 았/었- se place dans la deuxième proposition et 동안 reste au présent. Avec une durée, 동안 se combine très souvent avec une expression quantitative : 두 시간 동안 운동했어요 « j\'ai fait du sport PENDANT deux heures ».',
      'Marca "enquanto / durante" — duas ações ou estados que se sobrepõem no tempo. Anexe -는 동안 ao radical do verbo (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). Com substantivo + 동안 significa "durante N / por N" (한 시간 동안 "durante uma hora", 방학 동안 "durante as férias", 일주일 동안 "por uma semana").\n\nContraste fundamental com -(으)면서: -는 동안 PERMITE sujeitos diferentes (제가 공부하는 동안 동생은 잤어요 "enquanto eu estudava, meu irmão dormia"), enquanto -(으)면서 exige o MESMO sujeito nas duas orações (제가 음악을 들으면서 공부했어요 "estudei enquanto ouvia música"). O passado -ㄴ/은 동안 é raro; normalmente o 았/었- entra na segunda oração e 동안 fica no presente. Com duração, 동안 quase sempre se combina com expressões quantitativas: 두 시간 동안 운동했어요 "fiz exercício POR duas horas".',
      'แสดงความหมาย "ในระหว่างที่ / ขณะที่" — สองการกระทำ/สภาพเกิดพร้อมกัน. เกาะ -는 동안 ที่รากกริยา (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). คู่กับคำนาม + 동안 หมายถึง "ระหว่าง N / เป็นเวลา N" (한 시간 동안 "เป็นเวลา 1 ชั่วโมง", 방학 동안 "ในช่วงปิดเทอม", 일주일 동안 "เป็นเวลา 1 สัปดาห์")\n\nความต่างสำคัญกับ -(으)면서: -는 동안 อนุญาตให้ "ผู้กระทำต่างกัน" ได้ (제가 공부하는 동안 동생은 잤어요 "ขณะที่ฉันเรียน น้องก็นอน") ส่วน -(으)면서 ต้องมี "ผู้กระทำเดียวกัน" ในทั้งสองประโยค (제가 음악을 들으면서 공부했어요 "ฉันเรียนไปฟังเพลงไป"). รูปอดีต -ㄴ/은 동안 ใช้น้อยมาก; ปกติ 았/었- จะอยู่ในประโยคที่สอง ส่วน 동안 อยู่ในรูปปัจจุบัน. กับการบอกระยะเวลา 동안 มักคู่กับสำนวนปริมาณ: 두 시간 동안 운동했어요 "ออกกำลังกายเป็นเวลา 2 ชั่วโมง"',
      'Menandai "selama / sementara" — dua aksi atau keadaan tumpang-tindih dalam waktu. Tempelkan -는 동안 ke akar verba (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). Dengan kata benda + 동안 berarti "selama N / sepanjang N" (한 시간 동안 "selama satu jam", 방학 동안 "selama liburan", 일주일 동안 "selama seminggu").\n\nKontras kunci dengan -(으)면서: -는 동안 MEMBOLEHKAN subjek berbeda (제가 공부하는 동안 동생은 잤어요 "saat saya belajar, adik tidur"), sedangkan -(으)면서 menuntut subjek YANG SAMA di kedua klausa (제가 음악을 들으면서 공부했어요 "saya belajar sambil mendengarkan musik"). Bentuk lampau -ㄴ/은 동안 jarang dipakai; biasanya 았/었- diletakkan di klausa kedua dan 동안 tetap bentuk kini. Untuk durasi, 동안 hampir selalu berpasangan dengan ekspresi kuantitatif: 두 시간 동안 운동했어요 "saya olahraga SELAMA dua jam".',
      'Đánh dấu "trong khi / trong lúc" — hai hành động hoặc trạng thái chồng lấp về thời gian. Gắn -는 동안 vào gốc động từ (가다 → 가는 동안, 먹다 → 먹는 동안, 자다 → 자는 동안). Với danh từ + 동안 nghĩa là "trong suốt N" (한 시간 동안 "trong một tiếng", 방학 동안 "trong kỳ nghỉ", 일주일 동안 "trong một tuần").\n\nĐiểm tương phản quan trọng với -(으)면서: -는 동안 CHO PHÉP hai chủ ngữ khác nhau (제가 공부하는 동안 동생은 잤어요 "trong khi tôi học, em tôi ngủ"), còn -(으)면서 đòi hỏi CÙNG MỘT chủ ngữ ở cả hai vế (제가 음악을 들으면서 공부했어요 "tôi học trong khi nghe nhạc"). Dạng quá khứ -ㄴ/은 동안 ít gặp; thông thường 았/었- nằm ở vế thứ hai còn 동안 giữ hiện tại. Khi nói thời lượng, 동안 hầu như luôn đi với cụm chỉ số lượng: 두 시간 동안 운동했어요 "tôi tập thể dục TRONG hai giờ".',
      '「〜している間」二つの行為や状態が時間的に重なることを表す。動詞語幹に -는 동안 を付ける(가다 → 가는 동안、먹다 → 먹는 동안、자다 → 자는 동안)。名詞 + 동안 は「Nの間」を表す(한 시간 동안「1時間の間」、방학 동안「休みの間」、일주일 동안「1週間の間」)。\n\n-(으)면서 との重要な対比: -는 동안 は「主語が異なってもよい」(제가 공부하는 동안 동생은 잤어요「私が勉強している間、弟は寝ていた」)、-(으)면서 は「両節の主語が同一」でなければならない(제가 음악을 들으면서 공부했어요「私は音楽を聞きながら勉強した」)。過去形 -ㄴ/은 동안 はほとんど用いられず、通常は 았/었- を後節に置いて 동안 は現在のままにする。期間表現としての 동안 はほぼ常に数量表現とセットになる: 두 시간 동안 운동했어요「2時間運動した」。',
    ),
    deckId: 'topik-2',
  },

  // G145 · After (completing) — emphasis on completion
  {
    ko: '-고 나서 / -고 나면',
    meaning: L(
      '"after fully doing" — emphasizes completion before the next action',
      '"después de completar" — enfatiza que A se completó del todo antes de B',
      '"après avoir fini de" — insiste sur l’achèvement préalable',
      '"depois de terminar de" — enfatiza a conclusão antes da próxima ação',
      '"หลังจาก ... เสร็จแล้ว" — เน้นการทำเสร็จ',
      '"setelah selesai" — menekankan penyelesaian terlebih dahulu',
      '"sau khi xong" — nhấn mạnh hoàn tất trước',
      '「〜してから / 〜し終えたら」— 完了の強調',
    ),
    example: '밥을 먹고 나서 설거지를 해요.',
    trans: L(
      'After eating, I wash the dishes.',
      'Después de comer (del todo), friego los platos.',
      'Après avoir mangé, je fais la vaisselle.',
      'Depois de comer, lavo a louça.',
      'หลังจากกินข้าวเสร็จ ก็ล้างจาน',
      'Setelah selesai makan, saya cuci piring.',
      'Sau khi ăn xong, tôi rửa bát.',
      'ご飯を食べてから皿洗いをします。',
    ),
    usageNotes: L(
      'Adds the nuance of "after fully / completely doing X" — emphasizes that the first action is FINISHED before the second starts. Attach -고 나서 (factual: "having finished X, then Y") or -고 나면 (conditional: "once you finish X, then Y") to the verb stem (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). Built from the connector -고 + the auxiliary 나다 ("come out, emerge / finish") + 서/면.\n\nCompared with plain -(으)ㄴ 후에 ("after"): -고 나서 highlights that X was completed and THEN Y happened, while -(으)ㄴ 후에 just orders the events. 운동하고 나서 샤워해요 stresses "I exercise, finish, then shower"; 운동한 후에 샤워해요 is the neutral "after exercising, I shower". -고 나면 is for habitual or future "once X is done, then..." (운동하고 나면 기분이 좋아져요 "once I finish exercising, I feel good"). Restricted to action verbs — don\'t use with adjectives (예쁘고 나서 doesn\'t work).',
      'Añade el matiz de "después de hacer X del todo" — enfatiza que la primera acción está TERMINADA antes de que arranque la segunda. Pegá -고 나서 (factual: "habiendo terminado X, después Y") o -고 나면 (condicional: "una vez que terminés X, entonces Y") a la raíz verbal (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). Se forma con el conector -고 + el auxiliar 나다 ("salir, surgir / terminar") + 서/면.\n\nComparado con el simple -(으)ㄴ 후에 ("después"): -고 나서 subraya que X terminó y RECIÉN ahí pasó Y, mientras que -(으)ㄴ 후에 solo ordena los eventos. 운동하고 나서 샤워해요 enfatiza "hago ejercicio, termino, después me baño"; 운동한 후에 샤워해요 es el neutro "después de hacer ejercicio, me baño". -고 나면 es para el sentido habitual o futuro de "una vez terminado X, entonces..." (운동하고 나면 기분이 좋아져요 "una vez que termino de hacer ejercicio, me siento bien"). Solo va con verbos de acción — no se usa con adjetivos (예쁘고 나서 no funciona).',
      'Ajoute la nuance « après avoir totalement fait X » — insiste sur l\'achèvement de la première action avant le début de la seconde. Colle -고 나서 (factuel : « après avoir achevé X, ensuite Y ») ou -고 나면 (conditionnel : « une fois X terminé, alors Y ») à la racine verbale (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). Composé du connecteur -고 + l\'auxiliaire 나다 (« en sortir / terminer ») + 서/면.\n\nÀ comparer avec le simple -(으)ㄴ 후에 (« après ») : -고 나서 insiste sur le fait que X est achevé puis Y a lieu, alors que -(으)ㄴ 후에 ordonne seulement les événements. 운동하고 나서 샤워해요 met l\'accent sur « je fais du sport, je termine, puis je prends une douche » ; 운동한 후에 샤워해요 est plus neutre. -고 나면 sert au sens habituel ou futur « une fois X fini, alors... » (운동하고 나면 기분이 좋아져요 « une fois mon sport fini, je me sens bien »). Réservé aux verbes d\'action — pas avec les adjectifs (예쁘고 나서 ne marche pas).',
      'Adiciona o matiz de "depois de terminar X" — enfatiza que a primeira ação está COMPLETA antes de a segunda começar. Anexe -고 나서 (factual: "tendo terminado X, então Y") ou -고 나면 (condicional: "uma vez que você termine X, então Y") ao radical verbal (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). Formado por -고 + o auxiliar 나다 ("sair, surgir / terminar") + 서/면.\n\nComparado com o simples -(으)ㄴ 후에 ("depois"): -고 나서 destaca que X foi concluído e SÓ AÍ Y aconteceu, enquanto -(으)ㄴ 후에 só ordena os eventos. 운동하고 나서 샤워해요 enfatiza "faço exercício, termino, então tomo banho"; 운동한 후에 샤워해요 é o neutro. -고 나면 é para o sentido habitual ou futuro de "uma vez terminado X, então..." (운동하고 나면 기분이 좋아져요 "depois que termino de me exercitar, me sinto bem"). Restrito a verbos de ação — não use com adjetivos (예쁘고 나서 não funciona).',
      'เพิ่มความหมาย "หลังจากทำ X เสร็จเรียบร้อยแล้ว" — เน้นว่าการกระทำแรก "จบ" ก่อนเริ่มการกระทำที่สอง. เกาะ -고 나서 (เชิงข้อเท็จจริง: "เมื่อทำ X เสร็จแล้ว ก็ Y") หรือ -고 나면 (เชิงเงื่อนไข: "พอ X เสร็จ ก็ Y") ที่รากกริยา (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). สร้างจากตัวเชื่อม -고 + กริยาช่วย 나다 ("ออกมา / เสร็จสิ้น") + 서/면\n\nเทียบกับ -(으)ㄴ 후에 ("หลังจาก") แบบทั่วไป: -고 나서 เน้นว่า X เสร็จแล้ว และ "หลังจากนั้นจริง ๆ" Y จึงเกิด ส่วน -(으)ㄴ 후에 แค่เรียงลำดับเหตุการณ์. 운동하고 나서 샤워해요 เน้น "ออกกำลังกาย เสร็จแล้วค่อยอาบน้ำ"; 운동한 후에 샤워해요 เป็นกลาง. -고 나면 ใช้ในความหมายเชิงนิสัยหรืออนาคต "พอ X เสร็จ ก็จะ..." (운동하고 나면 기분이 좋아져요 "พอออกกำลังกายเสร็จ อารมณ์ก็ดีขึ้น"). ใช้กับกริยาบอกการกระทำเท่านั้น — กับคำคุณศัพท์ใช้ไม่ได้ (예쁘고 나서 ไม่ถูกต้อง)',
      'Menambahkan nuansa "setelah benar-benar menyelesaikan X" — menekankan bahwa aksi pertama SUDAH SELESAI sebelum yang kedua dimulai. Tempelkan -고 나서 (faktual: "setelah menyelesaikan X, kemudian Y") atau -고 나면 (bersyarat: "begitu kamu menyelesaikan X, maka Y") ke akar verba (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). Dibangun dari konektor -고 + verba bantu 나다 ("muncul / selesai") + 서/면.\n\nDibanding -(으)ㄴ 후에 ("setelah") biasa: -고 나서 menyorot bahwa X tuntas DAN SETELAH ITU Y terjadi, sedangkan -(으)ㄴ 후에 hanya mengurutkan kejadian. 운동하고 나서 샤워해요 menegaskan "saya olahraga, selesai, lalu mandi"; 운동한 후에 샤워해요 lebih netral. -고 나면 dipakai untuk makna kebiasaan atau masa depan "begitu X selesai, maka..." (운동하고 나면 기분이 좋아져요 "begitu selesai olahraga, perasaan saya membaik"). Terbatas pada verba aksi — tidak dipakai dengan adjektiva (예쁘고 나서 tidak benar).',
      'Thêm sắc thái "sau khi hoàn tất hẳn X" — nhấn mạnh hành động đầu tiên đã KẾT THÚC trước khi hành động thứ hai bắt đầu. Gắn -고 나서 (sự kiện: "sau khi hoàn tất X, rồi Y") hoặc -고 나면 (điều kiện: "một khi xong X, thì Y") vào gốc động từ (먹다 → 먹고 나서 / 먹고 나면, 일하다 → 일하고 나서 / 일하고 나면). Cấu tạo từ liên từ -고 + động từ bổ trợ 나다 ("hiện ra / kết thúc") + 서/면.\n\nSo với -(으)ㄴ 후에 ("sau") thông thường: -고 나서 làm nổi bật rằng X đã xong rồi MỚI tới Y, còn -(으)ㄴ 후에 chỉ xếp thứ tự sự kiện. 운동하고 나서 샤워해요 nhấn "tôi tập xong rồi mới tắm"; 운동한 후에 샤워해요 trung tính. -고 나면 dùng cho nghĩa thói quen hoặc tương lai "khi xong X thì..." (운동하고 나면 기분이 좋아져요 "khi tập xong tâm trạng tôi đỡ hẳn"). Chỉ dùng với động từ hành động — không dùng với tính từ (예쁘고 나서 không hợp lệ).',
      '「Xし終えてから」「Xし終えたら」のニュアンスを加える — 最初の動作が「完全に終わってから」次に進むことを強調する。動詞語幹に -고 나서(事実「Xし終えてから、それから Y」)、-고 나면(条件「Xし終えたら、Y」)を付ける(먹다 → 먹고 나서 / 먹고 나면、일하다 → 일하고 나서 / 일하고 나면)。接続 -고 + 補助動詞 나다(「現れる／〜し終える」)+ 서/면 で成り立つ。\n\nプレーンな -(으)ㄴ 후에(「〜したあと」)との対比: -고 나서 は「X を済ませてからこそ Y」と完了を強調、-(으)ㄴ 후에 は単に出来事の順序を示す。운동하고 나서 샤워해요 は「運動を済ませてからシャワーを浴びる」、운동한 후에 샤워해요 は中立。-고 나면 は習慣や未来の「Xを終えたら…」を表す(운동하고 나면 기분이 좋아져요「運動し終えると気分がよくなる」)。動作動詞限定 — 形容詞には付けない(예쁘고 나서 は不可)。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Nominalización y conjetura
  // ─────────────────────────────────────────────────────────────────────────

  // G037 · Nominalization with 것
  {
    ko: '-는 것',
    meaning: L(
      'verb nominalization — "the act of / -ing"; spoken contractions 게/걸/건',
      'nominalización — "el hecho de / acción de"; contracciones habladas 게/걸/건',
      'nominalisation — «le fait de / -er»; contractions orales 게/걸/건',
      'nominalização — "o ato de / fazer"; contrações faladas 게/걸/건',
      'การทำให้กริยาเป็นคำนาม — "การทำ ..."; รูปย่อ 게/걸/건',
      'nominalisasi verba — "tindakan ..."; bentuk lisan 게/걸/건',
      'danh hóa động từ — "việc / hành động ..."; rút gọn 게/걸/건',
      '動詞の名詞化「〜こと / 〜の」— 口語短縮 게/걸/건',
    ),
    example: '음악을 듣는 것을 좋아해요.',
    trans: L(
      'I like listening to music.',
      'Me gusta escuchar música.',
      'J’aime écouter de la musique.',
      'Eu gosto de ouvir música.',
      'ฉันชอบฟังเพลง',
      'Saya suka mendengarkan musik.',
      'Tôi thích nghe nhạc.',
      '音楽を聞くことが好きです。',
    ),
    deckId: 'topik-2',
  },

  // G050 · It seems / I think
  {
    ko: '-(으)ㄴ/는 것 같다',
    meaning: L(
      '"it seems / I think" — soft conjecture about present/past',
      '"parece que / creo que" — conjetura suave sobre presente o pasado',
      '«il semble que / je crois que» — conjecture douce, présent/passé',
      '"parece que / acho que" — conjectura suave, presente ou passado',
      '"คิดว่า / ดูเหมือน ..." — การคาดเดาเบา ๆ (ปัจจุบัน / อดีต)',
      '"sepertinya / saya pikir" — dugaan halus (kini / lampau)',
      '"có vẻ / tôi nghĩ" — phỏng đoán nhẹ (hiện tại / quá khứ)',
      '「〜と思う / 〜ようだ」— 弱い推量(現在・過去)',
    ),
    example: '오늘 날씨가 추운 것 같아요.',
    trans: L(
      'It seems cold today.',
      'Parece que hoy hace frío.',
      'On dirait qu’il fait froid aujourd’hui.',
      'Parece que está frio hoje.',
      'วันนี้ดูเหมือนจะหนาว',
      'Hari ini sepertinya dingin.',
      'Hôm nay có vẻ lạnh.',
      '今日は寒いようです。',
    ),
    deckId: 'topik-2',
  },

  // G154 · Apparently / by the looks of
  {
    ko: '-(으)ㄴ/는 모양이다',
    meaning: L(
      '"apparently / by the looks of it" — inference from observable evidence',
      '"al parecer / por lo que se ve" — deducción a partir de evidencia visible',
      '«apparemment / on dirait» — déduction à partir de signes visibles',
      '"pelo jeito / aparentemente" — dedução por evidências visíveis',
      '"ดูท่าทาง / ดูเหมือนว่า" — สรุปจากสิ่งที่เห็น',
      '"kelihatannya / rupanya" — kesimpulan dari bukti yang terlihat',
      '"có vẻ / xem ra" — suy luận từ chứng cứ quan sát được',
      '「〜らしい / 〜ようだ」— 観察に基づく推測',
    ),
    example: '불이 꺼진 걸 보니 자는 모양이에요.',
    trans: L(
      'The lights are off — looks like they’re sleeping.',
      'La luz está apagada, al parecer está durmiendo.',
      'La lumière est éteinte ; apparemment, ils dorment.',
      'A luz está apagada, parece que está dormindo.',
      'ไฟดับอยู่ ดูเหมือนจะนอนแล้ว',
      'Lampu mati, kelihatannya sudah tidur.',
      'Đèn đã tắt, có vẻ đang ngủ.',
      '電気が消えているところを見ると、寝ているようです。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Obligación, prohibición, suficiencia
  // ─────────────────────────────────────────────────────────────────────────

  // G040 · Have to / must
  {
    ko: '-아/어야 하다 / 되다',
    meaning: L(
      '"have to / must" — 하다 and 되다 are interchangeable',
      '"tener que / deber" — 하다 y 되다 son intercambiables',
      '"devoir / il faut" — 하다 et 되다 sont équivalents',
      '"ter que / dever" — 하다 e 되다 são intercambiáveis',
      '"ต้อง" — 하다 / 되다 ใช้แทนกันได้',
      '"harus" — 하다 dan 되다 setara',
      '"phải" — 하다 và 되다 tương đương',
      '「〜なければならない / 〜なきゃ」(하다/되다)',
    ),
    example: '내일까지 숙제를 해야 해요.',
    trans: L(
      'I have to do the homework by tomorrow.',
      'Tengo que hacer la tarea para mañana.',
      'Je dois faire les devoirs d’ici demain.',
      'Tenho que fazer a lição até amanhã.',
      'ต้องทำการบ้านให้เสร็จภายในพรุ่งนี้',
      'Saya harus mengerjakan PR sampai besok.',
      'Tôi phải làm bài tập trước ngày mai.',
      '明日までに宿題をしなければなりません。',
    ),
    deckId: 'topik-2',
  },

  // G041 · Suffices to
  {
    ko: '-(으)면 되다',
    meaning: L(
      '"it suffices to / just need to" — minimum requirement to satisfy',
      '"basta con / solo hay que" — requisito mínimo',
      '«il suffit de / il faut seulement» — exigence minimale',
      '"basta / só precisa" — requisito mínimo',
      '"แค่ ... ก็พอ" — เงื่อนไขขั้นต่ำ',
      '"cukup / tinggal" — syarat minimal',
      '"chỉ cần" — yêu cầu tối thiểu',
      '「〜ばいい」— 最低限の条件',
    ),
    example: '여기에 이름을 쓰면 돼요.',
    trans: L(
      'Just write your name here.',
      'Solo tienes que escribir tu nombre aquí.',
      'Il suffit d’écrire ton nom ici.',
      'Basta escrever seu nome aqui.',
      'แค่เขียนชื่อตรงนี้ก็พอ',
      'Cukup tulis nama di sini.',
      'Chỉ cần viết tên ở đây.',
      'ここに名前を書けばいいです。',
    ),
    deckId: 'topik-2',
  },

  // G042 · Must not (prohibition)
  {
    ko: '-(으)면 안 되다',
    meaning: L(
      '"must not / cannot" — prohibition',
      '"no se puede / está prohibido" — prohibición',
      '«on ne doit pas / il est interdit de» — prohibition',
      '"não pode / é proibido" — proibição',
      '"ห้าม ... / ทำไม่ได้" — ข้อห้าม',
      '"tidak boleh / dilarang" — larangan',
      '"không được" — cấm',
      '「〜してはいけない」— 禁止',
    ),
    example: '여기서 담배를 피우면 안 돼요.',
    trans: L(
      'You can’t smoke here.',
      'No se puede fumar aquí.',
      'On ne peut pas fumer ici.',
      'Não pode fumar aqui.',
      'ห้ามสูบบุหรี่ที่นี่',
      'Tidak boleh merokok di sini.',
      'Không được hút thuốc ở đây.',
      'ここで煙草を吸ってはいけません。',
    ),
    deckId: 'topik-2',
  },

  // G156 · Need / no need
  {
    ko: '-(으)ㄹ 필요가 있다/없다',
    meaning: L(
      '"need / no need to" — more neutral than -아/어야 하다',
      '"hace falta / no hace falta" — más neutro que -아/어야 하다',
      '«il faut / pas besoin de» — plus neutre que -아/어야 하다',
      '"é necessário / não é necessário" — mais neutro que -아/어야 하다',
      '"จำเป็น / ไม่จำเป็นต้อง" — เป็นกลางกว่า -아/어야 하다',
      '"perlu / tidak perlu" — lebih netral dari -아/어야 하다',
      '"cần / không cần" — trung tính hơn -아/어야 하다',
      '「〜する必要がある / ない」— 中立的',
    ),
    example: '걱정할 필요가 없어요.',
    trans: L(
      'There’s no need to worry.',
      'No hay necesidad de preocuparse.',
      'Pas besoin de s’inquiéter.',
      'Não há necessidade de se preocupar.',
      'ไม่จำเป็นต้องเป็นห่วง',
      'Tidak perlu khawatir.',
      'Không cần phải lo lắng.',
      '心配する必要はありません。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Intención, propuesta, decisión
  // ─────────────────────────────────────────────────────────────────────────

  // G043 · Promise / on-the-spot intent (1st person)
  {
    ko: '-(으)ㄹ게요',
    meaning: L(
      '"I will (just decided) / I promise" — 1st-person commitment to listener',
      '"yo lo haré / lo prometo" — compromiso del hablante en el momento',
      '"je vais (le) faire" — engagement du locuteur (décision immédiate)',
      '"eu vou fazer / prometo" — compromisso do falante no momento',
      '"ผมจะ ... นะ / สัญญา" — ตกลงในขณะนั้น (บุรุษที่ 1)',
      '"saya akan ... / janji" — keputusan saat itu juga (orang pertama)',
      '"tôi sẽ ... / tôi hứa" — cam kết tức thì (ngôi 1)',
      '「〜しますね / 〜しますから」— その場の意志・約束(一人称)',
    ),
    example: '제가 할게요.',
    trans: L(
      'I’ll do it.',
      'Yo lo haré.',
      'Je m’en occupe.',
      'Eu faço.',
      'ผมจะทำเองครับ',
      'Saya yang akan melakukannya.',
      'Để tôi làm.',
      '私がしますね。',
    ),
    deckId: 'topik-2',
  },

  // G044 · Shall we? / Wondering
  {
    ko: '-(으)ㄹ까요?',
    meaning: L(
      '"shall we ...? / I wonder if ..." — suggestion or self-question',
      '"¿hacemos…? / ¿será que…?" — sugerencia o duda interior',
      '«on ...? / je me demande si ...» — proposition ou interrogation',
      '"vamos ...? / será que ...?" — sugestão ou indagação',
      '"... กันไหม? / สงสัยว่า ..." — ชวน หรือ คิดในใจ',
      '"... yuk? / kira-kira ...?" — ajakan atau renungan',
      '"... nhé? / liệu ...?" — đề nghị hoặc tự hỏi',
      '「〜ましょうか / 〜でしょうか」— 提案・推量',
    ),
    example: '같이 점심을 먹을까요?',
    trans: L(
      'Shall we have lunch together?',
      '¿Comemos juntos el almuerzo?',
      'On déjeune ensemble ?',
      'Vamos almoçar juntos?',
      'ทานข้าวเที่ยงด้วยกันไหม',
      'Makan siang bareng yuk?',
      'Mình ăn trưa cùng nhau nhé?',
      '一緒に昼ご飯を食べましょうか？',
    ),
    deckId: 'topik-2',
  },

  // G047 · Intention to (same subject)
  {
    ko: '-(으)려고',
    meaning: L(
      '"in order to / with the intention of" — same subject, no imperative in 2nd clause',
      '"con la intención de / para" — mismo sujeto, sin imperativo en la 2ª cláusula',
      '«avec l’intention de / pour» — même sujet, pas d’impératif en 2ᵈᵉ',
      '"com a intenção de / para" — mesmo sujeito, sem imperativo na 2ª',
      '"ตั้งใจจะ / เพื่อ ..." — ผู้กระทำเดียวกัน, ห้ามคำสั่งในข้อหลัง',
      '"berniat untuk / supaya" — subjek sama, tanpa imperatif di klausa 2',
      '"với ý định / để ..." — cùng chủ ngữ, không mệnh lệnh ở vế 2',
      '「〜しようと / 〜するために」— 同主語、後節に命令不可',
    ),
    example: '한국어를 배우려고 학원에 다녀요.',
    trans: L(
      'I go to a hagwon in order to learn Korean.',
      'Voy a la academia para aprender coreano.',
      'Je vais à l’académie pour apprendre le coréen.',
      'Vou a um curso particular para aprender coreano.',
      'ฉันไปสถาบันสอนพิเศษเพื่อเรียนภาษาเกาหลี',
      'Saya pergi ke kursus untuk belajar bahasa Korea.',
      'Tôi đến trung tâm để học tiếng Hàn.',
      '韓国語を学ぼうと塾に通っています。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Auxiliares del nivel
  // ─────────────────────────────────────────────────────────────────────────

  // G038 · Try / experience
  {
    ko: '-아/어 보다',
    meaning: L(
      '"try to / give it a go / have the experience of"',
      '"intentar / probar a / haber probado a"',
      '«essayer de / faire pour voir»',
      '"tentar / experimentar / já ter feito"',
      '"ลอง ..." — ลองทำดู / มีประสบการณ์',
      '"coba / pernah mencoba"',
      '"thử / đã từng thử"',
      '「〜てみる」— 試行・経験',
    ),
    example: '이 음식을 먹어 봤어요?',
    trans: L(
      'Have you tried this food?',
      '¿Has probado esta comida?',
      'As-tu déjà goûté ce plat ?',
      'Você já experimentou essa comida?',
      'เคยลองกินอาหารนี้ไหม',
      'Pernah mencoba makanan ini?',
      'Bạn đã thử món này chưa?',
      'この料理を食べてみましたか？',
    ),
    deckId: 'topik-2',
  },

  // G039 · Favor (for someone)
  {
    ko: '-아/어 주다',
    meaning: L(
      '"do something for someone" — favor/service; -아/어 주세요 = "please ..."',
      '"hacer algo para alguien" — favor; -아/어 주세요 = "por favor..."',
      '«faire qch pour qqn» — service; -아/어 주세요 = «s’il te plaît…»',
      '"fazer algo por alguém" — favor; -아/어 주세요 = "por favor..."',
      '"ทำให้ใคร / ช่วย ..." — -아/어 주세요 = ขอความช่วยเหลือ',
      '"melakukan untuk seseorang" — -아/어 주세요 = "tolong ..."',
      '"làm giúp ai" — -아/어 주세요 = "làm ơn ..."',
      '「〜てあげる / 〜てくれる」— 〜아/어 주세요 で依頼',
    ),
    example: '사진을 찍어 주세요.',
    trans: L(
      'Please take a picture (for me/us).',
      'Por favor, sácanos una foto.',
      'Prends-nous une photo, s’il te plaît.',
      'Tira uma foto, por favor.',
      'ช่วยถ่ายรูปให้หน่อยได้ไหม',
      'Tolong fotokan kami.',
      'Vui lòng chụp ảnh giúp.',
      '写真を撮ってください。',
    ),
    deckId: 'topik-2',
  },

  // G146 · Completion (relief / regret)
  {
    ko: '-아/어 버리다',
    meaning: L(
      'definitive completion with emotional flavor (relief or regret)',
      'completitud definitiva con matiz emocional (alivio o lamento)',
      'achèvement définitif avec nuance émotionnelle (soulagement / regret)',
      'conclusão definitiva com emoção (alívio ou pesar)',
      'ทำเสร็จเด็ดขาด — โล่งใจ / เสียดาย',
      'penyelesaian tuntas dengan emosi (lega / menyesal)',
      'hoàn thành dứt khoát kèm cảm xúc (nhẹ nhõm / tiếc nuối)',
      '「〜てしまう」— 完了+感情(安堵/後悔)',
    ),
    example: '숙제를 다 해 버렸어요.',
    trans: L(
      'I finished all the homework (at last!).',
      'Ya terminé toda la tarea (¡por fin!).',
      'J’ai terminé tous les devoirs (enfin !).',
      'Terminei toda a lição (até que enfim!).',
      'ทำการบ้านเสร็จหมดแล้ว!',
      'Akhirnya semua PR selesai!',
      'Tôi đã làm xong hết bài tập rồi!',
      '宿題を全部やってしまいました。',
    ),
    deckId: 'topik-2',
  },

  // G147 · Leave done / prepare beforehand
  {
    ko: '-아/어 놓다 / -아/어 두다',
    meaning: L(
      '"do and leave (prepared for later)" — 놓다 and 두다 are near-synonyms',
      '"hacer y dejar (preparado para luego)" — 놓다 y 두다 son casi sinónimos',
      '«faire et laisser (préparé pour plus tard)» — 놓다 / 두다 quasi-synonymes',
      '"deixar feito / preparado" — 놓다 e 두다 são quase sinônimos',
      '"ทำเตรียมไว้" — 놓다 / 두다 ใกล้ความหมาย',
      '"melakukan dan menyiapkan untuk nanti" — 놓다 dan 두다 nyaris sama',
      '"làm sẵn / để dành" — 놓다 và 두다 gần đồng nghĩa',
      '「〜ておく」(놓다/두다 ほぼ同義)',
    ),
    example: '미리 예약해 뒀어요.',
    trans: L(
      'I made the reservation in advance.',
      'Hice la reserva con antelación.',
      'J’ai fait la réservation à l’avance.',
      'Já fiz a reserva com antecedência.',
      'จองเอาไว้ล่วงหน้าแล้ว',
      'Saya sudah memesan lebih dulu.',
      'Tôi đã đặt trước rồi.',
      '前もって予約しておきました。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 7 · Causa, contraste, comparación
  // ─────────────────────────────────────────────────────────────────────────

  // G045 · Because (imperative ok, past ok)
  {
    ko: '-(으)니까',
    meaning: L(
      '"because / so" — allows imperative or past on 1st clause (cf. -아/어서)',
      '"porque / ya que" — admite imperativo y pasado en la 1ª cláusula (a diferencia de -아/어서)',
      '«parce que / puisque» — accepte impératif et passé en 1ʳᵉ clause',
      '"porque / já que" — aceita imperativo e passado na 1ª cláusula',
      '"เพราะว่า / เนื่องจาก" — ใช้กับคำสั่งและอดีตในข้อแรกได้',
      '"karena / sebab" — boleh dengan imperatif/lampau di klausa 1',
      '"vì / bởi vì" — cho phép mệnh lệnh / quá khứ ở vế 1',
      '「〜から / 〜ので」— 命令・過去OK',
    ),
    example: '비가 오니까 우산을 가져가세요.',
    trans: L(
      'It’s raining, so take an umbrella.',
      'Como llueve, lleva paraguas.',
      'Il pleut, alors prends un parapluie.',
      'Como está chovendo, leve um guarda-chuva.',
      'ฝนตก เอาร่มไปด้วยนะ',
      'Karena hujan, bawa payung ya.',
      'Vì trời mưa, hãy mang ô đi.',
      '雨が降っているから傘を持って行ってください。',
    ),
    deckId: 'topik-2',
  },

  // G055 · Because of (formal/strong)
  {
    ko: '때문에 / 기 때문에',
    meaning: L(
      '"because of / due to" — formal; N + 때문에 or V + 기 때문에',
      '"a causa de / debido a" — formal; N + 때문에 o V + 기 때문에',
      '«à cause de / en raison de» — formel; N + 때문에 ou V + 기 때문에',
      '"por causa de / devido a" — formal; N + 때문에 ou V + 기 때문에',
      '"เพราะ / เนื่องด้วย" — ทางการ (N + 때문에 / V + 기 때문에)',
      '"karena / akibat dari" — formal (N + 때문에 / V + 기 때문에)',
      '"do / vì" — trang trọng (N + 때문에 / V + 기 때문에)',
      '「〜のため / 〜のせいで」(名詞 + 때문에 / 動詞 + 기 때문에)',
    ),
    example: '비 때문에 못 갔어요.',
    trans: L(
      'I couldn’t go because of the rain.',
      'No pude ir a causa de la lluvia.',
      'Je n’ai pas pu y aller à cause de la pluie.',
      'Não pude ir por causa da chuva.',
      'ไปไม่ได้เพราะฝนตก',
      'Tidak bisa pergi karena hujan.',
      'Tôi không thể đi vì trời mưa.',
      '雨のせいで行けませんでした。',
    ),
    deckId: 'topik-2',
  },

  // G046 · Or (between verbs/adjectives)
  {
    ko: '-거나',
    meaning: L(
      '"or" — between verbs or adjectives (for nouns use (이)나)',
      '"o" — entre verbos o adjetivos (para sustantivos: (이)나)',
      '«ou» — entre verbes ou adjectifs (pour les noms: (이)나)',
      '"ou" — entre verbos ou adjetivos (para substantivos: (이)나)',
      '"หรือ" — ระหว่างกริยา/คุณศัพท์ (สำหรับคำนามใช้ (이)나)',
      '"atau" — antar verba/adjektiva (untuk kata benda: (이)나)',
      '"hoặc / hay" — giữa động từ/tính từ (với danh từ dùng (이)나)',
      '動詞・形容詞間の「〜たり / または」(名詞は (이)나)',
    ),
    example: '주말에는 영화를 보거나 책을 읽어요.',
    trans: L(
      'On weekends I watch movies or read books.',
      'Los fines de semana veo películas o leo libros.',
      'Le week-end, je regarde des films ou je lis.',
      'Nos fins de semana, vejo filmes ou leio.',
      'สุดสัปดาห์ฉันดูหนังหรืออ่านหนังสือ',
      'Akhir pekan saya nonton film atau baca buku.',
      'Cuối tuần tôi xem phim hoặc đọc sách.',
      '週末は映画を見たり本を読んだりします。',
    ),
    deckId: 'topik-2',
  },

  // G052 · Like / similar to
  {
    ko: '-처럼 / -같이',
    meaning: L(
      '"like / similar to" — comparative particle; 같이 also means "together"',
      '"como / igual que" — partícula comparativa; 같이 también = "juntos"',
      '«comme» — particule comparative; 같이 signifie aussi «ensemble»',
      '"como / igual a" — partícula comparativa; 같이 também = "juntos"',
      '"เหมือน / เช่น" — บอกความเหมือน; 같이 ยังแปลว่า "ด้วยกัน"',
      '"seperti / sama seperti" — partikel pembanding; 같이 juga = "bersama"',
      '"giống / như" — tiểu từ so sánh; 같이 còn nghĩa là "cùng"',
      '「〜のように / 〜みたいに」(같이 は「一緒に」の意味も)',
    ),
    example: '친구처럼 대해 줘요.',
    trans: L(
      'Treat me like a friend.',
      'Trátame como a un amigo.',
      'Traite-moi comme un ami.',
      'Me trate como um amigo.',
      'ปฏิบัติต่อฉันเหมือนเป็นเพื่อน',
      'Perlakukan saya seperti teman.',
      'Hãy đối xử với tôi như bạn bè.',
      '友達のように接してください。',
    ),
    deckId: 'topik-2',
  },

  // G053 · More than (comparison)
  {
    ko: '-보다',
    meaning: L(
      '"more than" — comparative particle; often reinforced by 더 ("more")',
      '"más que" — partícula comparativa; suele reforzarse con 더 ("más")',
      '«plus que» — particule comparative, souvent renforcée par 더',
      '"mais que" — partícula comparativa, geralmente com 더 ("mais")',
      '"มากกว่า" — เปรียบเทียบ; มักเสริมด้วย 더 ("ยิ่ง / มาก")',
      '"lebih ... dari" — pembanding; sering ditegaskan 더 ("lebih")',
      '"hơn" — so sánh; thường thêm 더 ("hơn nữa")',
      '「〜より」— 比較。 더 と組み合わさることが多い',
    ),
    example: '한국어는 일본어보다 어려워요.',
    trans: L(
      'Korean is harder than Japanese.',
      'El coreano es más difícil que el japonés.',
      'Le coréen est plus difficile que le japonais.',
      'O coreano é mais difícil que o japonês.',
      'ภาษาเกาหลียากกว่าภาษาญี่ปุ่น',
      'Bahasa Korea lebih sulit daripada bahasa Jepang.',
      'Tiếng Hàn khó hơn tiếng Nhật.',
      '韓国語は日本語より難しいです。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 8 · Preguntas indirectas y matices
  // ─────────────────────────────────────────────────────────────────────────

  // G049 · Indirect question
  {
    ko: '-(으)ㄴ/는지',
    meaning: L(
      'embeds a question — "whether / when / what / where..." in subordinate clauses',
      'pregunta indirecta — "si / cuándo / qué / dónde..." en oraciones subordinadas',
      'question indirecte — «si / quand / quoi / où» dans une subordonnée',
      'pergunta indireta — "se / quando / o que / onde" em orações subordinadas',
      'คำถามอ้อม — "ว่า/อย่างไร/ที่ไหน ..." ในประโยคย่อย',
      'pertanyaan tak langsung — "apakah / kapan / apa / di mana ..." di anak kalimat',
      'câu hỏi gián tiếp — "liệu / khi nào / cái gì / ở đâu ..." trong mệnh đề phụ',
      '間接疑問「〜のか / 〜かどうか」',
    ),
    example: '어디에 사는지 알아요?',
    trans: L(
      'Do you know where they live?',
      '¿Sabes dónde vive?',
      'Sais-tu où il/elle habite ?',
      'Você sabe onde mora?',
      'รู้ไหมว่าเขาอยู่ที่ไหน',
      'Tahu di mana dia tinggal?',
      'Bạn có biết người ấy sống ở đâu không?',
      'どこに住んでいるか知っていますか？',
    ),
    deckId: 'topik-2',
  },

  // G057 · Soft context ending
  {
    ko: '-(으)ㄴ/는데요',
    meaning: L(
      '"the thing is..." (polite) — softens, invites listener’s reaction',
      '"es que..." (educado) — suaviza la afirmación; invita a reaccionar',
      '«il faut savoir que…» (poli) — adoucit, invite à réagir',
      '"acontece que..." (educado) — suaviza e convida à reação',
      '"คือว่า ..." (สุภาพ) — เกริ่นให้ผู้ฟังตอบ',
      '"jadi begini..." (sopan) — pelunak, mengundang reaksi',
      '"chuyện là..." (lịch sự) — làm dịu câu nói',
      '「〜なんですけど」— 丁寧な前置き',
    ),
    example: '좀 비싼데요...',
    trans: L(
      'It’s a bit pricey, though...',
      'Es un poco caro, la verdad...',
      'C’est un peu cher, en fait…',
      'É um pouco caro, na verdade...',
      'แพงไปหน่อยน่ะ ...',
      'Agak mahal sih...',
      'Hơi đắt đấy...',
      'ちょっと高いんですけど…',
    ),
    deckId: 'topik-2',
  },

  // G058 · How (much / long / etc.)
  {
    ko: '얼마나',
    meaning: L(
      '"how much / how + adjective" — asks degree or amount',
      '"cuánto / qué tan" — pregunta por grado o cantidad',
      '«combien / à quel point» — degré ou quantité',
      '"quanto / quão" — pergunta por grau ou quantidade',
      '"แค่ไหน / นานเท่าไหร่" — ถามระดับหรือปริมาณ',
      '"seberapa / berapa banyak" — menanyakan kadar atau jumlah',
      '"bao nhiêu / đến mức nào" — hỏi mức độ hoặc số lượng',
      '「どのくらい / どれだけ」',
    ),
    example: '여기서 학교까지 얼마나 걸려요?',
    trans: L(
      'How long does it take from here to school?',
      '¿Cuánto se tarda de aquí hasta la escuela?',
      'Combien de temps faut-il d’ici à l’école ?',
      'Quanto leva daqui até a escola?',
      'จากที่นี่ไปโรงเรียนใช้เวลาเท่าไหร่',
      'Berapa lama dari sini ke sekolah?',
      'Từ đây đến trường mất bao lâu?',
      'ここから学校までどのくらいかかりますか？',
    ),
    deckId: 'topik-2',
  },

  // G054 · About / regarding
  {
    ko: '에 대해(서)',
    meaning: L(
      '"about / regarding / on the topic of" — also 에 대한 + N',
      '"sobre / acerca de / respecto a" — también 에 대한 + N',
      '«à propos de / concernant» — aussi 에 대한 + N',
      '"sobre / a respeito de" — também 에 대한 + N',
      '"เกี่ยวกับ" — รูปขยายคำนาม 에 대한 + N',
      '"tentang / mengenai" — bentuk pengubah: 에 대한 + N',
      '"về / liên quan đến" — bổ ngữ danh từ 에 대한 + N',
      '「〜について」(連体形: 에 대한 + N)',
    ),
    example: '한국 문화에 대해서 이야기해요.',
    trans: L(
      'We’re talking about Korean culture.',
      'Hablamos sobre la cultura coreana.',
      'On parle de la culture coréenne.',
      'Estamos falando sobre cultura coreana.',
      'พวกเราคุยกันเรื่องวัฒนธรรมเกาหลี',
      'Kami berbicara tentang budaya Korea.',
      'Chúng tôi nói chuyện về văn hóa Hàn Quốc.',
      '韓国の文化について話します。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 9 · Reacciones y matices
  // ─────────────────────────────────────────────────────────────────────────

  // G144 · For fear that
  {
    ko: '-(으)ㄹ까 봐',
    meaning: L(
      '"for fear that / in case ..." — precaution against unwanted outcome',
      '"por miedo a que / por si acaso ..." — precaución ante algo no deseado',
      '«de peur que / au cas où» — précaution contre quelque chose d’indésirable',
      '"com medo de que / por via das dúvidas" — precaução contra algo ruim',
      '"กลัวว่าจะ ..." — เพื่อป้องกันสิ่งไม่ดี',
      '"khawatir ... / kalau-kalau ..." — pencegahan',
      '"sợ rằng / phòng khi ..." — đề phòng',
      '「〜かと思って / 〜と心配して」',
    ),
    example: '비가 올까 봐 우산을 가져왔어요.',
    trans: L(
      'I brought an umbrella in case it rained.',
      'Traje el paraguas por si llovía.',
      'J’ai apporté un parapluie au cas où il pleuvrait.',
      'Trouxe um guarda-chuva, com medo de chover.',
      'เอาร่มมาเผื่อฝนตก',
      'Saya bawa payung, takut nanti hujan.',
      'Tôi mang ô vì sợ trời mưa.',
      '雨が降るかと思って傘を持ってきました。',
    ),
    deckId: 'topik-2',
  },

  // G148 · Even if (strong hypothetical)
  {
    ko: '-더라도',
    meaning: L(
      '"even if / even in the case that ..." — stronger than -아/어도; hypothetical',
      '"aunque / incluso si (hipotético)" — más fuerte que -아/어도',
      '«même si / même au cas où» — plus fort que -아/어도',
      '"mesmo que / mesmo se" — mais forte que -아/어도',
      '"แม้ว่า / แม้จะ ..." — เน้นกว่า -아/어도',
      '"meskipun / bahkan jika" — lebih kuat dari -아/어도',
      '"dù cho / cho dù" — mạnh hơn -아/어도',
      '「〜たとしても / 〜であっても」',
    ),
    example: '시간이 없더라도 밥은 먹어야 해요.',
    trans: L(
      'Even if you have no time, you have to eat.',
      'Aunque no tengas tiempo, tienes que comer.',
      'Même si tu n’as pas le temps, tu dois manger.',
      'Mesmo que não tenha tempo, precisa comer.',
      'แม้ไม่มีเวลาก็ต้องกินข้าว',
      'Meskipun tidak ada waktu, harus tetap makan.',
      'Dù không có thời gian thì cũng phải ăn.',
      '時間がなくてもご飯は食べなければなりません。',
    ),
    deckId: 'topik-2',
  },

  // G149 · Might / maybe
  {
    ko: '-(으)ㄹ지도 모르다',
    meaning: L(
      '"might / maybe / it’s possible that ..." — uncertain possibility',
      '"puede que / quizás / a lo mejor ..." — posibilidad incierta',
      '«il se peut que / peut-être» — possibilité incertaine',
      '"pode ser que / talvez ..." — possibilidade incerta',
      '"อาจจะ / อาจเป็นไปได้ว่า ..." — ความเป็นไปได้ที่ไม่แน่ใจ',
      '"mungkin / siapa tahu ..." — kemungkinan tidak pasti',
      '"có thể / biết đâu ..." — khả năng không chắc',
      '「〜かもしれない」',
    ),
    example: '내일 비가 올지도 몰라요.',
    trans: L(
      'It might rain tomorrow.',
      'Puede que mañana llueva.',
      'Il se peut qu’il pleuve demain.',
      'Pode ser que chova amanhã.',
      'พรุ่งนี้อาจจะฝนตก',
      'Mungkin besok akan hujan.',
      'Ngày mai có thể trời mưa.',
      '明日雨が降るかもしれません。',
    ),
    deckId: 'topik-2',
  },

  // G150 · As you know / it’s that ...
  {
    ko: '-잖아요',
    meaning: L(
      '"as you know / it’s that ..." — recalls shared info, mild reproach',
      '"es que / como sabes ..." — alude a información compartida; leve reproche',
      '«tu vois bien que / tu sais que ...» — info partagée, léger reproche',
      '"é que / como você sabe ..." — apela a info já compartilhada',
      '"ก็ ... ไง" — เตือนสิ่งที่ทั้งคู่รู้ดี (ติเตียนเล็กน้อย)',
      '"kan / bukannya ..." — mengingatkan info yang sudah diketahui',
      '"đấy thôi / mà ..." — gợi nhớ điều cả hai đã biết',
      '「〜じゃないですか / 〜でしょ」— 既知情報の確認・軽い咎め',
    ),
    example: '저 그 사람 싫어하잖아요.',
    trans: L(
      'I don’t like that person, you know.',
      'Es que ya sabes que esa persona no me gusta.',
      'Tu sais bien que je n’aime pas cette personne.',
      'É que eu não gosto dessa pessoa, sabe.',
      'ก็รู้อยู่แล้วว่าฉันไม่ชอบคนนั้น',
      'Saya kan tidak suka orang itu.',
      'Tôi không thích người đó mà, anh biết rồi đấy.',
      '私あの人が嫌いじゃないですか。',
    ),
    deckId: 'topik-2',
  },

  // G151 · Realization (calm)
  {
    ko: '-군요 / -구나',
    meaning: L(
      '"ah, I see ..." — quiet realization (군요 polite / 구나 casual)',
      '"ah, ya veo ..." — descubrimiento tranquilo (군요 educado / 구나 informal)',
      '«ah, je vois» — réalisation calme (군요 poli / 구나 familier)',
      '"ah, entendi ..." — percepção tranquila (군요 educado / 구나 informal)',
      '"อ๋อ, อย่างนี้นี่เอง" — เข้าใจอย่างสงบ (군요 สุภาพ / 구나 กันเอง)',
      '"oh begitu..." — penyadaran tenang (군요 sopan / 구나 santai)',
      '"à ra vậy ..." — phát hiện êm dịu (군요 lịch sự / 구나 thân mật)',
      '「〜ですね / 〜なんですね」— 落ち着いた気づき(군요 丁寧 / 구나 タメ)',
    ),
    example: '이 식당이 유명하군요.',
    trans: L(
      'Ah, this restaurant is famous!',
      '¡Ah, este restaurante es famoso!',
      'Ah, ce restaurant est célèbre !',
      'Ah, esse restaurante é famoso!',
      'อ๋อ ร้านอาหารร้านนี้ดังนี่เอง',
      'Oh, ternyata restoran ini terkenal.',
      'À, nhà hàng này nổi tiếng đấy.',
      'この食堂は有名なんですね。',
    ),
    deckId: 'topik-2',
  },

  // G152 · Evidential (I noticed firsthand)
  {
    ko: '-더라고요',
    meaning: L(
      '"I noticed / it turned out ..." — recounting a direct past observation',
      '"resultó que / me di cuenta de que ..." — observación directa pasada',
      '«il s’est avéré que / j’ai constaté que» — observation directe passée',
      '"acabou que / percebi que ..." — observação direta no passado',
      '"ปรากฏว่า / ฉันสังเกตเห็นว่า ..." — เล่าจากที่ได้เห็นเอง',
      '"ternyata / saya menyadari ..." — pengamatan langsung lampau',
      '"hóa ra / tôi nhận ra rằng ..." — quan sát trực tiếp trong quá khứ',
      '「〜でしたよ / 〜していました」— 直接観察の報告',
    ),
    example: '그 식당 음식이 정말 맛있더라고요.',
    trans: L(
      'It turned out the food at that restaurant was really good.',
      'Resulta que la comida de ese restaurante estaba muy rica.',
      'Il s’est avéré que la nourriture de ce restaurant était excellente.',
      'Acabou que a comida daquele restaurante era muito boa.',
      'ปรากฏว่าอาหารร้านนั้นอร่อยจริง ๆ',
      'Ternyata makanan restoran itu enak sekali.',
      'Hóa ra món ăn nhà hàng đó ngon thật.',
      'あのお店の料理、本当に美味しかったですよ。',
    ),
    deckId: 'topik-2',
  },

  // G153 · As much as
  {
    ko: '-(으)ㄹ 만큼',
    meaning: L(
      '"as much as / to the extent that" — proportion or sufficiency',
      '"tanto como / lo suficiente como para" — proporción o suficiencia',
      '«autant que / au point que» — proportion ou suffisance',
      '"tanto quanto / o suficiente para" — proporção ou suficiência',
      '"เท่าที่ / มากพอที่จะ" — สัดส่วนหรือความเพียงพอ',
      '"sebanyak / cukup untuk" — proporsi atau kecukupan',
      '"đến mức / vừa đủ" — tỷ lệ hoặc đủ',
      '「〜ほど / 〜くらい」— 程度・十分さ',
    ),
    example: '먹을 만큼 드세요.',
    trans: L(
      'Take as much as you’ll eat.',
      'Sírvase lo que vaya a comer.',
      'Sers-toi autant que tu vas en manger.',
      'Sirva-se quanto for comer.',
      'ตักไปเท่าที่จะกินไหว',
      'Ambil sebanyak yang akan dimakan.',
      'Lấy đủ phần bạn ăn.',
      '食べる分だけ取ってください。',
    ),
    deckId: 'topik-2',
  },

  // G155 · Easy / hard to
  {
    ko: '-기 쉽다/어렵다',
    meaning: L(
      '"is easy / hard to ..." — describes an action’s difficulty',
      '"es fácil / difícil + infinitivo" — describe la dificultad de una acción',
      '«il est facile / difficile de» — décrit la difficulté d’une action',
      '"é fácil / difícil de ..." — descreve a dificuldade de uma ação',
      '"ทำ ... ได้ง่าย / ยาก"',
      '"mudah / sulit untuk ..."',
      '"dễ / khó để ..."',
      '「〜やすい / 〜にくい」',
    ),
    example: '이 단어는 잊어버리기 쉬워요.',
    trans: L(
      'This word is easy to forget.',
      'Esta palabra es fácil de olvidar.',
      'Ce mot est facile à oublier.',
      'Essa palavra é fácil de esquecer.',
      'คำนี้ลืมง่าย',
      'Kata ini mudah dilupakan.',
      'Từ này dễ quên.',
      'この単語は忘れやすいです。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 10 · Pasiva básica y otros
  // ─────────────────────────────────────────────────────────────────────────

  // G157 · Passive morphology (basic)
  {
    ko: '피동사 (이/히/리/기)',
    meaning: L(
      'morphological passive — suffix 이/히/리/기 turns active into passive',
      'pasiva morfológica — sufijos 이/히/리/기 transforman activo a pasivo',
      'passif morphologique — suffixes 이/히/리/기 (boire→être bu)',
      'voz passiva morfológica — sufixos 이/히/리/기',
      'รูปกริยาถูกกระทำ — เติม 이/히/리/기 ที่กริยาทำ',
      'pasif morfologis — sufiks 이/히/리/기 mengubah aktif ke pasif',
      'thể bị động hình thái — hậu tố 이/히/리/기',
      '形態的受動 (이/히/리/기) — 보이다/들리다/잡히다…',
    ),
    example: '저기서 바다가 보여요.',
    trans: L(
      'You can see the sea from there.',
      'Desde allí se ve el mar.',
      'D’ici, on voit la mer.',
      'Dali dá para ver o mar.',
      'จากตรงนั้นมองเห็นทะเล',
      'Dari sana lautnya kelihatan.',
      'Từ đó nhìn thấy biển.',
      'あそこから海が見えます。',
    ),
    deckId: 'topik-2',
  },

  // G158 · Any / none (universal quantifier)
  {
    ko: '아무 N(이)나 / 아무 N도',
    meaning: L(
      '"any N (positive)" / "no N at all (with negation)"',
      '"cualquier N" (positivo) / "ningún N" (con negación)',
      '«n’importe quel N» (positif) / «aucun N» (avec négation)',
      '"qualquer N" (positivo) / "nenhum N" (com negação)',
      '"N อะไรก็ได้" (บวก) / "ไม่มี N เลย" (กับปฏิเสธ)',
      '"N apa saja" (positif) / "tidak ada N pun" (dengan negasi)',
      '"N nào cũng" (khẳng định) / "không N nào" (phủ định)',
      '肯定: 何/誰/どこでも / 否定: 何も/誰も/どこも',
    ),
    example: '아무 것이나 드세요.',
    trans: L(
      'Take anything, whatever you’d like.',
      'Tome cualquier cosa, lo que quiera.',
      'Prends ce que tu veux.',
      'Pegue qualquer coisa, o que quiser.',
      'หยิบอะไรก็ได้',
      'Ambil saja apa pun, sesuka Anda.',
      'Lấy gì cũng được, tùy bạn.',
      '何でも召し上がってください。',
    ),
    deckId: 'topik-2',
  },

  // G159 · At least (concession)
  {
    ko: '(이)라도',
    meaning: L(
      '"at least / even if just ..." — accept a less-than-ideal option',
      '"aunque solo sea / al menos ..." — aceptar una opción no ideal',
      '«au moins / ne serait-ce que» — accepter une option non idéale',
      '"pelo menos / mesmo que seja ..." — aceitar opção não ideal',
      '"อย่างน้อย ... ก็ ..." — รับตัวเลือกที่ไม่สมบูรณ์',
      '"setidaknya / kalaupun cuma ..." — menerima opsi tak ideal',
      '"ít nhất / dù chỉ ..." — chấp nhận lựa chọn không lý tưởng',
      '「〜でも (せめて)」— 控えめな提案/受容',
    ),
    example: '물이라도 마실래요?',
    trans: L(
      'Would you like at least some water?',
      '¿Quieres al menos tomar agua?',
      'Tu veux au moins boire un peu d’eau ?',
      'Quer pelo menos beber água?',
      'จะดื่มน้ำเปล่าก็ยังดีนะ',
      'Mau minum air saja kalau begitu?',
      'Bạn có muốn ít nhất uống chút nước không?',
      'お水でも飲みますか？',
    ),
    deckId: 'topik-2',
  },

  // G160 · Echo (you said ...?)
  {
    ko: '-다고요? / -(이)라고요?',
    meaning: L(
      'repeats what was just heard, with surprise or for confirmation',
      'repite lo que se acaba de escuchar, con sorpresa o para confirmar',
      'reprend ce qui vient d’être dit, par surprise ou pour confirmer',
      'repete o que acabou de ouvir, com surpresa ou para confirmar',
      'ทวนคำที่เพิ่งได้ยิน ด้วยความแปลกใจ / ขอยืนยัน',
      'mengulang yang baru didengar, dengan kaget atau minta konfirmasi',
      'lặp lại điều vừa nghe, ngạc nhiên hoặc xác nhận',
      '「〜って言いましたか？」— 確認・驚きで聞き返す',
    ),
    example: '내일 시험이 있다고요?',
    trans: L(
      'There’s an exam tomorrow, you say?',
      '¿Que mañana hay examen?',
      'Tu dis qu’il y a un examen demain ?',
      'Você disse que tem prova amanhã?',
      'พรุ่งนี้มีสอบเหรอ',
      'Katanya besok ada ujian?',
      'Bạn nói ngày mai có thi à?',
      '明日試験があるんですって？',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 11 · Cambio y adverbios temporales
  // ─────────────────────────────────────────────────────────────────────────

  // G051 · Become (noun)
  {
    ko: '이/가 되다',
    meaning: L(
      '"to become (a noun)" — change of state / role',
      '"convertirse en / llegar a ser" — cambio de estado o rol',
      '«devenir» — changement d’état ou de rôle',
      '"tornar-se / virar" — mudança de estado ou papel',
      '"กลายเป็น ..." — เปลี่ยนสภาพหรือบทบาท',
      '"menjadi ..." — perubahan keadaan / peran',
      '"trở thành ..." — đổi trạng thái / vai trò',
      '「〜になる」',
    ),
    example: '저는 의사가 되고 싶어요.',
    trans: L(
      'I want to become a doctor.',
      'Quiero convertirme en médico.',
      'Je veux devenir médecin.',
      'Eu quero ser médico.',
      'ฉันอยากเป็นหมอ',
      'Saya ingin menjadi dokter.',
      'Tôi muốn trở thành bác sĩ.',
      '私は医者になりたいです。',
    ),
    deckId: 'topik-2',
  },

  // G056 · Still / already / already (neutral)
  {
    ko: '아직 / 벌써 / 이미',
    meaning: L(
      '"still / already (sooner than expected) / already (neutral fact)"',
      '"todavía / ya (más pronto de lo esperado) / ya (hecho neutral)"',
      '«encore / déjà (plus tôt que prévu) / déjà (fait constaté)»',
      '"ainda / já (mais cedo que o esperado) / já (fato consumado)"',
      '"ยัง / เร็วจัง / เสร็จเรียบร้อยแล้ว"',
      '"masih / sudah (lebih cepat dari kira) / sudah (fakta)"',
      '"vẫn / đã (sớm hơn dự kiến) / đã (sự thật rồi)"',
      '「まだ / もう(意外な早さ) / すでに(既成事実)」',
    ),
    example: '아직 숙제를 안 했어요.',
    trans: L(
      'I haven’t done the homework yet.',
      'Todavía no he hecho la tarea.',
      'Je n’ai pas encore fait mes devoirs.',
      'Ainda não fiz a lição.',
      'ฉันยังไม่ได้ทำการบ้านเลย',
      'Saya belum mengerjakan PR.',
      'Tôi vẫn chưa làm bài tập.',
      'まだ宿題をしていません。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 12 · Transversales que se introducen en este nivel
  // (auxiliares G205–G233 que aparecen ya en TOPIK 2)
  // ─────────────────────────────────────────────────────────────────────────

  // G210 · I’m dying of ... (everyday hyperbole, from auxiliaries.md)
  {
    ko: '-아/어 죽겠다',
    meaning: L(
      '"I’m dying of ..." — colloquial hyperbole for an extreme feeling',
      '"me muero de ..." — hipérbole coloquial para sensación extrema',
      '«je meurs de ...» — hyperbole familière',
      '"estou morrendo de ..." — hipérbole coloquial',
      '"... จะตายอยู่แล้ว" — สำนวนกึ่งเล่น กึ่งจริง',
      '"saya hampir mati karena ..." — hiperbol sehari-hari',
      '"chết mất vì ..." — nói cường điệu thân mật',
      '「〜て死にそうだ」— 口語的誇張',
    ),
    example: '배고파 죽겠어요.',
    trans: L(
      'I’m starving (lit. dying of hunger).',
      'Me muero de hambre.',
      'Je meurs de faim.',
      'Estou morrendo de fome.',
      'หิวจะตายแล้ว',
      'Saya lapar setengah mati.',
      'Tôi đói chết mất.',
      'お腹が空いて死にそうです。',
    ),
    deckId: 'topik-2',
  },

  // G212 · Colloquial connector (from auxiliaries.md)
  {
    ko: '-아/어 가지고',
    meaning: L(
      '"and so / because ..." — colloquial connector, often contracted to -아/어 갖고; spoken-only alternative to -아/어서',
      '"y entonces / porque ..." — conector coloquial, se contrae a -아/어 갖고; alternativa hablada de -아/어서',
      '«et donc / parce que ...» — connecteur familier, contracté en -아/어 갖고',
      '"e então / porque ..." — conector falado, contrai para -아/어 갖고',
      '"... แล้วก็ ... / เพราะ ... (พูด)"',
      '"jadi / karena ... (lisan)" — sering disingkat -아/어 갖고',
      '"do đó / vì ... (nói)" — rút gọn -아/어 갖고',
      '「〜して(口語) / 〜なので」— 縮約 -아/어 갖고',
    ),
    example: '비가 와 가지고 못 갔어요.',
    trans: L(
      'It rained, so I couldn’t go.',
      'Como llovió, no pude ir.',
      'Comme il pleuvait, je n’ai pas pu y aller.',
      'Choveu, então não pude ir.',
      'ฝนตกเลยไปไม่ได้',
      'Gara-gara hujan, saya tidak bisa pergi.',
      'Vì trời mưa nên tôi không đi được.',
      '雨が降って行けませんでした。',
    ),
    deckId: 'topik-2',
  },

  // G216 · Leave halfway (from auxiliaries.md)
  {
    ko: '-다(가) 말다',
    meaning: L(
      '"start ...ing and then leave it" — partial action abandoned midway',
      '"empezar a ... y dejarlo a medias" — acción parcial abandonada',
      '«commencer à ... puis laisser tomber» — action abandonnée',
      '"começar a ... e largar pela metade" — ação abandonada',
      '"ทำ ... ค้างไว้ / เลิกกลางทาง"',
      '"melakukan ... lalu meninggalkannya di tengah jalan"',
      '"đang ... thì bỏ dở"',
      '「〜しかけてやめる」— 中途で放棄',
    ),
    example: '책을 읽다가 말았어요.',
    trans: L(
      'I started reading the book but left it halfway.',
      'Empecé a leer el libro pero lo dejé a medias.',
      'J’ai commencé à lire le livre mais je l’ai laissé tomber.',
      'Comecei a ler o livro, mas larguei pela metade.',
      'อ่านหนังสือค้างเอาไว้',
      'Saya mulai membaca buku tapi tidak selesai.',
      'Tôi đọc sách được nửa chừng rồi bỏ.',
      '本を読みかけてやめました。',
    ),
    deckId: 'topik-2',
  },
]

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
    usageNotes: L(
      'Turns a verb (or whole verb phrase) into a noun — "the act of / -ing". Form: attach -는 것 to the action verb stem (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 with ㄹ dropping). For adjectives use -(으)ㄴ 것 instead. The 것 is itself the noun "thing / fact", so the literal reading is "the thing of doing X".\n\nVery often contracted in speech. -는 것이 → -는 게 (subject: 노래하는 게 좋아요 "I like singing"); -는 것을 → -는 걸 (object: 노래하는 걸 좋아해요 "I love singing"); -는 것은 → -는 건 (topic: 노래하는 건 쉬워요 "as for singing, it\'s easy"). All three contractions are everyday register — totally fine in polite-informal speech. -는 것 competes with -기 (the other nominalizer), but tends to refer to specific actions or things in context, while -기 is more abstract and lives in fixed expressions like -기 시작하다, -기 위해서, -기 전에. Pick -는 것 for "the act of X" in flowing speech, -기 when the next verb requires it.',
      'Convierte un verbo (o frase verbal entera) en sustantivo — "el hecho de / -ar". Forma: pegá -는 것 a la raíz del verbo de acción (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 con ㄹ que cae). Para adjetivos se usa -(으)ㄴ 것. El 것 es el sustantivo "cosa / hecho", así que la lectura literal es "la cosa de hacer X".\n\nMuy frecuente en su forma contraída al hablar. -는 것이 → -는 게 (sujeto: 노래하는 게 좋아요 "me gusta cantar"); -는 것을 → -는 걸 (objeto: 노래하는 걸 좋아해요 "amo cantar"); -는 것은 → -는 건 (tema: 노래하는 건 쉬워요 "lo de cantar es fácil"). Las tres contracciones son habituales — perfectamente válidas en el registro educado-informal. -는 것 compite con -기 (el otro nominalizador), pero suele referirse a acciones o cosas específicas del contexto, mientras que -기 es más abstracto y vive en expresiones fijas como -기 시작하다, -기 위해서, -기 전에. Elegí -는 것 para "el acto de X" en el habla fluida y -기 cuando el siguiente verbo lo exige.',
      'Transforme un verbe (ou groupe verbal entier) en nom — « le fait de / -er ». Forme : on colle -는 것 à la racine du verbe d\'action (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 avec chute du ㄹ). Pour les adjectifs, on emploie -(으)ㄴ 것. 것 est en lui-même le nom « chose / fait », d\'où la lecture littérale « la chose de faire X ».\n\nTrès fréquemment contracté à l\'oral. -는 것이 → -는 게 (sujet : 노래하는 게 좋아요 « j\'aime chanter ») ; -는 것을 → -는 걸 (COD : 노래하는 걸 좋아해요 « j\'adore chanter ») ; -는 것은 → -는 건 (thème : 노래하는 건 쉬워요 « pour ce qui est de chanter, c\'est facile »). Les trois contractions sont du registre courant — tout à fait acceptables à l\'oral poli-familier. -는 것 entre en concurrence avec -기 (l\'autre nominalisateur), mais désigne en général une action ou un objet précis dans le contexte, tandis que -기 est plus abstrait et vit dans des expressions figées : -기 시작하다, -기 위해서, -기 전에. Choisir -는 것 pour « le fait de X » à l\'oral courant, et -기 quand le verbe suivant l\'exige.',
      'Transforma um verbo (ou frase verbal inteira) em substantivo — "o ato de / fazer". Forma: anexe -는 것 ao radical do verbo de ação (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 com ㄹ caindo). Para adjetivos use -(으)ㄴ 것. O 것 é o próprio substantivo "coisa / fato", então a leitura literal é "a coisa de fazer X".\n\nMuito contraído na fala. -는 것이 → -는 게 (sujeito: 노래하는 게 좋아요 "gosto de cantar"); -는 것을 → -는 걸 (objeto: 노래하는 걸 좋아해요 "amo cantar"); -는 것은 → -는 건 (tópico: 노래하는 건 쉬워요 "isso de cantar é fácil"). As três contrações são corriqueiras — perfeitamente OK no registro educado-casual. -는 것 disputa espaço com -기 (o outro nominalizador), mas costuma se referir a ações ou coisas específicas no contexto, enquanto -기 é mais abstrato e mora em expressões fixas como -기 시작하다, -기 위해서, -기 전에. Use -는 것 para "o ato de X" na fala corrente; -기 quando o próximo verbo exigir.',
      'เปลี่ยนกริยา (หรือทั้งวลีกริยา) ให้กลายเป็นคำนาม — "การ ... / เรื่อง ...". รูป: เกาะ -는 것 ที่รากกริยาบอกการกระทำ (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 ㄹ หล่น). กับคำคุณศัพท์ใช้ -(으)ㄴ 것. 것 เป็นคำนามแปลว่า "สิ่ง / เรื่อง" ดังนั้นความหมายตามตัวอักษรคือ "สิ่งของการทำ X"\n\nย่อบ่อยมากในการพูด. -는 것이 → -는 게 (ประธาน: 노래하는 게 좋아요 "ชอบร้องเพลง"); -는 것을 → -는 걸 (กรรม: 노래하는 걸 좋아해요 "รักการร้องเพลง"); -는 것은 → -는 건 (หัวเรื่อง: 노래하는 건 쉬워요 "เรื่องการร้องเพลงน่ะง่าย"). ทั้งสามรูปย่อใช้ได้สบายในระดับสุภาพ-ไม่ทางการ. -는 것 แข่งกับ -기 (ตัวเปลี่ยนเป็นนามอีกตัวหนึ่ง) แต่มักหมายถึงการกระทำหรือสิ่งของเฉพาะในบริบท ขณะที่ -기 เป็นนามธรรมกว่าและอาศัยอยู่ในสำนวนตายตัวอย่าง -기 시작하다, -기 위해서, -기 전에. เลือก -는 것 สำหรับ "การทำ X" ในการพูดทั่วไป และ -기 เมื่อกริยาที่ตามมาเรียกรูปนี้',
      'Mengubah verba (atau seluruh frasa verba) menjadi kata benda — "tindakan ... / -ing". Bentuk: tempelkan -는 것 ke akar verba aksi (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 dengan ㄹ jatuh). Untuk adjektiva pakai -(으)ㄴ 것. 것 sendiri adalah kata benda "hal / kenyataan", jadi bacaan harfiahnya "hal melakukan X".\n\nSangat sering dikerutkan saat bicara. -는 것이 → -는 게 (subjek: 노래하는 게 좋아요 "saya suka bernyanyi"); -는 것을 → -는 걸 (objek: 노래하는 걸 좋아해요 "saya cinta bernyanyi"); -는 것은 → -는 건 (topik: 노래하는 건 쉬워요 "soal bernyanyi gampang"). Ketiga kerutan ini umum — pas saja di register sopan-santai. -는 것 bersaing dengan -기 (nominalizer lain), tapi cenderung merujuk pada tindakan/hal spesifik dalam konteks, sementara -기 lebih abstrak dan tinggal di ungkapan tetap seperti -기 시작하다, -기 위해서, -기 전에. Pilih -는 것 untuk "tindakan X" dalam percakapan mengalir; -기 saat verba berikutnya menuntut bentuk itu.',
      'Biến động từ (hoặc cả cụm động từ) thành danh từ — "việc / hành động làm". Hình thức: gắn -는 것 vào gốc động từ hành động (가다 → 가는 것, 먹다 → 먹는 것, 살다 → 사는 것 ㄹ rụng). Với tính từ dùng -(으)ㄴ 것. 것 bản thân là danh từ "việc / chuyện", nên nghĩa đen là "việc làm X".\n\nRất hay rút gọn trong khẩu ngữ. -는 것이 → -는 게 (chủ ngữ: 노래하는 게 좋아요 "tôi thích hát"); -는 것을 → -는 걸 (tân ngữ: 노래하는 걸 좋아해요 "tôi rất thích hát"); -는 것은 → -는 건 (chủ đề: 노래하는 건 쉬워요 "chuyện hát thì dễ"). Cả ba dạng rút gọn đều thông dụng — phù hợp với cấp độ lịch sự-thân mật. -는 것 cạnh tranh với -기 (danh từ hoá khác), nhưng thường chỉ một hành động hoặc sự việc cụ thể trong ngữ cảnh, còn -기 trừu tượng hơn và sống trong các cụm cố định như -기 시작하다, -기 위해서, -기 전에. Chọn -는 것 cho "việc X" trong khẩu ngữ tự nhiên, -기 khi động từ tiếp theo yêu cầu dạng đó.',
      '動詞(あるいは動詞句全体)を名詞化する「〜ること／〜の」。形: 動作動詞の語幹に -는 것 を付ける(가다 → 가는 것、먹다 → 먹는 것、살다 → 사는 것 で ㄹ 脱落)。形容詞には -(으)ㄴ 것 を使う。것 はそれ自体「もの／こと」という名詞なので、直訳すると「Xすること」になる。\n\n会話では非常によく縮約される。-는 것이 → -는 게(主格: 노래하는 게 좋아요「歌うのが好き」)、-는 것을 → -는 걸(目的格: 노래하는 걸 좋아해요「歌うのを愛している」)、-는 것은 → -는 건(主題: 노래하는 건 쉬워요「歌うことについては簡単だ」)。三つの縮約形は会話の標準で、丁寧体・カジュアル寄りでも自然。-는 것 はもう一つの名詞化形 -기 と棲み分けがあり、文脈の中の具体的な動作・物事を指すことが多いのに対して、-기 はより抽象的で -기 시작하다、-기 위해서、-기 전에 などの固定表現に住む。会話で「Xすること」と言うなら -는 것、後続動詞が -기 を要求するなら -기 を選ぶ。',
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
    usageNotes: L(
      'The default Korean soft hedge — "it seems / I think / it looks like". The modifier changes by tense and part of speech: action verb present → -는 것 같다 (가는 것 같다 "looks like they\'re going"); adjective / copula present → -(으)ㄴ 것 같다 (추운 것 같다 "seems cold", 학생인 것 같다 "seems to be a student"); past (any) → -(으)ㄴ 것 같다 from a verb (간 것 같다 "looks like they went") or -았/었던 것 같다 for recalled past; future / supposition → -(으)ㄹ 것 같다 (비가 올 것 같다 "looks like it\'ll rain").\n\nUsed everywhere as a politeness hedge — Korean prefers softening direct claims even when the speaker is confident (저는 잘 모르는 것 같아요 "I think I don\'t really know" sounds more humble than 저는 잘 몰라요). For first-person opinions about your own feelings or preferences (좋은 것 같아요 "I think it\'s good"), the form is much softer than 좋아요. Don\'t overuse for clear factual statements — if you actually saw it rain, just say 비가 와요. Compare neighbors: -겠- (immediate observation, "it must be"), -(으)ㄹ 거예요 (assertion about future), -나 보다 (inferred from external evidence) — -(으)ㄴ/는 것 같다 is the softest, most personal hedge of the family.',
      'El paño de cortesía coreano por defecto — "parece / creo / da la sensación". El modificador cambia según tiempo y categoría: verbo de acción presente → -는 것 같다 (가는 것 같다 "parece que va"); adjetivo / cópula presente → -(으)ㄴ 것 같다 (추운 것 같다 "parece que hace frío", 학생인 것 같다 "parece ser estudiante"); pasado (cualquiera) → -(으)ㄴ 것 같다 con verbo (간 것 같다 "parece que fue") o -았/었던 것 같다 para pasados recordados; futuro / suposición → -(으)ㄹ 것 같다 (비가 올 것 같다 "parece que va a llover").\n\nSe usa por todos lados como amortiguador de cortesía — el coreano prefiere suavizar las afirmaciones directas incluso cuando el hablante está seguro (저는 잘 모르는 것 같아요 "creo que no sé bien" suena más humilde que 저는 잘 몰라요). Para opiniones en 1ª persona sobre lo que sentís o preferís (좋은 것 같아요 "creo que está bueno"), la forma es bastante más suave que 좋아요. No abuses para hechos claros — si efectivamente viste llover, decí 비가 와요. Comparalo con sus vecinos: -겠- (observación inmediata, "debe ser"), -(으)ㄹ 거예요 (afirmación sobre el futuro), -나 보다 (inferencia desde evidencia externa) — -(으)ㄴ/는 것 같다 es el más suave y personal de la familia.',
      'L\'atténuateur poli par défaut du coréen — « il semble que / je crois / on dirait ». La forme du modificateur change selon le temps et la nature du mot : verbe d\'action au présent → -는 것 같다 (가는 것 같다 « on dirait qu\'il y va ») ; adjectif / copule au présent → -(으)ㄴ 것 같다 (추운 것 같다 « il semble qu\'il fait froid », 학생인 것 같다 « il a l\'air d\'être étudiant ») ; passé (toutes catégories) → -(으)ㄴ 것 같다 sur un verbe (간 것 같다 « on dirait qu\'il y est allé ») ou -았/었던 것 같다 pour un passé évoqué ; futur / supposition → -(으)ㄹ 것 같다 (비가 올 것 같다 « on dirait qu\'il va pleuvoir »).\n\nEmployé partout comme amortisseur de politesse — le coréen préfère adoucir les affirmations directes même quand le locuteur est sûr de lui (저는 잘 모르는 것 같아요 « je crois que je ne sais pas bien » sonne plus humble que 저는 잘 몰라요). Pour des opinions à la 1ʳᵉ personne sur ses propres goûts ou ressentis (좋은 것 같아요 « je trouve ça bien »), la formule est nettement plus douce que 좋아요. Ne pas abuser pour des faits évidents — si on a effectivement vu pleuvoir, on dit simplement 비가 와요. Comparaisons : -겠- (observation immédiate, « ça doit être »), -(으)ㄹ 거예요 (affirmation sur le futur), -나 보다 (inférence à partir d\'indices extérieurs) — -(으)ㄴ/는 것 같다 est la plus douce et la plus personnelle de la famille.',
      'O suavizador padrão de cortesia em coreano — "parece / acho / dá impressão". O modificador muda por tempo e categoria: verbo de ação no presente → -는 것 같다 (가는 것 같다 "parece que vai"); adjetivo / cópula no presente → -(으)ㄴ 것 같다 (추운 것 같다 "parece estar frio", 학생인 것 같다 "parece ser estudante"); passado (qualquer) → -(으)ㄴ 것 같다 com verbo (간 것 같다 "parece que foi") ou -았/었던 것 같다 para passados lembrados; futuro / suposição → -(으)ㄹ 것 같다 (비가 올 것 같다 "parece que vai chover").\n\nUsado em todo lugar como amortecedor de cortesia — coreano prefere suavizar afirmações diretas mesmo quando o falante está seguro (저는 잘 모르는 것 같아요 "acho que não sei bem" soa mais humilde que 저는 잘 몰라요). Para opiniões em 1ª pessoa sobre seus próprios sentimentos ou preferências (좋은 것 같아요 "acho que é bom"), a forma fica muito mais suave que 좋아요. Não abuse para fatos claros — se você realmente viu chover, diga 비가 와요. Compare com os vizinhos: -겠- (observação imediata, "deve estar"), -(으)ㄹ 거예요 (afirmação sobre o futuro), -나 보다 (inferência a partir de evidência externa) — -(으)ㄴ/는 것 같다 é o mais suave e pessoal da família.',
      'รูปคำพูดเชิงเลี่ยงมาตรฐานของเกาหลี — "ดูเหมือน / คิดว่า / น่าจะ". ตัวขยายเปลี่ยนตามกาลและชนิดคำ: กริยาแสดงการกระทำปัจจุบัน → -는 것 같다 (가는 것 같다 "ดูเหมือนจะไป"); คำคุณศัพท์ / กริยานุเคราะห์ปัจจุบัน → -(으)ㄴ 것 같다 (추운 것 같다 "น่าจะหนาว", 학생인 것 같다 "ดูเหมือนเป็นนักเรียน"); อดีต (ทุกรูป) → -(으)ㄴ 것 같다 จากกริยา (간 것 같다 "ดูเหมือนไปแล้ว") หรือ -았/었던 것 같다 สำหรับอดีตที่นึกถึง; อนาคต / คาดเดา → -(으)ㄹ 것 같다 (비가 올 것 같다 "ดูเหมือนฝนจะตก")\n\nใช้กันแพร่หลายเป็นการลดน้ำหนักคำพูดเชิงสุภาพ — เกาหลีนิยมพูดให้เบาลงแม้ผู้พูดมั่นใจอยู่แล้ว (저는 잘 모르는 것 같아요 "ฉันคิดว่าฉันไม่ค่อยรู้" ฟังอ่อนน้อมกว่า 저는 잘 몰라요). กับความรู้สึก/ความชอบของตนเอง บุรุษที่ 1 (좋은 것 같아요 "คิดว่าดีนะ") ฟังนุ่มกว่า 좋아요 มาก. อย่าใช้เกินกับข้อเท็จจริงชัด ๆ — ถ้าคุณเห็นฝนตกจริงก็พูด 비가 와요 พอ. เทียบกับเพื่อนบ้าน: -겠- (สังเกตตรงหน้า "น่าจะ"), -(으)ㄹ 거예요 (ยืนยันเรื่องอนาคต), -나 보다 (อนุมานจากหลักฐานภายนอก) — -(으)ㄴ/는 것 같다 อ่อนและเป็นส่วนตัวที่สุดในตระกูล',
      'Penyangga kesopanan default bahasa Korea — "sepertinya / saya pikir / kelihatannya". Pemodifikasinya berubah menurut kala dan jenis kata: verba aksi kini → -는 것 같다 (가는 것 같다 "sepertinya pergi"); adjektiva / kopula kini → -(으)ㄴ 것 같다 (추운 것 같다 "sepertinya dingin", 학생인 것 같다 "kelihatannya pelajar"); lampau (apa pun) → -(으)ㄴ 것 같다 dari verba (간 것 같다 "kelihatannya sudah pergi") atau -았/었던 것 같다 untuk lampau yang diingat; masa depan / dugaan → -(으)ㄹ 것 같다 (비가 올 것 같다 "sepertinya akan hujan").\n\nDigunakan di mana-mana sebagai pelembut kesopanan — bahasa Korea suka memperhalus pernyataan langsung meskipun penutur yakin (저는 잘 모르는 것 같아요 "saya pikir saya tidak terlalu tahu" terasa lebih rendah hati daripada 저는 잘 몰라요). Untuk pendapat orang pertama tentang perasaan atau preferensi sendiri (좋은 것 같아요 "saya pikir bagus"), bentuk ini jauh lebih lembut dari 좋아요. Jangan terlalu sering memakainya untuk fakta jelas — kalau kamu memang melihat hujan, cukup 비가 와요. Bandingkan dengan tetangga: -겠- (pengamatan langsung, "pasti"), -(으)ㄹ 거예요 (pernyataan tentang masa depan), -나 보다 (inferensi dari bukti eksternal) — -(으)ㄴ/는 것 같다 adalah yang paling lembut dan pribadi dalam keluarga.',
      'Cách giảm nhẹ chuẩn của tiếng Hàn — "có vẻ / tôi nghĩ / hình như". Định ngữ thay đổi theo thì và loại từ: động từ hành động hiện tại → -는 것 같다 (가는 것 같다 "có vẻ đang đi"); tính từ / hệ từ hiện tại → -(으)ㄴ 것 같다 (추운 것 같다 "hình như lạnh", 학생인 것 같다 "có vẻ là học sinh"); quá khứ (mọi loại) → -(으)ㄴ 것 같다 từ động từ (간 것 같다 "hình như đã đi") hoặc -았/었던 것 같다 cho quá khứ hồi tưởng; tương lai / suy đoán → -(으)ㄹ 것 같다 (비가 올 것 같다 "có vẻ trời sẽ mưa").\n\nĐược dùng khắp nơi như bộ giảm tốc lịch sự — tiếng Hàn thích làm dịu khẳng định trực tiếp dù người nói đã chắc chắn (저는 잘 모르는 것 같아요 "tôi nghĩ tôi không rõ lắm" nghe khiêm tốn hơn 저는 잘 몰라요). Với ý kiến ngôi thứ nhất về cảm xúc/sở thích bản thân (좋은 것 같아요 "tôi nghĩ là tốt"), dạng này nhẹ hơn 좋아요 nhiều. Đừng lạm dụng cho sự kiện hiển nhiên — nếu thật sự thấy trời mưa thì cứ nói 비가 와요. So với hàng xóm: -겠- (quan sát tức thời "chắc"), -(으)ㄹ 거예요 (khẳng định về tương lai), -나 보다 (suy luận từ bằng chứng bên ngoài) — -(으)ㄴ/는 것 같다 là dạng nhẹ và cá nhân nhất trong họ này.',
      '韓国語の標準的な「やわらかい推量・婉曲」表現「〜と思う／〜のようだ」。修飾語形は時制と品詞で変わる: 現在の動作動詞 → -는 것 같다(가는 것 같다「行っているようだ」); 現在の形容詞・繋辞 → -(으)ㄴ 것 같다(추운 것 같다「寒いようだ」、학생인 것 같다「学生のようだ」); 過去(動詞・形容詞) → -(으)ㄴ 것 같다 を動詞から作る(간 것 같다「行ったようだ」)、回想的な過去には -았/었던 것 같다; 未来・推量 → -(으)ㄹ 것 같다(비가 올 것 같다「雨が降りそうだ」)。\n\n丁寧さのクッションとしてあらゆる場面で使う — 韓国語は確信があっても断定を和らげるのを好む(저는 잘 모르는 것 같아요「あまりよく分からないと思います」は 저는 잘 몰라요 よりも控えめに響く)。一人称の感情や好みについて使うと(좋은 것 같아요「いいと思います」)、좋아요 よりずっと柔らかい。明白な事実に乱用しない — 雨が降っているのを実際に見ているなら 비가 와요 で十分。仲間との対比: -겠-(目前の観察「〜だろう」)、-(으)ㄹ 거예요(未来への断定)、-나 보다(外部の証拠からの推察)。-(으)ㄴ/는 것 같다 はこの一群の中で最も柔らかく個人的な推量。',
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
    usageNotes: L(
      'Expresses an inference drawn from VISIBLE / observable evidence — "apparently / by the looks of it". The 모양 part literally means "shape, appearance", so the whole pattern reads as "it has the shape of doing X". Form follows the same modifier rules as -(으)ㄴ/는 것 같다: action verb present → -는 모양이다 (자는 모양이에요 "looks like they\'re sleeping"); adjective / copula present → -(으)ㄴ 모양이다 (피곤한 모양이에요 "seems tired"); past → -(으)ㄴ 모양이다 from a verb (간 모양이에요 "looks like they went").\n\nWhat sets it apart from -(으)ㄴ/는 것 같다: -모양이다 leans HEAVILY on external, observable evidence — you saw the lights off, the empty dishes, the wet road. Without that visible cue it can sound odd. -(으)ㄴ/는 것 같다 is much more general (covers personal feeling too). Also more written / slightly formal — in everyday conversation many speakers reach for -나 보다 instead (자나 봐요 "looks like they\'re sleeping"), which carries the same "I infer from what I see" feel. Use -모양이다 when you want to sound observant and slightly thoughtful, especially in writing or measured speech.',
      'Expresa una inferencia a partir de evidencia VISIBLE / observable — "al parecer / por lo que se ve". 모양 significa literalmente "forma, apariencia", así que el patrón completo se lee como "tiene la forma de hacer X". La forma sigue las mismas reglas de modificador que -(으)ㄴ/는 것 같다: verbo de acción presente → -는 모양이다 (자는 모양이에요 "parece que duermen"); adjetivo / cópula presente → -(으)ㄴ 모양이다 (피곤한 모양이에요 "parece cansado"); pasado → -(으)ㄴ 모양이다 con verbo (간 모양이에요 "parece que se fue").\n\nLo que lo distingue de -(으)ㄴ/는 것 같다: -모양이다 se apoya MUCHO en evidencia externa, observable — viste la luz apagada, los platos vacíos, la calle mojada. Sin esa pista visible suena raro. -(으)ㄴ/는 것 같다 es mucho más general (también cubre lo que sentís). Además es más escrito / un poco formal — en conversación cotidiana muchos hablantes prefieren -나 보다 (자나 봐요 "parece que duermen"), que transmite el mismo "lo infiero de lo que veo". Usá -모양이다 cuando querés sonar observador y un poco más reflexivo, sobre todo en escritura o habla pausada.',
      'Exprime une inférence tirée d\'indices VISIBLES / observables — « apparemment / on dirait que ». 모양 signifie littéralement « forme, apparence », d\'où la lecture « cela a la forme de faire X ». La forme suit les mêmes règles de modificateur que -(으)ㄴ/는 것 같다 : verbe d\'action au présent → -는 모양이다 (자는 모양이에요 « on dirait qu\'ils dorment ») ; adjectif / copule au présent → -(으)ㄴ 모양이다 (피곤한 모양이에요 « il a l\'air fatigué ») ; passé → -(으)ㄴ 모양이다 sur un verbe (간 모양이에요 « on dirait qu\'ils sont partis »).\n\nCe qui le distingue de -(으)ㄴ/는 것 같다 : -모양이다 s\'appuie FORTEMENT sur des indices extérieurs et observables — la lumière éteinte, les assiettes vides, la chaussée mouillée. Sans ces indices, cela sonne bizarre. -(으)ㄴ/는 것 같다 est bien plus large (couvre aussi le ressenti personnel). Le -모양이다 est aussi plutôt écrit / légèrement formel — à l\'oral courant, beaucoup préfèrent -나 보다 (자나 봐요 « on dirait qu\'ils dorment »), qui rend la même idée « je déduis de ce que je vois ». Emploie -모양이다 quand tu veux paraître observateur et un peu plus réfléchi, surtout à l\'écrit ou dans une parole mesurée.',
      'Expressa uma inferência baseada em evidências VISÍVEIS / observáveis — "aparentemente / pelo jeito". 모양 significa literalmente "forma, aparência", então o padrão inteiro lê-se como "tem o jeito de fazer X". A forma segue as mesmas regras de modificador de -(으)ㄴ/는 것 같다: verbo de ação no presente → -는 모양이다 (자는 모양이에요 "pelo jeito está dormindo"); adjetivo / cópula no presente → -(으)ㄴ 모양이다 (피곤한 모양이에요 "parece cansado"); passado → -(으)ㄴ 모양이다 com verbo (간 모양이에요 "pelo jeito foi").\n\nO que o distingue de -(으)ㄴ/는 것 같다: -모양이다 se apoia FORTEMENTE em evidências externas e observáveis — você viu a luz apagada, os pratos vazios, a rua molhada. Sem essa pista visível soa estranho. -(으)ㄴ/는 것 같다 é bem mais geral (cobre sentimentos pessoais também). Também é mais escrito / um pouco formal — na conversa do dia a dia muitos falantes preferem -나 보다 (자나 봐요 "pelo jeito está dormindo"), que carrega o mesmo "deduzo pelo que vejo". Use -모양이다 quando quer soar observador e um pouco mais reflexivo, especialmente em escrita ou fala pausada.',
      'แสดงการอนุมานจากหลักฐาน "ที่มองเห็น / สังเกตได้" — "ดูท่าทาง / เห็นได้ชัดว่า". 모양 แปลตามตัวอักษรว่า "รูปร่าง / ลักษณะ" ดังนั้นรูปแบบทั้งหมดอ่านได้ว่า "มีลักษณะของการทำ X". รูปตัวขยายเหมือนกับ -(으)ㄴ/는 것 같다: กริยาแสดงการกระทำปัจจุบัน → -는 모양이다 (자는 모양이에요 "ดูเหมือนกำลังนอน"); คำคุณศัพท์ / กริยานุเคราะห์ปัจจุบัน → -(으)ㄴ 모양이다 (피곤한 모양이에요 "ดูเหนื่อย"); อดีต → -(으)ㄴ 모양이다 จากกริยา (간 모양이에요 "ดูเหมือนไปแล้ว")\n\nสิ่งที่ทำให้ต่างจาก -(으)ㄴ/는 것 같다: -모양이다 พึ่งพา "หลักฐานภายนอกที่มองเห็น" อย่างหนัก — เห็นไฟดับ จานเปล่า ถนนเปียก. ถ้าไม่มีสัญญาณที่เห็นได้จะฟังแปลก. ส่วน -(으)ㄴ/는 것 같다 ทั่วไปกว่ามาก (ครอบคลุมความรู้สึกส่วนตัวด้วย). -모양이다 ค่อนข้างเป็นทางการ/ใช้ในงานเขียน — ในการพูดประจำวันคนเกาหลีนิยม -나 보다 (자나 봐요 "ดูเหมือนกำลังนอน") ที่สื่อความว่า "ฉันอนุมานจากสิ่งที่เห็น" เหมือนกัน. ใช้ -모양이다 เมื่ออยากให้ฟังช่างสังเกตและไตร่ตรอง โดยเฉพาะในงานเขียนหรือพูดอย่างคิดทบทวน',
      'Mengungkapkan kesimpulan berdasarkan bukti yang TERLIHAT / dapat diamati — "kelihatannya / rupanya". 모양 secara harfiah berarti "bentuk, rupa", jadi pola keseluruhannya berbunyi "memiliki bentuk melakukan X". Bentuk pemodifikasi mengikuti aturan -(으)ㄴ/는 것 같다: verba aksi kini → -는 모양이다 (자는 모양이에요 "kelihatannya sedang tidur"); adjektiva / kopula kini → -(으)ㄴ 모양이다 (피곤한 모양이에요 "kelihatannya lelah"); lampau → -(으)ㄴ 모양이다 dari verba (간 모양이에요 "rupanya sudah pergi").\n\nYang membedakan dari -(으)ㄴ/는 것 같다: -모양이다 sangat bersandar pada bukti eksternal yang terlihat — kamu melihat lampu mati, piring kosong, jalan basah. Tanpa petunjuk visual itu kedengaran janggal. -(으)ㄴ/는 것 같다 jauh lebih umum (juga mencakup perasaan pribadi). -모양이다 juga lebih ke ranah tulis / agak formal — dalam percakapan sehari-hari banyak penutur memilih -나 보다 (자나 봐요 "kelihatannya tidur") yang membawa makna "saya simpulkan dari yang saya lihat" yang sama. Pakai -모양이다 saat ingin terdengar jeli dan reflektif, terutama dalam tulisan atau ujaran yang dipikirkan matang.',
      'Diễn tả suy luận từ chứng cứ THẤY ĐƯỢC / quan sát được — "có vẻ / xem chừng / hình như". 모양 nghĩa đen là "hình dáng, bề ngoài", nên cả cụm đọc thành "có vẻ ngoài của việc làm X". Hình thức định ngữ giống -(으)ㄴ/는 것 같다: động từ hành động hiện tại → -는 모양이다 (자는 모양이에요 "có vẻ đang ngủ"); tính từ / hệ từ hiện tại → -(으)ㄴ 모양이다 (피곤한 모양이에요 "trông mệt"); quá khứ → -(으)ㄴ 모양이다 từ động từ (간 모양이에요 "xem chừng đã đi").\n\nĐiểm khác với -(으)ㄴ/는 것 같다: -모양이다 DỰA NẶNG vào dấu hiệu bên ngoài quan sát được — bạn thấy đèn tắt, bát đĩa trống, đường ướt. Thiếu manh mối thị giác đó thì câu nghe gượng. -(으)ㄴ/는 것 같다 tổng quát hơn (bao cả cảm nhận cá nhân). -모양이다 cũng thiên về văn viết / hơi trang trọng — trong khẩu ngữ hằng ngày người Hàn thường chọn -나 보다 (자나 봐요 "có vẻ đang ngủ") với cùng nghĩa "tôi suy ra từ thứ nhìn thấy". Dùng -모양이다 khi muốn nghe có vẻ tinh ý và suy nghĩ thấu đáo, đặc biệt khi viết hoặc nói chậm rãi.',
      '「目に見える証拠」から推測する表現「〜らしい／〜のようだ／〜とみえる」。모양 は文字通り「形・様子」を意味するので、全体としては「Xする様子だ」と読める。修飾形のルールは -(으)ㄴ/는 것 같다 と同じ: 現在の動作動詞 → -는 모양이다(자는 모양이에요「寝ているようだ」); 現在の形容詞・繋辞 → -(으)ㄴ 모양이다(피곤한 모양이에요「疲れているようだ」、학생인 모양이에요「学生のようだ」); 過去 → -(으)ㄴ 모양이다 を動詞から作る(간 모양이에요「行ったらしい」)。\n\n-(으)ㄴ/는 것 같다 との違い: -모양이다 は「目に見える外部の証拠」に強く依存する — 電気が消えている、皿が空になっている、道路が濡れている、など。視覚的な手がかりがないと不自然に響く。-(으)ㄴ/는 것 같다 はより一般的で、個人的な感覚にも使える。-모양이다 はやや書き言葉的・改まった印象もあり、日常会話では -나 보다(자나 봐요「寝ているみたいです」)に置き換える人が多い — どちらも「見えている事柄からの推測」を担う。-모양이다 は注意深く観察し、ややじっくり述べたいときに、特に文章や落ち着いた発話で使うとはまる。',
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
    usageNotes: L(
      'Expresses obligation or necessity — "have to / must do". Form: build the -아/어 stem (same harmony rules as -아/어요) and add 야 되다 OR 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 and 하다 are completely interchangeable here — the choice is regional and personal, with 되다 slightly more conversational and 하다 slightly more formal/written.\n\nThe past form goes on 되다/하다, not the main verb: 해야 됐어요 "I had to do it" (NOT 했어야 돼요, which would mean "I should have done it"). The contraction -아/어야지 also appears as a 1st-person self-reminder ("I really should..."). The pair you must distinguish: -(으)면 되다 means "it\'s ENOUGH to do" (low bar), -아/어야 되다 means "you HAVE TO do" (required). 5천 원만 내면 돼요 "you just need to pay 5,000 won"; 5천 원을 내야 돼요 "you have to pay 5,000 won" — same money, very different attitude. For prohibition use the matching -(으)면 안 되다 "you must not".',
      'Expresa obligación o necesidad — "tener que / deber hacer". Forma: armá la raíz -아/어 (mismas reglas de armonía que -아/어요) y agregale 야 되다 O 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 y 하다 son intercambiables — la elección es regional y personal, con 되다 ligeramente más conversacional y 하다 algo más formal/escrito.\n\nEl pasado va sobre 되다/하다, no sobre el verbo principal: 해야 됐어요 "tuve que hacerlo" (NO 했어야 돼요, que significaría "debería haberlo hecho"). La contracción -아/어야지 aparece como auto-recordatorio en 1ª persona ("realmente tengo que..."). Par a distinguir: -(으)면 되다 = "ALCANZA con hacer" (techo bajo); -아/어야 되다 = "TENÉS QUE hacer" (obligatorio). 5천 원만 내면 돼요 "te alcanza con pagar 5.000 won"; 5천 원을 내야 돼요 "tenés que pagar 5.000 won" — mismo monto, actitud muy distinta. Para la prohibición usá su par -(으)면 안 되다 "no debés".',
      'Exprime l\'obligation ou la nécessité — « devoir / il faut faire ». Forme : on construit la racine -아/어 (mêmes règles d\'harmonie qu\'avec -아/어요) puis on ajoute 야 되다 OU 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 et 하다 sont parfaitement interchangeables — le choix dépend de la région et du style, 되다 étant un peu plus oral et 하다 légèrement plus formel / écrit.\n\nLe passé porte sur 되다/하다, pas sur le verbe principal : 해야 됐어요 « j\'ai dû le faire » (et non 했어야 돼요, qui voudrait dire « j\'aurais dû le faire »). La contraction -아/어야지 s\'emploie aussi comme rappel à soi-même à la 1ʳᵉ personne (« il faut vraiment que je... »). À distinguer : -(으)면 되다 = « il suffit de faire » (seuil bas), -아/어야 되다 = « il faut faire » (obligatoire). 5천 원만 내면 돼요 « il suffit de payer 5 000 wons » ; 5천 원을 내야 돼요 « il faut payer 5 000 wons » — même somme, attitude très différente. Pour l\'interdiction, le pendant est -(으)면 안 되다 « il ne faut pas ».',
      'Expressa obrigação ou necessidade — "ter que / dever fazer". Forma: monte o radical -아/어 (mesmas regras de harmonia de -아/어요) e some 야 되다 OU 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 e 하다 são intercambiáveis — a escolha é regional e pessoal, com 되다 um pouco mais conversacional e 하다 um pouco mais formal/escrito.\n\nO passado vai sobre 되다/하다, não sobre o verbo principal: 해야 됐어요 "tive que fazer" (NÃO 했어야 돼요, que significaria "deveria ter feito"). A contração -아/어야지 também aparece como autolembrete em 1ª pessoa ("realmente preciso..."). Par a distinguir: -(으)면 되다 = "BASTA fazer" (limite baixo); -아/어야 되다 = "TEM QUE fazer" (obrigatório). 5천 원만 내면 돼요 "basta pagar 5.000 won"; 5천 원을 내야 돼요 "tem que pagar 5.000 won" — mesmo valor, atitude bem diferente. Para a proibição use o par -(으)면 안 되다 "não pode".',
      'แสดงหน้าที่หรือความจำเป็น — "ต้องทำ". รูป: สร้างราก -아/어 (กฎสระเหมือน -아/어요) แล้วเติม 야 되다 หรือ 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 และ 하다 ใช้สลับกันได้ — เลือกตามท้องถิ่นและรสนิยม โดย 되다 ออกแนวพูด ส่วน 하다 ออกแนวทางการ/เขียน\n\nรูปอดีตติดที่ 되다/하다 ไม่ใช่กริยาหลัก: 해야 됐어요 "ต้องทำ" (ห้าม 했어야 돼요 ซึ่งแปลว่า "ควรจะทำ"). รูปย่อ -아/어야지 ใช้เป็นการเตือนตัวเองในบุรุษที่ 1 ("ต้อง ... จริง ๆ"). คู่ที่ต้องแยก: -(으)면 되다 = "ทำก็พอ" (เกณฑ์ต่ำ), -아/어야 되다 = "ต้องทำ" (บังคับ). 5천 원만 내면 돼요 "จ่าย 5,000 วอนก็พอ"; 5천 원을 내야 돼요 "ต้องจ่าย 5,000 วอน" — เงินเท่ากัน ทัศนคติต่างกันสุด. การห้ามใช้คู่ -(으)면 안 되다 "ห้าม / ทำไม่ได้"',
      'Mengungkapkan kewajiban atau keharusan — "harus / wajib melakukan". Bentuk: bangun akar -아/어 (aturan harmoni sama dengan -아/어요) lalu tambahkan 야 되다 ATAU 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 dan 하다 sepenuhnya bisa saling menggantikan — pilihan ini regional dan personal, dengan 되다 sedikit lebih percakapan dan 하다 sedikit lebih formal/tulis.\n\nBentuk lampau menempel pada 되다/하다, bukan verba utama: 해야 됐어요 "saya harus melakukannya" (BUKAN 했어야 돼요, yang berarti "seharusnya saya lakukan"). Kontraksi -아/어야지 juga muncul sebagai pengingat diri orang pertama ("benar-benar harus..."). Pasangan yang perlu dipisahkan: -(으)면 되다 = "CUKUP melakukan" (ambang rendah); -아/어야 되다 = "HARUS melakukan" (wajib). 5천 원만 내면 돼요 "cukup bayar 5.000 won"; 5천 원을 내야 돼요 "harus bayar 5.000 won" — jumlah sama, sikap sangat berbeda. Untuk larangan pakai pasangannya -(으)면 안 되다 "tidak boleh".',
      'Diễn tả nghĩa vụ hoặc sự cần thiết — "phải làm". Hình thức: tạo gốc -아/어 (cùng quy tắc hài hòa với -아/어요) rồi thêm 야 되다 HOẶC 야 하다 (가다 → 가야 되다 / 가야 하다, 먹다 → 먹어야 되다 / 먹어야 하다, 하다 → 해야 되다 / 해야 하다). 되다 và 하다 hoàn toàn thay thế cho nhau — lựa chọn theo vùng và sở thích, 되다 hơi thiên khẩu ngữ còn 하다 hơi trang trọng/viết.\n\nDạng quá khứ gắn vào 되다/하다, không phải động từ chính: 해야 됐어요 "tôi đã phải làm" (KHÔNG phải 했어야 돼요, vốn nghĩa "lẽ ra phải làm"). Dạng rút gọn -아/어야지 cũng dùng làm lời tự nhắc bản thân ở ngôi thứ nhất ("phải ... thật rồi"). Cặp cần phân biệt: -(으)면 되다 = "ĐỦ rồi nếu làm" (ngưỡng thấp), -아/어야 되다 = "PHẢI làm" (bắt buộc). 5천 원만 내면 돼요 "chỉ cần trả 5.000 won"; 5천 원을 내야 돼요 "phải trả 5.000 won" — cùng số tiền, thái độ rất khác. Để diễn tả cấm, dùng cặp -(으)면 안 되다 "không được".',
      '義務・必要性を表す「〜なければならない／〜なきゃ」。形: -아/어 語幹を作り(-아/어요 と同じ調和規則)、야 되다 または 야 하다 を付ける(가다 → 가야 되다 / 가야 하다、먹다 → 먹어야 되다 / 먹어야 하다、하다 → 해야 되다 / 해야 하다)。되다 と 하다 は完全に置換可能 — 地域・好みによる選択で、되다 はやや会話的、하다 はやや改まった印象。\n\n過去形は 되다/하다 に付ける(主動詞ではない): 해야 됐어요「やらなければならなかった」(했어야 돼요 は「やるべきだった」と意味が変わるので注意)。-아/어야지 と縮約すると、一人称の独り言「〜しなきゃ」の意味にもなる。区別すべきペア: -(으)면 되다 =「〜すればよい」(最低限の条件)、-아/어야 되다 =「〜しなければならない」(義務)。5천 원만 내면 돼요「5,000ウォン払えば済みます」、5천 원을 내야 돼요「5,000ウォン払わなければなりません」 — 同じ金額でも姿勢がまったく違う。禁止には対の -(으)면 안 되다「〜してはいけない」を使う。',
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
    usageNotes: L(
      'Marks "it\'s enough to / just need to / it suffices to" — frames an action as the MINIMUM that satisfies the situation. Form: vowel/ㄹ stem → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다); consonant stem → -으면 되다 (먹다 → 먹으면 되다). Built from the conditional -(으)면 + the same 되다 ("be ok / work out") used in -아/어도 되다 (permission) and -아/어야 되다 (obligation).\n\nThe "low-bar" feel is the key — you\'re reassuring the listener that no more is needed. Compare with the obligation pair: 5천 원만 내면 돼요 "you just have to pay 5,000 won (no more)" vs 5천 원을 내야 돼요 "you HAVE TO pay 5,000 won". Adding 만 to the condition sharpens the "just / only" feel (여기 사인만 하면 돼요 "you just need to sign here"). For polite instructions and casual problem-solving it\'s a workhorse — 이거 그냥 누르면 돼요 "you just press this", 늦으면 전화하면 돼요 "if you\'re late, just call". Don\'t confuse with -(으)면 안 되다, the prohibition pair that swaps the meaning to "must not".',
      'Marca "alcanza con / basta con / solo hay que" — presenta una acción como el MÍNIMO que satisface la situación. Forma: raíz en vocal/ㄹ → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다); raíz en consonante → -으면 되다 (먹다 → 먹으면 되다). Se forma con el condicional -(으)면 + el mismo 되다 ("estar bien / funcionar") de -아/어도 되다 (permiso) y -아/어야 되다 (obligación).\n\nLa sensación de "techo bajo" es lo central — le estás asegurando al oyente que con eso ya es suficiente. Comparalo con la obligación: 5천 원만 내면 돼요 "alcanza con pagar 5.000 won (no más)" vs 5천 원을 내야 돼요 "TENÉS QUE pagar 5.000 won". Sumar 만 a la condición refuerza el "solo / nada más que" (여기 사인만 하면 돼요 "solo hay que firmar acá"). Es el caballito de batalla para instrucciones educadas y resolver problemas en lo cotidiano — 이거 그냥 누르면 돼요 "solo apretás esto", 늦으면 전화하면 돼요 "si te demorás, alcanza con avisar". No lo confundas con -(으)면 안 되다, la pareja de prohibición que invierte el sentido a "no debés".',
      'Marque « il suffit de / il n\'y a qu\'à » — présente une action comme le MINIMUM qui satisfait la situation. Forme : racine en voyelle/ㄹ → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다) ; racine en consonne → -으면 되다 (먹다 → 먹으면 되다). Construit avec le conditionnel -(으)면 + le même 되다 (« être bon / fonctionner ») que -아/어도 되다 (permission) et -아/어야 되다 (obligation).\n\nLa sensation de « seuil bas » est centrale — on rassure l\'interlocuteur que cela suffit. À comparer avec l\'obligation : 5천 원만 내면 돼요 « il suffit de payer 5 000 wons (rien de plus) » vs 5천 원을 내야 돼요 « il FAUT payer 5 000 wons ». Ajouter 만 à la condition renforce le « ne... que » (여기 사인만 하면 돼요 « il n\'y a qu\'à signer ici »). C\'est le couteau suisse des consignes polies et du dépannage quotidien — 이거 그냥 누르면 돼요 « il suffit d\'appuyer sur ça », 늦으면 전화하면 돼요 « si tu es en retard, un coup de fil suffit ». À ne pas confondre avec -(으)면 안 되다, le pendant interdiction qui retourne le sens en « il ne faut pas ».',
      'Marca "basta / só precisa / é suficiente" — apresenta uma ação como o MÍNIMO que satisfaz a situação. Forma: radical em vogal/ㄹ → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다); radical em consoante → -으면 되다 (먹다 → 먹으면 되다). Formado pelo condicional -(으)면 + o mesmo 되다 ("estar bem / dar certo") de -아/어도 되다 (permissão) e -아/어야 되다 (obrigação).\n\nA sensação de "limite baixo" é o ponto-chave — você está tranquilizando o ouvinte de que isso já basta. Compare com a obrigação: 5천 원만 내면 돼요 "basta pagar 5.000 won (não mais)" vs 5천 원을 내야 돼요 "TEM QUE pagar 5.000 won". Adicionar 만 à condição reforça o "só / apenas" (여기 사인만 하면 돼요 "só precisa assinar aqui"). É o cavalo de batalha para instruções educadas e para resolver coisas no dia a dia — 이거 그냥 누르면 돼요 "é só apertar isso", 늦으면 전화하면 돼요 "se atrasar, é só ligar". Não confunda com -(으)면 안 되다, o par de proibição que inverte o sentido para "não pode".',
      'แสดงความหมาย "ทำ ... ก็พอ / แค่ทำ ... " — บอกว่าการกระทำคือ "ขั้นต่ำ" ที่ตอบโจทย์สถานการณ์. รูป: รากลงสระ/ㄹ → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다); รากลงพยัญชนะ → -으면 되다 (먹다 → 먹으면 되다). สร้างจากรูปเงื่อนไข -(으)면 + 되다 ตัวเดียวกับใน -아/어도 되다 (อนุญาต) และ -아/어야 되다 (หน้าที่)\n\nความรู้สึก "เกณฑ์ต่ำ" คือหัวใจ — เป็นการบอกผู้ฟังว่าแค่นี้ก็พอ ไม่ต้องมากกว่านี้. เทียบกับการบังคับ: 5천 원만 내면 돼요 "จ่าย 5,000 วอนก็พอ" vs 5천 원을 내야 돼요 "ต้องจ่าย 5,000 วอน". เพิ่ม 만 ในเงื่อนไขจะเน้น "แค่ / เพียง" (여기 사인만 하면 돼요 "แค่เซ็นตรงนี้ก็พอ"). เป็นรูปประจำสำหรับการแนะนำสุภาพ ๆ และแก้ปัญหาทั่วไป — 이거 그냥 누르면 돼요 "แค่กดอันนี้ก็ได้", 늦으면 전화하면 돼요 "ถ้าจะสายก็แค่โทรมา". อย่าสับสนกับ -(으)면 안 되다 รูปคู่ของการห้ามที่กลับความหมายเป็น "ทำไม่ได้"',
      'Menandai "cukup / tinggal / sudah memadai" — menyajikan aksi sebagai MINIMUM yang memenuhi situasi. Bentuk: akar vokal/ㄹ → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다); akar konsonan → -으면 되다 (먹다 → 먹으면 되다). Dibangun dari kondisional -(으)면 + 되다 yang sama dengan di -아/어도 되다 (izin) dan -아/어야 되다 (kewajiban).\n\nNuansa "ambang rendah" inilah intinya — kamu meyakinkan lawan bicara bahwa itu sudah cukup. Bandingkan dengan kewajiban: 5천 원만 내면 돼요 "cukup bayar 5.000 won" vs 5천 원을 내야 돼요 "HARUS bayar 5.000 won". Menambahkan 만 ke kondisi mempertajam rasa "hanya" (여기 사인만 하면 돼요 "tinggal tanda tangan di sini"). Andalan untuk arahan sopan dan pemecahan masalah sehari-hari — 이거 그냥 누르면 돼요 "tinggal tekan ini", 늦으면 전화하면 돼요 "kalau telat, cukup telepon". Jangan tertukar dengan -(으)면 안 되다, pasangan larangan yang membalikkan makna jadi "tidak boleh".',
      'Đánh dấu "chỉ cần / là đủ" — đặt hành động như mức TỐI THIỂU thỏa mãn tình huống. Hình thức: gốc nguyên âm/ㄹ → -면 되다 (가다 → 가면 되다, 살다 → 살면 되다); gốc phụ âm → -으면 되다 (먹다 → 먹으면 되다). Cấu tạo từ điều kiện -(으)면 + cùng 되다 trong -아/어도 되다 (cho phép) và -아/어야 되다 (nghĩa vụ).\n\nCảm giác "ngưỡng thấp" là điểm cốt lõi — bạn trấn an người nghe rằng làm vậy là đủ. So với nghĩa vụ: 5천 원만 내면 돼요 "chỉ cần trả 5.000 won" vs 5천 원을 내야 돼요 "PHẢI trả 5.000 won". Thêm 만 vào điều kiện làm rõ "chỉ" (여기 사인만 하면 돼요 "chỉ cần ký ở đây"). Là cấu trúc chủ lực cho lời hướng dẫn lịch sự và giải quyết tình huống đời thường — 이거 그냥 누르면 돼요 "chỉ cần nhấn cái này", 늦으면 전화하면 돼요 "nếu trễ, chỉ cần gọi điện". Đừng nhầm với -(으)면 안 되다, cặp cấm đoán đảo nghĩa thành "không được".',
      '「〜すればよい／〜だけでいい」を表す — その行為が状況を満たす「最低限」だと伝える。形: 母音または ㄹ 語幹 → -면 되다(가다 → 가면 되다、살다 → 살면 되다); 子音語幹 → -으면 되다(먹다 → 먹으면 되다)。条件の -(으)면 と、-아/어도 되다(許可)・-아/어야 되다(義務)に出てきたのと同じ 되다(「大丈夫だ／成り立つ」)で構成される。\n\n「最低限で十分」というニュアンスが核心 — 聞き手に「これだけでOK」と安心させる。義務との対比: 5천 원만 내면 돼요「5,000ウォン払えば済みます」、5천 원을 내야 돼요「5,000ウォン払わなければなりません」。条件に 만 を加えると「〜だけ」のニュアンスがさらに強まる(여기 사인만 하면 돼요「ここに署名するだけで結構です」)。丁寧な指示や日常のちょっとした問題解決の万能選手 — 이거 그냥 누르면 돼요「これを押すだけです」、늦으면 전화하면 돼요「遅れるなら電話くだされば大丈夫です」。禁止の対 -(으)면 안 되다(「〜してはいけない」)と混同しないこと。',
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
    usageNotes: L(
      'Marks prohibition — "must not / can\'t / it\'s not allowed". Form: vowel/ㄹ stem → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다); consonant stem → -으면 안 되다 (먹다 → 먹으면 안 되다). Literal reading: "if you do X, it\'s not OK". Built from the conditional -(으)면 + the regular negation 안 + 되다 — exactly the negative twin of -(으)면 되다.\n\nKey distinction not to mix up. -(으)면 안 되다 = "you MUST NOT" (forbidden, blocked). -지 않아도 되다 = "you don\'t HAVE to" (no obligation, you may but aren\'t required). 가면 안 돼요 closes the door; 가지 않아도 돼요 leaves it open. Use this for rules and limits (여기 주차하면 안 돼요 "can\'t park here", 사진 찍으면 안 돼요 "no photos"), and for soft warnings between friends or to children (그러면 안 돼 "you can\'t do that"). The opposite half of the obligation/prohibition pair: -아/어야 되다 ("you have to") gives the requirement; -(으)면 안 되다 enforces the limit.',
      'Marca prohibición — "no se puede / está prohibido". Forma: raíz en vocal/ㄹ → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다); raíz en consonante → -으면 안 되다 (먹다 → 먹으면 안 되다). Lectura literal: "si hacés X, no está bien". Construido con el condicional -(으)면 + la negación regular 안 + 되다 — la cara negativa exacta de -(으)면 되다.\n\nDistinción clave para no mezclar: -(으)면 안 되다 = "NO SE DEBE / no se puede" (prohibido). -지 않아도 되다 = "no HACE FALTA" (no hay obligación, podés pero no estás obligado). 가면 안 돼요 cierra la puerta; 가지 않아도 돼요 la deja abierta. Usalo para reglas y límites (여기 주차하면 안 돼요 "no podés estacionar acá", 사진 찍으면 안 돼요 "no se pueden sacar fotos"), y para advertencias suaves entre amigos o con niños (그러면 안 돼 "eso no se hace"). La otra mitad del par obligación/prohibición: -아/어야 되다 ("tenés que") da el requisito; -(으)면 안 되다 marca el límite.',
      'Marque l\'interdiction — « il ne faut pas / on ne peut pas ». Forme : racine en voyelle/ㄹ → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다) ; racine en consonne → -으면 안 되다 (먹다 → 먹으면 안 되다). Lecture littérale : « si tu fais X, ce n\'est pas bon ». Construit avec le conditionnel -(으)면 + la négation ordinaire 안 + 되다 — le pendant négatif exact de -(으)면 되다.\n\nDistinction cruciale à ne pas mélanger : -(으)면 안 되다 = « il NE FAUT PAS / on n\'a pas le droit » (interdit). -지 않아도 되다 = « il n\'y a pas besoin de » (pas d\'obligation, tu peux mais ce n\'est pas requis). 가면 안 돼요 ferme la porte ; 가지 않아도 돼요 la laisse ouverte. À employer pour les règles et les limites (여기 주차하면 안 돼요 « interdiction de stationner ici », 사진 찍으면 안 돼요 « pas de photos »), et pour des avertissements doux entre amis ou avec les enfants (그러면 안 돼 « ça ne se fait pas »). L\'autre moitié de la paire obligation / interdiction : -아/어야 되다 (« il faut ») énonce l\'exigence ; -(으)면 안 되다 fixe la limite.',
      'Marca proibição — "não pode / é proibido". Forma: radical em vogal/ㄹ → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다); radical em consoante → -으면 안 되다 (먹다 → 먹으면 안 되다). Leitura literal: "se você fizer X, não está bem". Construído pelo condicional -(으)면 + a negação regular 안 + 되다 — o gêmeo negativo exato de -(으)면 되다.\n\nDistinção crucial para não misturar: -(으)면 안 되다 = "NÃO PODE" (proibido). -지 않아도 되다 = "não PRECISA" (sem obrigação, pode mas não é exigido). 가면 안 돼요 fecha a porta; 가지 않아도 돼요 deixa em aberto. Use para regras e limites (여기 주차하면 안 돼요 "não pode estacionar aqui", 사진 찍으면 안 돼요 "não pode tirar foto"), e para avisos suaves entre amigos ou com crianças (그러면 안 돼 "não pode fazer isso"). A outra metade do par obrigação/proibição: -아/어야 되다 ("tem que") dá o requisito; -(으)면 안 되다 marca o limite.',
      'แสดงการห้าม — "ห้าม ... / ทำไม่ได้". รูป: รากลงสระ/ㄹ → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다); รากลงพยัญชนะ → -으면 안 되다 (먹다 → 먹으면 안 되다). ความหมายตามตัวอักษร: "ถ้าทำ X จะไม่ดี / ไม่โอเค". สร้างจากเงื่อนไข -(으)면 + การปฏิเสธปกติ 안 + 되다 — เป็นด้านลบที่ตรงข้ามกับ -(으)면 되다 พอดี\n\nการแยกที่ต้องชัดเจน. -(으)면 안 되다 = "ห้ามทำ" (ปิดทาง). -지 않아도 되다 = "ไม่จำเป็นต้องทำ" (ไม่บังคับ จะทำหรือไม่ก็ได้). 가면 안 돼요 ปิดประตู, 가지 않아도 돼요 เปิดทิ้งไว้. ใช้กับกฎและขีดจำกัด (여기 주차하면 안 돼요 "ห้ามจอดตรงนี้", 사진 찍으면 안 돼요 "ห้ามถ่ายรูป") และการเตือนเบา ๆ ระหว่างเพื่อนหรือกับเด็ก (그러면 안 돼 "ทำแบบนั้นไม่ได้นะ"). อีกครึ่งของคู่บังคับ/ห้าม: -아/어야 되다 ("ต้องทำ") บอกความจำเป็น; -(으)면 안 되다 บอกขีดจำกัด',
      'Menandai larangan — "tidak boleh / dilarang". Bentuk: akar vokal/ㄹ → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다); akar konsonan → -으면 안 되다 (먹다 → 먹으면 안 되다). Bacaan harfiah: "kalau kamu lakukan X, itu tidak baik". Dibangun dari kondisional -(으)면 + negasi biasa 안 + 되다 — kembar negatif tepat dari -(으)면 되다.\n\nPerbedaan krusial yang tak boleh dicampur. -(으)면 안 되다 = "TIDAK BOLEH" (dilarang). -지 않아도 되다 = "tidak PERLU" (tidak ada kewajiban, boleh tapi tidak wajib). 가면 안 돼요 menutup pintu; 가지 않아도 돼요 membiarkan terbuka. Pakai untuk aturan dan batas (여기 주차하면 안 돼요 "tidak boleh parkir di sini", 사진 찍으면 안 돼요 "tidak boleh foto"), dan untuk peringatan lembut antar teman atau ke anak-anak (그러면 안 돼 "begitu tidak boleh"). Setengah lainnya dari pasangan kewajiban/larangan: -아/어야 되다 ("harus") memberi kewajiban; -(으)면 안 되다 menetapkan batas.',
      'Đánh dấu cấm đoán — "không được / không cho phép". Hình thức: gốc nguyên âm/ㄹ → -면 안 되다 (가다 → 가면 안 되다, 살다 → 살면 안 되다); gốc phụ âm → -으면 안 되다 (먹다 → 먹으면 안 되다). Nghĩa đen: "nếu làm X thì không ổn". Cấu tạo từ điều kiện -(으)면 + phủ định thường 안 + 되다 — đối ngẫu phủ định chính xác của -(으)면 되다.\n\nPhân biệt then chốt không được trộn lẫn. -(으)면 안 되다 = "KHÔNG ĐƯỢC" (cấm). -지 않아도 되다 = "không CẦN PHẢI" (không nghĩa vụ, có thể nhưng không bắt buộc). 가면 안 돼요 đóng cửa; 가지 않아도 돼요 để ngỏ. Dùng cho quy tắc và giới hạn (여기 주차하면 안 돼요 "không được đậu xe ở đây", 사진 찍으면 안 돼요 "không được chụp ảnh"), và lời nhắc nhẹ giữa bạn bè hoặc với trẻ con (그러면 안 돼 "không được làm vậy"). Nửa còn lại của cặp nghĩa vụ/cấm đoán: -아/어야 되다 ("phải") nêu yêu cầu; -(으)면 안 되다 ấn định giới hạn.',
      '禁止を表す「〜してはいけない／ダメ」。形: 母音または ㄹ 語幹 → -면 안 되다(가다 → 가면 안 되다、살다 → 살면 안 되다); 子音語幹 → -으면 안 되다(먹다 → 먹으면 안 되다)。直訳: 「Xすると駄目だ」。条件 -(으)면 + 通常否定の 안 + 되다 で構成 — -(으)면 되다 のちょうど反対側。\n\n混同してはいけない区別。-(으)면 안 되다 =「〜してはいけない」(禁止)。-지 않아도 되다 =「〜しなくてよい」(義務がない、してもしなくてもよい)。가면 안 돼요 はドアを閉ざす、가지 않아도 돼요 は開けておく。ルールや制限を伝えるときに使う(여기 주차하면 안 돼요「ここに駐車してはいけません」、사진 찍으면 안 돼요「写真撮影禁止です」)。親しい間柄や子どもへのやわらかい注意にも使う(그러면 안 돼「そんなことしちゃダメ」)。義務／禁止のペアの片方: -아/어야 되다(「〜しなければならない」)は要件を、-(으)면 안 되다 は境界を示す。',
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
    usageNotes: L(
      'Expresses the existence — or absence — of a NEED to do something. Form: vowel/ㄹ stem → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다); consonant stem → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 is the noun "need / necessity", so the literal reading is "the need to do X exists / doesn\'t exist". The 가 particle frequently drops in speech: 갈 필요 없어요 is just as common as 갈 필요가 없어요.\n\nMore neutral and observational than the obligation pair. -아/어야 되다 / 하다 = "you HAVE to / must" (a duty laid on you); -(으)ㄹ 필요가 있다 = "there\'s a need to" (the situation calls for it). For the absence half, compare carefully: -(으)ㄹ 필요가 없다 = "no NEED to" (the situation doesn\'t demand it, often paired with reassurance — 걱정할 필요 없어요 "you needn\'t worry"); -지 않아도 되다 = "you don\'t HAVE to" (no obligation, more directly addressed to the listener). For "absolutely no need" intensify with 전혀 or 굳이: 굳이 갈 필요는 없어요 "there\'s no particular need to go".',
      'Expresa la existencia — o ausencia — de una NECESIDAD de hacer algo. Forma: raíz en vocal/ㄹ → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다); raíz en consonante → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 es el sustantivo "necesidad", así que la lectura literal es "existe / no existe la necesidad de hacer X". La partícula 가 cae mucho en el habla: 갈 필요 없어요 es tan común como 갈 필요가 없어요.\n\nMás neutro y observacional que la pareja de obligación. -아/어야 되다 / 하다 = "TENÉS que / debés" (un deber impuesto); -(으)ㄹ 필요가 있다 = "hay necesidad de" (la situación lo exige). Para la negación, distinguí con cuidado: -(으)ㄹ 필요가 없다 = "no hay NECESIDAD" (la situación no lo pide, suele tranquilizar — 걱정할 필요 없어요 "no hace falta que te preocupés"); -지 않아도 되다 = "no TENÉS por qué" (sin obligación, más directo hacia el oyente). Para "ninguna necesidad" intensificá con 전혀 o 굳이: 굳이 갈 필요는 없어요 "no hay particular necesidad de ir".',
      'Exprime l\'existence — ou l\'absence — d\'un BESOIN de faire quelque chose. Forme : racine en voyelle/ㄹ → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다) ; racine en consonne → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 est le nom « besoin / nécessité », d\'où la lecture littérale « le besoin de faire X existe / n\'existe pas ». La particule 가 disparaît souvent à l\'oral : 갈 필요 없어요 est aussi courant que 갈 필요가 없어요.\n\nPlus neutre et plus descriptif que la paire de l\'obligation. -아/어야 되다 / 하다 = « il FAUT / on doit » (un devoir imposé) ; -(으)ㄹ 필요가 있다 = « il est nécessaire de » (la situation l\'exige). Pour la négation, distinguer soigneusement : -(으)ㄹ 필요가 없다 = « il n\'y a pas BESOIN » (la situation ne l\'exige pas, souvent rassurant — 걱정할 필요 없어요 « pas besoin de t\'inquiéter ») ; -지 않아도 되다 = « tu n\'es PAS OBLIGÉ » (pas d\'obligation, plus directement adressé à l\'interlocuteur). Pour « strictement aucun besoin », intensifier avec 전혀 ou 굳이 : 굳이 갈 필요는 없어요 « ce n\'est pas la peine d\'y aller ».',
      'Expressa a existência — ou ausência — de uma NECESSIDADE de fazer algo. Forma: radical em vogal/ㄹ → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다); radical em consoante → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 é o substantivo "necessidade", então a leitura literal é "existe / não existe a necessidade de fazer X". A partícula 가 cai bastante na fala: 갈 필요 없어요 é tão comum quanto 갈 필요가 없어요.\n\nMais neutro e observacional que o par da obrigação. -아/어야 되다 / 하다 = "TEM que / deve" (dever imposto); -(으)ㄹ 필요가 있다 = "há necessidade de" (a situação exige). Para a negação, separe com cuidado: -(으)ㄹ 필요가 없다 = "não há NECESSIDADE" (a situação não exige, frequente em tranquilização — 걱정할 필요 없어요 "não precisa se preocupar"); -지 않아도 되다 = "não PRECISA" (sem obrigação, mais direto ao ouvinte). Para "nenhuma necessidade" intensifique com 전혀 ou 굳이: 굳이 갈 필요는 없어요 "não há particular necessidade de ir".',
      'แสดงการมีหรือไม่มี "ความจำเป็น" ที่จะทำบางสิ่ง. รูป: รากลงสระ/ㄹ → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다); รากลงพยัญชนะ → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 เป็นคำนามแปลว่า "ความจำเป็น" ดังนั้นความหมายตามตัวอักษรคือ "ความจำเป็นที่จะทำ X มี / ไม่มี". อนุภาค 가 หล่นได้บ่อยในการพูด: 갈 필요 없어요 พบบ่อยพอ ๆ กับ 갈 필요가 없어요\n\nเป็นกลางและบรรยายมากกว่ารูปบังคับ. -아/어야 되다 / 하다 = "ต้องทำ" (หน้าที่ที่ถูกกำหนด); -(으)ㄹ 필요가 있다 = "มีความจำเป็นต้องทำ" (สถานการณ์ต้องการ). สำหรับด้านปฏิเสธ ต้องแยกให้ระวัง: -(으)ㄹ 필요가 없다 = "ไม่มีความจำเป็น" (สถานการณ์ไม่ต้องการ มักใช้ปลอบใจ — 걱정할 필요 없어요 "ไม่ต้องห่วงเลย"); -지 않아도 되다 = "ไม่จำเป็นต้อง" (ไม่บังคับ ตรงไปที่ผู้ฟังกว่า). ถ้าจะเน้น "ไม่จำเป็นเลย" เติม 전혀 หรือ 굳이: 굳이 갈 필요는 없어요 "ไม่ได้จำเป็นต้องไปขนาดนั้น"',
      'Mengungkapkan ada atau tidak ada KEBUTUHAN untuk melakukan sesuatu. Bentuk: akar vokal/ㄹ → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다); akar konsonan → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 adalah kata benda "kebutuhan / keperluan", jadi bacaan harfiahnya "kebutuhan melakukan X ada / tidak ada". Partikel 가 sering lepas saat bicara: 갈 필요 없어요 sama umumnya dengan 갈 필요가 없어요.\n\nLebih netral dan deskriptif dibanding pasangan kewajiban. -아/어야 되다 / 하다 = "HARUS" (tugas yang dipikulkan); -(으)ㄹ 필요가 있다 = "perlu" (situasi menuntutnya). Untuk sisi negasi, bedakan dengan cermat: -(으)ㄹ 필요가 없다 = "tidak PERLU" (situasi tidak menuntut, sering untuk menenangkan — 걱정할 필요 없어요 "tidak perlu khawatir"); -지 않아도 되다 = "tidak HARUS" (tidak ada kewajiban, lebih langsung ke lawan bicara). Untuk "sama sekali tidak perlu" intensifkan dengan 전혀 atau 굳이: 굳이 갈 필요는 없어요 "tidak perlu sampai pergi".',
      'Diễn tả sự có hay không có NHU CẦU làm việc gì. Hình thức: gốc nguyên âm/ㄹ → -ㄹ 필요가 있다/없다 (가다 → 갈 필요가 있다, 살다 → 살 필요가 있다); gốc phụ âm → -을 필요가 있다/없다 (먹다 → 먹을 필요가 있다). 필요 là danh từ "nhu cầu / sự cần thiết", nên nghĩa đen là "nhu cầu làm X có / không có". Tiểu từ 가 thường rụng trong khẩu ngữ: 갈 필요 없어요 phổ biến không kém 갈 필요가 없어요.\n\nTrung tính và mang tính quan sát hơn cặp nghĩa vụ. -아/어야 되다 / 하다 = "PHẢI" (nghĩa vụ áp lên); -(으)ㄹ 필요가 있다 = "cần phải" (tình huống đòi hỏi). Với mặt phủ định, phân biệt cẩn thận: -(으)ㄹ 필요가 없다 = "không CẦN" (tình huống không đòi hỏi, hay dùng để trấn an — 걱정할 필요 없어요 "không cần lo"); -지 않아도 되다 = "không CẦN PHẢI" (không nghĩa vụ, hướng trực tiếp tới người nghe hơn). Để nhấn "hoàn toàn không cần" thì thêm 전혀 hoặc 굳이: 굳이 갈 필요는 없어요 "không cần thiết phải đi đến mức đó".',
      '何かを行う「必要」がある／ない、を表す。形: 母音または ㄹ 語幹 → -ㄹ 필요가 있다/없다(가다 → 갈 필요가 있다、살다 → 살 필요가 있다); 子音語幹 → -을 필요가 있다/없다(먹다 → 먹을 필요가 있다)。필요 は名詞「必要」なので、直訳は「Xする必要がある／ない」。会話では 가 が落ちることが多い: 갈 필요 없어요 は 갈 필요가 없어요 と同じくらい使われる。\n\n義務のペアより中立的・客観的。-아/어야 되다 / 하다 =「〜しなければならない」(課された義務); -(으)ㄹ 필요가 있다 =「〜する必要がある」(状況がそれを要求する)。否定側は丁寧に区別: -(으)ㄹ 필요가 없다 =「必要がない」(状況がそれを要求しない、相手を安心させる用法が多い — 걱정할 필요 없어요「心配は要りませんよ」); -지 않아도 되다 =「〜しなくてもよい」(義務がない、相手に直接呼びかける感じ)。「まったく必要ない／別に必要ない」と強めるなら 전혀 や 굳이 を添える: 굳이 갈 필요는 없어요「わざわざ行く必要はありません」。',
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
    usageNotes: L(
      'Expresses a 1st-person commitment made AT THAT MOMENT — "I\'ll do it / I promise". Form: vowel/ㄹ stem → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요); consonant stem → -을게요 (먹다 → 먹을게요). Strictly limited to 1st person (I / we) — using it with another subject is ungrammatical.\n\nThe key flavor is "I commit, with you in mind". -(으)ㄹ게요 announces a fresh decision and ties the speaker to the listener — 제가 살게요 "I\'ll pay (for you)", 먼저 갈게요 "I\'ll head out first (telling you so you know)". Compare neighbors carefully. -(으)ㄹ 거예요 is neutral future ("I will go" — a forecast about yourself). -겠- is sharper / firmer ("I will definitely do it", more formal). -(으)ㄹ래요 expresses preference ("I want to / I\'d rather"). Pre-planned actions sound natural with -(으)ㄹ 거예요; -(으)ㄹ게요 is reserved for what you decide ON THE SPOT, addressed to your listener. Casual contraction drops 요: -(으)ㄹ게 between close friends.',
      'Expresa un compromiso en 1ª persona tomado EN EL MOMENTO — "yo lo hago / te prometo". Forma: raíz en vocal/ㄹ → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요); raíz en consonante → -을게요 (먹다 → 먹을게요). Estrictamente limitado a 1ª persona (yo / nosotros) — usarlo con otro sujeto es agramatical.\n\nEl sabor central es "me comprometo, pensando en vos". -(으)ㄹ게요 anuncia una decisión fresca y ata al hablante con el oyente — 제가 살게요 "yo pago", 먼저 갈게요 "me adelanto (te aviso)". Compará con sus vecinos: -(으)ㄹ 거예요 es futuro neutro ("voy a ir" — un pronóstico sobre vos mismo). -겠- es más cortante / firme ("lo haré sin falta", más formal). -(으)ㄹ래요 marca preferencia ("quiero / prefiero"). Las acciones ya planeadas se sienten mejor con -(으)ㄹ 거예요; -(으)ㄹ게요 se reserva para lo que decidís EN EL MOMENTO, dirigido al oyente. La contracción casual cae el 요: -(으)ㄹ게 entre amigos cercanos.',
      'Exprime un engagement à la 1ʳᵉ personne pris SUR LE MOMENT — « je vais le faire / je te le promets ». Forme : racine en voyelle/ㄹ → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요) ; racine en consonne → -을게요 (먹다 → 먹을게요). Strictement limité à la 1ʳᵉ personne (je / nous) — l\'utiliser avec un autre sujet est agrammatical.\n\nLa nuance clé est « je m\'engage, en pensant à toi ». -(으)ㄹ게요 annonce une décision fraîche et lie le locuteur à l\'interlocuteur — 제가 살게요 « je paie », 먼저 갈게요 « je pars devant (je te préviens) ». À comparer avec les voisins : -(으)ㄹ 거예요 est un futur neutre (« je vais y aller » — prévision sur soi-même). -겠- est plus tranchant / ferme (« je le ferai assurément », plus formel). -(으)ㄹ래요 marque la préférence (« je veux / je préfère »). Les actions déjà planifiées vont naturellement avec -(으)ㄹ 거예요 ; -(으)ㄹ게요 est réservé à ce qu\'on décide SUR L\'INSTANT, en s\'adressant à l\'interlocuteur. La contraction familière laisse tomber le 요 : -(으)ㄹ게 entre amis proches.',
      'Expressa um compromisso em 1ª pessoa tomado NO MOMENTO — "eu faço / te prometo". Forma: radical em vogal/ㄹ → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요); radical em consoante → -을게요 (먹다 → 먹을게요). Estritamente limitado a 1ª pessoa (eu / nós) — usar com outro sujeito é agramatical.\n\nO tom principal é "eu me comprometo, pensando em você". -(으)ㄹ게요 anuncia uma decisão fresca e amarra o falante ao ouvinte — 제가 살게요 "eu pago", 먼저 갈게요 "vou indo (te aviso)". Compare com os vizinhos: -(으)ㄹ 거예요 é futuro neutro ("vou ir" — previsão sobre você mesmo). -겠- é mais cortante / firme ("vou fazer com certeza", mais formal). -(으)ㄹ래요 marca preferência ("quero / prefiro"). Ações já planejadas pedem -(으)ㄹ 거예요; -(으)ㄹ게요 fica para o que você decide NA HORA, dirigido ao ouvinte. A contração casual cai o 요: -(으)ㄹ게 entre amigos próximos.',
      'แสดงคำมั่นในบุรุษที่ 1 ที่ตัดสินใจ "ในขณะนั้น" — "ผม/ฉันจะทำนะ / สัญญานะ". รูป: รากลงสระ/ㄹ → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요); รากลงพยัญชนะ → -을게요 (먹다 → 먹을게요). จำกัด "เฉพาะ" บุรุษที่ 1 (ผม/ฉัน/พวกเรา) — ใช้กับประธานอื่นไม่ถูกต้องตามไวยากรณ์\n\nรสชาติหลักคือ "ฉันคำมั่น โดยคิดถึงคุณ". -(으)ㄹ게요 ประกาศการตัดสินใจสด ๆ และผูกผู้พูดกับผู้ฟัง — 제가 살게요 "ผมจ่ายเอง", 먼저 갈게요 "ผมไปก่อนนะครับ (บอกให้รู้)". เทียบเพื่อนบ้านให้ชัด: -(으)ㄹ 거예요 อนาคตเป็นกลาง ("ฉันจะไป" — เป็นการพยากรณ์เกี่ยวกับตัวเอง). -겠- ห้วนและเด็ดขาดกว่า ("ผมจะทำแน่นอน" ทางการ). -(으)ㄹ래요 บอกความชอบ ("อยาก / ขอ"). การกระทำที่วางแผนไว้ก่อนแล้วใช้ -(으)ㄹ 거예요 ฟังเป็นธรรมชาติกว่า; -(으)ㄹ게요 สงวนไว้สำหรับการตัดสินใจ "ตอนนี้เลย" ที่พูดถึงผู้ฟัง. รูปกันเองตัด 요: -(으)ㄹ게 ใช้ระหว่างเพื่อนสนิท',
      'Mengungkapkan komitmen orang pertama yang diambil PADA SAAT ITU — "saya akan lakukan / saya janji". Bentuk: akar vokal/ㄹ → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요); akar konsonan → -을게요 (먹다 → 먹을게요). Sangat dibatasi pada orang pertama (saya / kami) — pakai dengan subjek lain tidak gramatikal.\n\nNuansa kuncinya: "saya berjanji, sambil mengingat kamu". -(으)ㄹ게요 mengumumkan keputusan segar dan mengikat penutur ke lawan bicara — 제가 살게요 "saya yang bayar", 먼저 갈게요 "saya pulang duluan (saya kabari)". Bandingkan dengan tetangga: -(으)ㄹ 거예요 masa depan netral ("saya akan pergi" — perkiraan tentang diri sendiri). -겠- lebih tegas / formal ("saya pasti lakukan"). -(으)ㄹ래요 menandakan preferensi ("saya mau"). Aksi yang sudah direncanakan terasa lebih natural dengan -(으)ㄹ 거예요; -(으)ㄹ게요 disimpan untuk keputusan SAAT ITU yang ditujukan ke lawan bicara. Kontraksi santai melepas 요: -(으)ㄹ게 antar teman dekat.',
      'Diễn tả cam kết ngôi thứ nhất được đưa ra NGAY LÚC ĐÓ — "tôi sẽ làm / tôi hứa". Hình thức: gốc nguyên âm/ㄹ → -ㄹ게요 (가다 → 갈게요, 살다 → 살게요); gốc phụ âm → -을게요 (먹다 → 먹을게요). Giới hạn nghiêm ngặt ở ngôi 1 (tôi / chúng tôi) — dùng với chủ ngữ khác là sai ngữ pháp.\n\nSắc thái cốt lõi là "tôi cam kết, nhớ đến bạn". -(으)ㄹ게요 thông báo một quyết định vừa hình thành và gắn người nói với người nghe — 제가 살게요 "tôi mời", 먼저 갈게요 "tôi đi trước nhé (báo bạn biết)". So với hàng xóm: -(으)ㄹ 거예요 là tương lai trung tính ("tôi sẽ đi" — dự báo về bản thân). -겠- sắc bén/dứt khoát hơn ("tôi nhất định sẽ làm", trang trọng). -(으)ㄹ래요 đánh dấu sở thích ("tôi muốn / tôi thích"). Hành động đã lên kế hoạch hợp với -(으)ㄹ 거예요; -(으)ㄹ게요 dành cho quyết định ngay tại chỗ, nói với người nghe. Dạng thân mật bỏ 요: -(으)ㄹ게 giữa bạn thân.',
      'その場で「決めた」一人称の意志・約束を表す「〜しますね／〜しますから」。形: 母音または ㄹ 語幹 → -ㄹ게요(가다 → 갈게요、살다 → 살게요); 子音語幹 → -을게요(먹다 → 먹을게요)。一人称(私／私たち)に厳密に限定 — 他の主語では非文。\n\n核は「あなたを念頭に置いた約束・宣言」。-(으)ㄹ게요 はその場の決定を聞き手に向けて伝える — 제가 살게요「私が払いますね」、먼저 갈게요「お先に失礼します(と知らせる)」。仲間との対比: -(으)ㄹ 거예요 は中立的な未来(「行きます」— 自分についての予報)。-겠- は鋭く改まった意志(「必ずします」、フォーマル)。-(으)ㄹ래요 は好み(「〜したい／〜します」)。事前に決めた予定には -(으)ㄹ 거예요 のほうが自然、-(으)ㄹ게요 は「いま決めた」ことを聞き手に伝える専用。カジュアル形は 요 を落として -(으)ㄹ게(친구同士)。',
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
    usageNotes: L(
      'Two faces sharing one form. (1) Proposal: "shall we ~? / how about ~?" — invites the listener\'s opinion before deciding (같이 점심을 먹을까요? "shall we have lunch together?"). (2) Wondering / self-question: "I wonder if ~ / could it be ~?" — voiced thought aloud (비가 올까요? "I wonder if it\'ll rain?"). Form: vowel/ㄹ stem → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?); consonant stem → -을까요? (먹다 → 먹을까요?). With past stems it switches to wondering only: -았/었을까요? (어제 왔을까요? "I wonder if they came yesterday").\n\nCompared to its close neighbors: -(으)ㄹ래요? offers an option (your preference, "do you want to?"); -(으)ㄹ까요? asks for your opinion or judgment ("what do you think? / shall we?"). 같이 갈래요? feels like "want to come?", 같이 갈까요? feels like "shall we go?". For pure future without consultation use -(으)ㄹ 거예요. To answer your own 같이 ...ㄹ까요?, the natural reply chain is -아/어요 ("sounds good") or 좋아요 ("yes, let\'s"); if you actually decide to go, finish with -(으)ㄹ게요. With adjectives/conditions it stays in the wondering sense: 추울까요? "I wonder if it\'ll be cold?".',
      'Una sola forma con dos caras. (1) Propuesta: "¿hacemos…? / ¿qué te parece si…?" — pide la opinión del oyente antes de decidir (같이 점심을 먹을까요? "¿almorzamos juntos?"). (2) Duda interior / pregunta a uno mismo: "¿será que…? / me pregunto si…" — pensamiento en voz alta (비가 올까요? "¿será que llueve?"). Forma: raíz en vocal/ㄹ → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?); raíz en consonante → -을까요? (먹다 → 먹을까요?). Con pasado pasa al sentido de duda: -았/었을까요? (어제 왔을까요? "¿habrá venido ayer?").\n\nComparado con sus vecinos cercanos: -(으)ㄹ래요? ofrece una opción (tu preferencia, "¿querés?"); -(으)ㄹ까요? pide tu opinión o juicio ("¿qué te parece? / ¿hacemos?"). 같이 갈래요? suena a "¿querés venir?", 같이 갈까요? suena a "¿vamos juntos?". Para futuro neutro sin consulta usá -(으)ㄹ 거예요. Para responder al propio 같이 …ㄹ까요? la cadena natural es -아/어요 ("dale") o 좋아요 ("sí, vamos"); si efectivamente decidís ir, cerrá con -(으)ㄹ게요. Con adjetivos/condiciones mantiene el sentido de duda: 추울까요? "¿hará frío?".',
      'Une seule forme à deux visages. (1) Proposition : « on ...? / et si on ...? » — sollicite l\'avis de l\'interlocuteur avant de décider (같이 점심을 먹을까요? « on déjeune ensemble ? »). (2) Question intérieure : « je me demande si... » — pensée à voix haute (비가 올까요? « je me demande s\'il va pleuvoir »). Forme : racine en voyelle/ㄹ → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?) ; racine en consonne → -을까요? (먹다 → 먹을까요?). Avec un radical passé, on bascule vers la valeur d\'interrogation seulement : -았/었을까요? (어제 왔을까요? « je me demande s\'il est venu hier »).\n\nÀ comparer avec ses voisins : -(으)ㄹ래요? propose une option (préférence, « tu veux ? ») ; -(으)ㄹ까요? sollicite ton avis ou ton jugement (« qu\'en dis-tu ? / on ...? »). 같이 갈래요? signifie « tu veux y aller ? », 같이 갈까요? « on y va ? ». Pour un simple futur sans consultation, employer -(으)ㄹ 거예요. Pour répondre à son propre 같이 …ㄹ까요?, la chaîne naturelle est -아/어요 (« d\'accord ») ou 좋아요 (« oui, allons-y ») ; si tu prends effectivement l\'engagement, clôture avec -(으)ㄹ게요. Avec adjectifs / conditions, le sens reste celui de l\'interrogation : 추울까요? « je me demande s\'il fera froid ».',
      'Uma forma com dois rostos. (1) Proposta: "vamos ~? / que tal ~?" — pede a opinião do ouvinte antes de decidir (같이 점심을 먹을까요? "vamos almoçar juntos?"). (2) Indagação interna: "será que ~? / me pergunto se ~" — pensamento em voz alta (비가 올까요? "será que vai chover?"). Forma: radical em vogal/ㄹ → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?); radical em consoante → -을까요? (먹다 → 먹을까요?). Com passado, fica só no sentido de indagação: -았/었을까요? (어제 왔을까요? "será que veio ontem?").\n\nComparado com os vizinhos próximos: -(으)ㄹ래요? oferece uma opção (sua preferência, "quer?"); -(으)ㄹ까요? pede sua opinião ou julgamento ("o que acha? / vamos?"). 같이 갈래요? soa "quer ir?", 같이 갈까요? soa "vamos juntos?". Para futuro puro sem consulta use -(으)ㄹ 거예요. Para responder ao próprio 같이 ...ㄹ까요? a cadeia natural é -아/어요 ("vamos") ou 좋아요 ("sim, vamos"); se realmente decidir ir, feche com -(으)ㄹ게요. Com adjetivos / condições, mantém o sentido de indagação: 추울까요? "será que estará frio?".',
      'รูปเดียวมีสองหน้า. (1) ข้อเสนอ: "...กันไหม? / ลอง ...ดีไหม?" — ขอความเห็นผู้ฟังก่อนตัดสินใจ (같이 점심을 먹을까요? "ทานข้าวเที่ยงด้วยกันไหม?"). (2) คำถามในใจ/พูดกับตัวเอง: "สงสัยว่า ... / ไม่รู้ว่า ..." — คิดออกมาดัง ๆ (비가 올까요? "สงสัยฝนจะตกไหม?"). รูป: รากลงสระ/ㄹ → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?); รากลงพยัญชนะ → -을까요? (먹다 → 먹을까요?). กับรากอดีตจะเหลือแต่ความหมายคำถามในใจ: -았/었을까요? (어제 왔을까요? "สงสัยว่ามาเมื่อวานหรือเปล่า?")\n\nเทียบเพื่อนบ้าน: -(으)ㄹ래요? เสนอตัวเลือก (ความชอบของผู้ฟัง "อยาก ... ไหม?"); -(으)ㄹ까요? ขอความเห็น/วิจารณญาณ ("ลองยังไง? / ไปกันไหม?"). 같이 갈래요? = "อยากไปด้วยกันไหม?", 같이 갈까요? = "ไปด้วยกันไหม?". อนาคตเป็นกลางที่ไม่ปรึกษาใช้ -(으)ㄹ 거예요. ตอบ 같이 ... ㄹ까요? ของคนอื่นด้วย -아/어요 ("เอาสิ") หรือ 좋아요 ("ดี ไปเถอะ"); ถ้าตัดสินใจไปจริงปิดด้วย -(으)ㄹ게요. กับคำคุณศัพท์/เงื่อนไข ความหมายอยู่ที่คำถามในใจ: 추울까요? "สงสัยว่าจะหนาวไหม?"',
      'Satu bentuk dengan dua wajah. (1) Ajakan: "yuk ~? / bagaimana kalau ~?" — minta pendapat lawan bicara sebelum memutuskan (같이 점심을 먹을까요? "makan siang bareng yuk?"). (2) Renungan diri: "kira-kira ~? / apakah ~?" — pikiran bersuara (비가 올까요? "kira-kira hujan tidak ya?"). Bentuk: akar vokal/ㄹ → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?); akar konsonan → -을까요? (먹다 → 먹을까요?). Dengan akar lampau hanya tersisa makna renungan: -았/었을까요? (어제 왔을까요? "kira-kira dia datang kemarin tidak ya?").\n\nDibanding tetangganya: -(으)ㄹ래요? menawarkan pilihan (preferensi lawan bicara, "mau?"); -(으)ㄹ까요? meminta pendapat / pertimbangan ("bagaimana? / yuk?"). 같이 갈래요? = "mau ikut?", 같이 갈까요? = "kita pergi yuk?". Untuk masa depan netral tanpa konsultasi pakai -(으)ㄹ 거예요. Untuk merespons 같이 ...ㄹ까요? sendiri, rantai alaminya -아/어요 ("oke") atau 좋아요 ("baik, yuk"); kalau memang memutuskan ikut, tutup dengan -(으)ㄹ게요. Dengan adjektiva / kondisi, maknanya bertahan sebagai renungan: 추울까요? "kira-kira dingin tidak ya?".',
      'Một dạng có hai bộ mặt. (1) Đề nghị: "mình ~ nhé? / hay là ~?" — hỏi ý kiến người nghe trước khi quyết (같이 점심을 먹을까요? "mình ăn trưa cùng nhau nhé?"). (2) Tự hỏi: "liệu ~ chăng? / không biết ~ có không?" — suy nghĩ thành lời (비가 올까요? "liệu trời có mưa không?"). Hình thức: gốc nguyên âm/ㄹ → -ㄹ까요? (가다 → 갈까요?, 살다 → 살까요?); gốc phụ âm → -을까요? (먹다 → 먹을까요?). Với gốc quá khứ chỉ còn nghĩa tự hỏi: -았/었을까요? (어제 왔을까요? "không biết hôm qua anh ấy có đến không?").\n\nSo với hàng xóm: -(으)ㄹ래요? mời chọn (sở thích người nghe, "có muốn không?"); -(으)ㄹ까요? hỏi ý kiến / phán đoán ("bạn thấy sao? / mình làm nhé?"). 같이 갈래요? = "bạn muốn đi không?", 같이 갈까요? = "mình đi cùng nhau nhé?". Tương lai trung tính không tham khảo dùng -(으)ㄹ 거예요. Để đáp lại chính 같이 ...ㄹ까요?, chuỗi tự nhiên là -아/어요 ("được") hoặc 좋아요 ("ừ, đi thôi"); nếu thực sự đi, chốt bằng -(으)ㄹ게요. Với tính từ / điều kiện, ý nghĩa giữ ở mức tự hỏi: 추울까요? "liệu có lạnh không nhỉ?".',
      '一つの形に二つの顔がある。(1) 提案: 「〜ましょうか／〜しませんか」 — 聞き手の意見を伺ってから決める(같이 점심을 먹을까요?「一緒に昼ご飯を食べませんか?」)。(2) 自問・推量: 「〜でしょうか／〜かな」 — 声に出した思考(비가 올까요?「雨が降るかな?」)。形: 母音または ㄹ 語幹 → -ㄹ까요?(가다 → 갈까요?、살다 → 살까요?); 子音語幹 → -을까요?(먹다 → 먹을까요?)。過去語幹と組むと自問の意味のみ残る: -았/었을까요?(어제 왔을까요?「昨日来たかな?」)。\n\n仲間との対比: -(으)ㄹ래요? は選択肢の提示(相手の好み「〜したいですか?」)、-(으)ㄹ까요? は意見・判断を求める(「どうしましょう?／〜ましょうか?」)。같이 갈래요? は「一緒に行く?」、같이 갈까요? は「一緒に行きましょうか?」。相談なしの中立的な未来は -(으)ㄹ 거예요。같이 …ㄹ까요? に答えるときは -아/어요(「いいですよ」)や 좋아요(「行きましょう」)が自然な返し、行くと決めたら -(으)ㄹ게요 で締める。形容詞や状況では自問の意味のまま: 추울까요?「寒いでしょうか?」。',
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
    usageNotes: L(
      'Marks the speaker\'s intention or purpose — "in order to / with the intention of". Form: vowel/ㄹ stem → -려고 (가다 → 가려고, 살다 → 살려고, ㄹ kept); consonant stem → -으려고 (먹다 → 먹으려고). Two strict rules: the SAME subject must do both clauses (you can\'t use -려고 if the two actions have different agents), and the second clause CANNOT be an imperative or suggestion (no commands, no "let\'s") — only declaratives, questions, or descriptions.\n\nCompared with the TOPIK 1 -(으)러 가다/오다 ("go/come to do"): -(으)러 attaches only motion verbs (가다, 오다, 다니다); -(으)려고 takes ANY verb (-려고 책을 샀어요 "I bought a book in order to..."). Compared with -기 위해서 ("in order to"): -기 위해서 is more formal/written, -(으)려고 is conversational and slightly more about the agent\'s mindset / intention. -(으)려고 하다 with 하다 makes a separate "be about to / intend to" pattern (출발하려고 해요 "I\'m about to leave"). To turn it into a noun-modifier intent ("an effort to do X") use -(으)려는 (살려는 노력 "the effort to live").',
      'Marca la intención o propósito del hablante — "con la intención de / para". Forma: raíz en vocal/ㄹ → -려고 (가다 → 가려고, 살다 → 살려고, ㄹ se mantiene); raíz en consonante → -으려고 (먹다 → 먹으려고). Dos reglas estrictas: el MISMO sujeto debe hacer las dos cláusulas (no podés usar -려고 si las dos acciones las hacen agentes distintos), y la segunda cláusula NO PUEDE ser imperativo ni sugerencia (sin órdenes, sin "vamos") — solo declarativas, preguntas o descripciones.\n\nComparado con el -(으)러 가다/오다 de TOPIK 1 ("ir/venir a hacer"): -(으)러 solo va con verbos de movimiento (가다, 오다, 다니다); -(으)려고 acepta CUALQUIER verbo (-려고 책을 샀어요 "compré un libro para..."). Comparado con -기 위해서 ("a fin de"): -기 위해서 es más formal/escrito, -(으)려고 es conversacional y se centra un poco más en la intención del agente. -(으)려고 하다 con 하다 arma otro patrón aparte de "estar por / tener intención de" (출발하려고 해요 "estoy por salir"). Para hacer modificador de sustantivo ("un esfuerzo por hacer X") usá -(으)려는 (살려는 노력 "el esfuerzo por vivir").',
      'Marque l\'intention ou le but du locuteur — « avec l\'intention de / pour ». Forme : racine en voyelle/ㄹ → -려고 (가다 → 가려고, 살다 → 살려고, ㄹ conservé) ; racine en consonne → -으려고 (먹다 → 먹으려고). Deux règles strictes : le MÊME sujet doit accomplir les deux propositions (impossible si les actions ont des agents différents), et la seconde proposition NE PEUT PAS être un impératif ou une suggestion (pas d\'ordres, pas de « allons-y ») — seulement déclaratives, questions ou descriptions.\n\nÀ comparer avec -(으)러 가다/오다 du TOPIK 1 (« aller / venir faire ») : -(으)러 ne se combine qu\'avec des verbes de mouvement (가다, 오다, 다니다) ; -(으)려고 accepte N\'IMPORTE QUEL verbe (-려고 책을 샀어요 « j\'ai acheté un livre pour... »). À comparer avec -기 위해서 (« afin de ») : -기 위해서 est plus formel / écrit, -(으)려고 est conversationnel et insiste un peu plus sur l\'intention de l\'agent. -(으)려고 하다 (avec 하다) constitue un autre motif « être sur le point de / avoir l\'intention de » (출발하려고 해요 « je suis sur le point de partir »). Pour en faire un modificateur de nom (« un effort pour faire X »), employer -(으)려는 (살려는 노력 « l\'effort pour vivre »).',
      'Marca a intenção ou propósito do falante — "com a intenção de / para". Forma: radical em vogal/ㄹ → -려고 (가다 → 가려고, 살다 → 살려고, ㄹ mantido); radical em consoante → -으려고 (먹다 → 먹으려고). Duas regras rígidas: o MESMO sujeito tem que fazer as duas orações (não dá pra usar -려고 se as duas ações têm agentes diferentes), e a segunda oração NÃO PODE ser imperativo nem sugestão (sem ordens, sem "vamos") — só declarativas, perguntas ou descrições.\n\nComparado com -(으)러 가다/오다 do TOPIK 1 ("ir/vir fazer"): -(으)러 só vai com verbos de movimento (가다, 오다, 다니다); -(으)려고 aceita QUALQUER verbo (-려고 책을 샀어요 "comprei um livro para..."). Comparado com -기 위해서 ("a fim de"): -기 위해서 é mais formal/escrito, -(으)려고 é conversacional e foca um pouco mais na intenção do agente. -(으)려고 하다 com 하다 forma outro padrão "estar prestes a / ter a intenção de" (출발하려고 해요 "estou prestes a sair"). Para virar modificador de substantivo ("um esforço para fazer X") use -(으)려는 (살려는 노력 "o esforço para viver").',
      'แสดงเจตนาหรือจุดประสงค์ของผู้พูด — "ตั้งใจจะ / เพื่อ". รูป: รากลงสระ/ㄹ → -려고 (가다 → 가려고, 살다 → 살려고 ㄹ คงไว้); รากลงพยัญชนะ → -으려고 (먹다 → 먹으려고). กฎเข้มสองข้อ: ทั้งสองประโยคต้องมี "ผู้กระทำคนเดียวกัน" (ห้ามใช้ -려고 ถ้าสองการกระทำมีคนทำต่างกัน) และประโยคที่สอง "ห้าม" เป็นคำสั่งหรือชวน (ไม่มีออกคำสั่ง ไม่มี "ไปกันเถอะ") — มีได้แต่บอกเล่า ถาม หรือพรรณนา\n\nเทียบกับ -(으)러 가다/오다 จาก TOPIK 1 ("ไป/มาเพื่อทำ"): -(으)러 ใช้ได้กับกริยาเคลื่อนที่เท่านั้น (가다, 오다, 다니다); -(으)려고 ใช้กับกริยาอะไรก็ได้ (-려고 책을 샀어요 "ซื้อหนังสือเพื่อจะ..."). เทียบกับ -기 위해서 ("เพื่อที่จะ"): -기 위해서 ทางการ/งานเขียนกว่า, -(으)려고 เป็นกันเองและเน้นเจตนาของผู้กระทำมากกว่านิดหน่อย. -(으)려고 하다 บวก 하다 จะกลายเป็นรูป "กำลังจะ / ตั้งใจจะ" คนละแบบ (출발하려고 해요 "กำลังจะออก"). หากต้องการเป็นตัวขยายคำนาม ("ความพยายามที่จะทำ X") ใช้ -(으)려는 (살려는 노력 "ความพยายามจะมีชีวิตอยู่")',
      'Menandai niat atau tujuan penutur — "berniat untuk / supaya". Bentuk: akar vokal/ㄹ → -려고 (가다 → 가려고, 살다 → 살려고 dengan ㄹ tetap); akar konsonan → -으려고 (먹다 → 먹으려고). Dua aturan ketat: SUBJEK SAMA harus mengerjakan kedua klausa (tidak bisa pakai -려고 kalau dua aksi punya pelaku berbeda), dan klausa kedua TIDAK BOLEH berupa imperatif atau ajakan (tanpa perintah, tanpa "yuk") — hanya pernyataan, pertanyaan, atau deskripsi.\n\nDibanding -(으)러 가다/오다 dari TOPIK 1 ("pergi/datang untuk"): -(으)러 hanya menempel di verba gerak (가다, 오다, 다니다); -(으)려고 menerima verba APA SAJA (-려고 책을 샀어요 "saya beli buku untuk..."). Dibanding -기 위해서 ("agar / untuk"): -기 위해서 lebih formal/tulis, -(으)려고 lebih percakapan dan sedikit lebih menyoroti niat pelaku. -(으)려고 하다 dengan 하다 membentuk pola lain "hampir / berniat" (출발하려고 해요 "saya hampir berangkat"). Untuk menjadikannya pemodifikasi kata benda ("usaha untuk melakukan X") pakai -(으)려는 (살려는 노력 "usaha untuk hidup").',
      'Đánh dấu ý định hoặc mục đích của người nói — "với ý định / để". Hình thức: gốc nguyên âm/ㄹ → -려고 (가다 → 가려고, 살다 → 살려고 ㄹ giữ); gốc phụ âm → -으려고 (먹다 → 먹으려고). Hai quy tắc nghiêm: CÙNG MỘT chủ ngữ phải làm cả hai vế (không dùng -려고 nếu hai hành động có chủ thể khác nhau), và vế thứ hai KHÔNG ĐƯỢC là mệnh lệnh hay đề nghị (không ra lệnh, không "đi nào") — chỉ trần thuật, câu hỏi, miêu tả.\n\nSo với -(으)러 가다/오다 ở TOPIK 1 ("đi/đến để"): -(으)러 chỉ gắn vào động từ chuyển động (가다, 오다, 다니다); -(으)려고 chấp nhận BẤT KỲ động từ nào (-려고 책을 샀어요 "tôi mua sách để..."). So với -기 위해서 ("để / nhằm"): -기 위해서 trang trọng/văn viết hơn, -(으)려고 thuộc khẩu ngữ và nhấn vào ý định người thực hiện hơn chút. -(으)려고 하다 với 하다 lập thành mẫu khác "sắp / có ý định" (출발하려고 해요 "tôi sắp khởi hành"). Để biến nó thành định ngữ ("nỗ lực để làm X") dùng -(으)려는 (살려는 노력 "nỗ lực để sống").',
      '話し手の意図・目的を表す「〜しようと／〜するために」。形: 母音または ㄹ 語幹 → -려고(가다 → 가려고、살다 → 살려고 で ㄹ 保持); 子音語幹 → -으려고(먹다 → 먹으려고)。厳しい二つの制約: 前節と後節は「同一主語」でなければならない(行為者が違うと使えない)、後節は「命令や勧誘」を取れない(命令も「〜しよう」も不可)— 平叙・疑問・描写のみ。\n\nTOPIK 1 の -(으)러 가다/오다(「〜しに行く／来る」)との対比: -(으)러 は移動動詞(가다、오다、다니다)にしか付かないが、-(으)려고 はどんな動詞でも受ける(-려고 책을 샀어요「〜しようと本を買った」)。-기 위해서(「〜するために」)とは: -기 위해서 のほうがフォーマル・文章的、-(으)려고 は会話的で行為者の意図に少し焦点が寄る。-(으)려고 하다 のように 하다 を付けると「〜しようとしている／〜するつもりだ」の別パターンになる(출발하려고 해요「出発しようとしています」)。「Xしようとする努力」のような名詞修飾形にしたいときは -(으)려는(살려는 노력「生きようとする努力」)。',
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
    usageNotes: L(
      'Auxiliary verb meaning "try doing X / give it a go". Form: build the -아/어 stem (same harmony and contractions as -아/어요) and add 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). Built on the literal verb 보다 ("see"), so the original idea is "do X and see how it goes". Conjugates normally — 봐요, 봤어요, 보세요, 보고 싶어요.\n\nTwo distinct tenses give very different meanings. Present (-아/어 봐요) = "try it / give it a go" right now (한번 먹어 봐요 "give it a try"), often slid into invitations and recommendations. Past (-아/어 봤어요) = "have ever done X" (한국에 가 봤어요? "have you ever been to Korea?"), the natural way to ask about life experiences. Don\'t pair with 보다 itself ("try to see") — 봐 보다 sounds redundant; use just 봐요. The TOPIK 1 partner -(으)ㄴ 적이 있다/없다 lives in the same experience space (간 적이 있어요? "have you ever gone?"), but -아/어 봤어요 is more conversational and slightly more about the act of trying than the abstract record of having done it.',
      'Verbo auxiliar que significa "intentar / probar a hacer X". Forma: armá la raíz -아/어 (misma armonía y contracciones que -아/어요) y agregale 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). Está construido sobre el verbo literal 보다 ("ver"), así que la idea original es "hacer X y ver qué pasa". Se conjuga normal — 봐요, 봤어요, 보세요, 보고 싶어요.\n\nDos tiempos dan significados muy distintos. Presente (-아/어 봐요) = "probá / dale, probá" en el momento (한번 먹어 봐요 "probá una vez"), aparece mucho en invitaciones y recomendaciones. Pasado (-아/어 봤어요) = "haber hecho alguna vez" (한국에 가 봤어요? "¿alguna vez estuviste en Corea?"), la forma natural de preguntar por experiencias de vida. No lo pegues con el propio 보다 ("intentar ver") — 봐 보다 suena redundante; usá 봐요 a secas. El compañero de TOPIK 1, -(으)ㄴ 적이 있다/없다, vive en el mismo terreno de experiencia (간 적이 있어요? "¿alguna vez fuiste?"), pero -아/어 봤어요 es más conversacional y un poco más sobre el acto de probar que sobre el registro abstracto de haberlo hecho.',
      'Verbe auxiliaire signifiant « essayer de faire X / faire pour voir ». Forme : on construit la racine -아/어 (mêmes harmonies et contractions qu\'avec -아/어요) puis on ajoute 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). Bâti sur le verbe littéral 보다 (« voir »), d\'où l\'idée de « faire X et voir ». Se conjugue normalement — 봐요, 봤어요, 보세요, 보고 싶어요.\n\nDeux temps donnent des sens très différents. Présent (-아/어 봐요) = « essaye / vas-y » sur le moment (한번 먹어 봐요 « goûte une fois »), très fréquent dans les invitations et les recommandations. Passé (-아/어 봤어요) = « avoir déjà fait » (한국에 가 봤어요? « as-tu déjà été en Corée ? »), la manière naturelle d\'interroger sur les expériences de vie. Ne pas le combiner avec 보다 lui-même (« essayer de voir ») — 봐 보다 sonne redondant ; utiliser simplement 봐요. Le partenaire de TOPIK 1, -(으)ㄴ 적이 있다/없다, occupe le même terrain (간 적이 있어요? « y es-tu déjà allé ? »), mais -아/어 봤어요 est plus conversationnel et insiste un peu plus sur l\'acte d\'essayer que sur le compte rendu abstrait du fait d\'avoir fait.',
      'Verbo auxiliar que significa "tentar / experimentar fazer X". Forma: monte o radical -아/어 (mesma harmonia e contrações de -아/어요) e some 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). Construído sobre o verbo literal 보다 ("ver"), então a ideia original é "fazer X e ver no que dá". Conjuga normalmente — 봐요, 봤어요, 보세요, 보고 싶어요.\n\nDois tempos dão sentidos bem diferentes. Presente (-아/어 봐요) = "tenta / experimenta" agora (한번 먹어 봐요 "experimenta uma vez"), aparece muito em convites e recomendações. Passado (-아/어 봤어요) = "já fez alguma vez" (한국에 가 봤어요? "você já esteve na Coreia?"), o jeito natural de perguntar sobre experiências de vida. Não emparelhe com o próprio 보다 ("tentar ver") — 봐 보다 soa redundante; use 봐요 sozinho. O parceiro do TOPIK 1, -(으)ㄴ 적이 있다/없다, mora no mesmo terreno de experiência (간 적이 있어요? "você já foi?"), mas -아/어 봤어요 é mais conversacional e enfatiza um pouco mais o ato de tentar do que o registro abstrato de ter feito.',
      'กริยาช่วยแปลว่า "ลองทำดู / ลองดู". รูป: สร้างราก -아/어 (กฎสระและการหดเหมือน -아/어요) แล้วเติม 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). สร้างจากกริยา 보다 ("ดู") ความหมายเดิมจึงคือ "ทำ X แล้วดูซิว่าเป็นยังไง". ผันปกติ — 봐요, 봤어요, 보세요, 보고 싶어요\n\nสองกาลให้ความหมายต่างกันมาก. ปัจจุบัน (-아/어 봐요) = "ลองดู / ลองเลย" ในตอนนี้ (한번 먹어 봐요 "ลองกินดูสักครั้ง"), ใช้บ่อยในการเชิญและแนะนำ. อดีต (-아/어 봤어요) = "เคยทำ" (한국에 가 봤어요? "เคยไปเกาหลีไหม?"), เป็นวิธีถามถึงประสบการณ์ชีวิตที่เป็นธรรมชาติที่สุด. อย่าคู่กับ 보다 ตัวเอง ("ลองดู") — 봐 보다 ฟังซ้ำซ้อน ใช้ 봐요 พอ. คู่ของ TOPIK 1 -(으)ㄴ 적이 있다/없다 อยู่ในแดนประสบการณ์เดียวกัน (간 적이 있어요? "เคยไปไหม?") แต่ -아/어 봤어요 พูดง่ายกว่าและเน้นการ "ลองทำ" มากกว่าการบันทึกประสบการณ์แบบนามธรรม',
      'Verba bantu yang berarti "mencoba melakukan X". Bentuk: bangun akar -아/어 (harmoni dan kontraksi sama dengan -아/어요) lalu tambahkan 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). Dibangun dari verba harfiah 보다 ("lihat"), jadi gagasan asalnya adalah "lakukan X dan lihat hasilnya". Konjugasi biasa — 봐요, 봤어요, 보세요, 보고 싶어요.\n\nDua kala memberi makna yang sangat berbeda. Kini (-아/어 봐요) = "coba / silakan coba" saat itu (한번 먹어 봐요 "coba sekali deh"), banyak muncul di ajakan dan rekomendasi. Lampau (-아/어 봤어요) = "pernah melakukan" (한국에 가 봤어요? "pernah ke Korea?"), cara paling alami menanyakan pengalaman hidup. Jangan pasangkan dengan 보다 sendiri ("coba lihat") — 봐 보다 terdengar mubazir; cukup 봐요. Pasangan TOPIK 1, -(으)ㄴ 적이 있다/없다, ada di wilayah pengalaman yang sama (간 적이 있어요? "pernah pergi?"), tapi -아/어 봤어요 lebih percakapan dan sedikit lebih menekankan tindakan mencoba ketimbang catatan abstrak bahwa pernah melakukannya.',
      'Trợ động từ nghĩa là "thử làm X". Hình thức: tạo gốc -아/어 (cùng quy tắc hài hòa và co rút như -아/어요) rồi thêm 보다 (먹다 → 먹어 보다, 가다 → 가 보다, 하다 → 해 보다). Dựng trên động từ 보다 ("nhìn"), nên ý gốc là "làm X rồi xem ra sao". Chia bình thường — 봐요, 봤어요, 보세요, 보고 싶어요.\n\nHai thì cho nghĩa rất khác nhau. Hiện tại (-아/어 봐요) = "thử đi / cứ thử xem" ngay lúc đó (한번 먹어 봐요 "thử một lần đi"), rất hay xuất hiện trong lời mời và lời khuyên. Quá khứ (-아/어 봤어요) = "đã từng làm" (한국에 가 봤어요? "bạn đã từng đến Hàn Quốc chưa?"), cách tự nhiên để hỏi về trải nghiệm. Đừng ghép với chính 보다 ("thử xem") — 봐 보다 nghe lặp; chỉ dùng 봐요 là đủ. Người anh em ở TOPIK 1, -(으)ㄴ 적이 있다/없다, ở cùng địa hạt trải nghiệm (간 적이 있어요? "đã từng đi chưa?"), nhưng -아/어 봤어요 thiên khẩu ngữ và nhấn vào hành động thử hơn là sổ ghi nhận trừu tượng.',
      '「〜してみる」(試行・経験)を表す補助動詞。形: -아/어 語幹を作り(-아/어요 と同じ調和・縮約)、보다 を付ける(먹다 → 먹어 보다、가다 → 가 보다、하다 → 해 보다)。本動詞 보다(「見る」)から来ているので、元の意味は「Xして様子を見る」。活用は普通通り — 봐요、봤어요、보세요、보고 싶어요。\n\n時制で意味が大きく変わる。現在(-아/어 봐요) =「(今)試してみて／やってみて」(한번 먹어 봐요「一回食べてみて」)、勧め・誘いで頻出。過去(-아/어 봤어요) =「〜したことがある」(한국에 가 봤어요?「韓国に行ったことありますか?」)、人生経験を尋ねる自然な言い方。本動詞 보다 と組むのは避ける(「見てみる」の意味で 봐 보다 と重ねると冗長 — 봐요 で十分)。TOPIK 1 の -(으)ㄴ 적이 있다/없다 と同じ経験の畑にいる(간 적이 있어요?「行ったことありますか?」)が、-아/어 봤어요 はより会話的で、抽象的な経験の有無よりも「試してみる」という行為に少し寄っている。',
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
    usageNotes: L(
      'Marks doing something AS A FAVOR for someone — "do X for [you/them]". Form: build the -아/어 stem (same harmony as -아/어요) and add 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 literally means "give", so the whole structure reads as "do X and give it to someone". -아/어 주세요 (the polite request form) is one of the most-heard phrases in Korea — "please do X for me / us".\n\nThe respect dimension splits into two patterns. -아/어 주다 / 주세요 = neutral or upward favor (you, a friend, a customer). -아/어 드리다 = humble form used when YOU do the favor for someone of higher status (도와 드릴게요 "let me help you"). The flip side, where the OTHER PERSON of higher status does it for YOU, uses -아/어 주시다 (선생님이 가르쳐 주셨어요 "the teacher kindly taught me"). Watch the listener-honoring flow: for "please send it to me" 보내 주세요 is fine; for "please send it to my boss" you\'d say 보내 드리세요. Past goes on 주다/드리다 (사 줬어요 "I bought it for them"), never on the main verb.',
      'Marca hacer algo COMO FAVOR para alguien — "hacer X para [vos/ellos]". Forma: armá la raíz -아/어 (misma armonía que -아/어요) y agregale 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 significa literalmente "dar", así que toda la estructura se lee como "hacer X y dárselo a alguien". -아/어 주세요 (la forma educada de pedido) es una de las frases que más se escuchan en Corea — "por favor, haceme X".\n\nLa dimensión del respeto se divide en dos patrones. -아/어 주다 / 주세요 = favor neutro o ascendente (vos, un amigo, un cliente). -아/어 드리다 = forma humilde que usás cuando VOS hacés el favor para alguien de mayor estatus (도와 드릴게요 "lo ayudo"). Su contracara, donde la OTRA PERSONA de mayor estatus lo hace por VOS, usa -아/어 주시다 (선생님이 가르쳐 주셨어요 "el profe me enseñó (amablemente)"). Cuidá el flujo de respeto: para "mandámelo" 보내 주세요 está bien; para "mandáselo a mi jefe" decís 보내 드리세요. El pasado va en 주다/드리다 (사 줬어요 "se lo compré"), nunca en el verbo principal.',
      'Marque l\'action accomplie en FAVEUR de quelqu\'un — « faire X pour [toi/elle/lui] ». Forme : on construit la racine -아/어 (mêmes harmonies qu\'avec -아/어요) puis on ajoute 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 signifie littéralement « donner », d\'où la lecture « faire X et le donner à quelqu\'un ». -아/어 주세요 (la forme polie de demande) est l\'une des phrases les plus entendues en Corée — « faites-le-moi, s\'il vous plaît ».\n\nLa dimension du respect se scinde en deux schémas. -아/어 주다 / 주세요 = faveur neutre ou vers le haut (toi, un ami, un client). -아/어 드리다 = forme humble employée quand C\'EST TOI qui rends service à quelqu\'un de plus haut placé (도와 드릴게요 « je vais vous aider »). Le pendant inverse, où c\'est l\'AUTRE personne (plus haut placée) qui agit pour TOI, emploie -아/어 주시다 (선생님이 가르쳐 주셨어요 « le professeur a eu la gentillesse de m\'enseigner »). Surveille le flux de déférence : « envoie-le-moi » → 보내 주세요 va bien ; « envoie-le à mon chef » → 보내 드리세요. Le passé porte sur 주다/드리다 (사 줬어요 « je le lui ai acheté »), jamais sur le verbe principal.',
      'Marca fazer algo COMO FAVOR para alguém — "fazer X para [você/eles]". Forma: monte o radical -아/어 (mesma harmonia de -아/어요) e some 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 literalmente significa "dar", então a estrutura toda se lê como "fazer X e dar para alguém". -아/어 주세요 (a forma educada de pedido) é uma das frases mais ouvidas na Coreia — "por favor, faça X para mim".\n\nA dimensão do respeito divide-se em dois padrões. -아/어 주다 / 주세요 = favor neutro ou para cima (você, um amigo, um cliente). -아/어 드리다 = forma humilde usada quando VOCÊ faz o favor para alguém de status mais alto (도와 드릴게요 "vou ajudá-lo"). O lado inverso, em que a OUTRA pessoa de status mais alto faz por VOCÊ, usa -아/어 주시다 (선생님이 가르쳐 주셨어요 "o professor gentilmente me ensinou"). Cuide o fluxo de respeito: para "envia para mim" 보내 주세요 está bem; para "envia para meu chefe" você diz 보내 드리세요. O passado vai em 주다/드리다 (사 줬어요 "comprei para eles"), nunca no verbo principal.',
      'แสดงการทำสิ่งใด "เพื่อใคร" หรือเป็นการ "ช่วย" คนนั้น — "ทำ X ให้ [คุณ/เขา]". รูป: สร้างราก -아/어 (กฎสระเหมือน -아/어요) แล้วเติม 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 แปลตามตัวอักษรว่า "ให้" โครงสร้างทั้งหมดจึงอ่านได้ว่า "ทำ X แล้วยกให้คนนั้น". -아/어 주세요 (รูปขอแบบสุภาพ) เป็นวลีที่ได้ยินบ่อยที่สุดวลีหนึ่งในเกาหลี — "ขอ ... หน่อย"\n\nมิติของความเคารพแบ่งเป็นสองรูป. -아/어 주다 / 주세요 = ช่วยแบบเป็นกลางหรือต่อผู้ที่อาวุโสกว่าเล็กน้อย (คุณ เพื่อน ลูกค้า). -아/어 드리다 = รูปถ่อมที่ใช้เมื่อ "คุณ" ช่วยคนที่อยู่สูงกว่า (도와 드릴게요 "ดิฉันช่วยให้ค่ะ"). ด้านตรงข้าม คือเมื่อ "อีกฝ่ายซึ่งอาวุโสกว่า" ช่วยคุณ ใช้ -아/어 주시다 (선생님이 가르쳐 주셨어요 "อาจารย์กรุณาสอนให้ฉัน"). ดูทิศของความเคารพให้ดี: "ส่งให้ฉัน" ใช้ 보내 주세요; "ส่งให้เจ้านายของฉัน" ใช้ 보내 드리세요. รูปอดีตอยู่ที่ 주다/드리다 (사 줬어요 "ซื้อให้แล้ว") ไม่ใช่กริยาหลัก',
      'Menandai melakukan sesuatu SEBAGAI JASA bagi seseorang — "lakukan X untuk [kamu/mereka]". Bentuk: bangun akar -아/어 (harmoni sama dengan -아/어요) lalu tambahkan 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 secara harfiah berarti "memberi", jadi keseluruhan strukturnya dibaca "lakukan X lalu berikan kepada seseorang". -아/어 주세요 (bentuk sopan untuk permintaan) adalah salah satu frasa yang paling sering kamu dengar di Korea — "tolong ...".\n\nDimensi hormatnya terbagi dua. -아/어 주다 / 주세요 = jasa netral atau ke atas (kamu, teman, pelanggan). -아/어 드리다 = bentuk merendah saat KAMU memberi jasa kepada orang berstatus lebih tinggi (도와 드릴게요 "saya akan membantu Anda"). Sisi sebaliknya — ORANG LAIN berstatus lebih tinggi yang melakukannya untuk KAMU — memakai -아/어 주시다 (선생님이 가르쳐 주셨어요 "guru mengajari saya dengan baik"). Awasi arah hormatnya: "kirimkan kepada saya" → 보내 주세요 oke; "kirimkan kepada atasan saya" → 보내 드리세요. Bentuk lampau menempel pada 주다/드리다 (사 줬어요 "saya membelikan untuk mereka"), bukan verba utama.',
      'Đánh dấu hành động làm "giúp / vì" ai đó — "làm X cho [bạn/họ]". Hình thức: tạo gốc -아/어 (cùng quy tắc hài hòa với -아/어요) rồi thêm 주다 (사다 → 사 주다, 만들다 → 만들어 주다, 하다 → 해 주다). 주다 nghĩa đen là "cho", nên toàn bộ cấu trúc đọc thành "làm X rồi đem cho ai". -아/어 주세요 (dạng lịch sự để nhờ vả) là một trong những cụm bạn nghe nhiều nhất ở Hàn — "làm ơn ~ giúp".\n\nChiều kính trọng tách thành hai mẫu. -아/어 주다 / 주세요 = giúp trung tính hoặc hướng lên một chút (bạn, người quen, khách). -아/어 드리다 = dạng khiêm tốn dùng khi BẠN giúp người có địa vị cao hơn (도와 드릴게요 "để em giúp ạ"). Mặt ngược lại — NGƯỜI KHÁC có địa vị cao hơn làm giúp BẠN — dùng -아/어 주시다 (선생님이 가르쳐 주셨어요 "thầy đã chỉ dạy em"). Quan sát hướng kính trọng: "gửi cho tôi" → 보내 주세요; "gửi cho sếp tôi" → 보내 드리세요. Quá khứ gắn vào 주다/드리다 (사 줬어요 "tôi đã mua cho họ"), không gắn vào động từ chính.',
      '誰かのために行為を行うこと(恩恵)を表す「〜てあげる／〜てくれる」。形: -아/어 語幹を作り(-아/어요 と同じ調和)、주다 を付ける(사다 → 사 주다、만들다 → 만들어 주다、하다 → 해 주다)。주다 は本動詞「与える」なので、構造全体は「Xして、それを誰かに渡す」と読める。-아/어 주세요(丁寧な依頼形)は韓国で最もよく耳にする表現の一つ — 「〜してください」。\n\n敬意の方向で二つの形に分かれる。-아/어 주다 / 주세요 = 中立または上位への恩恵(あなた・友達・お客様など)。-아/어 드리다 = 自分が目上の方のために行為するときの謙譲形(도와 드릴게요「お手伝いします」)。逆に、目上の相手が自分のために行為する場合は -아/어 주시다 を使う(선생님이 가르쳐 주셨어요「先生が教えてくださった」)。敬意の向きに注意 — 「私に送ってください」は 보내 주세요 で良いが、「私の上司に送ってください」は 보내 드리세요 が自然。過去形は 주다/드리다 に付ける(사 줬어요「(誰かに)買ってあげた」)。主動詞には付けない。',
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
    usageNotes: L(
      'Marks definitive, irreversible completion with an EMOTIONAL kicker — relief, regret, surprise. Form: build the -아/어 stem (same harmony as -아/어요) and add 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 literally means "throw away", so the whole structure reads as "do X and there\'s no taking it back". The emotion is in the air around the verb — context decides whether it\'s positive (great, it\'s DONE) or negative (oops, it\'s GONE / it HAPPENED).\n\nNot every "finished" needs this. Past simple 다 했어요 reports completion neutrally; 다 해 버렸어요 layers relief or finality on top ("finally got it ALL done!"). With regrettable events: 차가 떠나 버렸어요 "the train left (and I missed it)", 다 잊어 버렸어요 "I completely forgot". Casual contraction is -아/어 버렸어요 → -아/어 버렸어 between friends. A close-but-different auxiliary, -고 말다, conveys a similar "ended up" feel but more formal/literary and usually carries the weight of inevitability — 결국 가고 말았다 "in the end, I had to go". Reach for -아/어 버리다 first in conversation; -고 말다 stays mostly in writing.',
      'Marca una conclusión definitiva e irreversible con un toque EMOCIONAL — alivio, arrepentimiento, sorpresa. Forma: armá la raíz -아/어 (misma armonía que -아/어요) y agregale 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 significa literalmente "tirar / botar", así que toda la estructura se lee como "hacer X y ya no hay vuelta". La emoción flota alrededor del verbo — el contexto decide si es positiva (¡por fin, está HECHO!) o negativa (uy, ya FUE / SE FUE).\n\nNo todo "terminado" pide esta forma. El pasado simple 다 했어요 reporta la conclusión neutra; 다 해 버렸어요 le suma alivio o finalidad ("¡por fin terminé TODO!"). Con eventos lamentables: 차가 떠나 버렸어요 "el tren se fue (y me lo perdí)", 다 잊어 버렸어요 "me lo olvidé por completo". La contracción casual es -아/어 버렸어요 → -아/어 버렸어 entre amigos. Un auxiliar cercano pero distinto, -고 말다, transmite un "terminó pasando" parecido pero más formal/literario y suele cargar inevitabilidad — 결국 가고 말았다 "al final, terminé yendo". En conversación tirá primero a -아/어 버리다; -고 말다 vive sobre todo en lo escrito.',
      'Marque l\'achèvement définitif et irréversible avec une charge ÉMOTIONNELLE — soulagement, regret, surprise. Forme : on construit la racine -아/어 (mêmes harmonies qu\'avec -아/어요) puis on ajoute 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 signifie littéralement « jeter », d\'où la lecture « faire X et il n\'y a plus de retour ». L\'émotion flotte autour du verbe — le contexte décide si elle est positive (enfin, c\'est FAIT) ou négative (zut, c\'est PARTI / c\'est ARRIVÉ).\n\nTout achèvement ne réclame pas cette tournure. Le passé simple 다 했어요 décrit la conclusion de façon neutre ; 다 해 버렸어요 ajoute le soulagement ou la finalité (« enfin j\'ai TOUT fait ! »). Avec des événements regrettables : 차가 떠나 버렸어요 « le train est parti (et je l\'ai raté) », 다 잊어 버렸어요 « j\'ai tout oublié ». À l\'oral, la contraction donne -아/어 버렸어요 → -아/어 버렸어 entre amis. Un auxiliaire voisin mais différent, -고 말다, exprime un « finir par » similaire, mais plus formel / littéraire, et porte généralement l\'idée d\'inévitabilité — 결국 가고 말았다 « finalement, j\'ai dû y aller ». À l\'oral, on choisit d\'abord -아/어 버리다 ; -고 말다 reste surtout dans l\'écrit.',
      'Marca uma conclusão definitiva e irreversível com peso EMOCIONAL — alívio, pesar, surpresa. Forma: monte o radical -아/어 (mesma harmonia de -아/어요) e some 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 literalmente significa "jogar fora", então a estrutura toda se lê como "fazer X e não dá mais para voltar atrás". A emoção fica no ar em torno do verbo — o contexto decide se é positiva (até que enfim, está FEITO) ou negativa (puxa, já FOI / ACONTECEU).\n\nNem todo "terminado" precisa disso. O passado simples 다 했어요 reporta a conclusão de modo neutro; 다 해 버렸어요 acrescenta alívio ou finalidade ("até que enfim terminei TUDO!"). Em eventos lamentáveis: 차가 떠나 버렸어요 "o trem partiu (e perdi)", 다 잊어 버렸어요 "esqueci tudinho". A contração casual é -아/어 버렸어요 → -아/어 버렸어 entre amigos. Um auxiliar próximo mas diferente, -고 말다, traz a sensação de "acabou acontecendo" mas é mais formal/literário e costuma carregar inevitabilidade — 결국 가고 말았다 "no fim, acabei indo". Para a fala, comece por -아/어 버리다; -고 말다 vive principalmente na escrita.',
      'แสดงการ "เสร็จเด็ดขาด ย้อนกลับไม่ได้" บวกอารมณ์ — โล่งใจ เสียดาย ตกใจ. รูป: สร้างราก -아/어 (กฎสระเหมือน -아/어요) แล้วเติม 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 ตามตัวอักษรแปลว่า "ทิ้ง" โครงสร้างทั้งหมดจึงอ่านได้ว่า "ทำ X แล้วเอาคืนไม่ได้". อารมณ์ลอยอยู่รอบกริยา — บริบทเป็นตัวบอกว่าบวก (ในที่สุดก็ "เสร็จ"!) หรือลบ (โอ๊ย "ไป" แล้ว / "เกิดขึ้น" แล้ว)\n\nไม่ใช่ทุก "เสร็จ" จะใช้รูปนี้. อดีตธรรมดา 다 했어요 รายงานเป็นกลาง ส่วน 다 해 버렸어요 ซ้อนความรู้สึกโล่งใจหรือเด็ดขาด ("ในที่สุดก็ทำเสร็จหมด!"). กับเหตุการณ์ที่น่าเสียดาย: 차가 떠나 버렸어요 "รถออกไปแล้ว (พลาดเลย)", 다 잊어 버렸어요 "ลืมหมดเลย". รูปย่อในการพูดคือ -아/어 버렸어요 → -아/어 버렸어 ระหว่างเพื่อน. กริยาช่วยที่ใกล้กันแต่คนละตัว -고 말다 ให้ความรู้สึก "สุดท้ายก็เกิดขึ้น" คล้ายกันแต่ทางการ/วรรณกรรมและมักสื่อความหลีกเลี่ยงไม่ได้ — 결국 가고 말았다 "ในที่สุดก็ต้องไป". ในการพูดเริ่มที่ -아/어 버리다 ก่อน; -고 말다 อยู่ในงานเขียนเป็นส่วนใหญ่',
      'Menandai penyelesaian tuntas dan tak terbalikkan dengan bumbu EMOSI — lega, menyesal, kaget. Bentuk: bangun akar -아/어 (harmoni sama dengan -아/어요) lalu tambahkan 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 secara harfiah berarti "membuang", jadi keseluruhan strukturnya berbunyi "lakukan X dan tidak bisa ditarik kembali". Emosinya mengambang di sekitar verba — konteks yang menentukan positif (akhirnya SELESAI!) atau negatif (yah, sudah PERGI / sudah TERJADI).\n\nTidak setiap "selesai" butuh ini. Lampau biasa 다 했어요 melaporkan dengan netral; 다 해 버렸어요 menumpangkan kelegaan atau finalitas ("akhirnya SEMUA selesai!"). Untuk hal yang disesali: 차가 떠나 버렸어요 "keretanya sudah berangkat (saya ketinggalan)", 다 잊어 버렸어요 "saya lupa total". Kontraksi santai: -아/어 버렸어요 → -아/어 버렸어 antar teman. Auxiliary mirip tapi berbeda, -고 말다, memberi rasa "akhirnya terjadi" yang serupa tapi lebih formal/sastrawi dan kerap membawa kesan tak terhindarkan — 결국 가고 말았다 "akhirnya saya pergi juga". Dalam percakapan, pilih -아/어 버리다 dulu; -고 말다 lebih banyak di teks tulis.',
      'Đánh dấu sự hoàn tất dứt khoát, không thể quay lại, kèm sắc thái CẢM XÚC — nhẹ nhõm, tiếc nuối, bất ngờ. Hình thức: tạo gốc -아/어 (cùng quy tắc hài hòa với -아/어요) rồi thêm 버리다 (가다 → 가 버리다, 먹다 → 먹어 버리다, 하다 → 해 버리다). 버리다 nghĩa đen là "vứt đi", nên cấu trúc đọc thành "làm X và không lấy lại được". Cảm xúc bay xung quanh động từ — ngữ cảnh quyết định tích cực (cuối cùng cũng XONG!) hay tiêu cực (ôi, ĐI mất / XẢY RA rồi).\n\nKhông phải mọi "hoàn thành" đều cần dạng này. Quá khứ đơn 다 했어요 báo cáo trung tính; 다 해 버렸어요 phủ thêm cảm giác nhẹ nhõm hoặc dứt khoát ("cuối cùng cũng làm XONG hết!"). Với sự việc đáng tiếc: 차가 떠나 버렸어요 "tàu chạy mất rồi (lỡ rồi)", 다 잊어 버렸어요 "tôi quên sạch". Rút gọn thân mật: -아/어 버렸어요 → -아/어 버렸어 giữa bạn bè. Một trợ động từ gần nhưng khác, -고 말다, cho cảm giác "rốt cuộc cũng xảy ra" tương tự nhưng trang trọng/văn vẻ hơn và thường mang nét tất yếu — 결국 가고 말았다 "cuối cùng tôi vẫn phải đi". Trong khẩu ngữ chọn -아/어 버리다 trước; -고 말다 chủ yếu sống ở văn viết.',
      '完了 + 感情(安堵・後悔・驚き)を表す「〜てしまう／〜ちゃう」。形: -아/어 語幹を作り(-아/어요 と同じ調和)、버리다 を付ける(가다 → 가 버리다、먹다 → 먹어 버리다、하다 → 해 버리다)。버리다 は本動詞「捨てる」なので、構造全体は「Xして、もう取り返しがつかない」と読める。感情は動詞の周りに漂い、文脈次第でポジティブ(ついに「やった」!)にもネガティブ(うっかり「行ってしまった」)にもなる。\n\nどんな「終わった」でもこの形にする必要はない。単純過去 다 했어요 は中立的に完了を述べ、다 해 버렸어요 は安堵や完結のニュアンスを上乗せする(「ようやく全部やり終えた!」)。残念な出来事には: 차가 떠나 버렸어요「列車が行ってしまった(乗り遅れた)」、다 잊어 버렸어요「全部忘れちゃった」。カジュアル縮約: -아/어 버렸어요 → -아/어 버렸어(친구同士)。近縁の補助 -고 말다 も「結局〜してしまう」というニュアンスを持つが、よりフォーマル・文章的で「避けがたい」響きが強い — 결국 가고 말았다「結局行ってしまった」。会話ではまず -아/어 버리다 を使い、-고 말다 はおもに書き言葉に残しておくとよい。',
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
    usageNotes: L(
      'Marks "do X and leave it ready / do X in advance" — captures preparation that stays useful for later. Form: build the -아/어 stem (same harmony as -아/어요) and add 놓다 or 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). Both 놓다 ("put down / place") and 두다 ("set aside / keep") work as the auxiliary; the contracted forms -아/어 놔요 (from 놓아요) and -아/어 둬요 (from 두어요) are extremely common in speech.\n\n놓다 and 두다 are near-synonyms but trade slightly. 놓다 leans toward a one-shot "do and leave it placed" (창문을 열어 놓았어요 "I opened the window and left it open"). 두다 leans toward "set aside for later use", often paired with planning (티켓을 사 뒀어요 "I bought the ticket and have it ready"). In most everyday sentences they\'re interchangeable — pick by ear. Don\'t confuse with -아/어 있다, which marks a passive resulting state of a completed CHANGE (문이 열려 있어요 "the door is open"); -아/어 놓다 keeps an ACTOR in the picture ("I left the door open").',
      'Marca "hacer X y dejarlo listo / hacer X con antelación" — capta la idea de preparación que queda servida para después. Forma: armá la raíz -아/어 (misma armonía que -아/어요) y agregale 놓다 o 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). Tanto 놓다 ("poner / colocar") como 두다 ("dejar / guardar") funcionan como auxiliar; las contracciones -아/어 놔요 (de 놓아요) y -아/어 둬요 (de 두어요) son comunísimas en el habla.\n\n놓다 y 두다 son casi sinónimos pero hay matices. 놓다 se inclina al "hacer y dejarlo puesto" en una pasada (창문을 열어 놓았어요 "abrí la ventana y la dejé abierta"). 두다 se inclina al "dejar guardado para usar después", muy ligado a planificación (티켓을 사 뒀어요 "compré el tique y lo tengo listo"). En la mayoría de las frases cotidianas se intercambian — elegí por oído. No lo confundas con -아/어 있다, que marca el estado resultante pasivo de un CAMBIO completado (문이 열려 있어요 "la puerta está abierta"); -아/어 놓다 conserva al ACTOR en escena ("dejé la puerta abierta").',
      'Marque « faire X et le laisser prêt / faire X à l\'avance » — capte l\'idée d\'une préparation qui reste utile pour plus tard. Forme : on construit la racine -아/어 (mêmes harmonies qu\'avec -아/어요) puis on ajoute 놓다 ou 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). Aussi bien 놓다 (« poser / placer ») que 두다 (« mettre de côté / garder ») servent d\'auxiliaire ; les contractions -아/어 놔요 (de 놓아요) et -아/어 둬요 (de 두어요) sont extrêmement courantes à l\'oral.\n\n놓다 et 두다 sont quasi synonymes, avec une légère différence. 놓다 penche vers « faire et laisser tel quel » en un coup (창문을 열어 놓았어요 « j\'ai ouvert la fenêtre et l\'ai laissée ouverte »). 두다 penche vers « mettre de côté pour plus tard », souvent associé à la planification (티켓을 사 뒀어요 « j\'ai acheté le billet et je l\'ai sous la main »). Dans la plupart des phrases quotidiennes, ils sont interchangeables — choisis à l\'oreille. À ne pas confondre avec -아/어 있다, qui marque l\'état résultant passif d\'un CHANGEMENT accompli (문이 열려 있어요 « la porte est ouverte ») ; -아/어 놓다 garde un ACTEUR dans le cadre (« j\'ai laissé la porte ouverte »).',
      'Marca "fazer X e deixar pronto / fazer X com antecedência" — captura preparação que fica útil para depois. Forma: monte o radical -아/어 (mesma harmonia de -아/어요) e some 놓다 ou 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). Tanto 놓다 ("colocar / pousar") quanto 두다 ("guardar / deixar de lado") funcionam como auxiliar; as contrações -아/어 놔요 (de 놓아요) e -아/어 둬요 (de 두어요) são comuníssimas na fala.\n\n놓다 e 두다 são quase sinônimos mas têm nuances. 놓다 puxa para "fazer e deixar posto" num lance (창문을 열어 놓았어요 "abri a janela e deixei aberta"). 두다 puxa para "deixar guardado para depois", colado a planejamento (티켓을 사 뒀어요 "comprei o ingresso e está aqui à mão"). Na maioria das frases do dia a dia são intercambiáveis — escolha pelo ouvido. Não confunda com -아/어 있다, que marca o estado resultante passivo de uma MUDANÇA concluída (문이 열려 있어요 "a porta está aberta"); -아/어 놓다 mantém um ATOR em cena ("deixei a porta aberta").',
      'แสดงความหมาย "ทำ X ทิ้งไว้ให้พร้อม / ทำ X ไว้ล่วงหน้า" — สื่อการเตรียมที่ยังเป็นประโยชน์ภายหลัง. รูป: สร้างราก -아/어 (กฎสระเหมือน -아/어요) แล้วเติม 놓다 หรือ 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). ทั้ง 놓다 ("วาง") และ 두다 ("เก็บไว้") ทำหน้าที่กริยาช่วยได้; รูปย่อ -아/어 놔요 (จาก 놓아요) และ -아/어 둬요 (จาก 두어요) ใช้บ่อยมากในการพูด\n\n놓다 กับ 두다 เกือบเป็นคำพ้อง แต่มีน้ำหนักต่างเล็กน้อย. 놓다 เอียงไปทาง "ทำเสร็จแล้ววางไว้" ในการกระทำคราวเดียว (창문을 열어 놓았어요 "เปิดหน้าต่างทิ้งไว้"). 두다 เอียงไปทาง "เก็บไว้ใช้ทีหลัง" มักโยงกับการวางแผน (티켓을 사 뒀어요 "ซื้อตั๋วเตรียมไว้แล้ว"). ในประโยคทั่วไปสลับใช้กันได้ — เลือกตามเสียงที่คุ้นหู. อย่าสับสนกับ -아/어 있다 ที่บอกสภาพผลลัพธ์เชิงรับของการเปลี่ยนแปลงที่จบแล้ว (문이 열려 있어요 "ประตูเปิดอยู่"); -아/어 놓다 ยังมี "ผู้กระทำ" อยู่ในภาพ ("ฉันเปิดประตูทิ้งไว้")',
      'Menandai "lakukan X dan biarkan siap / lakukan X di awal" — menangkap persiapan yang tetap berguna nanti. Bentuk: bangun akar -아/어 (harmoni sama dengan -아/어요) lalu tambahkan 놓다 atau 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). Baik 놓다 ("meletakkan") maupun 두다 ("menyimpan / menaruh") bisa jadi auxiliary; kontraksi -아/어 놔요 (dari 놓아요) dan -아/어 둬요 (dari 두어요) sangat sering muncul saat bicara.\n\n놓다 dan 두다 nyaris sinonim tapi sedikit beda nuansanya. 놓다 cenderung "lakukan dan biarkan terpasang" dalam satu gerakan (창문을 열어 놓았어요 "saya buka jendela dan biarkan terbuka"). 두다 cenderung "menyimpan untuk dipakai nanti", sering dipakai dengan perencanaan (티켓을 사 뒀어요 "saya sudah beli tiketnya dan sudah siap"). Di kebanyakan kalimat sehari-hari keduanya bisa saling tukar — pilih lewat telinga. Jangan tertukar dengan -아/어 있다, yang menandai keadaan hasil pasif dari sebuah PERUBAHAN yang sudah tuntas (문이 열려 있어요 "pintunya terbuka"); -아/어 놓다 tetap mempertahankan PELAKU dalam gambaran ("saya membiarkan pintunya terbuka").',
      'Đánh dấu "làm X rồi để sẵn / làm X sẵn trước" — nắm ý chuẩn bị mà vẫn hữu dụng cho lát nữa. Hình thức: tạo gốc -아/어 (cùng quy tắc hài hòa với -아/어요) rồi thêm 놓다 hoặc 두다 (사다 → 사 놓다 / 사 두다, 만들다 → 만들어 놓다 / 만들어 두다, 하다 → 해 놓다 / 해 두다). Cả 놓다 ("đặt") lẫn 두다 ("để dành") đều có thể đóng vai trợ động từ; dạng rút gọn -아/어 놔요 (từ 놓아요) và -아/어 둬요 (từ 두어요) cực kỳ phổ biến trong khẩu ngữ.\n\n놓다 và 두다 gần như đồng nghĩa, có khác chút sắc thái. 놓다 nghiêng về "làm và để nguyên đó" trong một động tác (창문을 열어 놓았어요 "tôi đã mở cửa sổ và để nguyên"). 두다 nghiêng về "cất để dùng sau", thường gắn với kế hoạch (티켓을 사 뒀어요 "tôi đã mua vé và để sẵn"). Trong câu thông dụng thường thay thế cho nhau — chọn theo cảm giác âm thanh. Đừng nhầm với -아/어 있다 vốn đánh dấu trạng thái kết quả bị động của một SỰ THAY ĐỔI đã hoàn tất (문이 열려 있어요 "cánh cửa đang mở"); -아/어 놓다 vẫn giữ "người thực hiện" trong khung hình ("tôi đã mở cửa và để nguyên").',
      '「Xして(後で使えるように)置いておく／前もってXしておく」を表す。形: -아/어 語幹を作り(-아/어요 と同じ調和)、놓다 か 두다 を付ける(사다 → 사 놓다 / 사 두다、만들다 → 만들어 놓다 / 만들어 두다、하다 → 해 놓다 / 해 두다)。本動詞 놓다(「置く」)と 두다(「取っておく」)のどちらも補助動詞として機能する; 口語の縮約 -아/어 놔요(놓아요 から)、-아/어 둬요(두어요 から)も非常によく使われる。\n\n놓다 と 두다 はほぼ同義だが、ニュアンスに少しだけ差がある。놓다 は「一回でやって置いておく」感が強い(창문을 열어 놓았어요「窓を開けっぱなしにしておいた」)。두다 は「後で使えるように仕舞っておく／取っておく」のニュアンスで、計画的な行動と相性がいい(티켓을 사 뒀어요「チケットを買って準備しておいた」)。日常文ではほぼ自由に置換可能 — 耳で選んでよい。完了した「変化」の受動的結果状態を表す -아/어 있다(문이 열려 있어요「ドアが開いている」)と混同しないこと。-아/어 놓다 は「行為者」が画面に残る(「私がドアを開けたままにしておいた」)。',
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

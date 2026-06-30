import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 문법 정원 (grammar garden) — explanation for the core SRS deck-draw game.
 * The draw → write → rate → grow loop that schedules spaced reviews.
 * Korean examples are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const RULETA_HELP: PracticeHelpContent = {
  ko: '문법 정원',
  romanization: 'munbeop jeongwon',
  subtitle: L(
    'the grammar garden — write, rate, grow',
    'el jardín de gramática — escribe, califica, cultiva',
    'le jardin grammatical — écrire, évaluer, faire pousser',
    'o jardim de gramática — escreva, avalie, cultive',
    'สวนไวยากรณ์ — เขียน ให้คะแนน เติบโต',
    'taman tata bahasa — tulis, nilai, tumbuhkan',
    'khu vườn ngữ pháp — viết, tự đánh giá, gieo trồng',
    '文法の庭 — 書いて、評価して、育てる',
  ),
  concept: L(
    "The heart of the app. You pick a deck, draw three grammar cards, and write a real Korean sentence using each one in a given context. After each sentence you rate yourself easy or hard. Spaced repetition uses that rating to decide when the grammar comes back — and every grammar you practice grows from seedling to plant to tree in your garden. Mastery means you can produce the form on your own, not just recognize it.",
    'El corazón de la app. Eliges un mazo, sacas tres cartas de gramática y escribes una frase coreana real usando cada una en un contexto dado. Tras cada frase te calificas: fácil o difícil. La repetición espaciada usa esa calificación para decidir cuándo vuelve la gramática, y cada gramática que practicas crece de brote a planta y a árbol en tu jardín. Dominar significa producir la forma por ti mismo, no solo reconocerla.',
    "Le cœur de l'application. Vous choisissez un paquet, tirez trois cartes de grammaire et écrivez une vraie phrase coréenne en utilisant chacune dans un contexte donné. Après chaque phrase, vous vous évaluez : facile ou difficile. La répétition espacée utilise cette note pour décider du retour de la grammaire, et chaque point pratiqué grandit de la pousse à la plante puis à l'arbre dans votre jardin. Maîtriser, c'est produire la forme soi-même, pas seulement la reconnaître.",
    'O coração do app. Você escolhe um baralho, tira três cartas de gramática e escreve uma frase coreana real usando cada uma em um contexto dado. Depois de cada frase, você se avalia: fácil ou difícil. A repetição espaçada usa essa nota para decidir quando a gramática volta, e cada gramática que você pratica cresce de broto a planta e a árvore no seu jardim. Dominar significa produzir a forma sozinho, não apenas reconhecê-la.',
    'หัวใจของแอป คุณเลือกสำรับ จั่วการ์ดไวยากรณ์สามใบ แล้วเขียนประโยคภาษาเกาหลีจริงโดยใช้แต่ละไวยากรณ์ในบริบทที่กำหนด หลังแต่ละประโยคให้คุณประเมินตนเองว่า ง่าย หรือ ยาก ระบบทบทวนแบบเว้นช่วงใช้คะแนนนั้นตัดสินว่าไวยากรณ์จะกลับมาเมื่อไร และทุกไวยากรณ์ที่ฝึกจะเติบโตจากต้นกล้าเป็นต้นไม้ในสวนของคุณ การเชี่ยวชาญคือการสร้างรูปนั้นได้เอง ไม่ใช่แค่จำได้',
    'Inti dari aplikasi ini. Anda memilih dek, menarik tiga kartu tata bahasa, dan menulis kalimat Korea sungguhan memakai masing-masing dalam konteks yang diberikan. Setelah tiap kalimat, Anda menilai diri sendiri: mudah atau sulit. Pengulangan berjarak memakai nilai itu untuk menentukan kapan tata bahasa kembali, dan setiap tata bahasa yang dilatih tumbuh dari tunas menjadi tanaman lalu pohon di taman Anda. Menguasai berarti mampu menghasilkan bentuknya sendiri, bukan sekadar mengenalinya.',
    'Trái tim của ứng dụng. Bạn chọn một bộ thẻ, rút ba thẻ ngữ pháp và viết một câu tiếng Hàn thật bằng mỗi điểm ngữ pháp trong một ngữ cảnh cho sẵn. Sau mỗi câu, bạn tự đánh giá: dễ hay khó. Lặp lại ngắt quãng dùng đánh giá đó để quyết định khi nào điểm ngữ pháp quay lại, và mỗi điểm bạn luyện sẽ lớn lên từ mầm thành cây con rồi thành cây trong khu vườn của bạn. Thành thạo nghĩa là tự tạo ra được dạng đó, không chỉ nhận ra nó.',
    'アプリの核心。デッキを選び、文法カードを3枚引き、それぞれの文法を与えられた文脈で使って本物の韓国語の文を書く。各文のあとに「やさしい／むずかしい」で自己評価する。間隔反復はその評価をもとに文法がいつ戻ってくるかを決め、練習した文法は庭の中で芽から草、そして木へと育っていく。習熟とは、ただ見て分かるだけでなく、自分でその形を作り出せること。',
  ),
  howToPlay: [
    L(
      'Pick a deck from the shelf — one TOPIK level, "all levels", or a custom deck you built.',
      'Elige un mazo del estante: un nivel TOPIK, "todos los niveles" o un mazo personalizado que hayas creado.',
      'Choisissez un paquet sur l\'étagère : un niveau TOPIK, « tous les niveaux » ou un paquet personnalisé que vous avez créé.',
      'Escolha um baralho na prateleira: um nível TOPIK, "todos os níveis" ou um baralho personalizado que você criou.',
      'เลือกสำรับจากชั้น: ระดับ TOPIK หนึ่งระดับ "ทุกระดับ" หรือสำรับที่คุณสร้างเอง',
      'Pilih dek dari rak: satu level TOPIK, "semua level", atau dek khusus yang Anda buat.',
      'Chọn một bộ thẻ trên kệ: một cấp TOPIK, "tất cả các cấp", hoặc bộ thẻ tùy chỉnh bạn đã tạo.',
      '棚からデッキを選ぶ：TOPIKのある級、「全レベル」、または自分で作ったカスタムデッキ。',
    ),
    L(
      'Three cards are dealt face-down — tap to flip them and reveal the three grammar points for this round.',
      'Se reparten tres cartas boca abajo: tócalas para voltearlas y revelar los tres puntos de gramática de esta ronda.',
      'Trois cartes sont distribuées face cachée : touchez-les pour les retourner et révéler les trois points de grammaire de la manche.',
      'Três cartas são distribuídas viradas para baixo: toque para virá-las e revelar os três pontos de gramática desta rodada.',
      'แจกการ์ดสามใบคว่ำหน้า แตะเพื่อพลิกและเผยจุดไวยากรณ์สามจุดของรอบนี้',
      'Tiga kartu dibagikan tertutup: ketuk untuk membaliknya dan menampilkan tiga poin tata bahasa ronde ini.',
      'Ba thẻ được chia úp xuống: chạm để lật và hiện ba điểm ngữ pháp của vòng này.',
      '3枚のカードが裏向きに配られる。タップしてめくり、今回の3つの文法を表示する。',
    ),
    L(
      'For each card, write a Korean sentence that uses the grammar in the given context, then rate yourself easy or hard and save.',
      'Para cada carta, escribe una frase coreana que use la gramática en el contexto dado; luego califícate fácil o difícil y guarda.',
      'Pour chaque carte, écrivez une phrase coréenne utilisant la grammaire dans le contexte donné, puis évaluez-vous facile ou difficile et enregistrez.',
      'Para cada carta, escreva uma frase coreana que use a gramática no contexto dado; depois avalie-se fácil ou difícil e salve.',
      'สำหรับการ์ดแต่ละใบ เขียนประโยคภาษาเกาหลีที่ใช้ไวยากรณ์นั้นในบริบทที่กำหนด แล้วประเมินตนเองว่า ง่าย หรือ ยาก และบันทึก',
      'Untuk tiap kartu, tulis kalimat Korea yang memakai tata bahasa itu dalam konteks yang diberikan, lalu nilai diri Anda mudah atau sulit dan simpan.',
      'Với mỗi thẻ, viết một câu tiếng Hàn dùng điểm ngữ pháp trong ngữ cảnh cho sẵn, rồi tự đánh giá dễ hay khó và lưu lại.',
      'カードごとに、与えられた文脈で文法を使った韓国語の文を書き、やさしい／むずかしいで自己評価して保存する。',
    ),
    L(
      'Your ratings feed spaced repetition: each grammar grows in your garden and comes back to review right when you need it.',
      'Tus calificaciones alimentan la repetición espaciada: cada gramática crece en tu jardín y vuelve para repasar justo cuando lo necesitas.',
      'Vos évaluations nourrissent la répétition espacée : chaque grammaire grandit dans votre jardin et revient en révision juste quand il le faut.',
      'Suas avaliações alimentam a repetição espaçada: cada gramática cresce no seu jardim e volta para revisão exatamente quando você precisa.',
      'คะแนนของคุณป้อนให้ระบบทบทวนแบบเว้นช่วง ไวยากรณ์แต่ละจุดเติบโตในสวนและกลับมาให้ทบทวนพอดีตอนที่คุณต้องการ',
      'Penilaian Anda menggerakkan pengulangan berjarak: tiap tata bahasa tumbuh di taman dan kembali untuk diulas tepat saat Anda membutuhkannya.',
      'Đánh giá của bạn nuôi lặp lại ngắt quãng: mỗi điểm ngữ pháp lớn lên trong vườn và quay lại để ôn đúng lúc bạn cần.',
      'あなたの評価が間隔反復に反映される：各文法は庭で育ち、ちょうど必要なときに復習として戻ってくる。',
    ),
  ],
  tip: L(
    'The sentence you write must be in Korean (Hangul) — that\'s the whole point: producing the grammar yourself, not just recognizing it. Rate "hard" honestly; the SRS only brings a form back sooner if you admit it was shaky.',
    'La frase que escribes debe estar en coreano (hangul): de eso se trata, producir la gramática tú mismo, no solo reconocerla. Califica "difícil" con honestidad; la repetición espaciada solo trae la forma antes si admites que dudaste.',
    'La phrase que vous écrivez doit être en coréen (hangeul) : c\'est tout l\'enjeu — produire la grammaire soi-même, pas seulement la reconnaître. Évaluez « difficile » honnêtement ; la répétition espacée ne ramène la forme plus tôt que si vous admettez avoir hésité.',
    'A frase que você escreve deve estar em coreano (hangul): é justamente isso — produzir a gramática você mesmo, não só reconhecê-la. Avalie "difícil" com honestidade; a repetição espaçada só traz a forma de volta mais cedo se você admitir que ficou inseguro.',
    'ประโยคที่คุณเขียนต้องเป็นภาษาเกาหลี (ฮันกึล) นั่นคือจุดสำคัญ คือการสร้างไวยากรณ์ด้วยตนเอง ไม่ใช่แค่จำได้ ให้คะแนน "ยาก" อย่างซื่อสัตย์ เพราะระบบจะนำรูปนั้นกลับมาเร็วขึ้นก็ต่อเมื่อคุณยอมรับว่ายังไม่มั่นใจ',
    'Kalimat yang Anda tulis harus dalam bahasa Korea (Hangul) — itulah intinya: menghasilkan tata bahasa sendiri, bukan sekadar mengenalinya. Nilai "sulit" dengan jujur; pengulangan berjarak hanya menghadirkan bentuk itu lebih cepat jika Anda mengaku ragu.',
    'Câu bạn viết phải bằng tiếng Hàn (Hangul) — đó chính là cốt lõi: tự tạo ra điểm ngữ pháp, không chỉ nhận ra nó. Hãy đánh giá "khó" một cách trung thực; lặp lại ngắt quãng chỉ đưa dạng đó quay lại sớm hơn nếu bạn thừa nhận mình còn lúng túng.',
    '書く文は韓国語（ハングル）でなければならない。これこそが肝心で、ただ見分けるのではなく、自分で文法を作り出すこと。「むずかしい」は正直に評価する。あいまいだったと認めて初めて、SRSはその形を早めに戻してくれる。',
  ),
}

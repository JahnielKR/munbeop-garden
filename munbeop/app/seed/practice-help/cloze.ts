import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 빈칸 연습 (cloze / fill-in-the-blank) — explanation for the cloze recognition lab.
 * Korean example sentences are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const CLOZE_HELP: PracticeHelpContent = {
  ko: '빈칸 연습',
  romanization: 'binkan yeonseup',
  subtitle: L(
    'fill-in-the-blank recognition',
    'reconocimiento por huecos (rellenar el espacio)',
    'reconnaissance à trous (compléter le blanc)',
    'reconhecimento por lacunas (preencher o espaço)',
    'การจำแบบเติมคำในช่องว่าง',
    'pengenalan isian rumpang (mengisi bagian kosong)',
    'nhận diện qua điền vào chỗ trống',
    '空所補充による認識練習',
  ),
  concept: L(
    "A Korean sentence is shown with one blank, and you pick the grammar form or ending that fills it correctly from a few choices. This is recognition, not production: you only have to notice which form fits, not build it from scratch. Recognizing a pattern in context is the natural first step — once you can reliably spot the right ending among look-alikes, producing it yourself becomes much easier.",
    'Se muestra una frase coreana con un hueco, y eliges entre varias opciones la forma gramatical o terminación que lo completa correctamente. Esto es reconocimiento, no producción: solo tienes que notar qué forma encaja, no construirla desde cero. Reconocer un patrón en contexto es el primer paso natural — cuando ya detectas con seguridad la terminación correcta entre formas parecidas, producirla tú mismo se vuelve mucho más fácil.',
    "Une phrase coréenne est affichée avec un blanc, et vous choisissez parmi quelques options la forme grammaticale ou la terminaison qui le complète correctement. C'est de la reconnaissance, pas de la production : il suffit de repérer la forme qui convient, sans la construire de zéro. Reconnaître un schéma en contexte est la première étape naturelle — une fois que vous repérez avec assurance la bonne terminaison parmi des formes proches, la produire vous-même devient bien plus facile.",
    'Uma frase coreana é mostrada com uma lacuna, e você escolhe entre algumas opções a forma gramatical ou terminação que a completa corretamente. Isto é reconhecimento, não produção: você só precisa perceber qual forma encaixa, não construí-la do zero. Reconhecer um padrão no contexto é o primeiro passo natural — quando já identifica com segurança a terminação certa entre formas parecidas, produzi-la por conta própria fica bem mais fácil.',
    'แสดงประโยคภาษาเกาหลีที่มีช่องว่างหนึ่งช่อง แล้วคุณเลือกรูปไวยากรณ์หรือท้ายคำที่เติมได้ถูกต้องจากตัวเลือกไม่กี่ตัว นี่คือการ "จำ" ไม่ใช่การ "สร้าง" คุณเพียงสังเกตว่ารูปไหนเข้ากับช่องว่าง ไม่ต้องประกอบขึ้นเองตั้งแต่ต้น การจำรูปแบบในบริบทคือก้าวแรกตามธรรมชาติ เมื่อคุณชี้ท้ายคำที่ถูกต้องท่ามกลางรูปที่คล้ายกันได้อย่างมั่นใจ การสร้างมันเองก็จะง่ายขึ้นมาก',
    'Sebuah kalimat Korea ditampilkan dengan satu bagian rumpang, lalu Anda memilih bentuk tata bahasa atau akhiran yang mengisinya dengan benar dari beberapa pilihan. Ini pengenalan, bukan produksi: Anda hanya perlu mengenali bentuk mana yang cocok, bukan menyusunnya dari nol. Mengenali pola dalam konteks adalah langkah pertama yang wajar — begitu Anda bisa menandai akhiran yang tepat di antara bentuk yang mirip, memproduksinya sendiri jadi jauh lebih mudah.',
    'Một câu tiếng Hàn được hiển thị với một chỗ trống, và bạn chọn dạng ngữ pháp hoặc đuôi câu điền đúng vào đó trong vài lựa chọn. Đây là nhận diện, không phải tạo lập: bạn chỉ cần nhận ra dạng nào phù hợp, không phải tự dựng từ đầu. Nhận ra một mẫu trong ngữ cảnh là bước đầu tự nhiên — một khi bạn chắc chắn chỉ ra được đuôi đúng giữa những dạng na ná nhau, tự bạn tạo ra nó sẽ dễ hơn nhiều.',
    '韓国語の文が空所一つとともに表示され、いくつかの選択肢の中から、その空所を正しく埋める文法形や語尾を選ぶ。これは産出ではなく認識：どの形が合うかに気づけばよく、ゼロから組み立てる必要はない。文脈の中でパターンを見分けることが自然な第一歩で、似た語尾の中から正しいものを確実に見抜けるようになれば、自分で作るのもずっと楽になる。',
  ),
  howToPlay: [
    L(
      'Pick a deck (a TOPIK level or a custom deck) to choose which grammar set you practice.',
      'Elige un mazo (un nivel TOPIK o un mazo personalizado) para escoger qué set de gramática practicas.',
      'Choisissez un paquet (un niveau TOPIK ou un paquet personnalisé) pour décider quel ensemble de grammaire vous travaillez.',
      'Escolha um baralho (um nível TOPIK ou um baralho personalizado) para decidir qual conjunto de gramática você pratica.',
      'เลือกชุดไพ่ (ระดับ TOPIK หรือชุดที่สร้างเอง) เพื่อกำหนดว่าจะฝึกชุดไวยากรณ์ใด',
      'Pilih dek (sebuah level TOPIK atau dek kustom) untuk menentukan set tata bahasa yang Anda latih.',
      'Chọn một bộ thẻ (một cấp độ TOPIK hoặc bộ tự tạo) để quyết định nhóm ngữ pháp bạn luyện.',
      'デッキ（TOPIK のレベル、またはカスタムデッキ）を選び、練習する文法セットを決める。',
    ),
    L(
      'Read the sentence with the blank, then tap the option that correctly fills it.',
      'Lee la frase con el hueco y luego toca la opción que lo completa correctamente.',
      'Lisez la phrase à trou, puis touchez l\'option qui le complète correctement.',
      'Leia a frase com a lacuna e toque na opção que a completa corretamente.',
      'อ่านประโยคที่มีช่องว่าง แล้วแตะตัวเลือกที่เติมได้ถูกต้อง',
      'Baca kalimat dengan bagian rumpang, lalu ketuk pilihan yang mengisinya dengan benar.',
      'Đọc câu có chỗ trống, rồi chạm vào lựa chọn điền đúng vào đó.',
      '空所のある文を読み、それを正しく埋める選択肢をタップする。',
    ),
    L(
      'After you answer, the blank fills with the correct form and a short note explains why; press → for the next sentence.',
      'Tras responder, el hueco se rellena con la forma correcta y una nota breve explica por qué; pulsa → para la siguiente frase.',
      'Après votre réponse, le blanc se remplit de la forme correcte et une courte note explique pourquoi ; appuyez sur → pour la phrase suivante.',
      'Depois de responder, a lacuna é preenchida com a forma correta e uma nota breve explica por quê; pressione → para a próxima frase.',
      'หลังตอบ ช่องว่างจะถูกเติมด้วยรูปที่ถูกต้องพร้อมคำอธิบายสั้น ๆ ว่าทำไม กด → เพื่อไปประโยคถัดไป',
      'Setelah menjawab, bagian rumpang terisi dengan bentuk yang benar dan catatan singkat menjelaskan alasannya; tekan → untuk kalimat berikutnya.',
      'Sau khi trả lời, chỗ trống được điền bằng dạng đúng và một ghi chú ngắn giải thích lý do; nhấn → để sang câu tiếp theo.',
      '回答後、空所が正しい形で埋まり、短い解説が理由を示す。→ を押すと次の文へ進む。',
    ),
    L(
      'At the end you get a score; mostly-correct grammar grows your mastery, and you can replay just the ones you missed.',
      'Al final obtienes una puntuación; la gramática que aciertas en su mayoría sube tu maestría, y puedes repetir solo las que fallaste.',
      'À la fin, vous obtenez un score ; la grammaire majoritairement réussie fait grandir votre maîtrise, et vous pouvez rejouer seulement celles que vous avez ratées.',
      'No fim você recebe uma pontuação; a gramática que acerta na maioria aumenta seu domínio, e você pode repetir só as que errou.',
      'ตอนจบจะได้คะแนน ไวยากรณ์ที่ตอบถูกเป็นส่วนใหญ่จะเพิ่มความเชี่ยวชาญ และคุณเล่นซ้ำเฉพาะข้อที่พลาดได้',
      'Di akhir Anda mendapat skor; tata bahasa yang sebagian besar benar menumbuhkan penguasaan Anda, dan Anda bisa mengulang hanya yang meleset.',
      'Cuối phiên bạn nhận điểm; ngữ pháp trả lời đúng phần lớn sẽ tăng độ thành thạo, và bạn có thể chơi lại riêng những câu đã sai.',
      '最後にスコアが出る。ほぼ正解できた文法は習熟度が上がり、間違えた分だけをやり直すこともできる。',
    ),
  ],
  tip: L(
    "Don't just eyeball the blank — read the words around it. The right ending is decided by what comes before (the verb stem, a batchim) and after (the next clause), so the cues that separate look-alike options are almost always in the surrounding context.",
    'No mires solo el hueco — lee las palabras a su alrededor. La terminación correcta la deciden lo que viene antes (la raíz del verbo, un batchim) y lo que viene después (la siguiente cláusula), así que las pistas que distinguen las opciones parecidas casi siempre están en el contexto.',
    "Ne regardez pas seulement le blanc — lisez les mots autour. La bonne terminaison est déterminée par ce qui précède (le radical du verbe, un batchim) et ce qui suit (la proposition suivante) ; les indices qui distinguent les options proches sont presque toujours dans le contexte.",
    'Não olhe só para a lacuna — leia as palavras ao redor. A terminação certa é decidida pelo que vem antes (a raiz do verbo, um batchim) e pelo que vem depois (a próxima oração), então as pistas que separam as opções parecidas quase sempre estão no contexto.',
    'อย่ามองแค่ช่องว่าง ให้อ่านคำรอบ ๆ ด้วย ท้ายคำที่ถูกต้องถูกกำหนดโดยสิ่งที่อยู่ข้างหน้า (รากคำกริยา ตัวสะกดพัชชิม) และข้างหลัง (อนุประโยคถัดไป) เบาะแสที่แยกตัวเลือกที่คล้ายกันจึงมักอยู่ในบริบทรอบ ๆ เสมอ',
    'Jangan hanya menatap bagian rumpang — baca kata-kata di sekitarnya. Akhiran yang benar ditentukan oleh yang mendahului (akar verba, batchim) dan yang mengikuti (klausa berikutnya), jadi petunjuk yang membedakan pilihan mirip hampir selalu ada di konteksnya.',
    'Đừng chỉ nhìn chỗ trống — hãy đọc các từ xung quanh. Đuôi đúng được quyết định bởi phần trước (gốc động từ, batchim) và phần sau (mệnh đề kế tiếp), nên manh mối để phân biệt các lựa chọn na ná nhau gần như luôn nằm trong ngữ cảnh.',
    '空所だけを見ず、その前後の語を読むこと。正しい語尾は前（動詞の語幹・パッチム）と後（次の節）で決まるので、似た選択肢を見分ける手がかりはほぼ必ず周囲の文脈にある。',
  ),
}

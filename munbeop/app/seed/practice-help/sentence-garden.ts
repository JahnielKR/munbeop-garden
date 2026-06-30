import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 문장 정원 (Sentence Garden) — explanation for the sentence-building card mode.
 * Prose localized via L(); native review (owner's wife) pending on the 8 translations.
 */
export const SENTENCE_GARDEN_HELP: PracticeHelpContent = {
  ko: '문장 정원',
  romanization: 'munjang jeongwon',
  subtitle: L(
    'the sentence-building garden',
    'el jardín de armar frases',
    'le jardin de construction de phrases',
    'o jardim de montar frases',
    'สวนประกอบประโยค',
    'taman menyusun kalimat',
    'khu vườn ghép câu',
    '文を組み立てる庭',
  ),
  concept: L(
    "Rebuild a real Korean sentence from its shuffled word (eojeol) cards. Korean is verb-final (SOV) and each particle sticks to the word before it, so the order matters. One card is a decoy that doesn't belong — there are always more cards than slots.",
    'Reconstruye una frase coreana real con sus cartas-palabra (eojeol) barajadas. El coreano pone el verbo al final (SOV) y cada partícula se pega a la palabra anterior, así que el orden importa. Una carta es un cebo que no va — siempre hay más cartas que huecos.',
    "Reconstruis une vraie phrase coréenne à partir de ses cartes-mots (eojeol) mélangées. Le coréen place le verbe à la fin (SOV) et chaque particule colle au mot précédent, donc l'ordre compte. Une carte est un leurre qui n'a pas sa place — il y a toujours plus de cartes que de cases.",
    'Reconstrua uma frase coreana real com suas cartas-palavra (eojeol) embaralhadas. O coreano põe o verbo no fim (SOV) e cada partícula gruda na palavra anterior, então a ordem importa. Uma carta é um chamariz que não entra — sempre há mais cartas que espaços.',
    'ประกอบประโยคภาษาเกาหลีจริงขึ้นใหม่จากการ์ดคำ (eojeol) ที่สับไว้ ภาษาเกาหลีวางกริยาไว้ท้าย (SOV) และอนุภาคติดกับคำข้างหน้า ลำดับจึงสำคัญ มีการ์ดหลอกหนึ่งใบที่ไม่เข้า—การ์ดมีมากกว่าช่องเสมอ',
    'Susun ulang kalimat Korea asli dari kartu-kata (eojeol) yang diacak. Bahasa Korea menaruh verba di akhir (SOV) dan tiap partikel menempel pada kata sebelumnya, jadi urutan penting. Satu kartu adalah umpan yang tidak masuk — kartu selalu lebih banyak dari slot.',
    'Ghép lại một câu tiếng Hàn thật từ các thẻ-từ (eojeol) đã xáo trộn. Tiếng Hàn đặt động từ ở cuối (SOV) và mỗi tiểu từ dính vào từ phía trước, nên thứ tự rất quan trọng. Một thẻ là mồi nhử không thuộc về câu — luôn có nhiều thẻ hơn ô.',
    'シャッフルされた語（eojeol）のカードから本物の韓国語の文を組み立てる。韓国語は動詞が最後（SOV）で、助詞は前の語にくっつくので語順が大切。1枚はどこにも入らないダミー——カードは常にマスより多い。',
  ),
  howToPlay: [
    L(
      'Pick a deck and read the target meaning shown above the bed.',
      'Elige un mazo y lee el significado objetivo que aparece sobre el cantero.',
      'Choisis un deck et lis le sens visé affiché au-dessus du parterre.',
      'Escolha um baralho e leia o significado-alvo mostrado acima do canteiro.',
      'เลือกชุดการ์ดแล้วอ่านความหมายเป้าหมายที่อยู่เหนือแปลง',
      'Pilih dek lalu baca makna target di atas bedeng.',
      'Chọn một bộ thẻ và đọc nghĩa mục tiêu hiện phía trên luống.',
      'デッキを選び、苗床の上に出る目標の意味を読む。',
    ),
    L(
      'Tap the word-cards into the bed in the correct order; tap a placed card to take it back.',
      'Toca las cartas-palabra en el orden correcto; toca una carta colocada para devolverla.',
      'Touche les cartes-mots dans le bon ordre ; touche une carte posée pour la reprendre.',
      'Toque as cartas-palavra na ordem certa; toque uma carta colocada para devolvê-la.',
      'แตะการ์ดคำลงในแปลงตามลำดับที่ถูก แตะการ์ดที่วางแล้วเพื่อเอากลับ',
      'Ketuk kartu-kata ke bedeng dalam urutan yang benar; ketuk kartu yang sudah ditaruh untuk mengambilnya kembali.',
      'Chạm các thẻ-từ vào luống theo đúng thứ tự; chạm thẻ đã đặt để lấy lại.',
      '語カードを正しい順に苗床へタップ。置いたカードをタップで戻せる。',
    ),
    L(
      'Check it — get the order right and the sentence is read aloud and the plant grows.',
      'Compruébalo: si aciertas el orden, la frase se lee en voz alta y la planta crece.',
      "Vérifie — si l'ordre est bon, la phrase est lue à voix haute et la plante grandit.",
      'Confira — se acertar a ordem, a frase é lida em voz alta e a planta cresce.',
      'กดตรวจ—ถ้าลำดับถูก ประโยคจะถูกอ่านออกเสียงและต้นไม้จะเติบโต',
      'Periksa — jika urutannya benar, kalimat dibacakan dan tanaman tumbuh.',
      'Kiểm tra — đúng thứ tự thì câu được đọc to và cây lớn lên.',
      'チェックする——順番が合えば文が読み上げられ、苗が育つ。',
    ),
  ],
  tip: L(
    "There's always one card too many — the decoy. If you finish and a real word is left with no slot, you placed the decoy; swap it out.",
    'Siempre sobra una carta: el cebo. Si terminas y una palabra real se queda sin hueco, colocaste el cebo; cámbialo.',
    'Il y a toujours une carte en trop : le leurre. Si à la fin un vrai mot reste sans case, tu as posé le leurre ; remplace-le.',
    'Sempre sobra uma carta: o chamariz. Se terminar e uma palavra real ficar sem espaço, você colocou o chamariz; troque-o.',
    'มีการ์ดเกินมาหนึ่งใบเสมอ คือการ์ดหลอก ถ้าทำเสร็จแล้วมีคำจริงเหลือไม่มีช่อง แสดงว่าคุณวางการ์ดหลอก ให้สลับออก',
    'Selalu ada satu kartu berlebih — umpannya. Kalau selesai dan ada kata asli tanpa slot, kamu menaruh umpan; tukar.',
    'Luôn dư một thẻ — mồi nhử. Nếu xong mà một từ thật không còn ô, bạn đã đặt mồi nhử; hãy đổi.',
    '必ず1枚多い——それがダミー。終えて本物の語が余ったら、ダミーを置いている。入れ替えよう。',
  ),
}

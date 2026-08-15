import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 문장 정원 (Sentence Garden) — explanation for the sentence-building card mode.
 * Prose is localized across all eight supported locales and covered by the
 * practice-help invariants.
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
    "Rebuild a real Korean sentence from its shuffled word (eojeol) cards. Korean is verb-final (SOV) and each particle sticks to the word before it, so the order matters. Many rounds also include one extra decoy card that doesn't belong.",
    'Reconstruye una frase coreana real con sus cartas-palabra (eojeol) barajadas. El coreano pone el verbo al final (SOV) y cada partícula se pega a la palabra anterior, así que el orden importa. Muchas rondas también incluyen una carta-cebo adicional que no pertenece a la frase.',
    "Reconstruis une vraie phrase coréenne à partir de ses cartes-mots (eojeol) mélangées. Le coréen place le verbe à la fin (SOV) et chaque particule colle au mot précédent, donc l'ordre compte. De nombreuses manches comprennent aussi une carte-leurre supplémentaire qui n'appartient pas à la phrase.",
    'Reconstrua uma frase coreana real com suas cartas-palavra (eojeol) embaralhadas. O coreano põe o verbo no fim (SOV) e cada partícula gruda na palavra anterior, então a ordem importa. Muitas rodadas também incluem uma carta chamariz extra que não pertence à frase.',
    'ประกอบประโยคภาษาเกาหลีจริงขึ้นใหม่จากการ์ดคำ (eojeol) ที่สับไว้ ภาษาเกาหลีวางกริยาไว้ท้าย (SOV) และอนุภาคติดกับคำข้างหน้า ลำดับจึงสำคัญ หลายรอบยังมีการ์ดหลอกเกินมาหนึ่งใบซึ่งไม่อยู่ในประโยค',
    'Susun ulang kalimat Korea asli dari kartu-kata (eojeol) yang diacak. Bahasa Korea menaruh verba di akhir (SOV) dan tiap partikel menempel pada kata sebelumnya, jadi urutan penting. Banyak ronde juga menyertakan satu kartu umpan tambahan yang tidak termasuk dalam kalimat.',
    'Ghép lại một câu tiếng Hàn thật từ các thẻ-từ (eojeol) đã xáo trộn. Tiếng Hàn đặt động từ ở cuối (SOV) và mỗi tiểu từ dính vào từ phía trước, nên thứ tự rất quan trọng. Nhiều lượt còn có thêm một thẻ mồi nhử không thuộc về câu.',
    'シャッフルされた語（eojeol）のカードから本物の韓国語の文を組み立てる。韓国語は動詞が最後（SOV）で、助詞は前の語にくっつくので語順が大切。多くのラウンドでは、文に入らないダミーカードが1枚追加される。',
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
    "When a round has one card too many, that extra card is the decoy. If every slot is full and a real word remains, swap the decoy out.",
    'Cuando una ronda tiene una carta de más, esa carta es el cebo. Si llenas todos los huecos y queda una palabra real, cambia el cebo.',
    "Lorsqu'une manche contient une carte en trop, cette carte est le leurre. Si toutes les cases sont remplies et qu'un vrai mot reste, remplace le leurre.",
    'Quando uma rodada tem uma carta a mais, essa carta é o chamariz. Se todos os espaços estiverem cheios e sobrar uma palavra real, troque o chamariz.',
    'เมื่อรอบใดมีการ์ดเกินมาหนึ่งใบ ใบนั้นคือการ์ดหลอก ถ้าเติมครบทุกช่องแล้วยังเหลือคำจริง ให้สลับการ์ดหลอกออก',
    'Jika suatu ronde memiliki satu kartu berlebih, kartu itu adalah umpannya. Kalau semua slot terisi dan masih ada kata asli, tukar kartu umpan.',
    'Khi một lượt có dư một thẻ, đó là thẻ mồi nhử. Nếu mọi ô đã đầy mà vẫn còn một từ thật, hãy đổi thẻ mồi nhử ra.',
    'カードが1枚多いラウンドでは、その余分な1枚がダミー。全マスを埋めても本物の語が残ったら、ダミーと入れ替えよう。',
  ),
}

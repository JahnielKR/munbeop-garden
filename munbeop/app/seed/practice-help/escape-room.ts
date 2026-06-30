import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 방 탈출 (escape room) — explanation for the narrative escape-room mode.
 * No Korean example sentences here (the mode itself is the narrative); prose
 * localized via L(). Native review (owner's wife) pending on the 8 translations.
 */
export const ESCAPE_ROOM_HELP: PracticeHelpContent = {
  ko: '방 탈출',
  romanization: 'bang talchul',
  subtitle: L(
    'the story-driven escape room',
    'la sala de escape con historia',
    "l'escape game avec une histoire",
    'a sala de escape com história',
    'ห้องหนีภัยแบบมีเนื้อเรื่อง',
    'ruang pelarian berbasis cerita',
    'phòng thoát hiểm theo cốt truyện',
    '物語仕立ての脱出ゲーム',
  ),
  concept: L(
    "A story-driven escape room where you advance by understanding and using Korean. Each level is a chain of rooms; in every room you read a scene and must solve a puzzle — choosing or writing the right Korean — to unlock the next. It's grammar and vocabulary lived inside a real story, not a drill.",
    'Una sala de escape con historia donde avanzas entendiendo y usando coreano. Cada nivel es una cadena de salas; en cada sala lees una escena y resuelves un acertijo —eligiendo o escribiendo el coreano correcto— para abrir la siguiente. Es gramática y vocabulario vividos dentro de una historia real, no un ejercicio.',
    "Un escape game avec une histoire où tu progresses en comprenant et en utilisant le coréen. Chaque niveau est une suite de salles ; dans chacune, tu lis une scène et résous une énigme — en choisissant ou en écrivant le bon coréen — pour ouvrir la suivante. De la grammaire et du vocabulaire vécus dans une vraie histoire, pas un exercice.",
    'Uma sala de escape com história onde você avança entendendo e usando coreano. Cada nível é uma sequência de salas; em cada uma você lê uma cena e resolve um enigma — escolhendo ou escrevendo o coreano certo — para abrir a próxima. É gramática e vocabulário vividos dentro de uma história real, não um exercício.',
    'ห้องหนีภัยแบบมีเนื้อเรื่อง ที่คุณจะผ่านไปได้ด้วยการเข้าใจและใช้ภาษาเกาหลี แต่ละด่านเป็นห้องที่ต่อกันเป็นลูกโซ่ ในแต่ละห้องคุณจะอ่านฉากแล้วไขปริศนา—โดยเลือกหรือเขียนภาษาเกาหลีให้ถูก—เพื่อปลดล็อกห้องถัดไป เป็นไวยากรณ์และคำศัพท์ที่ใช้จริงในเรื่องราว ไม่ใช่แบบฝึกหัด',
    'Ruang pelarian berbasis cerita di mana kamu maju dengan memahami dan memakai bahasa Korea. Tiap level adalah rangkaian ruangan; di setiap ruangan kamu membaca adegan lalu memecahkan teka-teki — memilih atau menulis bahasa Korea yang benar — untuk membuka ruangan berikutnya. Tata bahasa dan kosakata yang hidup dalam cerita nyata, bukan latihan.',
    'Phòng thoát hiểm theo cốt truyện, nơi bạn tiến lên bằng cách hiểu và dùng tiếng Hàn. Mỗi cấp là một chuỗi căn phòng; trong mỗi phòng bạn đọc một cảnh và giải câu đố — chọn hoặc viết tiếng Hàn đúng — để mở khóa phòng kế tiếp. Ngữ pháp và từ vựng được sống trong một câu chuyện thật, không phải bài tập.',
    '韓国語を理解し使うことで進む、物語仕立ての脱出ゲーム。各レベルは部屋の連なりで、どの部屋でも場面を読み、正しい韓国語を選ぶか書いて謎を解き、次の部屋を開ける。ドリルではなく、本物の物語の中で生きる文法と語彙。',
  ),
  howToPlay: [
    L(
      'Open a level from the notebook and press Start.',
      'Abre un nivel en la libreta y pulsa Empezar.',
      'Ouvre un niveau dans le carnet et appuie sur Démarrer.',
      'Abra um nível no caderno e toque em Começar.',
      'เปิดด่านจากสมุดแล้วกดเริ่ม',
      'Buka level dari buku catatan lalu tekan Mulai.',
      'Mở một cấp trong sổ tay và nhấn Bắt đầu.',
      'ノートからレベルを開き、スタートを押す。',
    ),
    L(
      'Read the scene, then solve each room by choosing or writing the correct Korean.',
      'Lee la escena y resuelve cada sala eligiendo o escribiendo el coreano correcto.',
      'Lis la scène, puis résous chaque salle en choisissant ou en écrivant le bon coréen.',
      'Leia a cena e resolva cada sala escolhendo ou escrevendo o coreano correto.',
      'อ่านฉาก แล้วไขแต่ละห้องด้วยการเลือกหรือเขียนภาษาเกาหลีให้ถูก',
      'Baca adegan, lalu pecahkan tiap ruangan dengan memilih atau menulis bahasa Korea yang benar.',
      'Đọc cảnh, rồi giải từng phòng bằng cách chọn hoặc viết tiếng Hàn đúng.',
      '場面を読み、正しい韓国語を選ぶか書いて各部屋を解く。',
    ),
    L(
      "Clear every room to escape and reach the level's ending.",
      'Resuelve todas las salas para escapar y llegar al final del nivel.',
      "Termine toutes les salles pour t'évader et atteindre la fin du niveau.",
      'Resolva todas as salas para escapar e chegar ao final do nível.',
      'ไขให้ครบทุกห้องเพื่อหนีออกไปและไปถึงตอนจบของด่าน',
      'Selesaikan semua ruangan untuk kabur dan mencapai akhir cerita level.',
      'Vượt qua mọi phòng để thoát ra và đến cái kết của cấp.',
      'すべての部屋をクリアして脱出し、レベルの結末にたどり着く。',
    ),
  ],
  tip: L(
    'Read the whole scene before answering — the clue is usually hidden in the narration, not just the question.',
    'Lee toda la escena antes de responder: la pista suele estar escondida en la narración, no solo en la pregunta.',
    "Lis toute la scène avant de répondre : l'indice est souvent caché dans la narration, pas seulement dans la question.",
    'Leia a cena inteira antes de responder: a pista costuma estar escondida na narração, não só na pergunta.',
    'อ่านฉากทั้งหมดก่อนตอบ—คำใบ้มักซ่อนอยู่ในเนื้อเรื่อง ไม่ใช่แค่ในคำถาม',
    'Baca seluruh adegan sebelum menjawab — petunjuknya biasanya tersembunyi di narasi, bukan hanya di pertanyaan.',
    'Đọc hết cảnh trước khi trả lời — manh mối thường ẩn trong lời kể, không chỉ ở câu hỏi.',
    '答える前に場面を最後まで読む。ヒントは設問だけでなく、語りの中に隠れていることが多い。',
  ),
}

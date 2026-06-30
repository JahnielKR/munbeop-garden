import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 수 분류사 (counters / classifiers) — explanation for the counters lab.
 * Korean examples are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const COUNTERS_HELP: PracticeHelpContent = {
  ko: '수 분류사',
  romanization: 'su bullyusa',
  subtitle: L(
    'counters and classifiers',
    'contadores y clasificadores',
    'compteurs et classificateurs',
    'contadores e classificadores',
    'คำลักษณนาม (คำบอกหน่วยนับ)',
    'kata penggolong (klasifikator)',
    'lượng từ (phân loại từ)',
    '助数詞（数え方）',
  ),
  concept: L(
    "To count things in Korean you don't just say the number — you say number + a counter that fits the noun (개 for objects, 명 for people, 마리 for animals). The catch: each counter demands a specific number system. Native numbers (하나, 둘, 셋…) go with most everyday counters; Sino-Korean numbers (일, 이, 삼…) go with minutes, money, floors, and ordinals.",
    'Para contar cosas en coreano no basta con decir el número: dices número + un contador que corresponde al sustantivo (개 para objetos, 명 para personas, 마리 para animales). El truco: cada contador exige un sistema numérico concreto. Los números nativos (하나, 둘, 셋…) van con la mayoría de los contadores cotidianos; los sino-coreanos (일, 이, 삼…) van con los minutos, el dinero, los pisos y los ordinales.',
    "Pour compter en coréen, il ne suffit pas de dire le nombre : on dit nombre + un compteur adapté au nom (개 pour les objets, 명 pour les personnes, 마리 pour les animaux). Le piège : chaque compteur impose un système de numération précis. Les nombres natifs (하나, 둘, 셋…) accompagnent la plupart des compteurs du quotidien ; les nombres sino-coréens (일, 이, 삼…) vont avec les minutes, l'argent, les étages et les ordinaux.",
    'Para contar coisas em coreano não basta dizer o número: você diz número + um contador que combina com o substantivo (개 para objetos, 명 para pessoas, 마리 para animais). O detalhe: cada contador exige um sistema numérico específico. Os números nativos (하나, 둘, 셋…) vão com a maioria dos contadores do dia a dia; os sino-coreanos (일, 이, 삼…) vão com minutos, dinheiro, andares e ordinais.',
    'การนับสิ่งของในภาษาเกาหลีไม่ได้พูดแค่ตัวเลข แต่พูดเป็น ตัวเลข + คำลักษณนาม ที่เข้ากับคำนาม (개 สำหรับสิ่งของ, 명 สำหรับคน, 마리 สำหรับสัตว์) จุดสำคัญคือคำลักษณนามแต่ละตัวเรียกร้องระบบตัวเลขเฉพาะ เลขเกาหลีแท้ (하나, 둘, 셋…) ใช้กับคำลักษณนามในชีวิตประจำวันส่วนใหญ่ ส่วนเลขจีน-เกาหลี (일, 이, 삼…) ใช้กับนาที เงิน ชั้น และลำดับที่',
    'Untuk menghitung benda dalam bahasa Korea, Anda tidak sekadar menyebut angka — Anda menyebut angka + kata penggolong yang cocok dengan nomina (개 untuk benda, 명 untuk orang, 마리 untuk hewan). Kuncinya: setiap penggolong menuntut sistem angka tertentu. Angka asli Korea (하나, 둘, 셋…) dipakai dengan sebagian besar penggolong sehari-hari; angka Sino-Korea (일, 이, 삼…) dipakai untuk menit, uang, lantai, dan urutan.',
    'Để đếm sự vật trong tiếng Hàn, bạn không chỉ nói con số — bạn nói số + một lượng từ hợp với danh từ (개 cho đồ vật, 명 cho người, 마리 cho động vật). Điểm mấu chốt: mỗi lượng từ đòi hỏi một hệ số đếm riêng. Số thuần Hàn (하나, 둘, 셋…) đi với hầu hết lượng từ thường ngày; số Hán-Hàn (일, 이, 삼…) đi với phút, tiền, tầng và số thứ tự.',
    '韓国語で物を数えるときは、数字を言うだけでなく「数字＋名詞に合った助数詞」で言う（物には 개、人には 명、動物には 마리）。ポイントは、助数詞ごとに使う数体系が決まっていること。固有数詞（하나, 둘, 셋…）は日常の助数詞の多くと、漢字語数詞（일, 이, 삼…）は分・お金・階・順番と組む。',
  ),
  types: [
    {
      ko: '고유어 수 분류사',
      label: L(
        'native-number counters', 'contadores con números nativos', 'compteurs à nombres natifs', 'contadores com números nativos',
        'คำลักษณนามใช้เลขเกาหลีแท้', 'penggolong dengan angka asli', 'lượng từ dùng số thuần Hàn', '固有数詞の助数詞',
      ),
      desc: L(
        'Counters like 개, 명, 마리, 장, 권, 살 take native numbers. Before a counter, 하나·둘·셋·넷 shorten to 한·두·세·네, and 스물 becomes 스무 (스무 살).',
        'Contadores como 개, 명, 마리, 장, 권, 살 usan números nativos. Ante un contador, 하나·둘·셋·넷 se acortan a 한·두·세·네, y 스물 pasa a 스무 (스무 살).',
        'Les compteurs comme 개, 명, 마리, 장, 권, 살 prennent les nombres natifs. Devant un compteur, 하나·둘·셋·넷 se réduisent en 한·두·세·네, et 스물 devient 스무 (스무 살).',
        'Contadores como 개, 명, 마리, 장, 권, 살 usam números nativos. Antes de um contador, 하나·둘·셋·넷 reduzem para 한·두·세·네, e 스물 vira 스무 (스무 살).',
        'คำลักษณนามอย่าง 개, 명, 마리, 장, 권, 살 ใช้เลขเกาหลีแท้ เมื่ออยู่หน้าคำลักษณนาม 하나·둘·셋·넷 จะย่อเป็น 한·두·세·네 และ 스물 กลายเป็น 스무 (스무 살)',
        'Penggolong seperti 개, 명, 마리, 장, 권, 살 memakai angka asli. Sebelum penggolong, 하나·둘·셋·넷 disingkat menjadi 한·두·세·네, dan 스물 menjadi 스무 (스무 살).',
        'Các lượng từ như 개, 명, 마리, 장, 권, 살 dùng số thuần Hàn. Đứng trước lượng từ, 하나·둘·셋·넷 rút thành 한·두·세·네, và 스물 thành 스무 (스무 살).',
        '개, 명, 마리, 장, 권, 살 などの助数詞は固有数詞を取る。助数詞の前で 하나·둘·셋·넷 は 한·두·세·네 に縮まり、스물 は 스무 になる（스무 살）。',
      ),
      example: '책 세 권, 학생 네 명',
      gloss: L(
        'three books, four students', 'tres libros, cuatro estudiantes',
        'trois livres, quatre élèves', 'três livros, quatro estudantes',
        'หนังสือ 3 เล่ม, นักเรียน 4 คน', 'tiga buku, empat siswa',
        'ba quyển sách, bốn học sinh', '本3冊、学生4名',
      ),
    },
    {
      ko: '한자어 수 분류사',
      label: L(
        'Sino-number counters', 'contadores con números sino-coreanos', 'compteurs à nombres sino-coréens', 'contadores com números sino-coreanos',
        'คำลักษณนามใช้เลขจีน-เกาหลี', 'penggolong dengan angka Sino-Korea', 'lượng từ dùng số Hán-Hàn', '漢字語数詞の助数詞',
      ),
      desc: L(
        'Counters like 분 (minutes), 원 (won), 층 (floor), 인분 (portions) and ordinal 번 take Sino-Korean numbers — 일, 이, 삼, 사… — with no prenominal shortening.',
        'Contadores como 분 (minutos), 원 (won), 층 (piso), 인분 (porciones) y el ordinal 번 usan números sino-coreanos —일, 이, 삼, 사…— sin acortamiento ante el nombre.',
        'Les compteurs comme 분 (minutes), 원 (won), 층 (étage), 인분 (portions) et l\'ordinal 번 prennent les nombres sino-coréens — 일, 이, 삼, 사… — sans réduction devant le nom.',
        'Contadores como 분 (minutos), 원 (won), 층 (andar), 인분 (porções) e o ordinal 번 usam números sino-coreanos —일, 이, 삼, 사…— sem encurtamento antes do nome.',
        'คำลักษณนามอย่าง 분 (นาที), 원 (วอน), 층 (ชั้น), 인분 (ที่/ส่วน) และ 번 แบบลำดับที่ ใช้เลขจีน-เกาหลี — 일, 이, 삼, 사… — โดยไม่ย่อรูปหน้าคำนาม',
        'Penggolong seperti 분 (menit), 원 (won), 층 (lantai), 인분 (porsi) dan 번 ordinal memakai angka Sino-Korea — 일, 이, 삼, 사… — tanpa penyingkatan sebelum nomina.',
        'Các lượng từ như 분 (phút), 원 (won), 층 (tầng), 인분 (phần) và 번 thứ tự dùng số Hán-Hàn — 일, 이, 삼, 사… — không rút gọn trước danh từ.',
        '분（分）、원（ウォン）、층（階）、인분（人前）や順番の 번 などの助数詞は漢字語数詞（일, 이, 삼, 사…）を取り、名詞前での縮約はない。',
      ),
      example: '오 층, 삼십 분, 오십 원',
      gloss: L(
        'fifth floor, thirty minutes, fifty won', 'quinto piso, treinta minutos, cincuenta wones',
        'cinquième étage, trente minutes, cinquante wons', 'quinto andar, trinta minutos, cinquenta wons',
        'ชั้น 5, 30 นาที, 50 วอน', 'lantai 5, tiga puluh menit, lima puluh won',
        'tầng 5, ba mươi phút, năm mươi won', '5階、30分、50ウォン',
      ),
    },
  ],
  howToPlay: [
    L(
      'Pick a counter set (개·명·마리, time, money…) to start a round.',
      'Elige un conjunto de contadores (개·명·마리, hora, dinero…) para empezar una ronda.',
      'Choisissez un jeu de compteurs (개·명·마리, heure, argent…) pour lancer une manche.',
      'Escolha um conjunto de contadores (개·명·마리, hora, dinheiro…) para começar uma rodada.',
      'เลือกชุดคำลักษณนาม (개·명·마리, เวลา, เงิน…) เพื่อเริ่มรอบหนึ่ง',
      'Pilih satu set penggolong (개·명·마리, waktu, uang…) untuk memulai ronde.',
      'Chọn một bộ lượng từ (개·명·마리, thời gian, tiền…) để bắt đầu một vòng.',
      '助数詞のセット（개·명·마리、時間、お金…）を選んでラウンドを始める。',
    ),
    L(
      'A card shows a noun + a quantity (e.g. 책 × 3). Pick the option that reads the count correctly (세 권).',
      'Una carta muestra un sustantivo + una cantidad (p. ej. 책 × 3). Elige la opción que lee la cuenta correctamente (세 권).',
      'Une carte affiche un nom + une quantité (ex. 책 × 3). Choisissez l\'option qui lit le compte correctement (세 권).',
      'Um cartão mostra um substantivo + uma quantidade (ex. 책 × 3). Escolha a opção que lê a contagem corretamente (세 권).',
      'การ์ดจะแสดง คำนาม + จำนวน (เช่น 책 × 3) เลือกตัวเลือกที่อ่านจำนวนได้ถูกต้อง (세 권)',
      'Sebuah kartu menampilkan nomina + kuantitas (mis. 책 × 3). Pilih opsi yang membaca hitungan dengan benar (세 권).',
      'Một thẻ hiển thị danh từ + số lượng (vd. 책 × 3). Chọn phương án đọc đúng cách đếm (세 권).',
      'カードに「名詞＋数量」（例：책 × 3）が出る。正しく読んだ選択肢（세 권）を選ぶ。',
    ),
    L(
      'Right answers build your mastery of that set; missed cards can be replayed at the end.',
      'Las respuestas correctas suben tu maestría de ese conjunto; las cartas falladas se pueden repetir al final.',
      'Les bonnes réponses font grandir votre maîtrise du jeu ; les cartes ratées peuvent être rejouées à la fin.',
      'Acertos aumentam seu domínio do conjunto; os cartões errados podem ser repetidos no final.',
      'คำตอบที่ถูกจะเพิ่มความเชี่ยวชาญของชุดนั้น ส่วนการ์ดที่พลาดเล่นซ้ำได้ตอนจบ',
      'Jawaban benar menumbuhkan penguasaan set itu; kartu yang meleset bisa diulang di akhir.',
      'Trả lời đúng giúp tăng độ thành thạo của bộ đó; các thẻ sai có thể chơi lại ở cuối.',
      '正解でそのセットの習熟度が上がる。間違えたカードは最後に再挑戦できる。',
    ),
  ],
  tip: L(
    "Two counters live a double life: 분 means 'minutes' with Sino numbers (삼 분) but 'person (hon.)' with native (세 분); 번 means 'times' with native (세 번) but 'number/ordinal' with Sino (삼 번). Let the meaning pick the number system.",
    "Dos contadores tienen doble vida: 분 significa 'minutos' con números sino (삼 분) pero 'persona (hon.)' con nativos (세 분); 번 es 'veces' con nativos (세 번) pero 'número/ordinal' con sino (삼 번). Deja que el significado elija el sistema numérico.",
    "Deux compteurs ont une double vie : 분 signifie « minutes » avec les nombres sino (삼 분) mais « personne (hon.) » avec les natifs (세 분) ; 번 veut dire « fois » avec les natifs (세 번) mais « numéro/ordinal » avec les sino (삼 번). Laissez le sens choisir le système numérique.",
    "Dois contadores têm vida dupla: 분 significa 'minutos' com números sino (삼 분) mas 'pessoa (hon.)' com nativos (세 분); 번 é 'vezes' com nativos (세 번) mas 'número/ordinal' com sino (삼 번). Deixe o sentido escolher o sistema numérico.",
    "คำลักษณนามสองตัวมีสองชีวิต: 분 แปลว่า 'นาที' กับเลขจีน (삼 분) แต่แปลว่า 'คน (สุภาพ)' กับเลขเกาหลีแท้ (세 분); 번 แปลว่า 'ครั้ง' กับเลขแท้ (세 번) แต่แปลว่า 'หมายเลข/ลำดับที่' กับเลขจีน (삼 번) ให้ความหมายเป็นตัวเลือกระบบตัวเลข",
    "Dua penggolong punya kehidupan ganda: 분 berarti 'menit' dengan angka Sino (삼 분) tetapi 'orang (hormat)' dengan angka asli (세 분); 번 berarti 'kali' dengan angka asli (세 번) tetapi 'nomor/urutan' dengan angka Sino (삼 번). Biarkan maknanya memilih sistem angka.",
    "Hai lượng từ sống hai cuộc đời: 분 nghĩa là 'phút' với số Hán-Hàn (삼 분) nhưng 'người (kính)' với số thuần Hàn (세 분); 번 nghĩa là 'lần' với số thuần Hàn (세 번) nhưng 'số/thứ tự' với số Hán-Hàn (삼 번). Hãy để nghĩa quyết định hệ số đếm.",
    '二つの助数詞は二重生活：분 は漢字語数詞だと「分」（삼 분）、固有数詞だと「名様（人）」（세 분）。번 は固有数詞だと「回」（세 번）、漢字語数詞だと「番（番号・順番）」（삼 번）。意味で数体系を決める。',
  ),
}

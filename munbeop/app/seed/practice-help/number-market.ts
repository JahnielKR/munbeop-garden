import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 숫자 (numbers) — explanation for the Number Market lab.
 * Korean examples/terms are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations + readings.
 */
export const NUMBER_MARKET_HELP: PracticeHelpContent = {
  ko: '숫자',
  romanization: 'sutja',
  subtitle: L(
    'Korean numbers at the market',
    'los números coreanos en el mercado',
    'les nombres coréens au marché',
    'os números coreanos no mercado',
    'ตัวเลขเกาหลีที่ตลาด',
    'angka Korea di pasar',
    'số đếm tiếng Hàn ở chợ',
    '市場で学ぶ韓国語の数',
  ),
  concept: L(
    'Korean runs on two number systems at once. Native Korean numbers (하나·둘·셋…) count things, give age, and tell the hour. Sino-Korean numbers (일·이·삼…) handle prices, minutes, dates, and phone numbers. The hard part is picking the right system — and the right counter — for what you are saying.',
    'El coreano funciona con dos sistemas de números a la vez. Los números nativos coreanos (하나·둘·셋…) cuentan cosas, dan la edad y marcan la hora. Los números sino-coreanos (일·이·삼…) sirven para precios, minutos, fechas y números de teléfono. Lo difícil es elegir el sistema correcto — y el clasificador correcto — para lo que dices.',
    "Le coréen fonctionne avec deux systèmes de nombres à la fois. Les nombres natifs coréens (하나·둘·셋…) comptent les choses, donnent l'âge et indiquent l'heure. Les nombres sino-coréens (일·이·삼…) servent aux prix, aux minutes, aux dates et aux numéros de téléphone. Le plus dur est de choisir le bon système — et le bon classificateur — pour ce que l'on dit.",
    'O coreano funciona com dois sistemas de números ao mesmo tempo. Os números nativos coreanos (하나·둘·셋…) contam coisas, dão a idade e marcam a hora. Os números sino-coreanos (일·이·삼…) servem para preços, minutos, datas e números de telefone. O difícil é escolher o sistema certo — e o classificador certo — para o que você diz.',
    'ภาษาเกาหลีใช้ระบบตัวเลขสองชุดพร้อมกัน เลขเกาหลีแท้ (하나·둘·셋…) ใช้นับสิ่งของ บอกอายุ และบอกชั่วโมง ส่วนเลขจีน-เกาหลี (일·이·삼…) ใช้กับราคา นาที วันที่ และเบอร์โทรศัพท์ ส่วนที่ยากคือการเลือกระบบให้ถูก — และเลือกลักษณนามให้ถูก — กับสิ่งที่คุณกำลังพูด',
    'Bahasa Korea memakai dua sistem angka sekaligus. Angka asli Korea (하나·둘·셋…) untuk menghitung benda, menyebut usia, dan jam. Angka Sino-Korea (일·이·삼…) untuk harga, menit, tanggal, dan nomor telepon. Bagian sulitnya adalah memilih sistem yang tepat — dan penggolong yang tepat — untuk apa yang Anda ucapkan.',
    'Tiếng Hàn dùng hai hệ số đếm cùng lúc. Số thuần Hàn (하나·둘·셋…) để đếm đồ vật, nói tuổi và chỉ giờ. Số Hán-Hàn (일·이·삼…) dùng cho giá tiền, phút, ngày tháng và số điện thoại. Phần khó là chọn đúng hệ — và đúng đơn vị đếm — cho điều bạn muốn nói.',
    '韓国語は二つの数体系を同時に使う。固有語数詞（하나·둘·셋…）はモノを数え、年齢を言い、「時（じ）」を表す。漢字語数詞（일·이·삼…）は値段・分・日付・電話番号に使う。難しいのは、言いたい内容に合わせて正しい体系と正しい助数詞を選ぶこと。',
  ),
  types: [
    {
      ko: '고유어 수',
      label: L(
        'native Korean numbers', 'números nativos coreanos', 'nombres natifs coréens', 'números nativos coreanos',
        'เลขเกาหลีแท้', 'angka asli Korea', 'số thuần Hàn', '固有語の数',
      ),
      desc: L(
        'Use 하나·둘·셋·넷… to count objects, people, and animals (with a counter), to give your age, and to say the hour. Note the shrinking forms before a counter: 한·두·세·네, and 20 = 스무.',
        'Usa 하나·둘·셋·넷… para contar objetos, personas y animales (con clasificador), para la edad y para la hora. Ojo con las formas que se acortan ante el clasificador: 한·두·세·네, y 20 = 스무.',
        "Utilisez 하나·둘·셋·넷… pour compter objets, personnes et animaux (avec un classificateur), pour l'âge et pour l'heure. Attention aux formes raccourcies devant un classificateur : 한·두·세·네, et 20 = 스무.",
        'Use 하나·둘·셋·넷… para contar objetos, pessoas e animais (com classificador), para a idade e para a hora. Atenção às formas que encurtam antes do classificador: 한·두·세·네, e 20 = 스무.',
        'ใช้ 하나·둘·셋·넷… เพื่อนับสิ่งของ คน และสัตว์ (พร้อมลักษณนาม) บอกอายุ และบอกชั่วโมง ระวังรูปที่หดสั้นเมื่อนำหน้าลักษณนาม: 한·두·세·네 และ 20 = 스무',
        'Gunakan 하나·둘·셋·넷… untuk menghitung benda, orang, dan hewan (dengan penggolong), untuk usia, dan untuk jam. Perhatikan bentuk yang memendek sebelum penggolong: 한·두·세·네, dan 20 = 스무.',
        'Dùng 하나·둘·셋·넷… để đếm đồ vật, người, con vật (kèm đơn vị đếm), nói tuổi và chỉ giờ. Lưu ý dạng rút gọn trước đơn vị đếm: 한·두·세·네, và 20 = 스무.',
        '하나·둘·셋·넷… はモノ・人・動物を数えるとき（助数詞を伴う）、年齢、そして「時」に使う。助数詞の前で縮む形に注意：한·두·세·네、20 = 스무。',
      ),
      example: '사과 세 개, 스무 살.',
      gloss: L(
        'Three apples, twenty years old.', 'Tres manzanas, veinte años.',
        'Trois pommes, vingt ans.', 'Três maçãs, vinte anos.',
        'แอปเปิล 3 ลูก อายุ 20 ปี', 'Tiga apel, umur dua puluh tahun.',
        'Ba quả táo, hai mươi tuổi.', 'りんご三個、二十歳。',
      ),
    },
    {
      ko: '한자어 수',
      label: L(
        'Sino-Korean numbers', 'números sino-coreanos', 'nombres sino-coréens', 'números sino-coreanos',
        'เลขจีน-เกาหลี', 'angka Sino-Korea', 'số Hán-Hàn', '漢字語の数',
      ),
      desc: L(
        'Use 일·이·삼·사… for prices (and 만/억 above 10,000), minutes, dates, phone numbers, and counting in the abstract. The digit 0 is read 공 in phone numbers but 영 in math.',
        'Usa 일·이·삼·사… para precios (y 만/억 a partir de 10.000), minutos, fechas, números de teléfono y contar en abstracto. El dígito 0 se lee 공 en teléfonos pero 영 en matemáticas.',
        "Utilisez 일·이·삼·사… pour les prix (et 만/억 au-delà de 10 000), les minutes, les dates, les numéros de téléphone et le comptage abstrait. Le chiffre 0 se lit 공 dans les numéros de téléphone mais 영 en maths.",
        'Use 일·이·삼·사… para preços (e 만/억 acima de 10.000), minutos, datas, números de telefone e contagem abstrata. O dígito 0 lê-se 공 em telefones, mas 영 em matemática.',
        'ใช้ 일·이·삼·사… กับราคา (และ 만/억 เมื่อเกิน 10,000) นาที วันที่ เบอร์โทรศัพท์ และการนับเชิงนามธรรม เลข 0 อ่านว่า 공 ในเบอร์โทร แต่อ่านว่า 영 ในคณิตศาสตร์',
        'Gunakan 일·이·삼·사… untuk harga (dan 만/억 di atas 10.000), menit, tanggal, nomor telepon, dan hitungan abstrak. Angka 0 dibaca 공 pada nomor telepon, tetapi 영 dalam matematika.',
        'Dùng 일·이·삼·사… cho giá tiền (và 만/억 khi vượt 10.000), phút, ngày tháng, số điện thoại và đếm trừu tượng. Chữ số 0 đọc là 공 trong số điện thoại nhưng là 영 trong toán học.',
        '일·이·삼·사… は値段（1万以上は 만/억）、分、日付、電話番号、抽象的な数え方に使う。数字の 0 は電話番号では 공、数学では 영 と読む。',
      ),
      example: '오천 원, 두 시 삼십 분.',
      gloss: L(
        'Five thousand won, 2:30.', 'Cinco mil wones, las 2:30.',
        '5000 wons, 2h30.', 'Cinco mil wons, 2:30.',
        '5,000 วอน, 2 โมงครึ่ง', 'Lima ribu won, pukul 2:30.',
        'Năm nghìn won, 2 giờ 30 phút.', '五千ウォン、2時30分。',
      ),
    },
  ],
  howToPlay: [
    L(
      'Pick a sub-mode: Learn (build the reading from tiles), Speed / 속도전 (pick the right reading against the clock), or Dictation / 받아쓰기 (listen and type what you hear).',
      'Elige un submodo: Aprender (arma la lectura con fichas), Velocidad / 속도전 (elige la lectura correcta contrarreloj) o Dictado / 받아쓰기 (escucha y escribe lo que oyes).',
      "Choisissez un sous-mode : Apprendre (construire la lecture avec des tuiles), Vitesse / 속도전 (choisir la bonne lecture contre la montre) ou Dictée / 받아쓰기 (écouter et taper ce que l'on entend).",
      'Escolha um submodo: Aprender (montar a leitura com peças), Velocidade / 속도전 (escolher a leitura certa contra o relógio) ou Ditado / 받아쓰기 (ouvir e digitar o que escutar).',
      'เลือกโหมดย่อย: เรียนรู้ (ต่อคำอ่านจากชิ้นส่วน), เร็ว / 속도전 (เลือกคำอ่านที่ถูกต้องแข่งกับเวลา) หรือ เขียนตามคำบอก / 받아쓰기 (ฟังแล้วพิมพ์ตามที่ได้ยิน)',
      'Pilih submode: Belajar (susun bacaan dari ubin), Cepat / 속도전 (pilih bacaan yang benar melawan waktu), atau Dikte / 받아쓰기 (dengarkan lalu ketik yang Anda dengar).',
      'Chọn chế độ phụ: Học (ghép cách đọc từ các ô), Tốc độ / 속도전 (chọn cách đọc đúng khi chạy đua thời gian), hoặc Chính tả / 받아쓰기 (nghe rồi gõ lại điều bạn nghe).',
      'サブモードを選ぶ：ラーン（タイルで読みを組み立てる）、スピード / 속도전（制限時間内に正しい読みを選ぶ）、ディクテーション / 받아쓰기（聞いて聞こえた通りに入力する）。',
    ),
    L(
      'Choose a market stall first: counting, prices, time, dates, or phone numbers — each one drills a different domain.',
      'Elige primero un puesto del mercado: contar, precios, hora, fechas o teléfonos — cada uno entrena un dominio distinto.',
      "Choisissez d'abord un étal du marché : compter, prix, heure, dates ou numéros de téléphone — chacun entraîne un domaine différent.",
      'Escolha primeiro uma banca do mercado: contar, preços, hora, datas ou telefones — cada uma treina um domínio diferente.',
      'เลือกแผงในตลาดก่อน: การนับ ราคา เวลา วันที่ หรือเบอร์โทร — แต่ละแผงฝึกคนละหมวด',
      'Pilih dulu lapak pasar: berhitung, harga, waktu, tanggal, atau nomor telepon — masing-masing melatih domain berbeda.',
      'Trước tiên chọn một quầy chợ: đếm, giá tiền, giờ giấc, ngày tháng hoặc số điện thoại — mỗi quầy luyện một mảng khác nhau.',
      'まず市場の屋台を選ぶ：数える・値段・時刻・日付・電話番号——それぞれ別の領域を練習する。',
    ),
    L(
      'Answer the prompt, then submit. Right answers grow your stall mastery; missed items can be replayed at the end.',
      'Responde el reto y envía. Los aciertos suben tu maestría del puesto; los fallos se pueden repetir al final.',
      "Répondez à la consigne, puis validez. Les bonnes réponses font grandir votre maîtrise de l'étal ; les ratés peuvent être rejoués à la fin.",
      'Responda ao desafio e envie. Os acertos aumentam seu domínio da banca; os erros podem ser repetidos no fim.',
      'ตอบโจทย์แล้วส่งคำตอบ ตอบถูกจะเพิ่มความเชี่ยวชาญของแผงนั้น ส่วนที่พลาดเล่นซ้ำได้ตอนจบ',
      'Jawab perintahnya lalu kirim. Jawaban benar menumbuhkan penguasaan lapak; yang meleset bisa diulang di akhir.',
      'Trả lời yêu cầu rồi gửi. Câu đúng làm tăng độ thành thạo của quầy; câu sai có thể chơi lại ở cuối.',
      '出題に答えて送信する。正解すると屋台の習熟度が上がり、間違えた問題は最後にやり直せる。',
    ),
  ],
  tip: L(
    'Time mixes both systems: 3시 30분 = 세 시 삼십 분 (native hour + Sino minute). And two months break the pattern — 6월 → 유월 (not 육월) and 10월 → 시월 (not 십월).',
    'La hora mezcla los dos sistemas: 3시 30분 = 세 시 삼십 분 (hora nativa + minuto sino). Y dos meses rompen el patrón — 6월 → 유월 (no 육월) y 10월 → 시월 (no 십월).',
    "L'heure mêle les deux systèmes : 3시 30분 = 세 시 삼십 분 (heure native + minute sino). Et deux mois brisent la règle — 6월 → 유월 (et non 육월) et 10월 → 시월 (et non 십월).",
    'A hora mistura os dois sistemas: 3시 30분 = 세 시 삼십 분 (hora nativa + minuto sino). E dois meses quebram o padrão — 6월 → 유월 (não 육월) e 10월 → 시월 (não 십월).',
    'เวลาผสมสองระบบ: 3시 30분 = 세 시 삼십 분 (ชั่วโมงเกาหลีแท้ + นาทีจีน-เกาหลี) และมีสองเดือนที่ผิดแบบแผน — 6월 → 유월 (ไม่ใช่ 육월) และ 10월 → 시월 (ไม่ใช่ 십월)',
    'Waktu mencampur kedua sistem: 3시 30분 = 세 시 삼십 분 (jam asli + menit Sino). Dan dua bulan menyimpang dari pola — 6월 → 유월 (bukan 육월) dan 10월 → 시월 (bukan 십월).',
    'Giờ giấc trộn cả hai hệ: 3시 30분 = 세 시 삼십 분 (giờ thuần Hàn + phút Hán-Hàn). Và hai tháng phá vỡ quy luật — 6월 → 유월 (không phải 육월) và 10월 → 시월 (không phải 십월).',
    '時刻は両方の体系が混ざる：3시 30분 = 세 시 삼십 분（固有語の「時」＋漢字語の「分」）。さらに二つの月は例外——6월 → 유월（육월 ではない）、10월 → 시월（십월 ではない）。',
  ),
}

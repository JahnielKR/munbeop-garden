import type { CountItem } from '~/lib/domain'
import { L } from '~/seed/locale'

/**
 * Extra counter drill items broadening the base set in `items.ts`.
 *
 * Content is drafted and adversarially KO-verified: every `answer` is the
 * standard prenominal-native / Sino reading + the counter's `ko`, recomputed
 * by the number engine in the seed-invariant test, and every `noun` is drawn
 * from its counter's `nounExamples`. Quantities stay in the engine's supported
 * 1..99 range (native uses `nativePrenominal`, Sino uses `sinoNumber`).
 *
 * The owner's wife native review is the final gate before this ships.
 */
export const COUNT_ITEMS_EXTRA: CountItem[] = [
  // 개 (general things)
  { counterId: 'gae', quantity: 8, noun: '책상', system: 'native', answer: '여덟 개', trans: L('eight desks', 'ocho escritorios', 'huit bureaux', 'oito carteiras', 'โต๊ะ 8 ตัว', 'delapan meja', 'tám cái bàn', '机8個') },
  { counterId: 'gae', quantity: 12, noun: '사과', system: 'native', answer: '열두 개', trans: L('twelve apples', 'doce manzanas', 'douze pommes', 'doze maçãs', 'แอปเปิล 12 ผล', 'dua belas apel', 'mười hai quả táo', 'りんご12個') },
  // 명 (people, plain)
  { counterId: 'myeong', quantity: 30, noun: '사람', system: 'native', answer: '서른 명', trans: L('thirty people', 'treinta personas', 'trente personnes', 'trinta pessoas', 'คน 30 คน', 'tiga puluh orang', 'ba mươi người', '30名') },
  { counterId: 'myeong', quantity: 6, noun: '학생', system: 'native', answer: '여섯 명', trans: L('six students', 'seis estudiantes', 'six élèves', 'seis estudantes', 'นักเรียน 6 คน', 'enam siswa', 'sáu học sinh', '学生6名') },
  // 분 (people, honorific)
  { counterId: 'bun-people', quantity: 2, noun: '할머니', system: 'native', answer: '두 분', trans: L('two grandmothers (hon.)', 'dos abuelas (hon.)', 'deux grands-mères (hon.)', 'duas avós (hon.)', 'คุณยาย 2 ท่าน', 'dua nenek (hormat)', 'hai vị bà', 'おばあさま2名様') },
  // 마리 (animals)
  { counterId: 'mari', quantity: 4, noun: '개', system: 'native', answer: '네 마리', trans: L('four dogs', 'cuatro perros', 'quatre chiens', 'quatro cães', 'หมา 4 ตัว', 'empat anjing', 'bốn con chó', '犬4匹') },
  // 권 (books)
  { counterId: 'gwon', quantity: 5, noun: '사전', system: 'native', answer: '다섯 권', trans: L('five dictionaries', 'cinco diccionarios', 'cinq dictionnaires', 'cinco dicionários', 'พจนานุกรม 5 เล่ม', 'lima kamus', 'năm quyển từ điển', '辞書5冊') },
  // 장 (flat sheets)
  { counterId: 'jang', quantity: 11, noun: '표', system: 'native', answer: '열한 장', trans: L('eleven tickets', 'once boletos', 'onze billets', 'onze bilhetes', 'ตั๋ว 11 ใบ', 'sebelas tiket', 'mười một tấm vé', 'チケット11枚') },
  // 잔 (cups/glasses)
  { counterId: 'jan', quantity: 2, noun: '차', system: 'native', answer: '두 잔', trans: L('two cups of tea', 'dos tazas de té', 'deux tasses de thé', 'duas xícaras de chá', 'ชา 2 ถ้วย', 'dua cangkir teh', 'hai tách trà', 'お茶2杯') },
  // 병 (bottles)
  { counterId: 'byeong', quantity: 3, noun: '우유', system: 'native', answer: '세 병', trans: L('three bottles of milk', 'tres botellas de leche', 'trois bouteilles de lait', 'três garrafas de leite', 'นม 3 ขวด', 'tiga botol susu', 'ba chai sữa', '牛乳3本') },
  // 살 (years of age)
  { counterId: 'sal', quantity: 1, noun: '아기', system: 'native', answer: '한 살', trans: L('one year old', 'un año', 'un an', 'um ano', 'อายุ 1 ขวบ', 'satu tahun', 'một tuổi', '1歳') },
  { counterId: 'sal', quantity: 40, noun: '학생', system: 'native', answer: '마흔 살', trans: L('forty years old', 'cuarenta años', 'quarante ans', 'quarenta anos', 'อายุ 40 ปี', 'empat puluh tahun', 'bốn mươi tuổi', '40歳') },
  // 시 (o'clock — native)
  { counterId: 'si', quantity: 6, noun: '저녁', system: 'native', answer: '여섯 시', trans: L('six o’clock', 'las seis', 'six heures', 'seis horas', '6 โมง', 'pukul enam', 'sáu giờ', '6時') },
  // 시간 (hours, duration)
  { counterId: 'sigan', quantity: 5, noun: '운동', system: 'native', answer: '다섯 시간', trans: L('five hours', 'cinco horas', 'cinq heures', 'cinco horas', '5 ชั่วโมง', 'lima jam', 'năm tiếng', '5時間') },
  // 대 (machines/vehicles)
  { counterId: 'dae', quantity: 5, noun: '자전거', system: 'native', answer: '다섯 대', trans: L('five bicycles', 'cinco bicicletas', 'cinq vélos', 'cinco bicicletas', 'จักรยาน 5 คัน', 'lima sepeda', 'năm chiếc xe đạp', '自転車5台') },
  // 켤레 (pairs of footwear)
  { counterId: 'kyeolle', quantity: 3, noun: '구두', system: 'native', answer: '세 켤레', trans: L('three pairs of dress shoes', 'tres pares de zapatos de vestir', 'trois paires de chaussures habillées', 'três pares de sapatos sociais', 'รองเท้าหนัง 3 คู่', 'tiga pasang sepatu pantofel', 'ba đôi giày da', '革靴3足') },
  // 벌 (sets of clothes)
  { counterId: 'beol', quantity: 2, noun: '한복', system: 'native', answer: '두 벌', trans: L('two hanbok', 'dos hanbok', 'deux hanbok', 'dois hanbok', 'ฮันบก 2 ชุด', 'dua setel hanbok', 'hai bộ hanbok', '韓服2着') },
  // 번 (times — native)
  { counterId: 'beon-times', quantity: 5, noun: '경험', system: 'native', answer: '다섯 번', trans: L('five times', 'cinco veces', 'cinq fois', 'cinco vezes', '5 ครั้ง', 'lima kali', 'năm lần', '5回') },
  // 분 (minutes — Sino)
  { counterId: 'bun-minutes', quantity: 15, noun: '시간', system: 'sino', answer: '십오 분', trans: L('fifteen minutes', 'quince minutos', 'quinze minutes', 'quinze minutos', '15 นาที', 'lima belas menit', 'mười lăm phút', '15分') },
  // 원 (won — Sino, 1..99 only)
  { counterId: 'won', quantity: 70, noun: '커피', system: 'sino', answer: '칠십 원', trans: L('seventy won', 'setenta wones', 'soixante-dix wons', 'setenta wons', '70 วอน', 'tujuh puluh won', 'bảy mươi won', '70ウォン') },
  // 번 (ordinal — Sino)
  { counterId: 'beon-ordinal', quantity: 9, noun: '방', system: 'sino', answer: '구 번', trans: L('room number 9', 'habitación número 9', 'chambre numéro 9', 'quarto número 9', 'ห้องหมายเลข 9', 'kamar nomor 9', 'phòng số 9', '9番（部屋）') },
  // 층 (floors — Sino)
  { counterId: 'cheung', quantity: 14, noun: '아파트', system: 'sino', answer: '십사 층', trans: L('fourteenth floor', 'piso catorce', 'quatorzième étage', 'décimo quarto andar', 'ชั้น 14', 'lantai 14', 'tầng 14', '14階') },
  // 인분 (food portions — Sino)
  { counterId: 'inbun', quantity: 4, noun: '냉면', system: 'sino', answer: '사 인분', trans: L('four portions', 'cuatro porciones', 'quatre portions', 'quatro porções', '4 ที่', 'empat porsi', 'bốn phần', '4人前') },
  // 페이지 (pages — Sino)
  { counterId: 'pyeji', quantity: 25, noun: '소설', system: 'sino', answer: '이십오 페이지', trans: L('twenty-five pages', 'veinticinco páginas', 'vingt-cinq pages', 'vinte e cinco páginas', '25 หน้า', 'dua puluh lima halaman', 'hai mươi lăm trang', '25ページ') },
]

import type { CountItem } from '~/lib/domain'
import { L } from '~/seed/locale'

export const COUNT_ITEMS: CountItem[] = [
  // 개
  { counterId: 'gae', quantity: 3, noun: '사과', system: 'native', answer: '세 개', trans: L('three apples', 'tres manzanas', 'trois pommes', 'três maçãs', 'แอปเปิล 3 ผล', 'tiga apel', 'ba quả táo', 'りんご3個') },
  { counterId: 'gae', quantity: 5, noun: '컵', system: 'native', answer: '다섯 개', trans: L('five cups', 'cinco vasos', 'cinq tasses', 'cinco copos', 'ถ้วย 5 ใบ', 'lima cangkir', 'năm cái cốc', 'コップ5個') },
  // 명
  { counterId: 'myeong', quantity: 4, noun: '학생', system: 'native', answer: '네 명', trans: L('four students', 'cuatro estudiantes', 'quatre élèves', 'quatro estudantes', 'นักเรียน 4 คน', 'empat siswa', 'bốn học sinh', '学生4名') },
  { counterId: 'myeong', quantity: 2, noun: '친구', system: 'native', answer: '두 명', trans: L('two friends', 'dos amigos', 'deux amis', 'dois amigos', 'เพื่อน 2 คน', 'dua teman', 'hai người bạn', '友達2名') },
  // 분 (honorific people)
  { counterId: 'bun-people', quantity: 3, noun: '선생님', system: 'native', answer: '세 분', trans: L('three teachers (hon.)', 'tres profesores (hon.)', 'trois professeurs (hon.)', 'três professores (hon.)', 'ครู 3 ท่าน', 'tiga guru (hormat)', 'ba thầy/cô', '先生3名様') },
  { counterId: 'bun-people', quantity: 1, noun: '손님', system: 'native', answer: '한 분', trans: L('one guest (hon.)', 'un invitado (hon.)', 'un invité (hon.)', 'um convidado (hon.)', 'แขก 1 ท่าน', 'satu tamu (hormat)', 'một vị khách', 'お客様1名') },
  // 마리
  { counterId: 'mari', quantity: 2, noun: '고양이', system: 'native', answer: '두 마리', trans: L('two cats', 'dos gatos', 'deux chats', 'dois gatos', 'แมว 2 ตัว', 'dua kucing', 'hai con mèo', '猫2匹') },
  { counterId: 'mari', quantity: 7, noun: '물고기', system: 'native', answer: '일곱 마리', trans: L('seven fish', 'siete peces', 'sept poissons', 'sete peixes', 'ปลา 7 ตัว', 'tujuh ikan', 'bảy con cá', '魚7匹') },
  // 권
  { counterId: 'gwon', quantity: 3, noun: '책', system: 'native', answer: '세 권', trans: L('three books', 'tres libros', 'trois livres', 'três livros', 'หนังสือ 3 เล่ม', 'tiga buku', 'ba quyển sách', '本3冊') },
  { counterId: 'gwon', quantity: 10, noun: '공책', system: 'native', answer: '열 권', trans: L('ten notebooks', 'diez cuadernos', 'dix cahiers', 'dez cadernos', 'สมุด 10 เล่ม', 'sepuluh buku tulis', 'mười quyển vở', 'ノート10冊') },
  // 장
  { counterId: 'jang', quantity: 4, noun: '종이', system: 'native', answer: '네 장', trans: L('four sheets of paper', 'cuatro hojas', 'quatre feuilles', 'quatro folhas', 'กระดาษ 4 แผ่น', 'empat lembar kertas', 'bốn tờ giấy', '紙4枚') },
  { counterId: 'jang', quantity: 2, noun: '사진', system: 'native', answer: '두 장', trans: L('two photos', 'dos fotos', 'deux photos', 'duas fotos', 'รูป 2 ใบ', 'dua foto', 'hai tấm ảnh', '写真2枚') },
  // 잔
  { counterId: 'jan', quantity: 1, noun: '커피', system: 'native', answer: '한 잔', trans: L('one coffee', 'un café', 'un café', 'um café', 'กาแฟ 1 แก้ว', 'satu kopi', 'một ly cà phê', 'コーヒー1杯') },
  { counterId: 'jan', quantity: 3, noun: '물', system: 'native', answer: '세 잔', trans: L('three glasses of water', 'tres vasos de agua', "trois verres d'eau", 'três copos de água', 'น้ำ 3 แก้ว', 'tiga gelas air', 'ba ly nước', '水3杯') },
  // 병
  { counterId: 'byeong', quantity: 2, noun: '맥주', system: 'native', answer: '두 병', trans: L('two bottles of beer', 'dos cervezas', 'deux bières', 'duas cervejas', 'เบียร์ 2 ขวด', 'dua botol bir', 'hai chai bia', 'ビール2本') },
  { counterId: 'byeong', quantity: 6, noun: '물', system: 'native', answer: '여섯 병', trans: L('six bottles of water', 'seis botellas de agua', "six bouteilles d'eau", 'seis garrafas de água', 'น้ำ 6 ขวด', 'enam botol air', 'sáu chai nước', '水6本') },
  // 살
  { counterId: 'sal', quantity: 20, noun: '학생', system: 'native', answer: '스무 살', trans: L('twenty years old', 'veinte años', 'vingt ans', 'vinte anos', 'อายุ 20 ปี', 'dua puluh tahun', 'hai mươi tuổi', '20歳') },
  { counterId: 'sal', quantity: 7, noun: '아이', system: 'native', answer: '일곱 살', trans: L('seven years old', 'siete años', 'sept ans', 'sete anos', 'อายุ 7 ขวบ', 'tujuh tahun', 'bảy tuổi', '7歳') },
  // 시 (o'clock)
  { counterId: 'si', quantity: 3, noun: '오후', system: 'native', answer: '세 시', trans: L('three o’clock', 'las tres', 'trois heures', 'três horas', 'บ่าย 3 โมง', 'pukul tiga', 'ba giờ', '3時') },
  { counterId: 'si', quantity: 9, noun: '아침', system: 'native', answer: '아홉 시', trans: L('nine o’clock', 'las nueve', 'neuf heures', 'nove horas', '9 โมง', 'pukul sembilan', 'chín giờ', '9時') },
  // 시간 (duration)
  { counterId: 'sigan', quantity: 2, noun: '공부', system: 'native', answer: '두 시간', trans: L('two hours', 'dos horas', 'deux heures', 'duas horas', '2 ชั่วโมง', 'dua jam', 'hai tiếng', '2時間') },
  { counterId: 'sigan', quantity: 4, noun: '회의', system: 'native', answer: '네 시간', trans: L('four hours', 'cuatro horas', 'quatre heures', 'quatro horas', '4 ชั่วโมง', 'empat jam', 'bốn tiếng', '4時間') },
  // 대
  { counterId: 'dae', quantity: 2, noun: '자동차', system: 'native', answer: '두 대', trans: L('two cars', 'dos coches', 'deux voitures', 'dois carros', 'รถ 2 คัน', 'dua mobil', 'hai chiếc xe', '車2台') },
  { counterId: 'dae', quantity: 3, noun: '컴퓨터', system: 'native', answer: '세 대', trans: L('three computers', 'tres computadoras', 'trois ordinateurs', 'três computadores', 'คอมพิวเตอร์ 3 เครื่อง', 'tiga komputer', 'ba máy tính', 'パソコン3台') },
  // 켤레
  { counterId: 'kyeolle', quantity: 2, noun: '신발', system: 'native', answer: '두 켤레', trans: L('two pairs of shoes', 'dos pares de zapatos', 'deux paires de chaussures', 'dois pares de sapatos', 'รองเท้า 2 คู่', 'dua pasang sepatu', 'hai đôi giày', '靴2足') },
  { counterId: 'kyeolle', quantity: 4, noun: '양말', system: 'native', answer: '네 켤레', trans: L('four pairs of socks', 'cuatro pares de calcetines', 'quatre paires de chaussettes', 'quatro pares de meias', 'ถุงเท้า 4 คู่', 'empat pasang kaus kaki', 'bốn đôi tất', '靴下4足') },
  // 벌
  { counterId: 'beol', quantity: 3, noun: '옷', system: 'native', answer: '세 벌', trans: L('three sets of clothes', 'tres conjuntos de ropa', 'trois ensembles de vêtements', 'três conjuntos de roupa', 'เสื้อผ้า 3 ชุด', 'tiga setel pakaian', 'ba bộ quần áo', '服3着') },
  { counterId: 'beol', quantity: 1, noun: '정장', system: 'native', answer: '한 벌', trans: L('one suit', 'un traje', 'un costume', 'um terno', 'สูท 1 ชุด', 'satu setelan jas', 'một bộ vest', 'スーツ1着') },
  // 번 (times)
  { counterId: 'beon-times', quantity: 3, noun: '시도', system: 'native', answer: '세 번', trans: L('three times', 'tres veces', 'trois fois', 'três vezes', '3 ครั้ง', 'tiga kali', 'ba lần', '3回') },
  { counterId: 'beon-times', quantity: 2, noun: '여행', system: 'native', answer: '두 번', trans: L('two times', 'dos veces', 'deux fois', 'duas vezes', '2 ครั้ง', 'dua kali', 'hai lần', '2回') },
  // 분 (minutes — SINO)
  { counterId: 'bun-minutes', quantity: 3, noun: '수업', system: 'sino', answer: '삼 분', trans: L('three minutes', 'tres minutos', 'trois minutes', 'três minutos', '3 นาที', 'tiga menit', 'ba phút', '3分') },
  { counterId: 'bun-minutes', quantity: 30, noun: '운동', system: 'sino', answer: '삼십 분', trans: L('thirty minutes', 'treinta minutos', 'trente minutes', 'trinta minutos', '30 นาที', 'tiga puluh menit', 'ba mươi phút', '30分') },
  // 원
  { counterId: 'won', quantity: 50, noun: '사탕', system: 'sino', answer: '오십 원', trans: L('fifty won', 'cincuenta wones', 'cinquante wons', 'cinquenta wons', '50 วอน', 'lima puluh won', 'năm mươi won', '50ウォン') },
  { counterId: 'won', quantity: 99, noun: '거스름돈', system: 'sino', answer: '구십구 원', trans: L('ninety-nine won', 'noventa y nueve wones', 'quatre-vingt-dix-neuf wons', 'noventa e nove wons', '99 วอน', 'sembilan puluh sembilan won', 'chín mươi chín won', '99ウォン') },
  // 번 (ordinal — SINO)
  { counterId: 'beon-ordinal', quantity: 7, noun: '버스', system: 'sino', answer: '칠 번', trans: L('number 7 (bus)', 'número 7 (autobús)', 'numéro 7 (bus)', 'número 7 (ônibus)', 'สาย 7 (รถเมล์)', 'nomor 7 (bus)', 'số 7 (xe buýt)', '7番（バス）') },
  { counterId: 'beon-ordinal', quantity: 3, noun: '문제', system: 'sino', answer: '삼 번', trans: L('number 3 (question)', 'número 3 (pregunta)', 'numéro 3 (question)', 'número 3 (questão)', 'ข้อ 3 (คำถาม)', 'nomor 3 (soal)', 'câu số 3', '3番（問題）') },
  // 층
  { counterId: 'cheung', quantity: 5, noun: '건물', system: 'sino', answer: '오 층', trans: L('fifth floor', 'quinto piso', 'cinquième étage', 'quinto andar', 'ชั้น 5', 'lantai 5', 'tầng 5', '5階') },
  { counterId: 'cheung', quantity: 10, noun: '백화점', system: 'sino', answer: '십 층', trans: L('tenth floor', 'décimo piso', 'dixième étage', 'décimo andar', 'ชั้น 10', 'lantai 10', 'tầng 10', '10階') },
  // 인분
  { counterId: 'inbun', quantity: 2, noun: '갈비', system: 'sino', answer: '이 인분', trans: L('two portions', 'dos porciones', 'deux portions', 'duas porções', '2 ที่', 'dua porsi', 'hai phần', '2人前') },
  { counterId: 'inbun', quantity: 3, noun: '삼겹살', system: 'sino', answer: '삼 인분', trans: L('three portions', 'tres porciones', 'trois portions', 'três porções', '3 ที่', 'tiga porsi', 'ba phần', '3人前') },
  // 페이지
  { counterId: 'pyeji', quantity: 8, noun: '책', system: 'sino', answer: '팔 페이지', trans: L('eight pages', 'ocho páginas', 'huit pages', 'oito páginas', '8 หน้า', 'delapan halaman', 'tám trang', '8ページ') },
  { counterId: 'pyeji', quantity: 12, noun: '보고서', system: 'sino', answer: '십이 페이지', trans: L('twelve pages', 'doce páginas', 'douze pages', 'doze páginas', '12 หน้า', 'dua belas halaman', 'mười hai trang', '12ページ') },
]

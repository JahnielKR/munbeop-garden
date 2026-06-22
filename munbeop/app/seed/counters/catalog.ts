import type { Counter } from '~/lib/domain'
import { L } from '~/seed/locale'

export const COUNTERS: Counter[] = [
  // — Native-counted —
  { id: 'gae', ko: '개', system: 'native', gloss: L('general things', 'cosas en general', 'objets', 'coisas em geral', 'สิ่งของทั่วไป', 'benda umum', 'vật nói chung', '一般の物'), nounExamples: ['사과', '책상', '컵'] },
  { id: 'myeong', ko: '명', system: 'native', gloss: L('people (plain)', 'personas (llano)', 'personnes', 'pessoas', 'คน (ทั่วไป)', 'orang (biasa)', 'người (thường)', '人（普通）'), nounExamples: ['학생', '친구', '사람'] },
  { id: 'bun-people', ko: '분', system: 'native', gloss: L('people (honorific)', 'personas (honorífico)', 'personnes (honorifique)', 'pessoas (honorífico)', 'คน (ยกย่อง)', 'orang (hormat)', 'người (kính ngữ)', '人（敬語）'), nounExamples: ['선생님', '손님', '할머니'] },
  { id: 'mari', ko: '마리', system: 'native', gloss: L('animals', 'animales', 'animaux', 'animais', 'สัตว์', 'hewan', 'con vật', '動物'), nounExamples: ['개', '고양이', '물고기'] },
  { id: 'gwon', ko: '권', system: 'native', gloss: L('books/volumes', 'libros/volúmenes', 'livres', 'livros', 'เล่ม (หนังสือ)', 'buku/jilid', 'quyển sách', '冊'), nounExamples: ['책', '공책', '사전'] },
  { id: 'jang', ko: '장', system: 'native', gloss: L('flat sheets', 'hojas planas', 'feuilles', 'folhas', 'แผ่น', 'lembar', 'tờ', '枚'), nounExamples: ['종이', '표', '사진'] },
  { id: 'jan', ko: '잔', system: 'native', gloss: L('cups/glasses', 'tazas/vasos', 'tasses/verres', 'xícaras/copos', 'แก้ว/ถ้วย', 'cangkir/gelas', 'cốc/ly', '杯'), nounExamples: ['커피', '물', '차'] },
  { id: 'byeong', ko: '병', system: 'native', gloss: L('bottles', 'botellas', 'bouteilles', 'garrafas', 'ขวด', 'botol', 'chai', '本（瓶）'), nounExamples: ['맥주', '물', '우유'] },
  { id: 'sal', ko: '살', system: 'native', gloss: L('years of age', 'años de edad', 'ans (âge)', 'anos de idade', 'ขวบ/ปี (อายุ)', 'tahun (usia)', 'tuổi', '歳'), nounExamples: ['아기', '아이', '학생'] },
  { id: 'si', ko: '시', system: 'native', gloss: L("o'clock", 'en punto', 'heures', 'horas (relógio)', 'นาฬิกา (โมง)', 'pukul', 'giờ (đồng hồ)', '時'), nounExamples: ['아침', '오후', '저녁'] },
  { id: 'sigan', ko: '시간', system: 'native', gloss: L('hours (duration)', 'horas (duración)', 'heures (durée)', 'horas (duração)', 'ชั่วโมง (ระยะเวลา)', 'jam (durasi)', 'tiếng (thời lượng)', '時間'), nounExamples: ['공부', '운동', '회의'] },
  { id: 'dae', ko: '대', system: 'native', gloss: L('machines/vehicles', 'máquinas/vehículos', 'machines/véhicules', 'máquinas/veículos', 'คัน/เครื่อง', 'mesin/kendaraan', 'chiếc (máy/xe)', '台'), nounExamples: ['자동차', '컴퓨터', '자전거'] },
  { id: 'kyeolle', ko: '켤레', system: 'native', gloss: L('pairs (footwear)', 'pares (calzado)', 'paires (chaussures)', 'pares (calçado)', 'คู่ (รองเท้า)', 'pasang (alas kaki)', 'đôi (giày dép)', '足（履物）'), nounExamples: ['신발', '양말', '구두'] },
  { id: 'beol', ko: '벌', system: 'native', gloss: L('suits/sets of clothes', 'trajes/conjuntos', 'ensembles (vêtements)', 'conjuntos de roupa', 'ชุด (เสื้อผ้า)', 'setel (pakaian)', 'bộ (quần áo)', '着（衣服）'), nounExamples: ['옷', '정장', '한복'] },
  { id: 'beon-times', ko: '번', system: 'native', gloss: L('times (frequency)', 'veces', 'fois', 'vezes', 'ครั้ง', 'kali', 'lần', '回'), nounExamples: ['시도', '경험', '여행'] },
  // — Sino-counted —
  { id: 'bun-minutes', ko: '분', system: 'sino', gloss: L('minutes', 'minutos', 'minutes', 'minutos', 'นาที', 'menit', 'phút', '分'), nounExamples: ['시간', '수업', '운동'] },
  { id: 'won', ko: '원', system: 'sino', gloss: L('won (currency)', 'wones', 'wons', 'wons', 'วอน', 'won', 'won', 'ウォン'), nounExamples: ['커피', '책', '밥'] },
  { id: 'beon-ordinal', ko: '번', system: 'sino', gloss: L('number N (ordinal)', 'número N', 'numéro N', 'número N', 'หมายเลข/อันดับ', 'nomor N', 'số N', '番'), nounExamples: ['버스', '문제', '방'] },
  { id: 'cheung', ko: '층', system: 'sino', gloss: L('floors', 'pisos', 'étages', 'andares', 'ชั้น (อาคาร)', 'lantai', 'tầng', '階'), nounExamples: ['건물', '백화점', '아파트'] },
  { id: 'inbun', ko: '인분', system: 'sino', gloss: L('food portions', 'porciones', 'portions', 'porções', 'ที่ (อาหาร)', 'porsi', 'phần ăn', '人前'), nounExamples: ['갈비', '삼겹살', '냉면'] },
  { id: 'pyeji', ko: '페이지', system: 'sino', gloss: L('pages', 'páginas', 'pages', 'páginas', 'หน้า', 'halaman', 'trang', 'ページ'), nounExamples: ['책', '보고서', '소설'] },
]

const BY_ID = new Map(COUNTERS.map((c) => [c.id, c]))
export function counterById(id: string): Counter | undefined {
  return BY_ID.get(id)
}

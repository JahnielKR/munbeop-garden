import type { MarketItem } from '~/lib/domain'
import { L } from '~/seed/locale'

export const MARKET_ITEMS: MarketItem[] = [
  // ── counting (native prenominal + counter) ──
  { id: 'count-apple-3', domain: 'counting', display: '사과 3개', answer: '세 개', tiles: ['세', '개'], lures: ['삼', '셋'], valueKey: '3',
    trans: L('three apples', 'tres manzanas', 'trois pommes', 'três maçãs', 'แอปเปิล 3 ผล', 'tiga apel', 'ba quả táo', 'りんご3個') },
  { id: 'count-cat-2', domain: 'counting', display: '고양이 2마리', answer: '두 마리', tiles: ['두', '마리'], lures: ['이', '둘'], valueKey: '2',
    trans: L('two cats', 'dos gatos', 'deux chats', 'dois gatos', 'แมว 2 ตัว', 'dua kucing', 'hai con mèo', '猫2匹') },
  { id: 'count-student-20', domain: 'counting', display: '학생 20명', answer: '스무 명', tiles: ['스무', '명'], lures: ['이십', '스물'], valueKey: '20',
    trans: L('twenty students', 'veinte estudiantes', 'vingt élèves', 'vinte estudantes', 'นักเรียน 20 คน', 'dua puluh siswa', 'hai mươi học sinh', '学生20名') },

  // ── sino-basics (plain number) ──
  { id: 'sino-100', domain: 'sino-basics', display: '100', answer: '백', tiles: ['백'], lures: ['일백', '십'], valueKey: '100',
    trans: L('one hundred', 'cien', 'cent', 'cem', 'หนึ่งร้อย', 'seratus', 'một trăm', '百') },
  { id: 'sino-16', domain: 'sino-basics', display: '16', answer: '십육', tiles: ['십육'], lures: ['열여섯', '십륙'], valueKey: '16',
    trans: L('sixteen', 'dieciséis', 'seize', 'dezesseis', 'สิบหก', 'enam belas', 'mười sáu', '十六') },
  { id: 'sino-350', domain: 'sino-basics', display: '350', answer: '삼백오십', tiles: ['삼백오십'], lures: ['삼백십오', '세백오십'], valueKey: '350',
    trans: L('three hundred fifty', 'trescientos cincuenta', 'trois cent cinquante', 'trezentos e cinquenta', 'สามร้อยห้าสิบ', 'tiga ratus lima puluh', 'ba trăm năm mươi', '三百五十') },

  // ── time (native hour + Sino minute) ──
  { id: 'time-3-15', domain: 'time', display: '3:15', answer: '세 시 십오 분', tiles: ['세', '시', '십오', '분'], lures: ['삼', '열다섯'], valueKey: '3:15',
    trans: L('3:15', 'las 3:15', '3 h 15', '3:15', '3:15 น.', 'pukul 3:15', '3 giờ 15', '3時15分') },
  { id: 'time-9-05', domain: 'time', display: '9:05', answer: '아홉 시 오 분', tiles: ['아홉', '시', '오', '분'], lures: ['구', '다섯'], valueKey: '9:05',
    trans: L('9:05', 'las 9:05', '9 h 05', '9:05', '9:05 น.', 'pukul 9:05', '9 giờ 05', '9時5分') },
  { id: 'time-12-30', domain: 'time', display: '12:30', answer: '열두 시 삼십 분', tiles: ['열두', '시', '삼십', '분'], lures: ['십이', '서른'], valueKey: '12:30',
    trans: L('12:30', 'las 12:30', '12 h 30', '12:30', '12:30 น.', 'pukul 12:30', '12 giờ 30', '12時30分') },

  // ── money (Sino + 만 grouping) ──
  { id: 'money-1500', domain: 'money', display: '₩1,500', answer: '천오백 원', tiles: ['천오백', '원'], lures: ['일천오백', '천오십'], valueKey: '1500',
    trans: L('1,500 won', '1.500 wones', '1 500 wons', '1.500 wons', '1,500 วอน', '1.500 won', '1.500 won', '1,500ウォン') },
  { id: 'money-12000', domain: 'money', display: '₩12,000', answer: '만 이천 원', tiles: ['만', '이천', '원'], lures: ['십이천', '일만'], valueKey: '12000',
    trans: L('12,000 won', '12.000 wones', '12 000 wons', '12.000 wons', '12,000 วอน', '12.000 won', '12.000 won', '12,000ウォン') },
  { id: 'money-25000', domain: 'money', display: '₩25,000', answer: '이만 오천 원', tiles: ['이만', '오천', '원'], lures: ['이십오천', '이만오백'], valueKey: '25000',
    trans: L('25,000 won', '25.000 wones', '25 000 wons', '25.000 wons', '25,000 วอน', '25.000 won', '25.000 won', '25,000ウォン') },

  // ── dates (Sino, month irregulars) ──
  { id: 'date-6-15', domain: 'dates', display: '6/15', answer: '유월 십오 일', tiles: ['유월', '십오', '일'], lures: ['육월', '오일'], valueKey: '6/15',
    trans: L('June 15', '15 de junio', '15 juin', '15 de junho', '15 มิ.ย.', '15 Juni', '15 tháng 6', '6月15日') },
  { id: 'date-10-3', domain: 'dates', display: '10/3', answer: '시월 삼 일', tiles: ['시월', '삼', '일'], lures: ['십월', '세'], valueKey: '10/3',
    trans: L('October 3', '3 de octubre', '3 octobre', '3 de outubro', '3 ต.ค.', '3 Oktober', '3 tháng 10', '10月3日') },
  { id: 'date-11-20', domain: 'dates', display: '11/20', answer: '십일월 이십 일', tiles: ['십일월', '이십', '일'], lures: ['십일일월', '스무'], valueKey: '11/20',
    trans: L('November 20', '20 de noviembre', '20 novembre', '20 de novembro', '20 พ.ย.', '20 November', '20 tháng 11', '11月20日') },

  // ── phone / digit strings (Sino digit-by-digit, 공) ──
  { id: 'phone-010-1234', domain: 'phone', display: '010-1234', answer: '공일공 일이삼사', tiles: ['공일공', '일이삼사'], lures: ['영일영', '공일공일'], valueKey: '0101234',
    trans: L('010-1234', '010-1234', '010-1234', '010-1234', '010-1234', '010-1234', '010-1234', '010-1234') },
  { id: 'phone-119', domain: 'phone', display: '119', answer: '일일구', tiles: ['일일구'], lures: ['백십구', '공일구'], valueKey: '119',
    trans: L('119 (emergency)', '119 (emergencia)', '119 (urgence)', '119 (emergência)', '119 (ฉุกเฉิน)', '119 (darurat)', '119 (khẩn cấp)', '119（緊急）') },
  { id: 'phone-010-9876', domain: 'phone', display: '010-9876', answer: '공일공 구팔칠육', tiles: ['공일공', '구팔칠육'], lures: ['영일영', '공일공구'], valueKey: '0109876',
    trans: L('010-9876', '010-9876', '010-9876', '010-9876', '010-9876', '010-9876', '010-9876', '010-9876') },
]

export function itemsForDomain(domain: string): MarketItem[] {
  return MARKET_ITEMS.filter((i) => i.domain === domain)
}

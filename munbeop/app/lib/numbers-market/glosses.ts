import type { LocaleCode, LocalizedString } from '~/lib/domain'

/**
 * Curated, reviewable localization data for the Number Market generator.
 *
 * The generator renders Korean *readings* deterministically from the golden
 * number engine (`~/lib/korean/numbers`), so the only hand-authored content is
 * the gloss vocabulary: the nouns counted in the `counting` domain, month
 * names for `dates`, and the word "won" for `money`. Everything number-shaped
 * (digits, clock, phone strings) glosses to a language-neutral numeral.
 */

/** Positional {@link LocalizedString} builder — order matches LOCALE_CODES. */
export function loc(
  en: string, es: string, fr: string, ptBR: string,
  th: string, id: string, vi: string, ja: string,
): LocalizedString {
  return { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }
}

/** Same string in every locale (for language-neutral numerals). */
export function sameAll(s: string): LocalizedString {
  return { en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s }
}

/** Locales that inflect the noun for number (n === 1 needs a singular form). */
export type CountableLocale = 'en' | 'es' | 'fr' | 'pt-BR'

/** A noun that can be counted, with its Korean counter (all native-prenominal). */
export interface NounDef {
  /** Korean noun shown in the prompt, e.g. "사과". Empty for the age pseudo-noun. */
  ko: string
  /** Korean counter, e.g. "개", "마리", "명". */
  counter: string
  /** When true the prompt omits the noun (e.g. age → "20살"). */
  bareDisplay?: boolean
  /** Plural noun gloss; the count is prefixed by the generator ("3 apples"). */
  gloss: LocalizedString
  /** Singular form for n === 1 in inflecting locales ("1 apple"). th/id/vi/ja don't inflect. */
  one: Record<CountableLocale, string>
}

/** Singular forms for n === 1 (en, es, fr, pt-BR — the inflecting locales). */
const one = (en: string, es: string, fr: string, ptBR: string): Record<CountableLocale, string> =>
  ({ en, es, fr, 'pt-BR': ptBR })

/** Counted nouns for the `counting` domain (native prenominal + counter). */
export const COUNT_NOUNS: NounDef[] = [
  { ko: '사과', counter: '개', gloss: loc('apples', 'manzanas', 'pommes', 'maçãs', 'แอปเปิล', 'apel', 'quả táo', 'りんご'), one: one('apple', 'manzana', 'pomme', 'maçã') },
  { ko: '의자', counter: '개', gloss: loc('chairs', 'sillas', 'chaises', 'cadeiras', 'เก้าอี้', 'kursi', 'cái ghế', '椅子'), one: one('chair', 'silla', 'chaise', 'cadeira') },
  { ko: '고양이', counter: '마리', gloss: loc('cats', 'gatos', 'chats', 'gatos', 'แมว', 'kucing', 'con mèo', '猫'), one: one('cat', 'gato', 'chat', 'gato') },
  { ko: '강아지', counter: '마리', gloss: loc('puppies', 'perritos', 'chiots', 'cachorros', 'ลูกหมา', 'anak anjing', 'con cún', '子犬'), one: one('puppy', 'perrito', 'chiot', 'cachorro') },
  { ko: '학생', counter: '명', gloss: loc('students', 'estudiantes', 'élèves', 'estudantes', 'นักเรียน', 'siswa', 'học sinh', '学生'), one: one('student', 'estudiante', 'élève', 'estudante') },
  { ko: '사람', counter: '명', gloss: loc('people', 'personas', 'personnes', 'pessoas', 'คน', 'orang', 'người', '人'), one: one('person', 'persona', 'personne', 'pessoa') },
  { ko: '친구', counter: '명', gloss: loc('friends', 'amigos', 'amis', 'amigos', 'เพื่อน', 'teman', 'người bạn', '友達'), one: one('friend', 'amigo', 'ami', 'amigo') },
  { ko: '책', counter: '권', gloss: loc('books', 'libros', 'livres', 'livros', 'หนังสือ', 'buku', 'quyển sách', '本'), one: one('book', 'libro', 'livre', 'livro') },
  { ko: '공책', counter: '권', gloss: loc('notebooks', 'cuadernos', 'cahiers', 'cadernos', 'สมุด', 'buku tulis', 'quyển vở', 'ノート'), one: one('notebook', 'cuaderno', 'cahier', 'caderno') },
  { ko: '커피', counter: '잔', gloss: loc('coffees', 'cafés', 'cafés', 'cafés', 'กาแฟ', 'kopi', 'ly cà phê', 'コーヒー'), one: one('coffee', 'café', 'café', 'café') },
  { ko: '맥주', counter: '병', gloss: loc('beers', 'cervezas', 'bières', 'cervejas', 'เบียร์', 'bir', 'chai bia', 'ビール'), one: one('beer', 'cerveza', 'bière', 'cerveja') },
  { ko: '자동차', counter: '대', gloss: loc('cars', 'coches', 'voitures', 'carros', 'รถยนต์', 'mobil', 'ô tô', '車'), one: one('car', 'coche', 'voiture', 'carro') },
  { ko: '자전거', counter: '대', gloss: loc('bicycles', 'bicicletas', 'vélos', 'bicicletas', 'จักรยาน', 'sepeda', 'xe đạp', '自転車'), one: one('bicycle', 'bicicleta', 'vélo', 'bicicleta') },
  { ko: '장미', counter: '송이', gloss: loc('roses', 'rosas', 'roses', 'rosas', 'กุหลาบ', 'mawar', 'bông hồng', 'バラ'), one: one('rose', 'rosa', 'rose', 'rosa') },
  { ko: '나무', counter: '그루', gloss: loc('trees', 'árboles', 'arbres', 'árvores', 'ต้นไม้', 'pohon', 'cây', '木'), one: one('tree', 'árbol', 'arbre', 'árvore') },
  { ko: '표', counter: '장', gloss: loc('tickets', 'boletos', 'billets', 'ingressos', 'ตั๋ว', 'tiket', 'vé', 'チケット'), one: one('ticket', 'boleto', 'billet', 'ingresso') },
  { ko: '연필', counter: '자루', gloss: loc('pencils', 'lápices', 'crayons', 'lápis', 'ดินสอ', 'pensil', 'cây bút chì', '鉛筆'), one: one('pencil', 'lápiz', 'crayon', 'lápis') },
]

/** Age pseudo-noun: native prenominal + 살, prompt shows "20살". */
export const AGE_NOUN: NounDef = {
  ko: '', counter: '살', bareDisplay: true,
  gloss: loc('years old', 'años', 'ans', 'anos', 'ปี', 'tahun', 'tuổi', '歳'),
  one: one('year old', 'año', 'an', 'ano'),
}

/** The currency word appended to money glosses. */
export const WON: LocalizedString = loc('won', 'wones', 'wons', 'wons', 'วอน', 'won', 'won', 'ウォン')

/** Month names 1..12, per locale (for the `dates` gloss). */
export const MONTHS: Record<LocaleCode, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  'pt-BR': ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  vi: ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'],
  ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
}

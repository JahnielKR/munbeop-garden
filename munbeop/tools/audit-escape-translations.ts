import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { LOCALE_CODES, type LocalizedString } from '~/lib/domain'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'
import { TRANSLATIONS } from '~/seed/escape-room/translations'

type TargetLocale = Exclude<(typeof LOCALE_CODES)[number], 'es'>

interface SourceUse {
  source: string
  paths: string[]
}

interface SemanticIssue extends SourceUse {
  reasons: string[]
}

interface SemanticRule {
  id: string
  locale: TargetLocale
  applies: (use: SourceUse) => boolean
  forbidden: RegExp
}

interface RequiredSemanticRule {
  id: string
  locale: TargetLocale
  applies: (use: SourceUse) => boolean
  required: RegExp
}

const TARGET_LOCALES = LOCALE_CODES.filter((locale): locale is TargetLocale => locale !== 'es')
const hasLatin = (value: string) => /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(value)

function isLocalizedString(value: unknown): value is LocalizedString {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return LOCALE_CODES.every((locale) => typeof record[locale] === 'string')
}

function collectLocalizedStrings(
  value: unknown,
  path: string,
  sources: Map<string, Set<string>>,
): void {
  if (isLocalizedString(value)) {
    if (value.es && hasLatin(value.es)) {
      const paths = sources.get(value.es) ?? new Set<string>()
      paths.add(path)
      sources.set(value.es, paths)
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectLocalizedStrings(entry, `${path}[${index}]`, sources))
    return
  }

  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      collectLocalizedStrings(entry, path ? `${path}.${key}` : key, sources)
    }
  }
}

const sources = new Map<string, Set<string>>()
for (const entry of LEVEL_REGISTRY) {
  collectLocalizedStrings(entry, entry.id, sources)
}

const inventory: SourceUse[] = [...sources.entries()]
  .map(([source, paths]) => ({ source, paths: [...paths].sort() }))
  .sort((left, right) => left.paths[0]!.localeCompare(right.paths[0]!))

const missing = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => !Object.hasOwn(TRANSLATIONS[locale], source)),
  ]),
) as Record<TargetLocale, SourceUse[]>

const emptyTranslations = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      return typeof translated === 'string' && translated.trim().length === 0
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

const liveSources = new Set(inventory.map(({ source }) => source))
const staleTranslations = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    Object.keys(TRANSLATIONS[locale])
      .filter((source) => !liveSources.has(source))
      .sort(),
  ]),
) as Record<TargetLocale, string[]>

const structuralIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      if (!translated) return false
      return (
        translated.split('\n\n').length !== source.split('\n\n').length ||
        translated.split('{farewell}').length !== source.split('{farewell}').length ||
        translated.split('=').length !== source.split('=').length ||
        translated.split('·').length !== source.split('·').length ||
        (source.includes(' = ') && /(?:=\s*-\s|[.!?]\s*·)/u.test(translated))
      )
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

const identical = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => TRANSLATIONS[locale][source]?.trim() === source.trim()),
  ]),
) as Record<TargetLocale, SourceUse[]>

// Some strings are genuinely identical across Spanish and a target language
// (Korean avatar names after the shared loanword “Avatar”, or short Portuguese
// glosses made entirely of Spanish/Portuguese cognates). Keep those exceptions
// explicit so a newly untranslated Spanish sentence still fails the audit.
const allowedPortugueseIdentical = new Set([
  '꽃 = flor.',
  '고양이 = gato.',
  '국 = sopa coreana.',
  'Números nativos: 하나·둘·셋·넷·다섯·여섯·일곱·여덟·아홉·열.',
  '여섯 = seis.',
  'Místico · Contemplativo',
  'Nostálgico · Familiar',
  'V/A-(으)ㄴ/는 척하다 (G094) = fingir: 모르는 척하고 연기하세요.',
  'Meta-pop · Divertido',
  '보여 주다 = mostrar · 따라 하다 = imitar, seguir.',
  'Histórico · Misterioso',
  'Intriga · Denso',
  'Diplomático · Tenso',
])
const avatarNameSharedWithSpanish =
  /^Avatar\s+(?:["“][\p{Script=Hangul}\d\s]+["”]|«[\p{Script=Hangul}\d\s]+»)$/u
const avatarLoanwordLocales = new Set<TargetLocale>(['en', 'fr', 'pt-BR', 'id', 'vi'])
function isAllowedIdentical(locale: TargetLocale, use: SourceUse): boolean {
  if (locale === 'pt-BR' && allowedPortugueseIdentical.has(use.source)) return true
  return avatarLoanwordLocales.has(locale) && avatarNameSharedWithSpanish.test(use.source)
}

const unexpectedIdentical = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    identical[locale].filter((use) => !isAllowedIdentical(locale, use)),
  ]),
) as Record<TargetLocale, SourceUse[]>

const quotePairs = [
  ['«', '»'],
  ['“', '”'],
  ['「', '」'],
  ['『', '』'],
] as const

const count = (value: string, token: string) => value.split(token).length - 1
const hasOrderedPair = (value: string, open: string, close: string) => {
  let depth = 0
  for (const character of value) {
    if (character === open) depth += 1
    if (character === close) depth -= 1
    if (depth < 0) return false
  }
  return depth === 0
}
const hasBalancedQuotes = (value: string) =>
  quotePairs.every(([open, close]) => hasOrderedPair(value, open, close)) &&
  count(value, '"') % 2 === 0

const typographyIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      return Boolean(translated && !hasBalancedQuotes(translated))
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

const koreanTokenPattern = /[\u3131-\u318e\uac00-\ud7a3]+/g
const koreanTokenIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      if (!translated) return false
      const tokens = new Set(source.match(koreanTokenPattern) ?? [])
      return [...tokens].some((token) => count(translated, token) !== count(source, token))
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

const adjacentLatinHangul =
  /[\u3131-\u318e\uac00-\ud7a3][A-Za-zÀ-ɏ]|[A-Za-zÀ-ɏ][\u3131-\u318e\uac00-\ud7a3]/
const tokenSpacingIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      return Boolean(
        translated && adjacentLatinHangul.test(translated) && !adjacentLatinHangul.test(source),
      )
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

// Catch the most common UTF-8/Windows-1252 decoding scars. These sequences
// should never be authored intentionally in any supported locale and are a
// useful guard because translation files are large enough for visual review to
// miss a single damaged entry.
const mojibake = /\uFFFD|Â[«»·]|Ã[¡©­³º±¼]|â(?:€”|€“|€œ|€|€™|€¦)/u
const encodingIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      return Boolean(translated && mojibake.test(translated))
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

const lengthIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.filter(({ source }) => {
      const translated = TRANSLATIONS[locale][source]
      if (!translated || source.length < 80) return false
      const ratio = translated.length / source.length
      return ratio < 0.25 || ratio > 3
    }),
  ]),
) as Record<TargetLocale, SourceUse[]>

const sourceHas = (use: SourceUse, token: string) =>
  use.source.toLocaleLowerCase('es').includes(token.toLocaleLowerCase('es'))
const inLevel = (use: SourceUse, level: string) =>
  use.paths.some((path) => path.startsWith(`${level}.`))
const rule = (
  id: string,
  locale: TargetLocale,
  applies: SemanticRule['applies'],
  forbidden: RegExp,
): SemanticRule => ({ id, locale, applies, forbidden })

/**
 * High-signal false-friend guardrails found during editorial review. These are
 * deliberately path/context aware: `linterna` is a flashlight in level 7 but
 * a wick-lit palace lantern in level 8, while `plano` is a camera shot in the
 * studio rather than an aeroplane. The rules do not try to judge fluency; they
 * prevent known catastrophic senses from silently returning in a regenerated
 * dictionary.
 */
const semanticRules: SemanticRule[] = [
  ...([
    ['en', /\bflashlights?\b/iu],
    ['fr', /\blampes? (?:de poche|torches?)\b/iu],
    ['id', /\bsenter\b/iu],
    ['vi', /đèn pin/iu],
    ['ja', /懐中電灯/u],
    ['th', /ไฟฉาย/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-08-wick-lantern-not-flashlight',
      locale,
      (use) => inLevel(use, 'level-08') && sourceHas(use, 'linterna'),
      forbidden,
    ),
  ),
  rule('heritage-conservator-not-political', 'en', (use) => sourceHas(use, 'conservadora'), /\bconservative\b/iu),
  rule('heritage-conservator-not-political', 'id', (use) => sourceHas(use, 'conservadora'), /\bkonservatif\b/iu),
  rule('heritage-conservator-not-political', 'vi', (use) => sourceHas(use, 'conservadora'), /người bảo thủ/iu),
  rule('heritage-conservator-not-political', 'ja', (use) => sourceHas(use, 'conservadora'), /保守派/u),
  rule('heritage-conservator-not-political', 'th', (use) => sourceHas(use, 'conservadora'), /ฝ่ายอนุรักษ์/u),
  ...([
    ['en', /\bbanknotes?\b/iu],
    ['fr', /\bbillets? de banque\b/iu],
    ['pt-BR', /\bnotas? de dinheiro\b/iu],
    ['id', /\buang kertas\b/iu],
    ['vi', /\btiền giấy\b/iu],
    ['ja', /紙幣/u],
    ['th', /ธนบัตร/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-04-train-ticket-not-banknote',
      locale,
      (use) => inLevel(use, 'level-04') && sourceHas(use, 'billete'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:ad|advertisements?)\b/iu],
    ['fr', /publicit(?:é|aire)s?/iu],
    ['pt-BR', /\banúncios? publicitários?\b/iu],
    ['id', /\biklan\b/iu],
    ['vi', /\bquảng cáo\b/iu],
    ['ja', /広告/u],
    ['th', /โฆษณา/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-04-station-announcement-not-advertisement',
      locale,
      (use) => inLevel(use, 'level-04') && /anuncios?|megafonía/iu.test(use.source),
      forbidden,
    ),
  ),
  rule(
    'creation-prompt-is-imperative',
    'en',
    (use) => use.source.startsWith('Construye:'),
    /^(?:(?:he|she)\s+(?:builds?|constructs?)|(?:builds|constructs)):/iu,
  ),
  rule('creation-prompt-is-imperative', 'id', (use) => use.source.startsWith('Construye:'), /^membangun\s*:/iu),
  rule('creation-prompt-is-imperative', 'vi', (use) => use.source.startsWith('Construye:'), /^xây dựng\s*:/iu),
  rule(
    'creation-prompt-is-imperative',
    'th',
    (use) => use.source.startsWith('Construye:'),
    /^(?:เขาเล่าว่า|โครงสร้าง|บิลด์)\s*:/u,
  ),
  rule(
    'creation-prompt-is-imperative',
    'pt-BR',
    (use) => use.source.startsWith('Construye:'),
    /^(?:build|construir|construção)\s*:/iu,
  ),
  ...([
    ['en', /\brunner\b/iu],
    ['fr', /\bcoureur\b/iu],
    ['id', /\bpelari\b/iu],
    ['vi', /\bngười chạy\b/iu],
    ['ja', /走者/u],
    ['th', /นักวิ่ง/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'humanitarian-corridor-not-runner',
      locale,
      (use) => sourceHas(use, 'corredor humanitario'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:no|without) (?:a )?(?:foot|feet)\b/iu],
    ['fr', /\b(?:pas de|sans) pied\b/iu],
    ['pt-BR', /(?:não tem|sem) pé/iu],
    ['id', /(?:tidak (?:memiliki |ada )?kaki|tanpa kaki)/iu],
    ['vi', /(?:không (?:có )?chân|không mang chân)/iu],
    ['ja', /足がない/u],
    ['th', /ไม่มีขา/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'photo-caption-not-human-foot',
      locale,
      (use) => sourceHas(use, 'fotografía no lleva pie'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:performer|actor|actress)\b/iu],
    ['fr', /\b(?:artiste|acteur|actrice)\b/iu],
    ['pt-BR', /\b(?:artista|ator|atriz)\b/iu],
    ['id', /\b(?:pemain|aktor|aktris)\b/iu],
    ['vi', /\bdiễn viên\b/iu],
    ['ja', /(?:出演者|俳優)/u],
    ['th', /นักแสดง/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'chief-interpreter-not-performer',
      locale,
      (use) => sourceHas(use, 'intérprete principal'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bfeather\b/iu],
    ['pt-BR', /\bpena\b/iu],
    ['id', /\bbulu\b/iu],
    ['vi', /\blông(?: vũ)?\b/iu],
    ['ja', /羽/u],
    ['th', /ขนนก/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'ceremonial-pen-not-feather',
      locale,
      (use) => inLevel(use, 'level-10') && sourceHas(use, 'pluma'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:air)?plane\b/iu],
    ['fr', /\bavion\b/iu],
    ['pt-BR', /\bavião\b/iu],
    ['id', /\bpesawat\b/iu],
    ['vi', /\bmáy bay\b/iu],
    ['ja', /飛行機/u],
    ['th', /เครื่องบิน/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-camera-shot-not-aeroplane',
      locale,
      (use) => inLevel(use, 'level-06') && sourceHas(use, 'plano'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:reserve|stockpile)\b/iu],
    ['fr', /\bréserve\b/iu],
    ['id', /\bcadangan\b/iu],
    ['vi', /dự trữ/iu],
    ['ja', /(?:備蓄|予備)/u],
    ['th', /สำรอง/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-05-pending-reservation-not-stock-reserve',
      locale,
      (use) => inLevel(use, 'level-05') && sourceHas(use, 'reserva pendiente'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:additional|supplement(?:ary)?)\b/iu],
    ['fr', /\b(?:supplément|additionnel(?:le)?)\b/iu],
    ['pt-BR', /\badicional\b/iu],
    ['id', /\btambahan\b/iu],
    ['vi', /\bbổ sung\b/iu],
    ['ja', /(?:増補|号外)/u],
    ['th', /เพิ่มเติม/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-background-extra-not-additional-item',
      locale,
      (use) => inLevel(use, 'level-06') && /\bextras?\b/iu.test(use.source),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:delivery|distribution|shipment)\b/iu],
    ['fr', /\b(?:livraison|répartition|distribution)\b/iu],
    ['pt-BR', /\b(?:entrega|distribuição)\b/iu],
    ['id', /\b(?:pengiriman|distribusi)\b/iu],
    ['vi', /\b(?:giao hàng|phân phối)\b/iu],
    ['ja', /(?:配達|配送|分配)/u],
    ['th', /(?:จัดส่ง|การกระจาย)/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-cast-not-delivery-or-distribution',
      locale,
      (use) => inLevel(use, 'level-06') && sourceHas(use, 'reparto'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:tap|faucet)\b/iu],
    ['fr', /\brobinet\b/iu],
    ['pt-BR', /\btorneira\b/iu],
    ['id', /\bkeran\b/iu],
    ['vi', /\bvòi\b/iu],
    ['ja', /蛇口/u],
    ['th', /ก๊อก/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-clapperboard-not-water-tap',
      locale,
      (use) => inLevel(use, 'level-06') && sourceHas(use, 'claqueta'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bladders?\b/iu],
    ['fr', /échelles?/iu],
    ['ja', /(?:はしご|梯子)/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-08-staircase-not-ladder',
      locale,
      (use) => inLevel(use, 'level-08') && sourceHas(use, 'escalera'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\btracks?\b/iu],
    ['id', /\bjalur\b/iu],
    ['vi', /(?:đường ray|đường đua)/iu],
    ['ja', /(?:トラック|線路)/u],
    ['th', /(?:ราง|ลู่วิ่ง)/u],
  ] as const).map(([locale, forbidden]) =>
    rule('grammar-clue-not-physical-track', locale, (use) => sourceHas(use, 'pista'), forbidden),
  ),
  ...([
    ['pt-BR', /\bguindastes?\b/iu],
    ['id', /\b(?:derek|kran)\b/iu],
    ['vi', /\bcần cẩu\b/iu],
    ['ja', /クレーン/u],
    ['th', /เครน/u],
  ] as const).map(([locale, forbidden]) =>
    rule('painted-crane-is-bird-not-machine', locale, (use) => sourceHas(use, 'grulla'), forbidden),
  ),
  ...([
    ['en', /\brunners?\b/iu],
    ['fr', /\bcoureurs?\b/iu],
    ['id', /\bpelari\b/iu],
    ['vi', /\bngười chạy\b/iu],
    ['ja', /走者/u],
    ['th', /นักวิ่ง/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-08-corridor-not-runner',
      locale,
      (use) => inLevel(use, 'level-08') && sourceHas(use, 'corredor'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bbanknotes?\b/iu],
    ['fr', /\bbillets? de banque\b/iu],
    ['id', /\buang kertas\b/iu],
    ['vi', /\btiền giấy\b/iu],
    ['ja', /紙幣/u],
    ['th', /ธนบัตร/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-09-written-note-not-banknote',
      locale,
      (use) => inLevel(use, 'level-09') && sourceHas(use, 'nota'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bnews coverage\b/iu],
    ['fr', /\bcouverture médiatique\b/iu],
    ['pt-BR', /\bcobertura jornalística\b/iu],
    ['id', /\bliputan berita\b/iu],
    ['ja', /報道/u],
    ['th', /การรายงานข่าว/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-07-mobile-signal-not-news-coverage',
      locale,
      (use) => inLevel(use, 'level-07') && sourceHas(use, 'cobertura'),
      forbidden,
    ),
  ),
  ...([
    ['id', /\bsutradara\b/iu],
    ['vi', /đạo diễn/iu],
    ['ja', /監督/u],
    ['th', /ผู้กำกับ/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-07-company-director-not-film-director',
      locale,
      (use) => inLevel(use, 'level-07') && /\bdirector(?:a| general)?\b/iu.test(use.source),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bstage\b/iu],
    ['pt-BR', /\bpalco\b/iu],
    ['id', /\bpanggung\b/iu],
    ['vi', /\bsân khấu\b/iu],
    ['ja', /舞台/u],
    ['th', /เวที/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'railway-platform-not-performance-stage',
      locale,
      (use) => inLevel(use, 'level-04') && sourceHas(use, 'andén'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:shipment|shipping|dispatch)\b/iu],
    ['fr', /\bexpédition\b/iu],
    ['pt-BR', /\b(?:remessa|envio)\b/iu],
    ['id', /\bpengiriman\b/iu],
    ['vi', /\b(?:giao hàng|vận chuyển)\b/iu],
    ['ja', /(?:出荷|発送)/u],
    ['th', /(?:การจัดส่ง|ขนส่งสินค้า)/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-04-passenger-boarding-not-shipment',
      locale,
      (use) => inLevel(use, 'level-04') && sourceHas(use, 'embarque'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:electrical )?outlets?\b/iu],
    ['fr', /\bprises? électriques?\b/iu],
    ['pt-BR', /\btomadas? elétricas?\b/iu],
    ['id', /\b(?:stopkontak|soket listrik)\b/iu],
    ['vi', /ổ cắm/iu],
    ['ja', /コンセント/u],
    ['th', /ปลั๊ก/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-film-take-not-electrical-outlet',
      locale,
      (use) => inLevel(use, 'level-06') && sourceHas(use, 'toma'),
      forbidden,
    ),
  ),
  ...([
    ['fr', /\bcoups?\b/iu],
    ['pt-BR', /\btacadas?\b/iu],
    ['id', /\b(?:tembakan|pukulan)\b/iu],
    ['vi', /(?:cú đánh|phát bắn)/iu],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-film-take-not-sport-or-weapon-shot',
      locale,
      (use) => inLevel(use, 'level-06') && sourceHas(use, 'toma'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bcampaigns?\b/iu],
    ['fr', /\bcampagnes?\b/iu],
    ['pt-BR', /\bcampanhas?\b/iu],
    ['id', /\bkampanye\b/iu],
    ['vi', /\bchiến dịch\b/iu],
    ['ja', /キャンペーン/u],
    ['th', /แคมเปญ/u],
  ] as const).map(([locale, forbidden]) =>
    rule('bell-chime-not-campaign', locale, (use) => sourceHas(use, 'campanada'), forbidden),
  ),
  ...([
    ['en', /\b(?:rule|regulation)\b/iu],
    ['fr', /\b(?:règle|règlement)\b/iu],
    ['pt-BR', /\b(?:regra|regulamento)\b/iu],
    ['id', /\b(?:aturan|peraturan)\b/iu],
    ['vi', /\bquy tắc\b/iu],
    ['ja', /(?:規則|規定)/u],
    ['th', /(?:กฎ|ระเบียบ)/u],
  ] as const).map(([locale, forbidden]) =>
    rule('legal-clause-not-rule', locale, (use) => sourceHas(use, 'cláusula'), forbidden),
  ),
  ...([
    ['en', /\b(?:writer|author)\b/iu],
    ['fr', /(?:écrivain|auteur)/iu],
    ['pt-BR', /\b(?:escritor|autor)\b/iu],
    ['id', /\b(?:penulis|pengarang)\b/iu],
    ['vi', /\b(?:nhà văn|người viết)\b/iu],
    ['ja', /(?:作家|筆者)/u],
    ['th', /นักเขียน/u],
  ] as const).map(([locale, forbidden]) =>
    rule('wording-not-writer', locale, (use) => sourceHas(use, 'redacción'), forbidden),
  ),
  ...([
    ['en', /\bbrand\b/iu],
    ['id', /\bmerek\b/iu],
    ['vi', /thương hiệu/iu],
    ['ja', /ブランド/u],
    ['th', /แบรนด์/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-09-independent-mark-not-commercial-brand',
      locale,
      (use) => inLevel(use, 'level-09') && sourceHas(use, 'marca independiente'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:exam|test)\b/iu],
    ['fr', /\b(?:examen|test)\b/iu],
    ['id', /\b(?:ujian|tes)\b/iu],
    ['vi', /\b(?:bài kiểm tra|kỳ thi)\b/iu],
    ['ja', /(?:テスト|試験)/u],
    ['th', /(?:การทดสอบ|ข้อสอบ)/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-09-evidence-not-exam',
      locale,
      (use) => inLevel(use, 'level-09') && sourceHas(use, 'prueba'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\b(?:agreement|treaty)\b/iu],
    ['fr', /(?:accord|traité|volonté)/iu],
    ['pt-BR', /\b(?:acordo|tratado|vontade)\b/iu],
    ['id', /\b(?:perjanjian|kesepakatan|kehendak)\b/iu],
    ['vi', /\b(?:giao ước|hiệp ước|ý chí)\b/iu],
    ['ja', /(?:協定|条約|意志)/u],
    ['th', /(?:พระราชบัญญัติ|สนธิสัญญา|ข้อตกลง|เจตจำนง)/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-09-testament-not-agreement-or-intention',
      locale,
      (use) => inLevel(use, 'level-09') && sourceHas(use, 'testamento'),
      forbidden,
    ),
  ),
  ...([
    ['en', /\bcoma\b/iu],
    ['fr', /\bcoma\b/iu],
    ['pt-BR', /\bcoma\b/iu],
    ['vi', /hôn mê/iu],
    ['ja', /(?:昏睡|昏睡状態)/u],
    ['th', /โคม่า/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-09-comma-not-medical-coma',
      locale,
      (use) => inLevel(use, 'level-09') && sourceHas(use, 'coma'),
      forbidden,
    ),
  ),
  ...([
    ['fr', /\bdirecteur\b/iu],
    ['pt-BR', /\bdiretor\b/iu],
    ['id', /\bdirektur\b/iu],
    ['vi', /\bgiám đốc\b/iu],
    ['ja', /取締役/u],
    ['th', /ผู้อำนวยการ/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'level-06-film-director-not-executive-director',
      locale,
      (use) => inLevel(use, 'level-06') && sourceHas(use, 'directora'),
      forbidden,
    ),
  ),
  ...([
    ['fr', /\bphoque\b/iu],
    ['pt-BR', /\bfoca\b/iu],
    ['id', /\banjing laut\b/iu],
    ['vi', /\bhải cẩu\b/iu],
    ['ja', /アザラシ/u],
    ['th', /แมวน้ำ/u],
  ] as const).map(([locale, forbidden]) =>
    rule(
      'diplomatic-seal-not-animal',
      locale,
      (use) => inLevel(use, 'level-10') && sourceHas(use, 'sello'),
      forbidden,
    ),
  ),
]

const requiredSemanticRules: RequiredSemanticRule[] = (
  [
    ['en', /^build(?: the sentence)?\s*:/iu],
    ['fr', /^(?:construis|construisez)(?: la phrase)?\s*:/iu],
    ['pt-BR', /^(?:construa|monte)(?: a frase)?\s*:/iu],
    ['id', /^(?:susun(?: kalimat)?|buat(?:lah)?(?: kalimat)?)\s*:/iu],
    ['vi', /^(?:hãy )?sắp xếp(?: câu)?\s*:/iu],
    ['ja', /^(?:組み立て|構成|文を作)/u],
    ['th', /^(?:เรียงประโยค|สร้างประโยค|สร้าง)\s*:/u],
  ] as const
).map(([locale, required]) => ({
  id: 'creation-prompt-has-natural-localized-prefix',
  locale,
  applies: (use: SourceUse) => use.source.startsWith('Construye:'),
  required,
}))

const inactiveSemanticRules = [
  ...semanticRules.flatMap((candidate) =>
    inventory.some((use) => candidate.applies(use))
      ? []
      : [{ kind: 'forbidden', id: candidate.id, locale: candidate.locale }],
  ),
  ...requiredSemanticRules.flatMap((candidate) =>
    inventory.some((use) => candidate.applies(use))
      ? []
      : [{ kind: 'required', id: candidate.id, locale: candidate.locale }],
  ),
]

const semanticIssues = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [
    locale,
    inventory.flatMap((use): SemanticIssue[] => {
      const translated = TRANSLATIONS[locale][use.source]
      if (!translated) return []
      const reasons = [
        ...semanticRules
          .filter(
            (candidate) =>
              candidate.locale === locale &&
              candidate.applies(use) &&
              candidate.forbidden.test(translated),
          )
          .map((candidate) => candidate.id),
        ...requiredSemanticRules
          .filter(
            (candidate) =>
              candidate.locale === locale &&
              candidate.applies(use) &&
              !candidate.required.test(translated),
          )
          .map((candidate) => candidate.id),
      ].filter((reason, index, all) => all.indexOf(reason) === index)
      return reasons.length > 0 ? [{ ...use, reasons }] : []
    }),
  ]),
) as Record<TargetLocale, SemanticIssue[]>

const identicalCounts = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [locale, identical[locale].length]),
)
const unexpectedIdenticalCounts = Object.fromEntries(
  TARGET_LOCALES.map((locale) => [locale, unexpectedIdentical[locale].length]),
)

export const report = {
  levels: 'level-01..level-10',
  sourceLocale: 'es',
  targetLocales: TARGET_LOCALES,
  translatableSources: inventory.length,
  sources: inventory,
  missingCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, missing[locale].length]),
  ),
  emptyTranslationCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, emptyTranslations[locale].length]),
  ),
  staleTranslationCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, staleTranslations[locale].length]),
  ),
  structuralIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, structuralIssues[locale].length]),
  ),
  typographyIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, typographyIssues[locale].length]),
  ),
  koreanTokenIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, koreanTokenIssues[locale].length]),
  ),
  tokenSpacingIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, tokenSpacingIssues[locale].length]),
  ),
  encodingIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, encodingIssues[locale].length]),
  ),
  lengthIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, lengthIssues[locale].length]),
  ),
  semanticIssueCounts: Object.fromEntries(
    TARGET_LOCALES.map((locale) => [locale, semanticIssues[locale].length]),
  ),
  identicalCounts,
  unexpectedIdenticalCounts,
  inactiveSemanticRuleCount: inactiveSemanticRules.length,
  missing,
  emptyTranslations,
  staleTranslations,
  structuralIssues,
  typographyIssues,
  koreanTokenIssues,
  tokenSpacingIssues,
  encodingIssues,
  lengthIssues,
  semanticIssues,
  identical,
  unexpectedIdentical,
  inactiveSemanticRules,
}

// Vitest imports `report` below as a regression assertion. Keep the CLI's file
// writes/logging/exit code out of that import path while preserving identical
// computation in tests and in `pnpm escape:i18n:audit`.
if (process.env.VITEST !== 'true') {
  const outIndex = process.argv.indexOf('--out')
  if (outIndex !== -1) {
    const out = process.argv[outIndex + 1]
    if (!out) throw new Error('--out requires a file path')
    const absolute = resolve(out)
    writeFileSync(absolute, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    process.stdout.write(`Wrote ${absolute}\n`)
  }

  process.stdout.write(`Translatable sources in levels 1–10: ${inventory.length}\n`)
  for (const locale of TARGET_LOCALES) {
    process.stdout.write(
      `${locale}: ${missing[locale].length} missing, ` +
        `${emptyTranslations[locale].length} empty, ` +
        `${staleTranslations[locale].length} stale, ` +
        `${structuralIssues[locale].length} structural issues, ` +
        `${typographyIssues[locale].length} quote issues, ` +
        `${koreanTokenIssues[locale].length} Korean-token issues, ` +
        `${tokenSpacingIssues[locale].length} spacing issues, ` +
        `${encodingIssues[locale].length} encoding issues, ` +
        `${lengthIssues[locale].length} length issues, ` +
        `${semanticIssues[locale].length} semantic guardrail issues, ` +
        `${identicalCounts[locale]} identical to Spanish ` +
        `(${unexpectedIdenticalCounts[locale]} unexpected)\n`,
    )
  }
  if (inactiveSemanticRules.length > 0) {
    process.stdout.write(
      `Inactive semantic guardrails: ${JSON.stringify(inactiveSemanticRules)}\n`,
    )
  }

  if (
    TARGET_LOCALES.some(
      (locale) =>
        missing[locale].length > 0 ||
        emptyTranslations[locale].length > 0 ||
        staleTranslations[locale].length > 0 ||
        structuralIssues[locale].length > 0 ||
        typographyIssues[locale].length > 0 ||
        koreanTokenIssues[locale].length > 0 ||
        tokenSpacingIssues[locale].length > 0 ||
        encodingIssues[locale].length > 0 ||
        lengthIssues[locale].length > 0 ||
        semanticIssues[locale].length > 0 ||
        unexpectedIdentical[locale].length > 0,
    )
    || inactiveSemanticRules.length > 0
  ) {
    process.exitCode = 1
  }
}

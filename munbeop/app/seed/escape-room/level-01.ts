import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './locale'

/**
 * Level 1 — "Una mañana en el minbak (민박)"
 *
 * Faithful transcription of the dossier in `docs/escape-room.md` sections 12.1-12.8.
 * 4 rooms, 5 slots, 25 candidates (5 pool per slot), 4 reward tiers.
 *
 * Per D12, every visible string is a `LocalizedString` populated via `t(es)`,
 * which clones the Spanish text across all 8 locales as a V1 fallback.
 * Korean source-of-truth (`korean`, `answer`, the literal hangul tokens inside
 * `tiles` and `hints`) is NOT translated.
 *
 * Validated at test time by `validateLevel(LEVEL_01)` in
 * `tests/unit/escape-room/level-01.test.ts`.
 */

// ─── SLOT 1 · Leer la primera nota ──────────────────────────────────────────
// Cuarto 1 (habitación) · Tipo A: selección 4 opciones · Foco: G027 (있다) + G012 + G003

const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '안녕! 아침이 있어요. 부엌에 있어요.',
    question: t('¿Qué dice halmeoni?'),
    options: [
      t('Hola. Hay desayuno. Está en la cocina.'),
      t('Hola. Hay desayuno. Está en la habitación.'),
      t('Hola. Hay café. Está en la cocina.'),
      t('Hola. No hay desayuno. Está en la cocina.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('아침 = mañana / desayuno. 부엌 = cocina.'),
      premium: t('있어요 afirma existencia; el opuesto es 없어요.'),
    },
  },
  {
    korean: '좋은 아침이에요. 부엌에 빵이 있어요.',
    question: t('¿Qué dice halmeoni?'),
    options: [
      t('Buenos días. Hay pan en la cocina.'),
      t('Buenos días. Hay leche en la cocina.'),
      t('Buenos días. No hay pan en la cocina.'),
      t('Buenos días. Hay pan en la sala.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('좋은 아침 es el saludo formal "buenos días". 빵 = pan.'),
      premium: t('Estructura [lugar]에 [cosa]이/가 있어요 = "en [lugar] hay [cosa]".'),
    },
  },
  {
    korean: '안녕! 부엌에 우유가 있어요.',
    question: t('¿Qué dice halmeoni?'),
    options: [
      t('Hola. Hay leche en la cocina.'),
      t('Hola. Hay agua en la cocina.'),
      t('Hola. No hay leche en la cocina.'),
      t('Hola. Hay leche en la sala.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('우유 = leche.'),
      premium: t('있어요 indica existencia (hay).'),
    },
  },
  {
    korean: '아침이 있어요. 식탁에 빵이 있어요.',
    question: t('¿Qué dice halmeoni?'),
    options: [
      t('Hay desayuno. Hay pan en la mesa del comedor.'),
      t('Hay desayuno. Hay arroz en la mesa del comedor.'),
      t('Hay desayuno. No hay pan en la mesa.'),
      t('Hay desayuno. Hay pan en la cocina.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('식탁 = mesa de comedor (distinto de la cocina entera, 부엌).'),
      premium: t('La oración tiene DOS 있어요 — dos cosas que existen.'),
    },
  },
  {
    korean: '안녕! 부엌에 사과가 있어요.',
    question: t('¿Qué dice halmeoni?'),
    options: [
      t('Hola. Hay manzanas en la cocina.'),
      t('Hola. Hay peras en la cocina.'),
      t('Hola. No hay manzanas en la cocina.'),
      t('Hola. Hay manzanas en la sala.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('사과 = manzana. 부엌 = cocina.'),
      premium: t('Patrón [lugar]에 [cosa]가 있어요 — verificar tanto el lugar como la cosa.'),
    },
  },
]

// ─── SLOT 2 · Completar la partícula 이/가 ──────────────────────────────────
// Cuarto 2 (sala) · Tipo B: completar · Foco: G003
// Regla: 이 después de consonante (받침), 가 después de vocal.

const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '사진___ 벽에 있어요.',
    translation: t('La foto está en la pared.'),
    answer: '이',
    hints: {
      free: t('Mira la última letra de 사진. ¿Termina en consonante o vocal?'),
      premium: t('Consonante → 이, vocal → 가.'),
    },
  },
  {
    korean: '책___ 책상에 있어요.',
    translation: t('El libro está en el escritorio.'),
    answer: '이',
    hints: {
      free: t('책 = libro, 책상 = escritorio. ¿Cuál es el sujeto?'),
      premium: t('책 termina en ㄱ — consonante.'),
    },
  },
  {
    korean: '꽃___ 창문에 있어요.',
    translation: t('La flor está en la ventana.'),
    answer: '이',
    hints: {
      free: t('꽃 = flor.'),
      premium: t('꽃 termina en ㅊ (consonante).'),
    },
  },
  {
    korean: '고양이___ 의자에 있어요.',
    translation: t('El gato está en la silla.'),
    answer: '가',
    hints: {
      free: t('고양이 = gato.'),
      premium: t('고양이 termina en vocal — usa 가.'),
    },
  },
  {
    korean: '시계___ 벽에 있어요.',
    translation: t('El reloj está en la pared.'),
    answer: '가',
    hints: {
      free: t('시계 = reloj.'),
      premium: t('시계 termina en vocal — usa 가.'),
    },
  },
]

// ─── SLOT 3 · Encontrar el objeto correcto en la cocina ─────────────────────
// Cuarto 3 (cocina) · Tipo A: selección visual (click en close-up) · Foco: G005 + G027
// `options` strings name the object; UI renders the matching close-up image.

const SLOT_3_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '냉장고에 사과가 있어요.',
    question: t('Hay una manzana en el refrigerador. ¿En qué objeto está?'),
    options: [
      t('Refrigerador (con manzana)'),
      t('Mesa (con pan)'),
      t('Alacena (con tazas)'),
      t('Olla (con sopa)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('냉장고 = refrigerador.'),
      premium: t('에 indica el lugar donde está el sujeto.'),
    },
  },
  {
    korean: '식탁에 빵이 있어요.',
    question: t('Hay pan en la mesa del comedor. ¿En qué objeto está?'),
    options: [
      t('Mesa (con pan)'),
      t('Refrigerador (con manzana)'),
      t('Alacena (con tazas)'),
      t('Olla (con sopa)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('식탁 = mesa (de comedor).'),
      premium: t('빵 = pan.'),
    },
  },
  {
    korean: '찬장에 컵이 있어요.',
    question: t('Hay una taza en la alacena. ¿En qué objeto está?'),
    options: [
      t('Alacena (con tazas)'),
      t('Refrigerador (con manzana)'),
      t('Mesa (con pan)'),
      t('Cuenco (con arroz)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('찬장 = alacena (mueble alto).'),
      premium: t('컵 = taza.'),
    },
  },
  {
    korean: '냄비에 국이 있어요.',
    question: t('Hay sopa en la olla. ¿En qué objeto está?'),
    options: [
      t('Olla (con sopa)'),
      t('Refrigerador (con manzana)'),
      t('Mesa (con pan)'),
      t('Alacena (con tazas)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('냄비 = olla (de cocinar).'),
      premium: t('국 = sopa coreana.'),
    },
  },
  {
    korean: '그릇에 밥이 있어요.',
    question: t('Hay arroz en el cuenco. ¿En qué objeto está?'),
    options: [
      t('Cuenco (con arroz)'),
      t('Refrigerador (con manzana)'),
      t('Olla (con sopa)'),
      t('Alacena (con tazas)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('그릇 = cuenco / plato hondo.'),
      premium: t('밥 = arroz (cocido).'),
    },
  },
]

// ─── SLOT 4 · Decir la hora correcta ────────────────────────────────────────
// Cuarto 3 (cocina) · Tipo C: creación con tiles · Foco: G031 + G032 + G012

const SLOT_4_CANDIDATES: CreationCandidate[] = [
  {
    korean: '몇 시예요?',
    question: t('El reloj muestra las 8:00. ¿Qué hora es?'),
    tiles: ['지금', '여덟', '시예요', '아홉', '일곱', '분'],
    correctOrder: [0, 1, 2],
    hints: {
      free: t('Números nativos: 하나·둘·셋·넷·다섯·여섯·일곱·여덟·아홉·열.'),
      premium: t('"Es la X (en punto)" → X 시예요.'),
    },
  },
  {
    korean: '몇 시예요?',
    question: t('El reloj muestra las 9:30. ¿Qué hora es?'),
    tiles: ['지금', '아홉', '시', '삼십', '분이에요', '여덟', '오십'],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('Hora usa números nativos (아홉 = 9). Minutos usan sino-coreanos (삼십 = 30).'),
      premium: t('Estructura: [hora] 시 [minutos] 분.'),
    },
  },
  {
    korean: '몇 시예요?',
    question: t('El reloj muestra las 7:00. ¿Qué hora es?'),
    tiles: ['지금', '일곱', '시예요', '여섯', '여덟'],
    correctOrder: [0, 1, 2],
    hints: {
      free: t('일곱 = siete (número nativo).'),
      premium: t('En punto = X 시예요.'),
    },
  },
  {
    korean: '몇 시예요?',
    question: t('El reloj muestra las 6:00. ¿Qué hora es?'),
    tiles: ['지금', '여섯', '시예요', '일곱', '다섯'],
    correctOrder: [0, 1, 2],
    hints: {
      free: t('여섯 = seis.'),
      premium: t('Patrón: 지금 + [número] + 시예요.'),
    },
  },
  {
    korean: '몇 시예요?',
    question: t('El reloj muestra las 11:00. ¿Qué hora es?'),
    tiles: ['지금', '열한', '시예요', '열', '열두'],
    correctOrder: [0, 1, 2],
    hints: {
      free: t('11 en nativo = 열한 (no 열일).'),
      premium: t('10 + 1 → 열 + 한 → 열한 시.'),
    },
  },
]

// ─── SLOT 5 · Responder a halmeoni y abrir el candado (FINAL) ───────────────
// Cuarto 4 (entrada) · Tipo C: creación · Foco: G005 + G012 + G032 (integración)

const SLOT_5_CANDIDATES: CreationCandidate[] = [
  {
    korean: '어디에서 만나요?',
    question: t('¿Dónde nos vemos?'),
    tiles: ['별빛 카페에서', '만나요', '별빛 카페에', '별빛 카페가'],
    correctOrder: [0, 1],
    hints: {
      free: t('El nombre del café está en una nota anterior.'),
      premium: t('Lugar DONDE pasa una acción usa 에서, no 에.'),
    },
  },
  {
    korean: '몇 시에 가요?',
    question: t('¿A qué hora vas?'),
    tiles: ['열', '시에', '가요', '시예요', '에서'],
    correctOrder: [0, 1, 2],
    hints: {
      free: t('La hora está en una nota o el reloj anterior.'),
      premium: t('"A LA hora X" usa 에, no 에서.'),
    },
  },
  {
    korean: '어디에 가요?',
    question: t('¿A dónde vas?'),
    tiles: ['햇살 카페에', '가요', '햇살 카페에서', '가세요'],
    correctOrder: [0, 1],
    hints: {
      free: t('El destino se marca con 에 + verbo de movimiento (가다).'),
      premium: t('No es 에서 (lugar de acción) — es 에 (destino).'),
    },
  },
  {
    korean: '몇 시에 카페에서 만나요?',
    question: t('¿A qué hora nos vemos en el café?'),
    tiles: ['여덟 시에', '카페에서', '만나요', '여덟 시에서', '카페에', '봐요'],
    correctOrder: [0, 1, 2],
    hints: {
      free: t('Necesitas tanto la hora como el lugar del encuentro (ambos están en notas previas).'),
      premium: t('"A la hora X" → 시에 (G032). "Lugar donde pasa la acción" → 에서 (G005).'),
    },
  },
  {
    korean: '무엇이 있어요?',
    question: t('¿Qué hay?'),
    tiles: ['지도가', '있어요', '지도이', '없어요'],
    correctOrder: [0, 1],
    hints: {
      free: t('Pregunta "qué hay" → respondes con [cosa] + 이/가 + 있어요.'),
      premium: t('지도 termina en vocal → usa 가.'),
    },
  },
]

// ─── LEVEL ─────────────────────────────────────────────────────────────────

export const LEVEL_01: Level = {
  id: 'level-01',
  title: t('Una mañana en el minbak'),
  tagline: t('Despiertas en una casa que no es tuya. Huele a arroz recién hecho. Y alguien te dejó una nota.'),
  intro: t(
    'Anoche llegaste empapado a un pueblo sin nombre, en algún lugar entre las montañas y el mar.\n\n' +
      'La única luz encendida era la de un minbak pequeño, con techo de tejas curvas y un farol de papel en la puerta. Una halmeoni te abrió antes de que tocaras: "들어와요, 들어와요" — y sin más preguntas te sirvió sopa caliente y te tendió un futón.\n\n' +
      'Ahora es de mañana. La luz dorada entra por la ventana de papel. La casa está en silencio.\n\n' +
      'Halmeoni no está. Pero sobre la mesa baja hay una nota doblada con tu nombre… y la puerta de entrada tiene un candado que anoche no estaba.',
  ),
  outro: t(
    'El candado cede con un clic suave. La puerta corrediza se abre sola, como si la casa te despidiera.\n\n' +
      'Afuera, el pueblo despierta: humo de desayuno sobre los tejados, una bicicleta que pasa, el mar a lo lejos. Al final de la calle, bajo un toldo de rayas, halmeoni te saluda con la mano desde la puerta del café.\n\n' +
      'Aprendiste a leer sus notas. Mañana — dice ella — te enseñará a regatear en el mercado.',
  ),
  voiceIntro: '잘 잤어요? 안녕!',
  voiceOutro: '잘 가요. 카페에서 봐요!',
  grammarCodes: ['G003', 'G005', 'G012', 'G027', 'G031', 'G032'],
  topikLevel: 1,

  rooms: [
    {
      id: 'room-bedroom',
      title: t('La habitación de huéspedes (손님방)'),
      image: 'rooms/room-01-bedroom.png',
      ambientAudio: 'audio/ambient-bedroom.ogg',
      hotspots: [
        { id: 'note-1', rect: [130, 140, 40, 30], triggersSlot: 'slot-1' },
        { id: 'window', rect: [240, 50, 60, 80], cosmeticDetail: t('Pájaros del amanecer.') },
        { id: 'book', rect: [40, 100, 30, 40], cosmeticDetail: t('한국어 교과서') },
      ],
    },
    {
      id: 'room-living',
      title: t('La sala (거실)'),
      image: 'rooms/room-02-living.png',
      ambientAudio: 'audio/ambient-living.ogg',
      hotspots: [
        { id: 'note-2', rect: [120, 110, 40, 30], triggersSlot: 'slot-2' },
        {
          id: 'photo-halmeoni',
          rect: [40, 50, 50, 50],
          cosmeticDetail: t('할머니는 1965년에 태어났어요.'),
        },
        {
          id: 'phone',
          rect: [100, 130, 40, 30],
          cosmeticDetail: t('Teléfono antiguo. Tono nostálgico.'),
        },
      ],
    },
    {
      id: 'room-kitchen',
      title: t('La cocina (부엌)'),
      image: 'rooms/room-03-kitchen.png',
      ambientAudio: 'audio/ambient-kitchen.ogg',
      hotspots: [
        { id: 'note-3', rect: [30, 60, 40, 30], triggersSlot: 'slot-3' },
        { id: 'kitchen-clock', rect: [150, 30, 30, 30], triggersSlot: 'slot-4' },
        // Five close-up objects used as visual options for Slot 3 (the puzzle picks 4 of them).
        { id: 'obj-fridge', rect: [10, 80, 70, 120], cosmeticDetail: t('Refrigerador. 사과 dentro.') },
        { id: 'obj-table', rect: [130, 130, 70, 60], cosmeticDetail: t('Mesa de comedor (식탁) con 빵.') },
        {
          id: 'obj-cupboard',
          rect: [80, 30, 60, 60],
          cosmeticDetail: t('Alacena (찬장) con 컵.'),
        },
        { id: 'obj-pot', rect: [200, 100, 70, 60], cosmeticDetail: t('Olla (냄비) con 국.') },
        { id: 'obj-bowl', rect: [220, 170, 60, 50], cosmeticDetail: t('Cuenco (그릇) con 밥.') },
      ],
    },
    {
      id: 'room-entrance',
      title: t('La entrada (현관)'),
      image: 'rooms/room-04-entrance.png',
      ambientAudio: 'audio/ambient-entrance.ogg',
      hotspots: [
        { id: 'note-final', rect: [140, 80, 40, 30], triggersSlot: 'slot-5' },
        { id: 'lock', rect: [150, 110, 30, 40], cosmeticDetail: t('Candado con código.') },
        { id: 'shoes', rect: [30, 180, 80, 40], cosmeticDetail: t('Zapatillas listas para salir.') },
      ],
    },
  ],

  slots: [
    {
      id: 'slot-1',
      type: 'selection',
      grammarFocus: ['G027', 'G012', 'G003'],
      candidates: SLOT_1_CANDIDATES,
    },
    {
      id: 'slot-2',
      type: 'completion',
      grammarFocus: ['G003'],
      candidates: SLOT_2_CANDIDATES,
    },
    {
      id: 'slot-3',
      type: 'selection',
      grammarFocus: ['G005', 'G027'],
      candidates: SLOT_3_CANDIDATES,
    },
    {
      id: 'slot-4',
      type: 'creation',
      grammarFocus: ['G031', 'G032', 'G012'],
      candidates: SLOT_4_CANDIDATES,
    },
    {
      id: 'slot-5',
      type: 'creation',
      grammarFocus: ['G005', 'G012', 'G032'],
      candidates: SLOT_5_CANDIDATES,
    },
  ],

  rewards: {
    common: {
      id: 'cosmetic-bg-sunrise',
      image: 'cosmetics/cosmetic-bg-sunrise.png',
      name: t('Fondo "Minbak Sunrise"'),
      description: t('Amanecer rosa-melocotón sobre el techo del hanok.'),
    },
    rare: {
      id: 'cosmetic-frame-apron',
      image: 'cosmetics/cosmetic-frame-apron.png',
      name: t('Marco "Delantal de Halmeoni"'),
      description: t('Marco con estampado de delantal coreano floreado.'),
    },
    epic: {
      id: 'cosmetic-avatar-lantern',
      image: 'cosmetics/cosmetic-avatar-lantern.png',
      name: t('Avatar "Linterna Hanji"'),
      description: t('Silueta animada con linterna de papel coreano.'),
    },
    legendary: {
      id: 'cosmetic-set-complete',
      image: 'cosmetics/cosmetic-set-complete.png',
      name: t('Set completo "민박 손님"'),
      description: t('Avatar + marco + fondo + título "Huésped del minbak".'),
    },
  },

  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 480,
    legendaryCleanRunsRequired: 3,
  },
}

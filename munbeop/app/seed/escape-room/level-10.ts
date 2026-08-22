import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './translations/levels/level-10'

type SelectionRow = readonly [
  korean: string,
  options: readonly [string, string, string, string],
  correct: 0 | 1 | 2 | 3,
  vocabHint: string,
]

function selections(
  question: string,
  premium: string,
  rows: readonly SelectionRow[],
): SelectionCandidate[] {
  return rows.map(([korean, options, correctIndex, free]) => ({
    korean,
    question: t(question),
    options: [t(options[0]), t(options[1]), t(options[2]), t(options[3])],
    correctIndex,
    hints: { free: t(free), premium: t(premium) },
  }))
}

function completions(
  premium: string,
  rows: ReadonlyArray<readonly [string, string, string, string]>,
): CompletionCandidate[] {
  return rows.map(([korean, translation, answer, free]) => ({
    korean,
    translation: t(translation),
    answer,
    hints: { free: t(free), premium: t(premium) },
  }))
}

function creations(
  question: string,
  premium: string,
  rows: ReadonlyArray<readonly [string, readonly string[], readonly number[], string]>,
): CreationCandidate[] {
  return rows.map(([korean, tiles, correctOrder, free]) => ({
    korean,
    question: t(question),
    tiles,
    correctOrder,
    hints: { free: t(free), premium: t(premium) },
  }))
}

const SLOT_1 = selections(
  'La prensa convirtió una concesión en una conclusión absoluta. Elige la lectura exacta de la cláusula.',
  '-기로서니 concede X para rechazar la conclusión exagerada Y: «solo porque X, no significa Y».',
  [
    [
      '국경을 개방하기로서니 모든 검문을 없애자는 뜻은 아닙니다.',
      [
        'Abrir la frontera no significa suprimir todos los controles.',
        'La frontera solo se abrirá cuando desaparezcan todos los controles.',
        'Como se abrieron los controles, también debe cerrarse la frontera.',
        'La delegación ya acordó eliminar cada puesto de inspección.',
      ],
      0,
      '검문 = control fronterizo · 없애다 = eliminar.',
    ],
    [
      '회담이 늦어지기로서니 합의가 실패한 것은 아닙니다.',
      [
        'El retraso prueba que el acuerdo ya fracasó.',
        'Que las conversaciones se retrasen no significa que hayan fracasado.',
        'Las conversaciones fracasarán si vuelven a retrasarse.',
        'El acuerdo se retrasó porque la prensa lo anunció.',
      ],
      1,
      '늦어지다 = retrasarse · 실패하다 = fracasar.',
    ],
    [
      '일부 표현을 고치기로서니 공동 원칙까지 바꾸는 것은 아닙니다.',
      [
        'Corregir algunas expresiones obliga a cambiar todos los principios.',
        'Los principios comunes fueron anulados antes de corregir el texto.',
        'Cambiar algunas expresiones no equivale a cambiar los principios comunes.',
        'Solo pueden corregirse las expresiones que ya sean principios.',
      ],
      2,
      '일부 = una parte · 공동 원칙 = principios comunes.',
    ],
    [
      '한 차례 반대가 있었기로서니 협상을 중단할 이유는 없습니다.',
      [
        'La objeción exige suspender para siempre la negociación.',
        'No hubo ninguna objeción durante la negociación.',
        'La negociación se reanudará únicamente si se retira la objeción.',
        'Una sola objeción no es razón para abandonar la negociación.',
      ],
      3,
      '한 차례 = una vez · 중단하다 = suspender.',
    ],
    [
      '문구가 강하기로서니 상대국을 위협하려는 의도는 아닙니다.',
      [
        'El texto pretende amenazar porque su tono es firme.',
        'Que la redacción sea firme no significa que exista intención de amenazar.',
        'La otra delegación pidió una amenaza redactada con más fuerza.',
        'El tono dejará de ser firme después de que llegue la amenaza.',
      ],
      1,
      '문구 = redacción · 위협하다 = amenazar.',
    ],
  ],
)

const SLOT_2 = completions(
  '-는 마당에 presenta una situación crítica ya vigente: «llegados al punto en que...».',
  [
    [
    '양국 대표가 핵심 조항에 이미 합의한 ___, 초안을 처음부터 다시 쓸 수는 없습니다.',
    'Llegados al punto en que ambas delegaciones ya acordaron las cláusulas esenciales, no podemos reescribir el borrador desde cero.',
      '마당에',
    '핵심 조항 = cláusulas esenciales · 이미 합의하다 = haber acordado ya.',
    ],
    [
      '새벽까지 한 시간밖에 남지 않은 ___, 사소한 표현으로 회담을 멈출 수 없습니다.',
      'Cuando solo queda una hora hasta el amanecer, no podemos detener la cumbre por una expresión menor.',
      '마당에',
      '한 시간밖에 = no queda más que una hora.',
    ],
    [
      '기자들이 결과를 기다리는 ___, 확인되지 않은 소문을 낼 수는 없습니다.',
      'Con los periodistas esperando el resultado, no podemos publicar un rumor sin confirmar.',
      '마당에',
      '소문 = rumor · 확인되다 = confirmarse.',
    ],
    [
      '두 정상이 같은 방에 모인 ___, 대화를 피하는 것은 더 위험합니다.',
      'Ahora que los dos líderes están reunidos, evitar el diálogo es aún más peligroso.',
      '마당에',
      '정상 = jefe de Estado · 모이다 = reunirse.',
    ],
    [
      '통역 기록까지 공개된 ___, 말의 책임을 부인하기는 어렵습니다.',
      'Llegados al punto en que se publicó el registro de interpretación, es difícil negar la responsabilidad.',
      '마당에',
      '공개되다 = hacerse público · 부인하다 = negar.',
    ],
  ],
)

const SLOT_3 = creations(
  'Une las dos garantías en una sola cláusula formal, sin rebajar ninguna.',
  '-거니와 enlaza dos afirmaciones acumulativas en registro literario: no solo A, sino también B.',
  [
    [
      '휴전과 통로',
      ['휴전하거니와', '인도적 통로도', '개방한다', '뿐이지만', '폐쇄한다'],
      [0, 1, 2],
      '휴전하다 = declarar un alto el fuego · 인도적 통로 = corredor humanitario.',
    ],
    [
      '안전과 존엄',
      ['안전을', '보장하거니와', '민간인의 존엄도', '지킨다', '포기하거니와', '위협한다'],
      [0, 1, 2, 3],
      '존엄 = dignidad · 보장하다 = garantizar.',
    ],
    [
      '조사와 공개',
      ['위원회는', '사실을 조사하거니와', '결과도', '공개한다', '숨기거니와', '취소한다'],
      [0, 1, 2, 3],
      '위원회 = comisión · 조사하다 = investigar.',
    ],
    [
      '식량과 의료진',
      ['양국은', '식량을 보내거니와', '의료진도', '파견한다', '막거니와', '돌려보낸다'],
      [0, 1, 2, 3],
      '의료진 = personal médico · 파견하다 = desplegar.',
    ],
    [
      '독립성과 공정성',
      ['감시단은', '독립적이어야 하거니와', '공정하기도', '해야 한다', '종속적이거니와', '침묵한다'],
      [0, 1, 2, 3],
      '감시단 = misión de observación · 공정하다 = ser imparcial.',
    ],
  ],
)

const SLOT_4 = selections(
  'El mapa convierte cada promesa en una condición. Elige la consecuencia exacta.',
  '-(으)ㄹ진대 significa «si de verdad es el caso que...» y presenta una hipótesis formal.',
  [
    [
      '합의를 이행할진대 검증도 받아들여야 합니다.',
      [
        'Si se cumple el acuerdo, también habrá que aceptar la verificación.',
        'La verificación sustituye el cumplimiento del acuerdo.',
        'Aunque se rechace el acuerdo, la inspección ya terminó.',
        'Se aceptó la verificación antes de redactar el acuerdo.',
      ],
      0,
      '이행하다 = cumplir · 검증 = verificación.',
    ],
    [
      '평화를 원할진대 상대의 안전도 존중해야 합니다.',
      [
        'La paz permite ignorar la seguridad de la otra parte.',
        'Si se desea la paz, debe respetarse también la seguridad ajena.',
        'Solo la otra parte tiene obligación de desear la paz.',
        'La seguridad se respetará después de renunciar a la paz.',
      ],
      1,
      '상대 = la otra parte · 존중하다 = respetar.',
    ],
    [
      '국경을 열진대 피난민의 통로를 먼저 확보해야 합니다.',
      [
        'El corredor debe cerrarse antes de abrir la frontera.',
        'Los refugiados solo cruzarán cuando termine la inspección.',
        'Si se abre la frontera, primero debe garantizarse el paso de los refugiados.',
        'La frontera ya está abierta y no requiere garantías.',
      ],
      2,
      '피난민 = refugiados · 확보하다 = asegurar.',
    ],
    [
      '책임을 논할진대 양측의 기록을 함께 보아야 합니다.',
      [
        'Hay que examinar solo el archivo de quien acepta la responsabilidad.',
        'Debe evitarse hablar de responsabilidad mientras existan dos registros.',
        'Hay que destruir ambos archivos antes del debate.',
        'Si se discute la responsabilidad, deben mirarse los registros de ambos lados.',
      ],
      3,
      '양측 = ambos lados · 함께 = conjuntamente.',
    ],
    [
      '공동의 미래를 말할진대 오늘의 희생을 외면해서는 안 됩니다.',
      [
        'Hablar del futuro común exige no ignorar los sacrificios presentes.',
        'El futuro será común únicamente si se olvida lo ocurrido.',
        'Los sacrificios impiden mencionar cualquier futuro.',
        'El memorial se retirará cuando empiece la conversación.',
      ],
      0,
      '희생 = sacrificio · 외면하다 = ignorar.',
    ],
  ],
)

const SLOT_5 = completions(
  '-아/어 주십사 하고 + verbo de petición formula un ruego indirecto de máxima deferencia.',
  [
    [
      '대표단 여러분께서 마지막 문구를 검토해 ___ 부탁드립니다.',
      'Ruego encarecidamente a las delegaciones que revisen la redacción final.',
      '주십사 하고',
      '검토하다 = revisar · 부탁드리다 = solicitar humildemente.',
    ],
    [
      '양측이 민간인 보호를 최우선으로 삼아 ___ 요청합니다.',
      'Solicito humildemente que ambas partes den máxima prioridad a la protección civil.',
      '주십사 하고',
      '최우선으로 삼다 = considerar máxima prioridad.',
    ],
    [
      '서명 전까지 보도 내용을 비공개로 유지해 ___ 말씀드립니다.',
      'Les ruego que mantengan el contenido bajo embargo hasta la firma.',
      '주십사 하고',
      '비공개로 유지하다 = mantener sin publicar.',
    ],
    [
      '남은 쟁점을 대화로 해결해 ___ 호소합니다.',
      'Apelo encarecidamente a resolver mediante diálogo los puntos pendientes.',
      '주십사 하고',
      '쟁점 = punto en disputa · 호소하다 = apelar.',
    ],
    [
      '새벽이 오기 전에 공동 성명을 승인해 ___ 청합니다.',
      'Solicito humildemente que aprueben la declaración conjunta antes del amanecer.',
      '주십사 하고',
      '승인하다 = aprobar · 청하다 = solicitar.',
    ],
  ],
)

const SLOT_6 = creations(
  'Completa la última frase del comunicado con énfasis solemne y estilo escrito.',
  '-(이)야말로 enfatiza «precisamente X»; -ㄴ/는다 cierra la declaración escrita.',
  [
    [
      '대화',
      ['대화야말로', '평화를 시작한다', '대화조차', '끝낸다', '침묵이야말로'],
      [0, 1],
      '시작 = comienzo.',
    ],
    [
      '민간인의 안전',
      ['민간인의 안전이야말로', '모든 결정에 우선한다', '양보일 뿐이다', '나중으로 미룬다'],
      [0, 1],
      '모든 결정에 우선하다 = prevalecer sobre toda decisión.',
    ],
    [
      '투명성',
      ['투명성이야말로', '신뢰를 만든다', '비밀만이', '의심을 숨긴다', '협상이야말로'],
      [0, 1],
      '투명성 = transparencia · 신뢰 = confianza.',
    ],
    [
      '약속',
      ['약속을 지키는 것이야말로', '우리의 의지를 증명한다', '서명을 미룬다', '말을 지운다'],
      [0, 1],
      '의지 = voluntad · 증명하다 = demostrar.',
    ],
    [
      '합의',
      ['이 합의야말로', '공동의 미래를 연다', '과거를 닫았다', '한쪽의 승리이다', '이견이야말로'],
      [0, 1],
      '공동의 미래 = futuro común · 열다 = abrir.',
    ],
  ],
)

export const LEVEL_10: Level = {
  id: 'level-10',
  title: t('La cumbre de medianoche'),
  tagline: t(
    'Dos delegaciones, un castillo neutral y un comunicado que debe firmarse antes del amanecer. Cada matiz puede cerrar una frontera o abrirla. Tú sostienes la última pluma.',
  ),
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  intro: t(
    'El castillo se alza sobre la línea de niebla como si no perteneciera a ninguno de los dos países. A medianoche, las banderas de ambas delegaciones cuelgan inmóviles en el patio neutral. Dentro, una docena de asesores lleva diecisiete horas discutiendo seis párrafos.\n\n' +
      'A las 00:13 desaparece la intérprete principal. Ha dejado sobre su mesa dos tazas frías, un diccionario abierto y una nota: «말이 틀리면 문도 닫힙니다». Si las palabras se equivocan, las puertas también se cierran.\n\n' +
      'La presidenta te entrega el borrador. Hay enmiendas azules de una delegación, rojas de la otra y seis sellos vacíos. Cada sala guarda el contexto de una cláusula: lo que se dijo ante la prensa, lo que se prometió a puerta cerrada y lo que muestran los mapas.\n\n' +
      'Al amanecer vence el alto el fuego provisional. No tienes que traducir palabras sueltas; tienes que impedir que una inferencia exagerada, una condición mal colocada o una cortesía demasiado débil convierta el acuerdo en su contrario.\n\n' +
      'La presidenta abre la galería de prensa. «새벽 전에 끝냅시다.» Terminemos antes del amanecer. La pluma ceremonial pesa más de lo que debería.',
  ),
  outro: t(
    'La última frase queda centrada bajo los dos emblemas: no proclama vencedores, no borra el desacuerdo y no promete una paz fácil. Dice exactamente lo que ambas partes pueden cumplir mañana.\n\n' +
      'Primero firma una delegación. Luego firma la otra. Durante un segundo no sucede nada; después, desde el patio, llegan seis golpes de campana. Los guardias levantan al mismo tiempo las barreras de la carretera del valle.\n\n' +
      'Encuentras a la intérprete principal en la terraza oriental. Lee tu versión sin corregir una sola sílaba y te devuelve la pluma con ambas manos. «이 합의야말로 시작입니다.» Precisamente este acuerdo es el comienzo.\n\n' +
      'Cuando el sol cruza la niebla, las dos delegaciones bajan por la misma escalera, aún separadas por un pasillo estrecho pero caminando en la misma dirección. En la mesa quedan dos tazas frías, seis sellos húmedos y un documento que consiguió que el mundo tuviera mañana.',
  ),
  voiceIntro: '새벽 전에 끝냅시다. 한 문장도 가볍게 쓰면 안 됩니다.',
  voiceOutro: '이 합의야말로 시작입니다. 이제 함께 지켜야 합니다.',
  grammarCodes: ['G201', 'G114', 'G198', 'G124', 'G280', 'G115', 'G122'],
  topikLevel: 6,
  rooms: [
    {
      id: 'room-briefing',
      title: t('La galería de prensa (브리핑실)'),
      image: 'rooms/room-01-briefing-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'press-board', rect: [35, 45, 105, 75], triggersSlot: 'slot-1' },
        {
          id: 'microphones',
          rect: [125, 105, 70, 40],
          cosmeticDetail: t(
            'Todos los micrófonos están encendidos; ninguna frase puede retirarse del aire.',
          ),
        },
        {
          id: 'clock',
          rect: [292, 24, 27, 47],
          cosmeticDetail: t('Las agujas avanzan hacia el amanecer.'),
        },
      ],
    },
    {
      id: 'room-translation',
      title: t('La cámara de traducción (통역실)'),
      image: 'rooms/room-02-translation-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'blue-draft', rect: [48, 90, 82, 58], triggersSlot: 'slot-2' },
        { id: 'red-draft', rect: [180, 92, 82, 58], triggersSlot: 'slot-3' },
        {
          id: 'cold-cups',
          rect: [138, 165, 45, 34],
          cosmeticDetail: t(
            'Dos tazas intactas: alguien esperaba que ambas partes volvieran a sentarse.',
          ),
        },
      ],
    },
    {
      id: 'room-map',
      title: t('La sala de mapas (지도실)'),
      image: 'rooms/room-03-map-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'border-map', rect: [55, 35, 205, 112], triggersSlot: 'slot-4' },
        {
          id: 'civilian-route',
          rect: [110, 150, 96, 52],
          cosmeticDetail: t(
            'Un hilo blanco atraviesa la frontera sin tocar ninguna posición militar.',
          ),
        },
        {
          id: 'memorial-photo',
          rect: [235, 170, 35, 48],
          cosmeticDetail: t('La fotografía no lleva pie. No lo necesita.'),
        },
      ],
    },
    {
      id: 'room-signing',
      title: t('El salón de la firma (서명실)'),
      image: 'rooms/room-04-signing-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'president-note', rect: [35, 112, 70, 58], triggersSlot: 'slot-5' },
        { id: 'final-document', rect: [125, 118, 82, 55], triggersSlot: 'slot-6' },
        {
          id: 'ceremonial-pen',
          rect: [198, 148, 52, 28],
          cosmeticDetail: t('Una pluma, dos firmas y ningún margen para una palabra ambigua.'),
        },
      ],
    },
  ],
  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G201'], candidates: SLOT_1 },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G114'], candidates: SLOT_2 },
    { id: 'slot-3', type: 'creation', grammarFocus: ['G198'], candidates: SLOT_3 },
    { id: 'slot-4', type: 'selection', grammarFocus: ['G124'], candidates: SLOT_4 },
    { id: 'slot-5', type: 'completion', grammarFocus: ['G280'], candidates: SLOT_5 },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G115', 'G122'], candidates: SLOT_6 },
  ],
  scriptedBeats: [
    {
      afterSlotId: 'slot-3',
      voiceLine: '두 문장은 서로 싸우지 않습니다. 함께 서야 합니다.',
      narrative: t(
        'Las versiones azul y roja dejan de competir por espacio y forman una sola promesa. Al encajar la segunda garantía, se desbloquea el cajón de la intérprete: dentro hay un carrete de hilo blanco y una llave con forma de frontera.\n\nLa llave abre la sala de mapas. Allí no importará lo que cada parte desea oír, sino qué consecuencias acepta si sus palabras son verdaderas.',
      ),
    },
    {
      afterSlotId: 'slot-5',
      voiceLine: '명령이 아니라 부탁이어야 합니다.',
      narrative: t(
        'La presidenta lee la petición y asiente. Una orden habría ahorrado tiempo, pero habría perdido una firma. La fórmula más humilde consigue lo que la presión no pudo: ambos líderes vuelven a la mesa.\n\nLos seis sellos vacíos brillan bajo la lámpara. Solo queda escribir la frase que ninguno pueda usar mañana contra el otro.',
      ),
    },
  ],
  rewards: {
    common: {
      id: 'cosmetic-bg-midnight-summit',
      image: 'cosmetics/cosmetic-bg-midnight-summit.webp',
      name: t('Fondo «새벽 회담»'),
      description: t(
        'El refugio diplomático sobre las montañas nevadas, con sus ventanas encendidas hasta el amanecer.',
      ),
    },
    rare: {
      id: 'cosmetic-frame-six-seals',
      image: 'cosmetics/cosmetic-frame-six-seals.png',
      name: t('Marco «여섯 인장»'),
      description: t(
        'Un marco de laca índigo y oro, rodeado de papel marfil y seis sellos de cera roja.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-interpreter-pen',
      image: 'cosmetics/cosmetic-avatar-interpreter-pen.webp',
      name: t('Avatar «마지막 통역관»'),
      description: t(
        'La intérprete de medianoche con auricular y la pluma ceremonial preparada para la última línea.',
      ),
    },
    legendary: {
      id: 'cosmetic-set-dawn-accord',
      image: 'cosmetics/cosmetic-set-dawn-accord.webp',
      name: t('Set completo «새벽의 합의»'),
      description: t(
        'El estuche del acuerdo: documento, seis sellos, pluma ceremonial y la primera luz sobre las montañas.',
      ),
    },
  },
  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 780,
    legendaryCleanRunsRequired: 3,
  },
}

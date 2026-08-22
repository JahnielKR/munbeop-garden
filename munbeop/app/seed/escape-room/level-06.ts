import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './translations/levels/level-06'

/**
 * Level 6 — El estudio de K-drama. Six language locks turn a ruined finale
 * into a live, collaborative rewrite. No audio path is referenced until the
 * corresponding production audio exists.
 */
const selection = (
  korean: string,
  question: string,
  options: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  free: string,
  premium: string,
): SelectionCandidate => ({
  korean,
  question: t(question),
  options: [t(options[0]), t(options[1]), t(options[2]), t(options[3])],
  correctIndex,
  hints: { free: t(free), premium: t(premium) },
})

const completion = (
  korean: string,
  translation: string,
  answer: string,
  free: string,
  premium: string,
): CompletionCandidate => ({
  korean,
  translation: t(translation),
  answer,
  hints: { free: t(free), premium: t(premium) },
})

const creation = (
  korean: string,
  question: string,
  tiles: readonly string[],
  correctOrder: readonly number[],
  free: string,
  premium: string,
): CreationCandidate => ({
  korean,
  question: t(question),
  tiles,
  correctOrder,
  hints: { free: t(free), premium: t(premium) },
})

// Slot 1 · The stained script · reported statements (-다고 하다)
const SLOT_1: SelectionCandidate[] = [
  selection(
    '작가님이 주인공은 마지막 장면에서 떠난다고 했어요.',
    '¿Qué decisión dejó escrita la guionista?',
    [
      'Dijo que el protagonista se marcha en la escena final.',
      'Le ordenó al protagonista que se marchara en la escena final.',
      'Preguntó si el protagonista se marchaba en la escena final.',
      'Propuso que todos se marcharan en la escena final.',
    ],
    0,
    '떠나다 = marcharse · 마지막 장면 = escena final.',
    '-다고 했어요 (G089) transmite una afirmación. Una orden sería -(으)라고, una pregunta -냐고 y una propuesta -자고.',
  ),
  selection(
    '소품 팀이 파란 우산은 가짜라고 했어요.',
    '¿Qué informó el equipo de utilería?',
    [
      'Preguntó dónde estaba el paraguas azul.',
      'Dijo que el paraguas azul era falso.',
      'Pidió que usaran un paraguas azul falso.',
      'Propuso pintar de azul el paraguas.',
    ],
    1,
    '소품 팀 = utilería · 가짜 = falso, de atrezo.',
    'Con sustantivo + 이라고/라고 했어요 se cita una afirmación: 가짜라고 했어요 = «dijo que era falso».',
  ),
  selection(
    '조명 감독이 해 질 무렵의 빛이 가장 좋다고 했어요.',
    '¿Qué dijo el director de iluminación?',
    [
      'Ordenó apagar todas las luces al anochecer.',
      'Preguntó si quedaba luz al anochecer.',
      'Dijo que la luz del atardecer era la mejor.',
      'Propuso rodar únicamente de noche.',
    ],
    2,
    '해 질 무렵 = al caer el sol · 가장 좋다 = ser lo mejor.',
    '좋다고 했어요 es discurso indirecto declarativo (G089): conserva la afirmación, no la convierte en pregunta ni orden.',
  ),
  selection(
    '배우가 이 대사는 너무 뻔하다고 했어요.',
    '¿Qué opinión dio el actor sobre la frase?',
    [
      'Dijo que era demasiado larga.',
      'Preguntó por qué era tan obvia.',
      'Pidió eliminarla por completo.',
      'Dijo que era demasiado predecible.',
    ],
    3,
    '대사 = diálogo · 뻔하다 = obvio, predecible.',
    'El adjetivo se reporta con -다고 하다: 뻔하다고 했어요. La frase informa una opinión, no una instrucción.',
  ),
  selection(
    '제작진이 오늘 촬영은 생방송처럼 진행된다고 했어요.',
    '¿Qué avisó el equipo de producción?',
    [
      'Que el rodaje de hoy se desarrollaría como si fuera en directo.',
      'Que el rodaje de hoy se emitiría realmente en directo.',
      'Que hoy no habría rodaje por un problema técnico.',
      'Que el público dirigiría la escena de hoy.',
    ],
    0,
    '제작진 = producción · 생방송처럼 = como una emisión en directo.',
    '진행된다고 했어요 reporta el hecho (G089). -처럼 aporta «como si», por lo que no afirma que sea una emisión real.',
  ),
]

// Slot 2 · Assistant director's call sheet · reported commands
const SLOT_2: CompletionCandidate[] = [
  completion(
    '감독님이 카메라를 먼저 ___ 했어요.',
    'La directora dijo que encendieran primero la cámara.',
    '켜라고',
    '켜다 = encender. La orden original sería «카메라를 켜!».',
    'Una orden citada usa V-(으)라고 하다 (G090): 켜다 termina en vocal → 켜라고 했어요.',
  ),
  completion(
    '조감독이 엑스트라들은 표시선 뒤에서 ___ 했어요.',
    'El ayudante dijo a los extras que esperaran detrás de la marca.',
    '기다리라고',
    '기다리다 = esperar · 표시선 = marca de posición.',
    'La raíz termina en vocal: 기다리다 → 기다리라고 했어요 (G090).',
  ),
  completion(
    '음향 감독이 휴대 전화를 모두 ___ 했어요.',
    'El técnico de sonido dijo que apagaran todos los teléfonos.',
    '끄라고',
    '끄다 = apagar · 휴대 전화 = teléfono móvil.',
    '끄다 pierde 다 y toma -라고: 끄라고 했어요. 끈다고 reportaría una afirmación.',
  ),
  completion(
    '분장 팀장이 비를 맞기 전에 가발을 ___ 했어요.',
    'La jefa de maquillaje dijo que fijaran la peluca antes de mojarse.',
    '고정하라고',
    '가발 = peluca · 고정하다 = fijar.',
    'El mandato indirecto exige -(으)라고 (G090): 고정하라고 했어요.',
  ),
  completion(
    '스크립터가 우산을 왼손으로 ___ 했어요.',
    'La responsable de continuidad dijo que sujetaran el paraguas con la mano izquierda.',
    '들라고',
    '들다 = sostener · 왼손 = mano izquierda.',
    'Con una raíz acabada en ㄹ, la orden citada es 들라고; 들으라고 pertenece a 듣다, escuchar.',
  ),
]

// Slot 3 · Press cards · reported questions
const SLOT_3: CreationCandidate[] = [
  creation(
    '기자가 “결말이 슬퍼요?”라고 물었습니다. 어떻게 전달합니까?',
    'Construye: «La periodista preguntó si el final era triste».',
    ['기자가', '결말이', '슬프냐고', '물었습니다', '슬프다고', '떠나라고'],
    [0, 1, 2, 3],
    '슬프다 = estar triste · 결말 = desenlace.',
    'Pregunta indirecta con adjetivo: 슬프냐고 물었습니다 (G091). -다고 la convertiría en afirmación.',
  ),
  creation(
    '감독이 “왜 웃었어요?”라고 물었습니다. 어떻게 전달합니까?',
    'Construye: «La directora preguntó por qué se había reído».',
    ['감독이', '왜', '웃었냐고', '물었습니다', '웃었다고', '웃으라고'],
    [0, 1, 2, 3],
    '왜 = por qué · 웃다 = reírse.',
    'La pregunta en pasado conserva -었- antes de -냐고: 웃었냐고 물었습니다 (G091).',
  ),
  creation(
    '배우가 “다음 장면은 어디예요?”라고 물었습니다. 어떻게 전달합니까?',
    'Construye: «El actor preguntó dónde era la siguiente escena».',
    ['배우가', '다음', '장면이', '어디냐고', '물었습니다', '어디라고'],
    [0, 1, 2, 3, 4],
    '다음 장면 = siguiente escena · 어디 = dónde.',
    'Tras un sustantivo, la pregunta citada usa -(이)냐고: 어디냐고 물었습니다.',
  ),
  creation(
    '스태프가 “비가 언제 그쳐요?”라고 물었습니다. 어떻게 전달합니까?',
    'Construye: «El personal preguntó cuándo pararía la lluvia».',
    ['스태프가', '비가', '언제', '그치냐고', '물었습니다', '그친다고'],
    [0, 1, 2, 3, 4],
    '그치다 = parar (la lluvia) · 언제 = cuándo.',
    'Una pregunta abierta también usa -냐고: 언제 그치냐고 물었습니다.',
  ),
  creation(
    '작가가 “이 장면을 다시 찍을 수 있어요?”라고 물었습니다. 어떻게 전달합니까?',
    'Construye: «La guionista preguntó si podían rodar esta escena otra vez».',
    ['작가가', '이', '장면을', '다시', '찍을', '수', '있냐고', '물었습니다', '있다고'],
    [0, 1, 2, 3, 4, 5, 6, 7],
    '다시 찍다 = volver a rodar · -(으)ㄹ 수 있다 = poder.',
    'La interrogación recae sobre 있다: 찍을 수 있냐고 물었습니다 (G091).',
  ),
]

// Slot 4 · Continuity monitor · interruption and change (-다가)
const SLOT_4: SelectionCandidate[] = [
  selection(
    '주인공이 문을 열다가 갑자기 뒤를 돌아봅니다.',
    '¿Qué acción debe captar la cámara?',
    [
      'Abre la puerta por completo y luego se gira.',
      'Mientras estaba abriendo la puerta, de pronto se gira.',
      'Se gira antes de acercarse a la puerta.',
      'Finge abrir la puerta sin tocarla.',
    ],
    1,
    '문을 열다 = abrir la puerta · 뒤를 돌아보다 = volverse.',
    '-다가 (G087) marca una acción en curso interrumpida por otra.',
  ),
  selection(
    '두 사람이 말다툼하다가 동시에 웃음을 터뜨립니다.',
    '¿Cómo cambia la escena?',
    [
      'Discuten hasta que uno abandona el plató.',
      'Se ríen primero y luego empiezan a discutir.',
      'Fingen discutir sin mirarse.',
      'Están discutiendo y de pronto ambos rompen a reír.',
    ],
    3,
    '말다툼하다 = discutir · 웃음을 터뜨리다 = estallar en risas.',
    'A-다가 B: B irrumpe mientras A estaba en marcha. La discusión se transforma de golpe en risa.',
  ),
  selection(
    '비를 맞으며 달리다가 신발 한 짝이 벗겨집니다.',
    '¿Qué gag de continuidad aparece?',
    [
      'Mientras corre bajo la lluvia, se le sale un zapato.',
      'Se quita los zapatos antes de correr.',
      'Corre para recuperar un zapato perdido.',
      'Finge que sus zapatos están mojados.',
    ],
    0,
    '신발 한 짝 = un zapato del par · 벗겨지다 = salirse.',
    '달리다가 sitúa la pérdida en medio de correr (G087), no antes.',
  ),
  selection(
    '카메라가 두 배우를 비추다가 빈 의자에서 멈춥니다.',
    '¿Qué hace el movimiento de cámara?',
    [
      'Empieza en una silla vacía y acaba mostrando a los actores.',
      'Alterna varias veces entre los actores y la silla.',
      'Encuadra a los actores y, en pleno movimiento, se detiene en una silla vacía.',
      'Mantiene la silla fuera del plano.',
    ],
    2,
    '비추다 = enfocar · 멈추다 = detenerse.',
    '비추다가 멈춥니다 describe el cambio de una acción en curso a otra (G087).',
  ),
  selection(
    '주인공이 대사를 하다가 카메라를 직접 바라봅니다.',
    '¿Dónde está el momento meta del plano?',
    [
      'Pronuncia el diálogo mirando siempre a cámara.',
      'Ensaya el diálogo después de mirar a cámara.',
      'Olvida el diálogo y sale del encuadre.',
      'En mitad de su diálogo, mira directamente a cámara.',
    ],
    3,
    '대사를 하다 = decir el diálogo · 직접 바라보다 = mirar directamente.',
    '-다가 coloca la ruptura de la cuarta pared durante el diálogo.',
  ),
]

// Slot 5 · Acting notes · pretending
const SLOT_5: CompletionCandidate[] = [
  completion(
    '범인을 알아도 모르는 ___ 연기하세요.',
    'Aunque conozca al culpable, actúe como si no lo supiera.',
    '척하고',
    '모르다 = no saber · 연기하다 = actuar.',
    'V/A-(으)ㄴ/는 척하다 (G094) = fingir: 모르는 척하고 연기하세요.',
  ),
  completion(
    '우산이 망가졌지만 괜찮은 ___ 계속 걸으세요.',
    'Aunque el paraguas se rompió, siga andando como si todo estuviera bien.',
    '척하고',
    '괜찮다 = estar bien · 계속 = continuar.',
    'El adjetivo toma -(으)ㄴ 척하다: 괜찮은 척하고.',
  ),
  completion(
    '카메라를 봤지만 못 본 ___ 자연스럽게 웃으세요.',
    'Aunque vio la cámara, sonría fingiendo no haberla visto.',
    '척하고',
    '못 보다 = no poder ver · 자연스럽게 = con naturalidad.',
    'Se usa 못 본 척하고: modificador pasado de 보다 + 척하다.',
  ),
  completion(
    '이미 결말을 알지만 처음 듣는 ___ 놀라세요.',
    'Ya conoce el final, pero sorpréndase como si lo oyera por primera vez.',
    '척하고',
    '처음 듣다 = oír por primera vez · 놀라다 = sorprenderse.',
    '듣는 척하다 expresa fingir una acción en curso (G094).',
  ),
  completion(
    '넘어질 때 아프지 않은 ___ 바로 일어나세요.',
    'Al caer, levántese enseguida fingiendo que no le duele.',
    '척하고',
    '아프다 = doler · 바로 = enseguida.',
    'El adjetivo negativo forma 아프지 않은 척하다.',
  ),
]

// Slot 6 · Rewrite the ending · reported proposal (-자고 하다)
const SLOT_6: CreationCandidate[] = [
  creation(
    '감독: “마지막 장면을 다시 찍읍시다.” 회의록에 어떻게 씁니까?',
    'Construye: «La directora propuso volver a rodar la última escena».',
    ['감독이', '마지막', '장면을', '다시', '찍자고', '했습니다', '찍으라고', '찍는다고'],
    [0, 1, 2, 3, 4, 5],
    '다시 찍다 = volver a rodar.',
    'La propuesta «hagamos» se reporta con V-자고 하다 (G092): 찍자고 했습니다.',
  ),
  creation(
    '작가: “뻔한 이별 대신 같이 웃읍시다.” 어떻게 전달합니까?',
    'Construye: «La guionista propuso que, en vez de una despedida predecible, riéramos juntos».',
    ['작가가', '뻔한', '이별', '대신', '같이', '웃자고', '했습니다', '웃는다고'],
    [0, 1, 2, 3, 4, 5, 6],
    '대신 = en vez de · 같이 웃다 = reír juntos.',
    '웃읍시다 pasa a 웃자고 했습니다 en discurso indirecto de propuesta.',
  ),
  creation(
    '배우들: “엑스트라도 마지막 인사를 합시다.” 어떻게 전달합니까?',
    'Construye: «Los actores propusieron que los extras también hicieran el saludo final».',
    ['배우들이', '엑스트라도', '마지막', '인사를', '하자고', '했습니다', '하라고', '한다고'],
    [0, 1, 2, 3, 4, 5],
    '엑스트라도 = los extras también · 인사를 하다 = saludar.',
    '합시다 es una invitación colectiva; al citarla se transforma en 하자고 했습니다.',
  ),
  creation(
    '촬영 팀: “비가 그치기 전에 한 번 더 갑시다.” 어떻게 전달합니까?',
    'Construye: «El equipo propuso hacer una toma más antes de que parara la lluvia».',
    ['촬영', '팀이', '비가', '그치기', '전에', '한', '번', '더', '가자고', '했습니다', '가라고'],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    '한 번 더 가다 = hacer otra toma · 그치기 전에 = antes de que pare.',
    'La voz de equipo «갑시다» se reporta como 가자고 했습니다 (G092).',
  ),
  creation(
    '당신: “주인공만의 결말이 아니라 우리 모두의 결말로 만듭시다.” 어떻게 전달합니까?',
    'Construye: «Propusiste convertirlo en el final de todos, no solo del protagonista».',
    [
      '당신이',
      '주인공만의',
      '결말이',
      '아니라',
      '우리',
      '모두의',
      '결말로',
      '만들자고',
      '했습니다',
      '만든다고',
    ],
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
    '모두의 = de todos · -(으)로 만들다 = convertir en.',
    '만듭시다 → 만들자고 했습니다. -자고 preserva que fue una propuesta conjunta.',
  ),
]

export const LEVEL_06: Level = {
  id: 'level-06',
  title: t('El estudio de K-drama'),
  tagline: t(
    'El protagonista no llegó, el guion está empapado y la directora acaba de señalarte: reconstruye el episodio mientras las cámaras siguen grabando.',
  ),
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  intro: t(
    'Llegaste a 한여름 스튜디오 para cruzar un pasillo con una bandeja y desaparecer del plano. Ese era todo tu trabajo como extra número cuarenta y siete. A las seis y doce, una nube artificial descarga antes de tiempo, el guion maestro se convierte en papel maché y alguien anuncia que el protagonista sigue atrapado en el tráfico.\n\n' +
      'La directora 서미라 no grita. Eso resulta más inquietante. Mira el reloj, mira el cielo pintado del ciclorama y luego te mira a ti. «한국어 할 줄 알죠?» Sabes coreano, ¿verdad? Antes de que puedas matizar la respuesta, te coloca en las manos la claqueta del episodio dieciséis.\n\n' +
      'El estudio está dividido en cuatro mundos que no deberían tocarse: la sala de guion cubierta de notas, maquillaje con pelucas de tres décadas, una azotea falsa donde llueve bajo techo y la cabina de edición, desde la que ya os observan miles de espectadores de una retransmisión promocional que nadie recordó cancelar.\n\n' +
      'Para reconstruir la escena tendrás que distinguir lo que la guionista dijo, lo que la directora ordenó, lo que los periodistas preguntaron y lo que el reparto propuso. Una terminación equivocada no cambia solo la gramática: cambia quién manda, quién pregunta y quién carga con un final que nunca eligió.\n\n' +
      'La luz del atardecer dura once minutos. 서미라 levanta la mano. «대본부터 살립시다. 카메라는 이미 돌고 있으니까요.» Salvemos primero el guion. La cámara ya está rodando. En algún monitor aparece un rótulo rojo, y el extra número cuarenta y siete entra, sin querer, en su primer plano.',
  ),
  outro: t(
    'La claqueta golpea por última vez. Nadie dice «corten» durante tres segundos enteros: el tiempo justo para que la lluvia mecánica se apague, una gota resbale por la nariz postiza del detective y todo el equipo comprenda que la toma funciona.\n\n' +
      'Tu propuesta queda en el centro del episodio: «{farewell}». Ya no es el final de una estrella ausente, sino el de todos los que sostenían reflectores, arreglaban pelucas y empujaban lluvia desde fuera del encuadre. Uno por uno, los extras miran a cámara y completan la despedida. Es descaradamente sentimental. También es perfecta.\n\n' +
      'Entonces se abre la puerta lateral. El protagonista llega con el casco de moto bajo el brazo, empapado de lluvia real, preparado para disculparse. Ve el monitor, ve tu primer plano y pregunta si todavía queda algún papel. 서미라 le entrega la bandeja del extra número cuarenta y siete. El equipo intenta no reírse y fracasa de manera profesional.\n\n' +
      'En la cabina, el contador de espectadores sube. La guionista escribe un nuevo título sobre el guion seco: «El personaje que estaba fuera de plano». Debajo anota que la mejor escena nació de seis errores corregidos a tiempo y de una persona que supo escuchar exactamente qué había dicho cada cual.\n\n' +
      'Cuando sales ya es de noche. Conservas una copia de la claqueta y una frase de la directora: «대사는 배우가 하지만, 장면은 모두가 만들어요.» El actor dice el diálogo, pero la escena la hace todo el mundo. Esta vez sí sabes cómo citarla sin cambiarle el sentido.',
  ),
  voiceIntro: '한국어 할 줄 알죠? 대본부터 살립시다. 카메라는 이미 돌고 있으니까요.',
  voiceOutro: '좋아요, 컷! 대사는 배우가 하지만 장면은 모두가 만들어요.',
  grammarCodes: ['G089', 'G090', 'G091', 'G092', 'G087', 'G094'],
  topikLevel: 4,
  rooms: [
    {
      id: 'room-script',
      title: t('La sala de guion (대본실)'),
      image: 'rooms/room-01-script-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'master-script', rect: [105, 112, 100, 76], triggersSlot: 'slot-1' },
        { id: 'call-sheet', rect: [235, 45, 55, 82], triggersSlot: 'slot-2' },
        {
          id: 'coffee',
          rect: [34, 166, 35, 32],
          cosmeticDetail: t(
            'El café derramado ha convertido el episodio dieciséis en arte abstracto.',
          ),
        },
        {
          id: 'storyboard',
          rect: [18, 28, 78, 55],
          cosmeticDetail: t(
            'En todos los dibujos llueve. El presupuesto meteorológico explica muchas decisiones creativas.',
          ),
        },
      ],
    },
    {
      id: 'room-makeup',
      title: t('Maquillaje y vestuario (분장실)'),
      image: 'rooms/room-02-makeup-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'press-cards', rect: [110, 168, 100, 48], triggersSlot: 'slot-3' },
        {
          id: 'wigs',
            rect: [157, 43, 80, 116],
          cosmeticDetail: t('Tres décadas de peinados televisivos contemplan tus decisiones.'),
        },
        {
          id: 'mirror',
          rect: [54, 38, 104, 88],
          cosmeticDetail: t(
            'En el espejo, el extra número cuarenta y siete ya parece sospechosamente protagonista.',
          ),
        },
      ],
    },
    {
      id: 'room-set',
      title: t('La azotea bajo la lluvia (옥상 세트)'),
      image: 'rooms/room-03-set-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'continuity-monitor', rect: [18, 120, 75, 58], triggersSlot: 'slot-4' },
        { id: 'acting-notes', rect: [208, 138, 70, 48], triggersSlot: 'slot-5' },
        {
          id: 'rain-rig',
          rect: [20, 20, 80, 48],
          cosmeticDetail: t('La lluvia cae con precisión contractual: solo dentro del encuadre.'),
        },
        {
          id: 'blue-umbrella',
          rect: [135, 102, 58, 85],
          cosmeticDetail: t('El paraguas azul es falso. La humedad, sorprendentemente, no.'),
        },
      ],
    },
    {
      id: 'room-editing',
      title: t('La cabina de edición (편집실)'),
      image: 'rooms/room-04-editing-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'final-cut', rect: [92, 58, 136, 82], triggersSlot: 'slot-6' },
        {
          id: 'viewer-counter',
          rect: [242, 32, 58, 38],
          cosmeticDetail: t(
            'El contador sube. Ahora ya no es posible fingir que esto era un ensayo.',
          ),
        },
        {
          id: 'clapperboard',
          rect: [30, 165, 55, 42],
          cosmeticDetail: t('Episodio 16 · toma: demasiadas · resultado: todavía prometedor.'),
        },
      ],
    },
  ],
  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G089'], candidates: SLOT_1 },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G090'], candidates: SLOT_2 },
    { id: 'slot-3', type: 'creation', grammarFocus: ['G091'], candidates: SLOT_3 },
    { id: 'slot-4', type: 'selection', grammarFocus: ['G087'], candidates: SLOT_4 },
    { id: 'slot-5', type: 'completion', grammarFocus: ['G094'], candidates: SLOT_5 },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G092'], candidates: SLOT_6 },
  ],
  scriptedBeats: [
    {
      afterSlotId: 'slot-3',
      voiceLine: '잠깐, 지금 이 장면… 우리 이야기잖아요?',
      narrative: t(
        'Las tarjetas de prensa encajan y revelan una nota al dorso: la retransmisión promocional nunca se detuvo. El público lleva viendo todo —la peluca torcida, la discusión sobre el paraguas y tu intento de esconderte detrás de una planta demasiado pequeña.\n\n서미라 observa el contador y toma una decisión peligrosamente televisiva: no ocultar el accidente, sino convertirlo en la escena. El final ya no debe parecer perfecto. Debe mostrar cómo se fabrica una ficción cuando todo sale mal.',
      ),
    },
    {
      afterSlotId: 'slot-5',
      voiceLine: '주인공을 기다리지 말고, 우리 결말을 만듭시다.',
      narrative: t(
        'Las notas de interpretación terminan con una instrucción subrayada: «No finjas estar solo». Comprendes que la silla vacía del storyboard no esperaba al protagonista ausente; reservaba un lugar para cualquiera capaz de compartir el plano.\n\nLa directora abre el canal de comunicación con todo el estudio. Falta una última decisión, y esta vez no será una orden. Será una propuesta construida entre todos.',
      ),
    },
  ],
  rewards: {
    common: {
      id: 'cosmetic-bg-summer-studio',
      image: 'cosmetics/cosmetic-bg-summer-studio.webp',
      name: t('Fondo «한여름 세트»'),
      description: t(
        'La azotea televisiva al atardecer, con lluvia mecánica y el borde del ciclorama revelando el truco.',
      ),
    },
    rare: {
      id: 'cosmetic-frame-clapperboard',
      image: 'cosmetics/cosmetic-frame-clapperboard.png',
      name: t('Marco «마지막 테이크»'),
      description: t(
        'Un marco de claqueta, cinta de cámara y pequeñas marcas de continuidad en azul eléctrico.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-extra-47',
      image: 'cosmetics/cosmetic-avatar-extra-47.png',
      name: t('Avatar «엑스트라 47번»'),
      description: t(
        'El extra número cuarenta y siete con paraguas azul y expresión de protagonista accidental.',
      ),
    },
    legendary: {
      id: 'cosmetic-set-complete-06',
      image: 'cosmetics/cosmetic-set-complete-06.png',
      name: t('Set completo «카메라는 돌고 있다»'),
      description: t(
        'El estudio completo en plena toma: lluvia, focos, monitores y todo el equipo entrando por fin en el encuadre.',
      ),
    },
  },
  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

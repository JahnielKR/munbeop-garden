import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './locale'

/**
 * Level 7 — El retiro de la empresa. A formal TOPIK 4 teamwork mystery:
 * honorifics open the lodge, written instructions cross the mountain, and a
 * joint proposal replaces the expected winner-takes-all ending.
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

// Slot 1 · Reception protocol · honorific subject, recipient and vocabulary
const SLOT_1: SelectionCandidate[] = [
  selection(
    '잠시 후에 본부장님께서 도착하십니다.',
    '¿Qué anuncia la recepcionista de manera honorífica?',
    [
      'Que la directora general llegará dentro de poco.',
      'Que alguien debe llevarle algo a la directora general.',
      'Que la directora general ya se marchó.',
      'Que preguntaron cuándo llegaría la directora general.',
    ],
    0,
    '본부장님 = directora general · 도착하다 = llegar · 잠시 후 = dentro de poco.',
    '께서 honra al sujeto y -(으)시- honra su acción: 도착하십니다. La doble marca es coherente en registro formal.',
  ),
  selection(
    '제가 대표님께 일정표를 드리겠습니다.',
    '¿Qué se compromete a hacer la coordinadora?',
    [
      'Recibirá el horario de manos del presidente.',
      'Entregará el horario al presidente.',
      'Pedirá al presidente que prepare el horario.',
      'Entregará el horario a un compañero de su mismo rango.',
    ],
    1,
    '대표님 = presidente · 일정표 = horario · 드리다 = dar humildemente.',
    '께 marca al receptor honrado y 드리다 es el humilde de 주다: la acción va de «yo» al presidente.',
  ),
  selection(
    '팀장님께서는 지금 회의실에 계십니다.',
    '¿Qué información formal transmite la nota?',
    [
      'La jefa de equipo se dirige ahora a la sala.',
      'La jefa de equipo reservó la sala.',
      'La jefa de equipo está ahora en la sala de reuniones.',
      'El equipo espera fuera de la sala.',
    ],
    2,
    '회의실 = sala de reuniones · 계시다 = forma honorífica de 있다.',
    'Para una persona honrada no se usa 있어요, sino 계시다; 께서는 identifica además el tema-sujeto respetado.',
  ),
  selection(
    '부장님께 안내 사항을 여쭤보겠습니다.',
    '¿Qué expresa la persona que habla?',
    [
      'Dará instrucciones al director de departamento.',
      'Repetirá públicamente las palabras del director.',
      'Pedirá a un compañero que llame al director.',
      'Consultará respetuosamente al director sobre las instrucciones.',
    ],
    3,
    '여쭤보다 = preguntar humildemente · 안내 사항 = indicaciones o asuntos informativos.',
    '여쭤보다 baja al hablante ante el interlocutor; 께 marca al director como destinatario honrado.',
  ),
  selection(
    '이사님께서 먼저 진지를 드신 후에 출발하십니다.',
    '¿Cuál es la secuencia anunciada?',
    [
      'La consejera comerá primero y después saldrá.',
      'Servirán primero la comida a la consejera y los demás saldrán.',
      'La consejera saldrá antes de comer.',
      'La consejera pidió que nadie comiera.',
    ],
    0,
    '진지 = comida honorífica · 드시다 = comer honorífico · 후에 = después.',
    '께서 + 드시다 + 출발하시다 mantienen al mismo sujeto honrado. -(으)ㄴ 후에 fija comer antes de salir.',
  ),
]

// Slot 2 · Safety briefing · formal «before»
const SLOT_2: CompletionCandidate[] = [
  completion(
    '산행을 시작하___ 참가자 명단을 확인하겠습니다.',
    'Antes de iniciar la caminata, comprobaremos la lista de participantes.',
    '기에 앞서',
    '산행 = caminata de montaña · 명단 = lista.',
    '-기에 앞서 (G175) es «antes de» en registro escrito/formal: 시작하기에 앞서.',
  ),
  completion(
    '팀을 나누___ 안전 수칙을 설명드리겠습니다.',
    'Antes de dividir los equipos, explicaremos las normas de seguridad.',
    '기에 앞서',
    '팀을 나누다 = dividir los equipos · 안전 수칙 = normas de seguridad.',
    'La raíz verbal toma -기에 앞서: 나누기에 앞서. 설명드리겠습니다 aporta humildad formal.',
  ),
  completion(
    '야간 활동에 참여하___ 손전등을 점검하십시오.',
    'Antes de participar en la actividad nocturna, revise la linterna.',
    '기에 앞서',
    '야간 활동 = actividad nocturna · 손전등 = linterna.',
    '참여하다 → 참여하기에 앞서 (G175). Es más formal que 참여하기 전에.',
  ),
  completion(
    '계곡을 건너___ 반드시 인솔자의 지시를 들으십시오.',
    'Antes de cruzar el arroyo, escuche sin falta las instrucciones del guía.',
    '기에 앞서',
    '계곡 = arroyo/valle · 인솔자 = guía responsable · 반드시 = sin falta.',
    '건너다 + -기에 앞서 → 건너기에 앞서. La forma encaja con el aviso institucional.',
  ),
  completion(
    '최종 상자를 열___ 모든 팀원이 모였는지 확인하십시오.',
    'Antes de abrir la caja final, compruebe que estén todos los miembros.',
    '기에 앞서',
    '최종 상자 = caja final · 모이다 = reunirse.',
    '열다 conserva ㄹ: 열기에 앞서. La instrucción impide que un solo participante abra la caja.',
  ),
]

// Slot 3 · Trail markers · follow exactly as instructed (-(으)ㄴ/는 대로)
const SLOT_3: CreationCandidate[] = [
  creation(
    '지도에 표시된 길을 그대로 따르십시오.',
    'Construye la instrucción formal: «Avance tal como está marcado en el mapa».',
    ['지도에', '표시된', '대로', '이동하십시오', '표시해서', '이동했지만'],
    [0, 1, 2, 3],
    '표시되다 = estar marcado · 이동하다 = desplazarse.',
    'Participio + 대로 (G097) = tal como: 지도에 표시된 대로 이동하십시오.',
  ),
  creation(
    '인솔자가 보여 준 방법을 그대로 따라 하십시오.',
    'Construye: «Hágalo tal como se lo mostró el guía».',
    ['인솔자가', '보여', '준', '대로', '따라', '하십시오', '보여서'],
    [0, 1, 2, 3, 4, 5],
    '보여 주다 = mostrar · 따라 하다 = imitar, seguir.',
    '보여 준 대로 = según lo que mostró (G097). El participio pasado modifica 대로.',
  ),
  creation(
    '무전으로 들은 순서와 똑같이 버튼을 누르십시오.',
    'Construye: «Pulse los botones en el orden que oyó por radio».',
    ['무전으로', '들은', '순서대로', '버튼을', '누르십시오', '듣는', '버튼으로'],
    [0, 1, 2, 3, 4],
    '무전 = radio · 순서대로 = en el orden indicado.',
    '들은 순서대로 expresa «en el orden que se oyó». 대로 fija conformidad exacta.',
  ),
  creation(
    '각자 맡은 역할에 맞게 움직이십시오.',
    'Construye: «Actúe conforme al papel que se le asignó».',
    ['각자', '맡은', '역할대로', '움직이십시오', '맡아서', '역할로써'],
    [0, 1, 2, 3],
    '각자 = cada cual · 맡다 = asumir/recibir una tarea · 역할 = papel.',
    '역할대로 = conforme al papel. N대로 puede unirse directamente al sustantivo.',
  ),
  creation(
    '계획은 바뀌었지만 현장에서 정한 방식으로 하십시오.',
    'Construye: «Hágalo tal como se decidió sobre el terreno».',
    ['현장에서', '정한', '대로', '진행하십시오', '정하는', '불구하고'],
    [0, 1, 2, 3],
    '현장 = lugar de la actividad · 정하다 = decidir.',
    '정한 대로 (G097) remite a una decisión ya tomada; 정하는 대로 sería «en cuanto se decida».',
  ),
]

// Slot 4 · Equipment locker · role versus means (-(으)로서 / -(으)로써)
const SLOT_4: SelectionCandidate[] = [
  selection(
    '신입 사원으로서 먼저 팀원들의 의견을 듣겠습니다.',
    '¿Qué matiz tiene 신입 사원으로서?',
    [
      'Mediante un empleado nuevo.',
      'En calidad de empleado nuevo.',
      'A causa de ser empleado nuevo.',
      'A pesar de ser empleado nuevo.',
    ],
    1,
    '신입 사원 = empleado nuevo · 의견 = opinión.',
    '-(으)로서 (G174) marca rol o condición: «en calidad de». El medio/instrumento sería -(으)로써.',
  ),
  selection(
    '이 밧줄로써 상자를 안전하게 끌어올릴 수 있습니다.',
    '¿Qué función cumple 로써?',
    [
      'Marca la cuerda como destino.',
      'Presenta la cuerda como miembro del equipo.',
      'Marca la cuerda como instrumento para subir la caja.',
      'Compara la cuerda con la caja.',
    ],
    2,
    '밧줄 = cuerda · 끌어올리다 = izar.',
    '-(으)로써 (G174) marca el medio o instrumento. La cuerda no desempeña un rol social.',
  ),
  selection(
    '팀 대표로서 결과를 보고드리겠습니다.',
    '¿Cómo se presenta quien habla?',
    [
      'Como representante del equipo, informará de los resultados.',
      'Informará mediante un representante externo.',
      'Elegirá al representante usando los resultados.',
      'Pese a ser representante, no informará.',
    ],
    0,
    '팀 대표 = representante del equipo · 보고드리다 = informar humildemente.',
    '대표로서 describe la función que asume la persona: «como representante» (G174).',
  ),
  selection(
    '손전등의 빛으로써 바위 밑의 암호를 찾았습니다.',
    '¿Cómo se encontró la contraseña?',
    [
      'La luz actuó como jefa del equipo.',
      'La contraseña estaba escrita en la linterna.',
      'Se encontró pese a no tener luz.',
      'Por medio de la luz de la linterna.',
    ],
    3,
    '손전등의 빛 = luz de linterna · 바위 밑 = bajo la roca.',
    '빛으로써 señala el medio que permitió encontrarla (G174), no una identidad o cargo.',
  ),
  selection(
    '동료로서 서로를 돕고, 대화로써 문제를 해결하십시오.',
    '¿Qué contraste construye la frase?',
    [
      'Compañero y conversación son dos instrumentos.',
      'Como compañeros, ayúdense; por medio del diálogo, resuelvan el problema.',
      'Mediante compañeros, sustituyan el diálogo.',
      'Como diálogo, conviértanse en compañeros.',
    ],
    1,
    '동료 = compañero · 대화 = diálogo · 해결하다 = resolver.',
    '동료로서 = rol; 대화로써 = medio. La misma frase contrasta las dos funciones de G174.',
  ),
]

// Slot 5 · Storm memo · formal concession (-에도 불구하고)
const SLOT_5: CompletionCandidate[] = [
  completion(
    '갑작스러운 비___ 모든 팀원이 약속 장소에 모였습니다.',
    'A pesar de la lluvia repentina, todos los miembros se reunieron.',
    '에도 불구하고',
    '갑작스러운 비 = lluvia repentina · 약속 장소 = punto acordado.',
    'N에도 불구하고 (G082) = a pesar de N: 비에도 불구하고.',
  ),
  completion(
    '통신 장애___ 각 조는 정해진 시간에 도착했습니다.',
    'Pese al fallo de comunicaciones, cada grupo llegó a la hora fijada.',
    '에도 불구하고',
    '통신 장애 = fallo de comunicaciones · 각 조 = cada grupo.',
    'La concesión formal une un obstáculo real con un resultado contrario: 장애에도 불구하고.',
  ),
  completion(
    '서로 다른 의견___ 팀은 하나의 계획을 완성했습니다.',
    'A pesar de las distintas opiniones, el equipo completó un solo plan.',
    '에도 불구하고',
    '서로 다른 의견 = opiniones diferentes · 완성하다 = completar.',
    '의견에도 불구하고 establece el contraste formal (G082), sin negar que hubiera desacuerdo.',
  ),
  completion(
    '짧은 준비 시간___ 발표는 성공적으로 끝났습니다.',
    'A pesar del poco tiempo de preparación, la presentación terminó con éxito.',
    '에도 불구하고',
    '준비 시간 = tiempo de preparación · 성공적으로 = con éxito.',
    '시간에도 불구하고 = pese al tiempo. La partícula 에도 forma parte fija del conector.',
  ),
  completion(
    '점수 차이___ 두 팀은 마지막 열쇠를 함께 사용했습니다.',
    'A pesar de la diferencia de puntos, los dos equipos usaron juntos la última llave.',
    '에도 불구하고',
    '점수 차이 = diferencia de puntos · 함께 = juntos.',
    '차이에도 불구하고 contrapone la competición con la cooperación que realmente abre la caja.',
  ),
]

// Slot 6 · Joint report · not only A but also B
const SLOT_6: CreationCandidate[] = [
  creation(
    '최종 보고: 성과와 협력, 둘 다 중요합니다.',
    'Construye: «No solo el resultado, sino también el proceso de colaboración fue importante».',
    ['결과뿐만', '아니라', '협력하는', '과정도', '중요했습니다', '결과로써', '과정에도'],
    [0, 1, 2, 3, 4],
    '결과 = resultado · 협력하는 과정 = proceso de colaborar.',
    'N뿐만 아니라 N도 (G080) enlaza dos elementos: resultado y proceso.',
  ),
  creation(
    '팀 평가: 빠른 판단과 정확한 소통을 함께 칭찬하십시오.',
    'Construye: «No solo juzgaron rápido, sino que también se comunicaron con precisión».',
    ['빠르게', '판단했을', '뿐만', '아니라', '정확하게', '소통했습니다', '불구하고'],
    [0, 1, 2, 3, 4, 5],
    '판단하다 = juzgar/decidir · 소통하다 = comunicarse.',
    'V-(으)ㄹ 뿐만 아니라 (G080) añade una segunda cualidad: 했을 뿐만 아니라 … 소통했습니다.',
  ),
  creation(
    '감사문: 선배와 신입의 기여를 모두 담으십시오.',
    'Construye: «No solo ayudaron los veteranos; también aportaron ideas los nuevos».',
    ['선배들이', '도왔을', '뿐만', '아니라', '신입들도', '아이디어를', '냈습니다', '내라고'],
    [0, 1, 2, 3, 4, 5, 6],
    '선배 = veterano · 신입 = nuevo · 아이디어를 내다 = aportar una idea.',
    'La pareja 뿐만 아니라 … 도 incluye ambos grupos sin borrar su contribución distinta.',
  ),
  creation(
    '안전 기록: 규칙 준수와 동료 보호를 함께 기록하십시오.',
    'Construye: «No solo respetamos las reglas, sino que también cuidamos a los compañeros».',
    ['규칙을', '지켰을', '뿐만', '아니라', '동료들도', '돌보았습니다', '지켰음에도'],
    [0, 1, 2, 3, 4, 5],
    '규칙을 지키다 = respetar reglas · 돌보다 = cuidar.',
    '지켰을 뿐만 아니라 añade 돌보았습니다 como logro adicional (G080).',
  ),
  creation(
    '당신의 제안: 오늘의 보상을 어떻게 나눌까요?',
    'Construye: «No solo el equipo ganador: compartamos el premio con todos».',
    ['우승', '팀뿐만', '아니라', '모두와', '보상을', '나눕시다', '팀으로서', '나누라고'],
    [0, 1, 2, 3, 4, 5],
    '우승 팀 = equipo ganador · 보상을 나누다 = compartir la recompensa.',
    'N뿐만 아니라 amplía el alcance y -(으)ㅂ시다 propone actuar juntos: la frase convierte la competición en equipo.',
  ),
]

export const LEVEL_07: Level = {
  id: 'level-07',
  title: t('El retiro de la empresa'),
  tagline: t(
    'Tu primer retiro corporativo termina de noche, bajo la lluvia y con dos equipos disputándose una caja que solo se abre cuando dejan de competir.',
  ),
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  intro: t(
    'El autobús de 세림기획 abandona Gangnam con treinta y dos empleados, seis cajas de comida y una agenda titulada «Comunicación horizontal». Dos horas después llegáis a un refugio de montaña donde cada habitación tiene jerarquía, cada saludo tiene protocolo y nadie sabe muy bien quién debe sentarse junto al director.\n\n' +
      'Es tu primera semana en la empresa. Has aprendido los nombres de tus compañeros; aún no dominas la constelación de cargos que los rodea. La coordinadora 윤 대리 te entrega una carpeta formal y te susurra que no te preocupes: el retiro consiste en juegos sencillos, una fogata y encontrar el premio que el director escondió por el campamento.\n\n' +
      'Al caer la noche empieza a llover. La cobertura desaparece, las luces del sendero se apagan y el director anuncia por radio que la caja final está cerrada con seis mecanismos lingüísticos. Las pistas no hablan como la gente en la cafetería: hablan como reglamentos, informes y comunicados, con honoríficos y construcciones que pesan como corbatas mojadas.\n\n' +
      'Los equipos Azul y Ámbar salen convencidos de que solo uno podrá ganar. Tú llevas la lista, una linterna y la incómoda responsabilidad de traducir cada instrucción sin convertir respeto en distancia ni formalidad en obediencia ciega. El recorrido cruza la recepción, la sala de estrategia, un sendero oscuro y la fogata cubierta.\n\n' +
      'Antes de cerrar la radio, el director añade algo que no figura en la agenda: «마지막 상자는 혼자 열 수 없습니다.» La última caja no puede abrirse a solas. A tu alrededor ya reparten puntos. En el bosque, dos luces se separan en direcciones opuestas.',
  ),
  outro: t(
    'La cerradura reconoce la última frase: «{farewell}». Las placas de los equipos Azul y Ámbar encajan como dos mitades de un mismo sello. La caja se abre sin fanfarria, apenas con un clic que todos oyen porque, por primera vez en la noche, nadie está dando instrucciones.\n\n' +
      'Dentro no hay una copa para el ganador. Hay treinta y dos sobres idénticos, un vale de descanso para todo el equipo y una carpeta de propuestas que los empleados nuevos habían enviado durante el último año. En la primera página reconoces una idea de 윤 대리, rechazada tres veces sin que nadie la leyera hasta el final.\n\n' +
      'El director se quita la chaqueta empapada y se sienta en un tronco, sin mesa que marque la jerarquía. Admite que el premio escondido era una excusa: quería comprobar si una empresa que escribe «colaboración» en sus carteles era capaz de practicarla cuando los puntos decían lo contrario. Los veteranos miran a los nuevos. Los nuevos, por fin, no bajan la voz.\n\n' +
      'La fogata vuelve a prender bajo el toldo. Alguien reparte 어묵 caliente; otra persona convierte el rotafolio de resultados en una lista de canciones. Los tratamientos formales no desaparecen, pero cambian de función: ya no levantan un muro, sino que dejan espacio para que todos terminen su frase.\n\n' +
      'En el autobús de regreso, 윤 대리 te ofrece el asiento de la ventana y abre la carpeta de propuestas. «회사원으로서가 아니라, 동료로서 물어볼게요. 같이 해 볼래요?» No te lo pregunto como empleada de la empresa, sino como compañera: ¿lo intentamos juntos? Esta vez el equipo entero escucha la respuesta.',
  ),
  voiceIntro: '마지막 상자는 혼자 열 수 없습니다. 안내문을 잘 읽고 함께 움직이십시오.',
  voiceOutro: '수고하셨습니다. 오늘은 우승 팀뿐만 아니라 우리 모두가 해냈습니다.',
  grammarCodes: ['G011', 'G018', 'G175', 'G097', 'G174', 'G082', 'G080'],
  topikLevel: 4,
  rooms: [
    {
      id: 'room-lodge',
      title: t('La recepción del refugio (산장 로비)'),
      image: 'rooms/room-01-lodge-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'protocol-board', rect: [190, 40, 92, 78], triggersSlot: 'slot-1' },
        {
          id: 'name-tags',
          rect: [88, 140, 75, 42],
          cosmeticDetail: t(
            'Las etiquetas tienen nombre, cargo y suficiente espacio para una crisis de protocolo.',
          ),
        },
        {
          id: 'wet-umbrellas',
          rect: [15, 145, 55, 58],
          cosmeticDetail: t(
            'Treinta y dos paraguas mojados: la primera actividad de trabajo en equipo fue encontrar sitio para todos.',
          ),
        },
      ],
    },
    {
      id: 'room-briefing',
      title: t('La sala de estrategia (전략 회의실)'),
      image: 'rooms/room-02-briefing-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'safety-folder', rect: [42, 116, 70, 55], triggersSlot: 'slot-2' },
        { id: 'trail-map', rect: [165, 35, 118, 92], triggersSlot: 'slot-3' },
        {
          id: 'scoreboard',
          rect: [205, 142, 72, 48],
          cosmeticDetail: t('Azul y Ámbar están empatados. El rotulador rojo parece decepcionado.'),
        },
        {
          id: 'snack-box',
          rect: [20, 184, 62, 30],
          cosmeticDetail: t(
            'La caja de aperitivos ya practica una distribución mucho más horizontal.',
          ),
        },
      ],
    },
    {
      id: 'room-trail',
      title: t('El sendero nocturno (야간 산책로)'),
      image: 'rooms/room-03-trail-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'equipment-locker', rect: [210, 108, 68, 72], triggersSlot: 'slot-4' },
        {
          id: 'radio',
            rect: [92, 154, 44, 48],
          cosmeticDetail: t(
            'La radio solo capta lluvia, respiraciones y a alguien preguntando formalmente quién lleva los tentempiés.',
          ),
        },
        {
          id: 'two-markers',
          rect: [34, 62, 84, 68],
          cosmeticDetail: t(
            'Las señales azul y ámbar apuntan al mismo puente por rutas distintas.',
          ),
        },
      ],
    },
    {
      id: 'room-campfire',
      title: t('La fogata cubierta (캠프파이어장)'),
      image: 'rooms/room-04-campfire-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'storm-memo', rect: [28, 90, 72, 62], triggersSlot: 'slot-5' },
        { id: 'final-box', rect: [198, 128, 78, 58], triggersSlot: 'slot-6' },
        {
          id: 'campfire',
          rect: [112, 156, 64, 48],
          cosmeticDetail: t(
            'Las brasas esperan bajo el toldo. Nadie recuerda qué equipo debía encenderlas.',
          ),
        },
        {
          id: 'paired-seals',
          rect: [230, 45, 52, 50],
          cosmeticDetail: t(
            'Dos mitades, dos colores y una ranura que se niega a aceptar una sola.',
          ),
        },
      ],
    },
  ],
  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G011', 'G018'], candidates: SLOT_1 },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G175'], candidates: SLOT_2 },
    { id: 'slot-3', type: 'creation', grammarFocus: ['G097'], candidates: SLOT_3 },
    { id: 'slot-4', type: 'selection', grammarFocus: ['G174'], candidates: SLOT_4 },
    { id: 'slot-5', type: 'completion', grammarFocus: ['G082'], candidates: SLOT_5 },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G080'], candidates: SLOT_6 },
  ],
  scriptedBeats: [
    {
      afterSlotId: 'slot-2',
      voiceLine: '점수보다 안전이 먼저입니다. 다른 팀과 무전을 공유하십시오.',
      narrative: t(
        'La última página del manual no asigna puntos: ordena compartir la frecuencia de radio con el otro equipo. El mensaje contradice el marcador de la pared y confirma que las pistas no premian la velocidad, sino la interpretación responsable.\n\nAzul presta una batería a Ámbar. Ámbar revela que su mapa tiene la mitad norte del sendero. Por primera vez, ambas carpetas forman una ruta completa.',
      ),
    },
    {
      afterSlotId: 'slot-5',
      voiceLine: '경쟁에도 불구하고 함께 도착하셨군요. 이제 보고서를 완성하십시오.',
      narrative: t(
        'Bajo el memorando de la tormenta aparece la firma del director y una pregunta manuscrita: «Si el premio fuera verdaderamente colectivo, ¿cómo lo comunicaría un informe acostumbrado a elegir un ganador?»\n\nLas dos insignias encajan en la tapa, pero la caja todavía exige una frase. No basta con llegar juntos: hay que nombrar, formalmente, todo lo que el marcador dejó fuera.',
      ),
    },
  ],
  rewards: {
    common: {
      id: 'cosmetic-bg-night-retreat',
      image: 'cosmetics/cosmetic-bg-night-retreat.webp',
      name: t('Fondo «야간 워크숍»'),
      description: t(
        'El refugio de montaña bajo lluvia azul, con ventanas cálidas y dos senderos de linternas que vuelven a encontrarse.',
      ),
    },
    rare: {
      id: 'cosmetic-frame-team-badges',
      image: 'cosmetics/cosmetic-frame-team-badges.png',
      name: t('Marco «한 팀»'),
      description: t(
        'Las insignias Azul y Ámbar unidas por una cuerda de seguridad y pequeñas hojas mojadas.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-radio-lead',
      image: 'cosmetics/cosmetic-avatar-radio-lead.png',
      name: t('Avatar «신입 인솔자»'),
      description: t(
        'El empleado nuevo con linterna, radio y carpeta formal, guiando sin dejar a nadie atrás.',
      ),
    },
    legendary: {
      id: 'cosmetic-set-complete-07',
      image: 'cosmetics/cosmetic-set-complete-07.png',
      name: t('Set completo «모두의 보상»'),
      description: t(
        'La caja abierta junto a la fogata: sobres para todos, dos insignias enlazadas y el equipo completo bajo un mismo toldo.',
      ),
    },
  },
  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

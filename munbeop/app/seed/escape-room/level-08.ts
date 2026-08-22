import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './translations/levels/level-08'

/**
 * Level 8 — El palacio de las linternas (등불 궁궐)
 *
 * TOPIK 5 mystery about a palace whose corridors reconfigure at night. The
 * historical setting is atmospheric; every Korean line uses contemporary
 * standard grammar and 해요/합니다 speech. Six locks trace the final patrol of
 * lantern keeper 윤해원 and turn apparent haunting into an act of preservation.
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

// Slot 1 · The memories embedded in five guardian paintings · G099 (-던)
const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  selection(
    '해원은 밤마다 등불을 확인하던 사람이에요.',
    'El primer retrato recuerda a 해원. ¿Qué afirma?',
    [
      'Que 해원 revisará las linternas esta noche por primera vez.',
      'Que 해원 solía revisar las linternas cada noche.',
      'Que alguien interrumpió a 해원 mientras revisa una sola linterna.',
      'Que 해원 ya no recuerda dónde están las linternas.',
    ],
    1,
    '밤마다 = cada noche · 확인하다 = comprobar. El retrato habla de una rutina pasada.',
    '-던 (G099) modifica a 사람 y evoca una acción habitual o no cerrada del pasado: 확인하던 사람 = «la persona que solía comprobar».',
  ),
  selection(
    '수문장이 늘 서 있던 자리에 푸른 등이 남아 있어요.',
    '¿Qué indica la linterna azul bajo el segundo retrato?',
    [
      'Está en el lugar donde el guardia solía estar de pie.',
      'Está donde el guardia se pondrá de pie mañana.',
      'Demuestra que el guardia continúa allí ahora.',
      'Marca el lugar donde el guardia dejó caer una espada una sola vez.',
    ],
    0,
    '늘 = siempre · 서 있다 = estar de pie · 자리 = lugar.',
    '서 있던 자리 (G099) conserva la memoria de una situación repetida o prolongada que ya no está vigente.',
  ),
  selection(
    '왕세자가 어릴 때 읽던 책이 비밀 서가에 보관되어 있어요.',
    '¿Qué clase de libro guarda el pasillo?',
    [
      'Un libro que el príncipe terminó de escribir de niño.',
      'Un libro que el príncipe acaba de pedir prestado.',
      'Un libro que el príncipe solía leer de niño.',
      'Un libro que se leerá durante la coronación.',
    ],
    2,
    '어릴 때 = cuando era pequeño · 읽다 = leer · 보관되다 = conservarse.',
    '읽던 책 (G099) señala el libro asociado a la lectura habitual o interrumpida del pasado, no uno futuro ni necesariamente terminado.',
  ),
  selection(
    '비가 오면 물이 새던 복도는 지금 벽으로 막혀 있어요.',
    '¿Qué revela la mancha de humedad del cuarto retrato?',
    [
      'El pasillo se inundó una única vez esta noche.',
      'El pasillo se abrirá cuando llueva.',
      'El muro provoca que empiece a llover.',
      'Por ese pasillo solía entrar agua cuando llovía; ahora está tapiado.',
    ],
    3,
    '물이 새다 = filtrarse agua · 막히다 = quedar bloqueado.',
    '물이 새던 복도 (G099) describe una característica repetida del pasillo en el pasado; 지금… 막혀 있어요 contrasta con su estado actual.',
  ),
  selection(
    '해원이 마지막으로 들고 가던 붉은 등이 계단에서 발견됐어요.',
    'La pintura final congela una acción. ¿Qué ocurrió?',
    [
      '해원 fabricó una linterna roja después de bajar la escalera.',
      'La linterna roja que 해원 llevaba en aquel momento fue hallada en la escalera.',
      '해원 suele encontrar linternas rojas junto a la escalera.',
      'Alguien espera que 해원 lleve una linterna roja.',
    ],
    1,
    '들고 가다 = llevar consigo · 발견되다 = ser hallado.',
    '들고 가던 (G099) enfoca una acción en curso e interrumpida: la llevaba, pero el trayecto no se completó.',
  ),
]

// Slot 2 · The corridor reacts to direct observations · G098 (-더니)
const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  completion(
    '가운데 등불이 세 번 ___ 닫혀 있던 문이 열렸어요.',
    'La linterna central parpadeó tres veces y entonces se abrió la puerta cerrada.',
    '깜빡이더니',
    '깜빡이다 = parpadear. Primero observaste la luz; después ocurrió el cambio.',
    '-더니 (G098) enlaza una observación pasada directa con el resultado posterior: 깜빡이더니.',
  ),
  completion(
    '해원이 벽의 학 그림을 ___ 복도가 북쪽으로 이어졌어요.',
    '해원 tocó la grulla pintada y entonces el corredor continuó hacia el norte.',
    '만지더니',
    '만지다 = tocar · 이어지다 = prolongarse, conectar.',
    'La raíz verbal recibe -더니 sin tiempo añadido: 만지다 → 만지더니 (G098). El hablante presenció X y luego Y.',
  ),
  completion(
    '마지막 초가 갑자기 ___ 바닥에 별자리가 나타났어요.',
    'La última vela se apagó de pronto y apareció una constelación en el suelo.',
    '꺼지더니',
    '꺼지다 = apagarse · 나타나다 = aparecer.',
    '꺼지다 + -더니 → 꺼지더니 (G098): observación pasada seguida por un resultado nuevo y visible.',
  ),
  completion(
    '달빛이 청동 거울을 ___ 숨겨진 글자가 보이기 시작했어요.',
    'La luz lunar iluminó el espejo de bronce y comenzaron a verse letras ocultas.',
    '비추더니',
    '비추다 = iluminar/reflejar · 숨겨지다 = estar oculto.',
    '비추더니 (G098) presenta lo visto primero como causa contextual de lo que el narrador observó después.',
  ),
  completion(
    '복도가 계속 움직이다가 종소리와 함께 ___ 원래 지도와 맞아떨어졌어요.',
    'El corredor llevaba un rato moviéndose; se detuvo con la campana y volvió a coincidir con el mapa original.',
    '멈추더니',
    '멈추다 = detenerse · 맞아떨어지다 = coincidir/encajar.',
    '멈추다 + -더니 → 멈추더니 (G098). No es una hipótesis: el jugador observa la detención y su consecuencia.',
  ),
]

// Slot 3 · Reading traces in the royal archive · G238 (듯하다)
const SLOT_3_CANDIDATES: SelectionCandidate[] = [
  selection(
    '봉인이 두 겹인 것을 보니 누군가 기록을 일부러 숨긴 듯해요.',
    '¿Qué conclusión prudente permite el doble sello?',
    [
      'El archivo confirma jurídicamente quién ocultó el registro.',
      'Parece que alguien ocultó el registro deliberadamente.',
      'Alguien está obligado a ocultarlo mañana.',
      'El registro desaparece siempre que hay dos sellos.',
    ],
    1,
    '일부러 = deliberadamente · 숨기다 = ocultar. La evidencia permite inferir, no certificar.',
    '숨긴 듯해요 (G238) usa el modificador pasado -(으)ㄴ + 듯하다 para una apariencia inferida de un hecho ya ocurrido.',
  ),
  selection(
    '먹이 아직 젖어 있어서 편지를 방금 쓴 듯해요.',
    'La tinta sigue húmeda. ¿Qué interpretación expresa la frase?',
    [
      'La carta suele escribirse con tinta húmeda.',
      'La carta se escribirá en cuanto se seque la tinta.',
      'Parece que la carta fue escrita hace un momento.',
      'Es imposible saber si existe una carta.',
    ],
    2,
    '먹 = tinta · 젖다 = estar húmedo · 방금 = hace un momento.',
    '쓴 듯해요 (G238) es inferencia formal sobre un acto completado. La humedad es la evidencia, no una observación del acto mismo.',
  ),
  selection(
    '지도 가장자리가 새로 잘린 듯하지만 가운데 표시는 오래됐어요.',
    '¿Qué distingue la conservadora en el mapa?',
    [
      'El borde parece recién cortado, pero la señal central es antigua.',
      'Todo el mapa parece recién fabricado.',
      'El centro fue cortado y el borde quedó intacto.',
      'El mapa antiguo debe ser destruido.',
    ],
    0,
    '가장자리 = borde · 새로 = recientemente · 가운데 = centro.',
    '잘린 듯하지만 combina la inferencia pasada 잘린 듯하다 (G238) con contraste; solo afecta al borde.',
  ),
  selection(
    '같은 필체가 여러 시대의 장부에 반복되는 듯해요.',
    '¿Qué anomalía detectas en los libros contables?',
    [
      'Una sola cuenta se repite cada día.',
      'Cada época usó una caligrafía completamente distinta.',
      'Los libros parecen no contener escritura.',
      'Parece repetirse la misma caligrafía en libros de varias épocas.',
    ],
    3,
    '필체 = caligrafía · 여러 시대 = varias épocas · 반복되다 = repetirse.',
    '반복되는 듯해요 (G238) usa -는 듯하다 para una apariencia vigente observada al comparar los libros.',
  ),
  selection(
    '찢긴 명단 아래에 다른 이름이 있었던 듯해요.',
    '¿Qué sugiere la hoja rasgada bajo la luz lateral?',
    [
      'Parece que había otro nombre bajo la lista rasgada.',
      'Se ordena escribir otro nombre encima de la lista.',
      'El otro nombre aparecerá mañana.',
      'La lista demuestra que no existió ningún otro nombre.',
    ],
    0,
    '찢기다 = estar rasgado · 명단 = lista de nombres · 아래 = debajo.',
    '있었던 듯해요 (G238) infiere un estado pasado anterior a partir del relieve que todavía se ve.',
  ),
]

// Slot 4 · Rebuilding the route after prolonged work · G227 (-(으)ㄴ 끝에)
const SLOT_4_CANDIDATES: CompletionCandidate[] = [
  completion(
    '세 시간 동안 같은 복도를 ___ 별관으로 가는 길을 찾았어요.',
    'Después de vagar tres horas por el mismo corredor, encontramos el camino al anexo.',
    '헤맨 끝에',
    '헤매다 = vagar/perderse. La duración indica un proceso largo.',
    '헤매다 → 헤맨 끝에 (G227): resultado alcanzado al final de un proceso prolongado.',
  ),
  completion(
    '낡은 장부를 밤새 ___ 지워진 날짜를 확인했어요.',
    'Tras investigar toda la noche el libro antiguo, comprobamos la fecha borrada.',
    '조사한 끝에',
    '밤새 = durante toda la noche · 조사하다 = investigar.',
    '조사하다 → 조사한 끝에 (G227). -(으)ㄴ 끝에 empaqueta el esfuerzo previo y presenta su resultado.',
  ),
  completion(
    '깨진 별자리판을 여러 번 ___ 북쪽 문의 위치를 알아냈어요.',
    'Después de restaurar varias veces el disco astronómico roto, averiguamos dónde estaba la puerta norte.',
    '복원한 끝에',
    '복원하다 = restaurar · 알아내다 = averiguar.',
    '복원한 끝에 (G227) conecta muchas tentativas de restauración con el hallazgo final.',
  ),
  completion(
    '다섯 장의 지도를 하나씩 ___ 진짜 순찰로를 골랐어요.',
    'Tras comparar uno a uno cinco mapas, escogimos la verdadera ruta de patrulla.',
    '비교한 끝에',
    '비교하다 = comparar · 순찰로 = ruta de patrulla.',
    '비교하다 → 비교한 끝에 (G227). No significa simplemente «después»; recalca deliberación y esfuerzo.',
  ),
  completion(
    '구름이 걷히기를 오래 ___ 달빛이 비추는 문을 확인했어요.',
    'Después de esperar mucho a que se despejaran las nubes, identificamos la puerta iluminada por la luna.',
    '기다린 끝에',
    '기다리다 = esperar · 구름이 걷히다 = despejarse las nubes.',
    '기다리다 → 기다린 끝에 (G227): el resultado llega únicamente tras una espera considerable.',
  ),
]

// Slot 5 · The guardian's conditional warnings · G189 (-(으)면 몰라도)
const SLOT_5_CANDIDATES: SelectionCandidate[] = [
  selection(
    '해원의 순찰 기록이 거짓이면 몰라도, 이 문은 남쪽으로 열릴 수 없어요.',
    '¿Bajo qué única condición podría abrirse al sur?',
    [
      'Solo si el registro de patrulla de 해원 fuera falso.',
      'Siempre que el registro sea verdadero.',
      'Porque la puerta ya se abrió al sur.',
      'Aunque nadie consulte el registro.',
    ],
    0,
    '거짓 = falso · 남쪽 = sur. La primera cláusula es la excepción.',
    'A-(으)면 몰라도, B (G189) = «a no ser que A, B». Presenta la única condición que podría invalidar B.',
  ),
  selection(
    '등불을 모두 끄면 몰라도, 복도는 원래 모습으로 돌아가지 않아요.',
    '¿Qué haría posible que el corredor recuperase su forma?',
    [
      'Encender todavía más linternas.',
      'Apagar todas las linternas.',
      'Dibujar el corredor de memoria.',
      'Esperar sin tocar nada.',
    ],
    1,
    '모두 끄다 = apagarlas todas · 돌아가다 = volver.',
    '끄면 몰라도 (G189) marca la excepción: salvo que se apaguen todas, el retorno no ocurre.',
  ),
  selection(
    '왕실 인장이 두 개면 몰라도, 이 문서 하나만으로는 명령을 증명할 수 없어요.',
    '¿Qué falta para demostrar la orden?',
    [
      'Una traducción moderna del único documento.',
      'Que el documento pierda su sello.',
      'Dos sellos reales, que serían la excepción suficiente.',
      'Un testigo que no haya visto el documento.',
    ],
    2,
    '인장 = sello · 증명하다 = demostrar · 하나만으로는 = con uno solo.',
    '두 개면 몰라도 (G189) aísla la condición excepcional; la oración principal niega que uno baste.',
  ),
  selection(
    '오늘이 보름날이면 몰라도, 달빛 없이 별문은 열리지 않아요.',
    '¿Cuándo podría abrirse la puerta estelar?',
    [
      'En cualquier noche sin luna.',
      'Cuando amanezca y desaparezcan las estrellas.',
      'Únicamente si llueve dentro del palacio.',
      'Solo si hoy fuera luna llena; sin luz lunar no se abre.',
    ],
    3,
    '보름날 = día de luna llena · 달빛 = luz de luna.',
    '보름날이면 몰라도 (G189) establece la luna llena como excepción a la imposibilidad expresada después.',
  ),
  selection(
    '해원이 기록을 직접 없앴다면 몰라도, 남은 흔적은 오히려 보호하려 했다는 뜻이에요.',
    '¿Qué interpretación favorecen las huellas conservadas?',
    [
      '해원 confesó que destruyó todos los registros.',
      'Salvo que ella misma los hubiera eliminado, las huellas indican que intentó protegerlos.',
      'Las huellas prueban que el archivo nunca estuvo en peligro.',
      'El guardián ordenó borrar cualquier documento que quedara.',
    ],
    1,
    '직접 없애다 = eliminar personalmente · 오히려 = más bien/al contrario.',
    '없앴다면 몰라도 (G189) concede una excepción hipotética; fuera de ella, la evidencia apoya la conclusión contraria.',
  ),
]

// Slot 6 · The promise that makes the Moon Gate release its records · G107
const SLOT_6_CANDIDATES: CreationCandidate[] = [
  creation(
    '길이 다시 바뀌어도 기록을 지키겠다고 약속할 수 있어요?',
    'Ordena una promesa firme: «Aunque el camino vuelva a cambiar, protegeré el registro hasta el final».',
    ['기록을', '바뀔지라도', '잊겠습니다', '길이', '끝까지', '지키겠습니다', '다시'],
    [3, 6, 1, 0, 4, 5],
    'La concesión va después de 길이 다시; la promesa termina en -겠습니다.',
    'Aunque X = -(으)ㄹ지라도 (G107): 바뀌다 → 바뀔지라도. La segunda cláusula mantiene la decisión pese a X.',
  ),
  creation(
    '아무도 해원의 이야기를 믿지 않아도 어떻게 하겠어요?',
    'Construye: «Aunque nadie crea la historia de 해원, dejaré la evidencia tal como está».',
    ['증거를', '해원의', '이야기를', '믿지 않을지라도', '남기겠습니다', '아무도', '그대로'],
    [5, 1, 2, 3, 0, 6, 4],
    'Empieza por 아무도 y cierra con 증거를 그대로 남기겠습니다.',
    '믿지 않다 → 믿지 않을지라도 (G107). 아무도 exige negación, y la concesión no cancela el compromiso expresado con -겠습니다.',
  ),
  creation(
    '궁궐이 다시 어두워진다면 마지막 등불을 어떻게 하겠어요?',
    'Construye: «Aunque el palacio vuelva a oscurecerse, encenderé la última linterna».',
    ['마지막', '궁궐이', '어두워질지라도', '끄겠습니다', '등불을', '다시', '밝히겠습니다'],
    [1, 5, 2, 0, 4, 6],
    'El sujeto y 다시 preceden a la concesión; 밝히다 significa iluminar/encender.',
    '어두워지다 → 어두워질지라도 (G107). La acción resistente es 마지막 등불을 밝히겠습니다.',
  ),
  creation(
    '조사 결과가 왕실의 기록과 다르면 어떻게 하겠어요?',
    'Construye: «Aunque el resultado contradiga el registro real, diré la verdad».',
    ['왕실', '말하겠습니다', '다를지라도', '숨기겠습니다', '진실을', '결과가', '기록과'],
    [5, 0, 6, 2, 4, 1],
    '결과가 es sujeto; 왕실 기록과 es la referencia con la que difiere.',
    '다르다 → 다를지라도 (G107). La concesión formal realza la firmeza de 진실을 말하겠습니다.',
  ),
  creation(
    '새벽이 와서 이 궁궐을 떠나게 되어도 무엇을 기억하겠어요?',
    'Construye: «Aunque abandone este palacio al amanecer, recordaré la ruta de las linternas».',
    ['등불의', '새벽에', '떠날지라도', '궁궐을', '길을', '잊겠습니다', '기억하겠습니다', '이'],
    [1, 7, 3, 2, 0, 4, 6],
    '새벽에 abre la frase; el objeto final es 등불의 길을.',
    '떠나다 → 떠날지라도 (G107), seguido por una decisión que no cambia: 기억하겠습니다.',
  ),
]

export const LEVEL_08: Level = {
  id: 'level-08',
  title: t('El palacio de las linternas'),
  tagline: t(
    'Aceptaste catalogar seis linternas antes del amanecer. Cuando encendiste la primera, el pasillo cambió de lugar y una guardiana borrada de la historia pronunció tu nombre.',
  ),
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  intro: t(
    `El encargo parecía sencillo: una noche de inventario en un pabellón cerrado por restauración. A medianoche el palacio está vacío de turistas, la lluvia fina oscurece las tejas y las lámparas de seguridad dejan zonas enteras en sombra. Sobre una mesa te esperan seis linternas antiguas y una nota reciente: «Enciéndelas en el orden de la última patrulla».

En cuanto prendes la primera mecha, los paneles de papel vibran. El corredor que conducía a la salida termina ahora contra un muro pintado con grullas. Detrás de ti aparece otro pasillo, demasiado largo para caber dentro del edificio. Las vigas crujen una por una, como si el palacio estuviera recolocando sus huesos.

Una mujer sostiene una linterna azul al fondo. Lleva el uniforme sencillo de una conservadora, pero su sombra proyecta el contorno de un antiguo sombrero de guardia. «놀라지 마세요. 길이 기억을 따라 움직이는 것뿐이에요.» No te asustes. El camino solo se mueve siguiendo los recuerdos. Dice llamarse 윤해원 y señala cinco retratos cuyos nombres han sido raspados.

Según el catálogo oficial, un incendio destruyó el archivo norte hace más de un siglo. Según 해원, aquella versión fue fabricada: alguien cambió la ruta nocturna para esconder documentos antes de que los requisaran. Desde entonces, las linternas repiten la patrulla, pero nadie ha logrado completarla y los pasillos siempre devuelven al intruso al punto de partida.

Para abrir la puerta lunar tendrás que distinguir memoria, observación e inferencia: lo que alguien solía hacer, lo que viste que ocurrió y lo que las huellas apenas permiten suponer. 해원 te advierte que el palacio no castiga una respuesta equivocada; simplemente borra un tramo del mapa. A la tercera ruta perdida, ya no recordará dónde encontrarte.

La linterna azul avanza. En los paneles aparecen sombras de guardias que ya no existen. Quedan menos de dos horas para el amanecer y, con cada campanada, el corredor vuelve a cambiar. 해원 no te pide que escapes. Te pide que termines la ronda que ella dejó interrumpida.`,
  ),
  outro: t(
    `La puerta lunar no se abre de golpe. Primero encaja una pieza del marco, luego otra, como si el palacio recordara lentamente su arquitectura. La frase que construiste queda suspendida entre las linternas: «{farewell}». 해원 la repite en voz baja y la última mecha se vuelve azul.

Detrás de la puerta no hay tesoro, sino cajas de madera encerada. Dentro descansan padrones, mapas y cartas que prueban que la supuesta incendiaria fue quien salvó el archivo. El mismo nombre aparece al final de cada inventario: 윤해원, responsable de la última patrulla. No era una traidora ni un fantasma que cambiaba los corredores. Era la cartógrafa que los convirtió en escondite.

Cuando fotografías el último sello, el pasillo deja de moverse. Las puertas recuperan sus bisagras verdaderas; las grullas vuelven a ser pintura. 해원 se quita del pecho una pequeña placa de madera y la coloca sobre la caja superior. Por primera vez, su nombre queda junto a los documentos que protegió.

«이제 길을 바꿀 필요가 없어요.» Ya no hace falta cambiar el camino. Su uniforme moderno se vuelve translúcido bajo la luz del amanecer, aunque su voz sigue siendo la de una mujer de hoy: serena, directa, cansada de que la historia necesitara un siglo para formular bien una frase.

Sales al patio justo cuando abren las puertas exteriores. El personal de restauración encuentra todas las linternas apagadas y seis marcas húmedas sobre el suelo. Tu informe contiene una séptima fotografía que no recuerdas haber tomado: 해원, de espaldas, cruzando la puerta lunar con su linterna azul.

Al mediodía colocan provisionalmente su nombre en la vitrina del archivo. La etiqueta aún es de papel, pero nadie la ha raspado. Esa noche, por primera vez desde que comenzaron las obras, los sensores registran un palacio inmóvil.`,
  ),
  voiceIntro:
    '놀라지 마세요. 길이 기억을 따라 움직이는 것뿐이에요. 마지막 순찰을 함께 끝내 주세요.',
  voiceOutro: '이제 길을 바꿀 필요가 없어요. 제 이름과 이 기록들을 기억해 주세요.',
  grammarCodes: ['G099', 'G098', 'G238', 'G227', 'G189', 'G107'],
  topikLevel: 5,
  rooms: [
    {
      id: 'room-byeoksa',
      title: t('El corredor de los guardianes (벽사랑)'),
      image: 'rooms/room-01-byeoksa-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'guardian-portraits', rect: [30, 54, 92, 106], triggersSlot: 'slot-1' },
        { id: 'shifting-screen', rect: [202, 48, 88, 126], triggersSlot: 'slot-2' },
        {
          id: 'blue-lantern',
          rect: [141, 118, 38, 55],
          cosmeticDetail: t('La llama tiembla, pero su sombra no se mueve.'),
        },
        {
          id: 'wet-map',
          rect: [112, 183, 82, 32],
          cosmeticDetail: t('La marca del norte ha sido borrada tres veces.'),
        },
      ],
    },
    {
      id: 'room-gyujanggak',
      title: t('El archivo real (규장각)'),
      image: 'rooms/room-02-gyujanggak-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'double-sealed-ledger', rect: [112, 126, 88, 52], triggersSlot: 'slot-3' },
        {
          id: 'scraped-nameplate',
          rect: [28, 68, 58, 35],
          cosmeticDetail: t('Bajo la veta de la madera aún se distingue el carácter 윤.'),
        },
        {
          id: 'bronze-mirror',
          rect: [235, 56, 50, 76],
          cosmeticDetail: t('El espejo refleja más pasillo que habitación.'),
        },
      ],
    },
    {
      id: 'room-cheomseong',
      title: t('La terraza astronómica (관상감 뜰)'),
      image: 'rooms/room-03-cheomseong-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'broken-star-disc', rect: [92, 94, 92, 80], triggersSlot: 'slot-4' },
        { id: 'guardian-warning', rect: [218, 82, 58, 88], triggersSlot: 'slot-5' },
        {
          id: 'moon-shadow',
          rect: [22, 150, 58, 47],
          cosmeticDetail: t('La posición de la puerta cambia cada vez que pasa una nube.'),
        },
      ],
    },
    {
      id: 'room-wolmun',
      title: t('La puerta lunar (월문)'),
      image: 'rooms/room-04-wolmun-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'six-lantern-lock', rect: [101, 72, 120, 116], triggersSlot: 'slot-6' },
        {
          id: 'hidden-crates',
          rect: [238, 151, 60, 48],
          cosmeticDetail: t('La caja de madera desprende olor a papel antiguo.'),
        },
        {
          id: 'dawn-line',
          rect: [18, 44, 72, 70],
          cosmeticDetail: t('La punta del alero se ilumina poco a poco.'),
        },
      ],
    },
  ],
  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G099'], candidates: SLOT_1_CANDIDATES },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G098'], candidates: SLOT_2_CANDIDATES },
    { id: 'slot-3', type: 'selection', grammarFocus: ['G238'], candidates: SLOT_3_CANDIDATES },
    { id: 'slot-4', type: 'completion', grammarFocus: ['G227'], candidates: SLOT_4_CANDIDATES },
    { id: 'slot-5', type: 'selection', grammarFocus: ['G189'], candidates: SLOT_5_CANDIDATES },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G107'], candidates: SLOT_6_CANDIDATES },
  ],
  scriptedBeats: [
    {
      afterSlotId: 'slot-2',
      voiceLine:
        '이 복도는 침입자를 가두려고 만든 게 아니에요. 기록을 숨길 시간을 벌려고 만든 거예요.',
      narrative: t(
        'La pantalla de grullas se pliega hacia dentro y revela marcas de carbón en la viga: seis rutas dibujadas una encima de otra. 해원 explica que los corredores no fueron concebidos para atrapar intrusos, sino para ganar tiempo mientras los guardianes trasladaban el archivo. Cada cambio registrado coincide con la posición de una linterna. El supuesto laberinto era un reloj de evacuación.',
      ),
    },
    {
      afterSlotId: 'slot-5',
      voiceLine:
        '제 이름을 지운 사람들은 길을 훔쳤지만, 등불이 기억하는 순서까지 지우지는 못했어요.',
      narrative: t(
        'El disco astronómico completa su giro y proyecta un nombre sobre el suelo: 윤해원. El expediente oficial la acusa de provocar el incendio; las capas del mapa cuentan lo contrario. Ella desmontó el pasillo, desvió a los soldados y cargó los documentos hasta la puerta lunar. La última patrulla quedó incompleta porque regresó a buscar una caja más. No está protegiendo al palacio de ti: está esperando a alguien que termine de registrar la verdad.',
      ),
    },
  ],
  rewards: {
    common: {
      id: 'cosmetic-bg-lantern-palace',
      image: 'cosmetics/cosmetic-bg-lantern-palace.png',
      name: t('Fondo «궁궐의 등불»'),
      description: t(
        'Un corredor palaciego bajo la lluvia, iluminado por seis linternas que trazan una ruta azul y ámbar.',
      ),
    },
    rare: {
      id: 'cosmetic-frame-moon-gate',
      image: 'cosmetics/cosmetic-frame-moon-gate.png',
      name: t('Marco «월문»'),
      description: t(
        'Marco de madera lacada y latón inspirado en la puerta lunar y el disco astronómico restaurado.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-haewon',
      image: 'cosmetics/cosmetic-avatar-haewon.png',
      name: t('Avatar «기록 수호자 해원»'),
      description: t(
        '해원 con la linterna azul, su uniforme de conservación y la sombra de la última guardiana del archivo.',
      ),
    },
    legendary: {
      id: 'cosmetic-set-complete-08',
      image: 'cosmetics/cosmetic-set-complete-08.png',
      name: t('Set completo «마지막 순찰»'),
      description: t(
        'La última patrulla: avatar de 해원, marco de puerta lunar y fondo del palacio inmóvil al amanecer.',
      ),
    },
  },
  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

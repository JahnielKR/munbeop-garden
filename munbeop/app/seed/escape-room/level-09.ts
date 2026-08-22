import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './translations/levels/level-09'

/**
 * Level 9 — La mansión del testamento (유언장 저택)
 *
 * Seven heirs, one ambiguous will, and a sealed evidence room. TOPIK 5
 * grammar functions as legal reasoning: evidential observations, formal
 * causes, concessions, limitations, and a final counterfactual reconstruction.
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

// Slot 1 · Seven testimonies, each reduced to what the witness actually saw · G098
const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  selection(
    '민석 씨가 금고를 열더니 안에서 낡은 열쇠를 꺼냈어요.',
    '¿Qué declara exactamente el primer heredero?',
    [
      'Vio a 민석 abrir la caja fuerte y sacar de dentro una llave antigua.',
      'Supone que 민석 abrirá la caja fuerte mañana.',
      'Oyó que alguien había escondido una llave, pero no vio a nadie.',
      '민석 solía coleccionar llaves antiguas de niño.',
    ],
    0,
    '금고 = caja fuerte · 꺼내다 = sacar. El testigo describe dos hechos presenciados en secuencia.',
    '-더니 (G098) presenta observación directa X seguida por Y: 열더니… 꺼냈어요. No es rumor ni conjetura.',
  ),
  selection(
    '서윤 씨가 유언장을 읽더니 갑자기 벽난로 쪽을 봤어요.',
    '¿Qué cambio observó el segundo testigo?',
    [
      '서윤 escribió el testamento junto a la chimenea.',
      'Después de leer el testamento, 서윤 miró de repente hacia la chimenea.',
      '서윤 mira siempre la chimenea cuando lee.',
      'El testigo no vio a 서윤, solo encontró ceniza.',
    ],
    1,
    '갑자기 = de repente · 벽난로 쪽 = hacia la chimenea.',
    '읽더니… 봤어요 (G098) conecta dos acciones vistas del mismo tercero, sin afirmar por qué miró.',
  ),
  selection(
    '도현 씨가 창문을 닫더니 방 안의 촛불이 꺼졌어요.',
    '¿Cuál fue la secuencia en el dormitorio?',
    [
      'La vela se apagó antes de que 도현 entrara.',
      '도현 abrió la ventana porque la vela estaba apagada.',
      '도현 cerró la ventana y entonces la vela de la habitación se apagó.',
      'La vela prueba que 도현 estuvo fuera toda la noche.',
    ],
    2,
    '창문을 닫다 = cerrar la ventana · 촛불이 꺼지다 = apagarse la vela.',
    '닫더니 (G098) es el hecho observado primero; 꺼졌어요, el resultado posterior. La frase no demuestra causalidad jurídica.',
  ),
  selection(
    '가영 씨가 잔을 내려놓더니 손에서 쓴 약 냄새가 났어요.',
    '¿Qué percibió la testigo después de que 가영 dejó la copa?',
    [
      'Que la copa contenía necesariamente veneno.',
      'Que 가영 confesó haber preparado una medicina.',
      'Que otra persona robó la copa.',
      'Que las manos de 가영 olían a una medicina amarga.',
    ],
    3,
    '잔을 내려놓다 = dejar la copa · 쓴 약 냄새 = olor a medicina amarga.',
    '-더니 (G098) restringe el testimonio a la secuencia observada; olor a medicina no equivale por sí solo a veneno.',
  ),
  selection(
    '준호 씨가 시계를 맞추더니 복도의 종이 열한 번 울렸어요.',
    '¿Qué coincidencia temporal declara el último testigo?',
    [
      '준호 ajustó el reloj y luego sonó once veces la campana del pasillo.',
      'La campana obligó a 준호 a destruir el reloj.',
      '준호 aseguró que eran las diez, aunque nadie oyó campanas.',
      'El reloj siempre se retrasa once minutos.',
    ],
    0,
    '시계를 맞추다 = poner/ajustar el reloj · 열한 번 = once veces.',
    '맞추더니… 울렸어요 (G098): observación directa y resultado. El orden importa para reconstruir la hora manipulada.',
  ),
]

// Slot 2 · Formal causal language in the codicil · G110
const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  completion(
    '서명 누락___ 첫 번째 유언장은 효력이 없어요.',
    'Debido a la ausencia de firma, el primer testamento carece de validez.',
    '으로 인해',
    '누락 = omisión · 효력이 없다 = carecer de validez.',
    'N-(으)로 인해(서) (G110) expresa causa formal escrita: 서명 누락으로 인해.',
  ),
  completion(
    '잉크 변색___ 작성 시각을 다시 조사해야 해요.',
    'Debido a la decoloración de la tinta, hay que volver a investigar la hora de redacción.',
    '으로 인해',
    '변색 = decoloración · 작성 시각 = hora de redacción.',
    '변색으로 인해 (G110) encaja en un informe pericial; la causa nominal lleva -(으)로 인해.',
  ),
  completion(
    '증인의 이해관계___ 진술의 신뢰도가 낮아졌어요.',
    'Debido al interés personal del testigo, disminuyó la fiabilidad de su declaración.',
    '로 인해',
    '이해관계 = interés personal/conflicto de intereses · 신뢰도 = fiabilidad.',
    '이해관계로 인해 (G110) atribuye formalmente un resultado a una causa nominal.',
  ),
  completion(
    '보관함의 습기___ 봉인의 일부가 손상됐어요.',
    'Debido a la humedad del depósito, parte del sello quedó dañada.',
    '로 인해',
    '습기 = humedad · 손상되다 = dañarse.',
    '습기로 인해 (G110): tras vocal se usa 로, y 인해 mantiene el registro documental.',
  ),
  completion(
    '문장 부호의 차이___ 상속 조항이 두 가지로 해석돼요.',
    'Debido a una diferencia de puntuación, la cláusula sucesoria admite dos interpretaciones.',
    '로 인해',
    '문장 부호 = puntuación · 해석되다 = interpretarse.',
    '차이로 인해 (G110) señala la causa formal de la ambigüedad, sin decidir aún cuál lectura es correcta.',
  ),
]

// Slot 3 · Testing heirs' excuses with argumentative concession · G195
const SLOT_3_CANDIDATES: SelectionCandidate[] = [
  selection(
    '민석 씨가 열쇠를 우연히 발견했다손 치더라도, 금고 번호를 안 이유는 설명되지 않아요.',
    'Aunque concedamos la explicación de 민석, ¿qué sigue sin aclararse?',
    [
      'Por qué conocía la combinación de la caja fuerte.',
      'Por qué la llave era de metal.',
      'Quién construyó la mansión.',
      'Cuándo nació el notario.',
    ],
    0,
    '안 이유 = la razón por la que sabía · 설명되지 않다 = no quedar explicado.',
    '-다손 치더라도 (G195) concede provisionalmente una afirmación para demostrar que la objeción principal sigue en pie.',
  ),
  selection(
    '서윤 씨가 벽난로를 보지 않았다손 치더라도, 재 속의 단추는 그대로 남아요.',
    '¿Qué evidencia sobrevive incluso concediendo su negación?',
    [
      'Una fotografía del jardín.',
      'El botón encontrado entre la ceniza.',
      'La llave de la biblioteca.',
      'Una llamada hecha a medianoche.',
    ],
    1,
    '재 = ceniza · 단추 = botón · 그대로 남다 = permanecer.',
    '않았다손 치더라도 (G195) = «aun concediendo que no lo hizo». La evidencia de la oración principal no desaparece.',
  ),
  selection(
    '도현 씨의 시계가 고장 났다손 치더라도, 복도 카메라의 시각까지 달라지지는 않아요.',
    '¿Qué reloj independiente refuta la excusa?',
    [
      'El reloj de pulsera de 도현.',
      'El campanario del pueblo.',
      'La marca horaria de la cámara del pasillo.',
      'Un despertador sin pilas.',
    ],
    2,
    '복도 카메라의 시각 = hora de la cámara del pasillo · 달라지다 = cambiar/diferir.',
    '고장 났다손 치더라도 (G195) concede la avería, pero la marca independiente sigue contradiciendo la coartada.',
  ),
  selection(
    '가영 씨가 약병을 만지지 않았다손 치더라도, 장갑 안쪽의 가루는 확인해야 해요.',
    '¿Qué examen sigue siendo necesario?',
    [
      'Medir la temperatura del comedor.',
      'Preguntar quién compró los guantes.',
      'Volver a leer el testamento en voz alta.',
      'Analizar el polvo del interior de los guantes.',
    ],
    3,
    '장갑 안쪽 = interior del guante · 가루 = polvo.',
    '않았다손 치더라도 (G195) no acepta la inocencia; concede el argumento y preserva la necesidad del examen.',
  ),
  selection(
    '준호 씨의 메모가 농담이었다손 치더라도, 지워진 이름과 필체가 같아요.',
    '¿Qué vínculo permanece aunque la nota fuera una broma?',
    [
      'La caligrafía coincide con la del nombre borrado.',
      'La nota tiene el mismo tamaño que el testamento.',
      '준호 heredará la biblioteca.',
      'El nombre borrado pertenece al jardinero.',
    ],
    0,
    '농담 = broma · 필체가 같다 = tener la misma caligrafía.',
    '농담이었다손 치더라도 (G195) admite la premisa a efectos del argumento; la coincidencia material permanece.',
  ),
]

// Slot 4 · Classifying the seven heirs' claims as limited evidence · G111
const SLOT_4_CANDIDATES: CompletionCandidate[] = [
  completion(
    '이 사진은 누군가 방에 있었다는 정황___해요.',
    'Esta fotografía no pasa de ser un indicio de que alguien estuvo en la habitación.',
    '에 불과',
    '정황 = indicio/circunstancia. La foto no identifica a la persona.',
    'N에 불과하다 (G111) minimiza el alcance probatorio: 정황에 불과해요 = no es más que un indicio.',
  ),
  completion(
    '찢어진 봉투가 보여 주는 것은 유언장이 옮겨졌다는 가능성___해요.',
    'El sobre rasgado no pasa de indicar la posibilidad de que el testamento fuera trasladado.',
    '에 불과',
    '가능성 = posibilidad · 옮겨지다 = ser trasladado.',
    '가능성에 불과해요 (G111): evidencia compatible con una hipótesis, no demostración concluyente.',
  ),
  completion(
    '한 사람의 진술은 확인되지 않은 주장___해요.',
    'La declaración de una sola persona no es más que una afirmación sin verificar.',
    '에 불과',
    '확인되지 않은 = no verificado · 주장 = afirmación.',
    '주장에 불과해요 (G111) limita la fuerza de un testimonio aislado.',
  ),
  completion(
    '복제 열쇠는 금고를 열 수단___하고 범인을 증명하지는 못해요.',
    'La llave duplicada no es más que un medio para abrir la caja fuerte; no prueba quién lo hizo.',
    '에 불과',
    '복제 열쇠 = llave duplicada · 수단 = medio.',
    '수단에 불과하고 (G111) enlaza la limitación con una negación explícita de lo que la pieza no demuestra.',
  ),
  completion(
    '열한 시의 종소리는 시간 단서___해요.',
    'Las once campanadas no pasan de ser una pista temporal.',
    '에 불과',
    '종소리 = campanadas · 시간 단서 = pista temporal.',
    '시간 단서에 불과해요 (G111) evita convertir una pista de hora en una acusación personal.',
  ),
]

// Slot 5 · Reconstructing the hidden objective · G101
const SLOT_5_CANDIDATES: SelectionCandidate[] = [
  selection(
    '일곱 명 모두에게 작은 지분을 남겼으니 누구도 완전히 배제하지 않은 셈이에요.',
    '¿Qué equivale a decir el reparto mínimo?',
    [
      'Que los siete quedaron excluidos.',
      'Que ninguno fue excluido por completo.',
      'Que una sola persona recibe toda la fortuna.',
      'Que las participaciones carecen de valor legal.',
    ],
    1,
    '지분 = participación · 배제하다 = excluir · 완전히 = por completo.',
    '-(으)ㄴ/는 셈이다 (G101) expresa el resultado práctico: dejar algo a todos equivale a no excluir totalmente a nadie.',
  ),
  selection(
    '도서관을 재단에 넘기면 가족이 공동으로 관리하는 셈이에요.',
    '¿Qué efecto práctico tendría entregar la biblioteca a la fundación?',
    [
      'La familia la administraría conjuntamente mediante la fundación.',
      'La biblioteca sería demolida de inmediato.',
      'Un heredero podría venderla sin consultar a nadie.',
      'El notario se convertiría en propietario privado.',
    ],
    0,
    '재단 = fundación · 공동으로 = conjuntamente · 관리하다 = administrar.',
    '관리하는 셈이에요 (G101) traduce una estructura jurídica a su consecuencia práctica.',
  ),
  selection(
    '조건을 지키지 않으면 상속을 포기하는 셈이에요.',
    '¿Qué supone incumplir la condición?',
    [
      'Aplazar la lectura durante una semana.',
      'Solicitar una participación mayor.',
      'Equivale a renunciar a la herencia.',
      'Transferir la herencia al notario.',
    ],
    2,
    '조건을 지키다 = cumplir la condición · 포기하다 = renunciar.',
    '포기하는 셈이에요 (G101) explica la equivalencia jurídica implícita, no una acción material inmediata.',
  ),
  selection(
    '숨겨진 조항을 공개하면 고인의 마지막 의도를 따르는 셈이에요.',
    '¿Qué representa publicar la cláusula oculta?',
    [
      'Modificar el testamento sin autorización.',
      'Acusar públicamente a los siete herederos.',
      'Invalidar todas las pruebas anteriores.',
      'Equivale a respetar la intención final del fallecido.',
    ],
    3,
    '공개하다 = hacer público · 고인 = fallecido · 의도 = intención.',
    '따르는 셈이에요 (G101) formula la consecuencia interpretativa de revelar lo que estaba oculto.',
  ),
  selection(
    '한 명이 증거를 숨기면 다른 여섯 명의 권리까지 위험하게 하는 셈이에요.',
    '¿Qué alcance tiene ocultar la evidencia?',
    [
      'Solo perjudica a quien la escondió.',
      'En la práctica, pone en riesgo también los derechos de los otros seis.',
      'Hace que las pruebas sean automáticamente verdaderas.',
      'Obliga a vender la mansión esa misma noche.',
    ],
    1,
    '권리 = derecho · 위험하게 하다 = poner en riesgo.',
    '위험하게 하는 셈이에요 (G101) muestra el efecto equivalente, más amplio que el gesto individual.',
  ),
]

// Slot 6 · Counterfactual verdict assembled at the sealed evidence room · G248
const SLOT_6_CANDIDATES: CreationCandidate[] = [
  creation(
    '그날 밤 카메라가 멈추지 않았다면 무엇을 바로 확인했을까요?',
    'Construye: «Si la cámara no se hubiera detenido aquella noche, habríamos visto quién entró».',
    ['누가 들어왔는지', '그날 밤', '멈추지', '봤을', '않았던들', '카메라가', '텐데요'],
    [1, 5, 2, 4, 0, 3, 6],
    'El antecedente contrafactual termina en 않았던들; la pregunta indirecta es 누가 들어왔는지.',
    '-았/었던들 (G248) construye un pasado imposible: 멈추지 않았던들. El resultado no realizado suele cerrar en -(으)ㄹ 텐데요.',
  ),
  creation(
    '서명이 지워지지 않았다면 무엇이 달라졌을까요?',
    'Construye: «Si la firma no hubiera sido borrada, no habría existido esta disputa».',
    ['이 분쟁은', '지워지지', '없었을', '않았던들', '서명이', '텐데요', '아예'],
    [4, 1, 3, 0, 6, 2, 5],
    '서명이 es sujeto del antecedente; 아예 없었을 텐데요 expresa «no habría existido en absoluto».',
    '지워지지 않았던들 (G248) imagina lo contrario de un hecho pasado; el litigio sí existe, por eso es contrafactual.',
  ),
  creation(
    '열한 시의 종이 조작되지 않았다면 알리바이는 어떻게 됐을까요?',
    'Construye: «Si las once campanadas no hubieran sido manipuladas, la coartada se habría derrumbado antes».',
    ['알리바이는', '않았던들', '무너졌을', '열한 시의', '조작되지', '벌써', '텐데요', '종이'],
    [3, 7, 4, 1, 0, 5, 2, 6],
    '열한 시의 종이 forma el sujeto «la campana de las once»; 조작되지 않았던들 completa la condición imposible.',
    '조작되지 않았던들 (G248) contrapone el hecho real —sí fue manipulado— con el resultado alternativo.',
  ),
  creation(
    '두 번째 유언장이 발견되지 않았다면 일곱 명은 무엇을 믿었을까요?',
    'Construye: «Si el segundo testamento no hubiera sido hallado, los siete habrían creído la cláusula falsa».',
    [
      '거짓 조항을',
      '믿었을',
      '유언장이',
      '일곱 명은',
      '발견되지',
      '않았던들',
      '두 번째',
      '텐데요',
    ],
    [6, 2, 4, 5, 3, 0, 1, 7],
    '두 번째 유언장이 es el sujeto; 일곱 명은 abre el resultado alternativo.',
    '발견되지 않았던들 (G248) establece una condición pasada contraria a los hechos: el documento sí apareció.',
  ),
  creation(
    '회장님이 증거를 한곳에 모으지 않았다면 진실은 어떻게 됐을까요?',
    'Construye: «Si el presidente no hubiera reunido la evidencia en un lugar, la verdad habría quedado enterrada».',
    ['진실은', '모으지', '회장님이', '묻혔을', '증거를 한곳에', '않았던들', '텐데요', '그대로'],
    [2, 4, 1, 5, 0, 7, 3, 6],
    'El antecedente lleva 회장님이 증거를 한곳에; 그대로 묻히다 = quedar enterrado tal cual.',
    '모으지 않았던들 (G248) reconstruye el propósito del fallecido mediante el resultado que evitó.',
  ),
]

export const LEVEL_09: Level = {
  id: 'level-09',
  title: t('La mansión del testamento'),
  tagline: t(
    'Siete herederos entraron a escuchar una última voluntad. La puerta se cerró, aparecieron dos testamentos incompatibles y una voz anunció que solo heredaría quien pudiera demostrar qué significaba realmente cada cláusula.',
  ),
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  intro: t(
    `La invitación llegó impresa en papel grueso, sin remitente: «Lectura privada del testamento de 한정우. Medianoche. No llegue tarde». La mansión se alza sobre el río como un bloque de piedra negra, demasiado moderna para llamarse castillo y demasiado vieja para tener tantas cámaras. En el vestíbulo te reciben siete herederos que intentan no mirarse.

Está 민석, el primogénito impecable; 서윤, la hija que dirigía la fundación; 도현, el sobrino endeudado; 가영, la médica de la familia; 준호, secretario personal del fallecido; 혜진, nieta y periodista; y 태오, el hijo que llevaba quince años fuera. Cada uno recibió una llave distinta. Ninguno sabe qué abre la suya.

El notario coloca un sobre lacrado bajo una lámpara verde. Antes de romperlo, las contraventanas bajan y las puertas cierran sus pestillos eléctricos. Una grabación de 한정우 llena el salón: «일곱 사람이 모두 진실을 확인하기 전에는 아무도 나갈 수 없습니다.» Hasta que las siete personas comprueben la verdad, nadie podrá salir.

El sobre contiene dos hojas. En una, la mansión y la fortuna pasan a «quien haya cuidado de esta casa hasta el final». En la otra, fechada el mismo día y con una coma en otro lugar, todo pasa a una fundación administrada por «los herederos que no ocultaron nada». Ninguna hoja indica cuál es el original. En la chimenea hay ceniza reciente y un octavo nombre arrancado del registro familiar.

Las llaves abren habitaciones distintas, pero las puertas solo responden cuando una declaración queda formulada con precisión. Aquí una inferencia no vale como observación, una causa formal no equivale a culpa y una pista no pasa de ser una pista. El sistema de la casa parece diseñado para castigar el lenguaje ambiguo que gobernó a esta familia durante décadas.

La grabación añade una última instrucción: existe una sala de pruebas que solo se abrirá tras comparar los siete testimonios. Dentro está la cláusula definitiva. El reloj del pasillo marca las once y cincuenta y nueve, aunque acabas de oír once campanadas. Alguien manipuló la hora; quizá también el testamento. Las luces se apagan excepto la lámpara verde. La lectura acaba de empezar.`,
  ),
  outro: t(
    `La séptima llave gira desde el interior de la sala de pruebas. En las paredes se encienden las líneas de tiempo que reconstruiste y, en el centro, aparece tu conclusión: «{farewell}». No acusa a un único heredero. Explica una maquinaria de silencios en la que casi todos ocultaron algo y nadie poseía por sí solo toda la verdad.

La cláusula definitiva está grabada detrás del cristal, no escrita en papel: la fortuna se convierte en un fideicomiso indivisible si cualquiera de los siete intenta apropiársela mediante una prueba oculta. 한정우 sabía que desconfiarían unos de otros. Por eso repartió las llaves y sembró dos versiones ambiguas: necesitaba obligarlos a juntar testimonios que por separado no eran más que fragmentos.

La octava persona no era un heredero secreto. Era 박은재, la archivera que durante treinta años documentó cada compra, préstamo y donación de la casa. Su nombre fue arrancado por 준호 para proteger una falsificación antigua, pero ella había dejado copias en la sala. La frase «quien cuidó de esta casa» no nombraba a un descendiente: reconocía a quien conservó su memoria.

민석 devuelve la llave de la caja fuerte. 서윤 saca del bolso el botón que había encontrado entre la ceniza. 가영 entrega el frasco de medicina, que resulta ser un revelador de tinta. Uno a uno, los siete colocan sobre la mesa lo que escondieron por miedo a perder. La mansión responde levantando las contraventanas.

La grabación final de 한정우 no suena triunfal. «서로 믿으라고 한 적은 없습니다. 확인하고도 숨기지 말라고 했을 뿐입니다.» Nunca les pedí que confiaran unos en otros. Solo que, después de comprobarlo, no lo ocultaran. En la pantalla aparece la firma de 은재 junto a un contrato de conservación vitalicio.

Amanece sobre el río cuando la policía y el equipo jurídico cruzan el portón abierto. Nadie sale más rico de lo que entró. La mansión pasará a ser un archivo público y los siete conservarán una participación que no pueden vender por separado. En la biblioteca, por primera vez, el retrato de la archivera ocupa el octavo espacio. La ambigüedad terminó haciendo lo único que la familia nunca había conseguido: obligarlos a completar la frase entre todos.`,
  ),
  voiceIntro:
    '일곱 사람이 모두 진실을 확인하기 전에는 아무도 나갈 수 없습니다. 각자의 열쇠보다 각자의 진술을 먼저 맞추세요.',
  voiceOutro:
    '서로 믿으라고 한 적은 없습니다. 확인하고도 숨기지 말라고 했을 뿐입니다. 이제 문을 열겠습니다.',
  grammarCodes: ['G098', 'G110', 'G195', 'G111', 'G101', 'G248'],
  topikLevel: 5,
  rooms: [
    {
      id: 'room-reading-hall',
      title: t('El salón de la lectura (유언장 홀)'),
      image: 'rooms/room-01-reading-hall-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'seven-testimonies', rect: [45, 79, 230, 90], triggersSlot: 'slot-1' },
        { id: 'two-wills', rect: [116, 166, 88, 44], triggersSlot: 'slot-2' },
        {
          id: 'green-lamp',
          rect: [135, 125, 50, 70],
          cosmeticDetail: t('Bajo la luz se aprecia que las dos firmas ejercieron distinta presión.'),
        },
        {
          id: 'eleven-clock',
          rect: [230, 12, 40, 60],
          cosmeticDetail: t('El reloj marca casi medianoche, pero la campana solo sonó once veces.'),
        },
      ],
    },
    {
      id: 'room-ash-library',
      title: t('La biblioteca de ceniza (재의 서재)'),
      image: 'rooms/room-02-ash-library-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'heir-excuses', rect: [60, 92, 72, 86], triggersSlot: 'slot-3' },
        {
          id: 'charred-button',
          rect: [158, 174, 38, 26],
          cosmeticDetail: t('En el reverso del botón está grabado el emblema de la fundación.'),
        },
        {
          id: 'eighth-portrait',
          rect: [226, 46, 55, 78],
          cosmeticDetail: t('Hay ocho marcos, pero solo siete retratos.'),
        },
      ],
    },
    {
      id: 'room-evidence-gallery',
      title: t('La galería de evidencias (증거 회랑)'),
      image: 'rooms/room-03-evidence-gallery-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'evidence-board', rect: [42, 49, 115, 105], triggersSlot: 'slot-4' },
        { id: 'inheritance-model', rect: [192, 102, 86, 75], triggersSlot: 'slot-5' },
        {
          id: 'duplicated-key',
          rect: [130, 184, 48, 25],
          cosmeticDetail: t('La llave duplicada tiene un arañazo reciente.'),
        },
      ],
    },
    {
      id: 'room-sealed-vault',
      title: t('La sala sellada (봉인 증거실)'),
      image: 'rooms/room-04-sealed-vault-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'counterfactual-lock', rect: [92, 70, 135, 116], triggersSlot: 'slot-6' },
        {
          id: 'eighth-name',
          rect: [238, 83, 52, 70],
          cosmeticDetail: t('Bajo el nombre borrado todavía se leen los caracteres 은재.'),
        },
        {
          id: 'timeline-projector',
          rect: [24, 154, 60, 48],
          cosmeticDetail: t('Las siete declaraciones se superponen en una única línea temporal.'),
        },
      ],
    },
  ],
  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G098'], candidates: SLOT_1_CANDIDATES },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G110'], candidates: SLOT_2_CANDIDATES },
    { id: 'slot-3', type: 'selection', grammarFocus: ['G195'], candidates: SLOT_3_CANDIDATES },
    { id: 'slot-4', type: 'completion', grammarFocus: ['G111'], candidates: SLOT_4_CANDIDATES },
    { id: 'slot-5', type: 'selection', grammarFocus: ['G101'], candidates: SLOT_5_CANDIDATES },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G248'], candidates: SLOT_6_CANDIDATES },
  ],
  scriptedBeats: [
    {
      afterSlotId: 'slot-3',
      voiceLine: '모두 사실을 말했지만, 모두 전부를 말한 것은 아니에요.',
      narrative: t(
        'La lámpara verde separa las declaraciones en capas. Ninguna es completamente falsa: cada heredero narró el fragmento que lo favorecía y recortó el resto. Las siete versiones forman una secuencia continua solo cuando dejas de tratarlas como acusaciones y las ordenas como observaciones. La mansión no busca al mejor mentiroso; busca demostrar que una verdad incompleta también puede ser utilizada para engañar.',
      ),
    },
    {
      afterSlotId: 'slot-5',
      voiceLine: '상속인은 일곱 명이지만, 이 집을 기억한 사람은 여덟 명이었어요.',
      narrative: t(
        'El modelo de la herencia despliega una octava llave, plana y sin dientes: no abre una cerradura, sino la placa trasera de los retratos. Allí aparece 박은재, archivera de la mansión durante treinta años. El testamento nunca quiso premiar al heredero que «cuidó» la propiedad, sino reconocer a la persona que cuidó sus documentos. La coma desplazada convirtió una deuda de gratitud en una competencia familiar.',
      ),
    },
  ],
  rewards: {
    common: {
      id: 'cosmetic-bg-testament-mansion',
      image: 'cosmetics/cosmetic-bg-testament-mansion.png',
      name: t('Fondo «유언의 밤»'),
      description: t(
        'El salón de la mansión a medianoche, con siete sillas, dos testamentos y una única lámpara verde.',
      ),
    },
    rare: {
      id: 'cosmetic-frame-seven-keys',
      image: 'cosmetics/cosmetic-frame-seven-keys.png',
      name: t('Marco «일곱 개의 열쇠»'),
      description: t(
        'Siete llaves de latón enlazadas por líneas de evidencia y pequeños sellos de cera oscura.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-archivist-eunjae',
      image: 'cosmetics/cosmetic-avatar-archivist-eunjae.png',
      name: t('Avatar «기록자 은재»'),
      description: t(
        'La archivera 박은재 frente al octavo retrato, sosteniendo el inventario que conservó la memoria de la casa.',
      ),
    },
    legendary: {
      id: 'cosmetic-set-complete-09',
      image: 'cosmetics/cosmetic-set-complete-09.png',
      name: t('Set completo «여덟 번째 이름»'),
      description: t(
        'El octavo nombre: avatar de 은재, marco de siete llaves y fondo del archivo público al amanecer.',
      ),
    },
  },
  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  ScriptedBeat,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './translations/levels/level-05'

/**
 * Level 5 — "La cocina del abuelo (할아버지의 부엌)"
 *
 * A TOPIK 3 culinary mystery about inherited memory rather than merely
 * following a recipe. Six pools turn labels, timings, sequences, simultaneous
 * actions and cause/result changes into the practical work of finishing one
 * last Sunday service together.
 */

// ─── SLOT 1 · Separar recuerdos de suposiciones · selection · G168 ──────────

const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '나는 된장을 새로 담근 줄 알았는데, 장독에 삼 년 된 된장이 있었어요.',
    question: t('¿Qué error de memoria corrige la etiqueta del tarro?'),
    options: [
      t('Creía que el doenjang era recién hecho, pero había uno de tres años en la tinaja.'),
      t('Sabía que el doenjang tenía tres años y decidió tirarlo.'),
      t('Creía que la tinaja estaba vacía, pero encontró salsa de soja nueva.'),
      t('No sabía preparar doenjang y tardó tres años en aprender.'),
    ],
    correctIndex: 0,
    hints: {
      free: t(
        '새로 담그다 = preparar/fermentar de nuevo · 삼 년 된 = de tres años · 장독 = tinaja de fermentación.',
      ),
      premium: t(
        '-(으)ㄴ 줄 알았다 (G168) marca una creencia que luego resulta equivocada: 담근 줄 알았는데 contrasta con 삼 년 된.',
      ),
    },
  },
  {
    korean: '할아버지는 요리 공책을 잃어버린 줄 알았지만 앞치마 주머니에 있었어요.',
    question: t('¿Dónde apareció el cuaderno de cocina?'),
    options: [
      t('Debajo de la mesa donde el abuelo pensaba haberlo dejado.'),
      t('En la despensa, dentro de una tinaja vacía.'),
      t('En el bolsillo del delantal, aunque el abuelo creía haberlo perdido.'),
      t('En casa de un cliente que lo devolvió esa mañana.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('잃어버리다 = perder · 앞치마 주머니 = bolsillo del delantal · 있다 = estar.'),
      premium: t(
        '잃어버린 줄 알았지만 (G168) = «creía que lo había perdido, pero…». La cláusula posterior revela la realidad.',
      ),
    },
  },
  {
    korean: '나는 마지막 손님이 매운 음식을 좋아하는 줄 알았는데 사실은 순한 맛을 좋아해요.',
    question: t('¿Cómo debes ajustar el guiso para el último cliente?'),
    options: [
      t('Hacerlo más picante porque eso confirma la primera impresión.'),
      t('Mantener un sabor suave: la suposición sobre el picante era incorrecta.'),
      t('Servirlo frío porque el cliente no come platos calientes.'),
      t('No cambiar nada porque 순한 맛 significa sabor muy salado.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('매운 음식 = comida picante · 사실은 = en realidad · 순한 맛 = sabor suave.'),
      premium: t(
        '좋아하는 줄 알았는데 (G168) introduce lo que se creía; 사실은 corrige esa creencia.',
      ),
    },
  },
  {
    korean: '나는 할머니가 소금을 많이 넣은 줄 알았지만 멸치 육수가 원래 짰어요.',
    question: t('¿Cuál era la verdadera causa del sabor salado?'),
    options: [
      t('La abuela añadió demasiado doenjang.'),
      t('El abuelo confundió azúcar con sal.'),
      t('El guiso se volvió salado después de enfriarse.'),
      t('El caldo de anchoas ya era salado; no fue exceso de sal de la abuela.'),
    ],
    correctIndex: 3,
    hints: {
      free: t(
        '소금을 넣다 = añadir sal · 멸치 육수 = caldo de anchoas · 원래 = originalmente/ya de por sí.',
      ),
      premium: t(
        '넣은 줄 알았지만 (G168) presenta la explicación equivocada. La verdad aparece tras 하지만: 육수가 원래 짰어요.',
      ),
    },
  },
  {
    korean: '오늘이 가게 쉬는 날인 줄 알았는데 마지막 예약이 하나 남아 있었어요.',
    question: t('¿Por qué la cocina debe encenderse una vez más?'),
    options: [
      t('Porque queda una última reserva aunque se creía que hoy cerraba el local.'),
      t('Porque el día de descanso se trasladó a la semana anterior.'),
      t('Porque llegaron muchos clientes sin reserva.'),
      t('Porque el abuelo decidió abrir un local nuevo hoy.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('쉬는 날 = día de descanso · 마지막 예약 = última reserva · 남아 있다 = quedar.'),
      premium: t(
        'N인 줄 알았다 (G168) sirve con sustantivos: 쉬는 날인 줄 알았는데. El contraste revela una reserva pendiente.',
      ),
    },
  },
]

// ─── SLOT 2 · Leer el tiempo acumulado · completion · G078 ─────────────────

const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '이 된장을 ___ 삼 년이 됐어요.',
    translation: t('Hace tres años que se preparó este doenjang.'),
    answer: '담근 지',
    hints: {
      free: t('된장을 담그다 = preparar/poner a fermentar doenjang · 삼 년 = tres años.'),
      premium: t('V-(으)ㄴ 지 + duración + 되다 (G078): 담그다 → 담근 지 삼 년이 됐어요.'),
    },
  },
  {
    korean: '할아버지가 이 식당 문을 ___ 사십 년이 됐어요.',
    translation: t('Hace cuarenta años que el abuelo abrió este restaurante.'),
    answer: '연 지',
    hints: {
      free: t('식당 문을 열다 = abrir el restaurante · 사십 년 = cuarenta años.'),
      premium: t(
        '열다 pierde ㄹ ante -(으)ㄴ: 연 지 (G078). La duración se cuenta desde la apertura.',
      ),
    },
  },
  {
    korean: '할머니가 이 조리법을 ___ 삼십 년이 지났어요.',
    translation: t('Han pasado treinta años desde que la abuela escribió esta receta.'),
    answer: '쓴 지',
    hints: {
      free: t('조리법 = receta/procedimiento · 쓰다 = escribir · 지나다 = transcurrir.'),
      premium: t(
        '쓰다 → 쓴 지 (G078). 됐어요 y 지났어요 pueden cerrar la expresión de tiempo transcurrido.',
      ),
    },
  },
  {
    korean: '육수를 끓이기 ___ 한 시간이 됐어요.',
    translation: t('Hace una hora que se empezó a hervir el caldo.'),
    answer: '시작한 지',
    hints: {
      free: t('끓이기 시작하다 = empezar a hervir · 한 시간 = una hora.'),
      premium: t(
        'El verbo que marca el punto inicial es 시작하다 → 시작한 지 (G078), seguido por la duración.',
      ),
    },
  },
  {
    korean: '두부를 ___ 십 분이 지났어요.',
    translation: t('Han pasado diez minutos desde que se cortó el tofu.'),
    answer: '자른 지',
    hints: {
      free: t('두부 = tofu · 자르다 = cortar · 십 분 = diez minutos.'),
      premium: t(
        'La forma atributiva pasada de 자르다 es 자른: 자른 지 (G078), «desde que se cortó».',
      ),
    },
  },
]

// ─── SLOT 3 · Recuperar el orden de cocción · creation · G079 ──────────────

const SLOT_3_CANDIDATES: CreationCandidate[] = [
  {
    korean: '물이 끓으면 가장 먼저 무엇을 합니까?',
    question: t('Ordena el paso que debe hacerse en cuanto hierva el agua.'),
    tiles: ['물이', '끓자마자', '된장을', '풀어요', '끓기 전에', '소금을', '버려요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('물이 끓다 = hervir el agua · 된장을 풀다 = disolver el doenjang.'),
      premium: t(
        'Raíz verbal + -자마자 (G079) = «en cuanto». 끓다 → 끓자마자, sin marca de pasado en la primera acción.',
      ),
    },
  },
  {
    korean: '감자를 썬 다음 바로 무엇을 합니까?',
    question: t('Construye la instrucción de secuencia inmediata para que la patata no se oxide.'),
    tiles: ['감자를', '썰자마자', '물에', '넣어요', '썰면서', '밖에', '말려요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('감자 = patata · 썰다 = cortar en láminas/trozos · 물에 넣다 = poner en agua.'),
      premium: t(
        '썰다 → 썰자마자 (G079): la segunda acción sucede inmediatamente después de cortar.',
      ),
    },
  },
  {
    korean: '두부를 넣은 직후 불을 어떻게 합니까?',
    question: t('Ordena la reacción inmediata que evita que el tofu se rompa.'),
    tiles: ['두부를', '넣자마자', '불을', '줄여요', '넣기 때문에', '불이', '높아요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('두부를 넣다 = añadir tofu · 불을 줄이다 = bajar el fuego.'),
      premium: t(
        '넣자마자 (G079) conecta dos acciones consecutivas sin intervalo: añadir y bajar el fuego.',
      ),
    },
  },
  {
    korean: '마지막에 뚜껑을 열면 무엇을 합니까?',
    question: t('Recupera el último gesto de la receta en cuanto se abre la tapa.'),
    tiles: ['뚜껑을', '열자마자', '파를', '넣어요', '닫자마자', '파가', '빠져요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('뚜껑 = tapa · 열다 = abrir · 파 = cebolleta.'),
      premium: t(
        '열다 → 열자마자 (G079). -자마자 se une directamente a la raíz y conserva el orden inmediato.',
      ),
    },
  },
  {
    korean: '밥솥의 불이 꺼진 뒤 바로 무엇을 합니까?',
    question: t('Ordena la instrucción para reposar el arroz en cuanto termina la cocción.'),
    tiles: [
      '밥이',
      '되자마자',
      '십 분 동안',
      '뜸을 들여요',
      '되기 때문에',
      '뚜껑을',
      '계속 열어요',
    ],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('밥이 되다 = quedar listo el arroz · 뜸을 들이다 = dejar reposar al vapor.'),
      premium: t(
        '되다 → 되자마자 (G079), «en cuanto esté listo». 십 분 동안 indica cuánto dura el reposo posterior.',
      ),
    },
  },
]

// ─── SLOT 4 · Cocinar dos cosas a la vez · selection · G061 ────────────────

const SLOT_4_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '할아버지는 국을 저으면서 냄새를 맡아요.',
    question: t('¿Qué hace el abuelo sin dejar de remover el guiso?'),
    options: [
      t('Huele el guiso mientras lo remueve.'),
      t('Deja de remover para abrir la ventana.'),
      t('Remueve después de haber olido el arroz.'),
      t('Pide a otra persona que huela el guiso.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('젓다 = remover · 냄새를 맡다 = oler · 할아버지는 es el sujeto de ambas acciones.'),
      premium: t(
        '-(으)면서 (G061) une dos acciones simultáneas del mismo sujeto: 저으면서 … 맡아요.',
      ),
    },
  },
  {
    korean: '파를 썰면서 냄비가 넘치지 않는지 지켜봐요.',
    question: t('¿Qué tarea doble exige esta nota junto a la tabla?'),
    options: [
      t('Cortar la cebolleta después de apagar la olla.'),
      t('Vigilar la olla mientras se corta la cebolleta.'),
      t('Esperar a que rebose la olla para cortar la cebolleta.'),
      t('Pedir a otra persona que corte mientras sales de la cocina.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('파를 썰다 = cortar cebolleta · 넘치다 = rebosar · 지켜보다 = vigilar.'),
      premium: t(
        '썰면서 (G061) exige que quien corta también vigile. No indica una secuencia, sino simultaneidad.',
      ),
    },
  },
  {
    korean: '간을 보면서 조리법 옆에 바뀐 양을 메모해요.',
    question: t('¿Cómo conserva el abuelo los ajustes de sabor?'),
    options: [
      t('Memoriza la cantidad y rompe la receta.'),
      t('Prueba el sabor solo después de guardar el cuaderno.'),
      t('Anota la cantidad modificada mientras prueba el punto de sal.'),
      t('Copia una receta nueva antes de probar nada.'),
    ],
    correctIndex: 2,
    hints: {
      free: t(
        '간을 보다 = probar/sazonar al punto · 바뀐 양 = cantidad modificada · 메모하다 = anotar.',
      ),
      premium: t('보면서 (G061) hace simultáneas probar y anotar, con el mismo sujeto tácito.'),
    },
  },
  {
    korean: '밥을 푸면서 마지막 손님과 옛날 이야기를 해요.',
    question: t('¿Qué sucede mientras se sirve el arroz?'),
    options: [
      t('El cliente sirve el arroz después de cerrar el local.'),
      t('El abuelo escucha una grabación sin hablar.'),
      t('Se guarda el arroz antes de recibir al cliente.'),
      t('Se conversa sobre tiempos pasados con el último cliente.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('밥을 푸다 = servir arroz · 옛날 이야기 = historias del pasado · 손님 = cliente.'),
      premium: t(
        '푸면서 (G061) significa «mientras sirve». La conversación ocurre al mismo tiempo, no antes ni después.',
      ),
    },
  },
  {
    korean: '그릇을 닦으면서 할머니가 좋아하던 노래를 흥얼거려요.',
    question: t('¿Qué recuerdo acompaña la limpieza de los cuencos?'),
    options: [
      t('El abuelo tararea la canción que le gustaba a la abuela mientras seca los cuencos.'),
      t('La abuela limpia los cuencos mientras el abuelo duerme.'),
      t('El abuelo cambia de canción después de romper un cuenco.'),
      t('Un cliente canta para que la cocina cierre antes.'),
    ],
    correctIndex: 0,
    hints: {
      free: t(
        '그릇을 닦다 = limpiar/secar cuencos · 좋아하던 노래 = canción que solía gustarle · 흥얼거리다 = tararear.',
      ),
      premium: t(
        '닦으면서 (G061) conecta las dos acciones del abuelo. El -던 de 좋아하던 evoca una preferencia recordada.',
      ),
    },
  },
]

// ─── SLOT 5 · Entender causa y transformación · completion · G062 + G066 ───

const SLOT_5_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '오래 끓였기 때문에 국물이 ___.',
    translation: t('Como se coció durante mucho tiempo, el caldo se volvió más intenso.'),
    answer: '진해졌어요',
    hints: {
      free: t('오래 끓이다 = hervir mucho tiempo · 진하다 = ser intenso/concentrado.'),
      premium: t(
        'La causa va en -기 때문에 (G062); el cambio de estado usa adjetivo + -아/어지다 (G066): 진하다 → 진해졌어요.',
      ),
    },
  },
  {
    korean: '물을 조금 더 넣었기 때문에 맛이 ___.',
    translation: t('Como se añadió un poco más de agua, el sabor se volvió más suave.'),
    answer: '부드러워졌어요',
    hints: {
      free: t('물을 더 넣다 = añadir más agua · 부드럽다 = suave.'),
      premium: t(
        'ㅂ irregular: 부드럽다 → 부드러워지다 → 부드러워졌어요 (G066). La primera cláusula da la causa (G062).',
      ),
    },
  },
  {
    korean: '불을 줄였기 때문에 국물이 더 ___.',
    translation: t('Como se bajó el fuego, el caldo quedó más calmado.'),
    answer: '잔잔해졌어요',
    hints: {
      free: t('불을 줄이다 = bajar el fuego · 잔잔하다 = estar calmado, sin agitación.'),
      premium: t(
        '잔잔하다 → 잔잔해졌어요 mediante -아/어지다 (G066). 때문에 señala qué produjo ese cambio.',
      ),
    },
  },
  {
    korean: '소금을 두 번 넣었기 때문에 국이 너무 ___.',
    translation: t('Como se añadió sal dos veces, el guiso se volvió demasiado salado.'),
    answer: '짜졌어요',
    hints: {
      free: t('소금을 두 번 넣다 = poner sal dos veces · 짜다 = estar salado.'),
      premium: t(
        '짜다 + -아지다 se contrae en 짜지다; pasado 짜졌어요 (G066). La causa está completa con -기 때문에 (G062).',
      ),
    },
  },
  {
    korean: '창문을 열었기 때문에 부엌 공기가 ___.',
    translation: t('Como se abrió la ventana, el aire de la cocina se volvió fresco.'),
    answer: '시원해졌어요',
    hints: {
      free: t(
        '창문을 열다 = abrir la ventana · 부엌 공기 = aire de la cocina · 시원하다 = fresco.',
      ),
      premium: t(
        '시원하다 → 시원해졌어요 con -아/어지다 (G066). El resultado sigue a la causa marcada por -기 때문에.',
      ),
    },
  },
]

// ─── SLOT 6 · Elegir qué memoria continuará · creation · G064 ──────────────

const SLOT_6_CANDIDATES: CreationCandidate[] = [
  {
    korean: '이 맛을 앞으로 어떻게 기억할 거예요?',
    question: t('Dile al abuelo qué has decidido hacer a partir de ahora.'),
    tiles: [
      '앞으로도',
      '일요일마다',
      '이 국을',
      '끓이기로 했어요',
      '끓이게 됐어요',
      '잊을 수밖에 없어요',
    ],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t(
        '앞으로도 = también de ahora en adelante · 일요일마다 = cada domingo · 끓이다 = cocinar/hervir.',
      ),
      premium: t(
        'V-기로 하다 (G064) expresa una decisión: 끓이기로 했어요. -게 되다 diría que ocurrió por circunstancias.',
      ),
    },
  },
  {
    korean: '이 공책은 누구에게 이어 줄 거예요?',
    question: t('Construye la promesa de transmitir la receta familiar.'),
    tiles: [
      '할아버지의',
      '조리법을',
      '가족에게',
      '전하기로 했어요',
      '전한 줄 알았어요',
      '숨기기로 했어요',
    ],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('조리법 = receta/procedimiento · 가족에게 = a la familia · 전하다 = transmitir.'),
      premium: t(
        '전하기로 했어요 (G064) = «he decidido transmitirla». La decisión propia se forma con -기로 하다.',
      ),
    },
  },
  {
    korean: '식당이 문을 닫은 뒤에도 무엇을 할까요?',
    question: t('Ordena el acuerdo que mantiene viva la mesa aunque cierre el restaurante.'),
    tiles: ['식당 문은', '닫아도', '함께', '밥을 먹기로 했어요', '혼자', '떠날 수밖에 없어요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('문을 닫다 = cerrar · 함께 = juntos · 밥을 먹다 = compartir/comer una comida.'),
      premium: t(
        '먹기로 했어요 (G064) marca un acuerdo. 닫아도 concede «aunque cierre» sin cancelar la decisión.',
      ),
    },
  },
  {
    korean: '비어 있는 장독을 보고 어떤 계획을 세웠어요?',
    question: t('Expresa la decisión de preparar una nueva fermentación en primavera.'),
    tiles: ['다음 봄에', '장을', '새로', '담그기로 했어요', '담근 지', '버리기로 했어요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('다음 봄 = la próxima primavera · 장을 담그다 = preparar salsas fermentadas.'),
      premium: t(
        '담그기로 했어요 (G064) codifica el plan decidido. 담근 지 necesitaría una duración pasada.',
      ),
    },
  },
  {
    korean: '빈 페이지에는 무엇을 쓸 거예요?',
    question: t(
      'Completa la decisión que convierte el cuaderno heredado en una historia compartida.',
    ),
    tiles: ['이 공책에', '우리의', '조리법도', '쓰기로 했어요', '써져 있어요', '지우기로 했어요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('우리의 = nuestro/a · 조리법도 = también una receta · 쓰다 = escribir.'),
      premium: t(
        '쓰다 → 쓰기로 했어요 (G064): decisión de escribir. 써져 있어요 describiría algo que ya está escrito.',
      ),
    },
  },
]

const SCRIPTED_BEATS: ScriptedBeat[] = [
  {
    afterSlotId: 'slot-4',
    voiceLine: '이건 할머니가 처음 쓴 조리법이에요.',
    narrative: t(
      'Al levantar el cuaderno, una hoja más fina cae sobre la mesa. No está escrita con la letra firme del abuelo, sino con trazos pequeños y rápidos.\n\n' +
        'Es la primera receta de la abuela. Al margen, cada corrección tiene una fecha: «menos sal cuando nació nuestra hija», «más caldo el invierno de la nevada», «tofu suave para el primer diente del nieto». La receta nunca estuvo quieta.',
    ),
  },
  {
    afterSlotId: 'slot-5',
    voiceLine: '맛은 기억하는 사람이 있을 때 계속되는 거야.',
    narrative: t(
      'El vapor pierde su olor crudo y adquiere el tono profundo de las tinajas. El abuelo prueba una cucharada, cierra los ojos y luego te ofrece la cuchara.\n\n' +
        '«No quería comprobar si podías copiarla», dice. «Quería saber si podías escuchar por qué cambió. Una receta continúa cuando alguien recuerda la causa, no solo la cantidad».',
    ),
  },
]

export const LEVEL_05: Level = {
  id: 'level-05',
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  title: t('La cocina del abuelo'),
  tagline: t(
    'Una última reserva, una receta llena de correcciones y el sabor que tu abuelo se niega a medir solo con números.',
  ),
  intro: t(
    'Antes del amanecer, una luz permanece encendida en el pequeño restaurante 골목집. Hoy debería estar cerrado: el cartel de la puerta dice «마지막 영업일», último día de servicio.\n\n' +
      'Tu abuelo te espera en la cocina con el delantal puesto y seis cuencos vacíos. Sobre la mesa hay un cuaderno hinchado por el vapor, pero varias páginas se soltaron y las etiquetas de las tinajas se mezclaron durante la limpieza.\n\n' +
      'Queda una reserva. Un cliente que ha venido cada domingo durante cuarenta años pidió «el guiso de siempre», aunque en el cuaderno esa receta nunca aparece igual dos veces.\n\n' +
      '«Los ingredientes se pueden pesar», dice el abuelo. «La memoria no. Para cocinar esto tendrás que leer cuándo cambió, qué ocurrió primero y por qué el sabor terminó así».\n\n' +
      'Abre la despensa. Entre el olor terroso del doenjang y el papel antiguo, la cocina guarda una secuencia que no conduce a una llave, sino a una mesa que todavía espera a sus comensales.',
  ),
  outro: t(
    'Apoyas la mano junto al cuaderno y dices: «{farewell}». El abuelo no responde enseguida; alisa la página vacía con la palma y deja el lápiz en medio de la mesa.\n\n' +
      'El último cliente prueba el guiso. «Hoy sabe distinto», murmura. El abuelo sonríe: «Claro. Hoy lo hicieron dos personas».\n\n' +
      'Los seis cuencos se llenan. Nadie ocupa la antigua silla de la abuela, pero frente a ella queda una cucharada servida, como cada domingo desde hace treinta años.\n\n' +
      'Cuando se apaga el letrero del restaurante, la cocina no parece cerrada. Las tinajas seguirán fermentando, y el cuaderno pesa ahora un poco más: tu decisión ocupa la primera línea de una página nueva.\n\n' +
      'No escapaste de la cocina del abuelo. Aprendiste a entrar en ella: siguiendo el tiempo, la secuencia y las causas hasta encontrar el lugar exacto donde una receta se convierte en memoria.',
  ),
  voiceIntro: '조리법은 순서만 외우면 안 돼. 왜 바뀌었는지도 알아야 해.',
  voiceOutro: '이제 이 맛을 기억하는 사람이 한 명 더 생겼구나.',
  grammarCodes: ['G168', 'G078', 'G079', 'G061', 'G062', 'G066', 'G064'],
  topikLevel: 3,

  rooms: [
    {
      id: 'room-pantry',
      title: t('La despensa de las tinajas (장독 창고)'),
      image: 'rooms/room-01-pantry-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'apron-notes', rect: [8, 48, 58, 120], triggersSlot: 'slot-1' },
        { id: 'dated-jars', rect: [184, 71, 104, 101], triggersSlot: 'slot-2' },
        {
          id: 'soy-blocks',
          rect: [117, 154, 54, 45],
          cosmeticDetail: t('Bloques de 메주 secándose: el principio del doenjang que vendrá.'),
        },
        {
          id: 'small-window',
          rect: [18, 28, 58, 49],
          cosmeticDetail: t('La primera claridad del domingo cae sobre el polvo de harina.'),
        },
      ],
    },
    {
      id: 'room-prep-table',
      title: t('La mesa de preparación (조리대)'),
      image: 'rooms/room-02-prep-table-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'sequence-cards', rect: [100, 165, 175, 55], triggersSlot: 'slot-3' },
        {
          id: 'knife-board',
          rect: [33, 125, 71, 55],
          cosmeticDetail: t('Patata, tofu y cebolleta esperan en grupos separados sobre la tabla.'),
        },
        {
          id: 'recipe-clock',
            rect: [270, 25, 45, 45],
          cosmeticDetail: t(
            'El minutero está manchado de salsa en las marcas de diez y treinta minutos.',
          ),
        },
        {
          id: 'grandma-photo',
          rect: [207, 109, 55, 63],
          cosmeticDetail: t('La abuela ríe frente a la misma mesa, muchos inviernos atrás.'),
        },
      ],
    },
    {
      id: 'room-stove',
      title: t('Los fogones (화구)'),
      image: 'rooms/room-03-stove-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'grandfather-ladle', rect: [66, 79, 66, 104], triggersSlot: 'slot-4' },
        { id: 'changing-broth', rect: [145, 91, 103, 83], triggersSlot: 'slot-5' },
        {
          id: 'open-window',
          rect: [239, 29, 66, 62],
          cosmeticDetail: t('Por la ventana abierta sale vapor y entra aire frío de la mañana.'),
        },
        {
          id: 'six-bowls',
          rect: [103, 176, 109, 35],
          cosmeticDetail: t('Seis cuencos, aunque la reserva está hecha para cinco personas.'),
        },
      ],
    },
    {
      id: 'room-dining-room',
      title: t('El comedor del último domingo (식당)'),
      image: 'rooms/room-04-dining-room-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'blank-recipe-page', rect: [124, 180, 96, 52], triggersSlot: 'slot-6' },
        {
          id: 'grandma-chair',
          rect: [213, 103, 48, 76],
          cosmeticDetail: t(
            'La silla de la abuela conserva un cojín remendado y un cuenco servido.',
          ),
        },
        {
          id: 'last-customer',
          rect: [44, 77, 62, 104],
          cosmeticDetail: t(
            'El último cliente guarda cuarenta años de domingos detrás de sus gafas.',
          ),
        },
        {
          id: 'closed-sign',
          rect: [257, 36, 47, 49],
          cosmeticDetail: t('El letrero se apagará hoy; el olor de la cocina no.'),
        },
      ],
    },
  ],

  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G168'], candidates: SLOT_1_CANDIDATES },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G078'], candidates: SLOT_2_CANDIDATES },
    { id: 'slot-3', type: 'creation', grammarFocus: ['G079'], candidates: SLOT_3_CANDIDATES },
    { id: 'slot-4', type: 'selection', grammarFocus: ['G061'], candidates: SLOT_4_CANDIDATES },
    {
      id: 'slot-5',
      type: 'completion',
      grammarFocus: ['G062', 'G066'],
      candidates: SLOT_5_CANDIDATES,
    },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G064'], candidates: SLOT_6_CANDIDATES },
  ],

  scriptedBeats: SCRIPTED_BEATS,

  rewards: {
    common: {
      id: 'cosmetic-bg-grandfather-kitchen',
      image: 'cosmetics/cosmetic-bg-grandfather-kitchen.png',
      name: t('Fondo «Vapor del domingo»'),
      description: t(
        'La cocina al amanecer, con seis cuencos y una olla respirando sobre el fuego bajo.',
      ),
    },
    rare: {
      id: 'cosmetic-frame-fermentation-jar',
      image: 'cosmetics/cosmetic-frame-fermentation-jar.png',
      name: t('Marco «장독대»'),
      description: t(
        'Tinajas de barro, etiquetas manuscritas y hojas de morera rodean el retrato.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-recipe-ladle',
      image: 'cosmetics/cosmetic-avatar-recipe-ladle.png',
      name: t('Avatar «Cucharón de memoria»'),
      description: t(
        'El viejo cucharón de madera del abuelo, pulido por cuarenta años de domingos.',
      ),
    },
    legendary: {
      id: 'cosmetic-set-complete-05',
      image: 'cosmetics/cosmetic-set-complete-05.png',
      name: t('Set completo «기억의 조리법»'),
      description: t(
        'Cuaderno, tinaja, cucharón y mesa reunidos en el set de la receta de la memoria.',
      ),
    },
  },

  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

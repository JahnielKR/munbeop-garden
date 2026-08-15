import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  ScriptedBeat,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './locale'

/**
 * Level 4 — "El último tren a Seúl (서울행 막차)"
 *
 * A TOPIK 3 station thriller built around authentic travel literacy: the
 * player reads a ticket, reconciles platform changes, reconstructs formal
 * announcements and gets the final passengers aboard a station's last train.
 * Six independently drawn pools keep the run variable without breaking the
 * fixed dramatic progression.
 */

// ─── SLOT 1 · Leer el billete y sus condiciones · selection · G073 ──────────

const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '승차권에 서울행 22시 40분이라고 적혀 있어요.',
    question: t('¿Qué información confirma el billete que encontraste junto al reloj?'),
    options: [
      t('Es para el tren con destino a Seúl de las 22:40.'),
      t('Es para el tren que llega desde Seúl a las 22:40.'),
      t('Es para el autobús a Seúl de las 20:40.'),
      t('Es para cualquier tren que salga antes de las 22:40.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('서울행 = con destino a Seúl · 승차권 = billete · 적혀 있다 = estar escrito.'),
      premium: t(
        '-아/어 있다 (G073) describe el estado que dejó una acción: 적혀 있어요 = «está escrito». El dato visible es 22시 40분.',
      ),
    },
  },
  {
    korean: '좌석은 7호차 12A로 표시되어 있어요.',
    question: t('¿Qué debes buscar cuando llegue el tren?'),
    options: [
      t('El andén 7 y la puerta 12A.'),
      t('El vagón 12 y el asiento 7A.'),
      t('El vagón 7 y el asiento 12A.'),
      t('La salida 7 a las 12:00.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('호차 = número de vagón · 좌석 = asiento · 표시되다 = estar indicado.'),
      premium: t(
        '표시되어 있어요 (G073) es un estado resultante: la información ya quedó marcada. 7호차 modifica el vagón; 12A identifica el asiento.',
      ),
    },
  },
  {
    korean: '표에는 오늘 날짜가 찍혀 있고 환불 불가라고 적혀 있어요.',
    question: t('¿Qué dos condiciones aparecen impresas en el billete?'),
    options: [
      t('Es válido mañana y permite reembolso.'),
      t('Lleva la fecha de hoy y no admite reembolso.'),
      t('No lleva fecha y debe validarse en ventanilla.'),
      t('Lleva la fecha de hoy y permite cambiar de destino.'),
    ],
    correctIndex: 1,
    hints: {
      free: t(
        '오늘 날짜 = fecha de hoy · 환불 불가 = reembolso no permitido · 찍히다 = quedar impreso.',
      ),
      premium: t(
        '찍혀 있고 y 적혀 있어요 presentan dos estados ya visibles (G073). 불가 significa «imposible/no permitido», no «disponible».',
      ),
    },
  },
  {
    korean: '도착역은 서울역으로 정해져 있고 중간에 갈아탈 필요가 없어요.',
    question: t('¿Cómo es el trayecto de este billete?'),
    options: [
      t('Termina en Busan y exige un transbordo en Seúl.'),
      t('Termina antes de Seúl y exige cambiar de autobús.'),
      t('Llega a Seúl, pero obliga a cambiar de tren a mitad del viaje.'),
      t('Tiene Seúl como destino final y no requiere transbordo.'),
    ],
    correctIndex: 3,
    hints: {
      free: t(
        '도착역 = estación de llegada · 정해지다 = quedar fijado · 갈아타다 = hacer transbordo.',
      ),
      premium: t(
        '정해져 있다 (G073) indica que el destino ya está fijado. 필요가 없어요 niega la necesidad de hacer algo.',
      ),
    },
  },
  {
    korean: '표 뒷면에 승강장이 바뀌면 방송을 확인하라고 쓰여 있어요.',
    question: t('¿Qué instrucción deja el reverso del billete?'),
    options: [
      t('Si cambia el andén, hay que comprobar el anuncio.'),
      t('Si cambia el horario, hay que comprar otro billete.'),
      t('Antes de subir, hay que escribir el número del andén.'),
      t('Cuando suene el anuncio, hay que devolver el billete.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('표 뒷면 = reverso del billete · 승강장 = andén · 방송 = anuncio por megafonía.'),
      premium: t(
        '쓰여 있어요 (G073) = «está escrito» como resultado. -라고 introduce literalmente la instrucción 확인하다, «comprobar».',
      ),
    },
  },
]

// ─── SLOT 2 · Interpretar los avisos variables · completion · G067 ──────────

const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '전광판 안내___ 승강장이 달라질 수 있어요.',
    translation: t('Según la información del panel, el andén puede ser diferente.'),
    answer: '에 따라',
    hints: {
      free: t('전광판 = panel electrónico · 안내 = información/aviso · 달라지다 = variar.'),
      premium: t(
        '«Según / dependiendo de» se forma con sustantivo + 에 따라(서) (G067): 안내에 따라.',
      ),
    },
  },
  {
    korean: '지연 시간___ 실제 출발 시각이 바뀝니다.',
    translation: t('La hora real de salida cambia dependiendo del tiempo de retraso.'),
    answer: '에 따라',
    hints: {
      free: t('지연 시간 = duración del retraso · 실제 출발 시각 = hora real de salida.'),
      premium: t('La variable que determina el resultado toma 에 따라 (G067): 지연 시간에 따라.'),
    },
  },
  {
    korean: '승차권 종류___ 이용할 수 있는 객차가 달라요.',
    translation: t('Los vagones que se pueden utilizar varían según el tipo de billete.'),
    answer: '에 따라',
    hints: {
      free: t('승차권 종류 = tipo de billete · 객차 = vagón de pasajeros.'),
      premium: t(
        'N + 에 따라 (G067) expresa una variación condicionada por N. Aquí la clase de billete decide el vagón.',
      ),
    },
  },
  {
    korean: '역무원의 지시___ 4번 승강장으로 이동하세요.',
    translation: t('Trasládese al andén 4 siguiendo las indicaciones del personal de la estación.'),
    answer: '에 따라서',
    hints: {
      free: t('역무원 = personal de estación · 지시 = indicación · 이동하다 = trasladarse.'),
      premium: t(
        '에 따라서 es la variante desarrollada de 에 따라 (G067). Después de 지시 significa «siguiendo la indicación».',
      ),
    },
  },
  {
    korean: '날씨___ 열차의 운행 속도가 달라질 수 있습니다.',
    translation: t('La velocidad de circulación del tren puede variar según el tiempo.'),
    answer: '에 따라',
    hints: {
      free: t('날씨 = tiempo meteorológico · 운행 속도 = velocidad de circulación.'),
      premium: t(
        '날씨 es la condición variable; añade 에 따라 (G067), no 때문에, que afirmaría una causa concreta.',
      ),
    },
  },
]

// ─── SLOT 3 · Reconstruir el anuncio de emergencia · creation · G062 ────────

const SLOT_3_CANDIDATES: CreationCandidate[] = [
  {
    korean: '왜 2번 승강장을 비워야 합니까?',
    question: t(
      'El circuito de vía falló. Reconstruye el anuncio que explica la causa y da la orden correcta.',
    ),
    tiles: [
      '선로에',
      '문제가',
      '생겼기 때문에',
      '2번 승강장을',
      '비워 주세요',
      '생겨도',
      '기다렸어요',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('선로 = vía · 문제가 생기다 = surgir un problema · 비우다 = despejar.'),
      premium: t(
        '-기 때문에 (G062) admite una orden en la cláusula final: 생겼기 때문에 … 비워 주세요.',
      ),
    },
  },
  {
    korean: '폭우 속에서 승객들에게 무엇이라고 방송합니까?',
    question: t('La lluvia cruza el techo del andén. Ordena el aviso de seguridad.'),
    tiles: [
      '폭우가',
      '계속되기 때문에',
      '안전선',
      '뒤에서',
      '기다려 주세요',
      '계속되지만',
      '건너가세요',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('폭우 = lluvia torrencial · 안전선 = línea de seguridad · 뒤 = detrás.'),
      premium: t(
        'La causa nominalizada toma -기 때문에 (G062): 계속되기 때문에. Después puede venir 기다려 주세요.',
      ),
    },
  },
  {
    korean: '왜 4번 승강장으로 가야 합니까?',
    question: t(
      'El técnico pidió revisar la señal. Reconstruye la explicación para los pasajeros.',
    ),
    tiles: [
      '신호',
      '점검이',
      '필요하기 때문에',
      '4번 승강장으로',
      '이동해 주세요',
      '필요한데도',
      '돌아오세요',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t(
        '신호 점검 = inspección de señal · 필요하다 = ser necesario · 이동하다 = desplazarse.',
      ),
      premium: t(
        'Adjetivo + -기 때문에 (G062): 필요하기 때문에. La causa formal justifica la instrucción posterior.',
      ),
    },
  },
  {
    korean: '막차가 들어오기 직전입니다. 어떻게 안내합니까?',
    question: t('Las luces del túnel ya aparecieron. Construye el anuncio que protege la vía.'),
    tiles: [
      '막차가',
      '곧',
      '들어오기 때문에',
      '노란 선',
      '밖에서 기다려 주세요',
      '들어왔기 때문에',
      '안으로 가세요',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('막차 = último tren · 곧 = pronto · 노란 선 밖 = detrás/fuera de la línea amarilla.'),
      premium: t(
        '들어오기 때문에 (G062) explica una causa aún vigente; la orden segura es 밖에서 기다려 주세요.',
      ),
    },
  },
  {
    korean: '계단 앞의 승객에게 무엇이라고 말합니까?',
    question: t('Los peldaños están empapados. Ordena una causa y una alternativa segura.'),
    tiles: [
      '계단이',
      '젖어 있기 때문에',
      '엘리베이터를',
      '이용해 주세요',
      '젖자마자',
      '계단으로',
      '뛰세요',
    ],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('계단 = escaleras · 젖다 = mojarse · 이용하다 = utilizar.'),
      premium: t(
        '젖어 있기 때문에 combina estado resultante y causa formal (G062): «porque las escaleras están mojadas».',
      ),
    },
  },
]

// ─── SLOT 4 · Deducir la próxima maniobra · selection · G069 ────────────────

const SLOT_4_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '전광판이 4번으로 바뀌었고 역무원들이 그쪽 문을 열고 있어요.',
    question: t('Con esas dos señales, ¿qué es lo más probable que ocurra?'),
    options: [
      t('4번 승강장으로 들어올 것 같아요. — Probablemente entrará por el andén 4.'),
      t('2번 승강장에서 이미 출발한 것 같아요. — Parece que ya salió del andén 2.'),
      t('전광판이 내일 다시 꺼질 것 같아요. — Probablemente el panel volverá a apagarse mañana.'),
      t('승객들이 기다리지 않고 역을 떠나야 할 것 같아요. — Parece que los pasajeros deben abandonar la estación.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('바뀌다 = cambiar · 그쪽 문 = la puerta de ese lado · 들어오다 = entrar/llegar.'),
      premium: t(
        'Conjetura futura = V-(으)ㄹ 것 같아요 (G069): 들어올 것 같아요. Las pistas preparan algo aún no ocurrido.',
      ),
    },
  },
  {
    korean: '차장이 출발등을 들었고 문 닫힘 안내가 시작됐어요.',
    question: t('¿Qué deduces de la lámpara del conductor y el aviso de puertas?'),
    options: [
      t('한 시간 더 늦게 도착할 것 같아요. — Probablemente llegará con otra hora de retraso.'),
      t('역 이름이 다시 바뀔 것 같아요. — Probablemente la estación cambiará otra vez de nombre.'),
      t('곧 출발할 것 같아요. — Probablemente saldrá dentro de poco.'),
      t('차장이 근무를 마치고 떠난 것 같아요. — Parece que el conductor terminó su turno y se fue.'),
    ],
    correctIndex: 2,
    hints: {
      free: t(
        '차장 = conductor ferroviario · 출발등 = lámpara de salida · 문 닫힘 = cierre de puertas.',
      ),
      premium: t(
        '곧 출발할 것 같아요 usa -(으)ㄹ 것 같다 (G069): una conclusión probable sobre el futuro inmediato.',
      ),
    },
  },
  {
    korean: '비가 더 세졌고 선로 점검이 아직 끝나지 않았어요.',
    question: t('¿Qué actualización resulta más razonable?'),
    options: [
      t('아무도 모르게 이미 도착한 것 같아요. — Parece que ya llegó sin que nadie lo viera.'),
      t('비가 세지기 전에 점검이 끝난 것 같아요. — Parece que la revisión terminó antes de que aumentara la lluvia.'),
      t('조금 더 늦어질 것 같아요. — El retraso probablemente se alargará un poco más.'),
      t('표에 적힌 시간보다 일찍 출발할 것 같아요. — Probablemente saldrá antes de la hora impresa.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('더 세지다 = intensificarse · 아직 끝나지 않다 = todavía no haber terminado.'),
      premium: t(
        '더 늦어질 것 같아요 (G069) proyecta al futuro la evidencia actual. «Ya terminó» contradice 아직.',
      ),
    },
  },
  {
    korean: '서울행 표시만 켜져 있고 다른 열차 표시는 모두 꺼져 있어요.',
    question: t('¿Qué servicio parece ser el siguiente?'),
    options: [
      t('표시되지 않은 일반 열차가 먼저 도착할 것 같아요. — Probablemente llegará primero un tren local que no aparece.'),
      t('서울행 열차가 먼저 출발할 것 같아요. — Probablemente saldrá primero el tren con destino a Seúl.'),
      t('모든 열차가 동시에 출발할 것 같아요. — Probablemente todos los servicios saldrán a la vez.'),
      t('오늘 밤에는 열차가 더 오지 않을 것 같아요. — Parece que ya no llegará ningún tren esta noche.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('서울행 = destino Seúl · 켜져 있다 = estar encendido · 꺼져 있다 = estar apagado.'),
      premium: t(
        '먼저 출발할 것 같아요 es una conjetura futura (G069). El único indicador encendido aporta la evidencia.',
      ),
    },
  },
  {
    korean: '직원들이 3호차 앞에 경사판을 놓고 휠체어 승객을 부르고 있어요.',
    question: t('¿Dónde se realizará probablemente el embarque accesible?'),
    options: [
      t('3호차에서 경사판을 이용할 것 같아요. — Probablemente usarán la rampa en el vagón 3.'),
      t('7호차에서 경사판을 이용할 것 같아요. — Probablemente usarán la rampa en el vagón 7.'),
      t('터널 안에서 경사판을 이용할 것 같아요. — Probablemente usarán la rampa dentro del túnel.'),
      t('출발 후에 관제실에서 이용할 것 같아요. — Probablemente la usarán en control después de la salida.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('3호차 앞 = delante del vagón 3 · 경사판 = rampa · 휠체어 = silla de ruedas.'),
      premium: t(
        '이용할 것 같아요 (G069) expresa lo probable por señales visibles. El número del propio billete no cambia dónde colocaron la rampa.',
      ),
    },
  },
]

// ─── SLOT 5 · Aceptar la única salida · completion · G063 ──────────────────

const SLOT_5_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '오늘 다른 서울행 열차가 없어서 이 막차를 ___.',
    translation: t(
      'Como hoy no hay otro tren a Seúl, no queda más remedio que tomar este último tren.',
    ),
    answer: '탈 수밖에 없어요',
    hints: {
      free: t('타다 = subir/tomar un transporte · 다른 열차가 없다 = no hay otro tren.'),
      premium: t('V-(으)ㄹ 수밖에 없다 (G063) = no quedar más remedio. 타다 → 탈 수밖에 없어요.'),
    },
  },
  {
    korean: '2번 승강장이 폐쇄되어서 4번으로 ___.',
    translation: t('Como el andén 2 está cerrado, no queda más remedio que trasladarse al 4.'),
    answer: '옮길 수밖에 없어요',
    hints: {
      free: t('폐쇄되다 = quedar cerrado · 옮기다 = trasladarse/cambiarse.'),
      premium: t('옮기다 pierde 다 y toma -ㄹ 수밖에 없다 (G063): 옮길 수밖에 없어요.'),
    },
  },
  {
    korean: '열차가 지연됐지만 여기에서 더 ___.',
    translation: t('Aunque el tren se retrasó, no queda más remedio que esperar aquí un poco más.'),
    answer: '기다릴 수밖에 없어요',
    hints: {
      free: t('지연되다 = retrasarse · 더 기다리다 = esperar más.'),
      premium: t(
        '기다리다 → 기다릴 수밖에 없어요 (G063). La construcción afirma que ya no queda alternativa.',
      ),
    },
  },
  {
    korean: '표의 이름이 흐려서 역무원에게 다시 ___.',
    translation: t(
      'Como el nombre del billete está borroso, no queda más remedio que confirmarlo otra vez con el personal.',
    ),
    answer: '확인할 수밖에 없어요',
    hints: {
      free: t('흐리다 = estar borroso · 확인하다 = confirmar/comprobar.'),
      premium: t('하다 → 할 ante 수밖에 없다 (G063): 확인할 수밖에 없어요.'),
    },
  },
  {
    korean: '개찰구가 곧 닫히기 때문에 지금 ___.',
    translation: t(
      'Como el control de acceso cerrará pronto, no queda más remedio que darse prisa ahora.',
    ),
    answer: '서두를 수밖에 없어요',
    hints: {
      free: t('개찰구 = control de acceso · 곧 닫히다 = cerrar pronto · 서두르다 = darse prisa.'),
      premium: t(
        '서두르다 → 서두를 수밖에 없어요 (G063): la inminencia elimina las demás opciones.',
      ),
    },
  },
]

// ─── SLOT 6 · Dar la última instrucción · creation · G060 ──────────────────

const SLOT_6_CANDIDATES: CreationCandidate[] = [
  {
    korean: '마지막 승객들에게 어떻게 안내하시겠어요?',
    question: t('Haz el anuncio final para que todos puedan subir con seguridad.'),
    tiles: ['모두', '안전하게 탈 수 있도록', '천천히', '이동해 주세요', '탈 수밖에', '뛰어 주세요'],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('안전하게 = con seguridad · 천천히 = despacio · 이동하다 = desplazarse.'),
      premium: t(
        '-도록 (G060) expresa finalidad: 안전하게 탈 수 있도록 = «para que puedan subir con seguridad».',
      ),
    },
  },
  {
    korean: '표가 잘 안 보이는 승객에게 어떻게 말합니까?',
    question: t('Ordena una instrucción para que pueda comprobar el billete otra vez.'),
    tiles: [
      '표를',
      '다시 확인할 수 있도록',
      '불빛',
      '아래에서',
      '기다려 주세요',
      '확인하자마자',
      '어둠 속에서',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('불빛 아래 = bajo la luz · 다시 확인하다 = comprobar otra vez.'),
      premium: t('확인할 수 있도록 (G060) señala el objetivo de esperar bajo la luz.'),
    },
  },
  {
    korean: '휠체어 승객이 오고 있습니다. 무엇이라고 방송합니까?',
    question: t('Despeja el paso para que la silla de ruedas pueda pasar.'),
    tiles: [
      '휠체어가',
      '지나갈 수 있도록',
      '통로를',
      '비워 주세요',
      '막아 주세요',
      '지나갔기 때문에',
    ],
    correctOrder: [0, 1, 2, 3],
    hints: {
      free: t('지나가다 = pasar · 통로 = pasillo · 비우다 = dejar libre.'),
      premium: t(
        '지나갈 수 있도록 (G060) = «para que pueda pasar». La acción que realiza esa finalidad es 통로를 비우다.',
      ),
    },
  },
  {
    korean: '문이 곧 닫힙니다. 줄에 있는 승객에게 말하세요.',
    question: t('Da una instrucción para que todos suban antes de que cierren las puertas.'),
    tiles: [
      '문이',
      '닫히기 전에',
      '탈 수 있도록',
      '줄을',
      '지켜 주세요',
      '줄을 떠나',
      '닫혔는데도',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('문이 닫히다 = cerrarse la puerta · 줄을 지키다 = respetar la fila.'),
      premium: t(
        '탈 수 있도록 (G060) introduce la finalidad; 닫히기 전에 fija el límite temporal anterior.',
      ),
    },
  },
  {
    korean: '서울까지 긴 여행입니다. 짐에 대해 안내하세요.',
    question: t('Construye un aviso para que el viaje sea cómodo hasta Seúl.'),
    tiles: [
      '서울까지',
      '편히 갈 수 있도록',
      '짐을',
      '선반에',
      '올려 주세요',
      '바닥에',
      '놓을 수밖에 없어요',
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hints: {
      free: t('편히 = cómodamente · 짐 = equipaje · 선반 = portaequipajes.'),
      premium: t(
        '편히 갈 수 있도록 (G060) = «para que puedan viajar cómodamente». La acción útil es subir el equipaje al estante.',
      ),
    },
  },
]

const SCRIPTED_BEATS: ScriptedBeat[] = [
  {
    afterSlotId: 'slot-4',
    voiceLine: '오늘 막차는 이 역의 마지막 열차이기도 해요.',
    narrative: t(
      '윤아 baja la vista del monitor y abre un cajón que llevaba años cerrado. Dentro hay una gorra de jefe de estación, una fotografía descolorida y el horario inaugural de 1987.\n\n' +
        '«No solo es el último tren de hoy», dice. «Cuando salga, esta estación cerrará para siempre. Mi padre anunció el primero; yo quería anunciar el último sin que ninguna voz se quedara atrás».',
    ),
  },
  {
    afterSlotId: 'slot-5',
    voiceLine: '이제 마지막 방송만 남았어요. 당신 목소리로 해 주세요.',
    narrative: t(
      'Las luces del andén 4 se encienden una a una. Los pasajeros que parecían desconocidos sacan pequeñas fotografías de esta estación: despedidas, regresos, inviernos, domingos.\n\n' +
        '윤아 te entrega el micrófono. El último anuncio no será una grabación: necesita una voz presente que lleve a todos hasta el tren.',
    ),
  },
]

export const LEVEL_04: Level = {
  id: 'level-04',
  introImage: 'rooms/cinematic-intro-v2.webp',
  outroImage: 'rooms/cinematic-outro-v2.webp',
  title: t('El último tren a Seúl'),
  tagline: t(
    'La tormenta borró los paneles, el andén cambió y quedan minutos para el último tren que saldrá de esta estación.',
  ),
  intro: t(
    'La lluvia convierte los raíles en dos cintas negras. Llegas a la pequeña estación de 해솔 con un billete húmedo y la certeza de que el último tren a Seúl sale en menos de veinte minutos.\n\n' +
      'El panel electrónico parpadea entre «2번» y una fila de cuadrados vacíos. No hay nadie en la ventanilla. Una voz cortada repite por los altavoces: «승강장이… 변경…».\n\n' +
      'En la sala de espera, cinco pasajeros miran tres relojes que no marcan la misma hora. Una mujer con uniforme, 윤아, lucha con un tablero de relés abierto.\n\n' +
      '«El rayo borró el programa de anuncios», explica. «El tren sigue en camino, pero si enviamos a la gente al andén equivocado pasará de largo».\n\n' +
      'Coloca tu billete bajo la lámpara de emergencia. Antes de correr hay que leer: cada dato, cada cambio y cada causa conduce al único andén que todavía tiene luz.',
  ),
  outro: t(
    'Tu voz atraviesa el andén: «{farewell}». Las últimas personas avanzan sin empujarse y las puertas las reciben una por una.\n\n' +
      'El tren entra bajo la lluvia con una línea de ventanas doradas. 윤아 levanta la lámpara verde; durante un instante, la estación entera parece respirar al mismo ritmo.\n\n' +
      'Subes al vagón 7. Desde el asiento 12A ves cómo 윤아 se lleva la mano a la visera de la gorra de su padre y saluda al último convoy.\n\n' +
      'Cuando las luces del edificio se apagan, nadie queda en el andén. La fotografía inaugural permanece encendida un segundo más en la ventanilla.\n\n' +
      'El billete ya no es una orden de salida: es la prueba de que leíste el camino correctamente y ayudaste a una estación a terminar su historia sin perder a ningún pasajero.',
  ),
  voiceIntro: '서울행 막차를 타려면 안내를 끝까지 잘 들어야 해요.',
  voiceOutro: '모두 탔습니다. 해솔역의 마지막 열차가 출발합니다.',
  grammarCodes: ['G073', 'G067', 'G062', 'G069', 'G063', 'G060'],
  topikLevel: 3,

  rooms: [
    {
      id: 'room-ticket-hall',
      title: t('La sala de billetes (대합실)'),
      image: 'rooms/room-01-ticket-hall-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'wet-ticket', rect: [8, 202, 88, 32], triggersSlot: 'slot-1' },
        { id: 'change-board', rect: [232, 25, 84, 34], triggersSlot: 'slot-2' },
        {
          id: 'three-clocks',
          rect: [112, 26, 68, 38],
          cosmeticDetail: t(
            'Tres relojes; solo el del centro sigue conectado a la señal ferroviaria.',
          ),
        },
        {
          id: 'closed-window',
          rect: [226, 118, 67, 62],
          cosmeticDetail: t('La ventanilla está cerrada. Detrás queda una fotografía de 1987.'),
        },
      ],
    },
    {
      id: 'room-control-room',
      title: t('La sala de control (운전실)'),
      image: 'rooms/room-02-control-room-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'station-microphone', rect: [18, 112, 65, 92], triggersSlot: 'slot-3' },
        { id: 'route-monitor', rect: [171, 42, 111, 77], triggersSlot: 'slot-4' },
        {
          id: 'relay-panel',
          rect: [123, 115, 66, 71],
          cosmeticDetail: t('Relés antiguos. Las etiquetas hechas a mano sobrevivieron al apagón.'),
        },
        {
          id: 'station-cap',
          rect: [232, 151, 48, 36],
          cosmeticDetail: t('Una gorra de jefe de estación con las iniciales del padre de 윤아.'),
        },
      ],
    },
    {
      id: 'room-platform-two',
      title: t('El andén cerrado (2번 승강장)'),
      image: 'rooms/room-03-platform-two-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'closure-notice', rect: [121, 61, 78, 91], triggersSlot: 'slot-5' },
        {
          id: 'wet-stairs',
          rect: [12, 124, 81, 74],
          cosmeticDetail: t(
            'El agua baja por los escalones; una cinta amarilla bloquea el acceso.',
          ),
        },
        {
          id: 'dark-track',
          rect: [195, 144, 116, 54],
          cosmeticDetail: t(
            'La señal del andén 2 permanece roja. No viene ningún tren por esa vía.',
          ),
        },
      ],
    },
    {
      id: 'room-final-platform',
      title: t('El último andén (4번 승강장)'),
      image: 'rooms/room-04-final-platform-v2.webp',
      ambientAudio: '',
      hotspots: [
        { id: 'final-microphone', rect: [132, 112, 58, 61], triggersSlot: 'slot-6' },
        {
          id: 'green-lamp',
          rect: [222, 65, 32, 49],
          cosmeticDetail: t('La lámpara verde espera la señal de salida.'),
        },
        {
          id: 'passenger-line',
          rect: [33, 107, 82, 83],
          cosmeticDetail: t('La fila conserva billetes y fotografías de distintas décadas.'),
        },
        {
          id: 'tunnel-light',
          rect: [256, 95, 55, 61],
          cosmeticDetail: t(
            'Dos luces blancas crecen bajo la lluvia: el último tren ya está aquí.',
          ),
        },
      ],
    },
  ],

  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G073'], candidates: SLOT_1_CANDIDATES },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G067'], candidates: SLOT_2_CANDIDATES },
    { id: 'slot-3', type: 'creation', grammarFocus: ['G062'], candidates: SLOT_3_CANDIDATES },
    { id: 'slot-4', type: 'selection', grammarFocus: ['G069'], candidates: SLOT_4_CANDIDATES },
    { id: 'slot-5', type: 'completion', grammarFocus: ['G063'], candidates: SLOT_5_CANDIDATES },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G060'], candidates: SLOT_6_CANDIDATES },
  ],

  scriptedBeats: SCRIPTED_BEATS,

  rewards: {
    common: {
      id: 'cosmetic-bg-rainy-rails',
      image: 'cosmetics/cosmetic-bg-rainy-rails.png',
      name: t('Fondo «Raíles bajo la lluvia»'),
      description: t('El reflejo ámbar del último tren estirándose sobre dos vías mojadas.'),
    },
    rare: {
      id: 'cosmetic-frame-paper-ticket',
      image: 'cosmetics/cosmetic-frame-paper-ticket.png',
      name: t('Marco «Billete de 해솔»'),
      description: t(
        'Un marco de cartón ferroviario perforado, con esquinas gastadas por muchos viajes.',
      ),
    },
    epic: {
      id: 'cosmetic-avatar-green-lamp',
      image: 'cosmetics/cosmetic-avatar-green-lamp.png',
      name: t('Avatar «Lámpara de salida»'),
      description: t('La lámpara verde del jefe de estación brillando contra la tormenta.'),
    },
    legendary: {
      id: 'cosmetic-set-complete-04',
      image: 'cosmetics/cosmetic-set-complete-04.png',
      name: t('Set completo «마지막 역무원»'),
      description: t(
        'Billete, gorra, lámpara y el andén final reunidos en el set del último jefe de estación.',
      ),
    },
  },

  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

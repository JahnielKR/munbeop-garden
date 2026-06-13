import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  ScriptedBeat,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './locale'

/**
 * Level 2 — "El templo de la lluvia (청우사)"
 *
 * Faithful transcription of the dossier in `docs/escape-room-level-02.md`.
 * 4 rooms, 6 slots, 30 candidates (5 pool per slot), 4 reward tiers.
 *
 * Heart grammar G013 (past -았/었어요): in Korean the farewell-gratitude is
 * already conjugated in the past, so producing it IS the key that rings the
 * bell. The level inverts the genre: the player isn't escaping a locked door
 * (the flooded path is the real lock) — they help the monk 우담 say the goodbye
 * he couldn't, for his late master, on the 49th-day rite.
 *
 * Per D12, every visible string is a `LocalizedString` via `t(es)`, which clones
 * the Spanish text across all 8 locales as a V1 fallback. Korean source-of-truth
 * (`korean`, `answer`, the tiles, the soft-reject line) is NOT translated.
 *
 * Two engine features the dossier specs (see §12) are exercised here:
 *   - Slot 6 `softRejectTiles`: the present-tense tile is a soft refusal the
 *     first time (no error), with `softRejectMessage` shown by the NPC.
 *   - `scriptedBeats`: fixed between-slot narrative — the diary's last entry
 *     (the twist) after slot 4, and the second-cup confession after slot 5.
 *
 * Validated at test time by `validateLevel(LEVEL_02)` in
 * `tests/unit/escape-room/level-02.test.ts`.
 */

// ─── SLOT 1 · Los recuerdos del té ───────────────────────────────────────────
// Cuarto 1 (다실) · Tipo A: selección · Foco: G013 (-았/었어요) + G034 (-(으)ㄹ 때)
// El monje recuerda al maestro en voz alta; entenderle es hacerle compañía.
// correctIndex repartido (el motor no baraja opciones).

const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '매일 해가 뜰 때 종소리를 들었어요. 스승님의 종소리였어요.',
    question: t('¿Qué recuerda 우담?'),
    options: [
      t('Cada mañana, al salir el sol, oía la campana del maestro.'),
      t('Cada mañana, al salir el sol, oye la campana del maestro.'),
      t('Cada mañana, al salir el sol, oía el tambor del maestro.'),
      t('Cada tarde, al ponerse el sol, oía la campana del maestro.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('종소리 = el sonido de la campana · 해가 뜨다 = salir el sol · 듣다 → 들었어요 = oí/oía.'),
      premium: t(
        '-(으)ㄹ 때 = «cuando» (G034) no marca tiempo: el tiempo lo pone el verbo final. 들었어요 lleva -었- (G013) → todo el recuerdo es pasado.',
      ),
    },
  },
  {
    korean: '비가 올 때 스승님하고 같이 차를 마셨어요.',
    question: t('¿Qué recuerda 우담?'),
    options: [
      t('Cuando llueve, toma té con el maestro.'),
      t('Cuando nevaba, tomaba té con el maestro.'),
      t('Cuando llovía, tomaba té con el maestro.'),
      t('Cuando llovía, tomaba café con el maestro.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('비가 오다 = llover · 차 = té · 하고 같이 = junto con.'),
      premium: t(
        '비가 올 때 no dice si llueve hoy o llovía entonces — eso lo dice 마셨어요 (pasado, G013). Verbo final en pasado → «cuando llovía».',
      ),
    },
  },
  {
    korean: '매화가 필 때 스승님하고 같이 마당에서 꽃을 봤어요.',
    question: t('¿Qué recuerda 우담?'),
    options: [
      t('Cuando florecía el ciruelo, miraba las flores con el maestro en el patio.'),
      t('Cuando florece el ciruelo, mira las flores con el maestro en el patio.'),
      t('Cuando florecía el cerezo, miraba las flores con el maestro en el patio.'),
      t('Cuando florecía el ciruelo, miraba las flores con el maestro en la montaña.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('매화 = flor del ciruelo · 피다 = florecer · 마당 = patio.'),
      premium: t(
        '봤어요 = 보다 + -았어요 (G013, armonía vocálica ㅗ → 았). 필 때 = «cuando florecía» porque el verbo final está en pasado (G034).',
      ),
    },
  },
  {
    korean: '작년 겨울에 스승님하고 같이 김장을 했어요. 김치가 아주 맛있었어요.',
    question: t('¿Qué recuerda 우담?'),
    options: [
      t('Este invierno hace kimjang con el maestro, y el kimchi está muy rico.'),
      t('El invierno pasado hizo kimjang con el maestro, y el kimchi quedó muy salado.'),
      t('La primavera pasada hizo kimjang con el maestro, y el kimchi quedó muy rico.'),
      t('El invierno pasado hizo kimjang con el maestro, y el kimchi quedó muy rico.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('김장 = la preparación anual de kimchi · 작년 = el año pasado · 맛있었어요 = estaba delicioso.'),
      premium: t(
        '하다 → 했어요; 맛있다 → 맛있었어요 (G013). 작년 («el año pasado») hace imposible la lectura en presente: si la marca de tiempo y el verbo no concuerdan, desconfía.',
      ),
    },
  },
  {
    korean: '스승님하고 같이 밥을 먹을 때, 고양이한테 먼저 밥을 줬어요.',
    question: t('¿Qué recuerda 우담?'),
    options: [
      t('Cuando comen juntos, le dan de comer al gato primero.'),
      t('Cuando comían juntos, le daban de comer al gato primero.'),
      t('Cuando comían juntos, le daban agua al gato primero.'),
      t('Cuando comían juntos, le daban de comer al gato al final.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('밥을 주다 = dar de comer · 한테 = a (un ser vivo) · 먼저 = primero.'),
      premium: t(
        '먹을 때 = «cuando comíamos» (G034 + verbo final en pasado). 주다 + -었어요 → 줬어요 (G013, contracción ㅜ + 어).',
      ),
    },
  },
]

// ─── SLOT 2 · La hoja del rito ───────────────────────────────────────────────
// Cuarto 2 (대웅전) · Tipo B: completar (input verbatim) · Foco: G035/G036 (par mínimo)
// La humedad borró el conector de un paso; el jugador lo teclea.

const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '차를 ___ 향을 피워요.',
    translation: t('Antes de ofrecer el té, se enciende el incienso.'),
    answer: '올리기 전에',
    hints: {
      free: t('차를 올리다 = ofrecer el té en el altar · 향을 피우다 = encender el incienso. En la hoja, el humo va antes que el té.'),
      premium: t(
        '«Antes de hacer» = raíz + -기 전에 (G035): 올리기 전에. «Después de hacer» = -(으)ㄴ + 후에 (G036): 올린 후에. Las parejas no se mezclan: -기 후에 y -(으)ㄴ 전에 no existen.',
      ),
    },
  },
  {
    korean: '향을 ___ 절을 해요.',
    translation: t('Después de encender el incienso, se hace la reverencia.'),
    answer: '피운 후에',
    hints: {
      free: t('절을 하다 = hacer la reverencia (la postración del rito) · 피우다 = encender (incienso).'),
      premium: t(
        '후에 viaja con -(으)ㄴ: 피우다 → 피운 후에 (G036, raíz en vocal + -ㄴ). -기 solo acompaña a 전에 (G035).',
      ),
    },
  },
  {
    korean: '초를 ___ 등을 준비해요.',
    translation: t('Antes de encender las velas, se preparan las linternas.'),
    answer: '켜기 전에',
    hints: {
      free: t('초 = vela · 켜다 = encender · 등 = linterna. Hay cuarenta y nueve; una sigue esperando apagada.'),
      premium: t(
        '«Antes de encender» = 켜기 전에 (G035: la raíz solo toma -기). 켠 후에 (G036) sería «después de encender». -기 후에 y -(으)ㄴ 전에 no existen.',
      ),
    },
  },
  {
    korean: '목탁을 ___ 이름을 불러요.',
    translation: t('Después de tocar el moktak, se llama el nombre (del que parte).'),
    answer: '친 후에',
    hints: {
      free: t('목탁 = el pez de madera (se golpea marcando el ritmo) · 치다 = tocar/golpear · 이름을 부르다 = llamar el nombre.'),
      premium: t(
        '치다 → 친 후에 = «después de tocar» (G036, raíz en vocal + -ㄴ). La pareja -기 전에 (G035) queda para lo que aún no se ha hecho.',
      ),
    },
  },
  {
    korean: '문을 ___ 마당을 쓸어요.',
    translation: t('Antes de abrir la puerta, se barre el patio.'),
    answer: '열기 전에',
    hints: {
      free: t('문을 열다 = abrir la puerta · 마당을 쓸다 = barrer el patio. El patio se recibe limpio.'),
      premium: t(
        '전에 exige -기: 열기 전에 (G035). La forma rival 연 후에 (열다 → 연) significa «después de abrir», y la hoja barre antes. -기 후에 y -(으)ㄴ 전에 no existen.',
      ),
    },
  },
]

// ─── SLOT 3 · Las señales ────────────────────────────────────────────────────
// Cuarto 2 (대웅전), tras el altar completo · Tipo A: selección (una variable: el modificador)
// Foco: G050 restringido a -(으)ㄴ 것 같아요 (conjetura sobre la huella ya ocurrida).
// La 4.ª opción es siempre otra lectura temporal BIEN FORMADA que falla por sentido.

const SLOT_3_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '누가 이 차를 ___ 것 같아요.',
    question: t('La segunda taza está vacía. ¿Qué le dices a 우담 en voz baja?'),
    options: [
      t('마신 — «Parece que alguien se bebió este té.» (huella: la taza está vacía)'),
      t('마시는 — «Parece que alguien se lo está bebiendo.» (la sala está vacía)'),
      t('마실 — «Parece que alguien se lo va a beber.» (ya está vacía)'),
      t('마시던 — «Parece el té que alguien solía beber.» (no es una costumbre)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('누가 = alguien · 마시다 = beber · la taza está vacía ya: lo que buscas ya ocurrió y terminó.'),
      premium: t(
        'Conjetura sobre el pasado puntual = V-(으)ㄴ 것 같아요 (G050 restringido): 마시다 → 마신. -는 것 habla de ahora; -(으)ㄹ 것, del futuro; -던 것, de un hábito.',
      ),
    },
  },
  {
    korean: '아까 목탁에서 소리가 ___ 것 같아요.',
    question: t('Sonó un golpe seco y el moktak está en su cojín. ¿Qué le dices a 우담?'),
    options: [
      t('날 — «Parece que va a sonar.» (futuro)'),
      t('나는 — «Parece que está sonando.» (ahora hay silencio)'),
      t('난 — «Parece que hace un rato sonó el moktak.» (huella: ya ocurrió)'),
      t('나려는 — «Parece que está por sonar.» (inminencia, no pasado)'),
    ],
    correctIndex: 2,
    hints: {
      free: t('목탁 = pez de madera · 소리가 나다 = sonar, hacerse oír · 아까 = hace un momento.'),
      premium: t(
        '아까 ancla la conjetura en el pasado: 나다 → 난 것 같아요 (G050 restringido). Si la palabra de tiempo y el modificador no concuerdan, la opción miente.',
      ),
    },
  },
  {
    korean: '고양이가 방금 뭔가를 ___ 것 같아요.',
    question: t('El gato se despertó de golpe y mira el cojín vacío. ¿Qué le dices a 우담?'),
    options: [
      t('보는 — «Parece que está viendo algo.» (lo que lo despertó ya pasó)'),
      t('본 — «Parece que el gato acaba de ver algo.» (huella: ya ocurrió)'),
      t('볼 — «Parece que va a ver algo.» (futuro)'),
      t('보려는 — «Parece que quiere ver algo.» (intención, no pasado)'),
    ],
    correctIndex: 1,
    hints: {
      free: t('방금 = justo ahora, hace un instante · 뭔가 = algo · 보다 = ver.'),
      premium: t(
        '보다 → 본 것 같아요: conjetura sobre lo que ya ocurrió (G050 restringido). 방금 = pasado inmediato, pero pasado.',
      ),
    },
  },
  {
    korean: '누가 젖은 발로 ___ 것 같아요.',
    question: t('Hay una línea de huellas húmedas hacia el altar. ¿Qué le dices a 우담?'),
    options: [
      t('들어오는 — «Parece que alguien está entrando.» (la puerta está quieta)'),
      t('들어올 — «Parece que alguien va a entrar.» (futuro)'),
      t('들어오려는 — «Parece que alguien quiere entrar.» (intención, no rastro)'),
      t('들어온 — «Parece que alguien entró con los pies mojados.» (huella: un paso ya dado)'),
    ],
    correctIndex: 3,
    hints: {
      free: t('젖은 = mojado · 발 = pie · 들어오다 = entrar.'),
      premium: t(
        'Las huellas son el rastro de algo terminado: 들어오다 → 들어온 것 같아요 (G050 restringido). El presente -는 describiría a alguien entrando ahora.',
      ),
    },
  },
  {
    korean: '누가 방금 글씨를 ___ 것 같아요.',
    question: t('La caligrafía interrumpida tiene 49 días y huele a tinta fresca. ¿Qué le dices a 우담?'),
    options: [
      t('쓴 — «Parece que alguien escribió hace un momento.» (huella: el olor de un acto terminado)'),
      t('쓰는 — «Parece que alguien está escribiendo.» (no hay pincel en el aire)'),
      t('쓸 — «Parece que alguien va a escribir.» (futuro)'),
      t('쓰던 — «Parece la escritura que alguien estaba haciendo.» (no es una costumbre)'),
    ],
    correctIndex: 0,
    hints: {
      free: t('글씨 = escritura, letra (a mano) · 쓰다 = escribir · 먹 = tinta de barra.'),
      premium: t(
        '쓰다 → 쓴 것 같아요 (G050 restringido): el olor es la huella de un acto terminado. -던 것 marcaría hábito; aquí es el acto puntual que dejó el rastro.',
      ),
    },
  },
]

// ─── SLOT 4 · La página del diario (EL GIRO) ─────────────────────────────────
// Cuarto 3 (스승의 방) · Tipo A: selección · Foco: G013 (lectura extendida en pasado)
// Cada página revela el origen de la leyenda: el niño que no lloraba era 우담.
// correctIndex repartido (4.1→B, 4.2→D, 4.3→A, 4.4→C, 4.5→B).

const SLOT_4_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '오늘 비가 많이 왔어요. 작은 아이가 혼자 절에 왔어요. 아이는 울지 않았어요. 그래서 우담에게 종 이야기를 만들어 줬어요.',
    question: t('¿Qué cuenta esta página del diario?'),
    options: [
      t('Un día de lluvia llegó un niño al templo, y el niño inventó el cuento de la campana para el maestro.'),
      t('Un día de lluvia llegó al templo un niño que no lloraba, y el maestro inventó para él el cuento de la campana. Ese niño era 우담.'),
      t('El maestro escribe que un día de lluvia llegará un niño, y que entonces le inventará un cuento.'),
      t('Un día de lluvia llegó al templo un niño llorando sin parar, y el maestro inventó el cuento para consolarlo.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('만들어 줬어요 = «lo hice PARA alguien». Mira a quién: 우담에게.'),
      premium: t('Todos los verbos llevan -았/었어요 — ya ocurrió. 왔어요 no es 올 거예요 (vendrá).'),
    },
  },
  {
    korean: '오늘 마을 아이들이 종 이야기를 했어요. 그 이야기는 사실 제가 만들었어요. 오래전 비 오는 날, 어린 우담이 절에 왔어요. 그 아이는 울지 않았어요.',
    question: t('¿Qué cuenta esta página del diario?'),
    options: [
      t('El maestro oyó la leyenda que los niños del pueblo habían inventado, y se la contó al pequeño 우담.'),
      t('El maestro piensa inventar un cuento que algún día los niños del pueblo contarán.'),
      t('El maestro oyó la leyenda en el pueblo — la que inventó para 우담, el niño que llegó un día de nieve.'),
      t('El maestro oyó a los niños del pueblo contar la leyenda de la campana — la que él mismo inventó para 우담, el niño que llegó bajo la lluvia sin llorar.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('사실 = «en realidad». ¿Quién es 제가? El que escribe este diario.'),
      premium: t('만들었어요 lleva -았/었- : el cuento ya fue inventado. No es un plan — es una confesión por escrito.'),
    },
  },
  {
    korean: '오늘 종루에 종 이야기를 붓으로 썼어요. 이 이야기는 제가 우담을 위해서 만들었어요. 그 아이는 오래전, 비 오는 날 절에 왔어요. 그리고 울지 않았어요.',
    question: t('¿Qué cuenta esta página del diario?'),
    options: [
      t('El maestro pintó en la madera del campanario el cuento que él inventó para 우담 — el niño que llegó bajo la lluvia y no lloraba.'),
      t('우담 pintó en la madera del campanario el cuento que él mismo había inventado al llegar al templo.'),
      t('El maestro escribe que pintará el cuento en el campanario cuando llegue un niño que no llore.'),
      t('El maestro pintó el cuento en el 일주문, la puerta del templo, para que lo leyeran los viajeros.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('붓 = pincel · 종루 = el pabellón de la campana. La letra de la viga y la del diario… compáralas.'),
      premium: t('썼어요 es el pasado de 쓰다 (escribir): la acción de pintar las palabras ya ocurrió, ese mismo día.'),
    },
  },
  {
    korean: '오늘 어린 우담이 처음 종을 쳤어요. 우담이 처음 절에 온 날처럼 비가 왔어요. 그날 아이는 울지 않았어요. 그래서 종 이야기를 만들었어요.',
    question: t('¿Qué cuenta esta página del diario?'),
    options: [
      t('El día en que el maestro tocó la campana por primera vez, el pequeño 우담 le inventó un cuento.'),
      t('Hoy 우담 toca la campana por primera vez; si no llora, el maestro le inventará un cuento.'),
      t('El día en que el pequeño 우담 tocó la campana por primera vez también llovía — como el día en que llegó sin llorar, cuando el maestro inventó para él el cuento.'),
      t('El pequeño 우담 tocó la campana por primera vez un día sin lluvia, mucho después de llegar al templo.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('처음 = por primera vez · 종을 치다 = tocar la campana. Hay dos días de lluvia en esta página: el de llegar y el de tocar.'),
      premium: t('왔어요, 쳤어요, 만들었어요 — todo en -았/었어요: la página recuerda, no anuncia.'),
    },
  },
  {
    korean: '오늘도 비가 왔어요. 마당을 쓰는 우담을 봤어요. 행복했어요. 이십 년 전 비 오는 날, 울지 않는 아이에게 종 이야기를 만들어 줬어요.',
    question: t('¿Qué cuenta esta página del diario?'),
    options: [
      t('Años después, 우담 miró al maestro barrer el patio y recordó el cuento que él mismo había inventado.'),
      t('Años después, un día de lluvia, el maestro miró a 우담 barrer el patio y fue feliz — veinte años atrás había inventado el cuento para aquel niño que no lloraba.'),
      t('El maestro escribe que será feliz cuando, dentro de veinte años, vea a un niño barrer el patio bajo la lluvia.'),
      t('El maestro vio a 우담 preparar el té un día de sol y recordó que el niño había llegado hace diez años.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('마당을 쓸다 = barrer el patio · 이십 년 전 = hace veinte años.'),
      premium: t('행복했어요 lleva -았/었- : una felicidad ya vivida. Es la página de un hombre que mira atrás, no adelante.'),
    },
  },
]

// ─── SLOT 5 · La confesión en el umbral (안 vs 못) ────────────────────────────
// Cuarto 3 (스승의 방, umbral) · Tipo B: completar (안 / 못) · Foco: G016 + G013
// La cláusula de motivo decide: 못 = el duelo impidió; 안 = el amor eligió.

const SLOT_5_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '마지막 인사를 ___ 했어요. 목이 메었어요.',
    translation: t('No pude decir el último adiós. Se me hizo un nudo en la garganta.'),
    answer: '못',
    hints: {
      free: t('안 = elegiste no hacerlo. 못 = querías, pero no pudiste.'),
      premium: t('Mira la segunda frase: 목이 메었어요 = «se me hizo un nudo en la garganta». Una garganta que se cierra sola no es una decisión — es un impedimento.'),
    },
  },
  {
    korean: '스승님 방 문을 ___ 닫았어요. 아직 닫고 싶지 않았어요.',
    translation: t('No cerré la puerta del cuarto del maestro. Todavía no quería cerrarla.'),
    answer: '안',
    hints: {
      free: t('안 = elegiste no hacerlo. 못 = querías, pero no pudiste.'),
      premium: t('Mira la segunda frase: -고 싶지 않았어요 = «no quería». Donde hay querer (o no querer), hay elección.'),
    },
  },
  {
    korean: '그날 아침 종을 ___ 쳤어요. 손이 멈췄어요.',
    translation: t('Aquella mañana no pude tocar la campana. La mano se me detuvo.'),
    answer: '못',
    hints: {
      free: t('안 = elegiste no hacerlo. 못 = querías, pero no pudiste.'),
      premium: t('Mira la segunda frase: una mano que se detiene sola no es una decisión — es un impedimento.'),
    },
  },
  {
    korean: '일기장을 ___ 읽었어요. 무서웠어요.',
    translation: t('No pude leer el diario. Tenía miedo.'),
    answer: '못',
    hints: {
      free: t('안 = elegiste no hacerlo. 못 = querías, pero no pudiste.'),
      premium: t('Mira la segunda frase: 무서웠어요 = «tenía miedo». El miedo se interpone — no elige.'),
    },
  },
  {
    korean: '혼자 차를 ___ 마셨어요. 혼자 마시고 싶지 않았어요. 그래서 매일 두 잔을 준비했어요.',
    translation: t('No tomé el té solo. No quería tomarlo solo. Por eso cada día preparaba dos tazas.'),
    answer: '안',
    hints: {
      free: t('안 = elegiste no hacerlo. 못 = querías, pero no pudiste.'),
      premium: t('Mira la segunda frase: «no quería» es una elección. Y la tercera frase te enseña qué hizo con ella.'),
    },
  },
]

// ─── SLOT 6 · La despedida en la cuerda de la campana (FINAL) ─────────────────
// Cuarto 4 (종루) · Tipo C: creación con tiles · Foco: G013 + G034
// Tiles: [correctas 0-3, presente (4), partícula (5), conector (6)].
// softRejectTiles = [4] (presente): rechazo suave la 1.ª vez, sin coste de corazón.

const SOFT_REJECT_LINE = t('끝난 일은… 끝난 말로 해야 해요. — Lo terminado se dice con palabras terminadas.')
const SLOT_6_QUESTION = t('Ordena las fichas para despedirte del maestro.')

const SLOT_6_CANDIDATES: CreationCandidate[] = [
  {
    korean: '스승님께 드리는 마지막 인사예요.',
    question: SLOT_6_QUESTION,
    tiles: ['스승님,', '그동안', '정말', '감사했어요', '감사해요', '스승님이', '그래서'],
    correctOrder: [0, 1, 2, 3],
    softRejectTiles: [4],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('그동안 = «durante todo este tiempo» — y ese tiempo ya se cumplió hoy, día 49.'),
      premium: t('G013: lo terminado lleva -았/었-. 감사해요 agradece hoy; 감사했어요 agradece lo vivido.'),
    },
  },
  {
    korean: '스승님께 드리는 마지막 인사예요.',
    question: SLOT_6_QUESTION,
    tiles: ['스승님하고', '차를', '마실 때', '행복했어요', '행복해요', '스승님한테', '마시기 전에'],
    correctOrder: [0, 1, 2, 3],
    softRejectTiles: [4],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('La felicidad no vivía antes del té — vivía durante el té. La pieza que buscas dice «cuando», no «antes de».'),
      premium: t('G034 -(으)ㄹ 때 = «cuando». La frase entera mira atrás: el verbo final lleva -았/었- → 행복했어요.'),
    },
  },
  {
    korean: '스승님께 드리는 마지막 인사예요.',
    question: SLOT_6_QUESTION,
    tiles: ['스승님,', '차가', '정말', '맛있었어요', '맛있어요', '차를', '그리고'],
    correctOrder: [0, 1, 2, 3],
    softRejectTiles: [4],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('Habla del té de todas aquellas tardes — un sabor que ya es recuerdo.'),
      premium: t('G013: 맛있어요 = sabe rico ahora; 맛있었어요 = estaba rico — la taza ya está vacía.'),
    },
  },
  {
    korean: '스승님께 드리는 마지막 인사예요.',
    question: SLOT_6_QUESTION,
    tiles: ['스승님한테', '정말', '많이', '배웠어요', '배워요', '스승님하고', '배운 후에'],
    correctOrder: [0, 1, 2, 3],
    softRejectTiles: [4],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('Lo aprendido ya vive dentro de ti — la frase lo dice desde el después.'),
      premium: t('배우다 + -었어요 → 배웠어요 (우 + 어 = 워). 배워요 sería seguir en clase — y la clase terminó.'),
    },
  },
  {
    korean: '스승님께 드리는 마지막 인사예요.',
    question: SLOT_6_QUESTION,
    tiles: ['스승님은', '정말', '좋은', '스승님이었어요', '스승님이에요', '스승님을', '그런데'],
    correctOrder: [0, 1, 2, 3],
    softRejectTiles: [4],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('La frase entera dice quién fue alguien — es lo más difícil de decir de quien quisimos.'),
      premium: t('Cópula en pasado tras consonante (받침 ㅁ de 스승님): 스승님이었어요, nunca 였어요. 스승님이에요 lo dejaría en presente.'),
    },
  },
]

// ─── Scripted beats (contenido fijo, NO-slot) ────────────────────────────────

const SCRIPTED_BEATS: ScriptedBeat[] = [
  {
    // Tras el Slot 4 (el diario): la última entrada + la firma 淸雨. EL GIRO.
    afterSlotId: 'slot-4',
    voiceLine: '…스승님이 보내신 것 같아요.',
    narrative: t(
      '우담 no dice nada un rato largo. Luego, despacio, pasa él mismo a la última página — la que no pudo abrir solo.\n\n' +
        '«사십구일째 되는 날, 비가 오면 손님이 올 거예요. 그 손님하고 차를 마시고… 종을 치세요. 우담아, 혼자 울지 마세요.»\n\n' +
        'Y en la esquina, una firma: 淸雨. «Lluvia clara» — dice 우담 en voz muy baja —. Era el nombre de mi maestro. Suena igual que el de este templo. Mira la página un largo rato y no añade nada más.',
    ),
  },
  {
    // Tras el Slot 5 (la confesión): la segunda taza. Pagado en el 100% de los runs.
    afterSlotId: 'slot-5',
    voiceLine: '스승님이 떠나신 후에도 매일 두 잔을 준비했어요.',
    narrative: t(
      '우담 recoge la segunda taza — la que ya estaba servida y caliente cuando llegaste. Ahora está vacía.\n\n' +
        '«오늘은… 한 잔이 비어 있었어요», dice, casi para sí. Hoy, una de las dos estaba vacía. No explica por qué. La deja junto a la otra y no vuelve a mirarla.',
    ),
  },
]

// ─── LEVEL ────────────────────────────────────────────────────────────────────

export const LEVEL_02: Level = {
  id: 'level-02',
  title: t('El templo de la lluvia'),
  tagline: t(
    'Subiste al templo a esperar que pasara el aguacero. El monje te sirvió té, sonrió, y dijo que la campana solo deja salir a quien entiende lo que perdió.',
  ),
  intro: t(
    'El paraguas te lo vendieron esta mañana en una tienda de conveniencia: plástico transparente, tres mil wones. El viento de la montaña lo dobló en el tercer recodo del sendero y lo remató en el cuarto. Llegas al final de la escalinata empapado, con el esqueleto del paraguas todavía en la mano, sin saber muy bien por qué lo sigues cargando. Sobre tu cabeza, en el dintel de la puerta, una placa de madera: 청우사. El templo que escucha la lluvia.\n\n' +
      'Al otro lado del 일주문, el patio es una sola cortina de agua. Un ciruelo florecido tarde suelta pétalos blancos al barro. De entre los edificios sale un monje joven con una toalla seca en las manos — como si te esperara, o como si siempre tuviera una toalla a mano. Sonríe: «어서 오세요. 비가 그칠 때까지 차 한잔 해요.»\n\n' +
      'En la sala de té hay un brasero encendido y un gato pardo dormido contra el calor. Sobre la mesa baja ya hay una taza servida. Todavía humea. El monje la mira un momento de más y no dice nada; te sirve otra, con las dos manos. «차는 따뜻할 때 마셔요», dice, como quien comparte una regla importante.\n\n' +
      'Cuando preguntas cuándo podrás bajar, se ríe bajito. En el pueblo cuentan, dice, que la campana de 청우사 solo deja salir a quien entiende lo que perdió. Luego, más serio, señala ladera abajo: con esta agua el arroyo cubre el paso de piedras, y el único sendero baja por ahí. Hasta que escampe, nadie sube y nadie baja. Lleva lloviendo, añade, cuarenta y nueve días.\n\n' +
      'Por la puerta abierta del salón principal se ven linternas de papel encendidas contra la tarde oscura. Las cuentas casi sin querer: cuarenta y nueve. La última está apagada. Hoy, dice el monje, se cumplen cuarenta y nueve días desde que su maestro se marchó — esta tarde es el rito del día 49, y lo prepara él solo. Y caes en la cuenta de que, en todo este tiempo, la campana no ha sonado ni una vez.',
  ),
  outro: t(
    'El primer tañido atraviesa la lluvia, y la cortina de agua titubea, como si dudara. El segundo la vuelve hilos. Al tercero solo quedan gotas sueltas — y después nada: el 여음 largo del bronce apagándose sobre el valle, y el goteo de los aleros. En el aire sigue la frase que armaste, palabra por palabra: «{farewell}». 우담 la repitió contigo, con la voz entera, las manos junto a las tuyas en la cuerda.\n\n' +
      'La luz se rompe entre las nubes y las piedras del patio empiezan a soltar vapor. En el 대웅전, 우담 enciende la linterna cuarenta y nueve. Las cuarenta y nueve, encendidas. No dice nada. Junto a la puerta de la celda del maestro, los 고무신 blancos siguen en su sitio, intactos. Esos, todavía no.\n\n' +
      'El 방명록 sigue abierto donde lo viste al llegar: la última firma es de hace cuarenta y nueve días. 우담 te ofrece el pincel con las dos manos. Tu nombre, torcido y húmedo, es la primera entrada del después.\n\n' +
      'En el 일주문 te detiene con un gesto. Toma tu paraguas roto con las dos manos, con el cuidado que se le da a algo valioso — «이건 두고 가세요» — y descuelga del perchero el paraguas de papel aceitado. «스승님 거였어요. 비는 또 와요. 그때 또 오세요.» Después junta las palmas y se inclina: «비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요.» Y entiendes, sin que nadie lo diga, que ese gracias en pasado no era solo para ti. El gato baja contigo hasta el primer escalón y ahí se sienta, como en una frontera.\n\n' +
      'Bajas la escalinata mojada con el paraguas del maestro abierto. A mitad de camino te das la vuelta. Arriba, enmarcado por las columnas del 일주문, 우담 sigue con las palmas juntas y la cabeza inclinada, pequeño contra el cielo roto. Los escalones encendidos de oro devuelven el templo como un espejo. Te quedas mirando un momento más de lo necesario.\n\n' +
      'Ya entre los árboles, cuando el templo no se ve, suena un tañido más. Uno solo, lejano. Acabas de ver sus dos manos juntas en el aire.\n\n' +
      '«종소리가 너보다 먼저 산을 내려갔어요.» — El sonido de la campana bajó la montaña antes que tú.\n\n' +
      'En el templo dicen que cuando llueve, es alguien que vuelve de visita. La próxima vez que llueva — ya sabes a quién saludar.',
  ),
  voiceIntro: '어서 오세요. 비가 그칠 때까지 차 한잔 해요.',
  voiceOutro: '비가 그쳤어요. 그동안 정말 고마웠어요. 잘 가요.',
  grammarCodes: ['G013', 'G016', 'G034', 'G035', 'G036', 'G050'],
  topikLevel: 2,

  rooms: [
    {
      id: 'room-dasil',
      title: t('La sala de té (다실)'),
      image: 'rooms/room-01-dasil.png',
      ambientAudio: 'audio/ambient-dasil.ogg',
      hotspots: [
        // Slot 1 trigger is the MONK FIGURE, not the whole table, so the cosmetic
        // second cup stays outside it (the engine has no overlap priority). See
        // dossier §6 "Nota de hotspots (Cuarto 1)".
        { id: 'monk-tea', rect: [120, 95, 55, 75], triggersSlot: 'slot-1' },
        { id: 'cat', rect: [240, 150, 40, 30], cosmeticDetail: t('고양이가 빈 방석을 봐요.') },
        { id: 'second-cup', rect: [205, 165, 28, 24], cosmeticDetail: t('아직 따뜻해요.') },
        { id: 'guestbook', rect: [273, 118, 34, 44], cosmeticDetail: t('마지막 이름은 49일 전이에요.') },
        { id: 'window-dasil', rect: [10, 60, 60, 90], cosmeticDetail: t('빗소리가 들려요.') },
      ],
    },
    {
      id: 'room-daeungjeon',
      title: t('El salón principal (대웅전)'),
      image: 'rooms/room-02-daeungjeon.png',
      ambientAudio: 'audio/ambient-daeungjeon.ogg',
      hotspots: [
        { id: 'ritual-sheet', rect: [28, 128, 52, 44], triggersSlot: 'slot-2' },
        { id: 'lantern-49', rect: [282, 32, 28, 32], triggersSlot: 'slot-3' },
        { id: 'moktak', rect: [88, 148, 30, 30], cosmeticDetail: t('스님의 목탁이에요.') },
        { id: 'portrait', rect: [148, 68, 32, 38], cosmeticDetail: t('사진 속에서도 웃고 계세요.') },
      ],
    },
    {
      id: 'room-seungbang',
      title: t('La celda del maestro (스승의 방)'),
      image: 'rooms/room-03-seungbang.png',
      ambientAudio: 'audio/ambient-seungbang.ogg',
      hotspots: [
        { id: 'diary', rect: [138, 128, 48, 38], triggersSlot: 'slot-4' },
        { id: 'threshold', rect: [14, 148, 56, 48], triggersSlot: 'slot-5' },
        { id: 'calligraphy', rect: [148, 58, 38, 52], cosmeticDetail: t('마지막 글씨예요. 끝나지 않았어요.') },
        { id: 'emille-book', rect: [252, 88, 16, 44], cosmeticDetail: t('에밀레종 이야기') },
      ],
    },
    {
      id: 'room-jongnu',
      title: t('El pabellón de la campana (종루)'),
      image: 'rooms/room-04-jongnu.png',
      ambientAudio: 'audio/ambient-jongnu.ogg',
      hotspots: [
        { id: 'bell-rope', rect: [120, 100, 80, 80], triggersSlot: 'slot-6' },
        { id: 'beam-inscription', rect: [70, 24, 180, 30], cosmeticDetail: t('이 글씨… 스승님 글씨예요.') },
        { id: 'valley', rect: [10, 70, 90, 60], cosmeticDetail: t('산 아래가 안 보여요.') },
      ],
    },
  ],

  slots: [
    { id: 'slot-1', type: 'selection', grammarFocus: ['G013', 'G034'], candidates: SLOT_1_CANDIDATES },
    { id: 'slot-2', type: 'completion', grammarFocus: ['G035', 'G036'], candidates: SLOT_2_CANDIDATES },
    { id: 'slot-3', type: 'selection', grammarFocus: ['G050', 'G013'], candidates: SLOT_3_CANDIDATES },
    { id: 'slot-4', type: 'selection', grammarFocus: ['G013'], candidates: SLOT_4_CANDIDATES },
    { id: 'slot-5', type: 'completion', grammarFocus: ['G016', 'G013'], candidates: SLOT_5_CANDIDATES },
    { id: 'slot-6', type: 'creation', grammarFocus: ['G013', 'G034'], candidates: SLOT_6_CANDIDATES },
  ],

  scriptedBeats: SCRIPTED_BEATS,

  rewards: {
    common: {
      id: 'cosmetic-bg-rainsound',
      image: 'cosmetics/cosmetic-bg-rainsound.png',
      name: t('Fondo "빗소리"'),
      description: t('El tejado del 대웅전 bajo la lluvia al atardecer; las 49 linternas como halos cálidos tras la cortina de agua.'),
    },
    rare: {
      id: 'cosmetic-frame-dancheong',
      image: 'cosmetics/cosmetic-frame-dancheong.png',
      name: t('Marco "단청"'),
      description: t('Vigas policromadas del templo con los 사물 (campana, tambor, pez de madera, placa-nube) en las esquinas.'),
    },
    epic: {
      id: 'cosmetic-avatar-templecat',
      image: 'cosmetics/cosmetic-avatar-templecat.png',
      name: t('Avatar "절고양이"'),
      description: t('El gato pardo del templo a resguardo en el alero; cada pocos ciclos mira algo fuera de cuadro.'),
    },
    legendary: {
      id: 'cosmetic-set-complete-02',
      image: 'cosmetics/cosmetic-set-complete.png',
      name: t('Set completo "마흔아홉 번째 손님"'),
      description: t('El huésped del día 49: avatar bajo el paraguas de papel del maestro, marco de bronce con 비천상, y el fondo del plano final con las dos sombras.'),
    },
  },

  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

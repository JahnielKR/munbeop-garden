import type {
  CompletionCandidate,
  CreationCandidate,
  Level,
  ScriptedBeat,
  SelectionCandidate,
} from '~/lib/domain'
import { t } from './locale'

/**
 * Level 3 — "El mercado nocturno (달빛시장)"
 *
 * Faithful transcription of docs/escape-room-level-03.md.
 * 4 zones, 6 slots, 30 candidates (5 pool per slot), 4 reward tiers.
 *
 * Energetic night-market register — the warm, loud relief after L2's quiet
 * rain-grief. A wingman caper (help 도윤 confess to 하나 before the last bus)
 * whose twist is found-family: 도윤 is NOT 순자 이모's blood son, and the
 * confession she truly needs is HIS thanks to her (그동안 고마웠어요 /
 * 다녀오겠습니다 — "I go and come back", not goodbye).
 *
 * Zero new engine features: reuses ScriptedBeat (the twist, after slot-4) and
 * softReject (Slot 6: the goodbye-forever tiles 잘 있어요 / 안녕히 계세요 vs the
 * see-you-again 다녀오겠습니다). Audio path fields are intentionally absent —
 * wired in the separate audio plan.
 *
 * Per D12, every visible string is a LocalizedString via t(es). Korean
 * source-of-truth (korean, answer, tiles, the soft-reject KO) is NOT translated.
 *
 * Validated by validateLevel(LEVEL_03) in level-03.test.ts.
 */

// ─── SLOT 1 · El primer favor (호떡) · selección · G039 (-아/어 주다) ───────────
// La pregunta de UI es siempre «¿Qué te pide 이모?». 해요체 plano (-아/어 줘요).
// correctIndex repartido (1.1→A, 1.2→D, 1.3→C, 1.4→B, 1.5→D); el motor no baraja.
const SLOT_1_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '이 호떡 한 접시 도윤이한테 갖다줘요.',
    question: t('¿Qué te pide 이모?'),
    options: [
      t('Que le lleves este plato de 호떡 a 도윤.'),
      t('Que le pidas a 도윤 que te traiga a ti un plato de 호떡.'),
      t('Que le lleves este plato de 호떡 a 하나.'),
      t('Que le lleves un plato de 떡볶이 a 도윤.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('호떡 = el panqueque relleno de azúcar · 한 접시 = un plato · 갖다주다 = llevarle algo a alguien · 도윤이한테 = a 도윤.'),
      premium: t('-아/어 주다 (G039) = hacer algo en beneficio de otro; en 갖다줘요 el favor (llevar) va de ti hacia 도윤, y 도윤이한테 marca a quién. No es «que él te lo traiga a ti».'),
    },
  },
  {
    korean: '도윤이한테 잠깐 오라고 전해 줘요.',
    question: t('¿Qué te pide 이모?'),
    options: [
      t('Que vayas tú un momento a donde está 도윤.'),
      t('Que le lleves algo de comer a 도윤 un momento.'),
      t('Que le transmitas a 하나 el recado de que venga.'),
      t('Que le transmitas a 도윤 el recado de que venga un momento.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('잠깐 = un momentito · 오다 = venir · 전하다 = transmitir / hacer llegar un recado · -아/어 주다 aquí = «transmíteselo, hazme el favor».'),
      premium: t('전해 줘요 = 전하다 + -아/어 주다 (G039): el favor es llevarle el mensaje a 도윤 de tu parte. 오라고 = «que venga»; el que se mueve es 도윤, tú solo transmites.'),
    },
  },
  {
    korean: '저 꽃집에서 꽃 한 송이만 사다 줘요.',
    question: t('¿Qué te pide 이모?'),
    options: [
      t('Que le vendas una flor a la dueña de la floristería.'),
      t('Que compres una flor en la floristería para ti.'),
      t('Que compres una flor en aquella floristería y se la traigas a 이모.'),
      t('Que compres una manzana en aquella floristería y se la traigas.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('꽃집 = floristería · 꽃 한 송이 = una sola flor (송이 = clasificador de flores) · 사다 주다 = comprarle algo a alguien y traérselo · -만 = solo, nada más que una.'),
      premium: t('사다 주다 (G039) = «comprar algo para otra persona y dárselo» — no «comprar para ti» (eso sería solo 사다), ni «vender» (팔다). El favor fluye del que compra hacia otro; aquí ese otro es 이모.'),
    },
  },
  {
    korean: '옆 가게에서 의자 두 개만 빌려다 줘요.',
    question: t('¿Qué te pide 이모?'),
    options: [
      t('Que le prestes dos sillas al puesto de al lado.'),
      t('Que pidas prestadas dos sillas en el puesto de al lado y se las traigas a 이모.'),
      t('Que pidas prestadas dos mesas en el puesto de al lado.'),
      t('Que pidas prestadas dos sillas en la tienda de enfrente.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('옆 가게 = el puesto de al lado · 의자 = silla · 두 개 = dos (unidades) · 빌리다 = pedir prestado.'),
      premium: t('Ojo al par: 빌려주다 = «prestar (a alguien)»; 빌려다 줘요 = «ir a pedir prestado y traérmelo» — eso es lo que te pide. Mismo verbo 빌리다, dirección opuesta del favor: aquí va hacia 이모.'),
    },
  },
  {
    korean: '도윤이를 좀 도와줘요. 오늘 밤만.',
    question: t('¿Qué te pide 이모?'),
    options: [
      t('Que le pidas ayuda a 도윤 esta noche.'),
      t('Que ayudes a 하나 esta noche.'),
      t('Que trabajes en lugar de 도윤 esta noche.'),
      t('Que le eches una mano a 도윤, solo por esta noche.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('돕다 = ayudar · 도와주다 = echarle una mano a alguien · 좀 = un poco / ablanda la petición · 오늘 밤만 = solo esta noche.'),
      premium: t('도와주다 (G039) = «ayudar a alguien» con matiz de favor: el 주다 dice que la ayuda va de ti hacia 도윤 (a quien 도윤이를 marca como objeto). No es «que él te ayude a ti», ni «hacer su trabajo por él».'),
    },
  },
]

// ─── SLOT 2 · Averiguar qué le gusta a 하나 · completar · G038 (-아/어 보다) ────
// completion: korean con un solo ___, answer comparado tras normalizar espacios.
// 물어보세요 va CERRADO (sin espacio); los demás separados (먹어 보세요, 가 보세요…).
const SLOT_2_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '하나 씨, 이거 호떡인데… 한번 ___. 도윤이가 만들었어요.',
    translation: t('Hana, esto es un hotteok… pruébalo (a ver). Lo hizo 도윤.'),
    answer: '먹어 보세요',
    hints: {
      free: t('호떡 = hotteok (panqueque relleno de la parrilla) · 한번 = una vez, prueba · 먹다 = comer.'),
      premium: t('-아/어 보다 (G038) = «hacer algo para ver qué tal». 먹다 + -어 보다 → 먹어 보다 → 먹어 보세요. NO 먹어요 (solo «come») ni 먹어 주세요 (eso pide un favor, G039).'),
    },
  },
  {
    korean: '뭘 좋아하는지 모르겠으면, 하나 씨한테 직접 ___.',
    translation: t('Si no sabes qué le gusta, pregúntale directamente a Hana (a ver qué dice).'),
    answer: '물어보세요',
    hints: {
      free: t('직접 = directamente, en persona · 묻다 = preguntar · -한테 = a (alguien). (Se escribe en una sola palabra: 물어보세요.)'),
      premium: t('-아/어 보다 (G038) sobre 묻다 da «preguntar para informarse». 묻다 es ㄷ irregular (묻 → 물 ante vocal) y con -어 보다 se lexicaliza cerrado: 물어보세요 (sin espacio). NO 물어요 ni 물어봐 주세요 (favor, G039).'),
    },
  },
  {
    korean: '나는 호떡 굽느라 못 가요. 하나 씨 가게에 한번 ___.',
    translation: t('Yo no puedo ir, estoy friendo hotteok. Acércate tú al puesto de Hana (a ver).'),
    answer: '가 보세요',
    hints: {
      free: t('가게 = tienda, puesto · 굽다 = freír/asar a la parrilla · 가다 = ir.'),
      premium: t('-아/어 보다 (G038) = «hacer algo a ver». 가다 + -아 보다 → 가 보다 → 가 보세요. Como 이모 no puede moverse (못 가요), el desplazamiento es 가다 (ir), nunca 오다 (venir).'),
    },
  },
  {
    korean: '하나 씨 솜씨를 보려면, 제일 잘 나가는 메뉴로 하나 ___.',
    translation: t('Para ver la mano que tiene Hana, encárgale uno del plato más vendido.'),
    answer: '시켜 보세요',
    hints: {
      free: t('솜씨 = maña, destreza (de cocina) · 시키다 = encargar, pedir (un plato) · 제일 잘 나가는 메뉴 = el plato que más se vende.'),
      premium: t('-아/어 보다 (G038) sobre 시키다 → 시켜 보다 = «encárgalo y a ver qué tal» → 시켜 보세요. NO 시켜요 ni 시켜 주세요 (favor, G039). Aquí lo ENCARGAS al puesto, no lo cocinas tú (≠ 만들어 보세요).'),
    },
  },
  {
    korean: '하나 씨가 직접 만든 식혜예요. 차갑고 달아요. 한번 ___.',
    translation: t('Es el sikhye que hace Hana. Frío y dulce. Pruébalo (a ver).'),
    answer: '마셔 보세요',
    hints: {
      free: t('식혜 = sikhye (bebida dulce de arroz, se sirve fría) · 차갑다 = estar frío · 마시다 = beber.'),
      premium: t('-아/어 보다 (G038) = «probar a ver». 마시다 + -어 보다 → 마셔 보다 → 마셔 보세요. Una bebida fría se BEBE (마시다), no se come (먹다).'),
    },
  },
]

// ─── SLOT 3 · El callejón del 만물상 (elegir el regalo) · selección · G053 ─────
// correctIndex repartido (3.1→A, 3.2→C, 3.3→D, 3.4→A, 3.5→B).
const SLOT_3_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '이 목도리가 저 장갑보다 더 따뜻해요. 군대에서는 이게 좋아요.',
    question: t('¿Qué está diciendo 순자 이모?'),
    options: [
      t('Esta bufanda abriga más que aquellos guantes; para el cuartel, mejor esta.'),
      t('Aquellos guantes abrigan más que esta bufanda; para el cuartel, mejor los guantes.'),
      t('Esta bufanda es más bonita que aquellos guantes; para el cuartel, mejor esta.'),
      t('Esta bufanda abriga más que aquel gorro; para el cuartel, mejor esta.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('목도리 = bufanda · 장갑 = guantes · 따뜻하다 = abrigar, estar caliente · 군대 = el cuartel, la mili.'),
      premium: t('En A가 B보다 더 따뜻해요, lo que es «más» es A (lleva 가/이); B (lleva 보다) es el patrón de comparación (G053). 목도리가 … 장갑보다 → la bufanda es la más cálida. Invierte quién lleva 보다 y das vuelta al sentido.'),
    },
  },
  {
    korean: '이 만년필이 저 볼펜보다 비싸요. 그런데 이 만년필이 더 좋아요.',
    question: t('¿Qué está diciendo 순자 이모?'),
    options: [
      t('Esta estilográfica es más barata que aquel bolígrafo, pero aun así es mejor.'),
      t('Aquel bolígrafo es más caro que esta estilográfica, y además el bolígrafo es mejor.'),
      t('Esta estilográfica es más cara que aquel bolígrafo, pero aun así esta es mejor.'),
      t('Esta estilográfica es más cara que aquella libreta, pero esta es mejor.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('만년필 = estilográfica · 볼펜 = bolígrafo · 비싸다 = ser caro · 좋다 = ser bueno · 그런데 = pero, sin embargo.'),
      premium: t('이 만년필이 저 볼펜보다 비싸요 — lo más caro es la estilográfica (이/가); 볼펜 (보다) es la referencia (G053). La 2.ª frase repite el sujeto: la misma es más cara Y mejor.'),
    },
  },
  {
    korean: '이 공책이 저 공책보다 더 커요. 편지 많이 쓸 수 있어요.',
    question: t('¿Qué está diciendo 순자 이모?'),
    options: [
      t('Aquella libreta es más grande que esta; en aquella cabrán más cartas.'),
      t('Esta libreta es más fina que aquella; pesará menos en la mochila.'),
      t('Esta toalla es más grande que aquella; cabrán más cartas.'),
      t('Esta libreta es más grande que aquella; en esta cabrán muchas cartas.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('공책 = libreta, cuaderno · 크다 = ser grande · 편지 = carta · 쓰다 = escribir.'),
      premium: t('이 공책이 저 공책보다 더 커요 — el sujeto (이/가) es lo más grande; 저 공책 (보다) es el patrón (G053, 더 lo refuerza). Como los dos objetos son iguales, solo la dirección 가/보다 decide cuál es la grande.'),
    },
  },
  {
    korean: '이 율무차가 저 커피보다 더 달아요. 도윤이는 단 걸 좋아해요.',
    question: t('¿Qué está diciendo 순자 이모?'),
    options: [
      t('Este té de adlay es más dulce que aquel café; a 도윤 le gusta lo dulce.'),
      t('Aquel café es más dulce que este té de adlay; a 도윤 le gusta lo dulce.'),
      t('Este té de adlay es más dulce que aquel café; a 도윤 le gusta lo picante.'),
      t('Este té de adlay es más dulce que aquel zumo; a 도윤 le gusta lo dulce.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('율무차 = té de adlay («lágrimas de Job») · 커피 = café · 달다 = ser dulce · 단 거 = lo dulce.'),
      premium: t('율무차가 커피보다 더 달아요 — el sujeto (가) es lo más dulce; lo que lleva 보다 (커피) es el patrón (G053). Invertir quién lleva 보다 invierte cuál es el dulce.'),
    },
  },
  {
    korean: '이 손난로가 저 양말보다 더 따뜻해요. 손이 제일 시려요.',
    question: t('¿Qué está diciendo 순자 이모?'),
    options: [
      t('Aquellos calcetines abrigan más que este calientamanos; las manos son lo que más frío pasa.'),
      t('Este calientamanos abriga más que aquellos calcetines; las manos son lo que más frío pasa.'),
      t('Este calientamanos es más barato que aquellos calcetines; las manos son lo que más frío pasa.'),
      t('Este calientamanos abriga más que aquel gorro; las manos son lo que más frío pasa.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('손난로 = calientamanos (de bolsillo) · 양말 = calcetines · 따뜻하다 = abrigar · 손이 시리다 = tener las manos heladas.'),
      premium: t('손난로가 양말보다 더 따뜻해요 — el sujeto (가) es lo más cálido; 양말 (보다) es la referencia (G053, 더 lo refuerza). Invertir quién lleva 보다 invierte cuál abriga más.'),
    },
  },
]

// ─── SLOT 4 · 만물상 «무뚝뚝하지만…» · completar · G021 (-지만) ─────────────────
// answer = token único en -지만; cada korean produce la frase exacta al sustituir
// ___ (el 4.1 lleva el blanco completo: «도윤이는 ___ 착해요», no «무뚝뚝___»).
const SLOT_4_CANDIDATES: CompletionCandidate[] = [
  {
    korean: '도윤이는 ___ 착해요.',
    translation: t('Do-yun es seco/arisco, pero tiene buen corazón.'),
    answer: '무뚝뚝하지만',
    hints: {
      free: t('무뚝뚝하다 = ser seco, parco · 착하다 = ser de buen corazón. 이모 lo dice con cariño, no como queja.'),
      premium: t('«X pero Y» dentro de una misma frase = raíz + 지만, pegado directo: 무뚝뚝하다 → 무뚝뚝하지만. No es -아/어서 (causa) ni -고 (solo enumera).'),
    },
  },
  {
    korean: '이 호떡은 옆집보다 ___ 맛은 똑같아요.',
    translation: t('Este 호떡 es más barato que el de al lado, pero sabe igual.'),
    answer: '싸지만',
    hints: {
      free: t('싸다 = ser barato · 옆집 = el puesto de al lado · 맛은 똑같아요 = el sabor es idéntico. 이모 regatea: misma calidad, menos won.'),
      premium: t('«más barato, pero igual de bueno» = raíz + 지만: 싸다 → 싸지만. 비싸지만 («más caro pero igual») contradice el regateo de 이모. 싸고 enumera; 싸서 sería causa.'),
    },
  },
  {
    korean: '이 장갑은 가방에 들어갈 만큼 ___ 아주 따뜻해요.',
    translation: t('Estos guantes son lo bastante pequeños para caber en la mochila, pero abrigan mucho.'),
    answer: '작지만',
    hints: {
      free: t('작다 = ser pequeño · 가방에 들어가다 = caber en la mochila · 따뜻하다 = abrigar. Van en el paquete del 군대.'),
      premium: t('«Pequeños, PERO abrigan» = raíz + 지만: 작다 → 작지만. «가방에 들어갈 만큼» fija «pequeños», así que 크지만 choca de frente. 작아서 sería causa.'),
    },
  },
  {
    korean: '도윤이는 멀리 ___ 마음은 항상 여기 있어요.',
    translation: t('Do-yun se va lejos, pero su corazón siempre está aquí.'),
    answer: '가지만',
    hints: {
      free: t('멀리 가다 = irse lejos · 마음 = el corazón, el ánimo · 항상 = siempre. (Eco de lo que él dirá: 다녀오겠습니다.)'),
      premium: t('«Se va, PERO su corazón sigue aquí» = raíz + 지만: 가다 → 가지만. «항상 … 있어요» pinta un presente general, así que la raíz va desnuda (가지만, no 갔지만).'),
    },
  },
  {
    korean: '달빛시장은 사람도 많고 ___ 난 정말 좋아요.',
    translation: t('El 달빛시장 tiene mucha gente y es ruidoso, pero a mí me encanta de verdad.'),
    answer: '시끄럽지만',
    hints: {
      free: t('사람이 많다 = haber mucha gente · 시끄럽다 = ser ruidoso · 정말 = de verdad. El neón, el vapor y las voces: ese es su encanto.'),
      premium: t('«Ruidoso, PERO me encanta» = raíz + 지만: 시끄럽다 → 시끄럽지만 (지만 empieza por consonante, la raíz no sufre el cambio ㅂ-irregular). «사람도 많고» bloquea 조용하지만.'),
    },
  },
]

// ─── SLOT 5 · La lista para el cuartel · selección · G019 (-고) ────────────────
// Comprensión de una cadena -고 (tiempo solo en la última cláusula).
// correctIndex repartido (5.1→A, 5.2→C, 5.3→D, 5.4→B, 5.5→A).
const SLOT_5_CANDIDATES: SelectionCandidate[] = [
  {
    korean: '호떡 싸고, 양말 사고, 편지 넣었어요.',
    question: t('¿Qué encadenó 이모 en su lista?'),
    options: [
      t('Envolvió los hotteok, compró calcetines y metió la carta.'),
      t('Envolvió los hotteok, compró guantes y metió la carta.'),
      t('Envolvió los hotteok, compró calcetines y metió el dinero.'),
      t('Envolvió los hotteok, compró calcetines y escribió la carta.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('호떡 싸다 = envolver los hotteok · 양말 = calcetines · 편지(를) 넣다 → 넣었어요 = meter la carta.'),
      premium: t('-고 (G019) encadena «y luego»: 싸고 → 사고 → 넣었어요. El pasado va SOLO en la última cláusula (넣었어요); las intermedias quedan desnudas (싸고, 사고), nunca 쌌고/샀고.'),
    },
  },
  {
    korean: '호떡 굽고, 봉지에 담고, 정류장으로 갔어요.',
    question: t('¿Qué encadenó 이모 en su lista?'),
    options: [
      t('Hizo los hotteok, los metió en la bolsa y fue al mercado.'),
      t('Hizo los hotteok, los metió en una caja y fue a la parada.'),
      t('Hizo los hotteok, los metió en la bolsa y fue a la parada.'),
      t('Metió los hotteok en la bolsa, fue a la parada y allí los hizo a la plancha.'),
    ],
    correctIndex: 2,
    hints: {
      free: t('굽다 → 굽고 = hacer a la plancha / dorar · 봉지 = bolsa de papel · 정류장 = la parada del autobús.'),
      premium: t('-고 (G019) marca «y luego»: 굽고 → 담고 → 갔어요. Solo la última cláusula lleva tiempo (갔어요); las intermedias nunca se conjugan (굽고, no 구웠고). El orden lo fija la lógica del puesto.'),
    },
  },
  {
    korean: '도윤 거 사고, 하나 거 사고, 같이 포장했어요.',
    question: t('¿Qué encadenó 이모 en su lista?'),
    options: [
      t('Compró lo de 도윤, compró lo de 이모 y lo envolvió todo junto.'),
      t('Compró lo de 도윤, compró lo de 하나 y lo repartió por separado.'),
      t('Compró lo de 도윤, compró lo de 하나 y lo envolvió por separado.'),
      t('Compró lo de 도윤, compró lo de 하나 y lo envolvió todo junto.'),
    ],
    correctIndex: 3,
    hints: {
      free: t('거 = «lo de» (도윤 거 = lo de 도윤) · 같이 = juntos / a la vez · 포장하다 → 포장했어요 = envolver.'),
      premium: t('-고 (G019) enumera «y… y…»: 사고 → 사고 → 포장했어요. El tiempo se marca UNA sola vez, en la cláusula final (포장했어요). Las dos compras van en -고 sin tiempo propio (사고, no 샀고).'),
    },
  },
  {
    korean: '김치 담고, 라면 넣고, 박스 묶었어요.',
    question: t('¿Qué encadenó 이모 en su lista?'),
    options: [
      t('Metió el kimchi, metió galletas y ató la caja.'),
      t('Metió el kimchi, metió el ramyeon y ató la caja.'),
      t('Metió el kimchi, metió el ramyeon y abrió la caja.'),
      t('Ató la caja, metió el ramyeon y después metió el kimchi.'),
    ],
    correctIndex: 1,
    hints: {
      free: t('김치(를) 담다 = meter/empaquetar el kimchi · 라면 = ramyeon · 박스(를) 묶다 → 묶었어요 = atar la caja.'),
      premium: t('-고 (G019) encadena: 담고 → 넣고 → 묶었어요. El pasado va SOLO en la última (묶었어요); las intermedias se quedan en -고 (담고, no 담았고). El orden lo decide la lógica (atar va al final).'),
    },
  },
  {
    korean: '호떡 식히고, 상자에 넣고, 버스에 실었어요.',
    question: t('¿Qué encadenó 이모 en su lista?'),
    options: [
      t('Dejó enfriar los hotteok, los puso en la caja y los subió al autobús.'),
      t('Dejó enfriar los hotteok, los puso en la caja y los subió al tren.'),
      t('Dejó enfriar los hotteok, los puso en la bolsa y los subió al autobús.'),
      t('Puso los hotteok en la caja, los subió al autobús y después los dejó enfriar.'),
    ],
    correctIndex: 0,
    hints: {
      free: t('식히다 → 식히고 = dejar enfriar · 상자 = la caja · (버스에) 싣다 → 실었어요 = cargar / subir (싣다 es ㄷ-irregular).'),
      premium: t('-고 (G019) une «y luego»: 식히고 → 넣고 → 실었어요. El tiempo vive UNA vez, en la cláusula final (실었어요, pasado de 싣다). Las intermedias se quedan en -고 (식히고, no 식혔고).'),
    },
  },
]

// ─── SLOT 6 · La despedida (버스 정류장) · creación · G013 callback + softReject ─
// softRejectTiles = la ficha de adiós-para-siempre (잘 있어요 / 안녕히 계세요):
// rechazo suave la 1.ª vez, sin coste de corazón. Disjunta de correctOrder.
const SOFT_REJECT_LINE = t('야— 그건 영영 가는 인사잖아. 너 돌아올 거잖아. — Oye, ese es un adiós para siempre. Tú vas a volver.')

const SLOT_6_CANDIDATES: CreationCandidate[] = [
  {
    korean: '도윤아, 이모한테 할 말 없어?',
    question: t('Doyun, ¿no tienes nada que decirle a la tía?'),
    tiles: ['그동안', '고마웠어요.', '이모,', '안녕히 계세요.', '다녀오겠습니다.', '고마워요.', '이모를'],
    correctOrder: [2, 0, 1, 4],
    softRejectTiles: [3],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('그동안 = todo este tiempo (la noche entera, ya cerrada) · 다녀오다 = ir y volver (lo que dice quien se marcha pero regresa).'),
      premium: t('Lo ya terminado lleva -았/었- → 고마웠어요, no 고마워요. 다녀오겠습니다 («iré y volveré», fórmula fija del recluta) promete la vuelta; no se cambia por 다녀올게요.'),
    },
  },
  {
    korean: '버스 오기 전에, 이모한테 한마디 해.',
    question: t('Antes de que llegue el autobús, dile algo a la tía.'),
    tiles: ['밥 챙겨 줘서', '이모,', '잘 있어요.', '그동안', '고마웠어요.', '고마워요.', '밥 챙겨 주는'],
    correctOrder: [1, 3, 0, 4],
    softRejectTiles: [2],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('밥(을) 챙기다 = encargarse de que alguien coma · -아/어 줘서 = «por haberlo hecho (favor), y por eso…».'),
      premium: t('Para dar las gracias POR un favor: -아/어 줘서 고마웠어요 (G039 + causa). El favor ya cumplido → pasado 고마웠어요 (G013), no 고마워요.'),
    },
  },
  {
    korean: '이모 얼굴 보고 가야지.',
    question: t('Tienes que mirarle la cara a la tía antes de irte.'),
    tiles: ['잘 다녀오겠습니다.', '그동안 고마웠어요.', '안녕히 계세요.', '이모,', '그동안 고마워요.', '이모가', '잘 다녀오세요.'],
    correctOrder: [3, 0, 1],
    softRejectTiles: [2],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('잘 다녀오다 = ir y volver bien (lo que dice quien se va de viaje y regresa) · 그동안 = todo este tiempo, ya cumplido.'),
      premium: t('다녀오겠습니다 lo dice EL QUE SE VA (1.ª persona, fórmula fija); 다녀오세요 lo dice quien SE QUEDA, al que parte. Y el gracias va en pasado: 고마웠어요 (G013), no 고마워요.'),
    },
  },
  {
    korean: '도윤아. 마지막인데… 진짜 할 말 없어?',
    question: t('Doyun. Es lo último… ¿de verdad no tienes nada que decir?'),
    tiles: ['키워 주셔서', '이모,', '다녀오겠습니다.', '잘 있어요.', '고마웠어요.', '키워 주세요.', '고마워요.'],
    correctOrder: [1, 0, 4, 2],
    softRejectTiles: [3],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('키우다 = criar, hacer crecer · -아/어 주셔서 = «por haber tenido el detalle de…» (con respeto al mayor).'),
      premium: t('키워 주세요 PIDE el favor (G039 imperativo: «críame»); 키워 주셔서 고마웠어요 AGRADECE el favor ya hecho → pasado (G013). El -시- (주셔서) marca respeto a 이모, no es tiempo verbal.'),
    },
  },
  {
    korean: '호떡 식기 전에 빨리 말해!',
    question: t('¡Díselo rápido, antes de que se enfríe el 호떡!'),
    tiles: ['다녀오겠습니다.', '정말 고마웠어요.', '이모,', '그동안', '안녕히 계세요.', '정말 고마워요.', '이모한테'],
    correctOrder: [2, 0, 3, 1],
    softRejectTiles: [4],
    softRejectMessage: SOFT_REJECT_LINE,
    hints: {
      free: t('정말 = de verdad, de corazón · 다녀오겠습니다 = me voy y regreso (fórmula del que vuelve).'),
      premium: t('정말 (intensificador) no cambia el tiempo: «gracias DE VERDAD» por lo ya vivido sigue siendo 고마웠어요 (G013), no 고마워요. 이모, es apelación directa (sin partícula); 이모한테 la convertiría en complemento.'),
    },
  },
]

// ─── Scripted beat (contenido fijo, NO-slot): EL GIRO tras el Slot 4 ───────────
const SCRIPTED_BEATS: ScriptedBeat[] = [
  {
    afterSlotId: 'slot-4',
    voiceLine: '도윤이… 사실 내 친아들 아니에요. 십 년 전에, 배고픈 아이가 시장에 왔어요. 그냥 계속 밥을 줬어요. 그러다 보니까… 내 아들이 됐어요.',
    voiceAudio: 'audio/voice/voice-beat-slot4.ogg',
    narrative: t(
      '이모 ha bajado la voz, pero no ha dejado de trabajar. Echa un cucharón de masa en la plancha, lo aplasta con el dorso del cucharón, y mientras el azúcar de dentro empieza a sisear te cuenta, casi distraída, lo que el chico no sabe que tú vas a oír: 도윤 no es su hijo de sangre. Hace diez años apareció en el mercado un crío hambriento, sin nada. Ella le dio de comer. Al día siguiente volvió, y ella le volvió a dar de comer. Y así, un plato detrás de otro, sin que nadie firmara nada, el crío se quedó y se volvió su hijo.\n\n' +
        'Por eso, dice, lo de 하나 está bien —ojalá el chico se atreva, ojalá—. Pero no es lo que de verdad le aprieta el pecho esta noche. A 도윤 lo mandan al ejército al amanecer, y es orgulloso, y de los que se van con la mano levantada y un «ya nos vemos» como si nada. Lo que ella necesita, y lo que él jamás diría si alguien se lo pidiera de frente, es mucho más pequeño y mucho más difícil que una declaración de amor: que el chico se dé la vuelta, antes de subir al autobús, y le diga gracias a ella.\n\n' +
        'Voltea el 호떡. Queda perfecto, dorado, redondo. «그러니까», añade, y por primera vez en toda la noche no sonríe del todo, «오늘 밤에는… 네가 좀 도와줘요.» Por eso, esta noche, ayúdame tú también. El plan del enamorado era la envoltura. El relleno, lo que de verdad quema, era esto.',
    ),
  },
]

// ─── LEVEL ────────────────────────────────────────────────────────────────────

export const LEVEL_03: Level = {
  id: 'level-03',
  title: t('El mercado nocturno'),
  tagline: t(
    'Subiste al mercado a comer algo antes del último autobús. La señora del puesto de 호떡 te quitó la mochila, sonrió y dijo: «ayúdame a cerrar y te la devuelvo».',
  ),
  intro: t(
    'El último autobús sale en veinte minutos y tú solo querías una cosa caliente para el camino. Subes los tres escalones de hierro hacia 달빛시장 y el frío de la calle se queda atrás de golpe: dentro es todo vapor, aceite y luz. Los letreros de neón —rojo, verde menta, un rosa que parpadea— se reflejan partidos en el asfalto mojado. Huele a sésamo tostado, a caldo, a azúcar quemándose en una plancha. En alguna parte una radio vieja escupe un trot de los ochenta y nadie la apaga.\n\n' +
      'Sigues la nariz hasta una plancha dorada donde una mujer de unos sesenta años —delantal, manos rápidas, una sonrisa que llega antes que las palabras— voltea 호떡 con dos dedos y un palillo. «어서 와요!», te grita por encima del chisporroteo, como si te esperara desde hace rato. Le pides uno. Ella te lo está preparando ya, antes de que termines la frase.\n\n' +
      'Y entonces, sin dejar de sonreír, te quita la mochila del hombro con la naturalidad de quien te quita una pelusa de la chaqueta. La cuelga de un gancho detrás de la plancha, junto a los cucharones. «잠깐만 빌릴게요», dice —te la tomo prestada un momentito—. «우리 가게 문 닫는 거 좀 도와줘요. 그럼 돌려줄게요.» Ayúdame a cerrar el puesto y te la devuelvo. No es una amenaza: es una invitación con rehén. Te llaman 이모 todos los del mercado, así que tú también, ya, eres de la familia.\n\n' +
      'Veinte minutos. El mercado entero baja la persiana en veinte minutos y tu autobús sale a la vez. 이모 te pone un 호떡 calentísimo en la mano «para el camino» y empieza a darte recados como quien reparte cartas: lleva esto, pregunta aquello, regatea aquello otro. Dos puestos más allá, un chico flaco de diecinueve años —도윤— finge estar muy ocupado limpiando una bandeja que ya está limpia, lanzando miraditas hacia el puesto de enfrente. En el puesto de enfrente, 하나 corta cebolleta sin levantar la vista, y sonríe sola.\n\n' +
      'Vas a pasar los próximos veinte minutos haciendo favores —trae, prueba, pregunta, regatea— en el coreano más fácil del mundo: -아/어 주세요, por favor, hazme el favor. Lo que todavía no sabes es que cada recado es una pieza de un plan, que el plan no es el que parece, y que la frase más difícil de toda la noche no llevará ninguna fórmula de cortesía: será solo un gracias, en pasado, dicho a la persona correcta antes de que el autobús arranque.',
  ),
  outro: t(
    'El mercado ya baja las persianas, una tras otra, con ese estruendo de metal que es el sonido de cerrar el día. 도윤 está plantado delante de 하나 con las orejas rojas y la bandeja todavía en la mano. Lo suelta de golpe, sin respirar —prueba, falla un poco, se ríe de sí mismo, y lo vuelve a decir mejor—; 하나, que era más lista que él desde el principio, ya lo sabía, y le guarda un sitio en su número de teléfono. Pero el chico no ha terminado. Se gira hacia la plancha, hacia 이모, y dice la frase que tú armaste pieza a pieza: «{farewell}». Y la frase pesa el doble, porque no es para la chica: es para la mujer que llevaba diez años dándole de comer.\n\n' +
      '이모 no llora —tiene las manos demasiado ocupadas para llorar—. Coge un 호떡 recién hecho de la plancha, el más dorado, lo envuelve en una servilleta de papel a toda prisa y se lo aplasta en la mano al chico, todavía quemando. «버스에서 먹어. 식기 전에.» Cómetelo en el autobús. Antes de que se enfríe. Es lo único que se le ocurre hacer con las manos para no hacer otra cosa.\n\n' +
      'Entonces se acuerda de ti. Descuelga tu mochila del gancho de detrás de la plancha, le sacude una mota imaginaria, y te la devuelve con las dos manos, como si fuera ella la que te debe algo. «고마워요. 진짜 도와줬어요.» Gracias. De verdad me ayudaste. Y a 도윤, que ya sube al estribo: «야, 머리 짧게 깎고 와. 자리 빼놓을게.» Oye —vuelve con el pelo corto. Te guardo el sitio.\n\n' +
      'El último autobús arranca con un suspiro de aire comprimido y se despega del bordillo. Por la ventanilla se ve la silueta del chico recién rapado, una mancha de luz de neón cruzándole la cara. En el andén, 이모 y 하나 de pie, hombro con hombro, levantan la mano. La plancha de 호떡 sigue echando vapor sola detrás de ellas. Los letreros del mercado se quedan flotando, partidos, en el asfalto mojado. Te quedas mirando un momento más de lo necesario.\n\n' +
      'El autobús dobla la esquina y el mercado desaparece. Te das cuenta de que sigues con el 호떡 caliente en la mano, el que 이모 te puso «para el camino» hace veinte minutos y nunca te comiste. Todavía quema un poco. Le das el primer mordisco. Sabe a sésamo, a azúcar y a una casa que no es la tuya pero que, durante veinte minutos, te dejaron ayudar a cerrar.\n\n' +
      '«제일 어려운 말은 제일 따뜻한 말이었어요.» — La frase más difícil resultó ser la más cálida.\n\n' +
      'En el mercado dicen que a quien ayuda a cerrar el puesto, 이모 nunca lo deja irse con hambre. La próxima vez que pases por 달빛시장 —ya sabes a quién pedirle un 호떡.',
  ),
  voiceIntro: '어서 와요! 우리 가게 문 닫는 거 좀 도와줘요. 그럼 가방 돌려줄게요.',
  voiceOutro: '고마워요. 진짜 도와줬어요. 야 도윤아, 머리 짧게 깎고 와. 자리 빼놓을게!',
  voiceIntroAudio: 'audio/voice/voice-intro.ogg',
  voiceOutroAudio: 'audio/voice/voice-outro.ogg',
  grammarCodes: ['G039', 'G038', 'G053', 'G021', 'G019', 'G013'],
  topikLevel: 2,

  rooms: [
    {
      id: 'room-hotteok',
      title: t('El puesto de 호떡 (순자 이모)'),
      image: 'rooms/room-01-hotteok.png',
      solvedImage: 'rooms/room-01-hotteok-closing.png',
      ambientAudio: 'audio/ambient-hotteok.ogg',
      hotspots: [
        // The figure of 이모 triggers Slot 1. NOTE: the dossier wants the SAME
        // rect to re-arm for Slot 5 on revisit, but a Hotspot maps to ONE slot
        // and two hotspots at one rect would intercept each other (Scene renders
        // all; EscapeRoom only opens an UNRESOLVED slot). So Slot 5 gets its own
        // distinct, equally-diegetic trigger: the 군대 box on the counter.
        { id: 'imo', rect: [145, 80, 60, 90], triggersSlot: 'slot-1' },
        { id: 'gunbox', rect: [55, 120, 50, 50], triggersSlot: 'slot-5' },
        { id: 'hotteok', rect: [120, 178, 55, 30], cosmeticDetail: t('설탕이 녹아요. 조심하세요.'), sfx: 'audio/sfx-griddle-sizzle.ogg' },
        { id: 'backpack', rect: [15, 180, 40, 35], cosmeticDetail: t('이모가 내 가방을 안 줘요.') },
        { id: 'bulb', rect: [195, 28, 24, 28], cosmeticDetail: t('시장이 시끄러워요.'), sfx: 'audio/sfx-neon-buzz.ogg' },
      ],
    },
    {
      id: 'room-meokja',
      title: t('El callejón de la comida (먹자골목)'),
      image: 'rooms/room-02-meokja.png',
      ambientAudio: 'audio/ambient-meokja.ogg',
      hotspots: [
        { id: 'hana', rect: [65, 95, 65, 80], triggersSlot: 'slot-2' },
        { id: 'tteokbokki', rect: [95, 180, 40, 28], cosmeticDetail: t('매워 보여요.') },
        { id: 'eomuk', rect: [145, 185, 35, 25], cosmeticDetail: t('국물이 뜨거워요.') },
        { id: 'stools', rect: [15, 185, 45, 30], cosmeticDetail: t('여기 앉아서 먹어요.') },
      ],
    },
    {
      id: 'room-manmulsang',
      title: t('El callejón del bazar (만물상 골목)'),
      image: 'rooms/room-03-manmulsang.png',
      solvedImage: 'rooms/room-03-manmulsang-wrapped.png',
      ambientAudio: 'audio/ambient-manmulsang.ogg',
      hotspots: [
        { id: 'counter', rect: [105, 95, 80, 50], triggersSlot: 'slot-3' },
        { id: 'gift', rect: [120, 155, 55, 38], triggersSlot: 'slot-4' },
        { id: 'merch', rect: [15, 25, 80, 45], cosmeticDetail: t('없는 게 없어요.') },
        { id: 'vendor', rect: [240, 120, 35, 60], cosmeticDetail: t('주인이 졸고 있어요.') },
        { id: 'bulb-flicker', rect: [150, 22, 22, 24], cosmeticDetail: t('불이 깜빡깜빡해요.'), sfx: 'audio/sfx-neon-buzz.ogg' },
      ],
    },
    {
      id: 'room-busstop',
      title: t('La parada del bus (버스 정류장)'),
      image: 'rooms/room-04-busstop.png',
      solvedImage: 'rooms/room-04-busstop-bus.png',
      ambientAudio: 'audio/ambient-busstop.ogg',
      hotspots: [
        { id: 'doyun', rect: [90, 90, 70, 90], triggersSlot: 'slot-6' },
        { id: 'gate', rect: [215, 25, 95, 45], cosmeticDetail: t('또 오세요.'), sfx: 'audio/sfx-market-bell.ogg' },
        { id: 'bench', rect: [65, 185, 55, 25], cosmeticDetail: t('버스가 곧 와요.') },
        { id: 'lane', rect: [10, 105, 70, 40], cosmeticDetail: t('마지막 버스예요.') },
      ],
    },
  ],

  // Audio path fields are injected here (the seed stays a faithful content
  // transcription above; the OGGs live under public/escape-room/level-03/audio/).
  // The NPC speaks the drawn slot-1 favor / slot-6 farewell via per-candidate
  // voiceAudio (mapped in); slot reactions + the twist beat carry their own voice.
  slots: [
    {
      id: 'slot-1',
      type: 'selection',
      grammarFocus: ['G039'],
      reactionVoiceAudio: 'audio/voice/voice-slot1-correct.ogg',
      candidates: SLOT_1_CANDIDATES.map((c, i) => ({
        ...c,
        voiceAudio: `audio/voice/voice-slot1-favor-${i + 1}.ogg`,
      })),
    },
    {
      id: 'slot-2',
      type: 'completion',
      grammarFocus: ['G038'],
      reactionVoiceAudio: 'audio/voice/voice-slot2-correct.ogg',
      candidates: SLOT_2_CANDIDATES,
    },
    { id: 'slot-3', type: 'selection', grammarFocus: ['G053'], candidates: SLOT_3_CANDIDATES },
    {
      id: 'slot-4',
      type: 'completion',
      grammarFocus: ['G021'],
      reactionVoiceAudio: 'audio/voice/voice-slot4-correct.ogg',
      candidates: SLOT_4_CANDIDATES,
    },
    {
      id: 'slot-5',
      type: 'selection',
      grammarFocus: ['G019'],
      reactionVoiceAudio: 'audio/voice/voice-slot5-correct.ogg',
      candidates: SLOT_5_CANDIDATES,
    },
    {
      id: 'slot-6',
      type: 'creation',
      grammarFocus: ['G013', 'G039'],
      candidates: SLOT_6_CANDIDATES.map((c, i) => ({
        ...c,
        voiceAudio: `audio/voice/voice-slot6-farewell-${i + 1}.ogg`,
        softRejectVoiceAudio: 'audio/voice/voice-slot6-softreject.ogg',
      })),
    },
  ],

  scriptedBeats: SCRIPTED_BEATS,

  rewards: {
    common: {
      id: 'cosmetic-bg-neonalley',
      image: 'cosmetics/cosmetic-bg-neonalley.png',
      name: t('Fondo «네온 골목»'),
      description: t('El callejón del mercado de frente bajo el neón nocturno: planchas humeantes como islas de ámbar, carteles rosa/cian/verde como halos difuminados, el asfalto mojado devolviéndolos partidos.'),
    },
    rare: {
      id: 'cosmetic-frame-hotteokbag',
      image: 'cosmetics/cosmetic-frame-hotteokbag.png',
      name: t('Marco «호떡 봉지»'),
      description: t('Marco de bolsa de papel de estraza, manchado de aceite, con sellos de tinta del mercado en las esquinas: una plancha, un cucharón, un 호떡 y un palillo.'),
    },
    epic: {
      id: 'cosmetic-avatar-marketcat',
      image: 'cosmetics/cosmetic-avatar-marketcat.png',
      name: t('Avatar «시장 고양이»'),
      description: t('El gato del mercado sentado sobre una caja de cartón junto a la plancha; cada pocos ciclos se lame la pata y mira el vapor que sube, con una mancha de neón rosa cruzándole el lomo.'),
    },
    legendary: {
      id: 'cosmetic-set-complete-03',
      image: 'cosmetics/cosmetic-set-complete-03.png',
      name: t('Set completo «막차 손님»'),
      description: t('El huésped del último bus: avatar con el 호떡 caliente en la mano envuelto en su servilleta, marco de neón rosa-verde con guirnalda de bombillas, y el fondo del plano final con el bus arrancando bajo el neón mientras 이모 y 하나 despiden desde el andén.'),
    },
  },

  rules: {
    maxErrors: 2,
    epicTimeThresholdSeconds: 600,
    legendaryCleanRunsRequired: 3,
  },
}

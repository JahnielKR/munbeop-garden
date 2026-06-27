import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 2 grammar — 43 entries aligned with `seed/topik-spine.json`
 * (spine ids in the topik.2 + transversal G144–G160 belonging to level 2).
 *
 * Themes (in source order):
 *   1. Habilidad y permiso              ( 1)
 *   2. Tiempo y secuencia               ( 5)
 *   3. Nominalización y conjetura       ( 3)
 *   4. Obligación, prohibición, sufic.  ( 4)
 *   5. Intención, propuesta, decisión   ( 3)
 *   6. Auxiliares del nivel             ( 4)
 *   7. Causa, contraste, comparación    ( 5)
 *   8. Preguntas indirectas y matices   ( 4)
 *   9. Reacciones y matices             ( 8)
 *   10. Pasiva básica y otros           ( 4)
 *   11. Cambio y adverbios temporales   ( 2)
 */
export const TOPIK_2_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Habilidad y permiso
  // ─────────────────────────────────────────────────────────────────────────

  // G033 · Can / cannot (ability)
  {
    ko: '-(으)ㄹ 수 있다/없다',
    meaning: L(
      'can / cannot — ability, possibility',
      'poder / no poder — habilidad o posibilidad',
      'pouvoir / ne pas pouvoir — capacité ou possibilité',
      'poder / não poder — habilidade ou possibilidade',
      '"ทำได้ / ทำไม่ได้" — ความสามารถ / ความเป็นไปได้',
      '"bisa / tidak bisa" — kemampuan atau kemungkinan',
      '"có thể / không thể" — khả năng hoặc khả thi',
      '「〜できる / 〜できない」— 可能・能力',
    ),
    example: '저는 한국어를 조금 할 수 있어요.',
    trans: L(
      'I can speak a little Korean.',
      'Puedo hablar un poco de coreano.',
      'Je peux parler un peu coréen.',
      'Eu sei falar um pouco de coreano.',
      'ฉันพูดภาษาเกาหลีได้นิดหน่อย',
      'Saya bisa berbahasa Korea sedikit.',
      'Tôi có thể nói một chút tiếng Hàn.',
      '私は韓国語が少しできます。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Tiempo y secuencia
  // ─────────────────────────────────────────────────────────────────────────

  // G034 · When (moment / period)
  {
    ko: '-(으)ㄹ 때',
    meaning: L(
      '"when / at the moment of" — simultaneous or habitual',
      '"cuando / en el momento de" — simultáneo o habitual',
      '"quand / au moment où" — simultané ou habituel',
      '"quando / no momento em que" — simultâneo ou habitual',
      '"เวลา / เมื่อ" — ขณะ หรือ เป็นนิสัย',
      '"ketika / waktu" — bersamaan atau kebiasaan',
      '"khi / lúc" — đồng thời hoặc thói quen',
      '「〜とき / 〜時」— 同時・習慣',
    ),
    example: '심심할 때 음악을 들어요.',
    trans: L(
      'When I’m bored, I listen to music.',
      'Cuando me aburro, escucho música.',
      'Quand je m’ennuie, j’écoute de la musique.',
      'Quando fico entediado, ouço música.',
      'เวลาเบื่อ ฉันฟังเพลง',
      'Ketika bosan, saya mendengarkan musik.',
      'Khi buồn chán, tôi nghe nhạc.',
      '退屈なとき音楽を聞きます。',
    ),
    deckId: 'topik-2',
  },

  // G035 · Before doing
  {
    ko: '-기 전에',
    meaning: L(
      '"before (doing)" — also N + 전에 with time nouns',
      '"antes de (hacer)" — también N + 전에 con sustantivos de tiempo',
      '"avant de (faire)" — aussi N + 전에 avec un nom de temps',
      '"antes de (fazer)" — também N + 전에 com substantivos de tempo',
      '"ก่อน ...(ทำ)" — รวมถึง N + 전에',
      '"sebelum (melakukan)" — juga N + 전에 dengan kata waktu',
      '"trước khi (làm)" — cũng N + 전에 với danh từ thời gian',
      '「〜する前に」(名詞の前は N + 전에)',
    ),
    example: '자기 전에 이를 닦아요.',
    trans: L(
      'I brush my teeth before sleeping.',
      'Me cepillo los dientes antes de dormir.',
      'Je me brosse les dents avant de dormir.',
      'Eu escovo os dentes antes de dormir.',
      'แปรงฟันก่อนนอน',
      'Saya menyikat gigi sebelum tidur.',
      'Tôi đánh răng trước khi đi ngủ.',
      '寝る前に歯を磨きます。',
    ),
    deckId: 'topik-2',
  },

  // G036 · After doing
  {
    ko: '-(으)ㄴ 후에 / 다음에',
    meaning: L(
      '"after (doing)" — 후에 and 다음에 are interchangeable',
      '"después de (hacer)" — 후에 y 다음에 son intercambiables',
      '"après (avoir fait)" — 후에 / 다음에 sont équivalents',
      '"depois de (fazer)" — 후에 e 다음에 são intercambiáveis',
      '"หลังจาก (ทำ)" — 후에 / 다음에 ใช้แทนกันได้',
      '"setelah (melakukan)" — 후에 dan 다음에 setara',
      '"sau khi (làm)" — 후에 và 다음에 tương đương',
      '「〜した後で / 〜した次に」',
    ),
    example: '밥을 먹은 후에 산책했어요.',
    trans: L(
      'After eating, I went for a walk.',
      'Después de comer, salí a caminar.',
      'Après avoir mangé, je suis allé me promener.',
      'Depois de comer, fui caminhar.',
      'หลังจากกินข้าวก็ไปเดินเล่น',
      'Setelah makan, saya jalan-jalan.',
      'Sau khi ăn, tôi đi dạo.',
      'ご飯を食べた後で散歩しました。',
    ),
    deckId: 'topik-2',
  },

  // G048 · While (different subjects allowed)
  {
    ko: '-는 동안',
    meaning: L(
      '"while / during" — two actions overlap; subjects may differ (cf. -(으)면서, same subject)',
      '"mientras / durante" — dos acciones simultáneas; sujetos pueden diferir (cf. -(으)면서, mismo sujeto)',
      '"pendant que / durant" — actions parallèles; sujets différents possibles',
      '"enquanto / durante" — duas ações em paralelo; sujeitos podem diferir',
      '"ในระหว่างที่" — กระทำพร้อมกัน, ผู้กระทำต่างกันได้',
      '"selama / sementara" — aksi paralel, subjek bisa berbeda',
      '"trong khi / trong lúc" — hai hành động song song, chủ ngữ khác nhau cũng được',
      '「〜している間」— 並行(主語が異なっても可)',
    ),
    example: '음악을 듣는 동안 공부했어요.',
    trans: L(
      'I studied while listening to music.',
      'Estudié mientras escuchaba música.',
      'J’ai étudié pendant que j’écoutais de la musique.',
      'Estudei enquanto ouvia música.',
      'ฉันเรียนหนังสือไปฟังเพลงไป',
      'Saya belajar sambil mendengarkan musik.',
      'Tôi học trong khi nghe nhạc.',
      '音楽を聞いている間、勉強しました。',
    ),
    deckId: 'topik-2',
  },

  // G145 · After (completing) — emphasis on completion
  {
    ko: '-고 나서 / -고 나면',
    meaning: L(
      '"after fully doing" — emphasizes completion before the next action',
      '"después de completar" — enfatiza que A se completó del todo antes de B',
      '"après avoir fini de" — insiste sur l’achèvement préalable',
      '"depois de terminar de" — enfatiza a conclusão antes da próxima ação',
      '"หลังจาก ... เสร็จแล้ว" — เน้นการทำเสร็จ',
      '"setelah selesai" — menekankan penyelesaian terlebih dahulu',
      '"sau khi xong" — nhấn mạnh hoàn tất trước',
      '「〜してから / 〜し終えたら」— 完了の強調',
    ),
    example: '밥을 먹고 나서 설거지를 해요.',
    trans: L(
      'After eating, I wash the dishes.',
      'Después de comer (del todo), friego los platos.',
      'Après avoir mangé, je fais la vaisselle.',
      'Depois de comer, lavo a louça.',
      'หลังจากกินข้าวเสร็จ ก็ล้างจาน',
      'Setelah selesai makan, saya cuci piring.',
      'Sau khi ăn xong, tôi rửa bát.',
      'ご飯を食べてから皿洗いをします。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Nominalización y conjetura
  // ─────────────────────────────────────────────────────────────────────────

  // G037 · Nominalization with 것
  {
    ko: '-는 것',
    meaning: L(
      'verb nominalization — "the act of / -ing"; spoken contractions 게/걸/건',
      'nominalización — "el hecho de / acción de"; contracciones habladas 게/걸/건',
      'nominalisation — «le fait de / -er»; contractions orales 게/걸/건',
      'nominalização — "o ato de / fazer"; contrações faladas 게/걸/건',
      'การทำให้กริยาเป็นคำนาม — "การทำ ..."; รูปย่อ 게/걸/건',
      'nominalisasi verba — "tindakan ..."; bentuk lisan 게/걸/건',
      'danh hóa động từ — "việc / hành động ..."; rút gọn 게/걸/건',
      '動詞の名詞化「〜こと / 〜の」— 口語短縮 게/걸/건',
    ),
    example: '음악을 듣는 것을 좋아해요.',
    trans: L(
      'I like listening to music.',
      'Me gusta escuchar música.',
      'J’aime écouter de la musique.',
      'Eu gosto de ouvir música.',
      'ฉันชอบฟังเพลง',
      'Saya suka mendengarkan musik.',
      'Tôi thích nghe nhạc.',
      '音楽を聞くことが好きです。',
    ),
    deckId: 'topik-2',
  },

  // G050 · It seems / I think
  {
    ko: '-(으)ㄴ/는 것 같다',
    meaning: L(
      '"it seems / I think" — soft conjecture about present/past',
      '"parece que / creo que" — conjetura suave sobre presente o pasado',
      '«il semble que / je crois que» — conjecture douce, présent/passé',
      '"parece que / acho que" — conjectura suave, presente ou passado',
      '"คิดว่า / ดูเหมือน ..." — การคาดเดาเบา ๆ (ปัจจุบัน / อดีต)',
      '"sepertinya / saya pikir" — dugaan halus (kini / lampau)',
      '"có vẻ / tôi nghĩ" — phỏng đoán nhẹ (hiện tại / quá khứ)',
      '「〜と思う / 〜ようだ」— 弱い推量(現在・過去)',
    ),
    example: '오늘 날씨가 추운 것 같아요.',
    trans: L(
      'It seems cold today.',
      'Parece que hoy hace frío.',
      'On dirait qu’il fait froid aujourd’hui.',
      'Parece que está frio hoje.',
      'วันนี้ดูเหมือนจะหนาว',
      'Hari ini sepertinya dingin.',
      'Hôm nay có vẻ lạnh.',
      '今日は寒いようです。',
    ),
    deckId: 'topik-2',
  },

  // G154 · Apparently / by the looks of
  {
    ko: '-(으)ㄴ/는 모양이다',
    meaning: L(
      '"apparently / by the looks of it" — inference from observable evidence',
      '"al parecer / por lo que se ve" — deducción a partir de evidencia visible',
      '«apparemment / on dirait» — déduction à partir de signes visibles',
      '"pelo jeito / aparentemente" — dedução por evidências visíveis',
      '"ดูท่าทาง / ดูเหมือนว่า" — สรุปจากสิ่งที่เห็น',
      '"kelihatannya / rupanya" — kesimpulan dari bukti yang terlihat',
      '"có vẻ / xem ra" — suy luận từ chứng cứ quan sát được',
      '「〜らしい / 〜ようだ」— 観察に基づく推測',
    ),
    example: '불이 꺼진 걸 보니 자는 모양이에요.',
    trans: L(
      'The lights are off — looks like they’re sleeping.',
      'La luz está apagada, al parecer está durmiendo.',
      'La lumière est éteinte ; apparemment, ils dorment.',
      'A luz está apagada, parece que está dormindo.',
      'ไฟดับอยู่ ดูเหมือนจะนอนแล้ว',
      'Lampu mati, kelihatannya sudah tidur.',
      'Đèn đã tắt, có vẻ đang ngủ.',
      '電気が消えているところを見ると、寝ているようです。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Obligación, prohibición, suficiencia
  // ─────────────────────────────────────────────────────────────────────────

  // G040 · Have to / must
  {
    ko: '-아/어야 하다 / 되다',
    meaning: L(
      '"have to / must" — 하다 and 되다 are interchangeable',
      '"tener que / deber" — 하다 y 되다 son intercambiables',
      '"devoir / il faut" — 하다 et 되다 sont équivalents',
      '"ter que / dever" — 하다 e 되다 são intercambiáveis',
      '"ต้อง" — 하다 / 되다 ใช้แทนกันได้',
      '"harus" — 하다 dan 되다 setara',
      '"phải" — 하다 và 되다 tương đương',
      '「〜なければならない / 〜なきゃ」(하다/되다)',
    ),
    example: '내일까지 숙제를 해야 해요.',
    trans: L(
      'I have to do the homework by tomorrow.',
      'Tengo que hacer la tarea para mañana.',
      'Je dois faire les devoirs d’ici demain.',
      'Tenho que fazer a lição até amanhã.',
      'ต้องทำการบ้านให้เสร็จภายในพรุ่งนี้',
      'Saya harus mengerjakan PR sampai besok.',
      'Tôi phải làm bài tập trước ngày mai.',
      '明日までに宿題をしなければなりません。',
    ),
    deckId: 'topik-2',
  },

  // G041 · Suffices to
  {
    ko: '-(으)면 되다',
    meaning: L(
      '"it suffices to / just need to" — minimum requirement to satisfy',
      '"basta con / solo hay que" — requisito mínimo',
      '«il suffit de / il faut seulement» — exigence minimale',
      '"basta / só precisa" — requisito mínimo',
      '"แค่ ... ก็พอ" — เงื่อนไขขั้นต่ำ',
      '"cukup / tinggal" — syarat minimal',
      '"chỉ cần" — yêu cầu tối thiểu',
      '「〜ばいい」— 最低限の条件',
    ),
    example: '여기에 이름을 쓰면 돼요.',
    trans: L(
      'Just write your name here.',
      'Solo tienes que escribir tu nombre aquí.',
      'Il suffit d’écrire ton nom ici.',
      'Basta escrever seu nome aqui.',
      'แค่เขียนชื่อตรงนี้ก็พอ',
      'Cukup tulis nama di sini.',
      'Chỉ cần viết tên ở đây.',
      'ここに名前を書けばいいです。',
    ),
    deckId: 'topik-2',
  },

  // G042 · Must not (prohibition)
  {
    ko: '-(으)면 안 되다',
    meaning: L(
      '"must not / cannot" — prohibition',
      '"no se puede / está prohibido" — prohibición',
      '«on ne doit pas / il est interdit de» — prohibition',
      '"não pode / é proibido" — proibição',
      '"ห้าม ... / ทำไม่ได้" — ข้อห้าม',
      '"tidak boleh / dilarang" — larangan',
      '"không được" — cấm',
      '「〜してはいけない」— 禁止',
    ),
    example: '여기서 담배를 피우면 안 돼요.',
    trans: L(
      'You can’t smoke here.',
      'No se puede fumar aquí.',
      'On ne peut pas fumer ici.',
      'Não pode fumar aqui.',
      'ห้ามสูบบุหรี่ที่นี่',
      'Tidak boleh merokok di sini.',
      'Không được hút thuốc ở đây.',
      'ここで煙草を吸ってはいけません。',
    ),
    deckId: 'topik-2',
  },

  // G156 · Need / no need
  {
    ko: '-(으)ㄹ 필요가 있다/없다',
    meaning: L(
      '"need / no need to" — more neutral than -아/어야 하다',
      '"hace falta / no hace falta" — más neutro que -아/어야 하다',
      '«il faut / pas besoin de» — plus neutre que -아/어야 하다',
      '"é necessário / não é necessário" — mais neutro que -아/어야 하다',
      '"จำเป็น / ไม่จำเป็นต้อง" — เป็นกลางกว่า -아/어야 하다',
      '"perlu / tidak perlu" — lebih netral dari -아/어야 하다',
      '"cần / không cần" — trung tính hơn -아/어야 하다',
      '「〜する必要がある / ない」— 中立的',
    ),
    example: '걱정할 필요가 없어요.',
    trans: L(
      'There’s no need to worry.',
      'No hay necesidad de preocuparse.',
      'Pas besoin de s’inquiéter.',
      'Não há necessidade de se preocupar.',
      'ไม่จำเป็นต้องเป็นห่วง',
      'Tidak perlu khawatir.',
      'Không cần phải lo lắng.',
      '心配する必要はありません。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Intención, propuesta, decisión
  // ─────────────────────────────────────────────────────────────────────────

  // G043 · Promise / on-the-spot intent (1st person)
  {
    ko: '-(으)ㄹ게요',
    meaning: L(
      '"I will (just decided) / I promise" — 1st-person commitment to listener',
      '"yo lo haré / lo prometo" — compromiso del hablante en el momento',
      '"je vais (le) faire" — engagement du locuteur (décision immédiate)',
      '"eu vou fazer / prometo" — compromisso do falante no momento',
      '"ผมจะ ... นะ / สัญญา" — ตกลงในขณะนั้น (บุรุษที่ 1)',
      '"saya akan ... / janji" — keputusan saat itu juga (orang pertama)',
      '"tôi sẽ ... / tôi hứa" — cam kết tức thì (ngôi 1)',
      '「〜しますね / 〜しますから」— その場の意志・約束(一人称)',
    ),
    example: '제가 할게요.',
    trans: L(
      'I’ll do it.',
      'Yo lo haré.',
      'Je m’en occupe.',
      'Eu faço.',
      'ผมจะทำเองครับ',
      'Saya yang akan melakukannya.',
      'Để tôi làm.',
      '私がしますね。',
    ),
    deckId: 'topik-2',
  },

  // G044 · Shall we? / Wondering
  {
    ko: '-(으)ㄹ까요?',
    meaning: L(
      '"shall we ...? / I wonder if ..." — suggestion or self-question',
      '"¿hacemos…? / ¿será que…?" — sugerencia o duda interior',
      '«on ...? / je me demande si ...» — proposition ou interrogation',
      '"vamos ...? / será que ...?" — sugestão ou indagação',
      '"... กันไหม? / สงสัยว่า ..." — ชวน หรือ คิดในใจ',
      '"... yuk? / kira-kira ...?" — ajakan atau renungan',
      '"... nhé? / liệu ...?" — đề nghị hoặc tự hỏi',
      '「〜ましょうか / 〜でしょうか」— 提案・推量',
    ),
    example: '같이 점심을 먹을까요?',
    trans: L(
      'Shall we have lunch together?',
      '¿Comemos juntos el almuerzo?',
      'On déjeune ensemble ?',
      'Vamos almoçar juntos?',
      'ทานข้าวเที่ยงด้วยกันไหม',
      'Makan siang bareng yuk?',
      'Mình ăn trưa cùng nhau nhé?',
      '一緒に昼ご飯を食べましょうか？',
    ),
    deckId: 'topik-2',
  },

  // G047 · Intention to (same subject)
  {
    ko: '-(으)려고',
    meaning: L(
      '"in order to / with the intention of" — same subject, no imperative in 2nd clause',
      '"con la intención de / para" — mismo sujeto, sin imperativo en la 2ª cláusula',
      '«avec l’intention de / pour» — même sujet, pas d’impératif en 2ᵈᵉ',
      '"com a intenção de / para" — mesmo sujeito, sem imperativo na 2ª',
      '"ตั้งใจจะ / เพื่อ ..." — ผู้กระทำเดียวกัน, ห้ามคำสั่งในข้อหลัง',
      '"berniat untuk / supaya" — subjek sama, tanpa imperatif di klausa 2',
      '"với ý định / để ..." — cùng chủ ngữ, không mệnh lệnh ở vế 2',
      '「〜しようと / 〜するために」— 同主語、後節に命令不可',
    ),
    example: '한국어를 배우려고 학원에 다녀요.',
    trans: L(
      'I go to a hagwon in order to learn Korean.',
      'Voy a la academia para aprender coreano.',
      'Je vais à l’académie pour apprendre le coréen.',
      'Vou a um curso particular para aprender coreano.',
      'ฉันไปสถาบันสอนพิเศษเพื่อเรียนภาษาเกาหลี',
      'Saya pergi ke kursus untuk belajar bahasa Korea.',
      'Tôi đến trung tâm để học tiếng Hàn.',
      '韓国語を学ぼうと塾に通っています。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Auxiliares del nivel
  // ─────────────────────────────────────────────────────────────────────────

  // G038 · Try / experience
  {
    ko: '-아/어 보다',
    meaning: L(
      '"try to / give it a go / have the experience of"',
      '"intentar / probar a / haber probado a"',
      '«essayer de / faire pour voir»',
      '"tentar / experimentar / já ter feito"',
      '"ลอง ..." — ลองทำดู / มีประสบการณ์',
      '"coba / pernah mencoba"',
      '"thử / đã từng thử"',
      '「〜てみる」— 試行・経験',
    ),
    example: '이 음식을 먹어 봤어요?',
    trans: L(
      'Have you tried this food?',
      '¿Has probado esta comida?',
      'As-tu déjà goûté ce plat ?',
      'Você já experimentou essa comida?',
      'เคยลองกินอาหารนี้ไหม',
      'Pernah mencoba makanan ini?',
      'Bạn đã thử món này chưa?',
      'この料理を食べてみましたか？',
    ),
    deckId: 'topik-2',
  },

  // G039 · Favor (for someone)
  {
    ko: '-아/어 주다',
    meaning: L(
      '"do something for someone" — favor/service; -아/어 주세요 = "please ..."',
      '"hacer algo para alguien" — favor; -아/어 주세요 = "por favor..."',
      '«faire qch pour qqn» — service; -아/어 주세요 = «s’il te plaît…»',
      '"fazer algo por alguém" — favor; -아/어 주세요 = "por favor..."',
      '"ทำให้ใคร / ช่วย ..." — -아/어 주세요 = ขอความช่วยเหลือ',
      '"melakukan untuk seseorang" — -아/어 주세요 = "tolong ..."',
      '"làm giúp ai" — -아/어 주세요 = "làm ơn ..."',
      '「〜てあげる / 〜てくれる」— 〜아/어 주세요 で依頼',
    ),
    example: '사진을 찍어 주세요.',
    trans: L(
      'Please take a picture (for me/us).',
      'Por favor, sácanos una foto.',
      'Prends-nous une photo, s’il te plaît.',
      'Tira uma foto, por favor.',
      'ช่วยถ่ายรูปให้หน่อยได้ไหม',
      'Tolong fotokan kami.',
      'Vui lòng chụp ảnh giúp.',
      '写真を撮ってください。',
    ),
    deckId: 'topik-2',
  },

  // G146 · Completion (relief / regret)
  {
    ko: '-아/어 버리다',
    meaning: L(
      'definitive completion with emotional flavor (relief or regret)',
      'completitud definitiva con matiz emocional (alivio o lamento)',
      'achèvement définitif avec nuance émotionnelle (soulagement / regret)',
      'conclusão definitiva com emoção (alívio ou pesar)',
      'ทำเสร็จเด็ดขาด — โล่งใจ / เสียดาย',
      'penyelesaian tuntas dengan emosi (lega / menyesal)',
      'hoàn thành dứt khoát kèm cảm xúc (nhẹ nhõm / tiếc nuối)',
      '「〜てしまう」— 完了+感情(安堵/後悔)',
    ),
    example: '숙제를 다 해 버렸어요.',
    trans: L(
      'I finished all the homework (at last!).',
      'Ya terminé toda la tarea (¡por fin!).',
      'J’ai terminé tous les devoirs (enfin !).',
      'Terminei toda a lição (até que enfim!).',
      'ทำการบ้านเสร็จหมดแล้ว!',
      'Akhirnya semua PR selesai!',
      'Tôi đã làm xong hết bài tập rồi!',
      '宿題を全部やってしまいました。',
    ),
    deckId: 'topik-2',
  },

  // G147 · Leave done / prepare beforehand
  {
    ko: '-아/어 놓다 / -아/어 두다',
    meaning: L(
      '"do and leave (prepared for later)" — 놓다 and 두다 are near-synonyms',
      '"hacer y dejar (preparado para luego)" — 놓다 y 두다 son casi sinónimos',
      '«faire et laisser (préparé pour plus tard)» — 놓다 / 두다 quasi-synonymes',
      '"deixar feito / preparado" — 놓다 e 두다 são quase sinônimos',
      '"ทำเตรียมไว้" — 놓다 / 두다 ใกล้ความหมาย',
      '"melakukan dan menyiapkan untuk nanti" — 놓다 dan 두다 nyaris sama',
      '"làm sẵn / để dành" — 놓다 và 두다 gần đồng nghĩa',
      '「〜ておく」(놓다/두다 ほぼ同義)',
    ),
    example: '미리 예약해 뒀어요.',
    trans: L(
      'I made the reservation in advance.',
      'Hice la reserva con antelación.',
      'J’ai fait la réservation à l’avance.',
      'Já fiz a reserva com antecedência.',
      'จองเอาไว้ล่วงหน้าแล้ว',
      'Saya sudah memesan lebih dulu.',
      'Tôi đã đặt trước rồi.',
      '前もって予約しておきました。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 7 · Causa, contraste, comparación
  // ─────────────────────────────────────────────────────────────────────────

  // G045 · Because (imperative ok, past ok)
  {
    ko: '-(으)니까',
    meaning: L(
      '"because / so" — allows imperative or past on 1st clause (cf. -아/어서)',
      '"porque / ya que" — admite imperativo y pasado en la 1ª cláusula (a diferencia de -아/어서)',
      '«parce que / puisque» — accepte impératif et passé en 1ʳᵉ clause',
      '"porque / já que" — aceita imperativo e passado na 1ª cláusula',
      '"เพราะว่า / เนื่องจาก" — ใช้กับคำสั่งและอดีตในข้อแรกได้',
      '"karena / sebab" — boleh dengan imperatif/lampau di klausa 1',
      '"vì / bởi vì" — cho phép mệnh lệnh / quá khứ ở vế 1',
      '「〜から / 〜ので」— 命令・過去OK',
    ),
    example: '비가 오니까 우산을 가져가세요.',
    trans: L(
      'It’s raining, so take an umbrella.',
      'Como llueve, lleva paraguas.',
      'Il pleut, alors prends un parapluie.',
      'Como está chovendo, leve um guarda-chuva.',
      'ฝนตก เอาร่มไปด้วยนะ',
      'Karena hujan, bawa payung ya.',
      'Vì trời mưa, hãy mang ô đi.',
      '雨が降っているから傘を持って行ってください。',
    ),
    deckId: 'topik-2',
  },

  // G055 · Because of (formal/strong)
  {
    ko: '때문에 / 기 때문에',
    meaning: L(
      '"because of / due to" — formal; N + 때문에 or V + 기 때문에',
      '"a causa de / debido a" — formal; N + 때문에 o V + 기 때문에',
      '«à cause de / en raison de» — formel; N + 때문에 ou V + 기 때문에',
      '"por causa de / devido a" — formal; N + 때문에 ou V + 기 때문에',
      '"เพราะ / เนื่องด้วย" — ทางการ (N + 때문에 / V + 기 때문에)',
      '"karena / akibat dari" — formal (N + 때문에 / V + 기 때문에)',
      '"do / vì" — trang trọng (N + 때문에 / V + 기 때문에)',
      '「〜のため / 〜のせいで」(名詞 + 때문에 / 動詞 + 기 때문에)',
    ),
    example: '비 때문에 못 갔어요.',
    trans: L(
      'I couldn’t go because of the rain.',
      'No pude ir a causa de la lluvia.',
      'Je n’ai pas pu y aller à cause de la pluie.',
      'Não pude ir por causa da chuva.',
      'ไปไม่ได้เพราะฝนตก',
      'Tidak bisa pergi karena hujan.',
      'Tôi không thể đi vì trời mưa.',
      '雨のせいで行けませんでした。',
    ),
    deckId: 'topik-2',
  },

  // G046 · Or (between verbs/adjectives)
  {
    ko: '-거나',
    meaning: L(
      '"or" — between verbs or adjectives (for nouns use (이)나)',
      '"o" — entre verbos o adjetivos (para sustantivos: (이)나)',
      '«ou» — entre verbes ou adjectifs (pour les noms: (이)나)',
      '"ou" — entre verbos ou adjetivos (para substantivos: (이)나)',
      '"หรือ" — ระหว่างกริยา/คุณศัพท์ (สำหรับคำนามใช้ (이)나)',
      '"atau" — antar verba/adjektiva (untuk kata benda: (이)나)',
      '"hoặc / hay" — giữa động từ/tính từ (với danh từ dùng (이)나)',
      '動詞・形容詞間の「〜たり / または」(名詞は (이)나)',
    ),
    example: '주말에는 영화를 보거나 책을 읽어요.',
    trans: L(
      'On weekends I watch movies or read books.',
      'Los fines de semana veo películas o leo libros.',
      'Le week-end, je regarde des films ou je lis.',
      'Nos fins de semana, vejo filmes ou leio.',
      'สุดสัปดาห์ฉันดูหนังหรืออ่านหนังสือ',
      'Akhir pekan saya nonton film atau baca buku.',
      'Cuối tuần tôi xem phim hoặc đọc sách.',
      '週末は映画を見たり本を読んだりします。',
    ),
    deckId: 'topik-2',
  },

  // G052 · Like / similar to
  {
    ko: '-처럼 / -같이',
    meaning: L(
      '"like / similar to" — comparative particle; 같이 also means "together"',
      '"como / igual que" — partícula comparativa; 같이 también = "juntos"',
      '«comme» — particule comparative; 같이 signifie aussi «ensemble»',
      '"como / igual a" — partícula comparativa; 같이 também = "juntos"',
      '"เหมือน / เช่น" — บอกความเหมือน; 같이 ยังแปลว่า "ด้วยกัน"',
      '"seperti / sama seperti" — partikel pembanding; 같이 juga = "bersama"',
      '"giống / như" — tiểu từ so sánh; 같이 còn nghĩa là "cùng"',
      '「〜のように / 〜みたいに」(같이 は「一緒に」の意味も)',
    ),
    example: '친구처럼 대해 줘요.',
    trans: L(
      'Treat me like a friend.',
      'Trátame como a un amigo.',
      'Traite-moi comme un ami.',
      'Me trate como um amigo.',
      'ปฏิบัติต่อฉันเหมือนเป็นเพื่อน',
      'Perlakukan saya seperti teman.',
      'Hãy đối xử với tôi như bạn bè.',
      '友達のように接してください。',
    ),
    deckId: 'topik-2',
  },

  // G053 · More than (comparison)
  {
    ko: '-보다',
    meaning: L(
      '"more than" — comparative particle; often reinforced by 더 ("more")',
      '"más que" — partícula comparativa; suele reforzarse con 더 ("más")',
      '«plus que» — particule comparative, souvent renforcée par 더',
      '"mais que" — partícula comparativa, geralmente com 더 ("mais")',
      '"มากกว่า" — เปรียบเทียบ; มักเสริมด้วย 더 ("ยิ่ง / มาก")',
      '"lebih ... dari" — pembanding; sering ditegaskan 더 ("lebih")',
      '"hơn" — so sánh; thường thêm 더 ("hơn nữa")',
      '「〜より」— 比較。 더 と組み合わさることが多い',
    ),
    example: '한국어는 일본어보다 어려워요.',
    trans: L(
      'Korean is harder than Japanese.',
      'El coreano es más difícil que el japonés.',
      'Le coréen est plus difficile que le japonais.',
      'O coreano é mais difícil que o japonês.',
      'ภาษาเกาหลียากกว่าภาษาญี่ปุ่น',
      'Bahasa Korea lebih sulit daripada bahasa Jepang.',
      'Tiếng Hàn khó hơn tiếng Nhật.',
      '韓国語は日本語より難しいです。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 8 · Preguntas indirectas y matices
  // ─────────────────────────────────────────────────────────────────────────

  // G049 · Indirect question
  {
    ko: '-(으)ㄴ/는지',
    meaning: L(
      'embeds a question — "whether / when / what / where..." in subordinate clauses',
      'pregunta indirecta — "si / cuándo / qué / dónde..." en oraciones subordinadas',
      'question indirecte — «si / quand / quoi / où» dans une subordonnée',
      'pergunta indireta — "se / quando / o que / onde" em orações subordinadas',
      'คำถามอ้อม — "ว่า/อย่างไร/ที่ไหน ..." ในประโยคย่อย',
      'pertanyaan tak langsung — "apakah / kapan / apa / di mana ..." di anak kalimat',
      'câu hỏi gián tiếp — "liệu / khi nào / cái gì / ở đâu ..." trong mệnh đề phụ',
      '間接疑問「〜のか / 〜かどうか」',
    ),
    example: '어디에 사는지 알아요?',
    trans: L(
      'Do you know where they live?',
      '¿Sabes dónde vive?',
      'Sais-tu où il/elle habite ?',
      'Você sabe onde mora?',
      'รู้ไหมว่าเขาอยู่ที่ไหน',
      'Tahu di mana dia tinggal?',
      'Bạn có biết người ấy sống ở đâu không?',
      'どこに住んでいるか知っていますか？',
    ),
    deckId: 'topik-2',
  },

  // G057 · Soft context ending
  {
    ko: '-(으)ㄴ/는데요',
    meaning: L(
      '"the thing is..." (polite) — softens, invites listener’s reaction',
      '"es que..." (educado) — suaviza la afirmación; invita a reaccionar',
      '«il faut savoir que…» (poli) — adoucit, invite à réagir',
      '"acontece que..." (educado) — suaviza e convida à reação',
      '"คือว่า ..." (สุภาพ) — เกริ่นให้ผู้ฟังตอบ',
      '"jadi begini..." (sopan) — pelunak, mengundang reaksi',
      '"chuyện là..." (lịch sự) — làm dịu câu nói',
      '「〜なんですけど」— 丁寧な前置き',
    ),
    example: '좀 비싼데요...',
    trans: L(
      'It’s a bit pricey, though...',
      'Es un poco caro, la verdad...',
      'C’est un peu cher, en fait…',
      'É um pouco caro, na verdade...',
      'แพงไปหน่อยน่ะ ...',
      'Agak mahal sih...',
      'Hơi đắt đấy...',
      'ちょっと高いんですけど…',
    ),
    deckId: 'topik-2',
  },

  // G058 · How (much / long / etc.)
  {
    ko: '얼마나',
    meaning: L(
      '"how much / how + adjective" — asks degree or amount',
      '"cuánto / qué tan" — pregunta por grado o cantidad',
      '«combien / à quel point» — degré ou quantité',
      '"quanto / quão" — pergunta por grau ou quantidade',
      '"แค่ไหน / นานเท่าไหร่" — ถามระดับหรือปริมาณ',
      '"seberapa / berapa banyak" — menanyakan kadar atau jumlah',
      '"bao nhiêu / đến mức nào" — hỏi mức độ hoặc số lượng',
      '「どのくらい / どれだけ」',
    ),
    example: '여기서 학교까지 얼마나 걸려요?',
    trans: L(
      'How long does it take from here to school?',
      '¿Cuánto se tarda de aquí hasta la escuela?',
      'Combien de temps faut-il d’ici à l’école ?',
      'Quanto leva daqui até a escola?',
      'จากที่นี่ไปโรงเรียนใช้เวลาเท่าไหร่',
      'Berapa lama dari sini ke sekolah?',
      'Từ đây đến trường mất bao lâu?',
      'ここから学校までどのくらいかかりますか？',
    ),
    deckId: 'topik-2',
  },

  // G054 · About / regarding
  {
    ko: '에 대해(서)',
    meaning: L(
      '"about / regarding / on the topic of" — also 에 대한 + N',
      '"sobre / acerca de / respecto a" — también 에 대한 + N',
      '«à propos de / concernant» — aussi 에 대한 + N',
      '"sobre / a respeito de" — também 에 대한 + N',
      '"เกี่ยวกับ" — รูปขยายคำนาม 에 대한 + N',
      '"tentang / mengenai" — bentuk pengubah: 에 대한 + N',
      '"về / liên quan đến" — bổ ngữ danh từ 에 대한 + N',
      '「〜について」(連体形: 에 대한 + N)',
    ),
    example: '한국 문화에 대해서 이야기해요.',
    trans: L(
      'We’re talking about Korean culture.',
      'Hablamos sobre la cultura coreana.',
      'On parle de la culture coréenne.',
      'Estamos falando sobre cultura coreana.',
      'พวกเราคุยกันเรื่องวัฒนธรรมเกาหลี',
      'Kami berbicara tentang budaya Korea.',
      'Chúng tôi nói chuyện về văn hóa Hàn Quốc.',
      '韓国の文化について話します。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 9 · Reacciones y matices
  // ─────────────────────────────────────────────────────────────────────────

  // G144 · For fear that
  {
    ko: '-(으)ㄹ까 봐',
    meaning: L(
      '"for fear that / in case ..." — precaution against unwanted outcome',
      '"por miedo a que / por si acaso ..." — precaución ante algo no deseado',
      '«de peur que / au cas où» — précaution contre quelque chose d’indésirable',
      '"com medo de que / por via das dúvidas" — precaução contra algo ruim',
      '"กลัวว่าจะ ..." — เพื่อป้องกันสิ่งไม่ดี',
      '"khawatir ... / kalau-kalau ..." — pencegahan',
      '"sợ rằng / phòng khi ..." — đề phòng',
      '「〜かと思って / 〜と心配して」',
    ),
    example: '비가 올까 봐 우산을 가져왔어요.',
    trans: L(
      'I brought an umbrella in case it rained.',
      'Traje el paraguas por si llovía.',
      'J’ai apporté un parapluie au cas où il pleuvrait.',
      'Trouxe um guarda-chuva, com medo de chover.',
      'เอาร่มมาเผื่อฝนตก',
      'Saya bawa payung, takut nanti hujan.',
      'Tôi mang ô vì sợ trời mưa.',
      '雨が降るかと思って傘を持ってきました。',
    ),
    deckId: 'topik-2',
  },

  // G148 · Even if (strong hypothetical)
  {
    ko: '-더라도',
    meaning: L(
      '"even if / even in the case that ..." — stronger than -아/어도; hypothetical',
      '"aunque / incluso si (hipotético)" — más fuerte que -아/어도',
      '«même si / même au cas où» — plus fort que -아/어도',
      '"mesmo que / mesmo se" — mais forte que -아/어도',
      '"แม้ว่า / แม้จะ ..." — เน้นกว่า -아/어도',
      '"meskipun / bahkan jika" — lebih kuat dari -아/어도',
      '"dù cho / cho dù" — mạnh hơn -아/어도',
      '「〜たとしても / 〜であっても」',
    ),
    example: '시간이 없더라도 밥은 먹어야 해요.',
    trans: L(
      'Even if you have no time, you have to eat.',
      'Aunque no tengas tiempo, tienes que comer.',
      'Même si tu n’as pas le temps, tu dois manger.',
      'Mesmo que não tenha tempo, precisa comer.',
      'แม้ไม่มีเวลาก็ต้องกินข้าว',
      'Meskipun tidak ada waktu, harus tetap makan.',
      'Dù không có thời gian thì cũng phải ăn.',
      '時間がなくてもご飯は食べなければなりません。',
    ),
    deckId: 'topik-2',
  },

  // G149 · Might / maybe
  {
    ko: '-(으)ㄹ지도 모르다',
    meaning: L(
      '"might / maybe / it’s possible that ..." — uncertain possibility',
      '"puede que / quizás / a lo mejor ..." — posibilidad incierta',
      '«il se peut que / peut-être» — possibilité incertaine',
      '"pode ser que / talvez ..." — possibilidade incerta',
      '"อาจจะ / อาจเป็นไปได้ว่า ..." — ความเป็นไปได้ที่ไม่แน่ใจ',
      '"mungkin / siapa tahu ..." — kemungkinan tidak pasti',
      '"có thể / biết đâu ..." — khả năng không chắc',
      '「〜かもしれない」',
    ),
    example: '내일 비가 올지도 몰라요.',
    trans: L(
      'It might rain tomorrow.',
      'Puede que mañana llueva.',
      'Il se peut qu’il pleuve demain.',
      'Pode ser que chova amanhã.',
      'พรุ่งนี้อาจจะฝนตก',
      'Mungkin besok akan hujan.',
      'Ngày mai có thể trời mưa.',
      '明日雨が降るかもしれません。',
    ),
    deckId: 'topik-2',
  },

  // G150 · As you know / it’s that ...
  {
    ko: '-잖아요',
    meaning: L(
      '"as you know / it’s that ..." — recalls shared info, mild reproach',
      '"es que / como sabes ..." — alude a información compartida; leve reproche',
      '«tu vois bien que / tu sais que ...» — info partagée, léger reproche',
      '"é que / como você sabe ..." — apela a info já compartilhada',
      '"ก็ ... ไง" — เตือนสิ่งที่ทั้งคู่รู้ดี (ติเตียนเล็กน้อย)',
      '"kan / bukannya ..." — mengingatkan info yang sudah diketahui',
      '"đấy thôi / mà ..." — gợi nhớ điều cả hai đã biết',
      '「〜じゃないですか / 〜でしょ」— 既知情報の確認・軽い咎め',
    ),
    example: '저 그 사람 싫어하잖아요.',
    trans: L(
      'I don’t like that person, you know.',
      'Es que ya sabes que esa persona no me gusta.',
      'Tu sais bien que je n’aime pas cette personne.',
      'É que eu não gosto dessa pessoa, sabe.',
      'ก็รู้อยู่แล้วว่าฉันไม่ชอบคนนั้น',
      'Saya kan tidak suka orang itu.',
      'Tôi không thích người đó mà, anh biết rồi đấy.',
      '私あの人が嫌いじゃないですか。',
    ),
    deckId: 'topik-2',
  },

  // G151 · Realization (calm)
  {
    ko: '-군요 / -구나',
    meaning: L(
      '"ah, I see ..." — quiet realization (군요 polite / 구나 casual)',
      '"ah, ya veo ..." — descubrimiento tranquilo (군요 educado / 구나 informal)',
      '«ah, je vois» — réalisation calme (군요 poli / 구나 familier)',
      '"ah, entendi ..." — percepção tranquila (군요 educado / 구나 informal)',
      '"อ๋อ, อย่างนี้นี่เอง" — เข้าใจอย่างสงบ (군요 สุภาพ / 구나 กันเอง)',
      '"oh begitu..." — penyadaran tenang (군요 sopan / 구나 santai)',
      '"à ra vậy ..." — phát hiện êm dịu (군요 lịch sự / 구나 thân mật)',
      '「〜ですね / 〜なんですね」— 落ち着いた気づき(군요 丁寧 / 구나 タメ)',
    ),
    example: '이 식당이 유명하군요.',
    trans: L(
      'Ah, this restaurant is famous!',
      '¡Ah, este restaurante es famoso!',
      'Ah, ce restaurant est célèbre !',
      'Ah, esse restaurante é famoso!',
      'อ๋อ ร้านอาหารร้านนี้ดังนี่เอง',
      'Oh, ternyata restoran ini terkenal.',
      'À, nhà hàng này nổi tiếng đấy.',
      'この食堂は有名なんですね。',
    ),
    deckId: 'topik-2',
  },

  // G152 · Evidential (I noticed firsthand)
  {
    ko: '-더라고요',
    meaning: L(
      '"I noticed / it turned out ..." — recounting a direct past observation',
      '"resultó que / me di cuenta de que ..." — observación directa pasada',
      '«il s’est avéré que / j’ai constaté que» — observation directe passée',
      '"acabou que / percebi que ..." — observação direta no passado',
      '"ปรากฏว่า / ฉันสังเกตเห็นว่า ..." — เล่าจากที่ได้เห็นเอง',
      '"ternyata / saya menyadari ..." — pengamatan langsung lampau',
      '"hóa ra / tôi nhận ra rằng ..." — quan sát trực tiếp trong quá khứ',
      '「〜でしたよ / 〜していました」— 直接観察の報告',
    ),
    example: '그 식당 음식이 정말 맛있더라고요.',
    trans: L(
      'It turned out the food at that restaurant was really good.',
      'Resulta que la comida de ese restaurante estaba muy rica.',
      'Il s’est avéré que la nourriture de ce restaurant était excellente.',
      'Acabou que a comida daquele restaurante era muito boa.',
      'ปรากฏว่าอาหารร้านนั้นอร่อยจริง ๆ',
      'Ternyata makanan restoran itu enak sekali.',
      'Hóa ra món ăn nhà hàng đó ngon thật.',
      'あのお店の料理、本当に美味しかったですよ。',
    ),
    deckId: 'topik-2',
  },

  // G153 · As much as
  {
    ko: '-(으)ㄹ 만큼',
    meaning: L(
      '"as much as / to the extent that" — proportion or sufficiency',
      '"tanto como / lo suficiente como para" — proporción o suficiencia',
      '«autant que / au point que» — proportion ou suffisance',
      '"tanto quanto / o suficiente para" — proporção ou suficiência',
      '"เท่าที่ / มากพอที่จะ" — สัดส่วนหรือความเพียงพอ',
      '"sebanyak / cukup untuk" — proporsi atau kecukupan',
      '"đến mức / vừa đủ" — tỷ lệ hoặc đủ',
      '「〜ほど / 〜くらい」— 程度・十分さ',
    ),
    example: '먹을 만큼 드세요.',
    trans: L(
      'Take as much as you’ll eat.',
      'Sírvase lo que vaya a comer.',
      'Sers-toi autant que tu vas en manger.',
      'Sirva-se quanto for comer.',
      'ตักไปเท่าที่จะกินไหว',
      'Ambil sebanyak yang akan dimakan.',
      'Lấy đủ phần bạn ăn.',
      '食べる分だけ取ってください。',
    ),
    deckId: 'topik-2',
  },

  // G155 · Easy / hard to
  {
    ko: '-기 쉽다/어렵다',
    meaning: L(
      '"is easy / hard to ..." — describes an action’s difficulty',
      '"es fácil / difícil + infinitivo" — describe la dificultad de una acción',
      '«il est facile / difficile de» — décrit la difficulté d’une action',
      '"é fácil / difícil de ..." — descreve a dificuldade de uma ação',
      '"ทำ ... ได้ง่าย / ยาก"',
      '"mudah / sulit untuk ..."',
      '"dễ / khó để ..."',
      '「〜やすい / 〜にくい」',
    ),
    example: '이 단어는 잊어버리기 쉬워요.',
    trans: L(
      'This word is easy to forget.',
      'Esta palabra es fácil de olvidar.',
      'Ce mot est facile à oublier.',
      'Essa palavra é fácil de esquecer.',
      'คำนี้ลืมง่าย',
      'Kata ini mudah dilupakan.',
      'Từ này dễ quên.',
      'この単語は忘れやすいです。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 10 · Pasiva básica y otros
  // ─────────────────────────────────────────────────────────────────────────

  // G157 · Passive morphology (basic)
  {
    ko: '피동사 (이/히/리/기)',
    meaning: L(
      'morphological passive — suffix 이/히/리/기 turns active into passive',
      'pasiva morfológica — sufijos 이/히/리/기 transforman activo a pasivo',
      'passif morphologique — suffixes 이/히/리/기 (boire→être bu)',
      'voz passiva morfológica — sufixos 이/히/리/기',
      'รูปกริยาถูกกระทำ — เติม 이/히/리/기 ที่กริยาทำ',
      'pasif morfologis — sufiks 이/히/리/기 mengubah aktif ke pasif',
      'thể bị động hình thái — hậu tố 이/히/리/기',
      '形態的受動 (이/히/리/기) — 보이다/들리다/잡히다…',
    ),
    example: '저기서 바다가 보여요.',
    trans: L(
      'You can see the sea from there.',
      'Desde allí se ve el mar.',
      'D’ici, on voit la mer.',
      'Dali dá para ver o mar.',
      'จากตรงนั้นมองเห็นทะเล',
      'Dari sana lautnya kelihatan.',
      'Từ đó nhìn thấy biển.',
      'あそこから海が見えます。',
    ),
    deckId: 'topik-2',
  },

  // G158 · Any / none (universal quantifier)
  {
    ko: '아무 N(이)나 / 아무 N도',
    meaning: L(
      '"any N (positive)" / "no N at all (with negation)"',
      '"cualquier N" (positivo) / "ningún N" (con negación)',
      '«n’importe quel N» (positif) / «aucun N» (avec négation)',
      '"qualquer N" (positivo) / "nenhum N" (com negação)',
      '"N อะไรก็ได้" (บวก) / "ไม่มี N เลย" (กับปฏิเสธ)',
      '"N apa saja" (positif) / "tidak ada N pun" (dengan negasi)',
      '"N nào cũng" (khẳng định) / "không N nào" (phủ định)',
      '肯定: 何/誰/どこでも / 否定: 何も/誰も/どこも',
    ),
    example: '아무 것이나 드세요.',
    trans: L(
      'Take anything, whatever you’d like.',
      'Tome cualquier cosa, lo que quiera.',
      'Prends ce que tu veux.',
      'Pegue qualquer coisa, o que quiser.',
      'หยิบอะไรก็ได้',
      'Ambil saja apa pun, sesuka Anda.',
      'Lấy gì cũng được, tùy bạn.',
      '何でも召し上がってください。',
    ),
    deckId: 'topik-2',
  },

  // G159 · At least (concession)
  {
    ko: '(이)라도',
    meaning: L(
      '"at least / even if just ..." — accept a less-than-ideal option',
      '"aunque solo sea / al menos ..." — aceptar una opción no ideal',
      '«au moins / ne serait-ce que» — accepter une option non idéale',
      '"pelo menos / mesmo que seja ..." — aceitar opção não ideal',
      '"อย่างน้อย ... ก็ ..." — รับตัวเลือกที่ไม่สมบูรณ์',
      '"setidaknya / kalaupun cuma ..." — menerima opsi tak ideal',
      '"ít nhất / dù chỉ ..." — chấp nhận lựa chọn không lý tưởng',
      '「〜でも (せめて)」— 控えめな提案/受容',
    ),
    example: '물이라도 마실래요?',
    trans: L(
      'Would you like at least some water?',
      '¿Quieres al menos tomar agua?',
      'Tu veux au moins boire un peu d’eau ?',
      'Quer pelo menos beber água?',
      'จะดื่มน้ำเปล่าก็ยังดีนะ',
      'Mau minum air saja kalau begitu?',
      'Bạn có muốn ít nhất uống chút nước không?',
      'お水でも飲みますか？',
    ),
    deckId: 'topik-2',
  },

  // G160 · Echo (you said ...?)
  {
    ko: '-다고요? / -(이)라고요?',
    meaning: L(
      'repeats what was just heard, with surprise or for confirmation',
      'repite lo que se acaba de escuchar, con sorpresa o para confirmar',
      'reprend ce qui vient d’être dit, par surprise ou pour confirmer',
      'repete o que acabou de ouvir, com surpresa ou para confirmar',
      'ทวนคำที่เพิ่งได้ยิน ด้วยความแปลกใจ / ขอยืนยัน',
      'mengulang yang baru didengar, dengan kaget atau minta konfirmasi',
      'lặp lại điều vừa nghe, ngạc nhiên hoặc xác nhận',
      '「〜って言いましたか？」— 確認・驚きで聞き返す',
    ),
    example: '내일 시험이 있다고요?',
    trans: L(
      'There’s an exam tomorrow, you say?',
      '¿Que mañana hay examen?',
      'Tu dis qu’il y a un examen demain ?',
      'Você disse que tem prova amanhã?',
      'พรุ่งนี้มีสอบเหรอ',
      'Katanya besok ada ujian?',
      'Bạn nói ngày mai có thi à?',
      '明日試験があるんですって？',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 11 · Cambio y adverbios temporales
  // ─────────────────────────────────────────────────────────────────────────

  // G051 · Become (noun)
  {
    ko: '이/가 되다',
    meaning: L(
      '"to become (a noun)" — change of state / role',
      '"convertirse en / llegar a ser" — cambio de estado o rol',
      '«devenir» — changement d’état ou de rôle',
      '"tornar-se / virar" — mudança de estado ou papel',
      '"กลายเป็น ..." — เปลี่ยนสภาพหรือบทบาท',
      '"menjadi ..." — perubahan keadaan / peran',
      '"trở thành ..." — đổi trạng thái / vai trò',
      '「〜になる」',
    ),
    example: '저는 의사가 되고 싶어요.',
    trans: L(
      'I want to become a doctor.',
      'Quiero convertirme en médico.',
      'Je veux devenir médecin.',
      'Eu quero ser médico.',
      'ฉันอยากเป็นหมอ',
      'Saya ingin menjadi dokter.',
      'Tôi muốn trở thành bác sĩ.',
      '私は医者になりたいです。',
    ),
    deckId: 'topik-2',
  },

  // G056 · Still / already / already (neutral)
  {
    ko: '아직 / 벌써 / 이미',
    meaning: L(
      '"still / already (sooner than expected) / already (neutral fact)"',
      '"todavía / ya (más pronto de lo esperado) / ya (hecho neutral)"',
      '«encore / déjà (plus tôt que prévu) / déjà (fait constaté)»',
      '"ainda / já (mais cedo que o esperado) / já (fato consumado)"',
      '"ยัง / เร็วจัง / เสร็จเรียบร้อยแล้ว"',
      '"masih / sudah (lebih cepat dari kira) / sudah (fakta)"',
      '"vẫn / đã (sớm hơn dự kiến) / đã (sự thật rồi)"',
      '「まだ / もう(意外な早さ) / すでに(既成事実)」',
    ),
    example: '아직 숙제를 안 했어요.',
    trans: L(
      'I haven’t done the homework yet.',
      'Todavía no he hecho la tarea.',
      'Je n’ai pas encore fait mes devoirs.',
      'Ainda não fiz a lição.',
      'ฉันยังไม่ได้ทำการบ้านเลย',
      'Saya belum mengerjakan PR.',
      'Tôi vẫn chưa làm bài tập.',
      'まだ宿題をしていません。',
    ),
    deckId: 'topik-2',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 12 · Transversales que se introducen en este nivel
  // (auxiliares G205–G233 que aparecen ya en TOPIK 2)
  // ─────────────────────────────────────────────────────────────────────────

  // G210 · I’m dying of ... (everyday hyperbole, from auxiliaries.md)
  {
    ko: '-아/어 죽겠다',
    meaning: L(
      '"I’m dying of ..." — colloquial hyperbole for an extreme feeling',
      '"me muero de ..." — hipérbole coloquial para sensación extrema',
      '«je meurs de ...» — hyperbole familière',
      '"estou morrendo de ..." — hipérbole coloquial',
      '"... จะตายอยู่แล้ว" — สำนวนกึ่งเล่น กึ่งจริง',
      '"saya hampir mati karena ..." — hiperbol sehari-hari',
      '"chết mất vì ..." — nói cường điệu thân mật',
      '「〜て死にそうだ」— 口語的誇張',
    ),
    example: '배고파 죽겠어요.',
    trans: L(
      'I’m starving (lit. dying of hunger).',
      'Me muero de hambre.',
      'Je meurs de faim.',
      'Estou morrendo de fome.',
      'หิวจะตายแล้ว',
      'Saya lapar setengah mati.',
      'Tôi đói chết mất.',
      'お腹が空いて死にそうです。',
    ),
    deckId: 'topik-2',
  },

  // G212 · Colloquial connector (from auxiliaries.md)
  {
    ko: '-아/어 가지고',
    meaning: L(
      '"and so / because ..." — colloquial connector, often contracted to -아/어 갖고; spoken-only alternative to -아/어서',
      '"y entonces / porque ..." — conector coloquial, se contrae a -아/어 갖고; alternativa hablada de -아/어서',
      '«et donc / parce que ...» — connecteur familier, contracté en -아/어 갖고',
      '"e então / porque ..." — conector falado, contrai para -아/어 갖고',
      '"... แล้วก็ ... / เพราะ ... (พูด)"',
      '"jadi / karena ... (lisan)" — sering disingkat -아/어 갖고',
      '"do đó / vì ... (nói)" — rút gọn -아/어 갖고',
      '「〜して(口語) / 〜なので」— 縮約 -아/어 갖고',
    ),
    example: '비가 와 가지고 못 갔어요.',
    trans: L(
      'It rained, so I couldn’t go.',
      'Como llovió, no pude ir.',
      'Comme il pleuvait, je n’ai pas pu y aller.',
      'Choveu, então não pude ir.',
      'ฝนตกเลยไปไม่ได้',
      'Gara-gara hujan, saya tidak bisa pergi.',
      'Vì trời mưa nên tôi không đi được.',
      '雨が降って行けませんでした。',
    ),
    deckId: 'topik-2',
  },

  // G216 · Leave halfway (from auxiliaries.md)
  {
    ko: '-다(가) 말다',
    meaning: L(
      '"start ...ing and then leave it" — partial action abandoned midway',
      '"empezar a ... y dejarlo a medias" — acción parcial abandonada',
      '«commencer à ... puis laisser tomber» — action abandonnée',
      '"começar a ... e largar pela metade" — ação abandonada',
      '"ทำ ... ค้างไว้ / เลิกกลางทาง"',
      '"melakukan ... lalu meninggalkannya di tengah jalan"',
      '"đang ... thì bỏ dở"',
      '「〜しかけてやめる」— 中途で放棄',
    ),
    example: '책을 읽다가 말았어요.',
    trans: L(
      'I started reading the book but left it halfway.',
      'Empecé a leer el libro pero lo dejé a medias.',
      'J’ai commencé à lire le livre mais je l’ai laissé tomber.',
      'Comecei a ler o livro, mas larguei pela metade.',
      'อ่านหนังสือค้างเอาไว้',
      'Saya mulai membaca buku tapi tidak selesai.',
      'Tôi đọc sách được nửa chừng rồi bỏ.',
      '本を読みかけてやめました。',
    ),
    deckId: 'topik-2',
  },
]

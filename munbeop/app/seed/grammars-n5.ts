import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 5 grammar — 25 entries aligned with `seed/topik-spine.json`
 * (spine ids in topik.5 + transversal G186–G196).
 *
 * Themes (in source order):
 *   1. Evidencialidad y observación              (3)
 *   2. Concesión avanzada                        (6)
 *   3. Equivalencia, limitación y suficiencia    (8)
 *   4. Causa formal con matices                  (4)
 *   5. Extremo y frustración                     (3)
 *   6. Indiferencia                              (1)
 */
export const TOPIK_5_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Evidencialidad y observación
  // ─────────────────────────────────────────────────────────────────────────

  // G098 · I observed X → and then Y
  {
    ko: '-더니',
    meaning: L(
      '"I observed X, and then Y happened (as expected)" — evidential past with consequence',
      '"observé X y resultó Y" — evidencial pasado con resultado esperado',
      '«j’avais remarqué X, et puis Y est arrivé»',
      '"observei X, e então Y" — evidencial passado com consequência',
      '"ก่อนหน้านี้ ... จึง / กลายเป็น ..." — บอกเล่าจากที่ได้สังเกตเอง',
      '"tadinya ... lalu jadi ..." — observasi langsung di masa lalu',
      '"trước thì ... rồi sau đó ..." — chứng kiến rồi có kết quả',
      '「〜していたが / 〜だったが(観察)」— 直接観察 → 結果',
    ),
    example: '아침에 구름이 많더니 지금 비가 오네요.',
    trans: L(
      'It was cloudy this morning, and now sure enough it’s raining.',
      'Esta mañana había muchas nubes; ahora, como cabía esperar, llueve.',
      'Il y avait beaucoup de nuages ce matin, et voilà qu’il pleut.',
      'De manhã tinha muitas nuvens; agora, como esperado, está chovendo.',
      'ตอนเช้ามีเมฆเยอะ ตอนนี้ฝนก็ตก',
      'Tadi pagi awannya banyak, sekarang ternyata hujan.',
      'Sáng nay nhiều mây, giờ thì trời mưa thật.',
      '朝から雲が多かったと思ったら、今は雨が降っていますね。',
    ),
    deckId: 'topik-5',
  },

  // G099 · Past habit / interrupted (nominal modifier)
  {
    ko: '-던',
    meaning: L(
      'modifier — past habit or unfinished action ("used to / was X-ing")',
      'modificador — hábito pasado o acción interrumpida ("solía / estaba ...")',
      'modificateur — habitude passée ou action inachevée («qui … autrefois»)',
      'modificador — hábito passado ou ação inacabada ("costumava / estava ...")',
      'รูปขยาย — เคยทำ (ตอนนี้เลิกแล้ว) / ยังทำไม่จบ',
      'pengubah — kebiasaan lampau / aksi tak selesai ("dulu suka / sedang ...")',
      'bổ ngữ — thói quen cũ / hành động dở dang ("từng / đang ...")',
      '連体形「〜していた / よく〜した(今はしない)」',
    ),
    example: '어렸을 때 자주 가던 공원이에요.',
    trans: L(
      'It’s the park I used to go to often as a child.',
      'Es el parque al que solía ir a menudo de niño.',
      'C’est le parc où j’allais souvent enfant.',
      'É o parque ao qual eu costumava ir quando criança.',
      'นี่คือสวนที่ตอนเด็ก ๆ ฉันมักจะไปบ่อย',
      'Ini taman tempat saya dulu sering main waktu kecil.',
      'Đây là công viên hồi nhỏ tôi hay đến.',
      '子供のころよく行っていた公園です。',
    ),
    deckId: 'topik-5',
  },

  // G193 · Just as I thought (emphatic)
  {
    ko: '-더니만',
    meaning: L(
      '"sure enough / just as I expected" — emphatic version of -더니',
      '"como yo decía / tal como esperaba" — versión enfática de -더니',
      '«je le savais bien que ...» — variante emphatique de -더니',
      '"como eu dizia / sabia que ..." — variante enfática de -더니',
      '"นี่ไง บอกแล้วว่า ..." — เน้นจาก -더니',
      '"benar saja ..." — versi penegasan dari -더니',
      '"đúng như tôi đoán ..." — biến thể nhấn mạnh của -더니',
      '「やっぱり〜していたっけ」— -더니 の強調',
    ),
    example: '연습을 열심히 하더니만 역시 잘 하네요.',
    trans: L(
      'They practiced hard, and sure enough they’re doing great.',
      'Estuvo practicando mucho y, tal como pensaba, lo hace muy bien.',
      'Il s’était entraîné dur ; sans surprise, il s’en sort très bien.',
      'Treinou muito e, como eu esperava, está indo muito bem.',
      'ฝึกซ้อมหนัก สุดท้ายก็ทำได้ดีจริง ๆ',
      'Latihan terus, dan benar saja hasilnya bagus.',
      'Tập luyện chăm chỉ, đúng như tôi đoán, giờ giỏi thật.',
      '一生懸命練習していたから、やっぱり上手ですね。',
    ),
    deckId: 'topik-5',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Concesión avanzada
  // ─────────────────────────────────────────────────────────────────────────

  // G100 · Rather X than Y (firm determination)
  {
    ko: '-(으)ㄹ지언정',
    meaning: L(
      '"even if it means ..., I’d rather than ..." — firm determination, prefers hardship to giving in',
      '"aunque tenga que ..., antes que ..." — determinación firme; prefiere lo difícil',
      '«même au prix de ..., plutôt que de ...» — résolution ferme',
      '"ainda que ..., antes que ..." — determinação firme',
      '"ถึงจะ ... ก็ ไม่ ..." — เด็ดเดี่ยว ยอมลำบาก',
      '"meskipun harus ..., tetap tidak ..." — tekad bulat',
      '"thà ... còn hơn ..." — quyết tâm dứt khoát',
      '「〜することがあっても / 〜してでも(決して〜ない)」',
    ),
    example: '굶을지언정 그 사람한테 도움을 요청하지 않겠어요.',
    trans: L(
      'Even if I starve, I won’t ask that person for help.',
      'Aunque pase hambre, no le pediré ayuda a esa persona.',
      'Quitte à mourir de faim, je ne lui demanderai pas d’aide.',
      'Mesmo que eu passe fome, não vou pedir ajuda a essa pessoa.',
      'ต่อให้อดข้าวก็ไม่ขอความช่วยเหลือจากคนนั้น',
      'Walau kelaparan, saya tidak akan minta tolong padanya.',
      'Thà nhịn đói chứ tôi không nhờ vả người ấy.',
      '飢えてでも、あの人に助けは求めません。',
    ),
    deckId: 'topik-5',
  },

  // G107 · Even if (formal / literary)
  {
    ko: '-(으)ㄹ지라도',
    meaning: L(
      '"even if / even though ..." — formal/literary concession',
      '"aunque / incluso si ..." — concesión formal o literaria',
      '«même si / quand même» — registre formel / littéraire',
      '"mesmo que / ainda que ..." — concessão formal/literária',
      '"แม้ว่าจะ ... ก็ ... (ทางการ)"',
      '"meskipun ... (formal / sastra)"',
      '"dù cho ... (trang trọng / văn chương)"',
      '「〜であれ / 〜であろうとも(改まり)」',
    ),
    example: '힘들지라도 포기하지 않겠어요.',
    trans: L(
      'Even if it’s hard, I won’t give up.',
      'Aunque sea difícil, no me rendiré.',
      'Même si c’est difficile, je n’abandonnerai pas.',
      'Mesmo que seja difícil, não vou desistir.',
      'แม้จะลำบาก ฉันจะไม่ยอมแพ้',
      'Meskipun sulit, saya tidak akan menyerah.',
      'Dù khó khăn tôi cũng không bỏ cuộc.',
      'たとえつらくても、諦めません。',
    ),
    deckId: 'topik-5',
  },

  // G186 · Even after fully doing
  {
    ko: '-고도',
    meaning: L(
      '"even after fully ... still ..." — concession with action already completed',
      '"aunque habiendo ..., aun así ..." — concesión con acción ya hecha',
      '«même après avoir ... encore ...» — concession action accomplie',
      '"mesmo tendo ..., ainda ..." — concessão com ação concluída',
      '"แม้จะ ... แล้ว ก็ยัง ..."',
      '"meskipun sudah ..., masih ..."',
      '"đã ... rồi mà vẫn ..."',
      '「〜してもなお / 〜したうえに(なお)」',
    ),
    example: '이렇게 많이 먹고도 배가 고파요?',
    trans: L(
      'You’re hungry even after eating this much?',
      '¿Tienes hambre a pesar de haber comido tanto?',
      'Tu as encore faim après avoir tant mangé ?',
      'Mesmo tendo comido tanto, ainda está com fome?',
      'กินไปขนาดนี้แล้วยังหิวอีกเหรอ',
      'Sudah makan sebanyak ini masih lapar?',
      'Ăn nhiều thế rồi vẫn đói à?',
      'こんなにたくさん食べたのにまだお腹が空いていますか？',
    ),
    deckId: 'topik-5',
  },

  // G187 · Rather than (preference among two bad options)
  {
    ko: '-느니 (차라리)',
    meaning: L(
      '"rather than ..., I’d prefer ..." — preference between two undesirable options; often with 차라리',
      '"antes que ..., prefiero ..." — preferencia entre dos males; a menudo con 차라리',
      '«plutôt que de ..., je préfère ...» — souvent avec 차라리',
      '"em vez de ..., prefiro ..." — preferência entre opções ruins; frequentemente com 차라리',
      '"แทนที่จะ ... สู้ ... ดีกว่า" — มักมี 차라리',
      '"daripada ..., lebih baik ..." — sering pakai 차라리',
      '"thà ... còn hơn (làm) ..." — thường với 차라리',
      '「〜するくらいなら / むしろ〜したほうがいい」',
    ),
    example: '거짓말을 하느니 차라리 아무 말도 안 하겠어요.',
    trans: L(
      'Rather than lie, I’d rather say nothing at all.',
      'Antes que mentir, prefiero no decir nada.',
      'Plutôt que de mentir, je préfère ne rien dire.',
      'Em vez de mentir, prefiro não dizer nada.',
      'แทนที่จะโกหก ฉันยอมไม่พูดอะไรเลย',
      'Daripada bohong, lebih baik diam saja.',
      'Thà không nói gì còn hơn nói dối.',
      '嘘をつくくらいなら、何も言わない方がいいです。',
    ),
    deckId: 'topik-5',
  },

  // G189 · Unless / except if
  {
    ko: '-(으)면 몰라도',
    meaning: L(
      '"unless / except if ..." — only condition under which the claim wouldn’t hold',
      '"a no ser que / salvo si ..." — única condición que cambiaría el caso',
      '«à moins que / sauf si ...»',
      '"a menos que / a não ser que ..."',
      '"นอกจาก ... แล้ว / ยกเว้นว่า ..."',
      '"kecuali kalau / kalau bukan karena ..."',
      '"trừ phi / nếu không thì ..."',
      '「〜なら別だが / 〜でないかぎり」',
    ),
    example: '기적이 일어나면 몰라도 불가능한 일이에요.',
    trans: L(
      'Unless a miracle happens, it’s impossible.',
      'A no ser que ocurra un milagro, es imposible.',
      'À moins qu’un miracle ne se produise, c’est impossible.',
      'A não ser que aconteça um milagre, é impossível.',
      'นอกจากจะเกิดปาฏิหาริย์ ไม่อย่างนั้นเป็นไปไม่ได้',
      'Kecuali ada keajaiban, mustahil terjadi.',
      'Trừ phi xảy ra phép màu, chuyện đó không thể.',
      '奇跡が起きるならともかく、不可能な話です。',
    ),
    deckId: 'topik-5',
  },

  // G195 · Even granting that (argumentative)
  {
    ko: '-다손 치더라도',
    meaning: L(
      '"even granting / supposing that ..." — argumentative concession; formal',
      '"aun concediendo que / aun suponiendo que ..." — concesión argumentativa, formal',
      '«à supposer même que ...» — concession argumentative formelle',
      '"mesmo admitindo que / supondo que ..." — concessão argumentativa',
      '"ต่อให้สมมุติว่า ... ก็ ..." — แบบเชิงโต้แย้ง, ทางการ',
      '"meskipun seandainya ..., tetap ..."',
      '"cứ cho là ..., (vẫn) ..."',
      '「〜だと仮にしても」— 議論的譲歩',
    ),
    example: '그것이 사실이다손 치더라도 용서할 수 없어요.',
    trans: L(
      'Even granting that it’s true, I can’t forgive it.',
      'Aun concediendo que sea verdad, no puedo perdonarlo.',
      'À supposer même que ce soit vrai, je ne peux pas pardonner.',
      'Mesmo admitindo que seja verdade, não consigo perdoar.',
      'ต่อให้สมมุติว่ามันเป็นเรื่องจริง ก็ยังให้อภัยไม่ได้',
      'Meskipun seandainya itu benar, tetap tidak bisa saya maafkan.',
      'Cứ cho là chuyện đó đúng đi, tôi cũng không tha thứ.',
      'それが事実だとしても、許せません。',
    ),
    deckId: 'topik-5',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Equivalencia, limitación y suficiencia
  // ─────────────────────────────────────────────────────────────────────────

  // G101 · Amounts to / equivalent
  {
    ko: '-(으)ㄴ/는 셈이다',
    meaning: L(
      '"amounts to / comes to be ..." — approximate equivalence',
      '"viene a ser / equivale a ..." — equivalencia aproximada',
      '«cela revient à / autant dire que»',
      '"vem a ser / é como se ..." — equivalência aproximada',
      '"ก็คือ ... โดยรวม / เท่ากับว่า ..."',
      '"berarti / praktisnya ... = ..."',
      '"coi như / xem ra / tính ra là ..."',
      '「〜ようなものだ / 〜することになる」',
    ),
    example: '하루에 세 번 먹으니까 규칙적으로 먹는 셈이에요.',
    trans: L(
      'Eating three times a day, it amounts to eating regularly.',
      'Como como tres veces al día, viene a ser que como con regularidad.',
      'Comme je mange trois fois par jour, ça revient à manger régulièrement.',
      'Como como três vezes ao dia, é como se comesse regularmente.',
      'กินวันละสามมื้อ ก็เท่ากับกินสม่ำเสมอ',
      'Makan tiga kali sehari berarti praktisnya teratur.',
      'Ăn ba bữa một ngày, coi như là ăn đều đặn.',
      '一日三回食べているので、規則正しく食べているようなものです。',
    ),
    deckId: 'topik-5',
  },

  // G104 · Merely / all I can do is
  {
    ko: '-(으)ㄹ 따름이다',
    meaning: L(
      '"merely / all I (can) do is ..." — humble or resigned limitation',
      '"simplemente / lo único que (puedo) ..." — limitación humilde o resignada',
      '«je ne fais que / il n’y a plus qu’à ...» — humilité ou résignation',
      '"apenas / só me resta ..." — humildade ou resignação',
      '"เพียงแต่ ... เท่านั้น" — ทำได้แค่นี้ (ถ่อมตน)',
      '"hanya bisa ... / yang dapat saya lakukan hanyalah ..."',
      '"chỉ có thể ... mà thôi" — khiêm tốn / cam chịu',
      '「〜するばかりだ / 〜するほかない(改まり)」',
    ),
    example: '그저 감사할 따름이에요.',
    trans: L(
      'I can only feel grateful.',
      'Solo puedo estar agradecido.',
      'Je ne peux qu’être reconnaissant.',
      'Só me resta agradecer.',
      'ทำได้แค่ขอบคุณเท่านั้น',
      'Saya hanya bisa berterima kasih.',
      'Tôi chỉ biết cảm ơn mà thôi.',
      'ただただ感謝するばかりです。',
    ),
    deckId: 'topik-5',
  },

  // G190 · Just / nothing but
  {
    ko: '-(으)ㄹ 뿐이다',
    meaning: L(
      '"merely / just ..." — restrictive limitation; nothing beyond',
      '"no es más que / simplemente ..." — limitación restrictiva',
      '«rien d’autre que / juste ...»',
      '"apenas / nada além de ..." — limitação restritiva',
      '"แค่ ... เท่านั้น / ไม่ใช่อะไรมากกว่านั้น"',
      '"sekadar / hanya ..."',
      '"chỉ ... mà thôi"',
      '「〜だけだ / 〜にすぎない」',
    ),
    example: '저는 제 의견을 말했을 뿐이에요.',
    trans: L(
      'I merely expressed my opinion.',
      'Simplemente expresé mi opinión, nada más.',
      'Je n’ai fait que donner mon avis.',
      'Eu apenas dei a minha opinião.',
      'ฉันแค่บอกความคิดเห็นของตัวเองเท่านั้น',
      'Saya hanya menyampaikan pendapat saya.',
      'Tôi chỉ nói ra ý kiến của mình thôi.',
      '私は自分の意見を言ったにすぎません。',
    ),
    deckId: 'topik-5',
  },

  // G111 · No more than / nothing but
  {
    ko: '에 불과하다',
    meaning: L(
      '"is no more than / just ..." — minimization with N',
      '"no es más que / apenas ..." — minimización con sustantivo',
      '«ne représente que / n’est qu’un(e) simple ...»',
      '"não passa de / é apenas um(a) ..." — minimização com substantivo',
      '"เป็นเพียง ... เท่านั้น"',
      '"tidak lebih dari (sekadar) ..."',
      '"chẳng qua chỉ là / không hơn ..."',
      '「〜にすぎない」(名詞)',
    ),
    example: '이것은 시작에 불과해요.',
    trans: L(
      'This is no more than the beginning.',
      'Esto no es más que el comienzo.',
      'Ce n’est qu’un début.',
      'Isso não passa do começo.',
      'นี่เป็นเพียงจุดเริ่มต้นเท่านั้น',
      'Ini tidak lebih dari sebuah permulaan.',
      'Đây chẳng qua chỉ là khởi đầu.',
      'これは始まりにすぎません。',
    ),
    deckId: 'topik-5',
  },

  // G191 · Depends on how you do it
  {
    ko: '-기 나름이다',
    meaning: L(
      '"depends on how you do it" — outcome hinges on the approach',
      '"depende de cómo se haga / es cuestión de ..." — el resultado depende del enfoque',
      '«tout dépend de la façon dont ...»',
      '"depende de como se faz ..." — resultado depende da abordagem',
      '"ขึ้นอยู่กับวิธีทำ ..."',
      '"tergantung bagaimana ..."',
      '"tùy cách mình làm ..."',
      '「〜次第だ」— 取り組み方による',
    ),
    example: '어떤 일이든 하기 나름이에요.',
    trans: L(
      'Any task is what you make of it.',
      'Cualquier trabajo depende de cómo lo enfoques.',
      'Tout travail dépend de la façon dont on l’aborde.',
      'Qualquer trabalho depende de como você o encara.',
      'งานใด ๆ ก็ขึ้นอยู่กับวิธีทำของเรา',
      'Pekerjaan apa pun tergantung cara mengerjakannya.',
      'Việc nào cũng tùy cách mình làm.',
      'どんな仕事もやり方次第です。',
    ),
    deckId: 'topik-5',
  },

  // G192 · Needless to say
  {
    ko: '-(으)ㄹ 나위가 없다',
    meaning: L(
      '"needless to say / there’s no room for doubt ..." — obviousness',
      '"huelga decir que / está de más decir que ..." — obviedad',
      '«inutile de dire que / cela va sans dire»',
      '"escusado é dizer que / nem é preciso dizer ..."',
      '"ไม่จำเป็นต้องพูดว่า ..."',
      '"tidak perlu dikatakan lagi ..."',
      '"khỏi cần nói / hiển nhiên là ..."',
      '「〜までもない / 言うまでもない」',
    ),
    example: '건강이 중요하다는 것은 더 말할 나위도 없죠.',
    trans: L(
      'It goes without saying that health is important.',
      'Que la salud es importante está de más decirlo.',
      'Inutile de dire que la santé est importante.',
      'Nem precisa dizer que saúde é importante.',
      'ไม่ต้องพูดเลยว่าสุขภาพสำคัญแค่ไหน',
      'Tidak perlu dikatakan lagi bahwa kesehatan itu penting.',
      'Khỏi cần nói thì sức khỏe vẫn quan trọng.',
      '健康が大事なのは言うまでもありません。',
    ),
    deckId: 'topik-5',
  },

  // G194 · No need to (just do it)
  {
    ko: '-(으)ㄹ 것 없이',
    meaning: L(
      '"no need to ..., just ..." — dispenses with the unnecessary',
      '"sin necesidad de ..., simplemente ..." — descarta lo innecesario',
      '«sans avoir besoin de ..., il suffit de ...»',
      '"sem necessidade de ..., simplesmente ..."',
      '"ไม่ต้อง ... แค่ ..."',
      '"tidak perlu ..., cukup ..."',
      '"không cần ..., cứ ... đi"',
      '「〜することなく / 〜するまでもなく」',
    ),
    example: '걱정할 것 없이 그냥 해보세요.',
    trans: L(
      'No need to worry — just give it a try.',
      'Sin preocuparte, simplemente inténtalo.',
      'Sans t’inquiéter, essaie tout simplement.',
      'Sem se preocupar, é só tentar.',
      'ไม่ต้องกังวล ลองทำดูก่อน',
      'Tidak perlu khawatir, coba saja.',
      'Khỏi lo, cứ thử đi.',
      '心配せずに、とにかくやってみてください。',
    ),
    deckId: 'topik-5',
  },

  // G196 · Just X is enough
  {
    ko: '-(으)면 그만이다',
    meaning: L(
      '"just X is enough / X and that’s that ..." — minimal sufficiency, sometimes dismissive',
      '"con X basta / con eso es suficiente ..." — suficiencia mínima, a veces desdeñoso',
      '«il suffit de ... / une fois ... fait, c’est terminé»',
      '"basta ... / só precisa ... e pronto"',
      '"แค่ ... ก็พอ / ทำเท่านี้ก็จบ"',
      '"cukup ... saja sudah selesai"',
      '"chỉ cần ... là xong"',
      '「〜ばそれでいい / 〜ばすむ」',
    ),
    example: '그냥 솔직하게 말하면 그만이에요.',
    trans: L(
      'Just be honest and that’s enough.',
      'Con ser honesto basta.',
      'Il suffit d’être honnête, c’est tout.',
      'Basta ser honesto e pronto.',
      'แค่พูดตรง ๆ ก็พอแล้ว',
      'Cukup bicara jujur saja.',
      'Chỉ cần thành thật là đủ.',
      '正直に言えばそれですみます。',
    ),
    deckId: 'topik-5',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Causa formal con matices
  // ─────────────────────────────────────────────────────────────────────────

  // G102 · Because (observation-based, formal)
  {
    ko: '-기에',
    meaning: L(
      '"because / since ..." — formal, often based on observation; reasoned consequence',
      '"porque / dado que ..." — formal, basado en observación; consecuencia razonada',
      '«parce que / du moment que ...» — formel, raisonné',
      '"porque / dado que ..." — formal, baseado em observação',
      '"เพราะว่า ... (ทางการ, อิงสิ่งที่เห็น)"',
      '"karena / lantaran ... (formal)"',
      '"vì / do ... (trang trọng, dựa trên quan sát)"',
      '「〜ので / 〜だから(改まり、観察に基づく)」',
    ),
    example: '가격이 저렴하기에 많이 샀어요.',
    trans: L(
      'Since the price was cheap, I bought a lot.',
      'Como el precio era barato, compré bastante.',
      'Le prix étant bas, j’en ai acheté beaucoup.',
      'Como o preço estava barato, comprei bastante.',
      'เพราะราคาถูก ฉันเลยซื้อเยอะ',
      'Karena harganya murah, saya beli banyak.',
      'Vì giá rẻ nên tôi mua nhiều.',
      '価格が安かったので、たくさん買いました。',
    ),
    deckId: 'topik-5',
  },

  // G103 · Due to (blame, lament)
  {
    ko: '-(으)ㄴ/는 탓에',
    meaning: L(
      '"because of (negatively) / it’s the fault of ..." — always with bad outcome',
      '"por culpa de / a causa de ..." — siempre con resultado negativo',
      '«à cause de / par la faute de ...» — résultat négatif',
      '"por culpa de / por causa de ..." — sempre com resultado negativo',
      '"เพราะ ... (สิ่งไม่ดี) / โทษ ..."',
      '"gara-gara ... / akibat ..." — selalu hasil buruk',
      '"do tại ... / vì ... (kết quả xấu)"',
      '「〜せいで」— 悪い結果',
    ),
    example: '늦게 자는 탓에 항상 피곤해요.',
    trans: L(
      'I’m always tired because I go to bed late.',
      'Por culpa de acostarme tarde, siempre estoy cansado.',
      'À cause de mes nuits tardives, je suis toujours fatigué.',
      'Por causa de dormir tarde, sempre estou cansado.',
      'เพราะนอนดึก เลยเหนื่อยตลอด',
      'Gara-gara tidur larut, saya selalu lelah.',
      'Vì hay ngủ muộn nên tôi luôn mệt.',
      '夜更かしのせいでいつも疲れています。',
    ),
    deckId: 'topik-5',
  },

  // G110 · Due to (written/formal)
  {
    ko: '-(으)로 인해(서)',
    meaning: L(
      '"due to / as a result of ..." — formal/written cause; news and academic style',
      '"debido a / como consecuencia de ..." — causa formal/escrita',
      '«à cause de / en raison de ...» — registre formel / écrit',
      '"devido a / em razão de ..." — causa formal, escrita',
      '"เนื่องด้วย / อันเป็นผลจาก ... (ทางการ)"',
      '"akibat / disebabkan oleh ... (formal)"',
      '"do / vì lý do ... (trang trọng)"',
      '「〜により / 〜によって」— 改まり・新聞語調',
    ),
    example: '폭우로 인해 도로가 통제됐어요.',
    trans: L(
      'Due to heavy rain, the road was closed.',
      'Debido a las lluvias torrenciales, la carretera fue bloqueada.',
      'En raison de fortes pluies, la route a été fermée.',
      'Devido às chuvas fortes, a estrada foi interditada.',
      'อันเนื่องมาจากฝนตกหนัก ถนนถูกปิด',
      'Akibat hujan deras, jalan ditutup.',
      'Do mưa lớn, đường đã bị phong tỏa.',
      '豪雨により道路が通行止めになりました。',
    ),
    deckId: 'topik-5',
  },

  // G109 · With the purpose of (formal/literary)
  {
    ko: '-고자',
    meaning: L(
      '"with the purpose of / intending to ..." — formal/literary intention',
      '"con el propósito de / con la intención de ..." — formal/literario',
      '«dans le but de / en vue de» — registre formel',
      '"com o propósito de / a fim de ..." — formal/literário',
      '"เพื่อ / ด้วยจุดประสงค์ที่จะ ... (ทางการ)"',
      '"dengan maksud / demi ... (formal)"',
      '"nhằm / với mục đích ... (trang trọng)"',
      '「〜しようと / 〜すべく(改まり)」',
    ),
    example: '더 나은 세상을 만들고자 노력하고 있습니다.',
    trans: L(
      'We are striving to build a better world.',
      'Nos esforzamos con el propósito de crear un mundo mejor.',
      'Nous nous efforçons de bâtir un monde meilleur.',
      'Estamos nos esforçando a fim de criar um mundo melhor.',
      'พวกเรากำลังพยายามเพื่อสร้างโลกที่ดีกว่า',
      'Kami berupaya demi membangun dunia yang lebih baik.',
      'Chúng tôi đang nỗ lực nhằm tạo ra một thế giới tốt đẹp hơn.',
      'より良い世界を作るべく努力しています。',
    ),
    deckId: 'topik-5',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Extremo y frustración
  // ─────────────────────────────────────────────────────────────────────────

  // G105 · As a result of doing X to excess
  {
    ko: '-(으)ㄴ/는 나머지',
    meaning: L(
      '"as a result of (extreme) ..." — overflow leading to unexpected outcome',
      '"tanto que / de tanto ..." — exceso que provoca un resultado',
      '«à force de ... / au point que»',
      '"de tanto ... / a ponto de ..." — excesso com resultado',
      '"จนถึงขั้น ... / มากเกินไปจน ..."',
      '"saking ... / akibat terlalu ..."',
      '"vì ... quá đến nỗi ..."',
      '「〜あまり」— 程度の超過 → 結果',
    ),
    example: '너무 웃은 나머지 배가 아팠어요.',
    trans: L(
      'I laughed so much that my stomach hurt.',
      'Me reí tanto que me dolió el estómago.',
      'À force de rire, j’en ai eu mal au ventre.',
      'De tanto rir, minha barriga doeu.',
      'หัวเราะจนปวดท้อง',
      'Saking banyak tertawa, perut saya sakit.',
      'Tôi cười nhiều đến nỗi đau bụng.',
      '笑いすぎてお腹が痛くなりました。',
    ),
    deckId: 'topik-5',
  },

  // G188 · On the verge of (extreme)
  {
    ko: '-(으)ㄹ 지경이다',
    meaning: L(
      '"on the verge of / to the point of ..." — extreme situation, usually negative',
      '"al borde de / hasta el punto de ..." — situación extrema, suele ser negativa',
      '«au point de / sur le point de ...» — situation extrême',
      '"a ponto de / no limite de ..." — situação extrema',
      '"แทบจะ ... / ถึงขั้น ..."',
      '"hampir ... / sampai-sampai ..."',
      '"đến mức suýt ... / sắp sửa ..."',
      '「〜しそうなほどだ / 〜する寸前だ」',
    ),
    example: '너무 바빠서 쓰러질 지경이에요.',
    trans: L(
      'I’m so busy I’m about to collapse.',
      'Estoy tan ocupado que estoy al borde del colapso.',
      'Je suis tellement occupé que je suis au bord de l’effondrement.',
      'Estou tão ocupado que estou a ponto de desmaiar.',
      'ยุ่งจนแทบจะหมดแรงล้มไปแล้ว',
      'Saking sibuk, saya hampir tumbang.',
      'Tôi bận đến mức sắp ngã quỵ.',
      '忙しすぎて倒れそうな状態です。',
    ),
    deckId: 'topik-5',
  },

  // G108 · Far from ... ; let alone
  {
    ko: '-는 커녕',
    meaning: L(
      '"far from ... ; let alone ..." — strong contrast with negative result',
      '"lejos de ... / ni siquiera ..." — contraste fuerte con resultado negativo',
      '«loin de ... / encore moins ...»',
      '"longe de ... / quanto mais ..."',
      '"ไม่ใช่แค่ไม่ ... แต่กลับ ..."',
      '"jangankan ..., malah ..."',
      '"chứ đừng nói ... / nói gì đến ..."',
      '「〜どころか」— 強い反転',
    ),
    example: '감사하기는 커녕 화를 냈어요.',
    trans: L(
      'Far from being grateful, they got angry.',
      'Lejos de agradecer, se enojó.',
      'Loin de remercier, il/elle s’est mis(e) en colère.',
      'Longe de agradecer, ficou bravo(a).',
      'จะขอบคุณก็ไม่ขอบคุณ กลับโกรธอีก',
      'Jangankan terima kasih, malah marah.',
      'Đừng nói cảm ơn, người ấy còn nổi giận.',
      '感謝するどころか怒り出しました。',
    ),
    deckId: 'topik-5',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Indiferencia
  // ─────────────────────────────────────────────────────────────────────────

  // G106 · No matter / whether ... or ...
  {
    ko: '-든지',
    meaning: L(
      '"whether ... or / no matter ..." — indifference to alternatives',
      '"ya sea ... o / sin importar ..." — indiferencia entre opciones',
      '«que ... ou ... / quel que soit»',
      '"seja ... ou ... / não importa ..."',
      '"ไม่ว่าจะ ... หรือ ..."',
      '"baik ... maupun ... / apa pun ..."',
      '"dù ... hay ..."',
      '「〜であろうと / 〜にせよ」— 無関心の選択',
    ),
    example: '어디에 가든지 연락해 주세요.',
    trans: L(
      'No matter where you go, please contact me.',
      'Vayas a donde vayas, avísame.',
      'Où que tu ailles, contacte-moi.',
      'Aonde quer que vá, me avise.',
      'ไม่ว่าจะไปไหน บอกฉันด้วยนะ',
      'Ke mana pun kamu pergi, kabari saya.',
      'Dù bạn đi đâu, hãy báo cho tôi.',
      'どこへ行こうと連絡してください。',
    ),
    deckId: 'topik-5',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 7 · Transversales que se introducen en este nivel
  // (aux G227–G233 + indirect D013–D017 + additional G236–G259 + complementary G265–G287)
  // ─────────────────────────────────────────────────────────────────────────

  // G227 · After a prolonged process (aux)
  {
    ko: '-(으)ㄴ 끝에',
    meaning: L(
      '"after much / at the end of ..." — result after prolonged effort or process',
      '"después de mucho / al final de ..." — resultado tras un proceso largo',
      '«au bout de / après bien des ...»',
      '"depois de muito / ao cabo de ..."',
      '"หลังจาก ... อันยาวนาน"',
      '"setelah lama / akhirnya setelah ..."',
      '"sau bao nhiêu ... cuối cùng ..."',
      '「〜の末に」',
    ),
    example: '오랜 고민 끝에 결정했어요.',
    trans: L(
      'After much deliberation, I decided.',
      'Después de mucha reflexión, decidí.',
      'Au bout d’une longue réflexion, j’ai décidé.',
      'Após muita reflexão, decidi.',
      'หลังจากคิดอยู่นาน ฉันก็ตัดสินใจ',
      'Setelah lama berpikir, akhirnya saya memutuskan.',
      'Sau bao đắn đo, tôi đã quyết định.',
      '長い悩みの末に決めました。',
    ),
    deckId: 'topik-5',
  },

  // G230 · Literary "as soon as" (aux)
  {
    ko: '-자',
    meaning: L(
      '"as soon as ... (literary)" — narrative variant of -자마자',
      '"en cuanto (literario)" — variante narrativa de -자마자',
      '«à peine ... que / dès que (littéraire)»',
      '"assim que (literário)" — variante narrativa de -자마자',
      '"พอ ... ก็ (วรรณกรรม)" — ใช้ในเรื่องเล่า',
      '"begitu ... (sastrawi)"',
      '"vừa ... thì (văn chương)"',
      '「〜するや / 〜したとたん(文語)」',
    ),
    example: '그가 들어오자 모두가 일어났어요.',
    trans: L(
      'As soon as he came in, everyone stood up.',
      'En cuanto él entró, todos se levantaron.',
      'Dès qu’il est entré, tout le monde s’est levé.',
      'Assim que ele entrou, todos se levantaram.',
      'พอเขาเข้ามาทุกคนก็ลุกขึ้น',
      'Begitu dia masuk, semua orang berdiri.',
      'Vừa anh ấy bước vào, mọi người đều đứng lên.',
      '彼が入ってくるや、皆が立ち上がりました。',
    ),
    deckId: 'topik-5',
  },

  // G232 · After (emphatic, aux)
  {
    ko: '-고서',
    meaning: L(
      '"after (emphatic) ..." — stronger sequence than -고; near-synonym of -고 나서',
      '"después de (con énfasis) ..." — secuencia más fuerte que -고',
      '«après avoir ... (emphatique)»',
      '"depois de (com ênfase) ..." — sequência mais forte que -고',
      '"หลังจาก ... (เน้น)" — เน้นมากกว่า -고',
      '"setelah ... (penekanan)" — lebih kuat dari -고',
      '"sau khi ... (nhấn mạnh)" — mạnh hơn -고',
      '「〜してから(強調)」',
    ),
    example: '그 말을 듣고서 화가 났어요.',
    trans: L(
      'After hearing that, I got angry.',
      'Tras escuchar eso, me enojé.',
      'En entendant cela, je me suis fâché.',
      'Depois de ouvir isso, fiquei com raiva.',
      'พอได้ยินคำนั้นก็โกรธขึ้นมา',
      'Setelah mendengar itu, saya marah.',
      'Sau khi nghe câu đó tôi đã nổi giận.',
      'その言葉を聞いて腹が立ちました。',
    ),
    deckId: 'topik-5',
  },

  // G233 · Beyond the breaking point (aux)
  {
    ko: '-다 못해',
    meaning: L(
      '"to the point that one can no longer ..." — surpasses a limit',
      '"hasta el punto de no poder más / tanto que ya ..." — supera el límite',
      '«à ne plus pouvoir / au point que ...»',
      '"a ponto de não poder mais / tanto que já ..." — passa do limite',
      '"... จนทนไม่ไหว / ... จนสุด ..."',
      '"sampai tidak tahan / sampai-sampai ..."',
      '"đến mức không còn ... nữa / ... cùng cực ..."',
      '「〜きれず / 〜の極み」',
    ),
    example: '기다리다 못해 그냥 갔어요.',
    trans: L(
      'I couldn’t wait any longer, so I just left.',
      'De tanto esperar, terminé yéndome.',
      'À force d’attendre, je suis simplement parti.',
      'De tanto esperar, acabei indo embora.',
      'รอจนทนไม่ไหว เลยไปก่อน',
      'Sampai tidak tahan menunggu, akhirnya saya pergi saja.',
      'Đợi không nổi nữa, tôi đành bỏ đi.',
      '待ちきれず、もう帰りました。',
    ),
    deckId: 'topik-5',
  },

  // D013 · Because they say (indirect)
  {
    ko: '-다고 해서',
    meaning: L(
      '"because (they) say ..." — action based on second-hand information',
      '"porque (dicen) que ..." — actuar basado en información de terceros',
      '«parce qu’on dit que / comme on a dit que ...»',
      '"porque dizem que ..." — agir baseado em informação alheia',
      '"เพราะได้ยินว่า ..."',
      '"karena katanya ..."',
      '"vì nghe nói rằng ..."',
      '「〜だと言うので / 〜らしいので」',
    ),
    example: '그 식당이 맛있다고 해서 가 봤어요.',
    trans: L(
      'Since they said the restaurant was good, I went to try it.',
      'Como dicen que ese restaurante está rico, fui a probarlo.',
      'Comme on disait que ce restaurant était bon, j’y suis allé.',
      'Como diziam que o restaurante era bom, fui experimentar.',
      'เพราะได้ยินว่าร้านอร่อย เลยไปลอง',
      'Karena katanya restorannya enak, saya coba ke sana.',
      'Vì nghe nói nhà hàng đó ngon, tôi đã đến thử.',
      'あの店が美味しいと言うので、行ってみました。',
    ),
    deckId: 'topik-5',
  },

  // D014 · Even if they say (indirect)
  {
    ko: '-다고 해도',
    meaning: L(
      '"even if (they) say ..." — concession over reported information',
      '"aunque digan que ..." — concesión sobre información reportada',
      '«même si on dit que ...»',
      '"mesmo que digam que ..." — concessão sobre informação alheia',
      '"แม้จะบอกว่า ... ก็ ..."',
      '"meskipun (orang) bilang ..., tetap ..."',
      '"dù có nói rằng ... thì cũng ..."',
      '「〜だと言われても」',
    ),
    example: '비싸다고 해도 사야 해요.',
    trans: L(
      'Even if they say it’s expensive, I have to buy it.',
      'Aunque digan que es caro, tengo que comprarlo.',
      'Même si on dit que c’est cher, je dois l’acheter.',
      'Mesmo que digam que é caro, preciso comprar.',
      'แม้จะบอกว่าแพงก็ต้องซื้อ',
      'Meskipun katanya mahal, tetap harus dibeli.',
      'Dù có nói là đắt thì tôi cũng phải mua.',
      '高いと言われても買わなければなりません。',
    ),
    deckId: 'topik-5',
  },

  // D015 · The fact that ... (indirect)
  {
    ko: '-다는 게',
    meaning: L(
      '"the (very) fact of being said to ..." — nominalized indirect quote',
      '"lo de que / el hecho de que ..." — cita indirecta nominalizada',
      '«le fait de dire que / le fait que ...»',
      '"o fato de (dizerem) que ..." — citação nominalizada',
      '"การที่บอกว่า ... / เรื่องที่ว่า ..."',
      '"hal bahwa / kenyataan bahwa ..."',
      '"việc bảo rằng ... / chuyện rằng ..."',
      '「〜ということ(が)」— 引用名詞化',
    ),
    example: '결혼한다는 것은 큰 결정이에요.',
    trans: L(
      'Getting married is a big decision.',
      'Lo de casarse es una gran decisión.',
      'Se marier, c’est une grande décision.',
      'Casar-se é uma grande decisão.',
      'การแต่งงานเป็นการตัดสินใจครั้งใหญ่',
      'Keputusan menikah itu besar.',
      'Việc kết hôn là một quyết định lớn.',
      '結婚するというのは大きな決断です。',
    ),
    deckId: 'topik-5',
  },

  // D016 · Reported information extensions (indirect)
  {
    ko: '-다는데 / -다더라 / -다더니',
    meaning: L(
      '"they say ..., but / I heard that ... / it was said that ... and indeed ..." — combos of indirect + context',
      '"dicen que ..., pero / oí que ... / decían que ... y resultó que ..." — combinaciones del indirecto',
      '«on dit que ... mais / on m’a dit que ... / on disait que ..., et effectivement ...»',
      '"dizem que ..., mas / ouvi que ... / diziam que ... e de fato ..."',
      '"ได้ยินว่า ... แต่ / เขาเล่าว่า ... / เคยว่ากันว่า ... ก็เป็นจริง ..."',
      '"katanya ... tetapi / saya dengar ... / sempat dibilang ..., dan memang ..."',
      '"nghe nói ... mà / nghe đồn ... / trước nói ... và quả nhiên ..."',
      '間接話法の拡張「〜だそうだけど / 〜だってさ / 〜と言っていたが」',
    ),
    example: '친구가 아프다는데 병문안 갈까요?',
    trans: L(
      'I heard my friend is sick — shall we visit?',
      'Mi amigo dice que está enfermo, ¿vamos a visitarlo?',
      'On m’a dit que mon ami est malade, on va le voir ?',
      'Disseram que meu amigo está doente, vamos visitá-lo?',
      'ได้ยินว่าเพื่อนป่วย ไปเยี่ยมกันไหม',
      'Katanya teman saya sakit, mau jenguk?',
      'Nghe nói bạn tôi ốm, mình đi thăm nhé?',
      '友達が病気だそうだけど、お見舞いに行きますか？',
    ),
    deckId: 'topik-5',
  },

  // D017 · Indirect + uncertainty (indirect)
  {
    ko: '-다고 할까 봐 / -다고 할 줄 알았다',
    meaning: L(
      '"in case they’d say ... / I thought they’d say ..." — anticipation of reported speech',
      '"por miedo a que digan ... / pensé que dirían que ..." — anticipo del discurso ajeno',
      '«de peur qu’on dise / je pensais qu’on dirait que ...»',
      '"com medo de que digam ... / achei que diriam que ..."',
      '"กลัวว่าจะบอกว่า ... / คิดว่าเขาจะบอกว่า ..."',
      '"khawatir akan dikatakan ... / saya pikir dia akan bilang ..."',
      '"sợ rằng người ấy sẽ nói ... / tôi tưởng họ sẽ nói ..."',
      '「〜と言うかと思って / 〜と言うだろうと思った」',
    ),
    example: '모른다고 할까 봐 대답을 준비했어요.',
    trans: L(
      'I prepared an answer in case they’d say I didn’t know.',
      'Preparé una respuesta por miedo a que dijera que no sabía.',
      'J’ai préparé une réponse de peur qu’on dise que je ne savais pas.',
      'Preparei uma resposta com medo de que dissessem que eu não sabia.',
      'เตรียมคำตอบไว้ กลัวว่าจะบอกว่าฉันไม่รู้',
      'Saya siapkan jawaban, khawatir bilang saya tidak tahu.',
      'Tôi chuẩn bị câu trả lời, sợ rằng sẽ bảo tôi không biết.',
      '知らないと言われると思って答えを用意しました。',
    ),
    deckId: 'topik-5',
  },

  // G236 · I wonder if (additional)
  {
    ko: '-(으)ㄹ까 싶다',
    meaning: L(
      '"I wonder if / I’m thinking of ..." — inner doubt or vacillating plan',
      '"me pregunto si / estoy pensando en ..." — duda interior o plan vacilante',
      '«je me demande si / je pense à ...»',
      '"fico pensando se / estou pensando em ..." — dúvida interior',
      '"สงสัยว่า ... / กำลังคิดว่าจะ ..."',
      '"berpikir-pikir mungkin / ragu-ragu apakah ..."',
      '"tự hỏi liệu / đang nghĩ rằng ..."',
      '「〜かと思う / 〜ようかと迷う」',
    ),
    example: '한국에 갈까 싶어요.',
    trans: L(
      'I’m thinking of going to Korea.',
      'Estoy pensando en ir a Corea.',
      'Je me dis que j’irais bien en Corée.',
      'Estou pensando em ir para a Coreia.',
      'กำลังคิดว่าจะไปเกาหลี',
      'Saya sedang pikir-pikir mau ke Korea.',
      'Tôi đang nghĩ chắc sẽ đi Hàn Quốc.',
      '韓国に行こうかと思います。',
    ),
    deckId: 'topik-5',
  },

  // G237 · I suppose (moderate, additional)
  {
    ko: '-지 싶다',
    meaning: L(
      '"I suppose / I’d say ..." — moderate, reflective supposition',
      '"creo / me parece que ..." — suposición moderada y reflexiva',
      '«je suppose que / je dirais que ...»',
      '"acho / me parece que ..." — suposição moderada',
      '"คิดว่า ... (เบา ๆ ครุ่นคิด)"',
      '"saya rasa / kiranya ..."',
      '"tôi nghĩ rằng / có lẽ ..."',
      '「〜だろうと思う / 〜だと思う」— 控えめな推測',
    ),
    example: '비가 오겠지 싶어요.',
    trans: L(
      'I think it will probably rain.',
      'Creo que va a llover.',
      'Je suppose qu’il va pleuvoir.',
      'Acho que vai chover.',
      'คิดว่าฝนน่าจะตก',
      'Saya rasa nanti hujan.',
      'Tôi nghĩ là trời sẽ mưa.',
      '雨が降るだろうと思います。',
    ),
    deckId: 'topik-5',
  },

  // G238 · Seems (formal, additional)
  {
    ko: '-(으)ㄴ/는 듯하다 / 듯싶다',
    meaning: L(
      '"it seems / it appears ..." — written/literary form of -것 같다',
      '"parece (formal/escrito) ..." — forma escrita/literaria de -것 같다',
      '«il semble que / il paraît que (écrit)»',
      '"parece (formal/literário) ..."',
      '"ดูเหมือนว่า ... (ทางการ/วรรณกรรม)"',
      '"tampaknya / kelihatannya ... (formal/sastrawi)"',
      '"có vẻ / xem chừng ... (văn viết)"',
      '「〜ようだ / 〜らしい(文語)」',
    ),
    example: '그분은 이미 알고 있는 듯해요.',
    trans: L(
      'It appears that they already know.',
      'Esa persona parece ya saberlo.',
      'Il semble qu’il/elle le sache déjà.',
      'Parece que ele/ela já sabe.',
      'ดูเหมือนว่าท่านนั้นจะรู้อยู่แล้ว',
      'Tampaknya beliau sudah tahu.',
      'Xem chừng người ấy đã biết rồi.',
      'あの方はすでに知っているようです。',
    ),
    deckId: 'topik-5',
  },

  // G239 · Inner question (additional)
  {
    ko: '-(으)ㄴ가 싶다',
    meaning: L(
      '"I wonder whether ..." — inner question, reflective',
      '"me pregunto si será que ..." — pregunta interior reflexiva',
      '«je me demande si ce ne serait pas ...»',
      '"será que ..." — pergunta interior reflexiva',
      '"สงสัยว่า ... จริงหรือเปล่า"',
      '"jangan-jangan ... / mungkinkah ..."',
      '"không biết có phải ... không"',
      '「〜のだろうか / 〜のかなと思う」',
    ),
    example: '너무 늦은 건가 싶어요.',
    trans: L(
      'I wonder if it’s already too late.',
      'Me pregunto si no será demasiado tarde.',
      'Je me demande s’il n’est pas trop tard.',
      'Será que já é tarde demais?',
      'สงสัยว่ามันสายเกินไปหรือเปล่า',
      'Jangan-jangan sudah terlalu terlambat.',
      'Không biết có phải đã quá muộn không.',
      'もう遅すぎるのではないかと思います。',
    ),
    deckId: 'topik-5',
  },

  // G242 · Formal nominalization (additional)
  {
    ko: '-(으)ㅁ',
    meaning: L(
      'formal nominalization — produces an abstract noun; common in titles, notes, academic writing',
      'nominalización formal — sustantivo abstracto; común en títulos, notas y escritura académica',
      'nominalisation formelle — nom abstrait; titres, notes, écrits académiques',
      'nominalização formal — substantivo abstrato; títulos, notas, acadêmico',
      'การทำให้เป็นนามแบบทางการ — ใช้ในหัวข้อ บันทึก งานวิชาการ',
      'nominalisasi formal — kata benda abstrak; judul / catatan / akademik',
      'danh hóa trang trọng — danh từ trừu tượng; tiêu đề, ghi chú, học thuật',
      '「〜こと → 〜（さ・み）」名詞化(改まり)',
    ),
    example: '행복함을 느껴요.',
    trans: L(
      'I feel happiness.',
      'Siento felicidad.',
      'Je ressens du bonheur.',
      'Sinto felicidade.',
      'รู้สึกถึงความสุข',
      'Saya merasakan kebahagiaan.',
      'Tôi cảm thấy hạnh phúc.',
      '幸せを感じます。',
    ),
    deckId: 'topik-5',
  },

  // G243 · Comparison of nominalizations (additional, meta)
  {
    ko: '명사화 비교 (-기 / -(으)ㅁ / -는 것)',
    meaning: L(
      'compares the 3 nominalizers — colloquial -는 것, active -기, formal -(으)ㅁ',
      'compara las 3 nominalizaciones — cotidiana -는 것, activa -기, formal -(으)ㅁ',
      'compare les 3 nominaliseurs — oral -는 것, actif -기, formel -(으)ㅁ',
      'compara as 3 nominalizações — cotidiana -는 것, ativa -기, formal -(으)ㅁ',
      'เปรียบเทียบรูปนามทั้ง 3 — พูดทั่วไป -는 것, กริยา -기, ทางการ -(으)ㅁ',
      'membandingkan 3 nominalisasi — lisan -는 것, aktif -기, formal -(으)ㅁ',
      'so sánh 3 cách danh hóa — nói -는 것, hành động -기, trang trọng -(으)ㅁ',
      '名詞化3形式の比較: -는 것(口語) / -기(動作) / -(으)ㅁ(改まり)',
    ),
    example: '한국어 공부하는 것이 재미있어요. (cotidiano) / 한국어 공부하기가 어려워요. (énfasis acción)',
    trans: L(
      'Studying Korean is fun. (casual) / Studying Korean is hard. (action focus)',
      'Estudiar coreano es divertido. (cotidiano) / Estudiar coreano es difícil. (foco en acción)',
      'Étudier le coréen est amusant. (oral) / Étudier le coréen est difficile. (action)',
      'Estudar coreano é divertido. (cotidiano) / Estudar coreano é difícil. (foco na ação)',
      'การเรียนภาษาเกาหลีสนุก (พูดทั่วไป) / การเรียนภาษาเกาหลียาก (เน้นการกระทำ)',
      'Belajar bahasa Korea menyenangkan. (lisan) / Belajar bahasa Korea sulit. (fokus aksi)',
      'Học tiếng Hàn rất vui. (đời thường) / Học tiếng Hàn rất khó. (nhấn vào hành động)',
      '韓国語を勉強することが楽しい(口語) / 韓国語の勉強が難しい(動作焦点)。',
    ),
    deckId: 'topik-5',
  },

  // G245 · For / regarding action (additional)
  {
    ko: '-(으)ㄴ/는 데에',
    meaning: L(
      '"for / when it comes to ...ing ..." — frequently with 도움이 되다, 필요하다, 걸리다',
      '"para / en cuanto a hacer ..." — frecuente con 도움이 되다, 필요하다, 걸리다',
      '«pour / quand il s’agit de ...» — souvent avec 도움이 되다, 필요하다, 걸리다',
      '"para / quando se trata de fazer ..." — comum com 도움이 되다, 필요하다, 걸리다',
      '"ในการ ... / สำหรับการ ..." — มักใช้กับ 도움이 되다, 필요하다, 걸리다',
      '"untuk / dalam hal ...-ing" — sering dengan 도움이 되다 dll.',
      '"trong việc / để ...-ing" — thường với 도움이 되다 v.v.',
      '「〜するのに(役立つ / 必要だ / かかる)」',
    ),
    example: '이 책이 공부하는 데에 도움이 돼요.',
    trans: L(
      'This book is helpful for studying.',
      'Este libro es útil para estudiar.',
      'Ce livre est utile pour étudier.',
      'Este livro ajuda nos estudos.',
      'หนังสือเล่มนี้มีประโยชน์ในการเรียน',
      'Buku ini bermanfaat untuk belajar.',
      'Cuốn sách này hữu ích cho việc học.',
      'この本は勉強するのに役立ちます。',
    ),
    deckId: 'topik-5',
  },

  // G246 · Even if just (humble, additional)
  {
    ko: '-(이)나마 / -(으)나마',
    meaning: L(
      '"even if just / however small ..." — humble, polite concession',
      '"aunque solo sea / por modesto que sea ..." — concesión humilde',
      '«même modeste / si humble que ce soit»',
      '"mesmo que pequeno / por modesto que seja ..."',
      '"แม้จะ ... เล็กน้อย ก็ ... (สุภาพ ถ่อมตน)"',
      '"meskipun sedikit ... (santun, rendah hati)"',
      '"dẫu chỉ ... (khiêm tốn)"',
      '「〜なりとも / 〜とはいえ(控えめ)」',
    ),
    example: '작은 도움이나마 되었으면 합니다.',
    trans: L(
      'I hope I’ve been at least a small help.',
      'Espero que haya sido de ayuda, aunque sea pequeña.',
      'J’espère avoir été d’une aide, si modeste soit-elle.',
      'Espero que tenha sido de ajuda, ainda que pequena.',
      'หวังว่าจะเป็นความช่วยเหลือ แม้เพียงเล็กน้อย',
      'Semoga bisa membantu, walau sedikit.',
      'Mong rằng dù chỉ giúp được chút ít cũng có ích.',
      '小さな助けなりとも、お役に立てればと思います。',
    ),
    deckId: 'topik-5',
  },

  // G247 · Worse than (additional)
  {
    ko: '-느니만 못하다',
    meaning: L(
      '"is worse than (doing) ..." — comparative inferiority',
      '"es peor que / ni siquiera vale como ..." — inferioridad comparativa',
      '«vaut moins que / pire que»',
      '"é pior do que / nem chega a ..."',
      '"แย่กว่า ... / ไม่ดีเท่า ..."',
      '"lebih buruk daripada / tidak setara dengan ..."',
      '"còn tệ hơn ... / không bằng ..."',
      '「〜するよりむしろ悪い」',
    ),
    example: '그렇게 할 거면 안 하느니만 못해요.',
    trans: L(
      'If you’re going to do it like that, it’s worse than not doing it.',
      'Si lo vas a hacer así, es peor que no hacerlo.',
      'Si tu le fais comme ça, mieux vaudrait ne pas le faire.',
      'Se vai fazer assim, é pior do que não fazer.',
      'ถ้าจะทำแบบนั้น สู้ไม่ทำเสียดีกว่า',
      'Kalau begitu caranya, lebih baik tidak usah.',
      'Nếu làm kiểu đó thì thà không làm còn hơn.',
      'そんな風にするくらいなら、しない方がましです。',
    ),
    deckId: 'topik-5',
  },

  // G248 · Counterfactual past (literary, additional)
  {
    ko: '-았/었던들',
    meaning: L(
      '"if (only) one had ..." — literary counterfactual past (cf. G181 -았/었더라면)',
      '"si (solo) hubiera ..." — contrafactual pasado literario (cf. G181)',
      '«si seulement on avait ...» — irréel littéraire (cf. G181)',
      '"se ao menos tivesse ..." — contrafactual literário (cf. G181)',
      '"ถ้าตอนนั้น ... (วรรณกรรม)" — เทียบ G181',
      '"andai dulu pernah ... (sastrawi)"',
      '"giá mà đã ... (văn chương)"',
      '「〜ていたなら(文語)」— G181 の文語形',
    ),
    example: '그때 더 노력했던들 후회가 없었을 텐데요.',
    trans: L(
      'If I had only tried harder back then, I wouldn’t have regrets.',
      'Si me hubiera esforzado más en ese momento, no tendría arrepentimientos.',
      'Si seulement j’avais fait plus d’efforts à l’époque, je n’aurais pas de regrets.',
      'Se eu tivesse me esforçado mais, não teria arrependimentos.',
      'หากตอนนั้นพยายามมากกว่านี้ คงไม่ต้องเสียใจ',
      'Andai dulu lebih berusaha, pasti tidak ada penyesalan.',
      'Giá hồi ấy nỗ lực hơn thì giờ đã không hối tiếc.',
      'あのときもっと努力していたなら、後悔はなかったでしょうに。',
    ),
    deckId: 'topik-5',
  },

  // G249 · Not a moment to (additional)
  {
    ko: '-(으)ㄹ 새(도) 없이',
    meaning: L(
      '"without a moment to (even) ..." — extreme lack of time',
      '"sin tiempo ni para ..." — falta extrema de tiempo',
      '«sans avoir le temps de ...»',
      '"sem tempo nem para ..."',
      '"ไม่มีเวลาแม้แต่จะ ..."',
      '"tanpa sempat sekalipun untuk ..."',
      '"không có cả lúc nào để ..."',
      '「〜する暇もなく」',
    ),
    example: '숨 쉴 새도 없이 바빠요.',
    trans: L(
      'I’m so busy I don’t even have a moment to breathe.',
      'Estoy tan ocupado que no tengo ni tiempo para respirar.',
      'Je suis tellement occupé que je n’ai pas même le temps de respirer.',
      'Estou tão ocupado que não tenho tempo nem para respirar.',
      'ยุ่งจนหายใจไม่ทัน',
      'Sibuk sampai tidak sempat menarik napas.',
      'Bận đến mức không có cả thời gian để thở.',
      '息をつく暇もなく忙しいです。',
    ),
    deckId: 'topik-5',
  },

  // G251 · Comparison of "as soon as" (additional, meta)
  {
    ko: '즉시 표현 비교 (-자마자 / -는 대로 / -자 / -는 즉시)',
    meaning: L(
      'compares 4 "as soon as" expressions by register and nuance',
      'compara 4 expresiones de "en cuanto" por registro y matiz',
      'compare 4 expressions de «dès que» selon le registre',
      'compara 4 expressões de "assim que" por registro e nuance',
      'เปรียบเทียบ 4 สำนวน "ทันทีที่" ตามระดับและความหมาย',
      'membandingkan 4 ungkapan "begitu / segera" menurut register',
      'so sánh 4 cách diễn đạt "ngay khi" theo phong cách',
      '即時表現4種の比較: -자마자(中立) / -는 대로(可能になり次第) / -자(文語) / -는 즉시(改まり)',
    ),
    example: '도착하자마자 전화하세요. (cotidiano) / 도착하는 즉시 출발하세요. (formal)',
    trans: L(
      'Call as soon as you arrive. (casual) / Depart immediately upon arrival. (formal)',
      'Llame en cuanto llegue. (cotidiano) / Parta inmediatamente al llegar. (formal)',
      'Appelle dès ton arrivée. (oral) / Partez dès votre arrivée. (formel)',
      'Ligue assim que chegar. (cotidiano) / Saia imediatamente ao chegar. (formal)',
      'พอถึงให้โทรเลย (พูดทั่วไป) / เมื่อถึงให้ออกเดินทางทันที (ทางการ)',
      'Telepon begitu sampai. (sehari-hari) / Berangkat segera setelah tiba. (formal)',
      'Đến nơi là gọi ngay nhé. (đời thường) / Xin khởi hành ngay khi đến. (trang trọng)',
      '着いたらすぐ電話してください。(口語) / 到着次第出発してください。(改まり)',
    ),
    deckId: 'topik-5',
  },

  // G254 · Even if it means (extreme determination, additional)
  {
    ko: '-(으)ㄴ/는 한이 있어도',
    meaning: L(
      '"even if it means ..." — extreme determination at any cost',
      '"aunque tenga que / aun a costa de ..." — determinación extrema',
      '«quitte à ... / au prix de ...»',
      '"mesmo que tenha de / ainda que ao custo de ..."',
      '"ต่อให้ต้อง ... ก็ ..." — เด็ดเดี่ยวสุดขั้ว',
      '"meskipun harus ..., tetap ..."',
      '"dù có phải ... cũng ..."',
      '「〜することがあっても」— 強い覚悟',
    ),
    example: '굶는 한이 있어도 그 돈은 안 받아요.',
    trans: L(
      'Even if I starve, I won’t take that money.',
      'Aunque tenga que pasar hambre, no aceptaré ese dinero.',
      'Quitte à mourir de faim, je ne prendrai pas cet argent.',
      'Mesmo que eu passe fome, não aceito esse dinheiro.',
      'ต่อให้ต้องอดอยาก ก็ไม่รับเงินนั้น',
      'Walau harus kelaparan, saya tidak akan menerima uang itu.',
      'Dù có phải nhịn đói, tôi cũng không nhận số tiền đó.',
      '飢えることがあっても、あのお金は受け取りません。',
    ),
    deckId: 'topik-5',
  },

  // G257 · Supposedly (ironic, additional)
  {
    ko: '-답시고',
    meaning: L(
      '"supposedly / under the pretext of ..." — ironic, critical',
      '"bajo el pretexto de / supuestamente porque ..." — irónico, crítico',
      '«sous prétexte que / soi-disant ...»',
      '"sob o pretexto de / supostamente porque ..." — irônico',
      '"อ้างว่า ... / แสร้งทำว่า ... (ประชด)"',
      '"katanya / dengan dalih ... (sindiran)"',
      '"viện cớ ... / lấy lý do ... (mỉa mai)"',
      '「〜のつもりで(揶揄)」',
    ),
    example: '도와준답시고 더 일을 만들었어요.',
    trans: L(
      'Supposedly helping, they only created more work.',
      'Bajo el pretexto de ayudar, creó más trabajo.',
      'Sous prétexte d’aider, il/elle a créé plus de travail.',
      'Sob o pretexto de ajudar, criou mais trabalho.',
      'อ้างว่าจะช่วย กลับทำให้งานเพิ่ม',
      'Dengan dalih membantu, malah menambah pekerjaan.',
      'Viện cớ giúp, nhưng làm việc thêm phần rối.',
      '手伝うつもりで、かえって仕事を増やしました。',
    ),
    deckId: 'topik-5',
  },

  // G259 · Either ... or (quoted, additional)
  {
    ko: '-(으)ㄴ/는다거나',
    meaning: L(
      '"either say ... or say ..." — alternative quoted opinions or actions',
      '"ya sea que diga ... o ..." — citas alternativas',
      '«qu’on dise ... ou ...»',
      '"seja dizendo ... ou ..." — alternativas citadas',
      '"ทั้งบอกว่า ... และบอกว่า ..."',
      '"ada yang bilang ... ada yang ..."',
      '"hoặc nói ... hoặc nói ..."',
      '間接 + 「〜たり〜たり」— 引用の選択',
    ),
    example: '좋다고 한다거나 싫다고 한다거나 의견이 분분해요.',
    trans: L(
      'Some say they like it, others say they don’t — opinions are split.',
      'Hay opiniones divididas, unos dicen que les gusta, otros que no.',
      'Les avis sont partagés : certains disent qu’ils aiment, d’autres pas.',
      'As opiniões estão divididas: uns dizem que gostam, outros que não.',
      'ความเห็นแตกต่าง บ้างก็ว่าชอบ บ้างก็ว่าไม่ชอบ',
      'Pendapatnya beragam, ada yang suka ada yang tidak.',
      'Có người bảo thích, có người bảo không, ý kiến chia rẽ.',
      '良いと言ったり嫌だと言ったり、意見が分かれています。',
    ),
    deckId: 'topik-5',
  },

  // G265 · Formal "and / while" (complementary)
  {
    ko: '-(으)며',
    meaning: L(
      '"and / while ... (formal / written)" — listing or simultaneity in formal writing',
      '"y / mientras ... (formal/escrito)" — enumeración o simultaneidad formal',
      '«et / tout en ... (formel / écrit)»',
      '"e / enquanto ... (formal / escrito)"',
      '"และ / ในขณะที่ ... (ทางการ/เขียน)"',
      '"dan / sembari ... (formal / tulis)"',
      '"và / đồng thời ... (trang trọng / viết)"',
      '「〜し / 〜ながら(改まり / 文章語)」',
    ),
    example: '이 제품은 가격이 저렴하며 품질도 좋습니다.',
    trans: L(
      'This product is affordable and also of good quality.',
      'Este producto es económico y además tiene buena calidad.',
      'Ce produit est à la fois abordable et de bonne qualité.',
      'Este produto é barato e também tem boa qualidade.',
      'สินค้าตัวนี้ราคาประหยัด และคุณภาพยังดีอีกด้วย',
      'Produk ini harganya murah, kualitasnya pun bagus.',
      'Sản phẩm này giá rẻ, đồng thời chất lượng tốt.',
      'この製品は価格が安く、品質も良いです。',
    ),
    deckId: 'topik-5',
  },

  // G266 · Alternating actions (complementary)
  {
    ko: '-(으)며 -(으)며',
    meaning: L(
      '"now ... now ... / alternating between two actions" — listing alternations',
      '"unas veces ... otras veces ..." — enumeración alternativa',
      '«tantôt ... tantôt ...»',
      '"ora ... ora ..." — enumeração alternada',
      '"ทั้ง ... ทั้ง ... สลับกัน"',
      '"sambil ... sambil ... bergantian"',
      '"vừa ... vừa ... xen kẽ"',
      '「〜ながら〜ながら / 〜たり〜たり」',
    ),
    example: '웃으며 울며 이야기했어요.',
    trans: L(
      'They told the story between laughs and tears.',
      'Hablaron entre risas y llantos.',
      'Ils ont raconté entre rires et larmes.',
      'Contaram entre risos e lágrimas.',
      'พวกเขาเล่าเรื่องไปร้องไห้ไปยิ้มไป',
      'Mereka bercerita sambil tertawa dan menangis.',
      'Họ vừa cười vừa khóc kể chuyện.',
      '笑ったり泣いたりしながら話しました。',
    ),
    deckId: 'topik-5',
  },

  // G267 · Literary "but" (complementary)
  {
    ko: '-(으)나',
    meaning: L(
      '"but / although ..." — literary/formal version of -지만',
      '"pero / aunque (literario/formal)" — versión literaria de -지만',
      '«mais / quoique (littéraire/formel)»',
      '"mas / embora (literário/formal)"',
      '"แต่ / แม้ว่า (ทางการ/วรรณกรรม)"',
      '"tetapi / meskipun (formal/sastrawi)"',
      '"nhưng / dù (trang trọng / văn chương)"',
      '「〜が / 〜けれども(文語)」',
    ),
    example: '노력은 했으나 결과가 좋지 않았다.',
    trans: L(
      'I made the effort, but the result was not good.',
      'Hice el esfuerzo, pero los resultados no fueron buenos.',
      'J’ai fait des efforts, mais le résultat n’était pas bon.',
      'Fiz o esforço, mas o resultado não foi bom.',
      'พยายามแล้ว แต่ผลลัพธ์ไม่ดี',
      'Sudah berusaha, tetapi hasilnya tidak baik.',
      'Tôi đã cố gắng nhưng kết quả không tốt.',
      '努力はしたが、結果が良くなかった。',
    ),
    deckId: 'topik-5',
  },

  // G270 · Insist on / be set on (complementary)
  {
    ko: '-(으)려고 들다',
    meaning: L(
      '"insist on / be set on ...ing ..." — usually with critical / annoyed tone',
      '"empeñarse en / insistir en ..." — con tono crítico o de fastidio',
      '«s’entêter à / s’acharner à ...»',
      '"insistir em / fazer questão de ..." — com tom crítico',
      '"จะ ... ให้ได้ / ดันทุรัง ..." — เชิงตำหนิ',
      '"ngotot mau ... / memaksakan diri ..."',
      '"khăng khăng ... / cố gắng ép ..."',
      '「〜しようとする / 〜したがる(批判)」',
    ),
    example: '자꾸 싸우려고 들어요.',
    trans: L(
      'They keep insisting on picking a fight.',
      'No para de buscar pelea.',
      'Il/elle ne cesse de chercher la dispute.',
      'Vive querendo arrumar briga.',
      'เอาแต่จะหาเรื่องทะเลาะ',
      'Maunya bertengkar terus.',
      'Cứ khăng khăng đòi gây gổ.',
      '何かにつけて喧嘩しようとします。',
    ),
    deckId: 'topik-5',
  },

  // G271 · Easy to end up (complementary)
  {
    ko: '-기 십상이다',
    meaning: L(
      '"is likely to (negatively) end up ..." — high probability, usually bad',
      '"es muy fácil que termine en / es propenso a ..." — probabilidad alta, usualmente mala',
      '«risque fort de / a vite fait de» — issue souvent négative',
      '"facilmente termina em ..." — geralmente negativo',
      '"มีโอกาสสูงที่จะ ... (ทางลบ)"',
      '"mudah berakhir dengan ... (biasanya buruk)"',
      '"dễ kết cục là ... (thường tiêu cực)"',
      '「〜しがちだ / 〜するのがおち」',
    ),
    example: '그렇게 운전하면 사고 나기 십상이에요.',
    trans: L(
      'Driving like that, you’re bound to have an accident.',
      'Conduciendo así es fácil que tengas un accidente.',
      'À conduire comme ça, on a vite fait d’avoir un accident.',
      'Dirigindo assim, é fácil acabar em acidente.',
      'ขับแบบนั้นมีโอกาสเกิดอุบัติเหตุสูง',
      'Kalau menyetir begitu, mudah saja kecelakaan.',
      'Lái xe kiểu đó dễ gặp tai nạn lắm.',
      'そんな運転をしていると、事故を起こしがちです。',
    ),
    deckId: 'topik-5',
  },

  // G272 · Treat as if (complementary)
  {
    ko: '-(으)ㄴ/는 셈 치다',
    meaning: L(
      '"treat as if it were ... / let’s say ..." — accept a fiction for the sake of moving on',
      '"considerar como si fuera ..." — aceptar una ficción para seguir adelante',
      '«considérer comme si ...»',
      '"considerar como se fosse ..." — aceitar uma ficção',
      '"ถือว่า ... / นับว่าเป็น ..."',
      '"anggap saja ... / dianggap seolah ..."',
      '"coi như là ... / xem như ..."',
      '「〜したことにする / 〜つもりで」',
    ),
    example: '잃어버린 셈 치고 그냥 잊어버려요.',
    trans: L(
      'Treat it as if you’d lost it and just forget about it.',
      'Considéralo como si lo hubieras perdido y olvídate.',
      'Considère-le comme perdu et oublie-le.',
      'Considere como se tivesse perdido e esqueça.',
      'ถือว่าหายไป แล้วลืม ๆ มันไปซะ',
      'Anggap saja sudah hilang dan lupakan.',
      'Coi như đã mất rồi quên đi.',
      'なくしたつもりで、もう忘れましょう。',
    ),
    deckId: 'topik-5',
  },

  // G273 · About to but not quite (complementary)
  {
    ko: '-(으)ㄹ락 말락 하다',
    meaning: L(
      '"on the verge of but not quite ..." — wavering, almost happening',
      '"estar a punto de pero sin llegar ..." — vacilante',
      '«être sur le point de ... sans tout à fait ...»',
      '"prestes a / quase ..., mas não chegar ..."',
      '"จะ ... ก็ไม่ค่อย ... / เกือบ ... แต่ไม่"',
      '"hampir ... tetapi tidak ..."',
      '"chực ... mà không hẳn ..."',
      '「〜しそうで〜しない / 〜たり〜なかったり」',
    ),
    example: '잠이 들락 말락 했어요.',
    trans: L(
      'I was drifting between sleep and waking.',
      'Estaba entre dormido y despierto.',
      'J’étais entre veille et sommeil.',
      'Estava entre dormindo e acordado.',
      'อยู่ระหว่างหลับกับตื่น',
      'Saya berada antara tidur dan terjaga.',
      'Tôi ở giữa cơn mơ và tỉnh.',
      '寝るか寝ないかという状態でした。',
    ),
    deckId: 'topik-5',
  },

  // G274 · Half-heartedly (complementary)
  {
    ko: '-는 둥 마는 둥',
    meaning: L(
      '"doing X half-heartedly / barely doing X ..." — superficial, without commitment',
      '"haciéndolo a medias / sin ganas ..." — superficial, sin compromiso',
      '«à moitié / sans conviction»',
      '"fazendo pela metade / sem vontade ..."',
      '"ทำแบบขอไปที / ทำไม่ใส่ใจ"',
      '"setengah hati / sambil lalu"',
      '"qua loa / cho có lệ"',
      '「〜たり〜なかったり / うわのそらで」',
    ),
    example: '아침을 먹는 둥 마는 둥 했어요.',
    trans: L(
      'I barely ate any breakfast.',
      'Desayuné a medias, casi sin desayunar.',
      'J’ai mangé mon petit-déjeuner du bout des lèvres.',
      'Mal toquei no café da manhã.',
      'กินอาหารเช้าไม่กี่คำก็เลิก',
      'Sarapan setengah hati saja.',
      'Tôi ăn sáng qua loa cho có.',
      '朝食を食べたり食べなかったりするような感じでした。',
    ),
    deckId: 'topik-5',
  },

  // G275 · Depending on whether (complementary)
  {
    ko: '-느냐에 따라(서)',
    meaning: L(
      '"depending on whether / how ..." — outcome hinges on a question',
      '"dependiendo de si / cómo ..." — el resultado depende de la respuesta',
      '«selon que ... / selon le fait de ...»',
      '"dependendo de se / de como ..."',
      '"ขึ้นอยู่กับว่า ..."',
      '"tergantung apakah / bagaimana ..."',
      '"tùy theo việc ... có / không / như thế nào ..."',
      '「〜かどうかによって / 〜次第で」',
    ),
    example: '어떻게 준비하느냐에 따라 결과가 달라져요.',
    trans: L(
      'The result varies depending on how you prepare.',
      'Los resultados varían según cómo se prepare uno.',
      'Le résultat varie selon la façon dont on se prépare.',
      'Os resultados mudam dependendo de como você se prepara.',
      'ผลลัพธ์เปลี่ยนไปตามวิธีการเตรียมตัว',
      'Hasilnya berbeda tergantung cara persiapan.',
      'Kết quả thay đổi tùy theo cách chuẩn bị.',
      'どう準備するかによって結果が変わります。',
    ),
    deckId: 'topik-5',
  },

  // G276 · In the midst of (complementary)
  {
    ko: '-(으)ㄴ/는 가운데',
    meaning: L(
      '"in the midst of / amid ..." — formal contextual envelope',
      '"en medio de / mientras ..." — contexto envolvente formal',
      '«au milieu de / dans le contexte de ...»',
      '"em meio a / no meio de ..." — contexto formal',
      '"ท่ามกลาง ... / ภายใต้ ..."',
      '"di tengah ... / di tengah-tengah ..."',
      '"giữa ... / trong bối cảnh ..."',
      '「〜中で / 〜中(なか)を」(改まり)',
    ),
    example: '많은 사람들이 지켜보는 가운데 행사가 진행됐어요.',
    trans: L(
      'The event proceeded amid many onlookers.',
      'El evento se realizó en medio de la mirada de mucha gente.',
      'L’événement s’est déroulé sous le regard de nombreux spectateurs.',
      'O evento ocorreu em meio à atenção de muita gente.',
      'งานจัดขึ้นท่ามกลางสายตาของผู้คนมากมาย',
      'Acara berlangsung di tengah pandangan banyak orang.',
      'Buổi lễ diễn ra giữa sự dõi theo của nhiều người.',
      '多くの人が見守る中、イベントが行われました。',
    ),
    deckId: 'topik-5',
  },

  // G279 · Humble see (complementary)
  {
    ko: '-아/어 뵙다 / 봬요',
    meaning: L(
      'humble/honorific of -아/어 보다 — for showing humility before superiors',
      'humilde/honorífico de -아/어 보다 — para mostrar humildad ante superiores',
      'humble/honorifique de -아/어 보다',
      'humilde/honorífico de -아/어 보다',
      'รูปยกย่อง/ถ่อมตัวของ -아/어 보다',
      'bentuk hormat/santun dari -아/어 보다',
      'thể khiêm nhường/kính ngữ của -아/어 보다',
      '-아/어 보다 の謙譲・尊敬形「お〜してみる / お目にかかる」',
    ),
    example: '다음에 또 뵙겠습니다.',
    trans: L(
      'I look forward to seeing you next time.',
      'Le veré la próxima vez.',
      'Au plaisir de vous revoir.',
      'Vejo o senhor / a senhora na próxima.',
      'แล้วจะพบกันใหม่ครับ',
      'Sampai bertemu lagi, Pak/Bu.',
      'Hẹn gặp lại lần sau ạ.',
      '次回またお目にかかります。',
    ),
    deckId: 'topik-5',
  },

  // G281 · Overwhelmed listing (complementary)
  {
    ko: '-(으)랴 -(으)랴',
    meaning: L(
      '"what with this and that ..." — overwhelmed by multiple tasks',
      '"qué con esto, qué con aquello ..." — agobio por múltiples tareas',
      '«entre ceci et cela / tant à faire»',
      '"entre uma coisa e outra ..." — sobrecarga',
      '"ทั้ง ... ทั้ง ... ยุ่งจนตัวเป็นเกลียว"',
      '"sambil ..., sambil ... — sibuk tak karuan"',
      '"vừa ... vừa ... — bận tối mặt"',
      '「〜やら〜やら(忙殺)」',
    ),
    example: '공부하랴 일하랴 너무 바빠요.',
    trans: L(
      'Between studying and working, I’m swamped.',
      'Entre estudiar y trabajar, estoy ocupadísimo.',
      'Entre les études et le travail, je suis débordé.',
      'Entre estudar e trabalhar, estou atolado.',
      'ทั้งเรียนทั้งทำงาน ยุ่งจนหัวหมุน',
      'Antara belajar dan kerja, saya sibuk sekali.',
      'Vừa học vừa làm, tôi bận tối tăm mặt mũi.',
      '勉強やら仕事やらでとても忙しいです。',
    ),
    deckId: 'topik-5',
  },

  // G282 · Meant to, but mistakenly (complementary, variant of G184)
  {
    ko: '-(으)ㄴ다는 게',
    meaning: L(
      '"meant to ... but ended up ... (colloquial)" — variant of G184',
      '"lo que quería era ... pero al final ... (coloquial)" — variante de G184',
      '«je voulais ... mais en fin de compte ... (oral)»',
      '"queria ... mas acabei ... (coloquial)" — variante de G184',
      '"กะว่าจะ ... แต่ก็ ... (พูด)" — แบบ G184',
      '"niatnya ... malah ... (lisan)" — varian G184',
      '"định ... mà rốt cuộc ... (nói)" — biến thể G184',
      '「〜するつもりが(口語)」— G184 の口語形',
    ),
    example: '인사한다는 게 그만 큰 소리로 외쳐버렸어요.',
    trans: L(
      'I meant to greet but ended up shouting.',
      'Quería saludar pero acabé gritando.',
      'Je voulais saluer, mais j’ai fini par crier.',
      'Eu queria cumprimentar, mas acabei gritando.',
      'กะจะทักทาย กลับเผลอตะโกนเสียงดัง',
      'Niatnya menyapa, malah berteriak.',
      'Định chào, lại lỡ la to.',
      '挨拶しようとしたのに、つい大声を出してしまいました。',
    ),
    deckId: 'topik-5',
  },

  // G283 · Merely (formal emphasis, complementary; variant of G104)
  {
    ko: '-(으)ㄹ 따름입니다',
    meaning: L(
      '"merely / simply ..." in 합쇼체 — humble/formal version of G104',
      '"simplemente / lo único que ..." en 합쇼체 — versión humilde de G104',
      '«je ne fais que / il n’y a qu’à ...» (forme formelle de G104)',
      '"apenas / só faço ..." (forma formal de G104)',
      '"เพียงแค่ ... (รูปทางการของ G104)"',
      '"hanya bisa ... (bentuk formal G104)"',
      '"chỉ biết ... (kính ngữ của G104)"',
      '「〜するばかりです(改まり)」— G104 の합쇼체形',
    ),
    example: '그저 감사할 따름입니다.',
    trans: L(
      'I can only feel grateful.',
      'Solo puedo estar agradecido.',
      'Je ne peux qu’être reconnaissant.',
      'Só me resta agradecer.',
      'ทำได้แค่ขอบคุณเท่านั้น',
      'Saya hanya bisa berterima kasih.',
      'Tôi chỉ biết cảm ơn mà thôi.',
      'ただただ感謝するばかりです。',
    ),
    deckId: 'topik-5',
  },

  // G287 · Live while doing (complementary)
  {
    ko: '-(으)며 살다 / 지내다',
    meaning: L(
      '"live (one’s life) doing ..." — describes a way of life',
      '"vivir + gerundio" — describe un modo de vida',
      '«vivre en ...ant»',
      '"viver + gerúndio" — descreve um modo de vida',
      '"ใช้ชีวิตด้วยการ ... / อยู่ไปด้วย ..."',
      '"hidup sambil ... / menjalani hidup dengan ..."',
      '"sống mà vẫn ... / sống bằng cách ..."',
      '「〜しながら暮らす / 過ごす」',
    ),
    example: '한국에서 한국어를 배우며 살아요.',
    trans: L(
      'I live in Korea while learning Korean.',
      'Vivo en Corea estudiando coreano.',
      'Je vis en Corée tout en apprenant le coréen.',
      'Vivo na Coreia estudando coreano.',
      'ฉันใช้ชีวิตในเกาหลีพร้อมเรียนภาษาเกาหลี',
      'Saya tinggal di Korea sambil belajar bahasa Korea.',
      'Tôi sống ở Hàn vừa học tiếng Hàn.',
      '韓国で韓国語を学びながら暮らしています。',
    ),
    deckId: 'topik-5',
  },
]

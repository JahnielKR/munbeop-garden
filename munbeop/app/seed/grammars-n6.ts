import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 6 grammar — 22 entries aligned with `seed/topik-spine.json`
 * (spine ids in topik.6 + transversal G197–G204).
 *
 * Themes (in source order):
 *   1. Concesión retórica y literaria       (3)
 *   2. Conectores literarios                (5)
 *   3. Énfasis máximo y aserción            (6)
 *   4. Registros escritos y arcaicos        (6)
 *   5. Tablas comparativas (meta-tema)      (2)
 */
export const TOPIK_6_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Concesión retórica y literaria
  // ─────────────────────────────────────────────────────────────────────────

  // G197 · Rhetorical concession ("what good is it even if ...?")
  {
    ko: '-ㄴ들',
    meaning: L(
      '"even if ..., what good ...?" — rhetorical concession (literary)',
      '"aunque ..., ¿de qué sirve?" — concesión retórica (literaria)',
      '«même si ..., à quoi bon ?» — concession rhétorique (littéraire)',
      '"mesmo que ..., de que adianta?" — concessão retórica (literária)',
      '"แม้จะ ... ก็ไร้ประโยชน์" — สำนวนวรรณกรรม',
      '"meskipun ..., apa gunanya?" — retoris (sastrawi)',
      '"dù ... thì cũng (ích gì)?" — văn chương',
      '「〜したところで(何の意味があるか)」— 文語・反語',
    ),
    example: '지금 후회한들 무슨 소용이 있어요?',
    trans: L(
      'Even if you regret it now, what good will it do?',
      '¿De qué sirve arrepentirse ahora?',
      'Même si tu le regrettes maintenant, à quoi bon ?',
      'De que adianta se arrepender agora?',
      'แม้ตอนนี้จะเสียใจก็ไม่มีประโยชน์อะไร',
      'Meskipun menyesal sekarang, apa gunanya?',
      'Dù bây giờ có hối hận thì ích gì?',
      '今さら後悔したところで何になるでしょう。',
    ),
    deckId: 'topik-6',
  },

  // G118 · Even if it means ... (moral firmness, literary)
  {
    ko: '-(으)ㄹ망정',
    meaning: L(
      '"even if it means ..." — firm moral resolve; more literary than -(으)ㄹ지언정',
      '"aunque sea ..." — firmeza moral; más literario que -(으)ㄹ지언정',
      '«quitte à ... / dussé-je ...» — résolution morale (littéraire)',
      '"ainda que / mesmo que ..." — firmeza moral (literária)',
      '"ถึงจะ ... ก็ ... (เน้นหลักการ, วรรณกรรม)"',
      '"meskipun harus ..., tetap ... (tegas, sastrawi)"',
      '"thà ... cũng (giữ nguyên tắc) ..." — văn chương',
      '「〜たとえ〜であろうとも / 〜してでも」— 文語・道徳的決意',
    ),
    example: '가난해질망정 정직하게 살겠어요.',
    trans: L(
      'Even if I become poor, I’ll live honestly.',
      'Aunque me vuelva pobre, viviré honestamente.',
      'Quitte à devenir pauvre, je vivrai honnêtement.',
      'Mesmo que eu fique pobre, viverei com honestidade.',
      'ต่อให้กลายเป็นคนจน ก็จะใช้ชีวิตอย่างซื่อสัตย์',
      'Meskipun harus jatuh miskin, saya akan hidup jujur.',
      'Thà nghèo đi tôi cũng sống ngay thẳng.',
      'たとえ貧しくなろうとも、正直に生きます。',
    ),
    deckId: 'topik-6',
  },

  // G201 · Just because ... doesn’t mean
  {
    ko: '-기로서니',
    meaning: L(
      '"just because ... doesn’t mean ..." — minimizes the cited reason; reproachful',
      '"solo porque ... no significa que ..." — minimiza la razón; con reproche',
      '«ce n’est pas parce que ... que / sous prétexte que»',
      '"só porque ... não significa que ..." — com tom de reprovação',
      '"แค่ ... ก็ไม่ใช่เหตุผลที่จะ ..."',
      '"hanya karena ... bukan berarti ..."',
      '"chỉ vì ... không có nghĩa là ..."',
      '「〜だからといって / いくら〜であっても」— 咎める',
    ),
    example: '바쁘기로서니 연락도 못 해요?',
    trans: L(
      'Just because you’re busy, you can’t even send a message?',
      'Solo porque estás ocupado, ¿no puedes ni dar señales de vida?',
      'Ce n’est pas parce que tu es occupé que tu ne peux pas donner de nouvelles.',
      'Só porque está ocupado, não dá nem para mandar um recado?',
      'แค่ยุ่งจะติดต่อสักหน่อยไม่ได้เลยเหรอ',
      'Hanya karena sibuk, kabar pun tidak bisa?',
      'Chỉ vì bận thôi mà không thể nhắn tin được sao?',
      'いくら忙しいからって、連絡もできないんですか？',
    ),
    deckId: 'topik-6',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Conectores literarios
  // ─────────────────────────────────────────────────────────────────────────

  // G112 · Owing to / by virtue of (literary)
  {
    ko: '-(으)로 말미암아',
    meaning: L(
      '"owing to / by virtue of ..." — high-register literary cause',
      '"a raíz de / por obra de ..." — causa de registro muy alto (literario)',
      '«par la faute de / grâce à / du fait de» — registre littéraire',
      '"em razão de / em virtude de ..." — causa em registro literário',
      '"อันสืบเนื่องมาจาก / ด้วย ... (วรรณกรรม)"',
      '"akibat dari / berkat ... (sastrawi)"',
      '"do / nhờ ... (văn chương)"',
      '「〜により / 〜ゆえに(文語)」',
    ),
    example: '그의 희생으로 말미암아 많은 사람들이 살 수 있었어요.',
    trans: L(
      'Owing to his sacrifice, many people were able to live.',
      'A raíz de su sacrificio, muchas personas pudieron vivir.',
      'Grâce à son sacrifice, beaucoup ont pu vivre.',
      'Em virtude de seu sacrifício, muitas pessoas puderam viver.',
      'ด้วยการเสียสละของเขา ทำให้คนจำนวนมากรอดชีวิต',
      'Berkat pengorbanannya, banyak orang bisa hidup.',
      'Nhờ sự hy sinh của ông, nhiều người đã được sống.',
      '彼の犠牲によって、多くの人が生きることができました。',
    ),
    deckId: 'topik-6',
  },

  // G113 · In other words / namely
  {
    ko: '-(으)ㄴ/는 즉',
    meaning: L(
      '"namely / in other words / that is to say ..." — formal restatement',
      '"es decir / o sea / lo que significa ..." — reformulación formal',
      '«c’est-à-dire / autrement dit / soit ...»',
      '"isto é / ou seja / o que significa ..."',
      '"กล่าวคือ / ก็คือ ... (ทางการ)"',
      '"yakni / dengan kata lain / artinya ..."',
      '"tức là / nói cách khác ..."',
      '「すなわち / つまり(改まり)」',
    ),
    example: '그는 이미 결정을 내렸다. 즉 더 이상 논의는 필요 없다는 뜻이다.',
    trans: L(
      'He has already made his decision. That is, no more discussion is needed.',
      'Ya tomó la decisión. Es decir, no hace falta más discusión.',
      'Il a déjà pris sa décision. Autrement dit, il n’y a plus à discuter.',
      'Ele já tomou a decisão. Ou seja, não é preciso mais discussão.',
      'เขาตัดสินใจแล้ว กล่าวคือ ไม่จำเป็นต้องถกเถียงอีก',
      'Dia sudah memutuskan. Artinya, tidak perlu lagi diskusi.',
      'Anh ấy đã quyết định. Tức là không cần bàn thêm.',
      '彼はすでに決断を下した。すなわち、これ以上の議論は不要だ。',
    ),
    deckId: 'topik-6',
  },

  // G198 · Not only ... but also (literary)
  {
    ko: '-거니와',
    meaning: L(
      '"not only ... but also ..." — literary version of -(으)ㄹ 뿐만 아니라',
      '"no solo ... sino también ... (literario)" — versión literaria',
      '«non seulement ... mais aussi ...» — registre soutenu / littéraire',
      '"não só ... como também ... (literário)"',
      '"นอกจาก ... ยัง ... อีกด้วย (วรรณกรรม)"',
      '"tidak hanya ... bahkan ... (sastrawi)"',
      '"không những ... mà còn ... (văn chương)"',
      '「〜のみならず(文語)」',
    ),
    example: '그분은 능력이 뛰어나거니와 인격도 훌륭해요.',
    trans: L(
      'They are not only extremely capable but also of excellent character.',
      'Esa persona no solo es muy capaz, sino que además tiene un carácter excelente.',
      'Cette personne est non seulement très compétente, mais aussi d’un caractère exemplaire.',
      'Essa pessoa não só é capaz, como também tem caráter excelente.',
      'ท่านผู้นั้นไม่เพียงเก่ง ยังมีบุคลิกดีเยี่ยมอีกด้วย',
      'Beliau tidak hanya cakap, tetapi juga berkarakter luar biasa.',
      'Người ấy không chỉ tài năng mà nhân cách còn xuất chúng.',
      'あの方は能力が優れているのみならず、人格も立派です。',
    ),
    deckId: 'topik-6',
  },

  // G114 · Given the situation
  {
    ko: '-는 마당에',
    meaning: L(
      '"given that ... (now) / at this point ..." — irreversible/critical context',
      '"llegados a este punto / dado que ya ..." — situación irreversible o crítica',
      '«à présent que / vu où nous en sommes»',
      '"a esta altura / dado que já ..." — situação irreversível',
      '"ในเมื่อ ... แล้ว / ถึงจุดนี้แล้ว ..."',
      '"setelah keadaan sampai ... / sudah ...; "',
      '"đến mức ... rồi thì ..."',
      '「〜という段になって / 今さら〜の状況で」',
    ),
    example: '이미 시작한 마당에 포기할 수는 없어요.',
    trans: L(
      'Given that we’ve already started, we can’t give up.',
      'Llegados a este punto, ya que empezamos, no podemos rendirnos.',
      'Maintenant qu’on a commencé, on ne peut pas abandonner.',
      'Já que começamos, não dá para desistir.',
      'ในเมื่อเริ่มไปแล้ว จะถอนตัวก็ไม่ได้',
      'Sudah dimulai begini, tidak bisa mundur.',
      'Đã bắt đầu rồi thì không thể bỏ cuộc.',
      'すでに始めた以上、やめるわけにはいきません。',
    ),
    deckId: 'topik-6',
  },

  // G202 · Immediately upon (formal)
  {
    ko: '-는 즉시',
    meaning: L(
      '"immediately upon / as soon as ..." — formal version of -자마자',
      '"en cuanto / inmediatamente al ... (formal)" — versión formal de -자마자',
      '«dès que / aussitôt que» — registre formel',
      '"imediatamente após / assim que (formal)"',
      '"ทันทีที่ ... (ทางการ)"',
      '"segera setelah / begitu ... (formal)"',
      '"ngay khi ... (trang trọng)"',
      '「〜次第 / 〜と同時に(改まり)」',
    ),
    example: '연락을 받는 즉시 출발하세요.',
    trans: L(
      'Depart immediately upon receiving the contact.',
      'Parta en cuanto reciba el aviso.',
      'Partez dès que vous recevez l’avis.',
      'Saia imediatamente assim que receber o aviso.',
      'พอได้รับการติดต่อ ให้ออกเดินทางทันที',
      'Begitu menerima kabar, segera berangkat.',
      'Ngay khi nhận được liên lạc, hãy khởi hành.',
      '連絡を受け次第、出発してください。',
    ),
    deckId: 'topik-6',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Énfasis máximo y aserción
  // ─────────────────────────────────────────────────────────────────────────

  // G115 · Precisely / exactly (maximum emphasis)
  {
    ko: '-(이)야말로',
    meaning: L(
      '"precisely / exactly ... is" — strongest emphatic identification',
      '"precisamente / justamente / por excelencia ..." — énfasis máximo',
      '«c’est précisément / par excellence ...»',
      '"justamente / é exatamente ..." — ênfase máxima',
      '"... นี่แหละ / ... โดยแท้"',
      '"justru ... / ... lah yang"',
      '"chính ... mới là ..."',
      '「〜こそ」— 最強の強調',
    ),
    example: '노력이야말로 성공의 열쇠예요.',
    trans: L(
      'Effort is precisely the key to success.',
      'El esfuerzo es justamente la clave del éxito.',
      'C’est précisément le travail qui est la clé du succès.',
      'O esforço é justamente a chave do sucesso.',
      'ความพยายามนี่แหละคือกุญแจสู่ความสำเร็จ',
      'Justru kerja keras itulah kunci sukses.',
      'Chính nỗ lực mới là chìa khóa của thành công.',
      '努力こそが成功の鍵です。',
    ),
    deckId: 'topik-6',
  },

  // G116 · In my opinion / I dare say
  {
    ko: '-건대 / 생각건대 / 바라건대',
    meaning: L(
      '"in my opinion / I venture to ..." — formal personal assertion (생각건대, 바라건대, 보건대)',
      '"a mi juicio / me atrevo a afirmar / espero que ..." — aserción personal formal',
      '«à mon avis / je me permets de ...» — assertion personnelle formelle',
      '"a meu ver / atrevo-me a dizer ..." — afirmação pessoal formal',
      '"ในความเห็นของฉัน / ขอกล่าวว่า ... (ทางการ)"',
      '"menurut hemat saya / dengan rendah hati ... (formal)"',
      '"theo tôi / xin mạnh dạn cho rằng ... (trang trọng)"',
      '「〜するに / 思うに / 願わくは(改まり)」',
    ),
    example: '생각건대, 이 문제의 근본 원인은 소통 부재예요.',
    trans: L(
      'In my view, the root cause of this issue is the lack of communication.',
      'A mi juicio, la causa raíz de este problema es la falta de comunicación.',
      'À mon avis, la cause profonde de ce problème est l’absence de communication.',
      'A meu ver, a causa raiz deste problema é a falta de comunicação.',
      'ในความเห็นของผม รากเหง้าของปัญหานี้คือการขาดการสื่อสาร',
      'Menurut hemat saya, akar masalah ini adalah kurangnya komunikasi.',
      'Theo tôi, nguyên nhân gốc rễ của vấn đề là thiếu giao tiếp.',
      '思うに、この問題の根本原因は意思疎通の欠如です。',
    ),
    deckId: 'topik-6',
  },

  // G117 · In the area of / regarding (formal)
  {
    ko: '에 있어서',
    meaning: L(
      '"in the area of / when it comes to ..." — formal scope marker',
      '"en cuanto a / en el ámbito de ..." — marcador de ámbito formal',
      '«en ce qui concerne / dans le domaine de ...»',
      '"no que diz respeito a / no âmbito de ..."',
      '"ในด้าน / ในเรื่อง ... (ทางการ)"',
      '"dalam hal / mengenai ... (formal)"',
      '"trong lĩnh vực / về mặt ... (trang trọng)"',
      '「〜において / 〜にあたって(改まり)」',
    ),
    example: '교육에 있어서 환경이 매우 중요해요.',
    trans: L(
      'When it comes to education, the environment matters a great deal.',
      'En lo que respecta a la educación, el entorno es muy importante.',
      'En matière d’éducation, l’environnement est très important.',
      'No que diz respeito à educação, o ambiente é muito importante.',
      'ในด้านการศึกษา สภาพแวดล้อมมีความสำคัญมาก',
      'Dalam hal pendidikan, lingkungan sangatlah penting.',
      'Trong lĩnh vực giáo dục, môi trường rất quan trọng.',
      '教育において環境は非常に重要です。',
    ),
    deckId: 'topik-6',
  },

  // G119 · It’s natural that / such is the way of things
  {
    ko: '-는 법이다',
    meaning: L(
      '"such is the way of things / it’s natural that ..." — universal truth or norm',
      '"así son las cosas / es natural que ..." — verdad universal o norma',
      '«c’est ainsi que / il est naturel que ...» — vérité générale',
      '"é assim que / é natural que ..." — verdade universal',
      '"เป็นธรรมดาที่ ... / ก็เป็นเช่นนั้น"',
      '"begitulah seharusnya / sudah kodratnya ..."',
      '"vốn dĩ ... / chuyện đời là vậy"',
      '「〜ものだ」— 普遍の道理',
    ),
    example: '노력하면 결과가 따르는 법이에요.',
    trans: L(
      'It’s natural that effort brings results.',
      'Es natural que el esfuerzo traiga resultados.',
      'Il est naturel que les efforts portent leurs fruits.',
      'É natural que o esforço traga resultados.',
      'ถ้าพยายาม ผลลัพธ์ก็ย่อมตามมา',
      'Sudah kodratnya: ada usaha pasti ada hasil.',
      'Hễ nỗ lực thì ắt có kết quả, đời vốn dĩ vậy.',
      '努力すれば結果がついてくるものです。',
    ),
    deckId: 'topik-6',
  },

  // G120 · Given that / as long as it’s the case that
  {
    ko: '-(으)ㄴ/는 이상',
    meaning: L(
      '"given that / as long as it is the case that ..." — established condition leading to obligation',
      '"ya que / dado que ... (es así)" — condición establecida que implica obligación',
      '«dès lors que / du moment que ...»',
      '"já que / desde que ..." — condição estabelecida',
      '"ในเมื่อ ... แล้ว ก็ต้อง ..."',
      '"karena sudah ..., maka harus ..."',
      '"đã ... thì phải ..."',
      '「〜以上 / 〜からには」',
    ),
    example: '약속을 한 이상 반드시 지켜야 해요.',
    trans: L(
      'Given that you made a promise, you must keep it.',
      'Ya que hiciste la promesa, tienes que cumplirla.',
      'Dès lors que tu as fait une promesse, tu dois la tenir.',
      'Já que fez a promessa, tem que cumprir.',
      'ในเมื่อให้สัญญาแล้ว ก็ต้องรักษา',
      'Karena sudah berjanji, harus ditepati.',
      'Đã hứa rồi thì phải giữ lời.',
      '約束をした以上、必ず守らなければなりません。',
    ),
    deckId: 'topik-6',
  },

  // G121 · As you know / practically
  {
    ko: '-다시피',
    meaning: L(
      '"as (you) know / as you can see / practically ..." — shared info or virtual equivalence',
      '"como (bien) sabes / como puedes ver / prácticamente ..." — info compartida o casi-equivalencia',
      '«comme tu le sais / pour ainsi dire»',
      '"como você sabe / como dá para ver / praticamente ..."',
      '"อย่างที่ทราบ / อย่างที่เห็น / แทบจะ ..."',
      '"sebagaimana yang kamu tahu / nyaris ..."',
      '"như bạn đã biết / như có thể thấy / gần như ..."',
      '「ご存じのとおり / ご覧のとおり / 〜さながら」',
    ),
    example: '아시다시피 이 문제는 오래전부터 있었어요.',
    trans: L(
      'As you know, this problem has existed for a long time.',
      'Como bien saben, este problema existe desde hace mucho tiempo.',
      'Comme vous le savez, ce problème existe depuis longtemps.',
      'Como vocês sabem, esse problema existe há muito tempo.',
      'อย่างที่ทราบ ปัญหานี้มีมานานแล้ว',
      'Sebagaimana Anda ketahui, masalah ini sudah lama ada.',
      'Như quý vị đã biết, vấn đề này có từ lâu rồi.',
      'ご存じのとおり、この問題は以前からありました。',
    ),
    deckId: 'topik-6',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Registros escritos y arcaicos
  // ─────────────────────────────────────────────────────────────────────────

  // G122 · Narrative declarative (written)
  {
    ko: '-ㄴ/는다',
    meaning: L(
      'narrative declarative (해라체) — written form for novels, articles, diaries',
      'declarativa narrativa (해라체) — forma escrita para narrativa, prensa, diarios',
      'déclaratif narratif (해라체) — forme écrite (romans, articles, journaux intimes)',
      'declarativa narrativa (해라체) — forma escrita para narrativa e jornalismo',
      'รูปบอกเล่าในการเล่าเรื่อง (해라체) — สำหรับนวนิยาย / บทความ / ไดอารี',
      'pernyataan naratif (해라체) — bentuk tulis untuk novel, artikel, diari',
      'lối kể chuyện trần thuật (해라체) — văn viết: tiểu thuyết, báo, nhật ký',
      '常体・文語の終止形(해라체) — 小説・新聞・日記など',
    ),
    example: '봄이 오면 꽃이 핀다.',
    trans: L(
      'When spring comes, flowers bloom.',
      'Cuando llega la primavera, florecen las flores.',
      'Quand le printemps arrive, les fleurs s’épanouissent.',
      'Quando a primavera chega, as flores desabrocham.',
      'เมื่อฤดูใบไม้ผลิมาถึง ดอกไม้ก็บาน',
      'Ketika musim semi tiba, bunga bermekaran.',
      'Khi xuân về, hoa nở rộ.',
      '春が来れば花が咲く。',
    ),
    deckId: 'topik-6',
  },

  // G123 · Poetic declarative (archaic)
  {
    ko: '-노라',
    meaning: L(
      'archaic poetic declarative — solemn assertion in poems, hymns, proclamations',
      'declarativa poética arcaica — aserción solemne en poesía, himnos, proclamas',
      'déclaratif poétique archaïque — assertion solennelle, poésie / hymnes',
      'declarativa poética arcaica — afirmação solene em poesia / hinos',
      'รูปประกาศแบบโบราณ/บทกวี — สุนทรพจน์ บทเพลง',
      'pernyataan puitis kuno — proklamasi, syair, himne',
      'lối tuyên xưng cổ thi — trang trọng, dùng trong thơ / khẩu hiệu',
      '古語・詩語の宣明形「〜なり / 〜であるぞ」',
    ),
    example: '나는 이 땅을 사랑하노라.',
    trans: L(
      'I love this land.',
      'Yo amo esta tierra.',
      'J’aime cette terre.',
      'Amo esta terra.',
      'ข้าขอประกาศว่ารักแผ่นดินผืนนี้',
      'Saya cinta tanah ini.',
      'Ta yêu mảnh đất này.',
      '我はこの地を愛するなり。',
    ),
    deckId: 'topik-6',
  },

  // G200 · Solemn declarative (archaic)
  {
    ko: '-로다 / -(이)로다',
    meaning: L(
      'archaic solemn declarative — emphatic exclamation in classical poetry and proverbs',
      'declarativa solemne arcaica — exclamación enfática en poesía clásica y refranes',
      'déclaratif solennel archaïque — exclamation emphatique (poésie classique)',
      'declarativa solene arcaica — exclamação enfática (poesia clássica)',
      'รูปประกาศแบบสง่างามโบราณ — บทกวีคลาสสิก / สุภาษิต',
      'pernyataan agung kuno — puisi klasik / pepatah',
      'lối tuyên xưng cổ trang — thơ cổ / tục ngữ',
      '古語の感嘆・断定「〜なりけり / 〜であるぞ」',
    ),
    example: '이것이 진정한 사랑이로다.',
    trans: L(
      'This, indeed, is true love.',
      'Esto es el verdadero amor.',
      'Voilà l’amour véritable.',
      'Eis o verdadeiro amor.',
      'นี่แหละคือรักแท้',
      'Inilah cinta sejati.',
      'Đây mới thật là tình yêu chân chính.',
      'これぞ真の愛なり。',
    ),
    deckId: 'topik-6',
  },

  // G124 · Formal hypothetical conditional
  {
    ko: '-(으)ㄹ진대',
    meaning: L(
      '"if indeed it is the case that ..." — formal hypothetical conditional',
      '"si en verdad / de ser así que ..." — condicional formal hipotético',
      '«s’il est vrai que / pour autant que ...» — conditionnel formel',
      '"se de fato / sendo o caso que ..." — condicional formal',
      '"หากแม้นว่า ... (ทางการ)"',
      '"jika sungguh ... (formal)"',
      '"nếu quả thật ... (trang trọng)"',
      '「〜であろうから / 〜であるからには(改まり)」',
    ),
    example: '사람이라면 양심이 있을진대 어떻게 그럴 수 있어요?',
    trans: L(
      'If indeed one is a person and has a conscience, how could one act like that?',
      'Si uno es persona y tiene conciencia, ¿cómo puede actuar así?',
      'S’il est vrai que l’on a une conscience, comment peut-on agir ainsi ?',
      'Se de fato somos pessoas e temos consciência, como agir assim?',
      'หากเป็นมนุษย์ที่มีจิตสำนึก จะกระทำเช่นนั้นได้อย่างไร',
      'Jika benar sebagai manusia memiliki nurani, bagaimana bisa berbuat begitu?',
      'Nếu quả là người và có lương tâm, sao có thể hành xử như vậy?',
      '人として良心があるのなら、どうしてそんなことができましょう。',
    ),
    deckId: 'topik-6',
  },

  // G199 · Frustrated wish (literary)
  {
    ko: '-(으)련마는 / -(으)련만',
    meaning: L(
      '"I would ... but ..." — frustrated or impossible wish (literary, melancholic)',
      '"quisiera ... pero ..." — deseo frustrado o imposible (literario, melancólico)',
      '«je voudrais bien ... mais ...» — souhait frustré (littéraire)',
      '"queria ... mas ..." — desejo frustrado (literário)',
      '"อยากจะ ... แต่ ... (วรรณกรรม โศกเศร้า)"',
      '"ingin sekali ..., tetapi ... (sastrawi, melankoli)"',
      '"muốn ... nhưng ... (văn chương, da diết)"',
      '「〜したいけれど / 〜したかろうに(文語)」',
    ),
    example: '당신과 함께 있으련마는 사정이 허락하지 않네요.',
    trans: L(
      'I’d gladly be with you, but circumstances don’t allow it.',
      'Quisiera estar contigo, pero las circunstancias no lo permiten.',
      'Je voudrais bien être avec toi, mais les circonstances ne le permettent pas.',
      'Eu ficaria com você, mas as circunstâncias não permitem.',
      'อยากอยู่กับคุณ แต่สถานการณ์ไม่อำนวย',
      'Ingin bersamamu, tetapi keadaan tidak mengizinkan.',
      'Tôi muốn ở bên em nhưng hoàn cảnh không cho phép.',
      'あなたと共にいたいのですが、事情が許しません。',
    ),
    deckId: 'topik-6',
  },

  // G203 · Archaic rhetorical question
  {
    ko: '-(으)ㄹ쏘냐',
    meaning: L(
      '"how could one ever ...?" — archaic rhetorical question (denies emphatically)',
      '"¿cómo podría jamás ...?" — pregunta retórica arcaica (negación enfática)',
      '«comment pourrais-je / pourrait-il ...?» — interrogation rhétorique archaïque',
      '"como poderia / acaso ...?" — pergunta retórica arcaica',
      '"จะ ... ได้อย่างไรเล่า (โบราณ, สำนวนวรรณกรรม)"',
      '"mana mungkin / bagaimana bisa ...? (kuno, sastrawi)"',
      '"sao có thể ... được? (cổ, văn chương)"',
      '「〜であろうか / どうして〜できようか(古語)」',
    ),
    example: '이 아름다운 땅을 어찌 잊으리쏘냐.',
    trans: L(
      'How could I ever forget this beautiful land?',
      '¿Cómo podría olvidar esta tierra tan hermosa?',
      'Comment pourrais-je oublier cette belle terre ?',
      'Como poderia eu esquecer esta terra tão bela?',
      'แผ่นดินอันงดงามนี้จะลืมเลือนได้อย่างไรเล่า',
      'Mana mungkin saya melupakan tanah indah ini.',
      'Sao có thể quên được mảnh đất tươi đẹp này.',
      'この美しい大地をどうして忘れられようか。',
    ),
    deckId: 'topik-6',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Tablas comparativas (meta-tema)
  // ─────────────────────────────────────────────────────────────────────────

  // G125 · Comparison of causal expressions
  {
    ko: '원인 표현 비교',
    meaning: L(
      'compares 8 causal expressions by register and nuance: -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      'compara 8 expresiones causales por registro y matiz: -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      'compare 8 expressions de cause par registre et nuance : -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      'compara 8 expressões de causa por registro e nuance: -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      'เปรียบเทียบ 8 สำนวนเหตุผลตามระดับและความหมาย: -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      'membandingkan 8 ungkapan sebab menurut register dan nuansa: -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      'so sánh 8 cách diễn đạt nguyên nhân theo phong cách và sắc thái: -아/어서, -(으)니까, -기 때문에, -는 바람에, -(으)ㄴ/는 탓에, -기에, -(으)로 인해, -(으)로 말미암아',
      '原因表現8種の比較 — -아/어서・-(으)니까・-기 때문에・-는 바람에・-(으)ㄴ/는 탓에・-기에・-(으)로 인해・-(으)로 말미암아',
    ),
    example: '비 때문에 못 갔어요. (cotidiano) / 폭우로 인해 도로가 통제됐어요. (formal/escrito)',
    trans: L(
      'I couldn’t go because of the rain. (casual) / Due to heavy rain, the road was closed. (formal/written)',
      'No pude ir a causa de la lluvia. (cotidiano) / Debido a las lluvias torrenciales, la carretera fue bloqueada. (formal)',
      'Je n’ai pas pu y aller à cause de la pluie. (oral) / En raison de fortes pluies, la route a été fermée. (formel)',
      'Não pude ir por causa da chuva. (cotidiano) / Devido às chuvas fortes, a estrada foi interditada. (formal)',
      'ไปไม่ได้เพราะฝนตก (พูดทั่วไป) / อันเนื่องมาจากฝนตกหนัก ถนนถูกปิด (ทางการ)',
      'Tidak bisa pergi karena hujan. (sehari-hari) / Akibat hujan deras, jalan ditutup. (formal)',
      'Không đi được vì trời mưa. (đời thường) / Do mưa lớn, đường bị phong tỏa. (trang trọng)',
      '雨のせいで行けませんでした。(口語) / 豪雨により道路が通行止めになりました。(改まり)',
    ),
    deckId: 'topik-6',
  },

  // G204 · Comparison of concessive expressions
  {
    ko: '양보 표현 비교',
    meaning: L(
      'compares 10 concessive expressions by level and register: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      'compara 10 expresiones concesivas por nivel y registro: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      'compare 10 expressions de concession par niveau et registre: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      'compara 10 expressões concessivas por nível e registro: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      'เปรียบเทียบ 10 สำนวนยอม-อ้างเหตุตามระดับและการใช้: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      'membandingkan 10 ungkapan konsesif menurut level dan register: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      'so sánh 10 cách diễn đạt nhượng bộ theo cấp độ và phong cách: -아/어도, -(으)ㄴ/는데도, -더라도, -지라도, -(으)ㄹ지언정, -(으)ㄹ망정, -고도, -다손 치더라도, -ㄴ들, -(으)련마는',
      '譲歩表現10種の比較 — -아/어도・-(으)ㄴ/는데도・-더라도・-지라도・-(으)ㄹ지언정・-(으)ㄹ망정・-고도・-다손 치더라도・-ㄴ들・-(으)련마는',
    ),
    example: '비가 와도 갈 거예요. (단순) / 가난해질망정 정직하게 살겠어요. (도덕적 결의)',
    trans: L(
      'Even if it rains, I’ll go. (simple) / Even if I become poor, I’ll live honestly. (moral resolve)',
      'Aunque llueva, iré. (simple) / Aunque me vuelva pobre, viviré con honestidad. (resolución moral)',
      'Même s’il pleut, j’irai. (simple) / Quitte à devenir pauvre, je vivrai honnêtement. (résolution morale)',
      'Mesmo que chova, irei. (simples) / Mesmo que eu fique pobre, viverei com honestidade. (resolução moral)',
      'แม้ฝนตกก็จะไป (ปกติ) / ต่อให้จนก็จะใช้ชีวิตอย่างซื่อสัตย์ (มุ่งมั่นทางคุณธรรม)',
      'Meski hujan, saya tetap pergi. (sederhana) / Walau jatuh miskin, akan hidup jujur. (tekad moral)',
      'Dù trời mưa tôi vẫn đi. (đơn giản) / Thà nghèo cũng sống ngay thẳng. (quyết tâm đạo đức)',
      '雨が降っても行きます。(基本) / 貧しくなろうとも正直に生きます。(道徳的決意)',
    ),
    deckId: 'topik-6',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Transversales que se introducen en este nivel
  // (additional G252-G263 + complementary G268-G289)
  // ─────────────────────────────────────────────────────────────────────────

  // G252 · I can but (additional, formal)
  {
    ko: '-아/어 마지않다',
    meaning: L(
      '"I cannot but ..." — formal/literary emphatic expression',
      '"no puedo más que ..." — expresión formal/literaria enfática',
      '«je ne puis que / je ne saurais ne pas ...»',
      '"não posso senão ..." — expressão formal/literária',
      '"ไม่อาจไม่ ... ได้ / ขอ ... ยิ่ง"',
      '"tidak bisa tidak ... / dengan sungguh ..."',
      '"không thể không ... / xin (kính) ..."',
      '「〜してやまない(改まり)」',
    ),
    example: '감사해 마지않습니다.',
    trans: L(
      'I cannot but be deeply grateful.',
      'No puedo más que estar profundamente agradecido.',
      'Je ne saurais trop vous remercier.',
      'Não posso senão agradecer profundamente.',
      'ขอขอบพระคุณอย่างยิ่ง',
      'Saya tidak bisa tidak berterima kasih sedalam-dalamnya.',
      'Tôi không thể không bày tỏ lòng biết ơn sâu sắc.',
      '感謝してやみません。',
    ),
    deckId: 'topik-6',
  },

  // G253 · Deserves / fitting (additional)
  {
    ko: '-아/어 마땅하다',
    meaning: L(
      '"is fitting / deserves to ..." — moral or normative judgment',
      '"es justo / merecido ..." — juicio moral o normativo',
      '«mérite / il est juste de ...»',
      '"é justo / merece ..."',
      '"สมควรที่จะ ... / สมแล้ว"',
      '"layak / pantas untuk ..."',
      '"đáng phải ... / xứng đáng ..."',
      '「〜するに値する / 当然だ」',
    ),
    example: '칭찬받아 마땅한 행동이에요.',
    trans: L(
      'It’s behavior that deserves praise.',
      'Es una acción que merece elogios.',
      'C’est un comportement qui mérite des éloges.',
      'É um comportamento que merece elogio.',
      'เป็นพฤติกรรมที่สมควรได้รับคำชม',
      'Itu perilaku yang patut dipuji.',
      'Đó là hành động đáng được khen ngợi.',
      '称賛されるに値する行いです。',
    ),
    deckId: 'topik-6',
  },

  // G255 · Firmly believe (additional, literary)
  {
    ko: '-(으)리라(고)',
    meaning: L(
      '"I firmly believe / surely ..." — literary firm conjecture, used with 생각하다/믿다/보다',
      '"creo firmemente / sin duda ..." — conjetura literaria firme, con 생각하다/믿다/보다',
      '«je crois fermement que / sans aucun doute»',
      '"acredito firmemente que / com certeza ..."',
      '"เชื่อมั่นว่า ... / แน่นอนว่า ... (วรรณกรรม)"',
      '"yakin / pasti ... (sastrawi)"',
      '"chắc chắn rằng / tin rằng ... (văn chương)"',
      '「〜であろうと(信じる / 思う)」(文語)',
    ),
    example: '이번에는 성공하리라고 믿어요.',
    trans: L(
      'I firmly believe this time will succeed.',
      'Creo firmemente que esta vez tendrá éxito.',
      'Je crois fermement que cette fois sera la bonne.',
      'Acredito firmemente que desta vez vai dar certo.',
      'ฉันเชื่อมั่นว่าครั้งนี้จะสำเร็จ',
      'Saya yakin kali ini akan berhasil.',
      'Tôi tin chắc lần này sẽ thành công.',
      '今回はきっと成功するだろうと信じています。',
    ),
    deckId: 'topik-6',
  },

  // G258 · For fear that (literary, additional)
  {
    ko: '-(으)ㄹ세라',
    meaning: L(
      '"for fear that ..." — literary version of -(으)ㄹ까 봐',
      '"por miedo a que ... (literario)" — versión literaria de -(으)ㄹ까 봐',
      '«de peur que ... (littéraire)»',
      '"com medo de que ... (literário)"',
      '"กลัวว่าจะ ... (วรรณกรรม)" — เทียบ G144',
      '"khawatir kalau-kalau ... (sastrawi)"',
      '"sợ rằng ... (văn chương)"',
      '「〜しようかと(文語)」— G144 の文語形',
    ),
    example: '아기가 깰세라 조용히 걸었어요.',
    trans: L(
      'I walked quietly for fear of waking the baby.',
      'Caminé en silencio por miedo a despertar al bebé.',
      'J’ai marché en silence de peur de réveiller le bébé.',
      'Andei em silêncio com medo de acordar o bebê.',
      'เดินเงียบ ๆ กลัวว่าจะปลุกเด็ก',
      'Saya berjalan pelan, khawatir bayi terbangun.',
      'Tôi đi rón rén vì sợ làm em bé thức giấc.',
      '赤ちゃんが起きるかと、静かに歩きました。',
    ),
    deckId: 'topik-6',
  },

  // G263 · Question forms by register (additional, meta)
  {
    ko: '질문 종결 비교',
    meaning: L(
      'compares question endings across registers — 드십니까 / 드세요 / 먹어요 / 먹니 / 먹어 / 먹나(요) / 먹는가 / 먹느냐',
      'compara terminaciones interrogativas por registro — 드십니까 / 드세요 / 먹어요 / 먹니 / 먹어 / 먹나(요) / 먹는가 / 먹느냐',
      'compare les terminaisons interrogatives selon le registre',
      'compara terminações interrogativas por registro',
      'เปรียบเทียบรูปคำถามตามระดับ — 드십니까 / 드세요 / 먹어요 / 먹니 / 먹어 / 먹나(요) / 먹는가 / 먹느냐',
      'membandingkan akhiran pertanyaan menurut register',
      'so sánh đuôi câu hỏi theo phong cách',
      '疑問終結の比較: 합쇼체・해요체・반말・해라체・文語',
    ),
    example: '드십니까? (muy formal) / 드세요? (educado) / 먹어요? (cotidiano) / 먹어? (informal)',
    trans: L(
      'Are you eating? (very formal / polite / casual / informal)',
      '¿Está comiendo? (muy formal / educado / cotidiano / informal)',
      'Mangez-vous ? (très formel / poli / courant / familier)',
      'Você está comendo? (muito formal / educado / cotidiano / informal)',
      'รับประทานอยู่ไหมครับ/ดื่มอะไรอยู่คะ (ทางการมาก / สุภาพ / ทั่วไป / กันเอง)',
      'Apakah Anda makan? (sangat formal / sopan / sehari-hari / santai)',
      'Anh/chị đang ăn ạ? (rất trang trọng / lịch sự / đời thường / thân mật)',
      '召し上がりますか？ / お食べになりますか？ / 食べますか？ / 食べる？ — 文体比較',
    ),
    deckId: 'topik-6',
  },

  // G268 · But (literary with lament, complementary)
  {
    ko: '-건만',
    meaning: L(
      '"but / and yet ..." — literary adversative with lament or frustration',
      '"pero / y sin embargo ... (literario)" — con tono de lamento',
      '«mais / et pourtant ... (littéraire, regret)»',
      '"mas / contudo ... (literário com lamento)"',
      '"แต่ ... (วรรณกรรม, สื่ออารมณ์โศก)"',
      '"namun / tetapi ... (sastrawi, getir)"',
      '"thế mà / nhưng ... (văn chương, da diết)"',
      '「〜けれど(文語・嘆き)」',
    ),
    example: '봄이 왔건만 마음은 여전히 춥다.',
    trans: L(
      'Spring has come, but the heart is still cold.',
      'Llegó la primavera, pero el corazón sigue frío.',
      'Le printemps est venu, et pourtant le cœur reste froid.',
      'A primavera chegou, mas o coração continua frio.',
      'ฤดูใบไม้ผลิมาแล้ว แต่ใจยังคงหนาว',
      'Musim semi telah tiba, namun hati tetap dingin.',
      'Xuân về rồi mà lòng vẫn lạnh.',
      '春が来たけれど、心はまだ寒い。',
    ),
    deckId: 'topik-6',
  },

  // G280 · Very formal humble request (complementary)
  {
    ko: '-아/어 주십사 (하고)',
    meaning: L(
      '"I humbly beg you to ..." — extremely formal request, often in letters / speeches',
      '"le ruego encarecidamente que ..." — petición muy formal',
      '«je vous prie d’avoir la bonté de ...» — formel extrême',
      '"peço encarecidamente que ..." — pedido muito formal',
      '"ขอความกรุณา ... (ทางการขั้นสูง)"',
      '"dengan hormat saya memohon ... (sangat formal)"',
      '"kính mong ngài / quý vị ... (rất trang trọng)"',
      '「お〜くださいますよう(極めて改まり)」',
    ),
    example: '도와 주십사 하고 부탁드립니다.',
    trans: L(
      'I humbly request your help.',
      'Le ruego encarecidamente que me ayude.',
      'Je vous prie d’avoir la bonté de m’aider.',
      'Peço encarecidamente sua ajuda.',
      'ขอความกรุณาท่านโปรดช่วยเหลือด้วยครับ',
      'Dengan hormat saya memohon bantuan Anda.',
      'Kính mong ngài giúp đỡ ạ.',
      'お助けくださいますようお願い申し上げます。',
    ),
    deckId: 'topik-6',
  },

  // G284 · Refuse nothing (complementary)
  {
    ko: '-아/어 마다하지 않다',
    meaning: L(
      '"would not refuse / is willing to do even ..." — total willingness',
      '"no rehúsa ni / está dispuesto a hacer incluso ..." — disposición total',
      '«ne refuser même pas / accepter de faire jusqu’à ...»',
      '"não recusa nem / está disposto a fazer até ..."',
      '"ไม่ปฏิเสธแม้แต่จะ ... / เต็มใจทำทุกอย่าง"',
      '"tidak menolak meskipun harus ... / rela melakukan apapun"',
      '"không từ chối cả ... / sẵn sàng ..."',
      '「〜することを厭わない / 嫌がらない」',
    ),
    example: '가족을 위해 희생을 마다하지 않으셨어요.',
    trans: L(
      'They didn’t refuse any sacrifice for their family.',
      'No rehusó ningún sacrificio por su familia.',
      'Il/elle n’a refusé aucun sacrifice pour sa famille.',
      'Ele/ela não recusou nenhum sacrifício pela família.',
      'ท่านไม่ปฏิเสธความเสียสละใด ๆ เพื่อครอบครัว',
      'Beliau tidak menolak pengorbanan apa pun demi keluarga.',
      'Người ấy không từ chối hy sinh nào vì gia đình.',
      '家族のために犠牲を厭わずに尽くしました。',
    ),
    deckId: 'topik-6',
  },

  // G286 · -(이)야말로 (extensión) — covered by G115 in this seed; the spine
  //        keeps it as a separate entry for curricular listing only.

  // G288 · If one keeps living (literary, complementary)
  {
    ko: '-노라면',
    meaning: L(
      '"if one keeps doing / as one lives ..." — literary version of -다 보면',
      '"si uno sigue haciendo / al vivir ... (literario)" — versión literaria de -다 보면',
      '«à force de ... / en vivant ainsi ... (littéraire)»',
      '"se uno continua / vivendo assim ... (literário)"',
      '"หากใช้ชีวิต / ทำต่อไปเรื่อย ๆ ... (วรรณกรรม)"',
      '"jika terus / seraya menjalani ... (sastrawi)"',
      '"nếu cứ ... mãi (văn chương)"',
      '「〜していけば / 生きていれば(文語)」',
    ),
    example: '살노라면 좋은 날도 오겠지요.',
    trans: L(
      'If one keeps on living, good days will surely come.',
      'Si uno vive, llegarán días buenos.',
      'En vivant, de meilleurs jours viendront sans doute.',
      'Continuando a viver, dias melhores hão de vir.',
      'หากใช้ชีวิตต่อไป วันที่ดีก็คงมาถึง',
      'Jika kita terus hidup, hari baik pasti akan datang.',
      'Cứ sống tiếp thì ngày tốt đẹp ắt sẽ đến.',
      '生きていれば、良い日も来るでしょう。',
    ),
    deckId: 'topik-6',
  },

  // G289 · Dying of (extreme, complementary)
  {
    ko: '-아/어 죽을 지경이다',
    meaning: L(
      '"on the verge of dying from ..." — combination of G210 and G188; extreme intensity',
      '"al borde de morir de ..." — combinación de G210 y G188',
      '«être au point de mourir de ...» — combinaison de G210 et G188',
      '"a ponto de morrer de ..." — combinação de G210 e G188',
      '"แทบจะตายเพราะ ..." — รวม G210 + G188',
      '"hampir mati karena ..." — gabungan G210 + G188',
      '"sắp chết vì ..." — kết hợp G210 + G188',
      '「〜て死にそうな状態だ」(G210 + G188 の合成)',
    ),
    example: '더워 죽을 지경이에요.',
    trans: L(
      'I’m about to die from this heat.',
      'No aguanto más del calor que hace.',
      'Je suis à deux doigts de mourir de chaleur.',
      'Estou a ponto de morrer com este calor.',
      'แทบจะตายเพราะร้อนแล้ว',
      'Hampir mati saya saking panasnya.',
      'Tôi sắp chết vì nóng mất.',
      '暑くて死にそうな状態です。',
    ),
    deckId: 'topik-6',
  },
]

import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 3 grammar — 32 entries aligned with `seed/topik-spine.json`
 * (spine ids in topik.3 + transversal G161–G171 belonging to level 3).
 *
 * Themes (in source order):
 *   1. Cambio de estado                    (4)
 *   2. Causa, propósito, dependencia       (6)
 *   3. Conjetura matizada                  (5)
 *   4. Tendencia, decisión, capacidad      (6)
 *   5. Concesión y restricción             (3)
 *   6. Pasiva y causativa completas        (2)
 *   7. Procesos y descubrimientos          (6)
 */
export const TOPIK_3_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Cambio de estado
  // ─────────────────────────────────────────────────────────────────────────

  // G059 · End up / come to (non-volitional change)
  {
    ko: '-게 되다',
    meaning: L(
      '"come to / end up (doing)" — change brought about by circumstance, not will',
      '"llegar a / acabar (haciendo)" — cambio por circunstancias, no por voluntad',
      '«finir par / en venir à» — changement par les circonstances, non choisi',
      '"acabar (fazendo) / vir a" — mudança por circunstâncias, sem intenção',
      '"กลายเป็นว่า / สุดท้ายก็ ..." — เปลี่ยนเพราะสถานการณ์ ไม่ใช่เจตนา',
      '"akhirnya / jadinya ..." — perubahan karena keadaan, bukan kemauan',
      '"rốt cuộc / cuối cùng (làm) ..." — đổi do hoàn cảnh, không do ý chí',
      '「〜ことになる / 〜するようになる」— 状況による変化',
    ),
    example: '이 회사에서 일하게 되었어요.',
    trans: L(
      'I ended up working at this company.',
      'Acabé trabajando en esta empresa.',
      'J’ai fini par travailler dans cette entreprise.',
      'Acabei trabalhando nesta empresa.',
      'สุดท้ายฉันก็ได้ทำงานที่บริษัทนี้',
      'Akhirnya saya jadi bekerja di perusahaan ini.',
      'Cuối cùng tôi đã làm việc ở công ty này.',
      'この会社で働くことになりました。',
    ),
    deckId: 'topik-3',
  },

  // G066 · Become (gradual change of state)
  {
    ko: '-아/어지다',
    meaning: L(
      '"become / get" — gradual change of state with adjectives',
      '"ponerse / volverse / hacerse" — cambio gradual de estado con adjetivos',
      '«devenir / se faire» — changement graduel d’état (adj.)',
      '"ficar / tornar-se" — mudança gradual de estado (adj.)',
      '"กลายเป็น ... / ค่อย ๆ ..." — เปลี่ยนสภาพทีละน้อย (กับคำคุณศัพท์)',
      '"menjadi ..." — perubahan keadaan bertahap (adjektiva)',
      '"trở nên ..." — đổi trạng thái dần (tính từ)',
      '「〜くなる / 〜になる」— 形容詞の段階的変化',
    ),
    example: '날씨가 따뜻해졌어요.',
    trans: L(
      'The weather has gotten warm.',
      'El tiempo se ha puesto cálido.',
      'Le temps s’est radouci.',
      'O tempo ficou quente.',
      'อากาศอุ่นขึ้นแล้ว',
      'Cuacanya jadi hangat.',
      'Trời đã trở nên ấm hơn.',
      '天気が暖かくなりました。',
    ),
    deckId: 'topik-3',
  },

  // G073 · Resultant state ("be + past participle")
  {
    ko: '-아/어 있다',
    meaning: L(
      'resultant state — "be + past participle"; cf. -고 있다 (action in progress)',
      'estado resultante — "estar + participio"; cf. -고 있다 (acción en curso)',
      'état résultant — «être + participe passé»; cf. -고 있다 (action en cours)',
      'estado resultante — "estar + particípio"; cf. -고 있다 (em progresso)',
      'สภาพคงค้างหลังจบการกระทำ — เทียบ -고 있다 (กำลังทำ)',
      'keadaan hasil — bedakan dengan -고 있다 (sedang berlangsung)',
      'trạng thái kết quả — khác -고 있다 (đang tiến hành)',
      '「〜ている」(結果状態) — 進行の -고 있다 と区別',
    ),
    example: '문이 열려 있어요.',
    trans: L(
      'The door is open.',
      'La puerta está abierta.',
      'La porte est ouverte.',
      'A porta está aberta.',
      'ประตูเปิดอยู่',
      'Pintunya terbuka.',
      'Cửa đang mở.',
      'ドアが開いています。',
    ),
    deckId: 'topik-3',
  },

  // G070 · Looks / appears
  {
    ko: '-아/어 보이다',
    meaning: L(
      '"looks / appears + adj." — visual impression',
      '"parecer / verse + adjetivo" — impresión visual',
      '«avoir l’air / sembler» — impression visuelle',
      '"parecer / ter cara de" — impressão visual',
      '"ดู ...(เหมือน)" — ความรู้สึกจากที่เห็น',
      '"kelihatan / tampak ..." — kesan visual',
      '"trông có vẻ ..." — ấn tượng nhìn được',
      '「〜く見える / 〜そうに見える」— 視覚的印象',
    ),
    example: '오늘 피곤해 보여요.',
    trans: L(
      'You look tired today.',
      'Hoy te ves cansado.',
      'Tu as l’air fatigué aujourd’hui.',
      'Você parece cansado hoje.',
      'วันนี้ดูเหนื่อยนะ',
      'Hari ini kamu terlihat lelah.',
      'Hôm nay trông bạn mệt mỏi.',
      '今日は疲れて見えますね。',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Causa, propósito, dependencia
  // ─────────────────────────────────────────────────────────────────────────

  // G062 · Because (formal; imperative ok)
  {
    ko: '-기 때문에',
    meaning: L(
      '"because / due to" — formal; allows imperative and past on 1st clause',
      '"porque / debido a que" — formal; admite imperativo y pasado en la 1ª cláusula',
      '«parce que / du fait que» — formel; impératif et passé acceptés',
      '"porque / pelo fato de que" — formal; aceita imperativo e passado',
      '"เพราะว่า" — ทางการ; ใช้กับคำสั่ง/อดีตได้',
      '"karena (formal)" — boleh dengan imperatif dan lampau di klausa 1',
      '"vì / do (trang trọng)" — cho phép mệnh lệnh/quá khứ ở vế 1',
      '「〜ために / 〜ので(改まり)」— 命令・過去OK',
    ),
    example: '비가 오기 때문에 집에 있었어요.',
    trans: L(
      'I stayed home because it was raining.',
      'Porque estaba lloviendo, me quedé en casa.',
      'Comme il pleuvait, je suis resté à la maison.',
      'Como estava chovendo, fiquei em casa.',
      'เพราะฝนตก เลยอยู่บ้าน',
      'Karena hujan, saya tinggal di rumah.',
      'Vì trời mưa nên tôi ở nhà.',
      '雨が降っていたため、家にいました。',
    ),
    deckId: 'topik-3',
  },

  // G061 · While (same subject)
  {
    ko: '-(으)면서',
    meaning: L(
      '"while / at the same time" — same subject does two actions (cf. -는 동안)',
      '"mientras (mismo sujeto)" — dos acciones simultáneas del mismo sujeto',
      '«tout en / pendant que» — même sujet pour les deux actions',
      '"enquanto (mesmo sujeito)" — duas ações simultâneas do mesmo sujeito',
      '"ในขณะที่ ... ด้วย" — ผู้กระทำเดียวกัน',
      '"sambil (subjek sama)" — dua aksi serentak satu subjek',
      '"vừa ... vừa ... (cùng chủ ngữ)" — hai hành động đồng thời',
      '「〜ながら」— 同主語の同時動作',
    ),
    example: '음악을 들으면서 공부해요.',
    trans: L(
      'I study while listening to music.',
      'Estudio mientras escucho música.',
      'J’étudie tout en écoutant de la musique.',
      'Estudo enquanto escuto música.',
      'ฉันเรียนพร้อมกับฟังเพลง',
      'Saya belajar sambil mendengarkan musik.',
      'Tôi vừa học vừa nghe nhạc.',
      '音楽を聞きながら勉強します。',
    ),
    deckId: 'topik-3',
  },

  // G063 · No choice but to
  {
    ko: '-(으)ㄹ 수밖에 없다',
    meaning: L(
      '"have no choice but to / inevitably" — only one option remains',
      '"no tener más remedio que / inevitablemente" — sin otra opción',
      '«n’avoir d’autre choix que de» — option unique',
      '"não ter outra opção senão" — não há alternativa',
      '"ไม่มีทางเลือกอื่นนอกจาก ..." — ทำได้แค่นี้',
      '"tidak ada pilihan selain ..." — terpaksa',
      '"không còn cách nào ngoài ..."',
      '「〜するしかない / 〜せざるを得ない」',
    ),
    example: '버스가 없어서 걸어갈 수밖에 없었어요.',
    trans: L(
      'There was no bus, so I had to walk.',
      'Como no había autobús, no tuve más remedio que ir caminando.',
      'Il n’y avait pas de bus, j’ai dû y aller à pied.',
      'Como não tinha ônibus, não tive escolha senão ir a pé.',
      'ไม่มีรถบัส เลยต้องเดิน',
      'Karena tidak ada bus, terpaksa jalan kaki.',
      'Không có xe buýt nên đành phải đi bộ.',
      'バスがなかったので歩くしかありませんでした。',
    ),
    deckId: 'topik-3',
  },

  // G068 · In order to / for (formal purpose)
  {
    ko: '-기 위해(서) / -을/를 위해(서)',
    meaning: L(
      '"in order to / for the sake of" — formal purpose; any verb (not only motion)',
      '"para / con el fin de" — propósito formal; cualquier verbo (no solo de movimiento)',
      '«afin de / pour» — but formel; tout verbe (pas seulement de mouvement)',
      '"para / a fim de" — propósito formal; qualquer verbo',
      '"เพื่อ ... (ทางการ)" — กริยาใดก็ได้ ไม่จำกัด',
      '"untuk / demi (formal)" — verba apa pun, tak terbatas verba gerak',
      '"để / nhằm (trang trọng)" — bất kỳ động từ nào',
      '「〜ために」— 改まり、移動動詞に限定されない',
    ),
    example: '건강을 유지하기 위해서 운동을 해요.',
    trans: L(
      'I exercise in order to stay healthy.',
      'Hago ejercicio para mantener la salud.',
      'Je fais du sport pour rester en bonne santé.',
      'Eu me exercito para manter a saúde.',
      'ฉันออกกำลังกายเพื่อรักษาสุขภาพ',
      'Saya berolahraga untuk menjaga kesehatan.',
      'Tôi tập thể dục để giữ sức khỏe.',
      '健康を維持するために運動します。',
    ),
    deckId: 'topik-3',
  },

  // G067 · According to / depending on
  {
    ko: '에 따라(서)',
    meaning: L(
      '"according to / depending on" — variation based on something',
      '"según / dependiendo de" — varía conforme a algo',
      '«selon / en fonction de» — variation selon qch',
      '"conforme / dependendo de" — varia segundo algo',
      '"ตามที่ / ขึ้นอยู่กับ ..." — เปลี่ยนตาม',
      '"sesuai / tergantung ..." — bervariasi',
      '"tùy theo / theo ..." — biến đổi theo',
      '「〜によって / 〜次第で」',
    ),
    example: '날씨에 따라 옷을 다르게 입어요.',
    trans: L(
      'I dress differently depending on the weather.',
      'Me visto diferente según el tiempo.',
      'Je m’habille différemment selon le temps.',
      'Visto-me diferente conforme o clima.',
      'ฉันแต่งตัวต่างกันตามสภาพอากาศ',
      'Saya berpakaian beda tergantung cuaca.',
      'Tôi mặc khác nhau tùy theo thời tiết.',
      '天気によって服装が変わります。',
    ),
    deckId: 'topik-3',
  },

  // G170 · Compared to
  {
    ko: '에 비해(서)',
    meaning: L(
      '"compared to / relative to" — neutral, more formal than 보다',
      '"en comparación con / comparado con" — más neutro que 보다',
      '«par rapport à / comparé à» — neutre, plus formel que 보다',
      '"em comparação com / comparado a" — mais neutro que 보다',
      '"เมื่อเทียบกับ ..." — เป็นกลาง / ทางการกว่า 보다',
      '"dibandingkan dengan ..." — netral, lebih formal dari 보다',
      '"so với / so sánh với ..." — trung tính, trang trọng hơn 보다',
      '「〜に比べて」— 보다 より中立・改まり',
    ),
    example: '작년에 비해 올해 물가가 많이 올랐어요.',
    trans: L(
      'Compared to last year, prices have risen a lot this year.',
      'En comparación con el año pasado, los precios han subido mucho este año.',
      'Par rapport à l’an dernier, les prix ont beaucoup monté cette année.',
      'Em comparação com o ano passado, os preços subiram muito este ano.',
      'เมื่อเทียบกับปีที่แล้ว ปีนี้ราคาขึ้นเยอะมาก',
      'Dibandingkan tahun lalu, harga naik banyak tahun ini.',
      'So với năm ngoái, giá cả năm nay tăng rất nhiều.',
      '昨年に比べて今年は物価がかなり上がりました。',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Conjetura matizada
  // ─────────────────────────────────────────────────────────────────────────

  // G069 · Probably / I think (future)
  {
    ko: '-(으)ㄹ 것 같다',
    meaning: L(
      '"will probably / it seems X will" — conjecture about future or hypothesis',
      '"parece que va a / creo que ..." — conjetura sobre futuro o hipótesis',
      '«il semble que ... / je pense que ...» — futur ou hypothèse',
      '"parece que vai / acho que ..." — conjectura sobre o futuro',
      '"คิดว่าน่าจะ ..." — เดาเรื่องอนาคต',
      '"sepertinya akan / saya rasa ..." — dugaan akan datang',
      '"có lẽ sẽ ... / chắc là ..." — phỏng đoán tương lai',
      '「〜と思う / 〜そうだ(未来)」',
    ),
    example: '내일 비가 올 것 같아요.',
    trans: L(
      'I think it will rain tomorrow.',
      'Creo que mañana va a llover.',
      'Je pense qu’il va pleuvoir demain.',
      'Acho que vai chover amanhã.',
      'พรุ่งนี้น่าจะฝนตก',
      'Sepertinya besok akan hujan.',
      'Có vẻ ngày mai trời sẽ mưa.',
      '明日は雨が降りそうです。',
    ),
    deckId: 'topik-3',
  },

  // G071 · As if / just like
  {
    ko: '-(으)ㄴ/는 것처럼',
    meaning: L(
      '"as if / just like ..." — comparison of manner or appearance',
      '"como si / igual que ..." — comparación de modo o apariencia',
      '«comme si / tout comme ...» — manière ou apparence',
      '"como se / igual a ..." — comparação de modo ou aparência',
      '"ราวกับ / เหมือนกับว่า ..."',
      '"seakan-akan / seperti ..."',
      '"như thể / giống như ..."',
      '「〜のように / 〜かのように」',
    ),
    example: '아무 일도 없었던 것처럼 행동해요.',
    trans: L(
      'They act as if nothing had happened.',
      'Actúa como si no hubiera pasado nada.',
      'Il agit comme si rien ne s’était passé.',
      'Age como se nada tivesse acontecido.',
      'ทำเหมือนไม่มีอะไรเกิดขึ้น',
      'Berlaku seakan tak terjadi apa-apa.',
      'Hành xử như chưa có chuyện gì.',
      '何事もなかったかのように振る舞います。',
    ),
    deckId: 'topik-3',
  },

  // G072 · I wish / hope (irrealis desire)
  {
    ko: '-(으)면 좋겠다',
    meaning: L(
      '"I wish / I hope" — desire about a situation, often beyond one’s control',
      '"ojalá / me gustaría que ..." — deseo sobre una situación',
      '«j’aimerais bien que / si seulement ...» — souhait',
      '"tomara que / queria que ..." — desejo sobre uma situação',
      '"อยากให้ ... / หวังว่า ..." — ความปรารถนา',
      '"semoga / berharap ..." — harapan',
      '"ước gì / mong rằng ..." — mong muốn',
      '「〜たらいいな / 〜ば いいのに」',
    ),
    example: '내일 날씨가 좋으면 좋겠어요.',
    trans: L(
      'I hope the weather will be nice tomorrow.',
      'Ojalá haga buen tiempo mañana.',
      'J’espère qu’il fera beau demain.',
      'Tomara que faça bom tempo amanhã.',
      'หวังว่าพรุ่งนี้อากาศจะดี',
      'Semoga besok cuacanya bagus.',
      'Mong là ngày mai trời đẹp.',
      '明日天気が良ければいいですね。',
    ),
    deckId: 'topik-3',
  },

  // G168 · Thought / didn’t know that (mistaken belief)
  {
    ko: '-(으)ㄴ/는 줄 알다/몰랐다',
    meaning: L(
      '"thought that ... (but wasn’t)" / "didn’t know that ..." — mistaken belief',
      '"creía que ... (pero no era así)" / "no sabía que ..." — creencia errónea',
      '«je croyais que ...» / «je ne savais pas que ...» — croyance erronée',
      '"achei que ... (mas não era)" / "não sabia que ..." — crença equivocada',
      '"คิดว่า ... (แต่ไม่ใช่)" / "ไม่รู้ว่า ..."',
      '"saya kira ... (ternyata bukan)" / "saya tidak tahu kalau ..."',
      '"tôi tưởng là ..." / "tôi không biết là ..."',
      '「〜と思った / 〜と知らなかった」— 思い違い',
    ),
    example: '오늘 수업이 있는 줄 몰랐어요.',
    trans: L(
      'I didn’t know there was class today.',
      'No sabía que hoy había clase.',
      'Je ne savais pas qu’il y avait cours aujourd’hui.',
      'Não sabia que tinha aula hoje.',
      'ไม่รู้ว่าวันนี้มีเรียน',
      'Saya tidak tahu kalau hari ini ada kelas.',
      'Tôi không biết hôm nay có buổi học.',
      '今日授業があるとは知りませんでした。',
    ),
    deckId: 'topik-3',
  },

  // G169 · Naturally / inevitably
  {
    ko: '-기 마련이다',
    meaning: L(
      '"it’s natural that ... / inevitably ..." — what tends to happen',
      '"es natural que ... / suele ocurrir que ..." — patrón esperable',
      '«il est naturel que ... / il arrive forcément que ...»',
      '"é natural que ... / naturalmente ..."',
      '"ก็ต้องเป็นอย่างนั้น / ธรรมดา ..."',
      '"sudah biasa / tentu saja ..."',
      '"là chuyện thường / ắt phải ..."',
      '「〜するものだ」— 自然な道理',
    ),
    example: '사람은 누구나 실수하기 마련이에요.',
    trans: L(
      'It’s natural that anyone makes mistakes.',
      'Es inevitable que cualquier persona cometa errores.',
      'Tout le monde fait forcément des erreurs.',
      'É natural que qualquer pessoa cometa erros.',
      'คนเราย่อมทำผิดพลาดเป็นเรื่องธรรมดา',
      'Wajar kalau siapa pun pernah salah.',
      'Ai cũng có lúc mắc sai lầm là chuyện thường.',
      '人は誰でも間違いをするものです。',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Tendencia, decisión, capacidad
  // ─────────────────────────────────────────────────────────────────────────

  // G064 · Decide to / agree to
  {
    ko: '-기로 하다',
    meaning: L(
      '"decide to / agree to" — own decision or mutual agreement',
      '"decidir hacer / quedar en" — decisión propia o acuerdo',
      '«décider de / convenir de» — décision ou accord',
      '"decidir / combinar de" — decisão ou acordo',
      '"ตกลงว่าจะ / นัดกันว่าจะ ..."',
      '"memutuskan untuk / sepakat untuk ..."',
      '"quyết định / hẹn nhau ..."',
      '「〜することにする / 〜することに決める」',
    ),
    example: '내일 만나기로 했어요.',
    trans: L(
      'We agreed to meet tomorrow.',
      'Quedamos en encontrarnos mañana.',
      'On a convenu de se voir demain.',
      'Combinámos de nos encontrar amanhã.',
      'นัดกันว่าจะเจอกันพรุ่งนี้',
      'Kami sepakat ketemu besok.',
      'Chúng tôi đã hẹn gặp nhau vào ngày mai.',
      '明日会うことにしました。',
    ),
    deckId: 'topik-3',
  },

  // G065 · Tendency / relative inclination
  {
    ko: '-(으)ㄴ/는 편이다',
    meaning: L(
      '"tend to / be rather ..." — relative tendency, "on the side of"',
      '"tender a / ser más bien ..." — tendencia relativa',
      '«avoir tendance à / être plutôt ...»',
      '"tender a / ser meio ..." — tendência relativa',
      '"ค่อนข้าง ... / มักจะ ..." — แนวโน้ม',
      '"cenderung / tergolong ..." — kecenderungan relatif',
      '"có xu hướng / khá ..." — khuynh hướng',
      '「〜ほうだ」— 傾向',
    ),
    example: '저는 음식을 많이 먹는 편이에요.',
    trans: L(
      'I tend to eat a lot.',
      'Yo tiendo a comer bastante.',
      'J’ai plutôt tendance à beaucoup manger.',
      'Eu costumo comer bastante.',
      'ฉันเป็นคนกินเยอะ',
      'Saya termasuk yang banyak makan.',
      'Tôi thuộc kiểu ăn nhiều.',
      '私は食べる量が多いほうです。',
    ),
    deckId: 'topik-3',
  },

  // G074 · Know how / not know how
  {
    ko: '-(으)ㄹ 줄 알다/모르다',
    meaning: L(
      '"know / don’t know how to ..." — learned skill (cf. -(으)ㄹ 수 있다, general possibility)',
      '"saber / no saber cómo ..." — habilidad aprendida (cf. -(으)ㄹ 수 있다 posibilidad)',
      '«savoir / ne pas savoir faire» — compétence acquise',
      '"saber / não saber como ..." — habilidade aprendida',
      '"รู้/ไม่รู้วิธี ..." — ทักษะที่เรียนรู้',
      '"tahu cara / tidak tahu cara ..." — keterampilan',
      '"biết / không biết cách ..." — kỹ năng học được',
      '「〜の仕方を知っている / 知らない」— 習得能力',
    ),
    example: '저는 피아노를 칠 줄 알아요.',
    trans: L(
      'I know how to play the piano.',
      'Sé tocar el piano.',
      'Je sais jouer du piano.',
      'Eu sei tocar piano.',
      'ฉันเล่นเปียโนเป็น',
      'Saya bisa main piano.',
      'Tôi biết chơi piano.',
      '私はピアノが弾けます。',
    ),
    deckId: 'topik-3',
  },

  // G060 · So that / until
  {
    ko: '-도록',
    meaning: L(
      '"so that / until / to the extent that" — purpose, limit, or instruction',
      '"para que / hasta que / de modo que" — propósito, extensión o instrucción',
      '«de sorte que / jusqu’à ce que / pour que»',
      '"para que / até que / de modo que"',
      '"เพื่อให้ / จนกระทั่ง / ในแบบที่ ..."',
      '"agar / sampai / supaya ..."',
      '"để / cho đến khi / sao cho ..."',
      '「〜するように / 〜まで」— 目的・限界・指示',
    ),
    example: '잘 들을 수 있도록 크게 말해 주세요.',
    trans: L(
      'Please speak loudly so I can hear well.',
      'Hable fuerte para que pueda oír bien.',
      'Parle fort pour que je puisse bien entendre.',
      'Fale alto para eu poder ouvir bem.',
      'พูดดัง ๆ หน่อยเพื่อให้ฉันได้ยินชัด ๆ',
      'Bicara keras agar terdengar jelas.',
      'Hãy nói to để tôi nghe rõ.',
      'よく聞こえるように大きな声で話してください。',
    ),
    deckId: 'topik-3',
  },

  // G079 · As soon as
  {
    ko: '-자마자',
    meaning: L(
      '"as soon as / the moment that" — immediate sequence',
      '"en cuanto / nada más + infinitivo" — secuencia inmediata',
      '«dès que / aussitôt que» — séquence immédiate',
      '"assim que / logo que" — sequência imediata',
      '"ทันทีที่ ..." — ติดกันทันที',
      '"begitu / segera setelah ..."',
      '"ngay khi / vừa ... đã ..."',
      '「〜するやいなや / 〜したとたん」',
    ),
    example: '집에 오자마자 손을 씻어요.',
    trans: L(
      'As soon as I get home, I wash my hands.',
      'En cuanto llego a casa, me lavo las manos.',
      'Dès que je rentre, je me lave les mains.',
      'Assim que chego em casa, lavo as mãos.',
      'พอกลับถึงบ้านก็ล้างมือทันที',
      'Begitu pulang, saya langsung cuci tangan.',
      'Vừa về đến nhà tôi liền rửa tay.',
      '家に帰るとすぐ手を洗います。',
    ),
    deckId: 'topik-3',
  },

  // G078 · Time elapsed since (with duration)
  {
    ko: '-(으)ㄴ 지',
    meaning: L(
      '"it has been (time) since (doing)" — with duration + 됐어요/지났어요',
      '"hace (tiempo) que / llevo + tiempo ..." — con duración + 됐어요/지났어요',
      '«cela fait (durée) que ...» — avec durée + 됐어요/지났어요',
      '"faz (tempo) que / já se passou ..." — com duração + 됐어요/지났어요',
      '"นานเท่าไหร่แล้วที่ ..." — กับช่วงเวลา + 됐어요/지났어요',
      '"sudah (waktu) sejak ..." — + 됐어요/지났어요',
      '"đã (thời gian) kể từ khi ..." — + 됐어요/지났어요',
      '「〜してから(時間)になる / が経つ」',
    ),
    example: '한국어를 공부한 지 2년이 됐어요.',
    trans: L(
      'It’s been two years since I started learning Korean.',
      'Llevo dos años estudiando coreano.',
      'Cela fait deux ans que j’apprends le coréen.',
      'Faz dois anos que estudo coreano.',
      'เรียนภาษาเกาหลีมา 2 ปีแล้ว',
      'Sudah dua tahun saya belajar bahasa Korea.',
      'Đã hai năm tôi học tiếng Hàn.',
      '韓国語を勉強して2年になりました。',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Concesión y restricción
  // ─────────────────────────────────────────────────────────────────────────

  // G076 · Even if / even though
  {
    ko: '-아/어도',
    meaning: L(
      '"even if / although" — simple concession',
      '"aunque / incluso si" — concesión simple',
      '«même si» — concession simple',
      '"mesmo que / ainda que" — concessão simples',
      '"แม้ว่าจะ ... ก็ ..."',
      '"meskipun / walaupun"',
      '"dù / cho dù"',
      '「〜ても」— 単純な譲歩',
    ),
    example: '피곤해도 운동해요.',
    trans: L(
      'I exercise even when I’m tired.',
      'Aunque esté cansado, hago ejercicio.',
      'Même fatigué, je fais du sport.',
      'Mesmo cansado, eu me exercito.',
      'แม้จะเหนื่อยก็ยังออกกำลังกาย',
      'Meskipun lelah, saya tetap berolahraga.',
      'Dù mệt tôi vẫn tập thể dục.',
      '疲れていても運動します。',
    ),
    deckId: 'topik-3',
  },

  // G077 · Despite / and yet
  {
    ko: '-(으)ㄴ/는데도',
    meaning: L(
      '"despite the fact that / and yet" — concession with unexpected outcome',
      '"a pesar de que / y sin embargo" — concesión con resultado sorpresivo',
      '«bien que / pourtant» — concession avec résultat inattendu',
      '"apesar de que / ainda assim" — concessão com resultado inesperado',
      '"แม้ว่า ... ก็ยัง ..." — ผลที่ไม่คาดคิด',
      '"meski ..., tetap ..." — hasil tak terduga',
      '"mặc dù ... vẫn ..." — kết quả bất ngờ',
      '「〜のに」— 意外な結果を伴う譲歩',
    ),
    example: '많이 먹었는데도 배가 고파요.',
    trans: L(
      'I’m hungry even though I ate a lot.',
      'A pesar de haber comido mucho, tengo hambre.',
      'Pourtant j’ai beaucoup mangé, j’ai encore faim.',
      'Apesar de ter comido muito, ainda estou com fome.',
      'กินไปเยอะแล้วก็ยังหิวอยู่',
      'Padahal sudah makan banyak, masih lapar.',
      'Dù ăn nhiều rồi tôi vẫn đói.',
      'たくさん食べたのにお腹が空いています。',
    ),
    deckId: 'topik-3',
  },

  // G075 · Only (with regret / insufficiency)
  {
    ko: '밖에 + neg',
    meaning: L(
      '"only / nothing but ..." — implies insufficiency; always with a negative verb',
      '"solo / nada más que ..." — implica insuficiencia; siempre con verbo en negativa',
      '«ne ... que / rien que ...» — sentiment d’insuffisance, verbe au négatif',
      '"só / nada além de ..." — implica insuficiência; sempre com verbo negativo',
      '"มีแค่ ... เท่านั้น" — ความรู้สึกว่าน้อย / ไม่พอ (กริยาเป็นปฏิเสธ)',
      '"hanya ... saja" — kesan kurang; verba selalu negatif',
      '"chỉ có ... thôi" — hàm ý không đủ; động từ phủ định',
      '「〜しか〜ない」— 不足のニュアンス',
    ),
    example: '돈이 천 원밖에 없어요.',
    trans: L(
      'I only have 1,000 won.',
      'Solo tengo 1.000 won.',
      'Je n’ai que mille wons.',
      'Eu só tenho 1.000 wons.',
      'มีเงินแค่ 1,000 วอน',
      'Saya hanya punya 1.000 won.',
      'Tôi chỉ có 1.000 won thôi.',
      'お金が1000ウォンしかありません。',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Pasiva y causativa completas
  // ─────────────────────────────────────────────────────────────────────────

  // G161 · Passive (full system)
  {
    ko: '피동 (이/히/리/기)',
    meaning: L(
      'full passive system — suffix 이/히/리/기 by verb; agent marked with 에게/에 의해',
      'pasiva morfológica completa — sufijo 이/히/리/기 según verbo; agente con 에게/에 의해',
      'passif morphologique complet — suffixes 이/히/리/기; agent par 에게/에 의해',
      'voz passiva completa — sufixos 이/히/리/기; agente com 에게/에 의해',
      'รูปกริยาถูกกระทำเต็ม — เติม 이/히/리/기; ผู้กระทำใส่ 에게/에 의해',
      'pasif morfologis lengkap — sufiks 이/히/리/기; pelaku dengan 에게/에 의해',
      'thể bị động đầy đủ — hậu tố 이/히/리/기; tác nhân với 에게/에 의해',
      '形態的受動の体系: 이/히/리/기 (動作主は 에게/에 의해)',
    ),
    example: '창문이 바람에 열렸어요.',
    trans: L(
      'The window was opened by the wind.',
      'La ventana se abrió con el viento.',
      'La fenêtre s’est ouverte sous l’effet du vent.',
      'A janela foi aberta pelo vento.',
      'หน้าต่างถูกลมเปิด',
      'Jendela terbuka karena angin.',
      'Cửa sổ bị gió mở ra.',
      '窓が風で開きました。',
    ),
    deckId: 'topik-3',
  },

  // G162 · Causative (full system)
  {
    ko: '사동 (이/히/리/기/우/추)',
    meaning: L(
      'full causative system — make/let someone do; suffixes 이/히/리/기/우/추',
      'causativa morfológica completa — "hacer que alguien haga"; sufijos 이/히/리/기/우/추',
      'causatif morphologique complet — «faire faire»; suffixes 이/히/리/기/우/추',
      'voz causativa completa — "fazer alguém fazer"; sufixos 이/히/리/기/우/추',
      'รูปกริยาทำให้ผู้อื่นทำ — เติม 이/히/리/기/우/추',
      'kausatif morfologis lengkap — sufiks 이/히/리/기/우/추',
      'thể sai khiến đầy đủ — hậu tố 이/히/리/기/우/추',
      '形態的使役の体系: 이/히/리/기/우/추 (먹이다/입히다/웃기다/재우다/낮추다)',
    ),
    example: '아이에게 밥을 먹였어요.',
    trans: L(
      'I fed the child.',
      'Le di de comer al niño.',
      'J’ai donné à manger à l’enfant.',
      'Dei comida para a criança.',
      'ป้อนข้าวให้เด็ก',
      'Saya menyuapi anak itu.',
      'Tôi đút cơm cho đứa bé.',
      '子供にご飯を食べさせました。',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 7 · Procesos y descubrimientos
  // ─────────────────────────────────────────────────────────────────────────

  // G163 · Was going to but ...
  {
    ko: '-(으)려다가',
    meaning: L(
      '"was going to ... but ..." — abandoned intention; changed mid-action',
      '"iba a hacer ... pero ..." — intención abandonada',
      '«j’allais ... mais ...» — intention abandonnée',
      '"ia fazer ... mas ..." — intenção abandonada',
      '"กำลังจะ ... แต่ ..." — ละทิ้งความตั้งใจ',
      '"berniat ... tetapi ..." — niat dibatalkan',
      '"đang định ... thì ..." — bỏ ý định',
      '「〜しようとして / 〜しかけて」— 中止した意図',
    ),
    example: '전화하려다가 그냥 문자를 보냈어요.',
    trans: L(
      'I was going to call but I just sent a text instead.',
      'Iba a llamar pero al final mandé un mensaje.',
      'J’allais appeler mais j’ai finalement envoyé un texto.',
      'Eu ia ligar, mas acabei mandando uma mensagem.',
      'จะโทร แต่สุดท้ายส่งข้อความแทน',
      'Mau nelpon tapi malah kirim pesan saja.',
      'Tôi định gọi nhưng cuối cùng chỉ nhắn tin.',
      '電話しようとしたけど、結局メッセージを送りました。',
    ),
    deckId: 'topik-3',
  },

  // G164 · If you keep doing, eventually ...
  {
    ko: '-다 보면',
    meaning: L(
      '"if you keep doing, eventually ..." — encouragement / natural outcome',
      '"si sigues haciendo, llegará a ..." — proceso que lleva a un resultado',
      '«à force de ..., on finit par ...» — résultat naturel',
      '"se você continuar fazendo, eventualmente ..." — resultado natural',
      '"ถ้าทำต่อไปเรื่อย ๆ จะ ..." — กระบวนการ → ผล',
      '"kalau terus-terusan ..., akhirnya ..."',
      '"nếu cứ làm mãi thì rồi ..."',
      '「〜していると / 〜しているうちに」— 継続→結果',
    ),
    example: '열심히 공부하다 보면 실력이 늘 거예요.',
    trans: L(
      'If you keep studying hard, your skills will improve.',
      'Si sigues estudiando con esfuerzo, tu nivel irá mejorando.',
      'Si tu continues à étudier sérieusement, tu progresseras.',
      'Se continuar estudando com dedicação, vai melhorar.',
      'ถ้าเรียนหนักไปเรื่อย ๆ ฝีมือจะดีขึ้นเอง',
      'Kalau terus belajar serius, kemampuan akan meningkat.',
      'Cứ chăm chỉ học, trình độ sẽ tiến bộ.',
      '一生懸命勉強していれば、実力が伸びますよ。',
    ),
    deckId: 'topik-3',
  },

  // G165 · While doing, I realized ...
  {
    ko: '-다 보니',
    meaning: L(
      '"while doing, I came to realize / ended up ..." — gradual realization (past)',
      '"mientras lo hacía, me di cuenta / resulté ..." — descubrimiento gradual',
      '«à force de ..., je me suis rendu compte / j’ai fini par ...» — découverte graduelle',
      '"enquanto fazia, fui percebendo ..." — descoberta gradual',
      '"พอทำไปเรื่อย ๆ ก็ ... / รู้ว่า ..." — รับรู้ทีละน้อย',
      '"lama-kelamaan ... / ternyata ..."',
      '"làm mãi thì nhận ra / cuối cùng ..."',
      '「〜しているうちに / 〜してみると」— 過去の気づき',
    ),
    example: '한국어를 공부하다 보니 한국 문화도 좋아지게 됐어요.',
    trans: L(
      'As I kept studying Korean, I came to like Korean culture too.',
      'Mientras estudiaba coreano, llegué a gustarme también la cultura coreana.',
      'À force d’étudier le coréen, je me suis mis à aimer aussi la culture coréenne.',
      'À medida que estudava coreano, fui gostando também da cultura coreana.',
      'พอเรียนภาษาเกาหลีไปเรื่อย ๆ ก็เริ่มชอบวัฒนธรรมเกาหลีไปด้วย',
      'Lama-lama belajar bahasa Korea, saya jadi suka juga budayanya.',
      'Học tiếng Hàn mãi, tôi cũng dần thích văn hóa Hàn.',
      '韓国語を勉強しているうちに、韓国文化も好きになりました。',
    ),
    deckId: 'topik-3',
  },

  // G166 · Excessive repetition (irritation)
  {
    ko: '-아/어 대다',
    meaning: L(
      '"keep ...ing (excessively)" — repeated action, often annoying to speaker',
      '"hacer en exceso / no parar de ..." — acción repetida, suele irritar al hablante',
      '«n’arrête pas de ...» — action répétée, souvent agaçante',
      '"não parar de / ficar ..." — ação repetida, geralmente irritante',
      '"... ไม่หยุด / ... อย่างหนัก" — มักรำคาญ',
      '"terus-menerus ... / kebanyakan ..."',
      '"cứ ... mãi / liên tục ..."',
      '「〜してばかりいる / 〜しまくる」— 過度の反復(苛立ち)',
    ),
    example: '아이가 계속 울어 댔어요.',
    trans: L(
      'The child wouldn’t stop crying.',
      'El niño no paraba de llorar.',
      'L’enfant n’arrêtait pas de pleurer.',
      'A criança não parava de chorar.',
      'เด็กร้องไห้ไม่หยุดเลย',
      'Anak itu menangis terus-menerus.',
      'Đứa bé khóc mãi không thôi.',
      '子供が泣き続けていました。',
    ),
    deckId: 'topik-3',
  },

  // G167 · Ended up doing (undesired)
  {
    ko: '-고 말다',
    meaning: L(
      '"end up doing / finally happened ..." — usually undesired outcome',
      '"acabar haciendo / terminar por ..." — resultado final, suele ser no deseado',
      '«finir par ... (malgré soi)» — résultat final, souvent indésirable',
      '"acabar fazendo / acabou que ..." — desfecho geralmente indesejado',
      '"สุดท้ายก็ ... (เสียใจ)" — ผลที่ไม่ตั้งใจ',
      '"akhirnya malah ..." — hasil tak diinginkan',
      '"cuối cùng (vẫn) ..." — kết cục không mong muốn',
      '「〜してしまう」— 望まぬ結末',
    ),
    example: '참으려고 했는데 울고 말았어요.',
    trans: L(
      'I tried to hold back, but ended up crying.',
      'Intenté aguantar pero acabé llorando.',
      'J’ai essayé de me retenir, mais j’ai fini par pleurer.',
      'Tentei segurar, mas acabei chorando.',
      'พยายามจะอดทน แต่สุดท้ายก็ร้องไห้',
      'Saya coba tahan, tapi akhirnya menangis juga.',
      'Tôi cố nín nhưng cuối cùng vẫn khóc.',
      '我慢しようとしたのに、結局泣いてしまいました。',
    ),
    deckId: 'topik-3',
  },

  // G171 · If (hypothetical assumption)
  {
    ko: '-는다면 / -(이)라면',
    meaning: L(
      '"if (hypothetically) ..." — pure hypothesis (cf. -(으)면 real condition)',
      '"si (hipotético) ..." — hipótesis pura (cf. -(으)면 condición real)',
      '«si (hypothétique) ...» — hypothèse pure',
      '"se (hipotético) ..." — hipótese pura',
      '"ถ้าสมมุติว่า ..." — สมมุติฐาน (ต่างจาก -(으)면)',
      '"andai / seandainya ..." — hipotesis murni',
      '"giả sử / nếu giả như ..." — giả thiết',
      '「もし〜なら / 〜だとしたら」— 仮定',
    ),
    example: '내일 비가 온다면 어떻게 할 거예요?',
    trans: L(
      'If it rains tomorrow, what will you do?',
      'Si mañana llueve, ¿qué harás?',
      'S’il pleut demain, que ferez-vous ?',
      'Se chover amanhã, o que vai fazer?',
      'ถ้าพรุ่งนี้ฝนตก จะทำอย่างไร',
      'Kalau besok hujan, kamu mau bagaimana?',
      'Nếu ngày mai trời mưa thì bạn làm gì?',
      'もし明日雨が降ったらどうしますか？',
    ),
    deckId: 'topik-3',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 8 · Transversales que se introducen en este nivel
  // (auxiliares G205–G233 + adicional G240, G260, G261)
  // ─────────────────────────────────────────────────────────────────────────

  // G205 · Continuative forward (from auxiliaries.md)
  {
    ko: '-아/어 가다',
    meaning: L(
      'progressive continuative — "to keep ...ing (toward the future)"',
      'progresivo continuativo — "ir + gerundio (avanzando con el tiempo)"',
      'progressif continu — «aller en ...ant»',
      'progressivo continuativo — "ir ...ndo / continuar ..."',
      '"... ไปเรื่อย ๆ / ค่อย ๆ ... ไป" — ดำเนินไปสู่อนาคต',
      '"semakin / makin ... seiring waktu"',
      '"cứ ... dần / tiếp tục ... đi tới"',
      '「〜していく」— 未来へ向かう継続',
    ),
    example: '일이 거의 다 끝나 가요.',
    trans: L(
      'The work is almost done.',
      'El trabajo está casi terminándose.',
      'Le travail touche à sa fin.',
      'O trabalho está quase terminando.',
      'งานใกล้จะเสร็จแล้ว',
      'Pekerjaannya hampir selesai.',
      'Công việc sắp xong rồi.',
      '仕事がほとんど終わっていきます。',
    ),
    deckId: 'topik-3',
  },

  // G206 · Accumulative past (from auxiliaries.md)
  {
    ko: '-아/어 오다',
    meaning: L(
      '"has been ...ing (from the past until now)" — accumulative continuity',
      '"venir + gerundio / llevar + gerundio" — continuidad acumulativa desde el pasado',
      '«être en train de ... depuis» — continuité accumulative',
      '"vir ...ndo (do passado até agora)"',
      '"... มาตลอด / ... มาเรื่อย ๆ (จากอดีตถึงปัจจุบัน)"',
      '"sudah lama / selama ini ...-nya berlanjut"',
      '"đã ... đến nay / vẫn ... bấy lâu nay"',
      '「〜してくる / 〜してきた」— 過去から現在への蓄積',
    ),
    example: '10년 동안 한국어를 공부해 왔어요.',
    trans: L(
      'I have been studying Korean for 10 years.',
      'Llevo 10 años estudiando coreano.',
      'Cela fait 10 ans que j’étudie le coréen.',
      'Venho estudando coreano há 10 anos.',
      'ฉันเรียนภาษาเกาหลีมา 10 ปีแล้ว',
      'Saya sudah belajar bahasa Korea selama 10 tahun.',
      'Tôi đã học tiếng Hàn được 10 năm rồi.',
      '10年間韓国語を勉強してきました。',
    ),
    deckId: 'topik-3',
  },

  // G207 · Manage to / pull off (from auxiliaries.md)
  {
    ko: '-아/어 내다',
    meaning: L(
      '"manage to / pull off ..." — completion despite difficulty',
      '"lograr (completar) ..." — completar a pesar de la dificultad',
      '«parvenir à / arriver à» — accomplissement malgré l’effort',
      '"conseguir (completar) ..." — conclusão apesar da dificuldade',
      '"ทำ ... ได้สำเร็จ (แม้จะลำบาก)"',
      '"berhasil ... meski sulit"',
      '"xoay sở / vượt khó để ..."',
      '「〜し切る / 〜し遂げる」— 困難を経ての達成',
    ),
    example: '어려운 문제를 풀어 냈어요.',
    trans: L(
      'I managed to solve the difficult problem.',
      'Logré resolver el problema difícil.',
      'J’ai réussi à résoudre ce problème difficile.',
      'Consegui resolver o problema difícil.',
      'ฉันแก้โจทย์ที่ยากได้สำเร็จ',
      'Saya berhasil memecahkan soal yang sulit.',
      'Tôi đã giải được bài toán khó.',
      '難しい問題を解き切りました。',
    ),
    deckId: 'topik-3',
  },

  // G219 · Why don’t you ...? (from auxiliaries.md)
  {
    ko: '-지 그래(요)?',
    meaning: L(
      '"why don’t you ...?" — soft suggestion',
      '"¿por qué no ...? / podrías ..." — sugerencia suave',
      '«pourquoi ne pas ... ?» — suggestion douce',
      '"por que você não ...?" — sugestão suave',
      '"ทำไมไม่ ... ล่ะ?" — เสนอแนะอย่างนุ่มนวล',
      '"kenapa tidak ... saja?" — saran lembut',
      '"sao bạn không ... đi?" — gợi ý nhẹ nhàng',
      '「〜したらどう？」— 柔らかな提案',
    ),
    example: '좀 쉬지 그래요?',
    trans: L(
      'Why don’t you rest a bit?',
      '¿Por qué no descansas un poco?',
      'Pourquoi ne pas te reposer un peu ?',
      'Por que você não descansa um pouco?',
      'ทำไมไม่พักสักหน่อยล่ะ',
      'Kenapa tidak istirahat sebentar?',
      'Sao bạn không nghỉ một chút đi?',
      '少し休んだらどうですか？',
    ),
    deckId: 'topik-3',
  },

  // G220 · Should / ought to (self-exhort / mild reproach, from auxiliaries.md)
  {
    ko: '-아/어야지(요)',
    meaning: L(
      '"I should / you should ..." — self-exhortation or mild reproach',
      '"tengo que / deberías ..." — autoexhortación o leve reproche',
      '«il faut que / tu devrais ...» — auto-exhortation ou léger reproche',
      '"tenho de / você deveria ..." — autoexortação ou leve reproche',
      '"ต้อง ... สิ / ก็ควรจะ ..."',
      '"harus dong / mestinya kamu ..."',
      '"phải / lẽ ra phải ..."',
      '「〜なきゃ / 〜しないと」— 自戒・軽い咎め',
    ),
    example: '약속을 지켜야지요.',
    trans: L(
      'You should keep your promises.',
      'Hay que cumplir las promesas.',
      'Il faut tenir ses promesses.',
      'A gente tem que cumprir as promessas.',
      'ก็ต้องรักษาสัญญาสิ',
      'Mestinya janji harus ditepati.',
      'Phải giữ lời hứa chứ.',
      '約束は守らなきゃですよ。',
    ),
    deckId: 'topik-3',
  },

  // G240 · "It’s that / you see" (from gramatica_adicional.md)
  {
    ko: '-거든(요)',
    meaning: L(
      '"it’s that / you see ..." — gives an explanatory backstory',
      '"es que / verás ..." — introduce información explicativa',
      '«c’est que / tu vois ...» — explication / fond',
      '"é que / sabe ..." — fornece explicação',
      '"คือว่า / รู้ไหม ..." — เกริ่นเหตุผล',
      '"soalnya / kan ..." — penjelasan latar',
      '"là vì / là thế này ..." — đưa lý do',
      '「〜んだよ / 〜んですよ」— 説明・前置き',
    ),
    example: '어제 너무 피곤했거든요.',
    trans: L(
      'It’s that I was really tired yesterday.',
      'Es que ayer estaba muy cansado.',
      'C’est que j’étais vraiment fatigué hier.',
      'É que ontem eu estava muito cansado.',
      'คือเมื่อวานฉันเหนื่อยมาก',
      'Soalnya kemarin saya capek sekali.',
      'Là vì hôm qua tôi mệt lắm.',
      '昨日とても疲れていたんですよ。',
    ),
    deckId: 'topik-3',
  },

  // G260 · Worthy of / typical of (from gramatica_adicional.md)
  {
    ko: 'N + 답다',
    meaning: L(
      '"typical of / worthy of N" — turns a noun into an adjective: "it is fittingly N"',
      '"propio de / digno de N" — convierte N en adjetivo: "es como debe ser un N"',
      '«digne de / typique de N» — N devient adjectif',
      '"digno de / próprio de N" — N como adjetivo',
      '"สมเป็น N / เป็น N สมตัว"',
      '"layak / khas N" — N jadi adjektiva',
      '"đúng kiểu / xứng đáng là N"',
      '「N らしい」— 名詞 + 답다',
    ),
    example: '너답다.',
    trans: L(
      'That’s so you.',
      'Eso es muy propio de ti.',
      'C’est bien toi.',
      'Isso é a sua cara.',
      'สมเป็นเธอจริง ๆ',
      'Itu khas kamu sekali.',
      'Đúng kiểu của bạn rồi.',
      'いかにもあなたらしいです。',
    ),
    deckId: 'topik-3',
  },

  // G261 · Gives the impression of (from gramatica_adicional.md)
  {
    ko: 'N + 스럽다',
    meaning: L(
      '"gives the impression of N / N-ish" — appears to have the quality (cf. -답다 actually is)',
      '"da la impresión de N / parece N" — apariencia (cf. -답다 lo es realmente)',
      '«qui semble / qui a l’air de N»',
      '"que parece N / com cara de N"',
      '"ดู ... / มีลักษณะของ ..."',
      '"berkesan / kelihatannya ..."',
      '"có vẻ / mang dáng dấp ..."',
      '「N らしく見える / N っぽい」(N + 스럽다)',
    ),
    example: '사랑스러워요.',
    trans: L(
      'You’re lovely.',
      'Eres adorable.',
      'Tu es adorable.',
      'Você é uma graça.',
      'น่ารักจัง',
      'Kamu menggemaskan.',
      'Bạn thật dễ thương.',
      '愛らしいですね。',
    ),
    deckId: 'topik-3',
  },
]

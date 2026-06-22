// app/seed/cloze/n2.ts
import type { ClozeItem } from '~/lib/domain'
import { L } from '../locale'

/**
 * TOPIK-2 grammar-pattern cloze items. ko matches grammars-n2.ts verbatim.
 * Drafted + Korean-lens adversarially verified. Korean wife native review = documented final gate.
 */

export const N2_CLOZE: ClozeItem[] = [
  {
    ko: '-(으)니까',
    sentence: '길이 {} 지금 출발하세요.',
    answer: '막히니까',
    distractors: ['막혀서', '막히면', '막히고'],
    trans: L(
      'The roads are jammed, so please leave now.',
      'Hay tráfico, así que sal ahora, por favor.',
      'Les routes sont embouteillées, alors partez maintenant.',
      'As ruas estão congestionadas, então saia agora, por favor.',
      'รถติด เพราะฉะนั้นออกเดินทางตอนนี้เลยนะคะ',
      'Jalanannya macet, jadi tolong berangkat sekarang.',
      'Đường đang kẹt xe, nên hãy xuất phát ngay bây giờ.',
      '道が混んでいるから今出発してください。'
    ),
    why: L(
      'The 2nd clause is a command (출발하세요), so only -(으)니까 (막히니까) fits; -아/어서 cannot precede an imperative, -(으)면 is "if", -고 "and".',
      'La 2ª cláusula es una orden (출발하세요), así que solo va -(으)니까 (막히니까); -아/어서 no precede a un imperativo, -(으)면 es "si", -고 "y".',
      "La 2ᵉ proposition est un impératif (출발하세요), donc seul -(으)니까 (막히니까) convient ; -아/어서 ne précède pas l'impératif, -(으)면 = « si », -고 « et ».",
      'A 2ª oração é uma ordem (출발하세요), então só cabe -(으)니까 (막히니까); -아/어서 não antecede imperativo, -(으)면 é "se", -고 "e".',
      'ประโยคหลังเป็นคำสั่ง (출발하세요) จึงใช้ได้แค่ -(으)니까 (막히니까) ส่วน -아/어서 นำหน้าคำสั่งไม่ได้, -(으)면 "ถ้า", -고 "และ"',
      'Klausa kedua perintah (출발하세요), jadi hanya -(으)니까 (막히니까) yang cocok; -아/어서 tak mendahului imperatif, -(으)면 "kalau", -고 "dan".',
      'Vế sau là mệnh lệnh (출발하세요), nên chỉ dùng -(으)니까 (막히니까); -아/어서 không đứng trước mệnh lệnh, -(으)면 là "nếu", -고 là "và".',
      '後ろが命令(출발하세요)なので -(으)니까(막히니까)のみ。-아/어서 は命令の前に置けず、-(으)면 は「たら」、-고 は「て」。'
    )
  },
  {
    ko: '-(으)니까',
    sentence: '이 식당은 너무 {} 다른 데로 갑시다.',
    answer: '비싸니까',
    distractors: ['비싸서', '비싸면', '비싸지만'],
    trans: L(
      "This restaurant is too expensive, so let's go somewhere else.",
      'Este restaurante es demasiado caro, así que vayamos a otro lugar.',
      'Ce restaurant est trop cher, alors allons ailleurs.',
      'Este restaurante é caro demais, então vamos a outro lugar.',
      'ร้านนี้แพงเกินไป ไปที่อื่นกันเถอะ',
      'Restoran ini terlalu mahal, jadi ayo pergi ke tempat lain.',
      'Quán này đắt quá, nên chúng ta đi chỗ khác đi.',
      'この食堂は高すぎるから、ほかの店に行きましょう。'
    ),
    why: L(
      'The 2nd clause is a propositive (갑시다 "let\'s go"), which requires -(으)니까 (비싸니까); -아/어서 cannot precede a suggestion, -(으)면 is "if", -지만 "but".',
      'La 2ª cláusula es una propuesta (갑시다 "vayamos"), que exige -(으)니까 (비싸니까); -아/어서 no precede a una propuesta, -(으)면 "si", -지만 "pero".',
      "La 2ᵉ proposition est une suggestion (갑시다 « allons »), qui exige -(으)니까 (비싸니까) ; -아/어서 ne précède pas une suggestion, -(으)면 « si », -지만 « mais ».",
      'A 2ª oração é uma proposta (갑시다 "vamos"), que exige -(으)니까 (비싸니까); -아/어서 não antecede sugestão, -(으)면 "se", -지만 "mas".',
      'ประโยคหลังเป็นการชวน (갑시다) ต้องใช้ -(으)니까 (비싸니까) ส่วน -아/어서 นำหน้าการชวนไม่ได้, -(으)면 "ถ้า", -지만 "แต่"',
      'Klausa kedua ajakan (갑시다), menuntut -(으)니까 (비싸니까); -아/어서 tak mendahului ajakan, -(으)면 "kalau", -지만 "tapi".',
      'Vế sau là lời rủ (갑시다), đòi hỏi -(으)니까 (비싸니까); -아/어서 không đứng trước lời rủ, -(으)면 "nếu", -지만 "nhưng".',
      '後ろが勧誘(갑시다)なので -(으)니까(비싸니까)が必要。-아/어서 は勧誘の前に置けず、-(으)면 は「たら」、-지만 は「が」。'
    )
  },
  {
    ko: '-(으)니까',
    sentence: '손님이 다 {} 이제 문을 닫읍시다.',
    answer: '갔으니까',
    distractors: ['가서', '가면', '가고'],
    trans: L(
      "All the customers have left, so let's close up now.",
      'Ya se fueron todos los clientes, así que cerremos ahora.',
      'Tous les clients sont partis, alors fermons maintenant.',
      'Todos os clientes já foram, então vamos fechar agora.',
      'ลูกค้าไปกันหมดแล้ว ปิดร้านกันเถอะ',
      'Semua pelanggan sudah pulang, jadi ayo tutup sekarang.',
      'Khách đã về hết rồi, nên giờ chúng ta đóng cửa đi.',
      'お客さんが全員帰ったから、もう店を閉めましょう。'
    ),
    why: L(
      'The reason is past ("have left") and the 2nd clause is a propositive (닫읍시다), both needing -(으)니까 (갔으니까); -아/어서 takes no past marker and cannot precede a suggestion, -(으)면 "if", -고 "and".',
      'La razón es pasada ("se fueron") y la 2ª cláusula es propuesta (닫읍시다), ambas exigen -(으)니까 (갔으니까); -아/어서 no lleva pasado ni precede a propuesta, -(으)면 "si", -고 "y".',
      "La raison est au passé (« sont partis ») et la 2ᵉ proposition est une suggestion (닫읍시다), d'où -(으)니까 (갔으니까) ; -아/어서 n'accepte pas le passé ni la suggestion, -(으)면 « si », -고 « et ».",
      'O motivo é passado ("foram") e a 2ª oração é proposta (닫읍시다), ambos exigem -(으)니까 (갔으니까); -아/어서 não leva passado nem antecede sugestão, -(으)면 "se", -고 "e".',
      'เหตุผลเป็นอดีต ("ไปแล้ว") และประโยคหลังเป็นการชวน (닫읍시다) ทั้งคู่ต้องใช้ -(으)니까 (갔으니까) ส่วน -아/어서 เติมอดีตและนำหน้าการชวนไม่ได้, -(으)면 "ถ้า", -고 "และ"',
      'Alasan lampau ("sudah pulang") dan klausa kedua ajakan (닫읍시다), keduanya butuh -(으)니까 (갔으니까); -아/어서 tak menerima penanda lampau maupun ajakan, -(으)면 "kalau", -고 "dan".',
      'Lý do ở quá khứ ("đã về") và vế sau là lời rủ (닫읍시다), đều cần -(으)니까 (갔으니까); -아/어서 không gắn quá khứ và không đứng trước lời rủ, -(으)면 "nếu", -고 "và".',
      '理由が過去(「帰った」)で後ろが勧誘(닫읍시다)なので -(으)니까(갔으니까)。-아/어서 は過去も付かず勧誘の前にも置けず、-(으)면 は「たら」、-고 は「て」。'
    )
  },
  {
    ko: '-기 전에',
    sentence: '밥을 {} 손을 깨끗이 씻으세요.',
    answer: '먹기 전에',
    distractors: ['먹은 후에', '먹으니까', '먹어서'],
    trans: L(
      'Before you eat, wash your hands thoroughly.',
      'Antes de comer, lávate bien las manos.',
      'Avant de manger, lave-toi bien les mains.',
      'Antes de comer, lave bem as mãos.',
      'ก่อนกินข้าว ล้างมือให้สะอาดด้วยนะ',
      'Sebelum makan, cuci tanganmu sampai bersih.',
      'Trước khi ăn, hãy rửa tay thật sạch.',
      'ご飯を食べる前に、手をきれいに洗ってください。'
    ),
    why: L(
      'Hand-washing happens BEFORE eating, so -기 전에 (먹기 전에) fits; -(으)ㄴ 후에 means "after" (reversed order), -(으)니까 "because", -아/어서 "because/and" — none means "before".',
      'Lavarse las manos ocurre ANTES de comer, así que va -기 전에 (먹기 전에); -(으)ㄴ 후에 es "después" (orden invertido), -(으)니까 "porque", -아/어서 "porque/y".',
      "Se laver les mains se fait AVANT de manger, donc -기 전에 (먹기 전에) ; -(으)ㄴ 후에 = « après » (ordre inversé), -(으)니까 « parce que », -아/어서 « parce que/et ».",
      'Lavar as mãos ocorre ANTES de comer, então cabe -기 전에 (먹기 전에); -(으)ㄴ 후에 é "depois" (ordem invertida), -(으)니까 "porque", -아/어서 "porque/e".',
      'ล้างมือเกิดขึ้น "ก่อน" กินข้าว จึงใช้ -기 전에 (먹기 전에) ส่วน -(으)ㄴ 후에 "หลังจาก" (สลับลำดับ), -(으)니까 "เพราะ", -아/어서 "เพราะ/แล้ว"',
      'Cuci tangan terjadi SEBELUM makan, jadi -기 전에 (먹기 전에) cocok; -(으)ㄴ 후에 "sesudah" (urutan terbalik), -(으)니까 "karena", -아/어서 "karena/lalu".',
      'Rửa tay diễn ra TRƯỚC khi ăn, nên dùng -기 전에 (먹기 전에); -(으)ㄴ 후에 là "sau khi" (đảo thứ tự), -(으)니까 "vì", -아/어서 "vì/rồi".',
      '手洗いは食べる「前」なので -기 전에(먹기 전에)。-(으)ㄴ 후에 は「後で」(順序が逆)、-(으)니까 は「から」、-아/어서 は「ので」。'
    )
  },
  {
    ko: '-(으)ㄴ 후에 / 다음에',
    sentence: '숙제를 다 {} 게임을 할 거예요.',
    answer: '한 후에',
    distractors: ['하기 전에', '하거나', '하지만'],
    trans: L(
      "After I finish all my homework, I'm going to play games.",
      'Después de terminar toda la tarea, voy a jugar videojuegos.',
      'Après avoir fini tous mes devoirs, je vais jouer aux jeux vidéo.',
      'Depois de terminar toda a lição, vou jogar videogame.',
      'หลังจากทำการบ้านเสร็จหมด ฉันจะเล่นเกม',
      'Setelah menyelesaikan semua PR, saya akan main gim.',
      'Sau khi làm xong hết bài tập, tôi sẽ chơi game.',
      '宿題を全部やった後に、ゲームをするつもりです。'
    ),
    why: L(
      'Gaming comes AFTER finishing homework, so -(으)ㄴ 후에 (한 후에) fits; -기 전에 means "before" (reversed), -거나 "or", -지만 "but" — none gives the after-sequence.',
      'Jugar ocurre DESPUÉS de terminar la tarea, así que va -(으)ㄴ 후에 (한 후에); -기 전에 es "antes" (invertido), -거나 "o", -지만 "pero".',
      "Le jeu vient APRÈS les devoirs, donc -(으)ㄴ 후에 (한 후에) ; -기 전에 = « avant » (inversé), -거나 « ou », -지만 « mais ».",
      'Jogar vem DEPOIS da lição, então cabe -(으)ㄴ 후에 (한 후에); -기 전에 é "antes" (invertido), -거나 "ou", -지만 "mas".',
      'เล่นเกมเกิด "หลังจาก" ทำการบ้านเสร็จ จึงใช้ -(으)ㄴ 후에 (한 후에) ส่วน -기 전에 "ก่อน" (สลับ), -거나 "หรือ", -지만 "แต่"',
      'Main gim terjadi SETELAH selesai PR, jadi -(으)ㄴ 후에 (한 후에) cocok; -기 전에 "sebelum" (terbalik), -거나 "atau", -지만 "tapi".',
      'Chơi game diễn ra SAU khi xong bài tập, nên dùng -(으)ㄴ 후에 (한 후에); -기 전에 là "trước khi" (đảo), -거나 "hoặc", -지만 "nhưng".',
      'ゲームは宿題の「後」なので -(으)ㄴ 후에(한 후에)。-기 전에 は「前に」(逆)、-거나 は「か」、-지만 は「が」。'
    )
  },
  {
    ko: '-(으)면 안 되다',
    sentence: '도서관에서는 큰 소리로 {}.',
    answer: '떠들면 안 돼요',
    distractors: ['떠들어도 돼요', '떠들고 싶어요', '떠들어 주세요'],
    trans: L(
      'You must not make noise loudly in the library.',
      'No se debe hacer ruido en voz alta en la biblioteca.',
      'Il ne faut pas faire de bruit fort dans la bibliothèque.',
      'Não se pode fazer barulho alto na biblioteca.',
      'ในห้องสมุดห้ามส่งเสียงดัง',
      'Di perpustakaan tidak boleh ribut dengan suara keras.',
      'Trong thư viện không được làm ồn lớn tiếng.',
      '図書館では大きな声で騒いではいけません。'
    ),
    why: L(
      'A library forbids loud noise, so the prohibition -(으)면 안 되다 (떠들면 안 돼요) fits; -아/어도 되다 means "may/it\'s OK" (opposite), -고 싶다 "want to", -아/어 주세요 "please do for me".',
      'La biblioteca prohíbe el ruido, así que va la prohibición -(으)면 안 되다 (떠들면 안 돼요); -아/어도 되다 es "se permite" (opuesto), -고 싶다 "querer", -아/어 주세요 "por favor hazlo".',
      "La bibliothèque interdit le bruit, donc l'interdiction -(으)면 안 되다 (떠들면 안 돼요) ; -아/어도 되다 = « c'est permis » (contraire), -고 싶다 « vouloir », -아/어 주세요 « fais-le s'il te plaît ».",
      'A biblioteca proíbe barulho, então cabe a proibição -(으)면 안 되다 (떠들면 안 돼요); -아/어도 되다 é "é permitido" (oposto), -고 싶다 "querer", -아/어 주세요 "faça por favor".',
      'ห้องสมุดห้ามส่งเสียงดัง จึงใช้รูปห้าม -(으)면 안 되다 (떠들면 안 돼요) ส่วน -아/어도 되다 "อนุญาต" (ตรงข้าม), -고 싶다 "อยาก", -아/어 주세요 "ช่วยทำให้หน่อย"',
      'Perpustakaan melarang keributan, jadi larangan -(으)면 안 되다 (떠들면 안 돼요) cocok; -아/어도 되다 "boleh" (kebalikan), -고 싶다 "ingin", -아/어 주세요 "tolong lakukan".',
      'Thư viện cấm làm ồn, nên dùng dạng cấm -(으)면 안 되다 (떠들면 안 돼요); -아/어도 되다 là "được phép" (ngược lại), -고 싶다 "muốn", -아/어 주세요 "hãy làm giúp".',
      '図書館は騒音禁止なので禁止の -(으)면 안 되다(떠들면 안 돼요)。-아/어도 되다 は「してもよい」(反対)、-고 싶다 は「たい」、-아/어 주세요 は「してください」。'
    )
  },
  {
    ko: '-(으)려고',
    sentence: '친구 생일 선물을 {} 백화점에 갔어요.',
    answer: '사려고',
    distractors: ['사니까', '사면', '사거나'],
    trans: L(
      'I went to the department store to buy a birthday present for my friend.',
      'Fui a los grandes almacenes para comprar un regalo de cumpleaños para mi amigo.',
      "Je suis allé au grand magasin pour acheter un cadeau d'anniversaire à mon ami.",
      'Fui ao shopping para comprar um presente de aniversário para meu amigo.',
      'ฉันไปห้างสรรพสินค้าเพื่อซื้อของขวัญวันเกิดให้เพื่อน',
      'Saya pergi ke pusat perbelanjaan untuk membeli hadiah ulang tahun teman.',
      'Tôi đến trung tâm thương mại để mua quà sinh nhật cho bạn.',
      '友だちの誕生日プレゼントを買おうとデパートに行きました。'
    ),
    why: L(
      'The blank states the intention/purpose behind going, so -(으)려고 (사려고) fits; -(으)니까 is "because", -(으)면 is "if", -거나 is "or" — none expresses purpose.',
      'El hueco indica la intención/propósito de ir, así que va -(으)려고 (사려고); -(으)니까 "porque", -(으)면 "si", -거나 "o" — ninguno expresa propósito.',
      "Le blanc exprime l'intention/le but du déplacement, donc -(으)려고 (사려고) ; -(으)니까 = « parce que », -(으)면 = « si », -거나 = « ou ».",
      'A lacuna indica a intenção/propósito de ir, então cabe -(으)려고 (사려고); -(으)니까 "porque", -(으)면 "se", -거나 "ou".',
      'ช่องว่างบอกความตั้งใจ/จุดประสงค์ของการไป จึงใช้ -(으)려고 (사려고) ส่วน -(으)니까 "เพราะ", -(으)면 "ถ้า", -거나 "หรือ"',
      'Bagian rumpang menyatakan niat/tujuan pergi, jadi -(으)려고 (사려고) cocok; -(으)니까 "karena", -(으)면 "kalau", -거나 "atau".',
      'Chỗ trống nêu ý định/mục đích của việc đi, nên dùng -(으)려고 (사려고); -(으)니까 là "vì", -(으)면 là "nếu", -거나 là "hoặc".',
      '空所は行く目的・意図を表すので -(으)려고(사려고)。-(으)니까 は「から」、-(으)면 は「たら」、-거나 は「か」。'
    )
  },
  {
    ko: '-(으)려고',
    sentence: '일찍 {} 방의 불을 껐어요.',
    answer: '자려고',
    distractors: ['자니까', '자면', '자거나'],
    trans: L(
      'I turned off the room light in order to sleep early.',
      'Apagué la luz de la habitación para dormir temprano.',
      "J'ai éteint la lumière de la chambre pour dormir tôt.",
      'Apaguei a luz do quarto para dormir cedo.',
      'ฉันปิดไฟในห้องเพื่อจะได้นอนเร็ว',
      'Saya mematikan lampu kamar supaya bisa tidur lebih awal.',
      'Tôi tắt đèn phòng để đi ngủ sớm.',
      '早く寝ようと部屋の電気を消しました。'
    ),
    why: L(
      'The blank gives the purpose of turning off the light, so -(으)려고 (자려고) fits; -(으)니까 "because", -(으)면 "if", and -거나 "or" do not express intended purpose here.',
      'El hueco da el propósito de apagar la luz, así que va -(으)려고 (자려고); -(으)니까 "porque", -(으)면 "si", -거나 "o" no expresan el propósito aquí.',
      "Le blanc donne le but d'éteindre la lumière, donc -(으)려고 (자려고) ; -(으)니까 « parce que », -(으)면 « si », -거나 « ou » n'expriment pas le but ici.",
      'A lacuna dá o propósito de apagar a luz, então cabe -(으)려고 (자려고); -(으)니까 "porque", -(으)면 "se", -거나 "ou" não expressam propósito aqui.',
      'ช่องว่างบอกจุดประสงค์ของการปิดไฟ จึงใช้ -(으)려고 (자려고) ส่วน -(으)니까 "เพราะ", -(으)면 "ถ้า", -거나 "หรือ" ไม่บอกจุดประสงค์ในที่นี้',
      'Bagian rumpang memberi tujuan mematikan lampu, jadi -(으)려고 (자려고) cocok; -(으)니까 "karena", -(으)면 "kalau", -거나 "atau" tidak menyatakan tujuan di sini.',
      'Chỗ trống nêu mục đích tắt đèn, nên dùng -(으)려고 (자려고); -(으)니까 "vì", -(으)면 "nếu", -거나 "hoặc" không diễn tả mục đích ở đây.',
      '空所は電気を消した目的を表すので -(으)려고(자려고)。-(으)니까「から」、-(으)면「たら」、-거나「か」はここでは目的を表さない。'
    )
  },
  {
    ko: '-아/어야 하다 / 되다',
    sentence: '내일 아침에 시험이 있어서 일찍 {}.',
    answer: '일어나야 해요',
    distractors: ['일어나려고 해요', '일어나도 돼요', '일어나고 싶어요'],
    trans: L(
      'I have an exam tomorrow morning, so I have to get up early.',
      'Tengo un examen mañana por la mañana, así que tengo que levantarme temprano.',
      'J\'ai un examen demain matin, donc je dois me lever tôt.',
      'Tenho prova amanhã de manhã, então tenho que acordar cedo.',
      'พรุ่งนี้เช้ามีสอบ เลยต้องตื่นเช้า',
      'Besok pagi ada ujian, jadi saya harus bangun pagi.',
      'Sáng mai có bài kiểm tra nên tôi phải dậy sớm.',
      '明日の朝に試験があるので、早く起きなければなりません。'
    ),
    why: L(
      'The exam makes getting up early an obligation, so -아/어야 하다 (일어나야 해요) fits; -(으)려고 하다 is mere intention, -아/어도 되다 means "may/it\'s allowed", -고 싶다 "want to" — none states necessity.',
      'El examen vuelve obligatorio levantarse temprano, así que va -아/어야 하다 (일어나야 해요); -(으)려고 하다 es solo intención, -아/어도 되다 es "se permite", -고 싶다 "querer".',
      "L'examen rend obligatoire le lever tôt, donc -아/어야 하다 (일어나야 해요) ; -(으)려고 하다 n'est qu'une intention, -아/어도 되다 = « c'est permis », -고 싶다 « vouloir ».",
      'A prova torna obrigatório acordar cedo, então cabe -아/어야 하다 (일어나야 해요); -(으)려고 하다 é só intenção, -아/어도 되다 é "é permitido", -고 싶다 "querer".',
      'การสอบทำให้ต้องตื่นเช้า จึงใช้ -아/어야 하다 (일어나야 해요) ส่วน -(으)려고 하다 แค่ความตั้งใจ, -아/어도 되다 "อนุญาต", -고 싶다 "อยาก"',
      'Ujian membuat bangun pagi jadi kewajiban, jadi -아/어야 하다 (일어나야 해요) cocok; -(으)려고 하다 hanya niat, -아/어도 되다 "boleh", -고 싶다 "ingin".',
      'Bài kiểm tra khiến việc dậy sớm thành bắt buộc, nên dùng -아/어야 하다 (일어나야 해요); -(으)려고 하다 chỉ là ý định, -아/어도 되다 là "được phép", -고 싶다 "muốn".',
      '試験のせいで早起きが義務になるので -아/어야 하다(일어나야 해요)。-(으)려고 하다 は意図、-아/어도 되다 は「してもよい」、-고 싶다 は「たい」。'
    )
  },
  {
    ko: '-아/어 있다',
    sentence: '친구가 의자에 {}.',
    answer: '앉아 있어요',
    distractors: ['앉고 있어요', '앉아요', '앉았어요'],
    trans: L(
      'My friend is sitting in the chair (is in a seated state).',
      'Mi amigo está sentado en la silla (permanece en estado sentado).',
      'Mon ami est assis sur la chaise (reste dans un état assis).',
      'Meu amigo está sentado na cadeira (permanece no estado sentado).',
      'เพื่อนนั่งอยู่บนเก้าอี้ (อยู่ในสภาพนั่ง)',
      'Teman saya sedang duduk di kursi (berada dalam keadaan duduk).',
      'Bạn tôi đang ngồi trên ghế (đang trong trạng thái ngồi).',
      '友だちが椅子に座っています（座った状態が続いています）。'
    ),
    why: L(
      'The sentence describes a resulting STATE (being seated after sitting down), so -아/어 있다 (앉아 있어요) is correct; -고 있다 (앉고 있어요) would mean the act of sitting down is in progress — wrong for a sustained posture.',
      'La oración describe un ESTADO resultante (estar sentado tras haberse sentado), por eso -아/어 있다 (앉아 있어요) es correcto; -고 있다 (앉고 있어요) significaría que la acción de sentarse está en curso — incorrecto para una postura sostenida.',
      "La phrase décrit un ÉTAT résultant (être assis après s'être assis), donc -아/어 있다 (앉아 있어요) est correct ; -고 있다 (앉고 있어요) signifierait que l'acte de s'asseoir est en cours — incorrect pour une posture maintenue.",
      'A frase descreve um ESTADO resultante (estar sentado após sentar-se), por isso -아/어 있다 (앉아 있어요) é correto; -고 있다 (앉고 있어요) indicaria que a ação de sentar está em curso — errado para uma postura mantida.',
      'ประโยคนี้บอกสภาพผล (อยู่ในท่านั่งหลังจากนั่งลงแล้ว) จึงใช้ -아/어 있다 (앉아 있어요) ส่วน -고 있다 (앉고 있어요) หมายถึงการนั่งกำลังดำเนินอยู่ — ผิดสำหรับท่าทางที่คงอยู่',
      'Kalimat ini menggambarkan KEADAAN hasil (duduk setelah aksi duduk selesai), jadi -아/어 있다 (앉아 있어요) benar; -고 있다 (앉고 있어요) berarti aksi duduk sedang berlangsung — salah untuk postur yang bertahan.',
      'Câu này mô tả TRẠNG THÁI kết quả (đang ngồi sau khi đã ngồi xuống), nên -아/어 있다 (앉아 있어요) đúng; -고 있다 (앉고 있어요) có nghĩa là hành động ngồi đang diễn ra — sai cho tư thế kéo dài.',
      'この文は結果の状態（座り終えた後の「座っている」状態）を表すので -아/어 있다(앉아 있어요)が正しい。-고 있다(앉고 있어요)は「座る動作が進行中」を意味し、持続姿勢には誤り。'
    )
  },
  {
    ko: '-아/어 있다',
    sentence: '창문이 {}.',
    answer: '열려 있어요',
    distractors: ['열리고 있어요', '열려요', '열렸어요'],
    trans: L(
      'The window is open (remains in an open state).',
      'La ventana está abierta (permanece en estado abierto).',
      'La fenêtre est ouverte (reste dans un état ouvert).',
      'A janela está aberta (permanece no estado aberto).',
      'หน้าต่างเปิดอยู่ (อยู่ในสภาพเปิด)',
      'Jendelanya terbuka (berada dalam keadaan terbuka).',
      'Cửa sổ đang mở (đang trong trạng thái mở).',
      '窓が開いています（開いた状態が続いています）。'
    ),
    why: L(
      'The sentence describes a resulting STATE (the window being open after it was opened), so -아/어 있다 (열려 있어요) is correct; -고 있다 (열리고 있어요) would mean the window is in the process of opening — wrong for a persisting open state.',
      'La oración describe un ESTADO resultante (la ventana abierta tras haberse abierto), por eso -아/어 있다 (열려 있어요) es correcto; -고 있다 (열리고 있어요) significaría que la ventana está en proceso de abrirse — incorrecto para un estado abierto persistente.',
      "La phrase décrit un ÉTAT résultant (la fenêtre ouverte après avoir été ouverte), donc -아/어 있다 (열려 있어요) est correct ; -고 있다 (열리고 있어요) signifierait que la fenêtre est en train de s'ouvrir — incorrect pour un état ouvert persistant.",
      'A frase descreve um ESTADO resultante (a janela aberta após ter sido aberta), por isso -아/어 있다 (열려 있어요) é correto; -고 있다 (열리고 있어요) indicaria que a janela está em processo de abrir — errado para um estado aberto persistente.',
      'ประโยคนี้บอกสภาพผล (หน้าต่างอยู่ในสภาพเปิดหลังจากถูกเปิดแล้ว) จึงใช้ -아/어 있다 (열려 있어요) ส่วน -고 있다 (열리고 있어요) หมายถึงหน้าต่างกำลังเปิดอยู่ — ผิดสำหรับสภาพเปิดที่คงอยู่',
      'Kalimat ini menggambarkan KEADAAN hasil (jendela terbuka setelah proses membuka selesai), jadi -아/어 있다 (열려 있어요) benar; -고 있다 (열리고 있어요) berarti jendela sedang dalam proses membuka — salah untuk keadaan terbuka yang bertahan.',
      'Câu này mô tả TRẠNG THÁI kết quả (cửa sổ đang ở trạng thái mở sau khi đã được mở), nên -아/어 있다 (열려 있어요) đúng; -고 있다 (열리고 있어요) có nghĩa là cửa sổ đang trong quá trình mở — sai cho trạng thái mở kéo dài.',
      'この文は結果の状態（開けられた後の「開いている」状態）を表すので -아/어 있다(열려 있어요)が正しい。-고 있다(열리고 있어요)は「窓が開く動作が進行中」を意味し、持続状態には誤り。'
    )
  }
]

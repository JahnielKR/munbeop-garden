-- 20260603000003_seed_catalog.sql
-- Plan 2, Task P2.5 — populate the catalog tables.
--
-- Mirrors `app/seed/grammars.ts` and `app/seed/contexts.ts` exactly so
-- the localStorage seed (Plan 1) and the Supabase seed (Plan 2) agree.
--
-- Idempotent: `ON CONFLICT DO NOTHING` keeps the migration safe to re-apply.
-- Updating an existing catalog entry must be a separate, deliberate
-- migration (avoids silently overwriting user-visible data on every push).

-- =====================================================================
-- Grammars (14 items × 8 locales)
-- =====================================================================
INSERT INTO public.grammars (ko, meaning, example, trans, deck_id) VALUES
(
  '에서/부터~까지',
  '{"en":"from...to (place/time)","es":"desde...hasta","fr":"de...à","pt-BR":"de...até","th":"จาก...ถึง","id":"dari...sampai","vi":"từ...đến","ja":"〜から〜まで"}',
  '9시부터 5시까지 일해요.',
  '{"en":"I work from 9 to 5.","es":"Trabajo de 9 a 5.","fr":"Je travaille de 9h à 17h.","pt-BR":"Trabalho das 9 às 5.","th":"ฉันทำงานตั้งแต่ 9 โมงถึง 5 โมง","id":"Saya bekerja dari jam 9 sampai jam 5.","vi":"Tôi làm việc từ 9 giờ đến 5 giờ.","ja":"9時から5時まで働きます。"}',
  'general'
),
(
  '-(으)면',
  '{"en":"if / when (conditional)","es":"si / cuando (condicional)","fr":"si / quand (conditionnel)","pt-BR":"se / quando (condicional)","th":"ถ้า / เมื่อ","id":"jika / kalau","vi":"nếu / khi","ja":"もし〜たら / 〜ば"}',
  '시간이 있으면 같이 가요.',
  '{"en":"If you have time, let''s go together.","es":"Si tienes tiempo, vamos juntos.","fr":"Si tu as le temps, allons-y ensemble.","pt-BR":"Se tiver tempo, vamos juntos.","th":"ถ้ามีเวลา ไปด้วยกันนะ","id":"Kalau ada waktu, ayo pergi bersama.","vi":"Nếu có thời gian, đi cùng nhau nhé.","ja":"時間があれば一緒に行きましょう。"}',
  'general'
),
(
  '-(으)니까',
  '{"en":"because (allows imperative/suggestion)","es":"porque (permite imperativo)","fr":"parce que (permet l''impératif)","pt-BR":"porque (permite imperativo)","th":"เพราะ (ใช้กับคำสั่งได้)","id":"karena (boleh dengan perintah)","vi":"bởi vì (cho phép mệnh lệnh)","ja":"〜から/ので (命令OK)"}',
  '비가 오니까 우산을 가져가세요.',
  '{"en":"It''s raining, so take an umbrella.","es":"Como llueve, lleva paraguas.","fr":"Il pleut, alors prends un parapluie.","pt-BR":"Como está chovendo, leva guarda-chuva.","th":"ฝนตก เอาร่มไปด้วยนะ","id":"Karena hujan, bawa payung ya.","vi":"Vì trời mưa, hãy mang ô đi.","ja":"雨が降っているから傘を持って行ってください。"}',
  'general'
),
(
  '는/은',
  '{"en":"topic particle","es":"partícula de tema","fr":"particule de thème","pt-BR":"partícula de tópico","th":"อนุภาคหัวเรื่อง","id":"partikel topik","vi":"tiểu từ chủ đề","ja":"主題助詞「は」"}',
  '저는 학생이에요.',
  '{"en":"I am a student.","es":"Yo soy estudiante.","fr":"Je suis étudiant.","pt-BR":"Eu sou estudante.","th":"ฉันเป็นนักเรียน","id":"Saya seorang pelajar.","vi":"Tôi là học sinh.","ja":"私は学生です。"}',
  'general'
),
(
  '이/가',
  '{"en":"subject particle","es":"partícula de sujeto","fr":"particule de sujet","pt-BR":"partícula de sujeito","th":"อนุภาคประธาน","id":"partikel subjek","vi":"tiểu từ chủ ngữ","ja":"主語助詞「が」"}',
  '고양이가 귀여워요.',
  '{"en":"The cat is cute.","es":"El gato es lindo.","fr":"Le chat est mignon.","pt-BR":"O gato é fofo.","th":"แมวน่ารัก","id":"Kucingnya lucu.","vi":"Con mèo dễ thương.","ja":"猫がかわいいです。"}',
  'general'
),
(
  '을/를',
  '{"en":"object particle","es":"partícula de objeto","fr":"particule d''objet","pt-BR":"partícula de objeto","th":"อนุภาคกรรม","id":"partikel objek","vi":"tiểu từ tân ngữ","ja":"目的語助詞「を」"}',
  '책을 읽어요.',
  '{"en":"I read a book.","es":"Leo un libro.","fr":"Je lis un livre.","pt-BR":"Eu leio um livro.","th":"ฉันอ่านหนังสือ","id":"Saya membaca buku.","vi":"Tôi đọc sách.","ja":"本を読みます。"}',
  'general'
),
(
  '한테/한테서',
  '{"en":"to / from (person) — informal","es":"a / de (persona) — informal","fr":"à / de (personne) — informel","pt-BR":"para / de (pessoa) — informal","th":"ให้/จาก (คน) — ไม่ทางการ","id":"kepada / dari (orang) — informal","vi":"cho / từ (người) — không trang trọng","ja":"〜に/から (人・口語)"}',
  '친구한테 선물을 줬어요.',
  '{"en":"I gave a gift to my friend.","es":"Le di un regalo a mi amigo.","fr":"J''ai donné un cadeau à mon ami.","pt-BR":"Dei um presente para meu amigo.","th":"ฉันให้ของขวัญเพื่อน","id":"Saya memberi hadiah kepada teman.","vi":"Tôi đã tặng quà cho bạn.","ja":"友達にプレゼントをあげました。"}',
  'general'
),
(
  '-(으)러',
  '{"en":"in order to (purpose + motion verb)","es":"para (propósito + verbo de movimiento)","fr":"pour (but + verbe de mouvement)","pt-BR":"para (propósito + verbo de movimento)","th":"เพื่อ (กับกริยาเคลื่อนไหว)","id":"untuk (tujuan + verba gerak)","vi":"để (mục đích + động từ di chuyển)","ja":"〜しに (移動の目的)"}',
  '밥 먹으러 가요.',
  '{"en":"I''m going to eat.","es":"Voy a comer.","fr":"Je vais manger.","pt-BR":"Vou comer.","th":"ฉันจะไปกินข้าว","id":"Saya pergi makan.","vi":"Tôi đi ăn cơm.","ja":"ご飯を食べに行きます。"}',
  'general'
),
(
  '-(으)려고',
  '{"en":"with the intention of","es":"con la intención de","fr":"avec l''intention de","pt-BR":"com a intenção de","th":"ตั้งใจจะ","id":"berniat untuk","vi":"với ý định","ja":"〜しようと"}',
  '한국어를 배우려고 해요.',
  '{"en":"I intend to learn Korean.","es":"Tengo la intención de aprender coreano.","fr":"J''ai l''intention d''apprendre le coréen.","pt-BR":"Tenho a intenção de aprender coreano.","th":"ฉันตั้งใจจะเรียนภาษาเกาหลี","id":"Saya berniat belajar bahasa Korea.","vi":"Tôi định học tiếng Hàn.","ja":"韓国語を学ぼうと思います。"}',
  'general'
),
(
  '-고 싶다',
  '{"en":"want to do something","es":"querer hacer algo","fr":"vouloir faire","pt-BR":"querer fazer algo","th":"อยากทำ","id":"ingin melakukan","vi":"muốn làm","ja":"〜したい"}',
  '드라마를 보고 싶어요.',
  '{"en":"I want to watch a drama.","es":"Quiero ver un drama.","fr":"Je veux regarder un drama.","pt-BR":"Quero ver um drama.","th":"ฉันอยากดูซีรีส์","id":"Saya ingin menonton drama.","vi":"Tôi muốn xem phim.","ja":"ドラマを見たいです。"}',
  'general'
),
(
  '못',
  '{"en":"cannot (impossibility)","es":"no poder (imposibilidad)","fr":"ne pas pouvoir","pt-BR":"não conseguir","th":"ไม่สามารถ","id":"tidak bisa","vi":"không thể","ja":"できない (不可能)"}',
  '매운 거 못 먹어요.',
  '{"en":"I can''t eat spicy food.","es":"No puedo comer picante.","fr":"Je ne peux pas manger épicé.","pt-BR":"Não consigo comer picante.","th":"ฉันกินเผ็ดไม่ได้","id":"Saya tidak bisa makan pedas.","vi":"Tôi không ăn cay được.","ja":"辛いものは食べられません。"}',
  'general'
),
(
  '-지 않다',
  '{"en":"not (formal negation)","es":"no (negación formal)","fr":"ne ... pas (négation formelle)","pt-BR":"não (negação formal)","th":"ไม่ (ปฏิเสธทางการ)","id":"tidak (negasi formal)","vi":"không (phủ định trang trọng)","ja":"〜ない (改まった否定)"}',
  '오늘은 춥지 않아요.',
  '{"en":"It''s not cold today.","es":"Hoy no hace frío.","fr":"Il ne fait pas froid aujourd''hui.","pt-BR":"Hoje não está frio.","th":"วันนี้ไม่หนาว","id":"Hari ini tidak dingin.","vi":"Hôm nay không lạnh.","ja":"今日は寒くないです。"}',
  'general'
),
(
  '-고',
  '{"en":"and (action connector)","es":"y (conectivo entre acciones)","fr":"et (connecteur d''actions)","pt-BR":"e (conector de ações)","th":"แล้วก็ (เชื่อมการกระทำ)","id":"lalu / dan (penghubung aksi)","vi":"và (nối hành động)","ja":"〜して (動作の連結)"}',
  '숙제를 하고 잤어요.',
  '{"en":"I did my homework and went to sleep.","es":"Hice la tarea y me dormí.","fr":"J''ai fait mes devoirs et je suis allé dormir.","pt-BR":"Fiz a lição e fui dormir.","th":"ทำการบ้านแล้วก็นอน","id":"Saya kerjakan PR lalu tidur.","vi":"Tôi làm bài tập rồi đi ngủ.","ja":"宿題をして寝ました。"}',
  'general'
),
(
  '-아/어야 되다',
  '{"en":"have to / must","es":"tener que / deber","fr":"devoir / il faut","pt-BR":"ter que / dever","th":"ต้อง","id":"harus","vi":"phải","ja":"〜なければならない"}',
  '내일 일찍 일어나야 돼요.',
  '{"en":"I have to wake up early tomorrow.","es":"Mañana tengo que levantarme temprano.","fr":"Demain je dois me lever tôt.","pt-BR":"Amanhã tenho que acordar cedo.","th":"พรุ่งนี้ต้องตื่นเช้า","id":"Besok saya harus bangun pagi.","vi":"Ngày mai tôi phải dậy sớm.","ja":"明日早く起きなければなりません。"}',
  'general'
)
ON CONFLICT (ko) DO NOTHING;

-- =====================================================================
-- Contexts (8 items × 8 locales)
-- =====================================================================
INSERT INTO public.contexts (id, name, scene, category) VALUES
(
  'banmal',
  '반말',
  '{"en":"with your close friend, no formality","es":"con tu 친한 친구, sin formalidad","fr":"avec ton ami proche, sans formalité","pt-BR":"com seu amigo próximo, sem formalidade","th":"กับเพื่อนสนิท ไม่มีพิธีรีตอง","id":"dengan teman dekat, tanpa formalitas","vi":"với bạn thân, không trang trọng","ja":"親しい友達と、敬語なし"}',
  'formalidad'
),
(
  'jondaetmal',
  '존댓말',
  '{"en":"polite normal, with someone you don''t know well","es":"polite normal, con alguien que no conoces bien","fr":"poli normal, avec quelqu''un que tu ne connais pas bien","pt-BR":"educado normal, com alguém que você não conhece bem","th":"สุภาพปกติ กับคนที่ไม่รู้จักดี","id":"sopan normal, dengan orang yang belum kenal","vi":"lịch sự thông thường, với người không quen","ja":"普通の丁寧語、よく知らない相手と"}',
  'formalidad'
),
(
  'gyeoksik',
  '격식체',
  '{"en":"formal — business meeting or presentation","es":"formal tipo reunión de trabajo o presentación","fr":"formel — réunion ou présentation","pt-BR":"formal — reunião de trabalho ou apresentação","th":"ทางการ ประชุมหรือนำเสนอ","id":"formal — rapat kerja atau presentasi","vi":"trang trọng — họp công việc hoặc thuyết trình","ja":"フォーマル — 会議やプレゼン"}',
  'formalidad'
),
(
  'friends',
  '친구한테',
  '{"en":"telling something to your friends","es":"contando algo a tus amigos","fr":"en racontant quelque chose à tes amis","pt-BR":"contando algo para seus amigos","th":"เล่าอะไรให้เพื่อนฟัง","id":"menceritakan sesuatu ke teman-teman","vi":"kể chuyện cho bạn bè","ja":"友達に何か話す感じ"}',
  'situacional'
),
(
  'drama',
  '드라마 장면',
  '{"en":"like a K-drama scene, intense","es":"como diálogo de K-drama, intenso","fr":"comme une scène de K-drama, intense","pt-BR":"como cena de K-drama, intenso","th":"เหมือนซีนซีรีส์เกาหลี เข้มข้น","id":"seperti adegan K-drama, intens","vi":"như cảnh phim Hàn, dữ dội","ja":"Kドラマのシーンのように、激しい"}',
  'situacional'
),
(
  'work',
  '직장에서',
  '{"en":"in a work context, to a colleague","es":"en contexto laboral, a un compañero","fr":"au travail, à un collègue","pt-BR":"no trabalho, para um colega","th":"ในที่ทำงาน กับเพื่อนร่วมงาน","id":"di kantor, ke rekan kerja","vi":"ở chỗ làm, với đồng nghiệp","ja":"職場で、同僚に"}',
  'situacional'
),
(
  'sns',
  'SNS에',
  '{"en":"short, expressive social media post","es":"publicación corta, expresiva","fr":"publication courte et expressive","pt-BR":"post curto e expressivo","th":"โพสต์โซเชียลสั้นๆ มีอารมณ์","id":"postingan medsos pendek, ekspresif","vi":"bài đăng mạng xã hội ngắn, biểu cảm","ja":"SNSの短く感情豊かな投稿"}',
  'situacional'
),
(
  'elder',
  '어른한테',
  '{"en":"to your grandparent, older teacher, senior boss","es":"a tu abuelo/a, profesor mayor, jefe con edad","fr":"à ton grand-parent, professeur âgé, patron senior","pt-BR":"para seu avô/avó, professor mais velho, chefe sênior","th":"กับปู่ย่า อาจารย์ผู้ใหญ่ เจ้านายอาวุโส","id":"ke kakek/nenek, guru senior, bos senior","vi":"với ông bà, thầy lớn tuổi, sếp lớn tuổi","ja":"おじいさん・おばあさん、年配の先生や上司に"}',
  'situacional'
)
ON CONFLICT (id) DO NOTHING;

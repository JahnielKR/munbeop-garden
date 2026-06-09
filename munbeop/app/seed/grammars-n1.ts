import type { Grammar } from '~/lib/domain'
import { L } from './locale'

/**
 * TOPIK 1 grammar — 50 entries aligned with `seed/topik-spine.json`
 * (spine ids G001–G143 belonging to level 1; transversal G126–G143 included).
 *
 * Each entry carries its spine id as a leading comment. `ko` patterns use the
 * exact notation the spine uses, so cross-references via `scripts/topik-spine-gap.mjs`
 * resolve cleanly.
 *
 * Themes (in source order):
 *   1. Partículas básicas           (14)
 *   2. Ser y existir                ( 3)
 *   3. Conjugación esencial         ( 5)
 *   4. Negación                     ( 3)
 *   5. Conjunciones básicas         ( 5)
 *   6. Modales, deseos y reacciones (11)
 *   7. Léxico estructural           ( 9)
 */
export const TOPIK_1_GRAMMAR: Grammar[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Theme 1 · Partículas básicas
  // ─────────────────────────────────────────────────────────────────────────

  // G002 · Topic marker
  {
    ko: '은/는',
    meaning: L(
      'topic particle — marks what the sentence is about',
      'partícula de tema — marca de qué se habla; implica contraste',
      'particule de thème — indique le sujet du discours',
      'partícula de tópico — indica do que se está falando',
      'อนุภาคแสดงหัวเรื่อง',
      'partikel topik — menandai apa yang dibicarakan',
      'tiểu từ chủ đề — đánh dấu chủ đề câu',
      '主題助詞「は」— 話題を示す',
    ),
    example: '저는 학생이에요.',
    trans: L(
      'I am a student.',
      'Yo soy estudiante.',
      'Je suis étudiant.',
      'Eu sou estudante.',
      'ฉันเป็นนักเรียน',
      'Saya seorang pelajar.',
      'Tôi là học sinh.',
      '私は学生です。',
    ),
    usageNotes: L(
      "Marks the topic — what the rest of the sentence is about (\"as for X...\"). Use 은 after a consonant (저는), 는 after a vowel (어머니는). Contrasts with 이/가: 은/는 introduces known or general information, while 이/가 highlights new info or answers \"who?/what?\". In casual speech the particle can be dropped when the topic is obvious.",
      'Marca el tema — aquello sobre lo que vas a decir algo ("en cuanto a X..."). Se usa 은 tras consonante (저는) y 는 tras vocal (어머니는). Se confunde con 이/가: 은/는 introduce información general o ya conocida, mientras que 이/가 destaca info nueva o responde a "¿quién?/¿qué?". En habla coloquial se puede omitir si el tema está claro.',
      "Marque le thème — ce dont la phrase parle (« quant à X... »). 은 après consonne (저는), 는 après voyelle (어머니는). Souvent confondue avec 이/가 : 은/는 introduit une information générale ou déjà connue, tandis que 이/가 met en relief une info nouvelle ou répond à « qui ? / quoi ? ». À l'oral familier, la particule peut tomber si le thème est clair.",
      'Marca o tópico — sobre o que a frase vai falar ("quanto a X..."). Use 은 depois de consoante (저는) e 는 depois de vogal (어머니는). Confunde-se com 이/가: 은/는 introduz informação geral ou já conhecida, enquanto 이/가 destaca info nova ou responde "quem?/o quê?". Na fala casual a partícula pode cair quando o tópico está claro.',
      'แสดงหัวเรื่องของประโยค — สิ่งที่กำลังจะพูดถึง ("สำหรับ X..."). ใช้ 은 หลังพยัญชนะ (저는) และ 는 หลังสระ (어머니는). มักสับสนกับ 이/가: 은/는 แนะนำข้อมูลทั่วไปหรือที่รู้กันอยู่แล้ว ส่วน 이/가 เน้นข้อมูลใหม่หรือใช้ตอบ "ใคร?/อะไร?". ในภาษาพูดอย่างกันเองอาจตัดออกได้เมื่อหัวเรื่องชัดเจน',
      'Menandai topik — apa yang akan dibicarakan ("mengenai X..."). Gunakan 은 setelah konsonan (저는), 는 setelah vokal (어머니는). Sering tertukar dengan 이/가: 은/는 memperkenalkan informasi umum atau yang sudah diketahui, sedangkan 이/가 menekankan info baru atau menjawab "siapa?/apa?". Dalam percakapan santai, partikel ini bisa dilepas saat topiknya sudah jelas.',
      'Đánh dấu chủ đề — điều câu nói sắp nói về ("về phần X..."). Dùng 은 sau phụ âm (저는), 는 sau nguyên âm (어머니는). Thường lẫn với 이/가: 은/는 giới thiệu thông tin chung hoặc đã biết, còn 이/가 làm nổi bật thông tin mới hoặc trả lời "ai?/cái gì?". Trong khẩu ngữ thân mật, có thể bỏ tiểu từ này khi chủ đề đã rõ.',
      '文の主題を示す(「Xについて言えば」)。子音の後は 은(저는)、母音の後は 는(어머니는)。이/가 と混同しやすい。은/는 は既知や一般的な情報を提示するのに対し、이/가 は新情報を際立たせたり「誰が／何が？」に答えたりする。くだけた会話では、主題が明らかなときに省略されることがある。',
    ),
    deckId: 'topik-1',
  },

  // G003 · Subject marker
  {
    ko: '이/가',
    meaning: L(
      'subject particle — presents new info or emphasis',
      'partícula de sujeto — info nueva o énfasis',
      'particule de sujet — info nouvelle ou emphase',
      'partícula de sujeito — informação nova ou ênfase',
      'อนุภาคประธาน — เน้นหรือข้อมูลใหม่',
      'partikel subjek — info baru atau penekanan',
      'tiểu từ chủ ngữ — thông tin mới hoặc nhấn mạnh',
      '主語助詞「が」— 新情報や強調',
    ),
    example: '고양이가 귀여워요.',
    trans: L(
      'The cat is cute.',
      'El gato es lindo.',
      'Le chat est mignon.',
      'O gato é fofo.',
      'แมวน่ารัก',
      'Kucingnya lucu.',
      'Con mèo dễ thương.',
      '猫がかわいいです。',
    ),
    usageNotes: L(
      'Marks the grammatical subject — who or what performs the action, or what an adjective applies to. Use 이 after a consonant (책이), 가 after a vowel (의자가). Picks up new information or emphasizes "who?/what?", whereas 은/는 marks the topic ("as for X..."). Watch the irregular forms: 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. Casual speech may drop the particle when context is clear.',
      'Marca el sujeto gramatical — quién o qué realiza la acción o a quién se aplica el adjetivo. Se usa 이 tras consonante (책이) y 가 tras vocal (의자가). Introduce información nueva o enfatiza "¿quién?/¿qué?", mientras que 은/는 marca el tema ("en cuanto a X..."). Ojo con formas irregulares: 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. En habla coloquial se puede omitir si el contexto es claro.',
      "Marque le sujet grammatical — qui fait l'action ou à qui s'applique l'adjectif. 이 après consonne (책이), 가 après voyelle (의자가). Présente une info nouvelle ou met en relief « qui ? / quoi ? », tandis que 은/는 marque le thème (« quant à X... »). Attention aux formes irrégulières : 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. La particule peut tomber à l'oral si le contexte est clair.",
      'Marca o sujeito gramatical — quem ou o que faz a ação ou a que o adjetivo se refere. Use 이 depois de consoante (책이) e 가 depois de vogal (의자가). Apresenta info nova ou enfatiza "quem?/o quê?", enquanto 은/는 marca o tópico ("quanto a X..."). Cuidado com formas irregulares: 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. Na fala casual a partícula pode cair se o contexto estiver claro.',
      'แสดงประธานของประโยค — ผู้กระทำหรือสิ่งที่คำคุณศัพท์ขยาย. ใช้ 이 หลังพยัญชนะ (책이) และ 가 หลังสระ (의자가). แนะนำข้อมูลใหม่หรือเน้น "ใคร?/อะไร?" ในขณะที่ 은/는 แสดงหัวเรื่อง ("สำหรับ X..."). ระวังรูปเฉพาะ: 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. ในภาษาพูดอย่างกันเองอาจตัดออกได้เมื่อบริบทชัดเจน',
      'Menandai subjek gramatikal — siapa atau apa yang melakukan aksi atau dijelaskan oleh adjektiva. Gunakan 이 setelah konsonan (책이), 가 setelah vokal (의자가). Memperkenalkan info baru atau menekankan "siapa?/apa?", sedangkan 은/는 menandai topik ("mengenai X..."). Hati-hati bentuk tak beraturan: 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. Dalam percakapan santai bisa dilepas kalau konteksnya jelas.',
      'Đánh dấu chủ ngữ ngữ pháp — ai hoặc cái gì thực hiện hành động, hoặc đối tượng mà tính từ mô tả. Dùng 이 sau phụ âm (책이), 가 sau nguyên âm (의자가). Giới thiệu thông tin mới hoặc nhấn mạnh "ai?/cái gì?", còn 은/는 đánh dấu chủ đề ("về phần X..."). Lưu ý dạng bất quy tắc: 나 + 가 → 내가, 저 + 가 → 제가, 누구 + 가 → 누가. Trong khẩu ngữ thân mật có thể bỏ khi ngữ cảnh rõ.',
      '文法上の主語を示す。動作主や形容詞がかかる対象。子音の後は 이(책이)、母音の後は 가(의자가)。은/는 が主題を示すのに対し、이/가 は新情報を持ち込み「誰が？／何が？」に答える。不規則形に注意：나 + 가 → 내가、저 + 가 → 제가、누구 + 가 → 누가。くだけた会話では文脈次第で省略されることがある。',
    ),
    deckId: 'topik-1',
  },

  // G004 · Direct object
  {
    ko: '을/를',
    meaning: L(
      'object particle — marks the direct object',
      'partícula de objeto — marca el objeto directo',
      "particule d'objet — marque le complément d'objet direct",
      'partícula de objeto — marca o objeto direto',
      'อนุภาคกรรมตรง',
      'partikel objek',
      'tiểu từ tân ngữ',
      '目的語助詞「を」',
    ),
    example: '책을 읽어요.',
    trans: L(
      'I read a book.',
      'Leo un libro.',
      'Je lis un livre.',
      'Eu leio um livro.',
      'ฉันอ่านหนังสือ',
      'Saya membaca buku.',
      'Tôi đọc sách.',
      '本を読みます。',
    ),
    usageNotes: L(
      'Marks the direct object — what receives the action. Use 을 after a consonant (책을), 를 after a vowel (커피를). Korean and your native language don\'t always agree on which verbs take a direct object: 만나다 "meet" takes 을/를 (친구를 만나요), but 결혼하다 "marry" takes 와/과 instead (친구와 결혼해요). In casual speech the particle is often dropped when the object is obvious.',
      'Marca el objeto directo — lo que recibe la acción. Se usa 을 tras consonante (책을) y 를 tras vocal (커피를). El coreano no siempre coincide con tu idioma sobre qué verbos llevan objeto directo: 만나다 "encontrar/conocer" lleva 을/를 (친구를 만나요), pero verbos como 결혼하다 "casarse" llevan 와/과 (친구와 결혼해요). En habla coloquial se suele omitir cuando el objeto es obvio.',
      "Marque le complément d'objet direct — ce qui subit l'action. 을 après consonne (책을), 를 après voyelle (커피를). Le coréen et le français ne s'accordent pas toujours sur les verbes transitifs : 만나다 « rencontrer » prend 을/를 (친구를 만나요), mais 결혼하다 « se marier » prend 와/과 (친구와 결혼해요). À l'oral familier, la particule disparaît souvent quand l'objet est évident.",
      'Marca o objeto direto — o que recebe a ação. Use 을 depois de consoante (책을) e 를 depois de vogal (커피를). Coreano e seu idioma nem sempre concordam sobre quais verbos pedem objeto direto: 만나다 "encontrar" leva 을/를 (친구를 만나요), mas 결혼하다 "casar" leva 와/과 (친구와 결혼해요). Na fala casual a partícula costuma cair quando o objeto está claro.',
      'แสดงกรรมตรง — สิ่งที่ถูกการกระทำ. ใช้ 을 หลังพยัญชนะ (책을) และ 를 หลังสระ (커피를). ภาษาเกาหลีกับภาษาคุณไม่ตรงกันเสมอเรื่องว่าคำกริยาใดต้องการกรรมตรง: 만나다 "พบ" ใช้ 을/를 (친구를 만나요) แต่ 결혼하다 "แต่งงาน" ใช้ 와/과 แทน (친구와 결혼해요). ในภาษาพูดอย่างกันเองมักจะตัดทิ้งเมื่อกรรมชัดเจน',
      'Menandai objek langsung — yang menerima aksi. Gunakan 을 setelah konsonan (책을), 를 setelah vokal (커피를). Bahasa Korea dan bahasamu tidak selalu sepakat soal verba mana yang butuh objek langsung: 만나다 "menemui" pakai 을/를 (친구를 만나요), tapi 결혼하다 "menikah" pakai 와/과 (친구와 결혼해요). Dalam percakapan santai sering dilepas kalau objeknya jelas.',
      'Đánh dấu tân ngữ trực tiếp — đối tượng nhận hành động. Dùng 을 sau phụ âm (책을), 를 sau nguyên âm (커피를). Tiếng Hàn và tiếng mẹ đẻ của bạn không phải lúc nào cũng nhất trí về động từ nào cần tân ngữ trực tiếp: 만나다 "gặp" lấy 을/를 (친구를 만나요), nhưng 결혼하다 "kết hôn" lấy 와/과 (친구와 결혼해요). Trong khẩu ngữ thường lược bỏ khi tân ngữ đã rõ.',
      '目的語(動作の対象)を示す。子音の後は 을(책을)、母音の後は 를(커피를)。日本語と必ずしも同じ動詞が目的語を取るとは限らない。만나다 「会う」は 을/를 をとる(친구를 만나요)が、결혼하다 「結婚する」は 와/과 をとる(친구와 결혼해요)。くだけた会話では目的語が明らかなとき省略されることが多い。',
    ),
    deckId: 'topik-1',
  },

  // G005 · Static location / destination / time
  {
    ko: '에',
    meaning: L(
      'at / to / on — static location, destination, point in time',
      'en / a — lugar estático, destino o momento',
      'à / dans — lieu statique, destination, moment',
      'em / para — lugar estático, destino, momento',
      'ที่ / ไป — สถานที่ / ปลายทาง / เวลา',
      'di / ke — tempat statis, tujuan, waktu',
      'ở / đến / vào — vị trí tĩnh, đích đến, thời điểm',
      '「に」— 場所・到達点・時点',
    ),
    example: '학교에 가요.',
    trans: L(
      'I go to school.',
      'Voy a la escuela.',
      'Je vais à l’école.',
      'Vou para a escola.',
      'ฉันไปโรงเรียน',
      'Saya pergi ke sekolah.',
      'Tôi đi đến trường.',
      '学校に行きます。',
    ),
    usageNotes: L(
      'Three uses: (1) static location — where something exists or is placed (집에 있어요 "be at home"), used with 있다/없다 and 살다; (2) destination — where you\'re going (학교에 가요), used with 가다/오다 and similar; (3) point in time — 3시에 (at 3), 월요일에 (on Monday), 2026년에 (in 2026). Note: 에 is NOT used for the place where an action happens — that\'s 에서 (학교에서 공부해요 "study at school").',
      'Tres usos: (1) ubicación estática — dónde algo está o se encuentra (집에 있어요 "estar en casa"), con 있다/없다 y 살다; (2) destino — adónde vas (학교에 가요), con 가다/오다 y similares; (3) momento puntual — 3시에 (a las 3), 월요일에 (el lunes), 2026년에 (en 2026). Atención: 에 NO se usa para el lugar donde ocurre una acción — para eso va 에서 (학교에서 공부해요 "estudiar en la escuela").',
      "Trois emplois : (1) lieu statique — où quelque chose se trouve (집에 있어요 « être à la maison »), avec 있다/없다 et 살다 ; (2) destination — où l'on va (학교에 가요), avec 가다/오다 et verbes similaires ; (3) point dans le temps — 3시에 (à 3 h), 월요일에 (le lundi), 2026년에 (en 2026). Attention : 에 ne marque PAS le lieu où une action se déroule — c'est 에서 (학교에서 공부해요 « étudier à l'école »).",
      'Três usos: (1) localização estática — onde algo está (집에 있어요 "estar em casa"), com 있다/없다 e 살다; (2) destino — para onde você vai (학교에 가요), com 가다/오다 e similares; (3) ponto no tempo — 3시에 (às 3), 월요일에 (na segunda), 2026년에 (em 2026). Atenção: 에 NÃO é usado para o lugar onde uma ação acontece — para isso vai 에서 (학교에서 공부해요 "estudar na escola").',
      'ใช้ได้ 3 แบบ: (1) ตำแหน่งแบบหยุดนิ่ง — ที่บางสิ่งอยู่ (집에 있어요 "อยู่ที่บ้าน") ใช้กับ 있다/없다 และ 살다; (2) ปลายทาง — ไปที่ไหน (학교에 가요) ใช้กับ 가다/오다 และคำคล้าย; (3) จุดเวลา — 3시에 (สามโมง) 월요일에 (วันจันทร์) 2026년에 (ปี 2026). ระวัง: 에 ไม่ใช้กับสถานที่เกิดการกระทำ — ใช้ 에서 แทน (학교에서 공부해요 "เรียนที่โรงเรียน")',
      'Tiga penggunaan: (1) lokasi statis — tempat sesuatu berada (집에 있어요 "di rumah"), dengan 있다/없다 dan 살다; (2) tujuan — ke mana kamu pergi (학교에 가요), dengan 가다/오다 dan sejenisnya; (3) titik waktu — 3시에 (jam 3), 월요일에 (pada hari Senin), 2026년에 (di tahun 2026). Catat: 에 TIDAK dipakai untuk tempat aksi terjadi — pakai 에서 (학교에서 공부해요 "belajar di sekolah").',
      'Ba cách dùng: (1) vị trí tĩnh — nơi cái gì đó ở đó (집에 있어요 "ở nhà"), đi với 있다/없다 và 살다; (2) đích đến — nơi bạn đến (학교에 가요), đi với 가다/오다 và tương tự; (3) thời điểm — 3시에 (3 giờ), 월요일에 (vào thứ Hai), 2026년에 (năm 2026). Lưu ý: 에 KHÔNG dùng cho nơi diễn ra hành động — phải dùng 에서 (학교에서 공부해요 "học ở trường").',
      '3つの用法: (1) 静的な場所 — 物がある場所(집에 있어요「家にいる」)、있다/없다 や 살다 と共起; (2) 行き先 — 向かう場所(학교에 가요)、가다/오다 などの動詞と共起; (3) 時の一点 — 3시에(3時に)、월요일에(月曜に)、2026년에(2026年に)。注意: 에 は動作が行われる場所には使わない — それは 에서(학교에서 공부해요「学校で勉強する」)。',
    ),
    deckId: 'topik-1',
  },

  // G006 · Location of action / origin
  {
    ko: '에서',
    meaning: L(
      'at / from — location where an action happens, or origin',
      'en / desde — lugar donde ocurre la acción u origen',
      'à / depuis — lieu d’action ou origine',
      'em / de — lugar onde acontece a ação ou origem',
      'ที่ / จาก — สถานที่เกิดการกระทำ / จุดเริ่มต้น',
      'di / dari — tempat aksi atau asal',
      'ở / từ — nơi diễn ra hành động hoặc nguồn gốc',
      '「で」/「から」— 動作の場所・起点',
    ),
    example: '카페에서 커피를 마셔요.',
    trans: L(
      'I drink coffee at the cafe.',
      'Bebo café en la cafetería.',
      'Je bois du café au café.',
      'Tomo café no café.',
      'ฉันดื่มกาแฟที่ร้านกาแฟ',
      'Saya minum kopi di kafe.',
      'Tôi uống cà phê ở quán.',
      'カフェでコーヒーを飲みます。',
    ),
    usageNotes: L(
      'Two uses: (1) location where an action happens — used with active verbs like 공부하다, 일하다, 먹다 (도서관에서 공부해요 "study at the library"); (2) origin — "from" a place (부산에서 왔어요 "I came from Busan"). Contrasts with 에: static location and destination use 에 (도서관에 있어요 "be at the library"), but an action performed AT that location uses 에서. Quick test: if you can replace the verb with 있다 and it still makes sense → 에; if it has to be a doing-verb → 에서.',
      'Dos usos: (1) lugar donde ocurre una acción — con verbos de actividad como 공부하다, 일하다, 먹다 (도서관에서 공부해요 "estudiar en la biblioteca"); (2) origen — "desde" un lugar (부산에서 왔어요 "vine de Busan"). Contrasta con 에: ubicación estática y destino llevan 에 (도서관에 있어요 "estar en la biblioteca"), pero la acción realizada EN ese lugar lleva 에서. Truco: si puedes cambiar el verbo por 있다 y la frase aún tiene sentido → 에; si necesita un verbo de acción → 에서.',
      "Deux emplois : (1) lieu où se déroule une action — avec des verbes d'activité comme 공부하다, 일하다, 먹다 (도서관에서 공부해요 « étudier à la bibliothèque ») ; (2) origine — « de » un lieu (부산에서 왔어요 « je viens de Busan »). À distinguer de 에 : lieu statique et destination prennent 에 (도서관에 있어요 « être à la bibliothèque »), mais une action effectuée DANS ce lieu prend 에서. Test : si on peut remplacer le verbe par 있다 et que la phrase reste sensée → 에 ; sinon → 에서.",
      'Dois usos: (1) lugar onde uma ação acontece — com verbos de atividade como 공부하다, 일하다, 먹다 (도서관에서 공부해요 "estudar na biblioteca"); (2) origem — "de" um lugar (부산에서 왔어요 "vim de Busan"). Contrasta com 에: localização estática e destino levam 에 (도서관에 있어요 "estar na biblioteca"), mas uma ação realizada NAQUELE lugar leva 에서. Dica: se você pode trocar o verbo por 있다 e a frase faz sentido → 에; se precisa de verbo de ação → 에서.',
      'ใช้ได้ 2 แบบ: (1) สถานที่ที่เกิดการกระทำ — ใช้กับกริยาแอคทีฟอย่าง 공부하다, 일하다, 먹다 (도서관에서 공부해요 "เรียนที่ห้องสมุด"); (2) จุดเริ่มต้น — "จาก" สถานที่ (부산에서 왔어요 "ฉันมาจากปูซาน"). ต่างจาก 에: ตำแหน่งหยุดนิ่งและปลายทางใช้ 에 (도서관에 있어요 "อยู่ที่ห้องสมุด") แต่การกระทำในที่นั้นใช้ 에서. เคล็ดลับ: ถ้าเปลี่ยนกริยาเป็น 있다 แล้วประโยคยังมีความหมาย → 에; ถ้าต้องเป็นกริยากระทำ → 에서',
      'Dua penggunaan: (1) tempat aksi terjadi — dengan verba aktivitas seperti 공부하다, 일하다, 먹다 (도서관에서 공부해요 "belajar di perpustakaan"); (2) asal — "dari" suatu tempat (부산에서 왔어요 "saya datang dari Busan"). Berbeda dengan 에: lokasi statis dan tujuan pakai 에 (도서관에 있어요 "di perpustakaan"), tapi aksi yang dilakukan DI tempat itu pakai 에서. Tips: kalau verba bisa diganti 있다 dan kalimat tetap masuk akal → 에; kalau harus verba aksi → 에서.',
      'Hai cách dùng: (1) nơi diễn ra hành động — đi với động từ hoạt động như 공부하다, 일하다, 먹다 (도서관에서 공부해요 "học ở thư viện"); (2) nguồn gốc — "từ" một nơi (부산에서 왔어요 "tôi đến từ Busan"). Tương phản với 에: vị trí tĩnh và đích đến dùng 에 (도서관에 있어요 "ở thư viện"), nhưng hành động được thực hiện TẠI nơi đó dùng 에서. Mẹo: nếu thay động từ bằng 있다 mà câu vẫn hợp lý → 에; nếu cần động từ hành động → 에서.',
      '二つの用法: (1) 動作が行われる場所 — 공부하다、일하다、먹다 など動的な動詞と共起する(도서관에서 공부해요「図書館で勉強する」); (2) 出発点 — 「〜から」(부산에서 왔어요「釜山から来ました」)。에 との対比: 静的な所在・到達点は 에(도서관에 있어요「図書館にいる」)、その場所で行う動作は 에서。コツ: 動詞を 있다 に置き換えても文が成り立つなら 에、動作動詞でないと成り立たないなら 에서。',
    ),
    deckId: 'topik-1',
  },

  // G007 · "and / with" between nouns
  {
    ko: '와/과 · 하고 · (이)랑',
    meaning: L(
      '"and / with" connecting nouns (formal / neutral / casual)',
      '"y / con" entre sustantivos (formal · neutro · informal)',
      '"et / avec" entre noms (formel · neutre · familier)',
      '"e / com" entre substantivos (formal · neutro · informal)',
      '"และ / กับ" เชื่อมคำนาม (ทางการ · กลาง · ไม่ทางการ)',
      '"dan / dengan" antar kata benda (formal · netral · santai)',
      '"và / với" giữa các danh từ (trang trọng · trung tính · thân mật)',
      '名詞をつなぐ「と」(文語 와/과 · 中間 하고 · 口語 (이)랑)',
    ),
    example: '친구하고 영화를 봤어요.',
    trans: L(
      'I watched a movie with a friend.',
      'Vi una película con un amigo.',
      'J’ai vu un film avec un ami.',
      'Assisti a um filme com um amigo.',
      'ฉันดูหนังกับเพื่อน',
      'Saya menonton film bersama teman.',
      'Tôi đã xem phim cùng bạn.',
      '友達と映画を見ました。',
    ),
    deckId: 'topik-1',
  },

  // G008 · "also / either"
  {
    ko: '도',
    meaning: L(
      '"also / too / either" — replaces 은/는, 이/가, 을/를',
      '"también / tampoco" — reemplaza 은/는, 이/가, 을/를',
      '"aussi / non plus" — remplace 은/는, 이/가, 을/를',
      '"também / tampouco" — substitui 은/는, 이/가, 을/를',
      '"ก็ / ด้วย" — แทน 은/는, 이/가, 을/를',
      '"juga" — menggantikan 은/는, 이/가, 을/를',
      '"cũng" — thay 은/는, 이/가, 을/를',
      '「も」— は/が/をを置き換える',
    ),
    example: '저도 한국어를 배워요.',
    trans: L(
      'I’m also learning Korean.',
      'Yo también aprendo coreano.',
      'Moi aussi, j’apprends le coréen.',
      'Eu também estudo coreano.',
      'ฉันก็เรียนภาษาเกาหลีเหมือนกัน',
      'Saya juga belajar bahasa Korea.',
      'Tôi cũng học tiếng Hàn.',
      '私も韓国語を勉強します。',
    ),
    deckId: 'topik-1',
  },

  // G009 · "only"
  {
    ko: '만',
    meaning: L(
      '"only / just" — exclusivity',
      '"solo / únicamente"',
      '"seulement / uniquement"',
      '"só / apenas / somente"',
      '"เท่านั้น / แค่"',
      '"hanya / saja"',
      '"chỉ"',
      '「だけ」— 限定',
    ),
    example: '물만 마셨어요.',
    trans: L(
      'I only drank water.',
      'Solo bebí agua.',
      'Je n’ai bu que de l’eau.',
      'Eu só bebi água.',
      'ฉันดื่มแค่น้ำเปล่า',
      'Saya hanya minum air.',
      'Tôi chỉ uống nước.',
      '水だけ飲みました。',
    ),
    deckId: 'topik-1',
  },

  // G010 · Possessive
  {
    ko: '의',
    meaning: L(
      'possessive "of" — possession or relation',
      'partícula posesiva "de" — posesión o relación',
      'particule possessive "de"',
      'partícula possessiva "de"',
      'อนุภาคแสดงความเป็นเจ้าของ "ของ"',
      'partikel kepemilikan ("milik")',
      'tiểu từ sở hữu "của"',
      '「の」— 所有・関係',
    ),
    example: '친구의 책이에요.',
    trans: L(
      'It’s my friend’s book.',
      'Es el libro de mi amigo.',
      'C’est le livre de mon ami.',
      'É o livro do meu amigo.',
      'หนังสือของเพื่อนฉัน',
      'Itu buku teman saya.',
      'Đó là sách của bạn tôi.',
      '友達の本です。',
    ),
    deckId: 'topik-1',
  },

  // G011 · Indirect object (person)
  {
    ko: '에게 / 한테 / 께',
    meaning: L(
      'to (a person) — formal 에게 · spoken 한테 · honorific 께',
      'a (persona) — formal 에게 · hablado 한테 · honorífico 께',
      'à (personne) — écrit 에게 · oral 한테 · honorifique 께',
      'para (pessoa) — formal 에게 · falado 한테 · honorífico 께',
      'ให้ / กับ (คน) — ทางการ 에게 · พูด 한테 · ยกย่อง 께',
      'kepada (orang) — formal 에게 · lisan 한테 · hormat 께',
      'cho (người) — trang trọng 에게 · nói 한테 · kính ngữ 께',
      '人への「に」— 文語 에게 · 口語 한테 · 尊敬 께',
    ),
    example: '친구에게 선물을 줬어요.',
    trans: L(
      'I gave a gift to my friend.',
      'Le di un regalo a mi amigo.',
      'J’ai donné un cadeau à mon ami.',
      'Dei um presente para meu amigo.',
      'ฉันให้ของขวัญเพื่อน',
      'Saya memberi hadiah kepada teman.',
      'Tôi đã tặng quà cho bạn.',
      '友達にプレゼントをあげました。',
    ),
    deckId: 'topik-1',
  },

  // G025 · Direction / means / instrument
  {
    ko: '(으)로',
    meaning: L(
      'direction / means / tool — "by, with, toward"',
      'dirección / medio / herramienta — "por, con, hacia"',
      'direction / moyen / outil — "par, avec, vers"',
      'direção / meio / ferramenta — "por, com, para"',
      'ทิศทาง / วิธี / เครื่องมือ — "ไปทาง · ด้วย"',
      'arah / cara / alat — "ke, dengan"',
      'hướng / phương tiện / công cụ — "bằng, đến"',
      '方向・手段・道具の「で」「へ」',
    ),
    example: '지하철로 왔어요.',
    trans: L(
      'I came by subway.',
      'Vine en metro.',
      'Je suis venu en métro.',
      'Vim de metrô.',
      'ฉันมาด้วยรถไฟใต้ดิน',
      'Saya datang dengan kereta bawah tanah.',
      'Tôi đến bằng tàu điện ngầm.',
      '地下鉄で来ました。',
    ),
    deckId: 'topik-1',
  },

  // G133 · Range "from ... to"
  {
    ko: '부터 / 까지',
    meaning: L(
      '"from" (start) / "to" (end) — temporal or spatial range',
      '"desde" (inicio) / "hasta" (fin) — rango temporal o espacial',
      '"de" (début) / "jusqu’à" (fin) — plage de temps ou d’espace',
      '"de" (início) / "até" (fim) — intervalo de tempo ou espaço',
      '"ตั้งแต่ ... ถึง ..." — ช่วงเวลา / สถานที่',
      '"dari ... sampai ..." — rentang waktu / tempat',
      '"từ ... đến ..." — khoảng thời gian / không gian',
      '「〜から〜まで」— 範囲',
    ),
    example: '9시부터 5시까지 일해요.',
    trans: L(
      'I work from 9 to 5.',
      'Trabajo de 9 a 5.',
      'Je travaille de 9h à 17h.',
      'Trabalho das 9 às 5.',
      'ฉันทำงานตั้งแต่ 9 โมงถึง 5 โมง',
      'Saya bekerja dari jam 9 sampai jam 5.',
      'Tôi làm việc từ 9 giờ đến 5 giờ.',
      '9時から5時まで働きます。',
    ),
    deckId: 'topik-1',
  },

  // G134 · Distributive "each / every"
  {
    ko: '마다',
    meaning: L(
      '"each / every" — distributive marker',
      '"cada / todos los" — distributivo',
      '"chaque / tous les" — distributif',
      '"cada / todos os" — distributivo',
      '"ทุก ๆ" — บอกการกระจาย',
      '"setiap / tiap" — distributif',
      '"mỗi / mọi" — phân phối',
      '「〜ごとに / 毎〜」— 配分',
    ),
    example: '날마다 운동해요.',
    trans: L(
      'I exercise every day.',
      'Hago ejercicio todos los días.',
      'Je fais du sport tous les jours.',
      'Eu me exercito todos os dias.',
      'ฉันออกกำลังกายทุกวัน',
      'Saya berolahraga setiap hari.',
      'Mỗi ngày tôi tập thể dục.',
      '毎日運動します。',
    ),
    deckId: 'topik-1',
  },

  // G135 · Disjunctive / approximation
  {
    ko: '(이)나',
    meaning: L(
      '"or" between nouns; with numbers: "about / as many as"',
      '"o" entre sustantivos; con números: "aproximadamente / hasta"',
      '"ou" entre noms; avec un nombre : "environ / pas moins de"',
      '"ou" entre substantivos; com números: "uns / até"',
      '"หรือ" ระหว่างคำนาม; กับตัวเลข: "ประมาณ / ตั้ง"',
      '"atau" antar kata benda; dengan angka: "kira-kira / sampai"',
      '"hoặc" giữa danh từ; với số: "khoảng / đến"',
      '名詞間の「か」/ 数字で「〜も」',
    ),
    example: '커피나 차를 마실래요?',
    trans: L(
      'Would you like coffee or tea?',
      '¿Quieres café o té?',
      'Tu veux du café ou du thé ?',
      'Você quer café ou chá?',
      'จะดื่มกาแฟหรือชาดีคะ',
      'Mau minum kopi atau teh?',
      'Bạn muốn uống cà phê hay trà?',
      'コーヒーかお茶を飲みますか？',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 2 · Ser y existir
  // ─────────────────────────────────────────────────────────────────────────

  // G001 · Copula
  {
    ko: '이다 / 아니다',
    meaning: L(
      '"to be" / "to not be" — copula for nouns (이에요/예요/입니다)',
      '"ser" / "no ser" — cópula con sustantivos (이에요/예요/입니다)',
      '«être» / «ne pas être» — copule pour noms',
      '"ser" / "não ser" — cópula com substantivos',
      '"เป็น/คือ" / "ไม่ใช่" — กับคำนาม',
      '"adalah" / "bukan" — kopula untuk kata benda',
      '"là" / "không phải là" — hệ từ cho danh từ',
      '名詞文の「である / ではない」(이에요/예요/입니다)',
    ),
    example: '저는 학생이에요.',
    trans: L(
      'I am a student.',
      'Yo soy estudiante.',
      'Je suis étudiant.',
      'Eu sou estudante.',
      'ฉันเป็นนักเรียน',
      'Saya seorang pelajar.',
      'Tôi là học sinh.',
      '私は学生です。',
    ),
    deckId: 'topik-1',
  },

  // G027 · Existence / possession
  {
    ko: '있다 / 없다',
    meaning: L(
      '"there is / have" / "there isn’t / don’t have"',
      '"haber / tener" / "no haber / no tener"',
      '"il y a / avoir" / "il n’y a pas / ne pas avoir"',
      '"haver / ter" / "não haver / não ter"',
      '"มี" / "ไม่มี"',
      '"ada" / "tidak ada"',
      '"có" / "không có"',
      '「ある・いる / ない・いない」',
    ),
    example: '시간이 없어요.',
    trans: L(
      'I don’t have time.',
      'No tengo tiempo.',
      'Je n’ai pas le temps.',
      'Não tenho tempo.',
      'ฉันไม่มีเวลา',
      'Saya tidak punya waktu.',
      'Tôi không có thời gian.',
      '時間がありません。',
    ),
    deckId: 'topik-1',
  },

  // G028 · Like / dislike (active verb)
  {
    ko: '좋아하다 / 싫어하다',
    meaning: L(
      '"to like / dislike" — active verb, object marked with 을/를',
      '"gustar / no gustar" — verbo activo, OD con 을/를',
      '"aimer / ne pas aimer" — verbe actif, COD avec 을/를',
      '"gostar / não gostar" — verbo ativo, OD com 을/를',
      '"ชอบ / ไม่ชอบ" — กริยา (กรรมใส่ 을/를)',
      '"suka / tidak suka" — verba aktif (objek pakai 을/를)',
      '"thích / không thích" — động từ chủ động (tân ngữ với 을/를)',
      '「好む / 嫌う」— 動作動詞、目的語に을/를',
    ),
    example: '저는 음악을 좋아해요.',
    trans: L(
      'I like music.',
      'Me gusta la música.',
      'J’aime la musique.',
      'Eu gosto de música.',
      'ฉันชอบดนตรี',
      'Saya suka musik.',
      'Tôi thích âm nhạc.',
      '私は音楽が好きです。',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 3 · Conjugación esencial
  // ─────────────────────────────────────────────────────────────────────────

  // G012 · Present polite ending
  {
    ko: '-아/어요',
    meaning: L(
      'polite present ending (해요체) — the everyday spoken form',
      'terminación de presente educado (해요체) — la forma cotidiana',
      'terminaison présent poli (해요체) — forme courante',
      'terminação de presente educado (해요체)',
      'รูปสุภาพปัจจุบัน (해요체)',
      'akhiran sopan kala kini (해요체)',
      'đuôi lịch sự hiện tại (해요체)',
      '丁寧体の現在「〜아/어요」(해요체)',
    ),
    example: '저는 매일 운동해요.',
    trans: L(
      'I exercise every day.',
      'Hago ejercicio todos los días.',
      'Je fais du sport tous les jours.',
      'Eu me exercito todos os dias.',
      'ฉันออกกำลังกายทุกวัน',
      'Saya berolahraga setiap hari.',
      'Tôi tập thể dục mỗi ngày.',
      '私は毎日運動します。',
    ),
    deckId: 'topik-1',
  },

  // G013 · Past polite
  {
    ko: '-았/었어요',
    meaning: L(
      'polite past tense ending',
      'terminación de pasado educado',
      'terminaison passé poli',
      'terminação de pretérito educado',
      'รูปสุภาพอดีต',
      'akhiran sopan lampau',
      'đuôi lịch sự quá khứ',
      '丁寧体の過去「〜았/었어요」',
    ),
    example: '어제 영화를 봤어요.',
    trans: L(
      'I watched a movie yesterday.',
      'Ayer vi una película.',
      'J’ai vu un film hier.',
      'Ontem assisti a um filme.',
      'เมื่อวานดูหนัง',
      'Kemarin saya menonton film.',
      'Hôm qua tôi đã xem phim.',
      '昨日映画を見ました。',
    ),
    deckId: 'topik-1',
  },

  // G014 · Future / supposition
  {
    ko: '-(으)ㄹ 거예요',
    meaning: L(
      'future / intention / supposition',
      'futuro / intención / suposición',
      'futur / intention / supposition',
      'futuro / intenção / suposição',
      'อนาคต / ความตั้งใจ / การคาดเดา',
      'masa depan / niat / dugaan',
      'tương lai / dự định / suy đoán',
      '未来・意志・推量「〜つもりです / 〜でしょう」',
    ),
    example: '내일 서울에 갈 거예요.',
    trans: L(
      'I will go to Seoul tomorrow.',
      'Mañana iré a Seúl.',
      'Demain j’irai à Séoul.',
      'Amanhã vou para Seul.',
      'พรุ่งนี้ฉันจะไปโซล',
      'Besok saya akan pergi ke Seoul.',
      'Ngày mai tôi sẽ đến Seoul.',
      '明日ソウルに行きます。',
    ),
    deckId: 'topik-1',
  },

  // G018 · Polite imperative / honorific present
  {
    ko: '-(으)세요',
    meaning: L(
      'polite imperative ("please ...") or honorific present',
      'imperativo educado ("por favor...") o presente honorífico',
      'impératif poli ou présent honorifique',
      'imperativo educado ("por favor") ou presente honorífico',
      'คำสั่งสุภาพ / รูปยกย่องปัจจุบัน',
      'imperatif sopan / kala kini hormat',
      'mệnh lệnh lịch sự / hiện tại kính ngữ',
      '「お〜ください / ご〜ください」— 丁寧依頼・尊敬現在',
    ),
    example: '여기 앉으세요.',
    trans: L(
      'Please sit here.',
      'Siéntese aquí, por favor.',
      'Asseyez-vous ici, s’il vous plaît.',
      'Sente-se aqui, por favor.',
      'เชิญนั่งตรงนี้ค่ะ',
      'Silakan duduk di sini.',
      'Mời bạn ngồi đây.',
      'こちらにお座りください。',
    ),
    deckId: 'topik-1',
  },

  // G139 · Formal ending
  {
    ko: '-ㅂ/습니다',
    meaning: L(
      'formal-style ending (합쇼체) — news, presentations, first meetings',
      'terminación formal (합쇼체) — noticias, presentaciones, formal',
      'terminaison formelle (합쇼체) — discours, première rencontre',
      'terminação formal (합쇼체) — notícias, apresentações',
      'รูปทางการ (합쇼체) — ข่าว / การนำเสนอ',
      'akhiran formal (합쇼체) — berita / presentasi',
      'đuôi trang trọng (합쇼체) — bản tin, thuyết trình',
      '改まった「〜です/ます」(합쇼체)',
    ),
    example: '저는 한국 사람입니다.',
    trans: L(
      'I am Korean.',
      'Soy coreano.',
      'Je suis coréen.',
      'Sou coreano.',
      'ผม/ฉันเป็นคนเกาหลี',
      'Saya orang Korea.',
      'Tôi là người Hàn Quốc.',
      '私は韓国人です。',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 4 · Negación
  // ─────────────────────────────────────────────────────────────────────────

  // G015 · Negation by choice
  {
    ko: '안 + V / -지 않다',
    meaning: L(
      'negation by choice — "not" (안 is short, -지 않다 is long/formal)',
      'negación por elección — "no" (안 corto, -지 않다 largo/formal)',
      'négation par choix — court 안 / long -지 않다',
      'negação por escolha — curto 안 / longo -지 않다',
      'การปฏิเสธโดยเลือก — สั้น 안 / ยาว -지 않다',
      'negasi karena pilihan — pendek 안 / panjang -지 않다',
      'phủ định do chọn không — ngắn 안 / dài -지 않다',
      '意志による否定「〜ない」(短 안 / 長 -지 않다)',
    ),
    example: '오늘은 학교에 안 가요.',
    trans: L(
      'I’m not going to school today.',
      'Hoy no voy a la escuela.',
      'Aujourd’hui je ne vais pas à l’école.',
      'Hoje eu não vou à escola.',
      'วันนี้ฉันไม่ไปโรงเรียน',
      'Hari ini saya tidak ke sekolah.',
      'Hôm nay tôi không đi học.',
      '今日は学校に行きません。',
    ),
    deckId: 'topik-1',
  },

  // G016 · Negation of capability
  {
    ko: '못 + V / -지 못하다',
    meaning: L(
      '"cannot" — inability due to circumstance, not choice',
      '"no poder" — incapacidad por circunstancias, no por voluntad',
      '«ne pas pouvoir» — incapacité due aux circonstances',
      '"não poder / não conseguir" — incapacidade por circunstância',
      '"ไม่สามารถ" — เพราะข้อจำกัด ไม่ใช่ความตั้งใจ',
      '"tidak bisa" — karena keadaan, bukan pilihan',
      '"không thể" — do hoàn cảnh, không phải lựa chọn',
      '「できない」— 不可能・能力不足',
    ),
    example: '저는 수영을 못 해요.',
    trans: L(
      'I can’t swim.',
      'No sé nadar.',
      'Je ne sais pas nager.',
      'Não sei nadar.',
      'ฉันว่ายน้ำไม่เป็น',
      'Saya tidak bisa berenang.',
      'Tôi không biết bơi.',
      '私は泳げません。',
    ),
    deckId: 'topik-1',
  },

  // G143 · 안 vs 못 contrast
  {
    ko: '안 vs 못 (비교)',
    meaning: L(
      'contrast: 안 = won’t (choice) vs 못 = can’t (inability)',
      'contraste: 안 = no quiero (elección) vs 못 = no puedo (incapacidad)',
      'contraste : 안 = je ne veux pas / 못 = je ne peux pas',
      'contraste: 안 = não quero / 못 = não consigo',
      'ความต่าง: 안 (เลือกไม่ทำ) / 못 (ทำไม่ได้)',
      'beda: 안 (memilih tidak) / 못 (tidak mampu)',
      'phân biệt: 안 (không muốn) / 못 (không thể)',
      '対比: 안 (しない) / 못 (できない)',
    ),
    example: '오늘은 술을 안 마셔요. 약 먹어서 못 마셔요.',
    trans: L(
      'Today I’m not drinking (by choice) — I can’t drink because I took meds.',
      'Hoy no bebo (elijo no) — no puedo beber porque tomé medicación.',
      'Aujourd’hui je ne bois pas (par choix) — je ne peux pas car j’ai pris des médicaments.',
      'Hoje eu não bebo (por escolha) — não posso beber porque tomei remédio.',
      'วันนี้ฉันไม่ดื่ม (เลือกเอง) — ดื่มไม่ได้เพราะกินยา',
      'Hari ini saya tidak minum (memilih tidak) — tidak bisa minum karena minum obat.',
      'Hôm nay tôi không uống (chọn không) — không thể uống vì đã uống thuốc.',
      '今日はお酒を飲みません(意志)。薬を飲んだので飲めません(不可)。',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 5 · Conjunciones básicas
  // ─────────────────────────────────────────────────────────────────────────

  // G019 · "and / then"
  {
    ko: '-고',
    meaning: L(
      '"and (then)" — connects actions or states; tense on last clause only',
      '"y / y luego" — conecta acciones o estados; tiempo solo en la última',
      '"et (puis)" — relie actions/états; temps sur la dernière clause',
      '"e (depois)" — conecta ações/estados; tempo só na última',
      '"แล้วก็" — เชื่อมการกระทำ/สถานะ; เวลาที่ประโยคสุดท้าย',
      '"lalu / dan" — menghubungkan aksi/keadaan; kala di klausa terakhir',
      '"và / rồi" — nối hành động/trạng thái; thì ở vế cuối',
      '「〜して」— 動作・状態の接続(時制は最後の節のみ)',
    ),
    example: '숙제를 하고 잤어요.',
    trans: L(
      'I did my homework and went to sleep.',
      'Hice la tarea y me dormí.',
      'J’ai fait mes devoirs et je suis allé dormir.',
      'Fiz a lição e fui dormir.',
      'ทำการบ้านแล้วก็นอน',
      'Saya kerjakan PR lalu tidur.',
      'Tôi làm bài tập rồi đi ngủ.',
      '宿題をして寝ました。',
    ),
    deckId: 'topik-1',
  },

  // G020 · Cause / inseparable sequence
  {
    ko: '-아/어서',
    meaning: L(
      '"because / so" + natural sequence; no past on first clause, no imperative on second',
      '"porque" + secuencia natural; sin pasado en la 1ª cláusula ni imperativo en la 2ª',
      '"parce que" + suite naturelle; pas de passé en 1ʳᵉ ni d’impératif en 2ᵈᵉ',
      '"porque" + sequência natural; sem passado na 1ª nem imperativo na 2ª',
      '"เพราะว่า" — เหตุผลธรรมชาติ ห้ามอดีตในข้อแรกและคำสั่งในข้อหลัง',
      '"karena" — alasan alami; tanpa lampau di klausa 1 atau perintah di klausa 2',
      '"vì / nên" — lý do tự nhiên; không quá khứ ở vế 1, không mệnh lệnh ở vế 2',
      '「〜て・〜ので」— 自然な因果(前節に過去・後節に命令×)',
    ),
    example: '배가 고파서 밥을 먹었어요.',
    trans: L(
      'I was hungry, so I ate.',
      'Tenía hambre, así que comí.',
      'J’avais faim, alors j’ai mangé.',
      'Eu estava com fome, então comi.',
      'ฉันหิวเลยกินข้าว',
      'Saya lapar, jadi saya makan.',
      'Tôi đói nên đã ăn cơm.',
      'お腹が空いたのでご飯を食べました。',
    ),
    deckId: 'topik-1',
  },

  // G021 · "but"
  {
    ko: '-지만',
    meaning: L(
      '"but / although" — adversative connector, any tense',
      '"pero / aunque" — adversativo, cualquier tiempo',
      '"mais / bien que" — connecteur adversatif, tous les temps',
      '"mas / embora" — adversativo, qualquer tempo',
      '"แต่ / แม้ว่า"',
      '"tetapi / meskipun"',
      '"nhưng / dù"',
      '「〜けど・〜が」',
    ),
    example: '한국어는 어렵지만 재미있어요.',
    trans: L(
      'Korean is hard, but interesting.',
      'El coreano es difícil pero interesante.',
      'Le coréen est difficile mais intéressant.',
      'O coreano é difícil, mas é interessante.',
      'ภาษาเกาหลียากแต่ก็สนุก',
      'Bahasa Korea sulit, tapi menarik.',
      'Tiếng Hàn khó nhưng thú vị.',
      '韓国語は難しいけど面白いです。',
    ),
    deckId: 'topik-1',
  },

  // G022 · "if / when"
  {
    ko: '-(으)면',
    meaning: L(
      '"if / when" (conditional)',
      '"si / cuando" (condicional)',
      '"si / quand" (conditionnel)',
      '"se / quando" (condicional)',
      '"ถ้า / เมื่อ"',
      '"jika / kalau"',
      '"nếu / khi"',
      '「もし〜たら / 〜ば」',
    ),
    example: '시간이 있으면 같이 가요.',
    trans: L(
      'If you have time, let’s go together.',
      'Si tienes tiempo, vamos juntos.',
      'Si tu as le temps, allons-y ensemble.',
      'Se tiver tempo, vamos juntos.',
      'ถ้ามีเวลา ไปด้วยกันนะ',
      'Kalau ada waktu, ayo pergi bersama.',
      'Nếu có thời gian, đi cùng nhau nhé.',
      '時間があれば一緒に行きましょう。',
    ),
    deckId: 'topik-1',
  },

  // G026 · Soft contrast / background context
  {
    ko: '-ㄴ/는데',
    meaning: L(
      '"the thing is..." — background, soft contrast, set-up for what follows',
      '"es que..." — contexto de fondo o contraste suave',
      '"il faut savoir que..." — contexte de fond ou contraste léger',
      '"acontece que..." — contexto de fundo ou contraste suave',
      '"คือว่า..." — เกริ่นเหตุผล / ขัดแย้งเบา ๆ',
      '"jadi begini..." — latar / kontras lembut',
      '"chuyện là..." — bối cảnh / tương phản nhẹ',
      '「〜んだけど」— 前置き・軽い対比',
    ),
    example: '배가 고픈데 같이 밥 먹을까요?',
    trans: L(
      'I’m hungry — want to eat together?',
      'Tengo hambre, ¿comemos juntos?',
      'J’ai faim, on mange ensemble ?',
      'Estou com fome, vamos comer juntos?',
      'หิวข้าวจัง ไปกินด้วยกันไหม',
      'Saya lapar, mau makan bareng?',
      'Tôi đói rồi, mình ăn cùng nhau nhé?',
      'お腹が空いたんだけど、一緒に食べませんか？',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 6 · Modales, deseos y reacciones
  // ─────────────────────────────────────────────────────────────────────────

  // G017 · Desire (1st person)
  {
    ko: '-고 싶다',
    meaning: L(
      '"want to do" — used in 1st person (3rd: -고 싶어하다)',
      '"querer hacer" — 1ª persona (3ª: -고 싶어하다)',
      '"vouloir faire" — 1ʳᵉ personne (3ᵉ : -고 싶어하다)',
      '"querer fazer" — 1ª pessoa (3ª: -고 싶어하다)',
      '"อยากทำ" — บุรุษที่ 1 (บุรุษที่ 3: -고 싶어하다)',
      '"ingin / mau melakukan" — orang pertama (ketiga: -고 싶어하다)',
      '"muốn làm" — ngôi 1 (ngôi 3: -고 싶어하다)',
      '「〜したい」— 一人称(三人称は -고 싶어하다)',
    ),
    example: '드라마를 보고 싶어요.',
    trans: L(
      'I want to watch a drama.',
      'Quiero ver un drama.',
      'Je veux regarder un drama.',
      'Quero ver um drama.',
      'ฉันอยากดูซีรีส์',
      'Saya ingin menonton drama.',
      'Tôi muốn xem phim.',
      'ドラマを見たいです。',
    ),
    deckId: 'topik-1',
  },

  // G023 · Progressive aspect
  {
    ko: '-고 있다',
    meaning: L(
      'progressive aspect — "be ...ing"',
      'aspecto progresivo — "estar + gerundio"',
      'aspect progressif — "être en train de"',
      'aspecto progressivo — "estar fazendo"',
      'รูปกำลังกระทำ — "กำลัง..."',
      'aspek progresif — "sedang..."',
      'thì tiếp diễn — "đang..."',
      '「〜ている」— 進行',
    ),
    example: '지금 뭐 하고 있어요?',
    trans: L(
      'What are you doing now?',
      '¿Qué estás haciendo ahora?',
      'Que fais-tu maintenant ?',
      'O que você está fazendo agora?',
      'ตอนนี้ทำอะไรอยู่',
      'Sedang apa sekarang?',
      'Bây giờ bạn đang làm gì?',
      '今、何をしていますか？',
    ),
    deckId: 'topik-1',
  },

  // G024 · Purpose of motion
  {
    ko: '-(으)러 가다/오다',
    meaning: L(
      '"go / come to (do)" — purpose with motion verbs only',
      '"ir / venir a (hacer)" — propósito con verbos de movimiento',
      '"aller / venir (faire)" — but avec verbes de mouvement',
      '"ir / vir (fazer)" — propósito com verbos de movimento',
      '"ไป/มา เพื่อ..." — กับกริยาเคลื่อนที่เท่านั้น',
      '"pergi / datang untuk..." — verba gerak saja',
      '"đi / đến để..." — chỉ với động từ chuyển động',
      '「〜しに行く・来る」— 移動の目的',
    ),
    example: '책을 사러 서점에 갔어요.',
    trans: L(
      'I went to the bookstore to buy a book.',
      'Fui a la librería a comprar un libro.',
      'Je suis allé à la librairie pour acheter un livre.',
      'Fui à livraria comprar um livro.',
      'ฉันไปร้านหนังสือเพื่อซื้อหนังสือ',
      'Saya pergi ke toko buku untuk membeli buku.',
      'Tôi đến nhà sách để mua sách.',
      '本を買いに本屋に行きました。',
    ),
    deckId: 'topik-1',
  },

  // G029 · Past experience
  {
    ko: '-(으)ㄴ 적이 있다/없다',
    meaning: L(
      'past experience — "have / have never (done)"',
      'experiencia pasada — "haber / no haber + participio"',
      'expérience passée — "avoir déjà / ne jamais fait"',
      'experiência passada — "já / nunca fiz"',
      'ประสบการณ์ในอดีต — "เคย / ไม่เคย"',
      'pengalaman lampau — "pernah / belum pernah"',
      'kinh nghiệm — "đã từng / chưa từng"',
      '経験「〜したことがある／ない」',
    ),
    example: '한국에 가 본 적이 있어요?',
    trans: L(
      'Have you ever been to Korea?',
      '¿Has estado alguna vez en Corea?',
      'Es-tu déjà allé en Corée ?',
      'Você já esteve na Coreia?',
      'เคยไปเกาหลีไหม',
      'Pernah ke Korea?',
      'Bạn đã từng đến Hàn Quốc chưa?',
      '韓国に行ったことがありますか？',
    ),
    deckId: 'topik-1',
  },

  // G126 · Supposition / firm intent
  {
    ko: '-겠어요',
    meaning: L(
      'supposition or firm 1st-person intent / formula in fixed phrases',
      'suposición o intención firme en 1ª persona; frases fijas',
      'supposition ou volonté ferme en 1ʳᵉ personne; expressions figées',
      'suposição ou intenção firme em 1ª pessoa; frases fixas',
      'การคาดเดา / ความตั้งใจหนักแน่น / สำนวน',
      'dugaan / niat tegas orang pertama; ungkapan tetap',
      'phỏng đoán / ý chí mạnh ngôi 1 / cụm cố định',
      '推量・強い意志(一人称)/定型表現「〜だろう/しよう」',
    ),
    example: '맛있겠어요!',
    trans: L(
      'That must be delicious!',
      '¡Debe estar rico!',
      'Ça doit être délicieux !',
      'Deve estar uma delícia!',
      'น่าจะอร่อยมาก!',
      'Pasti enak!',
      'Chắc là ngon lắm!',
      'おいしそうですね！',
    ),
    deckId: 'topik-1',
  },

  // G127 · Wish / offer
  {
    ko: '-(으)ㄹ래요?',
    meaning: L(
      '"Do you want to ...?" (offer) / "I’d like to ..." (1st p. preference)',
      '"¿Quieres...?" (oferta) / "quiero/me gustaría..." (1ª persona)',
      '"Tu veux...?" (proposition) / "j’aimerais..." (1ʳᵉ pers.)',
      '"Quer...?" (oferta) / "eu gostaria..." (1ª pessoa)',
      '"จะ ... ไหม?" (ชวน) / "ฉันจะ..." (ความต้องการ)',
      '"Mau ...?" (tawaran) / "saya mau..." (preferensi)',
      '"Bạn có muốn...?" (đề nghị) / "tôi muốn..." (sở thích)',
      '「〜ますか？(誘い)」/「〜します(意向)」',
    ),
    example: '같이 영화 볼래요?',
    trans: L(
      'Want to watch a movie together?',
      '¿Quieres ver una película juntos?',
      'Tu veux regarder un film ensemble ?',
      'Quer ver um filme juntos?',
      'ดูหนังด้วยกันไหม',
      'Mau nonton film bareng?',
      'Bạn muốn xem phim cùng nhau không?',
      '一緒に映画を見ませんか？',
    ),
    deckId: 'topik-1',
  },

  // G128 · Discovery / mild surprise
  {
    ko: '-네요',
    meaning: L(
      'discovery / mild surprise — "oh, ...!", "I see, ...!"',
      'descubrimiento / sorpresa suave — "¡vaya, ...!", "¡anda...!"',
      'découverte / légère surprise — «tiens, ...!», «ah, ...!»',
      'descoberta / surpresa leve — "nossa, ...!", "olha só, ...!"',
      'การค้นพบ / ประหลาดใจเบา ๆ — "อ้าว..." "อืม..."',
      'penemuan / kaget ringan — "wah, ...!", "ternyata..."',
      'phát hiện / ngạc nhiên nhẹ — "ồ, ...!", "à ra vậy..."',
      '気づき・軽い驚き「〜ですね」',
    ),
    example: '여기 정말 예쁘네요!',
    trans: L(
      'Wow, this place is really pretty!',
      '¡Vaya, qué bonito es este lugar!',
      'Oh, cet endroit est vraiment joli !',
      'Nossa, este lugar é lindo!',
      'ที่นี่สวยจริง ๆ เลยนะ',
      'Wah, tempat ini cantik sekali!',
      'Ồ, chỗ này đẹp thật!',
      'ここ、本当にきれいですね！',
    ),
    deckId: 'topik-1',
  },

  // G129 · Seeking confirmation
  {
    ko: '-지요? / -죠?',
    meaning: L(
      '"right?" — seek confirmation of something assumed',
      '"¿verdad?" — busca confirmación de algo asumido',
      '«non ?» / «n’est-ce pas ?» — chercher confirmation',
      '"né?" / "não é?" — pedir confirmação',
      '"ใช่ไหม?" — ขอการยืนยัน',
      '"kan?" / "ya kan?" — minta konfirmasi',
      '"phải không?" — xác nhận',
      '「〜でしょう？・〜よね？」— 確認',
    ),
    example: '한국 음식 좋아하시죠?',
    trans: L(
      'You like Korean food, right?',
      'Le gusta la comida coreana, ¿verdad?',
      'Vous aimez la cuisine coréenne, non ?',
      'Você gosta de comida coreana, né?',
      'คุณชอบอาหารเกาหลีใช่ไหมคะ',
      'Anda suka makanan Korea, kan?',
      'Anh/chị thích món Hàn phải không?',
      '韓国料理がお好きですよね？',
    ),
    deckId: 'topik-1',
  },

  // G136 · Permission
  {
    ko: '-아/어도 되다',
    meaning: L(
      '"may / it’s ok to ..." — permission',
      '"se puede / está bien si..." — permiso',
      '«il est permis de» / «on peut» — permission',
      '"pode / está tudo bem" — permissão',
      '"...ก็ได้" — ขออนุญาต / อนุญาต',
      '"boleh ..." — izin',
      '"có thể / được ..." — cho phép',
      '「〜てもいい」— 許可',
    ),
    example: '여기 앉아도 돼요?',
    trans: L(
      'May I sit here?',
      '¿Puedo sentarme aquí?',
      'Je peux m’asseoir ici ?',
      'Posso me sentar aqui?',
      'นั่งตรงนี้ได้ไหมคะ',
      'Boleh saya duduk di sini?',
      'Tôi ngồi đây được không?',
      'ここに座ってもいいですか？',
    ),
    deckId: 'topik-1',
  },

  // G137 · Absence of obligation
  {
    ko: '-지 않아도 되다',
    meaning: L(
      '"don’t have to" — not required (different from prohibition)',
      '"no hace falta / no es necesario" (no es prohibición)',
      '«il n’est pas nécessaire de» — non requis',
      '"não precisa" — não é obrigatório (não é proibição)',
      '"ไม่ต้อง ... ก็ได้"',
      '"tidak harus / tidak perlu"',
      '"không cần phải"',
      '「〜なくてもいい」— 義務なし',
    ),
    example: '걱정하지 않아도 돼요.',
    trans: L(
      'You don’t have to worry.',
      'No tienes que preocuparte.',
      'Tu n’as pas besoin de t’inquiéter.',
      'Você não precisa se preocupar.',
      'ไม่ต้องเป็นห่วงก็ได้',
      'Tidak perlu khawatir.',
      'Bạn không cần lo lắng.',
      '心配しなくてもいいですよ。',
    ),
    deckId: 'topik-1',
  },

  // G138 · Honorific benefit
  {
    ko: '-아/어 드리다',
    meaning: L(
      'do something for someone — honorific of -아/어 주다',
      'hacer algo para alguien — honorífico de -아/어 주다',
      'faire qch pour qqn — honorifique de -아/어 주다',
      'fazer algo por alguém — honorífico de -아/어 주다',
      'ทำให้ใคร — รูปยกย่องของ -아/어 주다',
      'melakukan untuk orang lain — hormat dari -아/어 주다',
      'làm hộ ai — kính ngữ của -아/어 주다',
      '「お〜する/差し上げる」— 주다の謙譲',
    ),
    example: '제가 도와 드릴게요.',
    trans: L(
      'Let me help you.',
      'Yo le ayudaré.',
      'Je vais vous aider.',
      'Eu vou te ajudar.',
      'ให้ฉันช่วยนะคะ',
      'Saya yang akan membantu.',
      'Để tôi giúp anh/chị.',
      'お手伝いいたします。',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 7 · Léxico estructural
  // ─────────────────────────────────────────────────────────────────────────

  // G030 · Interrogatives
  {
    ko: '의문사',
    meaning: L(
      'core question words: what / who / where / when / why / how',
      'interrogativos esenciales: qué / quién / dónde / cuándo / por qué / cómo',
      'mots interrogatifs : quoi / qui / où / quand / pourquoi / comment',
      'interrogativos: o que / quem / onde / quando / por que / como',
      'คำถามหลัก: อะไร / ใคร / ที่ไหน / เมื่อไหร่ / ทำไม / อย่างไร',
      'kata tanya inti: apa / siapa / di mana / kapan / mengapa / bagaimana',
      'từ để hỏi: gì / ai / ở đâu / khi nào / tại sao / thế nào',
      '疑問詞: 何 / 誰 / どこ / いつ / なぜ / どう',
    ),
    example: '이름이 뭐예요?',
    trans: L(
      'What is your name?',
      '¿Cómo te llamas?',
      'Comment t’appelles-tu ?',
      'Qual é o seu nome?',
      'ชื่ออะไรคะ',
      'Siapa nama Anda?',
      'Tên bạn là gì?',
      'お名前は何ですか？',
    ),
    deckId: 'topik-1',
  },

  // G031 · Numbers (sino + native)
  {
    ko: '숫자',
    meaning: L(
      'two number systems: Sino-Korean (prices, dates) and native (counting, ages, hours)',
      'dos sistemas: sino-coreano (precios, fechas) y nativo (contar objetos, edad, horas)',
      'deux systèmes : sino-coréen (prix, dates) et natif (objets, âge, heures)',
      'dois sistemas: sino-coreano (preços, datas) e nativo (contar, idade, horas)',
      'มีสองระบบ: ตัวเลขจีน (ราคา/วันที่) และตัวเลขเกาหลีแท้ (นับของ/อายุ/ชั่วโมง)',
      'dua sistem: Sino-Korea (harga, tanggal) dan asli (menghitung, usia, jam)',
      'hai hệ: Hán-Hàn (giá, ngày) và thuần Hàn (đếm, tuổi, giờ)',
      '二系統: 漢字語(値段・日付)と固有語(数える・年齢・時)',
    ),
    example: '이 가방 얼마예요? — 삼만 오천 원이에요.',
    trans: L(
      'How much is this bag? — It’s 35,000 won.',
      '¿Cuánto cuesta esta mochila? — Son 35.000 won.',
      'Combien coûte ce sac ? — 35 000 wons.',
      'Quanto custa essa mochila? — 35.000 wons.',
      'กระเป๋านี้ราคาเท่าไหร่ — 35,000 วอน',
      'Berapa tas ini? — 35.000 won.',
      'Cái túi này bao nhiêu? — 35.000 won.',
      'このカバンはいくらですか？ — 三万五千ウォンです。',
    ),
    deckId: 'topik-1',
  },

  // G032 · Time expressions
  {
    ko: '시간 표현',
    meaning: L(
      'common time adverbs: today, yesterday, tomorrow, now, always, sometimes…',
      'adverbios de tiempo: hoy, ayer, mañana, ahora, siempre, a veces…',
      'adverbes de temps : aujourd’hui, hier, demain, maintenant, toujours, parfois…',
      'advérbios de tempo: hoje, ontem, amanhã, agora, sempre, às vezes…',
      'คำบอกเวลา: วันนี้ เมื่อวาน พรุ่งนี้ ตอนนี้ เสมอ บางครั้ง…',
      'kata waktu: hari ini, kemarin, besok, sekarang, selalu, kadang…',
      'từ chỉ thời gian: hôm nay, hôm qua, ngày mai, bây giờ, luôn, thỉnh thoảng…',
      '時の副詞: 今日・昨日・明日・今・いつも・時々…',
    ),
    example: '오늘 만나요.',
    trans: L(
      'Let’s meet today.',
      'Nos vemos hoy.',
      'On se voit aujourd’hui.',
      'A gente se vê hoje.',
      'เจอกันวันนี้นะ',
      'Sampai jumpa hari ini.',
      'Hôm nay gặp nhau nhé.',
      '今日会いましょう。',
    ),
    deckId: 'topik-1',
  },

  // G130 · Demonstratives
  {
    ko: '이 / 그 / 저',
    meaning: L(
      'three-way demonstratives: 이 (near speaker), 그 (near listener), 저 (far from both)',
      'sistema de 3 distancias: 이 (cerca del hablante), 그 (cerca del oyente), 저 (lejos de ambos)',
      'démonstratifs à 3 niveaux : 이 (près du locuteur), 그 (près du destinataire), 저 (loin des deux)',
      'demonstrativos de 3 níveis: 이 (perto do falante), 그 (do ouvinte), 저 (longe de ambos)',
      'ระบบสามขั้น: 이 (ใกล้ผู้พูด) / 그 (ใกล้ผู้ฟัง) / 저 (ไกลทั้งคู่)',
      '3 tingkat: 이 (dekat penutur), 그 (dekat lawan bicara), 저 (jauh dari keduanya)',
      'ba mức: 이 (gần người nói), 그 (gần người nghe), 저 (xa cả hai)',
      'コソア: 이(話し手) / 그(聞き手) / 저(双方から遠い)',
    ),
    example: '이 가방 얼마예요?',
    trans: L(
      'How much is this bag?',
      '¿Cuánto cuesta esta mochila?',
      'Combien coûte ce sac ?',
      'Quanto custa essa mochila?',
      'กระเป๋านี้ราคาเท่าไหร่',
      'Berapa tas ini?',
      'Cái túi này bao nhiêu?',
      'このカバンはいくらですか？',
    ),
    deckId: 'topik-1',
  },

  // G131 · Location words
  {
    ko: '위치어 (위 / 아래 / 앞 / 뒤 / 옆 …)',
    meaning: L(
      'location nouns used with 에 (state) or 에서 (action): above, under, in front, behind, next to, inside, outside, between, near',
      'sustantivos de ubicación con 에 (estático) o 에서 (acción): encima, debajo, delante, detrás, al lado, dentro, fuera, entre, cerca',
      'noms de lieu avec 에 / 에서 : dessus, dessous, devant, derrière, à côté, dans, dehors, entre, près',
      'substantivos de lugar com 에 / 에서: em cima, embaixo, na frente, atrás, ao lado, dentro, fora, entre, perto',
      'คำบอกตำแหน่ง + 에/에서: ข้างบน ข้างล่าง ข้างหน้า ข้างหลัง ข้าง ๆ ข้างใน ข้างนอก ระหว่าง ใกล้',
      'kata lokasi + 에/에서: atas, bawah, depan, belakang, samping, dalam, luar, antara, dekat',
      'từ chỉ vị trí + 에/에서: trên, dưới, trước, sau, cạnh, trong, ngoài, giữa, gần',
      '位置名詞+에/에서: 上・下・前・後・横・中・外・間・近く',
    ),
    example: '가방 안에 책이 있어요.',
    trans: L(
      'There’s a book inside the bag.',
      'Hay un libro dentro de la mochila.',
      'Il y a un livre dans le sac.',
      'Tem um livro dentro da mochila.',
      'มีหนังสืออยู่ในกระเป๋า',
      'Ada buku di dalam tas.',
      'Có một quyển sách trong cặp.',
      'カバンの中に本があります。',
    ),
    deckId: 'topik-1',
  },

  // G132 · Counters
  {
    ko: '수 분류사 (개 / 명 / 권 / 잔 / 마리 …)',
    meaning: L(
      'numeral classifiers — each category of object has its own counter, used with native numbers',
      'clasificadores numéricos — cada categoría tiene un contador propio (con números nativos)',
      'classificateurs numériques — chaque catégorie a son compteur (avec nombres natifs)',
      'classificadores numéricos — cada categoria tem seu contador (números nativos)',
      'ลักษณนาม — ของแต่ละหมวดมีลักษณนามต่างกัน (ใช้ตัวเลขเกาหลีแท้)',
      'penggolong numeral — tiap kategori objek punya penggolongnya (angka asli)',
      'loại từ — mỗi nhóm vật có loại từ riêng (dùng số thuần Hàn)',
      '助数詞: 개(個), 명(人), 권(冊), 잔(杯), 마리(匹)… 固有語数詞と併用',
    ),
    example: '사과 두 개 주세요.',
    trans: L(
      'Two apples, please.',
      'Deme dos manzanas, por favor.',
      'Deux pommes, s’il vous plaît.',
      'Duas maçãs, por favor.',
      'ขอแอปเปิ้ลสองลูกค่ะ',
      'Tolong, dua apel.',
      'Cho tôi hai quả táo.',
      'りんごを二つください。',
    ),
    deckId: 'topik-1',
  },

  // G140 · Greetings and farewells
  {
    ko: '인사 표현',
    meaning: L(
      'core greetings: hello, goodbye (to the one leaving), thank you',
      'saludos esenciales: hola, adiós (al que se va), gracias',
      'salutations de base : bonjour, au revoir (à celui qui part), merci',
      'saudações essenciais: olá, adeus (a quem vai), obrigado/a',
      'คำทักทายหลัก: สวัสดี / ไปดี / ขอบคุณ',
      'salam dasar: halo / selamat jalan / terima kasih',
      'lời chào cơ bản: xin chào / tạm biệt / cảm ơn',
      '挨拶: こんにちは / さようなら(去る人へ) / ありがとうございます',
    ),
    example: '안녕히 가세요!',
    trans: L(
      'Goodbye! (to the one leaving)',
      '¡Adiós! (al que se va)',
      'Au revoir ! (à celui qui s’en va)',
      'Tchau! (a quem está indo)',
      'ไปดีนะคะ (ลาผู้ที่จะไป)',
      'Selamat jalan! (kepada yang pergi)',
      'Tạm biệt nhé! (với người đi)',
      'さようなら！(去る人に)',
    ),
    deckId: 'topik-1',
  },

  // G141 · "How long does it take?"
  {
    ko: '얼마나 걸려요?',
    meaning: L(
      '"How long does it take?" — duration question using 걸리다',
      '"¿Cuánto tiempo se tarda?" — pregunta de duración con 걸리다',
      '«Combien de temps cela prend ?» — durée avec 걸리다',
      '"Quanto tempo demora?" — pergunta de duração com 걸리다',
      '"ใช้เวลาเท่าไหร่?" — ถามระยะเวลา (걸리다)',
      '"Berapa lama?" — pertanyaan durasi (걸리다)',
      '"Mất bao lâu?" — câu hỏi thời gian (걸리다)',
      '「どのくらいかかりますか？」(걸리다)',
    ),
    example: '집에서 학교까지 얼마나 걸려요?',
    trans: L(
      'How long does it take from home to school?',
      '¿Cuánto se tarda de casa a la escuela?',
      'Combien de temps faut-il de chez toi à l’école ?',
      'Quanto tempo leva de casa até a escola?',
      'จากบ้านไปโรงเรียนใช้เวลาเท่าไหร่',
      'Dari rumah ke sekolah berapa lama?',
      'Từ nhà đến trường mất bao lâu?',
      '家から学校までどのくらいかかりますか？',
    ),
    deckId: 'topik-1',
  },

  // G142 · "Together with"
  {
    ko: 'N(이)랑 / 하고 + 같이 / 함께',
    meaning: L(
      '"together with (someone)" — companion particle + 같이/함께',
      '"junto con (alguien)" — partícula de compañía + 같이/함께',
      '"avec / ensemble (qqn)" — particule + 같이/함께',
      '"junto com (alguém)" — partícula de companhia + 같이/함께',
      '"กับ ... ด้วยกัน" — อนุภาคบอกผู้ร่วม + 같이/함께',
      '"bersama (orang)" — partikel pendamping + 같이/함께',
      '"cùng với (ai)" — tiểu từ đi cùng + 같이/함께',
      '「(人)と一緒に」— 同伴助詞 + 같이/함께',
    ),
    example: '친구랑 같이 밥을 먹었어요.',
    trans: L(
      'I ate together with a friend.',
      'Comí junto con un amigo.',
      'J’ai mangé avec un ami.',
      'Comi junto com um amigo.',
      'ฉันกินข้าวกับเพื่อน',
      'Saya makan bersama teman.',
      'Tôi ăn cơm cùng bạn.',
      '友達と一緒にご飯を食べました。',
    ),
    deckId: 'topik-1',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Theme 8 · Transversales que se introducen en este nivel
  // (auxiliares G205–G233 que aparecen ya en TOPIK 1)
  // ─────────────────────────────────────────────────────────────────────────

  // G213 · Movement + action compounds (from auxiliaries.md)
  {
    ko: '가져가다 / 가져오다 / 데려가다 / 데려오다',
    meaning: L(
      'movement + action compounds — take / bring (object), take / bring (person)',
      'compuestos de movimiento + acción — llevar / traer (objeto), llevar / traer (persona)',
      'composés de mouvement + action — emporter / apporter, emmener / amener',
      'compostos de movimento + ação — levar / trazer (objeto), levar / trazer (pessoa)',
      'คำประสม "ไป/มา + การกระทำ" — เอาไป / เอามา / พาไป / พามา',
      'kata majemuk gerak + aksi — membawa pergi / membawa (benda / orang)',
      'từ ghép chuyển động + hành động — đem đi / đem đến / dẫn đi / dẫn đến',
      '移動 + 動作の複合語 — 持っていく / 持ってくる / 連れていく / 連れてくる',
    ),
    example: '음식을 좀 가져왔어요.',
    trans: L(
      'I brought some food.',
      'Traje algo de comida.',
      'J’ai apporté un peu de nourriture.',
      'Trouxe um pouco de comida.',
      'ฉันเอาอาหารมาให้',
      'Saya membawakan sedikit makanan.',
      'Tôi mang theo chút đồ ăn.',
      '食べ物を少し持ってきました。',
    ),
    deckId: 'topik-1',
  },

  // G217 · Negative imperative (from auxiliaries.md)
  {
    ko: '-지 말다',
    meaning: L(
      'negative imperative — "don’t (do)"; 마세요 / 마 / 말자 / 마십시오',
      'imperativo negativo — "no (hagas)"; 마세요 / 마 / 말자 / 마십시오',
      'impératif négatif — «ne ... pas»; 마세요 / 마 / 말자 / 마십시오',
      'imperativo negativo — "não (faça)"; 마세요 / 마 / 말자 / 마십시오',
      'คำสั่งห้าม — "อย่า ..."; 마세요 / 마 / 말자 / 마십시오',
      'larangan — "jangan ..."; 마세요 / 마 / 말자 / 마십시오',
      'cấm đoán — "đừng ..."; 마세요 / 마 / 말자 / 마십시오',
      '「〜してはいけない / 〜しないで」(마세요 / 마 / 말자 / 마십시오)',
    ),
    example: '걱정하지 마세요.',
    trans: L(
      'Please don’t worry.',
      'No se preocupe.',
      'Ne vous inquiétez pas.',
      'Não se preocupe.',
      'อย่ากังวลเลย',
      'Jangan khawatir.',
      'Đừng lo lắng.',
      '心配しないでください。',
    ),
    deckId: 'topik-1',
  },

  // G218 · Not X but Y (from auxiliaries.md)
  {
    ko: 'N 말고',
    meaning: L(
      '"not N, but ..." — rejects one option in favor of another',
      '"no N, sino ..." — rechaza una opción a favor de otra',
      '«pas N, mais ...» — rejette une option pour une autre',
      '"N não, e sim ..." — rejeita uma opção em favor de outra',
      '"ไม่เอา N เอา ... แทน"',
      '"bukan N, melainkan ..."',
      '"không phải N, mà ..."',
      '「Nではなくて ...」— 別の選択',
    ),
    example: '커피 말고 차 주세요.',
    trans: L(
      'Not coffee, please give me tea.',
      'Café no, deme té.',
      'Pas de café, du thé s’il vous plaît.',
      'Café não, me dá chá.',
      'ไม่เอากาแฟ ขอชาแทนค่ะ',
      'Bukan kopi, tolong tehnya.',
      'Không phải cà phê, cho tôi trà.',
      'コーヒーではなくお茶をください。',
    ),
    deckId: 'topik-1',
  },
]

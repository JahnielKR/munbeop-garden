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
    usageNotes: L(
      'Three particles that all mean "and" or "with" connecting nouns, sorted by register: 와/과 is written/formal (와 after vowel, 과 after consonant — 친구와, 책과); 하고 is neutral and the safest spoken default (친구하고); (이)랑 is casual, friend-to-friend (이 after consonant, just 랑 after vowel — 친구랑, 책이랑). They cover both "noun AND noun" and "with noun" (companionship) — same form, context picks the meaning. For listing more than two nouns, attach the particle only between items, not after the last one.',
      'Tres partículas que significan "y" o "con" entre sustantivos, ordenadas por registro: 와/과 es escrito/formal (와 tras vocal, 과 tras consonante — 친구와, 책과); 하고 es neutro y la opción segura en habla (친구하고); (이)랑 es coloquial entre amigos (이 tras consonante, solo 랑 tras vocal — 친구랑, 책이랑). Cubren tanto "sustantivo Y sustantivo" como "con sustantivo" (compañía) — la misma forma, el contexto decide. Para listas de más de dos, la partícula va solo entre elementos, no después del último.',
      'Trois particules signifiant « et » ou « avec » entre noms, classées par registre : 와/과 est écrit/formel (와 après voyelle, 과 après consonne — 친구와, 책과) ; 하고 est neutre et le choix sûr à l\'oral (친구하고) ; (이)랑 est familier, entre amis (이 après consonne, juste 랑 après voyelle — 친구랑, 책이랑). Elles couvrent à la fois « nom ET nom » et « avec un nom » (compagnie) — même forme, le contexte tranche. Pour énumérer plus de deux noms, la particule ne se place qu\'entre les éléments, pas après le dernier.',
      'Três partículas que significam "e" ou "com" entre substantivos, ordenadas por registro: 와/과 é escrita/formal (와 depois de vogal, 과 depois de consoante — 친구와, 책과); 하고 é neutra e a escolha segura na fala (친구하고); (이)랑 é casual entre amigos (이 depois de consoante, só 랑 depois de vogal — 친구랑, 책이랑). Cobrem tanto "substantivo E substantivo" quanto "com substantivo" (companhia) — mesma forma, o contexto decide. Para listar mais de dois, a partícula vai só entre os itens, não depois do último.',
      'อนุภาคสามตัวที่แปลว่า "และ" หรือ "กับ" เชื่อมคำนาม เรียงตามระดับภาษา: 와/과 เป็นทางการ/เขียน (와 หลังสระ, 과 หลังพยัญชนะ — 친구와, 책과); 하고 เป็นกลาง ปลอดภัยในภาษาพูด (친구하고); (이)랑 เป็นกันเองระหว่างเพื่อน (이 หลังพยัญชนะ, 랑 หลังสระ — 친구랑, 책이랑). ใช้ได้ทั้ง "คำนาม และ คำนาม" และ "กับ คำนาม" (เพื่อนคู่หู) — รูปเดียวกัน บริบทจะบอกความหมาย. ถ้าจะระบุมากกว่าสองคำ ใส่อนุภาคเฉพาะระหว่างคำ ไม่ใส่หลังคำสุดท้าย',
      'Tiga partikel yang berarti "dan" atau "dengan" antar kata benda, diurut berdasarkan register: 와/과 tulis/formal (와 setelah vokal, 과 setelah konsonan — 친구와, 책과); 하고 netral dan pilihan aman dalam percakapan (친구하고); (이)랑 santai antar teman (이 setelah konsonan, hanya 랑 setelah vokal — 친구랑, 책이랑). Mencakup "kata benda DAN kata benda" maupun "dengan kata benda" (kebersamaan) — bentuk sama, konteks menentukan. Untuk lebih dari dua kata, partikelnya hanya di antara item, bukan setelah yang terakhir.',
      'Ba tiểu từ đều nghĩa "và" hoặc "với" giữa các danh từ, xếp theo cấp độ trang trọng: 와/과 trang trọng/viết (와 sau nguyên âm, 과 sau phụ âm — 친구와, 책과); 하고 trung tính, lựa chọn an toàn khi nói (친구하고); (이)랑 thân mật giữa bạn bè (이 sau phụ âm, chỉ 랑 sau nguyên âm — 친구랑, 책이랑). Bao cả "danh từ VÀ danh từ" lẫn "với danh từ" (bạn đồng hành) — cùng dạng, ngữ cảnh quyết định. Khi liệt kê hơn hai danh từ, tiểu từ chỉ đặt giữa các thành phần, không sau danh từ cuối.',
      '名詞をつなぐ「と」「〜と一緒に」の3つの助詞、丁寧度順に: 와/과 は文語・フォーマル(母音後 와、子音後 과 — 친구와、책과); 하고 は中立で会話の安全牌(친구하고); (이)랑 は親しい間柄(子音後 이, 母音後そのまま 랑 — 친구랑、책이랑)。「名詞と名詞」(並列)も「名詞と一緒に」(同伴)もこの形でこなし、意味は文脈次第。3つ以上を並べるときは要素間にだけ付け、最後の要素の後には付けない。',
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
    usageNotes: L(
      'Means "also / too" in positive sentences and "either / neither" in negatives. Critically, 도 REPLACES the case particles 은/는, 이/가, 을/를 — you never stack them (write 저도 not 저는도, 책도 not 책을도). It can co-exist with location/time particles like 에 and 에서 (집에서도 일해요 "I also work from home"). Position matters for meaning: 저도 책을 읽어요 "I too read books" focuses on "I"; 저는 책도 읽어요 "I also read books" focuses on "books".',
      'Significa "también" en oraciones afirmativas y "tampoco" en negativas. Importante: 도 SUSTITUYE a las partículas de caso 은/는, 이/가, 을/를 — nunca se apilan (escribe 저도, no 저는도; 책도, no 책을도). Puede coexistir con partículas de lugar/tiempo como 에 y 에서 (집에서도 일해요 "también trabajo en casa"). La posición cambia el sentido: 저도 책을 읽어요 "yo también leo libros" enfatiza "yo"; 저는 책도 읽어요 "yo también leo libros" enfatiza "libros".',
      'Signifie « aussi » en phrase affirmative et « non plus » en phrase négative. Important : 도 REMPLACE les particules de cas 은/는, 이/가, 을/를 — on ne les empile jamais (저도, pas 저는도 ; 책도, pas 책을도). Coexiste avec les particules de lieu/temps comme 에 et 에서 (집에서도 일해요 « je travaille aussi à la maison »). La position porte le sens : 저도 책을 읽어요 « moi aussi je lis des livres » met l\'accent sur « je » ; 저는 책도 읽어요 « je lis aussi des livres » met l\'accent sur « livres ».',
      'Significa "também" em afirmativas e "tampouco" em negativas. Importante: 도 SUBSTITUI as partículas de caso 은/는, 이/가, 을/를 — nunca se empilham (escreva 저도, não 저는도; 책도, não 책을도). Convive com partículas de lugar/tempo como 에 e 에서 (집에서도 일해요 "também trabalho em casa"). A posição muda o sentido: 저도 책을 읽어요 "eu também leio livros" enfatiza "eu"; 저는 책도 읽어요 "eu leio livros também" enfatiza "livros".',
      'แปลว่า "ก็... ด้วย" ในประโยคบอกเล่า และ "ก็ไม่... เหมือนกัน" ในประโยคปฏิเสธ. ที่สำคัญ: 도 จะ "แทน" อนุภาคบ่งกรณี 은/는, 이/가, 을/를 — ห้ามใส่ซ้อนกัน (เขียน 저도 ไม่ใช่ 저는도, 책도 ไม่ใช่ 책을도). ใช้คู่กับอนุภาคสถานที่/เวลา 에 และ 에서 ได้ (집에서도 일해요 "ฉันก็ทำงานที่บ้านด้วย"). ตำแหน่งเปลี่ยนความหมาย: 저도 책을 읽어요 เน้น "ฉันก็เหมือนกัน"; 저는 책도 읽어요 เน้น "หนังสือก็อ่านด้วย"',
      'Berarti "juga" dalam kalimat positif dan "(juga) tidak" dalam negasi. Penting: 도 MENGGANTIKAN partikel kasus 은/는, 이/가, 을/를 — tidak pernah ditumpuk (tulis 저도, bukan 저는도; 책도, bukan 책을도). Bisa berdampingan dengan partikel tempat/waktu seperti 에 dan 에서 (집에서도 일해요 "saya juga kerja di rumah"). Posisi mengubah arti: 저도 책을 읽어요 "saya juga membaca buku" menekankan "saya"; 저는 책도 읽어요 "saya juga membaca buku" menekankan "buku".',
      'Có nghĩa "cũng" trong câu khẳng định và "cũng không" trong câu phủ định. Quan trọng: 도 THAY THẾ các tiểu từ chỉ cách 은/는, 이/가, 을/를 — không bao giờ chồng lên nhau (viết 저도, không phải 저는도; 책도, không phải 책을도). Có thể đi cùng tiểu từ địa điểm/thời gian như 에 và 에서 (집에서도 일해요 "tôi cũng làm việc ở nhà"). Vị trí đổi nghĩa: 저도 책을 읽어요 nhấn mạnh "tôi"; 저는 책도 읽어요 nhấn mạnh "sách".',
      '肯定文では「も」、否定文では「〜も(〜ない)」を表す。重要: 도 は格助詞 은/는、이/가、을/를 を「置き換える」— 重ねて使わない(저도、저는도 とは書かない; 책도、책을도 とは書かない)。에・에서 など場所・時間助詞とは共起できる(집에서도 일해요「家でも働く」)。位置で焦点が変わる: 저도 책을 읽어요「私も本を読む」(私に焦点); 저는 책도 읽어요「私は本も読む」(本に焦点)。',
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
    usageNotes: L(
      'Means "only / just" — exclusivity, "X and nothing else." Like 도, it usually replaces the case particles 은/는, 이/가, 을/를 (커피만 마셔요 "I only drink coffee," not 커피를만). But unlike 도, it CAN stack with case particles for emphasis: 커피만을 마셔요 is grammatical and slightly more formal/emphatic. Pairs with 에/에서/(으)로 freely (집에서만 일해요 "I only work from home"). For "only" with verbs/clauses, use the conjugated form -기만 하다 instead.',
      'Significa "solo / únicamente" — exclusividad, "X y nada más". Como 도, suele sustituir a las partículas de caso 은/는, 이/가, 을/를 (커피만 마셔요 "solo bebo café", no 커피를만). Pero a diferencia de 도, SÍ puede apilarse con las partículas de caso para enfatizar: 커피만을 마셔요 es gramatical y un poco más formal/enfático. Se combina sin problema con 에/에서/(으)로 (집에서만 일해요 "solo trabajo desde casa"). Para "solo" con verbos/cláusulas se usa la forma conjugada -기만 하다.',
      'Signifie « seulement / juste » — exclusivité, « X et rien d\'autre ». Comme 도, remplace généralement les particules de cas 은/는, 이/가, 을/를 (커피만 마셔요 « je ne bois que du café », pas 커피를만). Mais contrairement à 도, 만 PEUT s\'empiler avec les particules de cas pour insister : 커피만을 마셔요 est correct et un peu plus formel/emphatique. Se combine librement avec 에/에서/(으)로 (집에서만 일해요 « je ne travaille qu\'à la maison »). Pour « seulement » avec verbes ou propositions, employer la forme conjuguée -기만 하다.',
      'Significa "só / apenas" — exclusividade, "X e nada mais". Como 도, geralmente substitui as partículas de caso 은/는, 이/가, 을/를 (커피만 마셔요 "só bebo café", não 커피를만). Mas diferente de 도, 만 PODE se empilhar com as partículas de caso para ênfase: 커피만을 마셔요 é gramatical e um pouco mais formal/enfático. Combina sem problema com 에/에서/(으)로 (집에서만 일해요 "só trabalho de casa"). Para "só" com verbos/orações, use a forma conjugada -기만 하다.',
      'แปลว่า "เท่านั้น / แค่" — แสดงการจำกัด "X เท่านั้น ไม่มีอย่างอื่น". เหมือน 도 มันมักแทนอนุภาคบ่งกรณี 은/는, 이/가, 을/를 (커피만 마셔요 "ฉันดื่มแค่กาแฟ" ไม่ใช่ 커피를만). แต่ต่างจาก 도 ตรงที่ 만 "ซ้อน" กับอนุภาคบ่งกรณีได้เพื่อเน้น: 커피만을 마셔요 ถูกไวยากรณ์และทางการกว่าเล็กน้อย. ใช้คู่กับ 에/에서/(으)로 ได้อย่างอิสระ (집에서만 일해요 "ฉันทำงานแค่ที่บ้าน"). ถ้าจะใช้ "เท่านั้น" กับกริยา/อนุประโยค ให้ใช้รูปที่ผันแล้ว -기만 하다',
      'Berarti "hanya / saja" — eksklusivitas, "X dan tidak ada lainnya". Seperti 도, biasanya menggantikan partikel kasus 은/는, 이/가, 을/를 (커피만 마셔요 "saya hanya minum kopi", bukan 커피를만). Tapi tidak seperti 도, 만 BISA ditumpuk dengan partikel kasus untuk penegasan: 커피만을 마셔요 gramatikal dan terasa lebih formal/tegas. Berdampingan bebas dengan 에/에서/(으)로 (집에서만 일해요 "saya hanya kerja dari rumah"). Untuk "hanya" dengan verba/klausa, pakai bentuk konjugasi -기만 하다.',
      'Nghĩa là "chỉ / chỉ mỗi" — sự độc quyền, "X và không gì khác". Giống 도, thường thay tiểu từ chỉ cách 은/는, 이/가, 을/를 (커피만 마셔요 "tôi chỉ uống cà phê", không phải 커피를만). Nhưng khác 도, 만 CÓ THỂ chồng với tiểu từ chỉ cách để nhấn: 커피만을 마셔요 đúng ngữ pháp và hơi trang trọng/nhấn mạnh hơn. Đi tự do với 에/에서/(으)로 (집에서만 일해요 "tôi chỉ làm việc ở nhà"). Để nói "chỉ" với động từ/mệnh đề, dùng dạng chia -기만 하다.',
      '「だけ／〜のみ」— 排他「Xだけで他はない」を表す。도 と同様、通常は格助詞 은/는・이/가・을/를 を置き換える(커피만 마셔요「コーヒーだけ飲む」、커피를만 とは言わない)。ただし 도 と違い、만 は格助詞と「重ねて」強調できる: 커피만을 마셔요 は正しく、やや文語的・強調的。에・에서・(으)로 とは自由に共起する(집에서만 일해요「家でだけ働く」)。動詞や節に「〜だけ」を付けるときは活用形 -기만 하다 を使う。',
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
    usageNotes: L(
      'Possessive "of" — A의 B = "B of A" / "A\'s B". Word order is the opposite of English: 친구의 책 = "the friend\'s book", literally "friend-of book". In speech and casual writing the 의 is very often dropped: 친구 책, 우리 어머니 (very natural), and personal pronouns even contract: 나의 → 내, 저의 → 제, 너의 → 네 (which is why "my book" is usually 내 책, not 나의 책). Keep the 의 in formal writing, fixed phrases, and when the relationship would be ambiguous without it.',
      'Posesivo "de" — A의 B = "B de A". El orden es contrario al español: 친구의 책 = "el libro del amigo", literalmente "amigo-de libro". En habla y escritura casual la 의 se omite mucho: 친구 책, 우리 어머니 (muy natural), y los pronombres personales se contraen: 나의 → 내, 저의 → 제, 너의 → 네 (por eso "mi libro" suele ser 내 책, no 나의 책). Mantén la 의 en escritura formal, expresiones fijas y cuando la relación quedaría ambigua sin ella.',
      'Possessif « de » — A의 B = « le B de A ». L\'ordre est inverse du français : 친구의 책 = « le livre de l\'ami », littéralement « ami-de livre ». À l\'oral et à l\'écrit informel, le 의 tombe très souvent : 친구 책, 우리 어머니 (très naturel), et les pronoms personnels se contractent : 나의 → 내, 저의 → 제, 너의 → 네 (d\'où « mon livre » normalement 내 책, pas 나의 책). Conserver le 의 à l\'écrit soutenu, dans les expressions figées, et quand la relation serait ambiguë sans lui.',
      'Possessivo "de" — A의 B = "B de A" / "o B de A". A ordem é o oposto do português: 친구의 책 = "o livro do amigo", literalmente "amigo-de livro". Na fala e escrita casual o 의 é muito frequentemente omitido: 친구 책, 우리 어머니 (bem natural), e pronomes pessoais contraem: 나의 → 내, 저의 → 제, 너의 → 네 (por isso "meu livro" costuma ser 내 책, não 나의 책). Mantenha 의 na escrita formal, expressões fixas e quando a relação ficaria ambígua sem ele.',
      'แสดงความเป็นเจ้าของ "ของ" — A의 B = "B ของ A" (ลำดับตรงข้ามภาษาไทย/อังกฤษ): 친구의 책 = "หนังสือของเพื่อน" ตามตัวอักษรคือ "เพื่อน-ของ หนังสือ". ในภาษาพูดและเขียนแบบกันเอง 의 มักถูกตัดทิ้ง: 친구 책, 우리 어머니 (เป็นธรรมชาติมาก) และคำสรรพนามจะหดเหลือสั้น: 나의 → 내, 저의 → 제, 너의 → 네 (ดังนั้น "หนังสือของฉัน" มักเป็น 내 책 ไม่ใช่ 나의 책). คง 의 ไว้ในงานเขียนทางการ สำนวนตายตัว และเมื่อตัดแล้วจะกำกวม',
      'Kepemilikan "milik" — A의 B = "B milik A" / "B-nya A". Urutan kebalikan dari bahasa Indonesia: 친구의 책 = "buku teman", harfiah "teman-milik buku". Dalam percakapan dan tulisan santai, 의 sangat sering dilepas: 친구 책, 우리 어머니 (sangat alami), dan kata ganti orang menyusut: 나의 → 내, 저의 → 제, 너의 → 네 (karena itu "buku saya" biasanya 내 책, bukan 나의 책). Pertahankan 의 dalam tulisan formal, frase tetap, dan saat hubungan akan ambigu tanpanya.',
      'Sở hữu "của" — A의 B = "B của A". Trật tự ngược với tiếng Việt: 친구의 책 = "sách của bạn", nghĩa đen "bạn-của sách". Trong khẩu ngữ và viết thân mật, 의 rất hay bị lược: 친구 책, 우리 어머니 (rất tự nhiên), và đại từ nhân xưng co lại: 나의 → 내, 저의 → 제, 너의 → 네 (vì vậy "sách của tôi" thường là 내 책, không phải 나의 책). Giữ 의 trong viết trang trọng, cụm cố định, và khi nếu bỏ thì quan hệ sẽ mơ hồ.',
      '所有を表す「〜の」— A의 B = 「AのB」。語順は日本語と同じ: 친구의 책 = 「友達の本」。話し言葉やくだけた文では 의 はよく省略される: 친구 책、우리 어머니(非常に自然)。人称代名詞は短縮される: 나의 → 내、저의 → 제、너의 → 네(だから「私の本」は普通 내 책 で、나의 책 ではない)。文語、固定表現、関係が曖昧になりそうな場合は 의 を残す。',
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
    usageNotes: L(
      'Three variants of "to/for (a person)" — Korean uses a different particle for people than for places. 에게 is written/neutral, 한테 is the spoken default (친구한테 줬어요), 께 is honorific for elders and superiors (선생님께 드렸어요 — usually paired with 드리다 not 주다). For places, use 에 instead (학교에 가요, not 학교에게). The mirror image "from a person" is 에게서 / 한테서 / 께(서) (친구한테서 받았어요 "I received it from a friend").',
      'Tres variantes de "a / para (una persona)" — el coreano usa partículas distintas para personas y para lugares. 에게 es escrito/neutro, 한테 es lo normal hablado (친구한테 줬어요), y 께 es honorífico para mayores o superiores (선생님께 드렸어요 — suele ir con 드리다, no con 주다). Para lugares usa 에 (학교에 가요, no 학교에게). El espejo "desde una persona" es 에게서 / 한테서 / 께(서) (친구한테서 받았어요 "lo recibí de un amigo").',
      'Trois variantes de « à / pour (une personne) » — le coréen distingue les particules pour les personnes et pour les lieux. 에게 est écrit/neutre, 한테 est le choix oral courant (친구한테 줬어요), 께 est honorifique pour les aînés ou supérieurs (선생님께 드렸어요 — généralement avec 드리다, pas 주다). Pour un lieu, employer 에 (학교에 가요, et non 학교에게). La forme miroir « de la part de quelqu\'un » est 에게서 / 한테서 / 께(서) (친구한테서 받았어요 « je l\'ai reçu d\'un ami »).',
      'Três variantes de "para / a (uma pessoa)" — coreano usa partículas diferentes para pessoas e lugares. 에게 é escrita/neutra, 한테 é o padrão falado (친구한테 줬어요), 께 é honorífica para mais velhos ou superiores (선생님께 드렸어요 — costuma ir com 드리다, não 주다). Para lugares use 에 (학교에 가요, não 학교에게). O espelho "de uma pessoa" é 에게서 / 한테서 / 께(서) (친구한테서 받았어요 "recebi de um amigo").',
      'สามรูปแบบของ "ให้/แก่ (คน)" — เกาหลีใช้อนุภาคต่างกันสำหรับคนและสถานที่. 에게 เป็นทางการ/กลาง, 한테 ใช้พูดทั่วไป (친구한테 줬어요), 께 เป็นรูปยกย่องสำหรับผู้อาวุโส/ผู้ใหญ่ (선생님께 드렸어요 — มักใช้คู่กับ 드리다 ไม่ใช่ 주다). สำหรับสถานที่ใช้ 에 แทน (학교에 가요 ไม่ใช่ 학교에게). รูปสวนทาง "จากคน" คือ 에게서 / 한테서 / 께(서) (친구한테서 받았어요 "ฉันได้รับจากเพื่อน")',
      'Tiga varian "kepada/untuk (orang)" — Korea memakai partikel berbeda untuk orang dan tempat. 에게 formal/netral, 한테 standar percakapan (친구한테 줬어요), 께 hormat untuk orang yang lebih tua atau atasan (선생님께 드렸어요 — biasanya dengan 드리다 bukan 주다). Untuk tempat pakai 에 (학교에 가요, bukan 학교에게). Kebalikannya "dari seseorang" adalah 에게서 / 한테서 / 께(서) (친구한테서 받았어요 "saya menerimanya dari teman").',
      'Ba biến thể của "cho/đến (người)" — tiếng Hàn dùng tiểu từ khác nhau cho người và cho địa điểm. 에게 trang trọng/trung tính, 한테 chuẩn khẩu ngữ (친구한테 줬어요), 께 kính ngữ cho người lớn tuổi hoặc cấp trên (선생님께 드렸어요 — thường đi với 드리다 chứ không phải 주다). Với địa điểm dùng 에 (학교에 가요, không phải 학교에게). Dạng ngược lại "từ ai đó" là 에게서 / 한테서 / 께(서) (친구한테서 받았어요 "tôi nhận từ bạn").',
      '人への「に」の3形式 — 韓国語は人と場所で助詞を変える。에게 は文語・中立、한테 は会話の標準(친구한테 줬어요)、께 は尊敬形で目上に使う(선생님께 드렸어요 — 通常は 주다 ではなく 드리다 と組み合わせる)。場所には 에 を使う(학교에 가요、학교에게 とは言わない)。「〜から(人)」の対になる形は 에게서 / 한테서 / 께(서)(친구한테서 받았어요「友達からもらった」)。',
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
    usageNotes: L(
      'Multipurpose: (1) direction — "toward" (서울로 가요 "head toward Seoul"); (2) means or vehicle — "by" (버스로, 지하철로); (3) instrument — "with" (펜으로 써요 "write with a pen"); (4) conversion or language — "into" (한국어로 말해요 "speak in Korean"). Form: 로 after a vowel or ㄹ-final (지하철로), 으로 after any other consonant (가위로 "with scissors"). Distinguish from 에: 에 marks a specific endpoint or static spot, while (으)로 marks the direction or route you take to get there.',
      'Multiuso: (1) dirección — "hacia" (서울로 가요 "ir hacia Seúl"); (2) medio o vehículo — "en" (버스로, 지하철로); (3) instrumento — "con" (펜으로 써요 "escribir con un bolígrafo"); (4) conversión o idioma — "a" (한국어로 말해요 "hablar en coreano"). Forma: 로 tras vocal o ㄹ final (지하철로), 으로 tras cualquier otra consonante (가위로 "con tijeras"). Se distingue de 에: 에 marca un punto final concreto o lugar estático, mientras que (으)로 marca la dirección o la ruta por la que vas.',
      'Polyvalente : (1) direction — « vers » (서울로 가요 « aller vers Séoul ») ; (2) moyen ou véhicule — « en » (버스로, 지하철로) ; (3) instrument — « avec » (펜으로 써요 « écrire avec un stylo ») ; (4) conversion ou langue — « en » (한국어로 말해요 « parler en coréen »). Forme : 로 après voyelle ou final ㄹ (지하철로), 으로 après toute autre consonne (가위로 « avec des ciseaux »). À distinguer de 에 : 에 marque un point d\'arrivée précis ou un lieu statique, alors que (으)로 marque la direction ou le trajet.',
      'Multifunção: (1) direção — "em direção a" (서울로 가요 "ir em direção a Seul"); (2) meio ou veículo — "de" (버스로, 지하철로); (3) instrumento — "com" (펜으로 써요 "escrever com caneta"); (4) conversão ou idioma — "em" (한국어로 말해요 "falar em coreano"). Forma: 로 depois de vogal ou final ㄹ (지하철로), 으로 depois de qualquer outra consoante (가위로 "com tesoura"). Distingue-se de 에: 에 marca um ponto final específico ou local estático, enquanto (으)로 marca a direção ou o caminho.',
      'ใช้ได้หลายความหมาย: (1) ทิศทาง — "ไปทาง" (서울로 가요 "มุ่งหน้าสู่โซล"); (2) วิธี/พาหนะ — "ด้วย" (버스로, 지하철로); (3) เครื่องมือ — "ด้วย" (펜으로 써요 "เขียนด้วยปากกา"); (4) การแปลง/ภาษา — "เป็น" (한국어로 말해요 "พูดเป็นภาษาเกาหลี"). รูป: 로 หลังสระหรือพยัญชนะท้าย ㄹ (지하철로), 으로 หลังพยัญชนะอื่น (가위로 "ด้วยกรรไกร"). ต่างจาก 에: 에 บอกจุดปลายทางหรือที่ตั้งแบบหยุดนิ่ง ส่วน (으)로 บอกทิศทางหรือเส้นทาง',
      'Serbaguna: (1) arah — "menuju" (서울로 가요 "menuju Seoul"); (2) cara atau kendaraan — "dengan/naik" (버스로, 지하철로); (3) alat — "dengan" (펜으로 써요 "menulis dengan pena"); (4) konversi atau bahasa — "ke dalam" (한국어로 말해요 "berbicara dalam bahasa Korea"). Bentuk: 로 setelah vokal atau akhir ㄹ (지하철로), 으로 setelah konsonan lain (가위로 "dengan gunting"). Beda dengan 에: 에 menandai titik akhir spesifik atau tempat statis, sedangkan (으)로 menandai arah atau rute yang ditempuh.',
      'Đa dụng: (1) hướng — "về phía" (서울로 가요 "đi về phía Seoul"); (2) phương tiện hoặc cách — "bằng" (버스로, 지하철로); (3) công cụ — "bằng" (펜으로 써요 "viết bằng bút"); (4) chuyển đổi hoặc ngôn ngữ — "thành/ra" (한국어로 말해요 "nói bằng tiếng Hàn"). Hình thức: 로 sau nguyên âm hoặc ㄹ cuối (지하철로), 으로 sau bất kỳ phụ âm nào khác (가위로 "bằng kéo"). Khác với 에: 에 đánh dấu điểm đến cụ thể hoặc vị trí tĩnh, còn (으)로 đánh dấu hướng đi hoặc tuyến đường.',
      '多用途: (1) 方向 — 「〜の方へ」(서울로 가요「ソウルの方へ行く」); (2) 手段・乗り物 — 「〜で」(버스로、지하철로); (3) 道具 — 「〜で」(펜으로 써요「ペンで書く」); (4) 変換・言語 — 「〜に／で」(한국어로 말해요「韓国語で話す」)。形: 母音または ㄹ で終わる名詞には 로(지하철로)、その他の子音には 으로(가위로「ハサミで」)。에 との区別: 에 は具体的な到達点や静的な位置、(으)로 は向かう方向や経路。',
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
    usageNotes: L(
      '부터 marks the START of a range, 까지 marks the END. Used for time (9시부터 5시까지) or space (서울에서부터 부산까지 — note the 에서부터 stack when both motion and start point apply). They show up alone too: 지금부터 "from now on", 다음 주까지 "by next week". 까지 has a secondary "even, all the way to" sense beyond range (저까지 도와줬어요 "they even helped me"). Don\'t confuse 부터 with 에서: 부터 is purely a starting point on a scale, 에서 is the location of an action or geographic origin.',
      '부터 marca el INICIO de un rango, 까지 marca el FIN. Para tiempo (9시부터 5시까지) o espacio (서울에서부터 부산까지 — notá la combinación 에서부터 cuando hay tanto movimiento como punto de partida). Aparecen también solas: 지금부터 "desde ahora", 다음 주까지 "para la próxima semana". 까지 tiene un sentido extra de "incluso / hasta" más allá del rango (저까지 도와줬어요 "incluso me ayudaron"). No confundas 부터 con 에서: 부터 es puramente el punto de inicio en una escala, 에서 es el lugar de una acción o el origen geográfico.',
      '부터 marque le DÉBUT d\'une plage, 까지 la FIN. S\'emploie pour le temps (9시부터 5시까지) ou l\'espace (서울에서부터 부산까지 — noter la combinaison 에서부터 quand mouvement et point de départ coïncident). Apparaissent seuls aussi : 지금부터 « à partir de maintenant », 다음 주까지 « d\'ici la semaine prochaine ». 까지 a en plus le sens « même, jusqu\'à » au-delà d\'une plage (저까지 도와줬어요 « ils m\'ont même aidé »). Ne pas confondre 부터 et 에서 : 부터 est un point de départ sur une échelle, 에서 est le lieu d\'une action ou l\'origine géographique.',
      '부터 marca o INÍCIO de um intervalo, 까지 marca o FIM. Para tempo (9시부터 5시까지) ou espaço (서울에서부터 부산까지 — note a combinação 에서부터 quando há movimento e ponto inicial juntos). Aparecem sozinhos também: 지금부터 "a partir de agora", 다음 주까지 "até a próxima semana". 까지 tem um sentido extra de "até mesmo / todo o caminho até" além de intervalo (저까지 도와줬어요 "eles até me ajudaram"). Não confunda 부터 com 에서: 부터 é apenas o ponto inicial numa escala, 에서 é o lugar de uma ação ou origem geográfica.',
      '부터 บอกจุด "เริ่มต้น" ของช่วง, 까지 บอก "สิ้นสุด". ใช้กับเวลา (9시부터 5시까지) หรือพื้นที่ (서울에서부터 부산까지 — สังเกตการซ้อน 에서부터 เมื่อมีทั้งการเคลื่อนที่และจุดเริ่มต้น). ใช้เดี่ยว ๆ ก็ได้: 지금부터 "ตั้งแต่ตอนนี้", 다음 주까지 "ภายในสัปดาห์หน้า". 까지 มีความหมายเพิ่มเติม "ถึงขนาด/แม้แต่" นอกเหนือจากการบอกช่วง (저까지 도와줬어요 "เขาช่วยฉันถึงขนาดนั้น"). อย่าสับสน 부터 กับ 에서: 부터 คือจุดเริ่มต้นบนสเกล ส่วน 에서 คือสถานที่เกิดการกระทำหรือต้นทางทางภูมิศาสตร์',
      '부터 menandai AWAL rentang, 까지 menandai AKHIRnya. Untuk waktu (9시부터 5시까지) atau ruang (서울에서부터 부산까지 — perhatikan tumpukan 에서부터 ketika gerakan dan titik awal bertepatan). Bisa muncul sendiri: 지금부터 "mulai sekarang", 다음 주까지 "sampai minggu depan". 까지 punya makna tambahan "bahkan / sampai sejauh itu" di luar rentang (저까지 도와줬어요 "mereka bahkan membantu saya"). Jangan tertukar 부터 dengan 에서: 부터 murni titik awal pada skala, 에서 adalah tempat aksi atau asal geografis.',
      '부터 đánh dấu KHỞI ĐẦU của một khoảng, 까지 đánh dấu KẾT THÚC. Dùng cho thời gian (9시부터 5시까지) hoặc không gian (서울에서부터 부산까지 — chú ý sự chồng 에서부터 khi có cả chuyển động lẫn điểm xuất phát). Đứng một mình cũng được: 지금부터 "từ bây giờ", 다음 주까지 "đến tuần sau". 까지 còn có nghĩa phụ "thậm chí / đến mức" ngoài chỉ khoảng (저까지 도와줬어요 "họ thậm chí giúp tôi"). Đừng nhầm 부터 với 에서: 부터 thuần túy là điểm bắt đầu trên thang, 에서 là nơi xảy ra hành động hay nguồn gốc địa lý.',
      '부터 は範囲の「始まり」、까지 は「終わり」を示す。時間(9시부터 5시까지)にも空間(서울에서부터 부산까지 — 移動と始点が重なるときは 에서부터 と重ねる)にも使う。単独でも現れる: 지금부터「今から」、다음 주까지「来週まで」。까지 には範囲を超えた「〜まで／〜さえも」の含意もある(저까지 도와줬어요「私(のような者)まで助けてくれた」)。부터 と 에서 を混同しないこと: 부터 は尺度上の起点、에서 は動作の場所や地理的出発点。',
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
    usageNotes: L(
      'Attaches to a noun and means "every" or "each, individually" — covers both regular repetition (날마다 "every day", 주말마다 "every weekend") and distributive variation (사람마다 달라요 "it differs from person to person"). Very close in meaning to the 매- prefix forms (날마다 ≈ 매일, 해마다 ≈ 매년), but 마다 attaches to native Korean roots while 매- pairs with Sino-Korean roots and forms a single word. 마다 doesn\'t require any additional case particle — don\'t stack 을/를 or 이/가 after it.',
      'Se añade a un sustantivo y significa "cada / todos los" — cubre tanto la repetición regular (날마다 "todos los días", 주말마다 "cada fin de semana") como la variación distributiva (사람마다 달라요 "varía de persona en persona"). Muy cercano a las formas con prefijo 매- (날마다 ≈ 매일, 해마다 ≈ 매년), pero 마다 se pega a raíces coreanas nativas, mientras 매- va con raíces sino-coreanas formando una sola palabra. 마다 no requiere partícula de caso adicional — no apiles 을/를 o 이/가 detrás.',
      'S\'attache à un nom et signifie « chaque / tous les » — couvre la répétition régulière (날마다 « tous les jours », 주말마다 « chaque week-end ») comme la variation distributive (사람마다 달라요 « ça varie d\'une personne à l\'autre »). Très proche des formes en préfixe 매- (날마다 ≈ 매일, 해마다 ≈ 매년), mais 마다 se rattache aux racines coréennes natives, alors que 매- s\'associe aux racines sino-coréennes et forme un seul mot. 마다 n\'a besoin d\'aucune autre particule casuelle — ne pas empiler 을/를 ni 이/가 derrière.',
      'Anexa-se a um substantivo e significa "cada / todos os" — cobre tanto a repetição regular (날마다 "todos os dias", 주말마다 "cada fim de semana") quanto a variação distributiva (사람마다 달라요 "varia de pessoa para pessoa"). Bem próximo das formas com prefixo 매- (날마다 ≈ 매일, 해마다 ≈ 매년), mas 마다 anexa-se a raízes coreanas nativas, enquanto 매- vai com raízes sino-coreanas formando uma única palavra. 마다 não exige partícula de caso adicional — não empilhe 을/를 ou 이/가 atrás.',
      'ใส่หลังคำนามและแปลว่า "ทุก/แต่ละ" — ครอบคลุมทั้งการเกิดซ้ำสม่ำเสมอ (날마다 "ทุกวัน", 주말마다 "ทุกสุดสัปดาห์") และความแตกต่างแบบกระจาย (사람마다 달라요 "แต่ละคนต่างกัน"). ใกล้กับรูปคำเติมหน้า 매- มาก (날마다 ≈ 매일, 해마다 ≈ 매년) แต่ 마다 ใช้กับรากศัพท์เกาหลีแท้ ส่วน 매- ใช้กับรากศัพท์จีน-เกาหลีและกลายเป็นคำเดียว. 마다 ไม่ต้องการอนุภาคบ่งกรณีเพิ่มเติม — ห้ามใส่ 을/를 หรือ 이/가 ตามหลัง',
      'Menempel pada kata benda dan berarti "setiap" — mencakup pengulangan teratur (날마다 "setiap hari", 주말마다 "setiap akhir pekan") dan variasi distributif (사람마다 달라요 "berbeda-beda tiap orang"). Sangat mirip bentuk dengan prefiks 매- (날마다 ≈ 매일, 해마다 ≈ 매년), tetapi 마다 menempel pada akar Korea asli, sedangkan 매- berpasangan dengan akar Sino-Korea dan membentuk satu kata. 마다 tidak butuh partikel kasus tambahan — jangan tumpuk 을/를 atau 이/가 setelahnya.',
      'Gắn vào danh từ và có nghĩa "mỗi / từng" — bao gồm cả lặp lại đều đặn (날마다 "mỗi ngày", 주말마다 "mỗi cuối tuần") lẫn biến thiên phân phối (사람마다 달라요 "mỗi người mỗi khác"). Rất gần với các dạng tiền tố 매- (날마다 ≈ 매일, 해마다 ≈ 매년), nhưng 마다 đi với gốc Hàn thuần, còn 매- đi với gốc Hán-Hàn tạo thành một từ. 마다 không cần tiểu từ chỉ cách bổ sung — đừng chồng 을/를 hay 이/가 phía sau.',
      '名詞に付いて「〜ごとに／毎〜」を表し、規則的な反復(날마다「毎日」、주말마다「週末ごとに」)も分配的な多様性(사람마다 달라요「人によって違う」)も両方カバーする。매- 接頭辞形(날마다 ≈ 매일、해마다 ≈ 매년)とほぼ同義だが、마다 は固有語の語根、매- は漢字語の語根に付いて一語化する点が違う。마다 の後ろに 을/를 や 이/가 などの格助詞を重ねる必要はない(重ねない)。',
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
    usageNotes: L(
      'Two distinct uses sharing one form: (1) "or" between nouns — A 또는 B in formal contexts becomes A(이)나 B in everyday speech (커피나 차 "coffee or tea"); (2) "as many/much as" with quantity expressions, signaling surprise that the number is high (사람이 백 명이나 왔어요 "as many as 100 people came"). Form: 이나 after a consonant, 나 after a vowel. For "or" between verbs or clauses use -거나 instead (가거나 말거나 "whether you go or not"). The casual conversational alternative for "or" is 아니면 ("or else").',
      'Dos usos distintos con la misma forma: (1) "o" entre sustantivos — A 또는 B en contextos formales se vuelve A(이)나 B en habla cotidiana (커피나 차 "café o té"); (2) "hasta / nada menos que" con cantidades, expresando sorpresa porque el número es alto (사람이 백 명이나 왔어요 "vinieron nada menos que 100 personas"). Forma: 이나 tras consonante, 나 tras vocal. Para "o" entre verbos o cláusulas se usa -거나 (가거나 말거나 "vayas o no"). La alternativa coloquial para "o" es 아니면 ("o si no").',
      'Deux emplois distincts pour une même forme : (1) « ou » entre noms — A 또는 B en contexte formel devient A(이)나 B à l\'oral courant (커피나 차 « café ou thé ») ; (2) « pas moins de / autant que » avec une quantité, marquant la surprise que le chiffre soit élevé (사람이 백 명이나 왔어요 « pas moins de 100 personnes sont venues »). Forme : 이나 après consonne, 나 après voyelle. Pour « ou » entre verbes ou propositions, on emploie -거나 (가거나 말거나 « que tu y ailles ou non »). L\'alternative parlée pour « ou » est 아니면 (« ou alors »).',
      'Dois usos distintos com a mesma forma: (1) "ou" entre substantivos — A 또는 B em contextos formais vira A(이)나 B na fala do dia a dia (커피나 차 "café ou chá"); (2) "uns / até" com expressões de quantidade, sinalizando surpresa porque o número é alto (사람이 백 명이나 왔어요 "vieram uns 100 pessoas/até 100 pessoas vieram"). Forma: 이나 depois de consoante, 나 depois de vogal. Para "ou" entre verbos ou orações use -거나 (가거나 말거나 "queira ir ou não"). A alternativa coloquial para "ou" é 아니면 ("ou então").',
      'มีสองความหมายต่างกันในรูปเดียว: (1) "หรือ" ระหว่างคำนาม — A 또는 B ในบริบททางการ กลายเป็น A(이)나 B ในภาษาพูดทั่วไป (커피나 차 "กาแฟหรือชา"); (2) "ตั้ง / มากถึง" กับการบอกปริมาณ บ่งบอกความรู้สึกว่าตัวเลขมากเกินคาด (사람이 백 명이나 왔어요 "คนมาตั้ง 100 คน"). รูป: 이나 หลังพยัญชนะ, 나 หลังสระ. ถ้าจะแปลว่า "หรือ" ระหว่างกริยา/อนุประโยค ให้ใช้ -거나 แทน (가거나 말거나 "จะไปหรือไม่"). ทางเลือกในการพูด "หรือ" แบบกันเองคือ 아니면',
      'Dua penggunaan berbeda dalam bentuk yang sama: (1) "atau" antar kata benda — A 또는 B di konteks formal menjadi A(이)나 B di percakapan sehari-hari (커피나 차 "kopi atau teh"); (2) "sampai / sebanyak" dengan ekspresi jumlah, menyiratkan kejutan karena angkanya besar (사람이 백 명이나 왔어요 "sampai 100 orang yang datang"). Bentuk: 이나 setelah konsonan, 나 setelah vokal. Untuk "atau" antar verba atau klausa, pakai -거나 (가거나 말거나 "mau pergi atau tidak"). Alternatif percakapan untuk "atau" adalah 아니면 ("kalau tidak").',
      'Hai cách dùng riêng biệt trong cùng một dạng: (1) "hoặc" giữa danh từ — A 또는 B trong văn bản trang trọng trở thành A(이)나 B trong khẩu ngữ (커피나 차 "cà phê hay trà"); (2) "đến tận / nhiều như" với biểu thức số lượng, ngụ ý ngạc nhiên vì con số lớn (사람이 백 명이나 왔어요 "đến tận 100 người tới"). Hình thức: 이나 sau phụ âm, 나 sau nguyên âm. Để nối "hoặc" giữa các động từ hoặc mệnh đề, dùng -거나 (가거나 말거나 "đi hay không cũng được"). Lựa chọn thân mật cho "hoặc" trong nói chuyện là 아니면.',
      '同じ形に二つの用法がある: (1) 名詞間の「〜か」— 文語の A 또는 B が日常会話では A(이)나 B になる(커피나 차「コーヒーかお茶」); (2) 数量表現に付いて「〜も」— 数の多さに対する驚きを表す(사람이 백 명이나 왔어요「100人もの人が来た」)。形: 子音の後は 이나、母音の後は 나。動詞・節を「〜か」でつなぐ場合は -거나 を使う(가거나 말거나「行くか行かないか」)。話し言葉の「あるいは」は 아니면。',
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

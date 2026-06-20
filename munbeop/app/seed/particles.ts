import type { ParticleDef } from '~/lib/domain'
import { L } from './locale'

/**
 * v1 particle set for the Particle Lab. `grammarKo` keys are verified
 * against `seed/grammars-n1.ts` (은/는 · 이/가 · 을/를 · 에 · 에서 · 도) so
 * SRS writes and study-sheet links resolve.
 */
export const PARTICLES: ParticleDef[] = [
  {
    id: 'topic',
    ko: '은/는',
    grammarKo: '은/는',
    role: 'topic',
    afterConsonant: '은',
    afterVowel: '는',
    label: L('topic', 'tema', 'thème', 'tópico', 'หัวเรื่อง', 'topik', 'chủ đề', '主題'),
    hint: L(
      'Marks the topic — what the sentence is about ("as for X…"). Known or general info; also contrast.',
      'Marca el tema — de qué va la frase ("en cuanto a X…"). Info conocida o general; también contraste.',
      'Marque le thème — ce dont on parle (« quant à X… »). Info connue ou générale ; aussi le contraste.',
      'Marca o tópico — sobre o que é a frase ("quanto a X…"). Info conhecida ou geral; também contraste.',
      'บอกหัวเรื่องของประโยค ("สำหรับ X…") ใช้กับข้อมูลที่รู้กันแล้วหรือทั่วไป และการเปรียบต่าง',
      'Menandai topik — apa yang dibicarakan ("mengenai X…"). Info umum/diketahui; juga kontras.',
      'Đánh dấu chủ đề — câu nói về điều gì ("về phần X…"). Thông tin đã biết/chung; cũng dùng đối chiếu.',
      '主題を示す（「Xについて言えば」）。既知・一般的な情報や対比に使う。',
    ),
  },
  {
    id: 'subject',
    ko: '이/가',
    grammarKo: '이/가',
    role: 'subject',
    afterConsonant: '이',
    afterVowel: '가',
    label: L('subject', 'sujeto', 'sujet', 'sujeito', 'ประธาน', 'subjek', 'chủ ngữ', '主語'),
    hint: L(
      'Marks the subject — who/what acts. New info, answers to "who?/what?", and 있다/없다 existence.',
      'Marca el sujeto — quién/qué actúa. Info nueva, respuestas a "¿quién?/¿qué?" y existencia con 있다/없다.',
      'Marque le sujet — qui/quoi agit. Info nouvelle, réponses à « qui ?/quoi ? », existence avec 있다/없다.',
      'Marca o sujeito — quem/o que age. Info nova, respostas a "quem?/o quê?" e existência com 있다/없다.',
      'บอกประธาน — ใคร/อะไรเป็นผู้กระทำ ข้อมูลใหม่ คำตอบของ "ใคร?/อะไร?" และ 있다/없다',
      'Menandai subjek — siapa/apa yang bertindak. Info baru, jawaban "siapa?/apa?", dan 있다/없다.',
      'Đánh dấu chủ ngữ — ai/cái gì hành động. Thông tin mới, trả lời "ai?/cái gì?", và 있다/없다.',
      '主語を示す。新情報、「誰が？何が？」への答え、있다/없다 の存在文に使う。',
    ),
  },
  {
    id: 'object',
    ko: '을/를',
    grammarKo: '을/를',
    role: 'object',
    afterConsonant: '을',
    afterVowel: '를',
    label: L('object', 'objeto', 'objet', 'objeto', 'กรรม', 'objek', 'tân ngữ', '目的語'),
    hint: L(
      'Marks the direct object — what receives the action. Very often dropped in casual speech.',
      'Marca el objeto directo — lo que recibe la acción. Se omite muchísimo al hablar informal.',
      "Marque l'objet direct — ce qui subit l'action. Très souvent omis à l'oral familier.",
      'Marca o objeto direto — o que recebe a ação. Cai com muita frequência na fala casual.',
      'บอกกรรมตรง — สิ่งที่ถูกกระทำ มักถูกตัดออกบ่อยมากในภาษาพูด',
      'Menandai objek langsung — yang menerima aksi. Sangat sering dilepas dalam percakapan santai.',
      'Đánh dấu tân ngữ trực tiếp — đối tượng nhận hành động. Rất hay được lược bỏ khi nói thân mật.',
      '目的語を示す。くだけた会話では非常によく省略される。',
    ),
  },
  {
    id: 'place-static',
    ko: '에',
    grammarKo: '에',
    role: 'place',
    afterConsonant: '에',
    afterVowel: '에',
    label: L('place/time', 'lugar/tiempo', 'lieu/temps', 'lugar/tempo', 'ที่/เวลา', 'tempat/waktu', 'nơi/lúc', '場所・時'),
    hint: L(
      'Static location, destination or point in time: 학교에 (to school), 아침에 (in the morning).',
      'Lugar estático, destino o momento: 학교에 (a la escuela), 아침에 (por la mañana).',
      'Lieu statique, destination ou moment : 학교에 (à l\'école), 아침에 (le matin).',
      'Lugar estático, destino ou momento: 학교에 (para a escola), 아침에 (de manhã).',
      'สถานที่คงที่ ปลายทาง หรือเวลา: 학교에 (ไปโรงเรียน), 아침에 (ตอนเช้า)',
      'Tempat statis, tujuan, atau waktu: 학교에 (ke sekolah), 아침에 (pagi hari).',
      'Vị trí tĩnh, đích đến hoặc thời điểm: 학교에 (đến trường), 아침에 (vào buổi sáng).',
      '静的な場所・到達点・時点：학교에（学校へ）、아침에（朝に）。',
    ),
  },
  {
    id: 'place-action',
    ko: '에서',
    grammarKo: '에서',
    role: 'place',
    afterConsonant: '에서',
    afterVowel: '에서',
    label: L('place of action', 'lugar de acción', "lieu d'action", 'lugar da ação', 'ที่เกิดการกระทำ', 'tempat aksi', 'nơi hành động', '動作の場所'),
    hint: L(
      'Where an action HAPPENS (or starting point "from"). 도서관에서 공부해요 — unlike 에, rarely dropped.',
      'Donde OCURRE la acción (o punto de partida, "desde"). 도서관에서 공부해요 — a diferencia de 에, casi no se omite.',
      "Là où l'action SE PASSE (ou point de départ, « depuis »). 도서관에서 공부해요 — contrairement à 에, rarement omise.",
      'Onde a ação ACONTECE (ou ponto de partida, "de"). 도서관에서 공부해요 — diferente de 에, quase não cai.',
      'ที่ที่การกระทำเกิดขึ้น (หรือจุดเริ่มต้น "จาก") 도서관에서 공부해요 — ต่างจาก 에 แทบไม่ถูกตัดออก',
      'Tempat aksi TERJADI (atau titik awal, "dari"). 도서관에서 공부해요 — beda dengan 에, jarang dilepas.',
      'Nơi hành động DIỄN RA (hoặc điểm xuất phát, "từ"). 도서관에서 공부해요 — khác 에, hiếm khi bị lược.',
      '動作が行われる場所（または起点「から」）。도서관에서 공부해요。에 と違い省略されにくい。',
    ),
  },
  {
    id: 'also',
    ko: '도',
    grammarKo: '도',
    role: 'addition',
    afterConsonant: '도',
    afterVowel: '도',
    label: L('also', 'también', 'aussi', 'também', 'ด้วย', 'juga', 'cũng', '〜も'),
    hint: L(
      '"Also/too". It REPLACES 은/는 and 이/가 — never 저는도. 저도 = "me too".',
      '"También". REEMPLAZA a 은/는 y 이/가 — nunca 저는도. 저도 = "yo también".',
      '« Aussi ». REMPLACE 은/는 et 이/가 — jamais 저는도. 저도 = « moi aussi ».',
      '"Também". SUBSTITUI 은/는 e 이/가 — nunca 저는도. 저도 = "eu também".',
      '"ด้วย/ก็" ใช้แทนที่ 은/는 และ 이/가 — ห้ามพูด 저는도. 저도 = "ฉันด้วย"',
      '"Juga". MENGGANTIKAN 은/는 dan 이/가 — jangan 저는도. 저도 = "saya juga".',
      '"Cũng". THAY THẾ 은/는 và 이/가 — không bao giờ 저는도. 저도 = "tôi cũng vậy".',
      '「〜も」。은/는・이/가 と置き換わる（저는도 は誤り）。저도＝「私も」。',
    ),
  },
]

export function particleById(id: string): ParticleDef | undefined {
  return PARTICLES.find((p) => p.id === id)
}

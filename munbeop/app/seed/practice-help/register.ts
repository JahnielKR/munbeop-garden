import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 높임법 (honorifics) — explanation for the register lab.
 * Korean examples are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const REGISTER_HELP: PracticeHelpContent = {
  ko: '높임법',
  romanization: 'nopimbeop',
  subtitle: L(
    'the honorific system',
    'el sistema de honoríficos',
    'le système honorifique',
    'o sistema de honoríficos',
    'ระบบการยกย่อง (คำสุภาพ)',
    'sistem honorifik',
    'hệ thống kính ngữ',
    '敬語の体系',
  ),
  concept: L(
    "How Korean encodes respect. Depending on who you respect and who you're talking to, the language changes its particles, verb endings, and even whole words. Three layers work together: raising the subject, raising the object, and raising the listener.",
    'Cómo el coreano codifica el respeto. Según a quién respetas y con quién hablas, la lengua cambia sus partículas, las terminaciones del verbo e incluso palabras enteras. Tres capas trabajan juntas: elevar al sujeto, elevar al objeto y elevar al oyente.',
    "Comment le coréen encode le respect. Selon la personne que l'on respecte et celle à qui l'on parle, la langue change ses particules, ses terminaisons verbales et même des mots entiers. Trois niveaux agissent ensemble : élever le sujet, élever l'objet et élever l'interlocuteur.",
    'Como o coreano codifica o respeito. Dependendo de quem você respeita e com quem fala, a língua muda suas partículas, as terminações verbais e até palavras inteiras. Três camadas atuam juntas: elevar o sujeito, elevar o objeto e elevar o ouvinte.',
    'วิธีที่ภาษาเกาหลีแสดงความเคารพ ขึ้นกับว่าคุณเคารพใครและกำลังพูดกับใคร ภาษาจะเปลี่ยนทั้งคำชี้ (อนุภาค) ท้ายคำกริยา และแม้แต่คำศัพท์ทั้งคำ มีสามชั้นทำงานร่วมกัน คือ ยกย่องประธาน ยกย่องกรรม และยกย่องผู้ฟัง',
    'Cara bahasa Korea menyandikan rasa hormat. Bergantung pada siapa yang Anda hormati dan dengan siapa Anda bicara, bahasanya mengubah partikel, akhiran verba, bahkan kata utuh. Tiga lapisan bekerja bersama: meninggikan subjek, meninggikan objek, dan meninggikan lawan bicara.',
    'Cách tiếng Hàn thể hiện sự kính trọng. Tùy vào người bạn kính trọng và người bạn đang nói chuyện, ngôn ngữ thay đổi tiểu từ, đuôi động từ, thậm chí cả từ vựng. Ba tầng phối hợp với nhau: nâng chủ ngữ, nâng tân ngữ và nâng người nghe.',
    '韓国語が敬意を表す仕組み。誰を敬い、誰と話すかによって、助詞・語尾、さらには単語そのものまで変わる。主語を高める・客体を高める・聞き手を高める、の三つの層が組み合わさる。',
  ),
  types: [
    {
      ko: '주체 높임',
      label: L(
        'raising the subject', 'elevar al sujeto', 'élever le sujet', 'elevar o sujeito',
        'การยกย่องประธาน', 'meninggikan subjek', 'nâng chủ ngữ', '主体敬語',
      ),
      desc: L(
        'Respect the person doing the action. Add -(으)시- to the verb, use the particle 께서 instead of 이/가, and swap in special honorific verbs like 계시다 or 잡수시다.',
        'Respeta a quien realiza la acción. Añade -(으)시- al verbo, usa la partícula 께서 en vez de 이/가 y cambia a verbos honoríficos especiales como 계시다 o 잡수시다.',
        "Respecter la personne qui fait l'action. Ajoutez -(으)시- au verbe, utilisez 께서 au lieu de 이/가, et remplacez par des verbes honorifiques comme 계시다 ou 잡수시다.",
        'Respeite quem realiza a ação. Acrescente -(으)시- ao verbo, use 께서 em vez de 이/가 e troque por verbos honoríficos como 계시다 ou 잡수시다.',
        'ยกย่องผู้ที่ทำกริยา เติม -(으)시- ที่คำกริยา ใช้อนุภาค 께서 แทน 이/가 และเปลี่ยนเป็นคำกริยายกย่องพิเศษ เช่น 계시다 หรือ 잡수시다',
        'Hormati pelaku tindakan. Tambahkan -(으)시- pada verba, pakai partikel 께서 alih-alih 이/가, dan ganti dengan verba hormat khusus seperti 계시다 atau 잡수시다.',
        'Kính trọng người thực hiện hành động. Thêm -(으)시- vào động từ, dùng tiểu từ 께서 thay cho 이/가, và đổi sang động từ kính ngữ như 계시다 hay 잡수시다.',
        '動作をする人を敬う。動詞に -(으)시- を付け、이/가 の代わりに 께서 を使い、계시다・잡수시다 などの特別な尊敬動詞に置き換える。',
      ),
      example: '할아버지께서 신문을 읽으세요.',
      gloss: L(
        'Grandfather is reading the newspaper.', 'El abuelo está leyendo el periódico.',
        'Grand-père lit le journal.', 'O vovô está lendo o jornal.',
        'คุณปู่กำลังอ่านหนังสือพิมพ์', 'Kakek sedang membaca koran.',
        'Ông đang đọc báo.', 'おじいさまが新聞を読んでいらっしゃいます。',
      ),
    },
    {
      ko: '객체 높임',
      label: L(
        'raising the object', 'elevar al objeto', "élever l'objet", 'elevar o objeto',
        'การยกย่องกรรม', 'meninggikan objek', 'nâng tân ngữ', '客体敬語',
      ),
      desc: L(
        'Respect the person the action is aimed at. Use the particle 께 instead of 에게/한테, and special verbs like 드리다 (to give), 뵙다 (to see), 여쭙다 (to ask).',
        'Respeta a la persona hacia quien va la acción. Usa la partícula 께 en vez de 에게/한테 y verbos especiales como 드리다 (dar), 뵙다 (ver), 여쭙다 (preguntar).',
        "Respecter la personne visée par l'action. Utilisez 께 au lieu de 에게/한테, et des verbes spéciaux comme 드리다 (donner), 뵙다 (voir), 여쭙다 (demander).",
        'Respeite a quem a ação se dirige. Use a partícula 께 em vez de 에게/한테 e verbos especiais como 드리다 (dar), 뵙다 (ver), 여쭙다 (perguntar).',
        'ยกย่องผู้ที่เป็นเป้าหมายของการกระทำ ใช้อนุภาค 께 แทน 에게/한테 และคำกริยาพิเศษ เช่น 드리다 (ให้), 뵙다 (พบ), 여쭙다 (ถาม)',
        'Hormati orang yang menjadi sasaran tindakan. Pakai partikel 께 alih-alih 에게/한테, dan verba khusus seperti 드리다 (memberi), 뵙다 (menemui), 여쭙다 (bertanya).',
        'Kính trọng người mà hành động hướng tới. Dùng tiểu từ 께 thay cho 에게/한테, và động từ đặc biệt như 드리다 (biếu), 뵙다 (gặp), 여쭙다 (thưa hỏi).',
        '動作の向かう相手を敬う。에게/한테 の代わりに 께 を使い、드리다（差し上げる）・뵙다（お目にかかる）・여쭙다（伺う）などを用いる。',
      ),
      example: '선생님께 선물을 드렸어요.',
      gloss: L(
        'I gave the teacher a present.', 'Le di un regalo al profesor.',
        'J\'ai offert un cadeau au professeur.', 'Dei um presente ao professor.',
        'ฉันให้ของขวัญแก่คุณครู', 'Saya memberi hadiah kepada guru.',
        'Tôi đã tặng quà cho thầy giáo.', '先生にプレゼントを差し上げました。',
      ),
    },
    {
      ko: '상대 높임',
      label: L(
        'raising the listener', 'elevar al oyente', "élever l'interlocuteur", 'elevar o ouvinte',
        'การยกย่องผู้ฟัง', 'meninggikan lawan bicara', 'nâng người nghe', '相対敬語',
      ),
      desc: L(
        'Respect the person you are speaking to through the speech level — the sentence ending. From most formal to casual: 합니다체 (formal), 해요체 (polite), 해체/반말 (casual).',
        'Respeta a la persona con quien hablas mediante el nivel de habla — la terminación de la frase. De lo más formal a lo casual: 합니다체 (formal), 해요체 (cortés), 해체/반말 (casual).',
        "Respecter la personne à qui l'on parle via le niveau de langue — la terminaison de la phrase. Du plus formel au familier : 합니다체 (formel), 해요체 (poli), 해체/반말 (familier).",
        'Respeite a pessoa com quem fala pelo nível de fala — a terminação da frase. Do mais formal ao casual: 합니다체 (formal), 해요체 (polido), 해체/반말 (casual).',
        "ยกย่องคู่สนทนาผ่าน 'ระดับการพูด' คือท้ายประโยค จากทางการที่สุดไปกันเอง: 합니다체 (ทางการ), 해요체 (สุภาพ), 해체/반말 (กันเอง)",
        'Hormati lawan bicara lewat tingkat tutur — akhiran kalimat. Dari paling formal ke santai: 합니다체 (formal), 해요체 (sopan), 해체/반말 (santai).',
        'Kính trọng người đối thoại qua cấp độ lời nói — đuôi câu. Từ trang trọng nhất đến thân mật: 합니다체 (trang trọng), 해요체 (lịch sự), 해체/반말 (thân mật).',
        '話す相手を、文末の「話し方のレベル」で敬う。最も丁寧なものからくだけたものへ：합니다체（フォーマル）、해요체（丁寧）、해체/반말（タメ口）。',
      ),
      example: '안녕히 가십시오. / 잘 가.',
      gloss: L(
        'Goodbye. (formal) / Bye. (casual)', 'Adiós. (formal) / Chao. (casual)',
        'Au revoir. (formel) / Salut. (familier)', 'Até logo. (formal) / Tchau. (casual)',
        'ลาก่อนนะคะ/ครับ (ทางการ) / ไปนะ (กันเอง)', 'Selamat jalan. (formal) / Dah. (santai)',
        'Tạm biệt ạ. (trang trọng) / Đi nhé. (thân mật)', 'さようなら。（フォーマル）／じゃあね。（タメ口）',
      ),
    },
  ],
  howToPlay: [
    L(
      'Pick a mode: speech levels (formal ↔ casual) or honorifics (rewrite into the respectful form).',
      'Elige un modo: niveles de habla (formal ↔ casual) u honoríficos (reescribir en la forma respetuosa).',
      'Choisissez un mode : niveaux de langue (formel ↔ familier) ou honorifiques (réécrire à la forme respectueuse).',
      'Escolha um modo: níveis de fala (formal ↔ casual) ou honoríficos (reescrever na forma respeitosa).',
      'เลือกโหมด: ระดับการพูด (ทางการ ↔ กันเอง) หรือคำยกย่อง (เขียนใหม่เป็นรูปสุภาพ)',
      'Pilih mode: tingkat tutur (formal ↔ santai) atau honorifik (tulis ulang ke bentuk hormat).',
      'Chọn chế độ: cấp độ lời nói (trang trọng ↔ thân mật) hoặc kính ngữ (viết lại sang dạng kính trọng).',
      'モードを選ぶ：話し方のレベル（フォーマル↔タメ口）か、敬語（尊敬形に書き換える）。',
    ),
    L(
      'Read the sentence and choose the correct transformation from the options.',
      'Lee la frase y elige la transformación correcta entre las opciones.',
      'Lisez la phrase et choisissez la bonne transformation parmi les options.',
      'Leia a frase e escolha a transformação correta entre as opções.',
      'อ่านประโยคแล้วเลือกการแปลงที่ถูกต้องจากตัวเลือก',
      'Baca kalimatnya dan pilih transformasi yang benar dari pilihan yang ada.',
      'Đọc câu và chọn cách biến đổi đúng trong các lựa chọn.',
      '文を読み、選択肢から正しい変換を選ぶ。',
    ),
    L(
      'Get it right to grow your mastery of the set; misses come back in review.',
      'Acierta para subir tu maestría del set; los fallos vuelven en el repaso.',
      'Visez juste pour faire grandir votre maîtrise du set ; les erreurs reviennent en révision.',
      'Acerte para aumentar seu domínio do conjunto; os erros voltam na revisão.',
      'ตอบถูกเพื่อเพิ่มความเชี่ยวชาญของชุดนั้น ส่วนที่พลาดจะกลับมาให้ทบทวน',
      'Jawab benar untuk menumbuhkan penguasaan set ini; yang meleset kembali saat ulasan.',
      'Trả lời đúng để tăng độ thành thạo của bộ; câu sai sẽ quay lại khi ôn tập.',
      '正解するとそのセットの習熟度が上がる。間違いは復習で戻ってくる。',
    ),
  ],
  tip: L(
    "Classic trap: for 주체 높임, use 계시다 when the respected person is the one 'being' somewhere (할머니께서 집에 계세요), but 있으시다 when it's something they 'have' (할머니께서 시간이 있으세요).",
    "Trampa clásica: en 주체 높임, usa 계시다 cuando la persona respetada es quien 'está' en un lugar (할머니께서 집에 계세요), pero 있으시다 cuando es algo que 'tiene' (할머니께서 시간이 있으세요).",
    "Piège classique : pour 주체 높임, utilisez 계시다 quand la personne respectée « se trouve » quelque part (할머니께서 집에 계세요), mais 있으시다 quand il s'agit de ce qu'elle « a » (할머니께서 시간이 있으세요).",
    "Pegadinha clássica: em 주체 높임, use 계시다 quando a pessoa respeitada é quem 'está' em algum lugar (할머니께서 집에 계세요), mas 있으시다 quando é algo que ela 'tem' (할머니께서 시간이 있으세요).",
    "กับดักคลาสสิก: ใน 주체 높임 ใช้ 계시다 เมื่อผู้ที่เคารพ 'อยู่' ที่ไหนสักแห่ง (할머니께서 집에 계세요) แต่ใช้ 있으시다 เมื่อเป็นสิ่งที่ท่าน 'มี' (할머니께서 시간이 있으세요)",
    "Jebakan klasik: untuk 주체 높임, pakai 계시다 saat orang yang dihormati 'berada' di suatu tempat (할머니께서 집에 계세요), tetapi 있으시다 saat itu sesuatu yang 'dimiliki' (할머니께서 시간이 있으세요).",
    "Bẫy kinh điển: với 주체 높임, dùng 계시다 khi người được kính trọng 'đang ở' đâu đó (할머니께서 집에 계세요), nhưng 있으시다 khi đó là thứ họ 'có' (할머니께서 시간이 있으세요).",
    '定番の落とし穴：주체 높임 では、敬う人が「いる」ときは 계시다（할머니께서 집에 계세요）、その人が「持っている／ある」ときは 있으시다（할머니께서 시간이 있으세요）。',
  ),
}

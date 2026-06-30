import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 배치 테스트 (placement test) — explanation for the placement mode.
 * Korean examples are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const PLACEMENT_HELP: PracticeHelpContent = {
  ko: '배치 테스트',
  romanization: 'baechi teseuteu',
  subtitle: L(
    'find your TOPIK level',
    'encuentra tu nivel de TOPIK',
    'trouvez votre niveau TOPIK',
    'descubra seu nível de TOPIK',
    'หาระดับ TOPIK ของคุณ',
    'temukan level TOPIK Anda',
    'tìm cấp độ TOPIK của bạn',
    'あなたのTOPIKレベルを測る',
  ),
  concept: L(
    'A one-time placement test. It climbs a ladder of TOPIK levels, starting at level 1: a few questions per level, and you pass a level by getting most of them right. Pass and you climb to the next level; miss too many and the ladder stops. Where it stops becomes your starting deck, so you begin practicing at the right difficulty instead of guessing.',
    'Una prueba de nivel que haces una vez. Sube una escalera de niveles de TOPIK, empezando por el nivel 1: unas pocas preguntas por nivel, y superas un nivel acertando la mayoría. Si lo superas, subes al siguiente; si fallas demasiadas, la escalera se detiene. Donde se detiene se convierte en tu mazo inicial, para que empieces a practicar con la dificultad adecuada en vez de adivinar.',
    "Un test de placement à faire une seule fois. Il gravit une échelle de niveaux TOPIK, en partant du niveau 1 : quelques questions par niveau, et vous validez un niveau en réussissant la plupart. Réussi, vous montez au niveau suivant ; trop d'erreurs et l'échelle s'arrête. Là où elle s'arrête devient votre paquet de départ, pour commencer à la bonne difficulté plutôt qu'au hasard.",
    'Um teste de nivelamento feito uma única vez. Ele sobe uma escada de níveis de TOPIK, começando no nível 1: algumas perguntas por nível, e você passa de nível acertando a maioria. Se passar, sobe para o próximo; se errar demais, a escada para. Onde ela para vira o seu baralho inicial, para você começar a praticar na dificuldade certa em vez de adivinhar.',
    'แบบทดสอบจัดระดับที่ทำครั้งเดียว มันจะไต่บันไดของระดับ TOPIK โดยเริ่มที่ระดับ 1 มีคำถามไม่กี่ข้อต่อระดับ และคุณผ่านระดับนั้นได้ด้วยการตอบถูกเป็นส่วนใหญ่ ถ้าผ่านก็ไต่ขึ้นระดับถัดไป ถ้าพลาดมากเกินไปบันไดก็จะหยุด จุดที่หยุดจะกลายเป็นชุดเริ่มต้นของคุณ เพื่อให้คุณเริ่มฝึกที่ความยากที่เหมาะสมแทนการเดา',
    'Tes penempatan yang dikerjakan sekali saja. Tes ini menaiki tangga level TOPIK, dimulai dari level 1: beberapa soal per level, dan Anda lulus sebuah level dengan menjawab benar sebagian besar. Jika lulus, Anda naik ke level berikutnya; jika terlalu banyak salah, tangganya berhenti. Tempat berhentinya menjadi dek awal Anda, agar Anda mulai berlatih pada tingkat kesulitan yang tepat alih-alih menebak.',
    'Một bài kiểm tra xếp lớp làm một lần. Nó leo một chiếc thang các cấp độ TOPIK, bắt đầu từ cấp 1: vài câu hỏi mỗi cấp, và bạn qua một cấp khi trả lời đúng phần lớn. Qua được thì leo lên cấp tiếp theo; sai quá nhiều thì thang dừng lại. Nơi nó dừng trở thành bộ thẻ khởi đầu của bạn, để bạn bắt đầu luyện ở độ khó phù hợp thay vì đoán mò.',
    '一度だけ受けるレベル判定テスト。TOPIKレベルの「はしご」をレベル1から上っていく。各レベルで数問出題され、その大半に正解するとそのレベルを突破。突破すれば次のレベルへ、間違いが多すぎるとそこで止まる。止まった所があなたの開始デッキになり、当てずっぽうでなく適切な難易度から練習を始められる。',
  ),
  howToPlay: [
    L(
      'Start at TOPIK 1. Each question shows a sentence with a blank — read it and pick the option that fits.',
      'Empiezas en TOPIK 1. Cada pregunta muestra una frase con un hueco: léela y elige la opción que encaja.',
      "Vous commencez au TOPIK 1. Chaque question présente une phrase à trou : lisez-la et choisissez l'option qui convient.",
      'Você começa no TOPIK 1. Cada pergunta mostra uma frase com uma lacuna: leia e escolha a opção que encaixa.',
      'เริ่มที่ TOPIK 1 แต่ละข้อจะแสดงประโยคที่มีช่องว่าง อ่านแล้วเลือกตัวเลือกที่เหมาะสม',
      'Anda mulai dari TOPIK 1. Setiap soal menampilkan kalimat dengan bagian rumpang — baca lalu pilih opsi yang pas.',
      'Bạn bắt đầu ở TOPIK 1. Mỗi câu hỏi hiện một câu có chỗ trống — đọc và chọn phương án phù hợp.',
      'TOPIK1から始まる。各問は空欄のある文が出るので、読んで合う選択肢を選ぶ。',
    ),
    L(
      'Get most of a level right to clear it and climb to the next; miss too many and the test stops there.',
      'Acierta la mayoría de un nivel para superarlo y subir al siguiente; falla demasiadas y la prueba se detiene ahí.',
      "Réussissez la plupart d'un niveau pour le valider et monter au suivant ; trop d'erreurs et le test s'arrête là.",
      'Acerte a maioria de um nível para superá-lo e subir ao próximo; erre demais e o teste para por ali.',
      'ตอบถูกเป็นส่วนใหญ่ของระดับนั้นเพื่อผ่านและไต่ขึ้นระดับถัดไป ถ้าพลาดมากเกินไปแบบทดสอบจะหยุดตรงนั้น',
      'Jawab benar sebagian besar level untuk lulus dan naik ke level berikutnya; terlalu banyak salah, tes berhenti di situ.',
      'Trả lời đúng phần lớn một cấp để qua và leo lên cấp tiếp theo; sai quá nhiều thì bài kiểm tra dừng tại đó.',
      'そのレベルの大半に正解すれば突破して次へ。間違いが多すぎるとそこでテストは終わる。',
    ),
    L(
      'When it stops, see your level and let it set your starting deck — then you practice from there.',
      'Cuando se detiene, ves tu nivel y dejas que fije tu mazo inicial; a partir de ahí practicas.',
      'Quand il s\'arrête, vous voyez votre niveau et il fixe votre paquet de départ ; vous pratiquez à partir de là.',
      'Quando para, você vê seu nível e deixa que ele defina seu baralho inicial; daí em diante você pratica.',
      'เมื่อหยุด คุณจะเห็นระดับของคุณ และให้มันตั้งชุดเริ่มต้นให้ จากนั้นคุณก็ฝึกจากตรงนั้น',
      'Saat berhenti, lihat level Anda dan biarkan ia menetapkan dek awal Anda — lalu Anda berlatih dari sana.',
      'Khi dừng, bạn xem cấp độ của mình và để nó đặt bộ thẻ khởi đầu — rồi bạn luyện từ đó.',
      '止まったら自分のレベルが分かり、それが開始デッキに設定される。あとはそこから練習する。',
    ),
  ],
  tip: L(
    "It's an assessment, not a drill — you only take it once, so answer honestly. You can always retake it later if your level changes, and nothing here counts against your garden.",
    'Es una evaluación, no un ejercicio: la haces una sola vez, así que responde con honestidad. Siempre puedes repetirla más adelante si tu nivel cambia, y nada de aquí afecta a tu jardín.',
    "C'est une évaluation, pas un exercice : vous ne la passez qu'une fois, alors répondez honnêtement. Vous pourrez toujours la repasser plus tard si votre niveau change, et rien ici ne pénalise votre jardin.",
    'É uma avaliação, não um exercício: você a faz uma única vez, então responda com honestidade. Você sempre pode refazê-la depois se seu nível mudar, e nada aqui conta contra o seu jardim.',
    'นี่คือการประเมิน ไม่ใช่แบบฝึกหัด คุณทำเพียงครั้งเดียว จึงควรตอบตามจริง คุณทำใหม่ได้เสมอภายหลังหากระดับของคุณเปลี่ยนไป และไม่มีอะไรตรงนี้ส่งผลเสียต่อสวนของคุณ',
    'Ini penilaian, bukan latihan — Anda hanya mengerjakannya sekali, jadi jawablah dengan jujur. Anda selalu bisa mengulanginya nanti jika level Anda berubah, dan tidak ada di sini yang merugikan taman Anda.',
    'Đây là bài đánh giá, không phải bài luyện — bạn chỉ làm một lần, nên hãy trả lời trung thực. Bạn luôn có thể làm lại sau nếu trình độ thay đổi, và không gì ở đây ảnh hưởng xấu đến khu vườn của bạn.',
    'これはドリルではなく診断。受けるのは一度だけなので正直に答えよう。レベルが変われば後でいつでも受け直せるし、ここの結果が庭に悪影響を与えることはない。',
  ),
}

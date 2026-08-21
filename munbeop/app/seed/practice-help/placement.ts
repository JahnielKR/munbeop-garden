import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 배치 테스트 (placement test) — explanation for the placement mode.
 * Korean terms are language-neutral; prose has been checked for feature
 * accuracy and localized across all eight supported locales.
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
    'A short, adaptive placement test you can retake. It climbs a ladder of TOPIK levels, starting at level 1: a few questions per level, and you pass a level by getting most of them right. Pass and you climb to the next level; miss too many and the ladder stops. Where it stops becomes your starting deck, so you begin practicing at the right difficulty instead of guessing.',
    'Una prueba de nivel breve y adaptativa que puedes repetir. Sube una escalera de niveles TOPIK desde el nivel 1: hay unas pocas preguntas por nivel y lo superas acertando la mayoría. Si lo superas, subes al siguiente; si fallas demasiadas, la escalera se detiene. Donde se detiene se convierte en tu mazo inicial, para que empieces a practicar con la dificultad adecuada en vez de adivinar.',
    "Un test de placement court et adaptatif que vous pouvez repasser. Il gravit une échelle de niveaux TOPIK à partir du niveau 1 : quelques questions par niveau, validé si vous réussissez la plupart. En cas de réussite, vous montez ; après trop d'erreurs, l'échelle s'arrête. Ce point d'arrêt devient votre paquet de départ, afin de commencer à la bonne difficulté plutôt qu'au hasard.",
    'Um teste de nivelamento curto e adaptativo que você pode refazer. Ele sobe uma escada de níveis TOPIK a partir do nível 1: há algumas perguntas por nível, e você passa acertando a maioria. Se passar, sobe; se errar demais, a escada para. Esse ponto vira o seu baralho inicial, para você praticar na dificuldade certa em vez de adivinhar.',
    'แบบทดสอบจัดระดับแบบสั้นและปรับตามผู้เรียน ซึ่งคุณทำซ้ำได้ เริ่มไต่บันได TOPIK จากระดับ 1 แต่ละระดับมีคำถามไม่กี่ข้อ ตอบถูกเป็นส่วนใหญ่ก็จะผ่านและขึ้นระดับถัดไป แต่ถ้าพลาดมากเกินไปบันไดจะหยุด จุดที่หยุดจะกลายเป็นชุดเริ่มต้นของคุณ เพื่อให้เริ่มฝึกด้วยความยากที่เหมาะสม',
    'Tes penempatan singkat dan adaptif yang bisa Anda ulangi. Tes ini menaiki tangga level TOPIK mulai dari level 1: ada beberapa soal per level, dan Anda lulus dengan menjawab benar sebagian besar. Jika lulus, Anda naik; jika terlalu banyak salah, tangga berhenti. Titik berhenti itu menjadi dek awal Anda, agar latihan dimulai pada tingkat kesulitan yang tepat, bukan dengan menebak.',
    'Bài kiểm tra xếp lớp ngắn, thích ứng và có thể làm lại. Bài kiểm tra leo thang TOPIK từ cấp 1: mỗi cấp có vài câu, trả lời đúng phần lớn thì qua cấp và leo tiếp; sai quá nhiều thì thang dừng lại. Điểm dừng trở thành bộ thẻ khởi đầu, để bạn luyện ở độ khó phù hợp thay vì đoán mò.',
    '何度でも受け直せる、短時間の適応型レベル判定テスト。TOPIK 1からレベルのはしごを上り、各レベルで数問の大半に正解すれば次へ進む。間違いが多すぎるとそこで止まり、その地点が開始デッキになるので、当てずっぽうでなく適切な難易度から練習できる。',
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
    "It's an assessment, not a drill, so answer honestly instead of guessing. You can retake it whenever your level changes, and nothing here counts against your garden.",
    'Es una evaluación, no un ejercicio, así que responde con honestidad en vez de adivinar. Puedes repetirla cuando cambie tu nivel, y nada de aquí afecta negativamente a tu jardín.',
    "C'est une évaluation, pas un exercice : répondez honnêtement plutôt que de deviner. Vous pouvez la repasser quand votre niveau change, et rien ici ne pénalise votre jardin.",
    'É uma avaliação, não um exercício, então responda com honestidade em vez de chutar. Você pode refazê-la quando seu nível mudar, e nada aqui prejudica o seu jardim.',
    'นี่คือการประเมิน ไม่ใช่แบบฝึกหัด จึงควรตอบตามจริงแทนการเดา คุณทำซ้ำได้เมื่อระดับเปลี่ยนไป และผลที่นี่ไม่ทำให้สวนของคุณเสียหาย',
    'Ini penilaian, bukan latihan, jadi jawablah dengan jujur alih-alih menebak. Anda dapat mengulanginya kapan pun level berubah, dan tidak ada hasil di sini yang merugikan taman Anda.',
    'Đây là bài đánh giá, không phải bài luyện, nên hãy trả lời trung thực thay vì đoán. Bạn có thể làm lại khi trình độ thay đổi, và kết quả ở đây không làm hại khu vườn.',
    'これはドリルではなく診断なので、当てずっぽうでなく正直に答えよう。レベルが変わったと感じたらいつでも受け直せ、ここの結果が庭に悪影響を与えることはない。',
  ),
}

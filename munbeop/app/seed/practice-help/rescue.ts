import type { PracticeHelpContent } from '~/lib/domain'
import { L } from '../locale'

/**
 * 다시 돌보기 (rescue) — explanation for the struggling-plant rescue session.
 * Korean examples/terms are language-neutral; prose is localized via L().
 * Native review (owner's wife) pending on the 8 translations.
 */
export const RESCUE_HELP: PracticeHelpContent = {
  ko: '다시 돌보기',
  romanization: 'dasi dolbogi',
  subtitle: L(
    'tending the plants that struggle',
    'cuidar las plantas que cuestan',
    'soigner les plantes qui peinent',
    'cuidar das plantas que custam',
    'ดูแลต้นที่กำลังอ่อนแอ',
    'merawat tanaman yang kesulitan',
    'chăm lại những cây đang chật vật',
    'つまずいている苗をもう一度世話する',
  ),
  concept: L(
    'A leech is a grammar point whose recent reviews were mostly hard — a plant in your garden that keeps wilting. Instead of waiting for it to come around again at random, rescue gives one weak point a calm, focused pass: re-read what it means, see it in real examples, and rebuild it. Targeted care beats blind repetition, and the plant heals on its own once you start logging easier reviews of it.',
    'Una sanguijuela es un punto gramatical cuyos repasos recientes fueron en su mayoría difíciles: una planta de tu jardín que se marchita una y otra vez. En vez de esperar a que vuelva al azar, el rescate le da a ese punto débil un repaso tranquilo y enfocado: relees lo que significa, lo ves en ejemplos reales y lo reconstruyes. El cuidado dirigido vence a la repetición ciega, y la planta se cura sola en cuanto empiezas a registrar repasos más fáciles.',
    "Une « sangsue » est un point de grammaire dont les révisions récentes ont été surtout difficiles — une plante de votre jardin qui se fane sans cesse. Plutôt que d'attendre qu'elle revienne au hasard, le sauvetage offre à ce point faible une passe calme et ciblée : relire son sens, le revoir dans de vrais exemples et le reconstruire. Un soin ciblé vaut mieux qu'une répétition aveugle, et la plante guérit d'elle-même dès que vous enregistrez des révisions plus faciles.",
    'Uma sanguessuga é um ponto gramatical cujas revisões recentes foram em sua maioria difíceis — uma planta do seu jardim que vive murchando. Em vez de esperar que ela volte ao acaso, o resgate dá a esse ponto fraco uma passagem calma e focada: você relê o que significa, vê em exemplos reais e o reconstrói. O cuidado direcionado vence a repetição cega, e a planta se cura sozinha assim que você começa a registrar revisões mais fáceis.',
    'จุดอ่อน (leech) คือไวยากรณ์ที่การทบทวนช่วงหลังส่วนใหญ่ยากไปหมด เหมือนต้นไม้ในสวนที่เหี่ยวเฉาซ้ำ ๆ แทนที่จะรอให้มันวนกลับมาแบบสุ่ม โหมดกู้ภัยจะพาจุดอ่อนหนึ่งจุดมาดูแลอย่างสงบและตั้งใจ คือ อ่านความหมายซ้ำ ดูในตัวอย่างจริง แล้วสร้างความเข้าใจขึ้นใหม่ การดูแลแบบเจาะจงดีกว่าการท่องซ้ำมั่ว ๆ และต้นไม้จะหายเองเมื่อคุณเริ่มบันทึกการทบทวนที่ง่ายขึ้น',
    'Lintah adalah poin tata bahasa yang ulasan terakhirnya kebanyakan terasa sulit — tanaman di kebun Anda yang terus layu. Alih-alih menunggunya muncul lagi secara acak, mode penyelamatan memberi satu titik lemah itu satu putaran tenang dan terfokus: membaca ulang artinya, melihatnya dalam contoh nyata, lalu membangunnya kembali. Perawatan yang terarah mengalahkan pengulangan buta, dan tanaman itu sembuh sendiri begitu Anda mulai mencatat ulasan yang lebih mudah.',
    'Một "con đỉa" là điểm ngữ pháp mà các lần ôn gần đây hầu hết đều khó — một cái cây trong vườn cứ héo mãi. Thay vì chờ nó ngẫu nhiên quay lại, chế độ cứu hộ dành cho điểm yếu đó một lượt ôn nhẹ nhàng và tập trung: đọc lại nghĩa, gặp lại nó trong ví dụ thật, rồi dựng lại nền tảng. Chăm sóc có mục tiêu hơn hẳn việc lặp lại mù quáng, và cái cây tự lành ngay khi bạn bắt đầu ghi nhận những lần ôn dễ hơn.',
    '「リーチ（手強い項目）」とは、最近の復習がほとんど難しかった文法のこと——庭でしおれ続ける苗のようなものだ。次にランダムで巡ってくるのを待つ代わりに、このレスキューでは一つの弱点だけを落ち着いて集中的に見直す。意味を読み直し、実際の例文で確かめ、土台を組み直す。やみくもな反復より的を絞ったケアが効き、易しい復習を記録し始めれば苗は自然に回復していく。',
  ),
  howToPlay: [
    L(
      'You arrive on a single struggling grammar — flagged because its recent reviews were mostly hard. The header names the weak point it most needs care on.',
      'Llegas a una sola gramática que cuesta — marcada porque sus repasos recientes fueron en su mayoría difíciles. El encabezado nombra el punto débil que más necesita atención.',
      "Vous arrivez sur un seul point de grammaire en difficulté — signalé parce que ses révisions récentes ont été surtout difficiles. L'en-tête nomme le point faible qui réclame le plus de soin.",
      'Você chega a uma única gramática que custa — marcada porque suas revisões recentes foram em sua maioria difíceis. O cabeçalho nomeia o ponto fraco que mais precisa de cuidado.',
      'คุณจะมาถึงไวยากรณ์ที่กำลังอ่อนแอเพียงจุดเดียว ซึ่งถูกทำเครื่องหมายเพราะการทบทวนช่วงหลังส่วนใหญ่ยาก ส่วนหัวจะบอกจุดอ่อนที่ต้องดูแลมากที่สุด',
      'Anda tiba pada satu tata bahasa yang sulit — ditandai karena ulasan terakhirnya kebanyakan terasa berat. Judulnya menyebut titik lemah yang paling butuh perhatian.',
      'Bạn đến với một điểm ngữ pháp đang chật vật — bị đánh dấu vì các lần ôn gần đây hầu hết đều khó. Tiêu đề nêu rõ điểm yếu cần được chăm sóc nhất.',
      '苦戦している文法が一つだけ表示される——最近の復習がほとんど難しかったために選ばれたものだ。見出しには、いちばんケアが必要な弱点が示される。',
    ),
    L(
      'Walk the calm stages with Next: re-read its meaning and usage notes, study real examples, tell it apart from a confusable neighbour (when one exists).',
      'Recorre las etapas tranquilas con Siguiente: relee su significado y notas de uso, estudia ejemplos reales y distínguelo de un vecino confundible (cuando lo haya).',
      'Parcourez les étapes apaisées avec Suivant : relisez son sens et ses notes d\'usage, étudiez de vrais exemples, distinguez-le d\'un voisin confondable (s\'il en existe un).',
      'Percorra as etapas calmas com Próximo: releia seu significado e notas de uso, estude exemplos reais e diferencie-o de um vizinho confundível (quando houver).',
      'เดินผ่านขั้นตอนอย่างสงบด้วยปุ่มถัดไป: อ่านความหมายและบันทึกการใช้ซ้ำ ศึกษาตัวอย่างจริง และแยกมันออกจากตัวที่สับสนได้ (ถ้ามี)',
      'Lalui tahap-tahap yang tenang dengan Berikutnya: baca ulang arti dan catatan penggunaannya, pelajari contoh nyata, dan bedakan dari tetangga yang membingungkan (jika ada).',
      'Đi qua các bước nhẹ nhàng bằng nút Tiếp: đọc lại nghĩa và ghi chú cách dùng, học ví dụ thật, và phân biệt nó với điểm dễ nhầm bên cạnh (nếu có).',
      '「次へ」で落ち着いた各段階を進む：意味と使い方のメモを読み直し、実際の例文で学び、紛らわしい隣の項目があれば見分ける。',
    ),
    L(
      'Finish on the produce stage — jump to the Ruleta to write your own sentence with it, the active step that actually heals the plant.',
      'Termina en la etapa de producción — salta a la Ruleta para escribir tu propia frase con ella, el paso activo que de verdad cura la planta.',
      "Terminez par l'étape de production — passez à la Roulette pour écrire votre propre phrase avec ce point, l'étape active qui guérit vraiment la plante.",
      'Termine na etapa de produção — salte para a Roleta para escrever sua própria frase com ela, o passo ativo que de fato cura a planta.',
      'จบที่ขั้นการสร้างประโยค กระโดดไปที่วงล้อ (Ruleta) เพื่อแต่งประโยคของคุณเองด้วยมัน ขั้นตอนเชิงรุกที่รักษาต้นไม้ได้จริง',
      'Akhiri pada tahap produksi — lompat ke Ruleta untuk menulis kalimat Anda sendiri dengannya, langkah aktif yang benar-benar menyembuhkan tanaman.',
      'Kết thúc ở bước sản sinh — chuyển sang Ruleta để tự viết câu của bạn với nó, bước chủ động thật sự chữa lành cái cây.',
      '最後は産出の段階へ——ルーレットに移り、その文法で自分の文を書く。苗を本当に回復させる能動的なステップだ。',
    ),
  ],
  tip: L(
    'Rescue keeps no separate score — the plant heals itself. Once you log a few easier reviews of this grammar (in the Ruleta or any drill), its hard ratio drops and it quietly leaves the struggling list.',
    'El rescate no lleva un puntaje aparte: la planta se cura sola. En cuanto registres unos repasos más fáciles de esta gramática (en la Ruleta o cualquier ejercicio), su proporción de dificultad baja y sale en silencio de la lista de las que cuestan.',
    "Le sauvetage ne tient aucun score à part — la plante se guérit elle-même. Dès que vous enregistrez quelques révisions plus faciles de ce point (dans la Roulette ou un autre exercice), son ratio de difficulté baisse et il quitte discrètement la liste des points en difficulté.",
    'O resgate não mantém pontuação à parte — a planta se cura sozinha. Assim que você registrar algumas revisões mais fáceis dessa gramática (na Roleta ou em qualquer exercício), sua proporção de dificuldade cai e ela sai em silêncio da lista das que custam.',
    'โหมดกู้ภัยไม่มีคะแนนแยกต่างหาก ต้นไม้จะหายเอง เมื่อคุณบันทึกการทบทวนที่ง่ายขึ้นของไวยากรณ์นี้สักสองสามครั้ง (ในวงล้อหรือแบบฝึกใดก็ได้) สัดส่วนความยากจะลดลง แล้วมันจะหลุดออกจากรายการตัวที่อ่อนแอไปเงียบ ๆ',
    'Penyelamatan tidak menyimpan skor terpisah — tanamannya sembuh sendiri. Begitu Anda mencatat beberapa ulasan yang lebih mudah untuk tata bahasa ini (di Ruleta atau latihan apa pun), rasio sulitnya turun dan ia diam-diam keluar dari daftar yang sulit.',
    'Chế độ cứu hộ không giữ điểm riêng — cái cây tự lành. Một khi bạn ghi nhận vài lần ôn dễ hơn cho điểm ngữ pháp này (trong Ruleta hay bất kỳ bài luyện nào), tỉ lệ khó của nó giảm xuống và nó lặng lẽ rời khỏi danh sách những điểm chật vật.',
    'レスキューに別個のスコアはない——苗は自分で回復する。この文法の易しい復習を（ルーレットでも他のドリルでも）数回記録すれば、難しさの割合が下がり、苦戦リストから静かに外れていく。',
  ),
}

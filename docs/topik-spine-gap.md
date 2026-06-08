# Gap analysis · `grammars.ts` ↔ `topik-spine.json`

- Seed runtime entries (`grammars.ts`): **300**
- Spine items (TOPIK + transversales): **301**
- Cobertura aproximada del seed sobre el spine: **99.7%**

## 1) Mapeo de las entradas del seed al spine

| Seed `ko` | Match | Spine id · level · tema |
|---|---|---|
| `은/는` | EXACT | **G002** · TOPIK 1 · Partículas básicas |
| `이/가` | EXACT | **G003** · TOPIK 1 · Partículas básicas |
| `을/를` | EXACT | **G004** · TOPIK 1 · Partículas básicas |
| `에` | EXACT | **G005** · TOPIK 1 · Partículas básicas |
| `에서` | EXACT | **G006** · TOPIK 1 · Partículas básicas |
| `와/과 · 하고 · (이)랑` | EXACT | **G007** · TOPIK 1 · Partículas básicas |
| `도` | EXACT | **G008** · TOPIK 1 · Partículas básicas |
| `만` | EXACT | **G009** · TOPIK 1 · Partículas básicas |
| `의` | EXACT | **G010** · TOPIK 1 · Partículas básicas |
| `에게 / 한테 / 께` | EXACT | **G011** · TOPIK 1 · Partículas básicas |
| `(으)로` | EXACT | **G025** · TOPIK 1 · Partículas básicas |
| `부터 / 까지` | EXACT | **G133** · TOPIK 1 · Partículas básicas |
| `마다` | EXACT | **G134** · TOPIK 1 · Partículas básicas |
| `(이)나` | EXACT | **G135** · TOPIK 1 · Partículas básicas |
| `이다 / 아니다` | EXACT | **G001** · TOPIK 1 · Ser y existir |
| `있다 / 없다` | EXACT | **G027** · TOPIK 1 · Ser y existir |
| `좋아하다 / 싫어하다` | EXACT | **G028** · TOPIK 1 · Ser y existir |
| `-아/어요` | EXACT | **G012** · TOPIK 1 · Conjugación esencial |
| `-았/었어요` | EXACT | **G013** · TOPIK 1 · Conjugación esencial |
| `-(으)ㄹ 거예요` | EXACT | **G014** · TOPIK 1 · Conjugación esencial |
| `-(으)세요` | EXACT | **G018** · TOPIK 1 · Conjugación esencial |
| `-ㅂ/습니다` | EXACT | **G139** · TOPIK 1 · Conjugación esencial |
| `안 + V / -지 않다` | EXACT | **G015** · TOPIK 1 · Negación |
| `못 + V / -지 못하다` | EXACT | **G016** · TOPIK 1 · Negación |
| `안 vs 못 (비교)` | EXACT | **G143** · TOPIK 1 · Negación |
| `-고` | EXACT | **G019** · TOPIK 1 · Conjunciones básicas |
| `-아/어서` | EXACT | **G020** · TOPIK 1 · Conjunciones básicas |
| `-지만` | EXACT | **G021** · TOPIK 1 · Conjunciones básicas |
| `-(으)면` | EXACT | **G022** · TOPIK 1 · Conjunciones básicas |
| `-ㄴ/는데` | EXACT | **G026** · TOPIK 1 · Conjunciones básicas |
| `-고 싶다` | EXACT | **G017** · TOPIK 1 · Modales, deseos y reacciones |
| `-고 있다` | EXACT | **G023** · TOPIK 1 · Modales, deseos y reacciones |
| `-(으)러 가다/오다` | EXACT | **G024** · TOPIK 1 · Modales, deseos y reacciones |
| `-(으)ㄴ 적이 있다/없다` | EXACT | **G029** · TOPIK 1 · Modales, deseos y reacciones |
| `-겠어요` | EXACT | **G126** · TOPIK 1 · Modales, deseos y reacciones |
| `-(으)ㄹ래요?` | EXACT | **G127** · TOPIK 1 · Modales, deseos y reacciones |
| `-네요` | EXACT | **G128** · TOPIK 1 · Modales, deseos y reacciones |
| `-지요? / -죠?` | EXACT | **G129** · TOPIK 1 · Modales, deseos y reacciones |
| `-아/어도 되다` | EXACT | **G136** · TOPIK 1 · Modales, deseos y reacciones |
| `-지 않아도 되다` | EXACT | **G137** · TOPIK 1 · Modales, deseos y reacciones |
| `-아/어 드리다` | EXACT | **G138** · TOPIK 1 · Modales, deseos y reacciones |
| `의문사` | EXACT | **G030** · TOPIK 1 · Léxico estructural del nivel |
| `숫자` | EXACT | **G031** · TOPIK 1 · Léxico estructural del nivel |
| `시간 표현` | EXACT | **G032** · TOPIK 1 · Léxico estructural del nivel |
| `이 / 그 / 저` | EXACT | **G130** · TOPIK 1 · Léxico estructural del nivel |
| `위치어 (위 / 아래 / 앞 / 뒤 / 옆 …)` | EXACT | **G131** · TOPIK 1 · Léxico estructural del nivel |
| `수 분류사 (개 / 명 / 권 / 잔 / 마리 …)` | EXACT | **G132** · TOPIK 1 · Léxico estructural del nivel |
| `인사 표현` | EXACT | **G140** · TOPIK 1 · Léxico estructural del nivel |
| `얼마나 걸려요?` | EXACT | **G141** · TOPIK 1 · Léxico estructural del nivel |
| `N(이)랑 / 하고 + 같이 / 함께` | EXACT | **G142** · TOPIK 1 · Léxico estructural del nivel |
| `가져가다 / 가져오다 / 데려가다 / 데려오다` | EXACT | **G213** · auxiliaries |
| `-지 말다` | EXACT | **G217** · auxiliaries |
| `N 말고` | EXACT | **G218** · auxiliaries |
| `-(으)ㄹ 수 있다/없다` | EXACT | **G033** · TOPIK 2 · Habilidad y permiso |
| `-(으)ㄹ 때` | EXACT | **G034** · TOPIK 2 · Tiempo y secuencia |
| `-기 전에` | EXACT | **G035** · TOPIK 2 · Tiempo y secuencia |
| `-(으)ㄴ 후에 / 다음에` | EXACT | **G036** · TOPIK 2 · Tiempo y secuencia |
| `-는 동안` | EXACT | **G048** · TOPIK 2 · Tiempo y secuencia |
| `-고 나서 / -고 나면` | EXACT | **G145** · TOPIK 2 · Tiempo y secuencia |
| `-는 것` | EXACT | **G037** · TOPIK 2 · Nominalización y conjetura |
| `-(으)ㄴ/는 것 같다` | EXACT | **G050** · TOPIK 2 · Nominalización y conjetura |
| `-(으)ㄴ/는 모양이다` | EXACT | **G154** · TOPIK 2 · Nominalización y conjetura |
| `-아/어야 하다 / 되다` | EXACT | **G040** · TOPIK 2 · Obligación, prohibición, suficiencia |
| `-(으)면 되다` | EXACT | **G041** · TOPIK 2 · Obligación, prohibición, suficiencia |
| `-(으)면 안 되다` | EXACT | **G042** · TOPIK 2 · Obligación, prohibición, suficiencia |
| `-(으)ㄹ 필요가 있다/없다` | EXACT | **G156** · TOPIK 2 · Obligación, prohibición, suficiencia |
| `-(으)ㄹ게요` | EXACT | **G043** · TOPIK 2 · Intención, propuesta, decisión |
| `-(으)ㄹ까요?` | EXACT | **G044** · TOPIK 2 · Intención, propuesta, decisión |
| `-(으)려고` | EXACT | **G047** · TOPIK 2 · Intención, propuesta, decisión |
| `-아/어 보다` | EXACT | **G038** · TOPIK 2 · Auxiliares del nivel |
| `-아/어 주다` | EXACT | **G039** · TOPIK 2 · Auxiliares del nivel |
| `-아/어 버리다` | EXACT | **G146** · TOPIK 2 · Auxiliares del nivel |
| `-아/어 놓다 / -아/어 두다` | EXACT | **G147** · TOPIK 2 · Auxiliares del nivel |
| `-(으)니까` | EXACT | **G045** · TOPIK 2 · Causa, contraste, comparación |
| `때문에 / 기 때문에` | EXACT | **G055** · TOPIK 2 · Causa, contraste, comparación |
| `-거나` | EXACT | **G046** · TOPIK 2 · Causa, contraste, comparación |
| `-처럼 / -같이` | EXACT | **G052** · TOPIK 2 · Causa, contraste, comparación |
| `-보다` | EXACT | **G053** · TOPIK 2 · Causa, contraste, comparación |
| `-(으)ㄴ/는지` | EXACT | **G049** · TOPIK 2 · Preguntas indirectas y matices |
| `-(으)ㄴ/는데요` | EXACT | **G057** · TOPIK 2 · Preguntas indirectas y matices |
| `얼마나` | EXACT | **G058** · TOPIK 2 · Preguntas indirectas y matices |
| `에 대해(서)` | EXACT | **G054** · TOPIK 2 · Preguntas indirectas y matices |
| `-(으)ㄹ까 봐` | EXACT | **G144** · TOPIK 2 · Reacciones y matices |
| `-더라도` | EXACT | **G148** · TOPIK 2 · Reacciones y matices |
| `-(으)ㄹ지도 모르다` | EXACT | **G149** · TOPIK 2 · Reacciones y matices |
| `-잖아요` | EXACT | **G150** · TOPIK 2 · Reacciones y matices |
| `-군요 / -구나` | EXACT | **G151** · TOPIK 2 · Reacciones y matices |
| `-더라고요` | EXACT | **G152** · TOPIK 2 · Reacciones y matices |
| `-(으)ㄹ 만큼` | EXACT | **G153** · TOPIK 2 · Reacciones y matices |
| `-기 쉽다/어렵다` | EXACT | **G155** · TOPIK 2 · Reacciones y matices |
| `피동사 (이/히/리/기)` | EXACT | **G157** · TOPIK 2 · Pasiva básica y otros |
| `아무 N(이)나 / 아무 N도` | EXACT | **G158** · TOPIK 2 · Pasiva básica y otros |
| `(이)라도` | EXACT | **G159** · TOPIK 2 · Pasiva básica y otros |
| `-다고요? / -(이)라고요?` | EXACT | **G160** · TOPIK 2 · Pasiva básica y otros |
| `이/가 되다` | EXACT | **G051** · TOPIK 2 · Cambio y adverbios temporales |
| `아직 / 벌써 / 이미` | EXACT | **G056** · TOPIK 2 · Cambio y adverbios temporales |
| `-아/어 죽겠다` | EXACT | **G210** · auxiliaries |
| `-아/어 가지고` | EXACT | **G212** · auxiliaries |
| `-다(가) 말다` | EXACT | **G216** · auxiliaries |
| `-게 되다` | EXACT | **G059** · TOPIK 3 · Cambio de estado |
| `-아/어지다` | EXACT | **G066** · TOPIK 3 · Cambio de estado |
| `-아/어 있다` | EXACT | **G073** · TOPIK 3 · Cambio de estado |
| `-아/어 보이다` | EXACT | **G070** · TOPIK 3 · Cambio de estado |
| `-기 때문에` | EXACT | **G062** · TOPIK 3 · Causa, propósito, dependencia |
| `-(으)면서` | EXACT | **G061** · TOPIK 3 · Causa, propósito, dependencia |
| `-(으)ㄹ 수밖에 없다` | EXACT | **G063** · TOPIK 3 · Causa, propósito, dependencia |
| `-기 위해(서) / -을/를 위해(서)` | EXACT | **G068** · TOPIK 3 · Causa, propósito, dependencia |
| `에 따라(서)` | EXACT | **G067** · TOPIK 3 · Causa, propósito, dependencia |
| `에 비해(서)` | EXACT | **G170** · TOPIK 3 · Causa, propósito, dependencia |
| `-(으)ㄹ 것 같다` | EXACT | **G069** · TOPIK 3 · Conjetura matizada |
| `-(으)ㄴ/는 것처럼` | EXACT | **G071** · TOPIK 3 · Conjetura matizada |
| `-(으)면 좋겠다` | EXACT | **G072** · TOPIK 3 · Conjetura matizada |
| `-(으)ㄴ/는 줄 알다/몰랐다` | EXACT | **G168** · TOPIK 3 · Conjetura matizada |
| `-기 마련이다` | EXACT | **G169** · TOPIK 3 · Conjetura matizada |
| `-기로 하다` | EXACT | **G064** · TOPIK 3 · Tendencia, decisión, capacidad |
| `-(으)ㄴ/는 편이다` | EXACT | **G065** · TOPIK 3 · Tendencia, decisión, capacidad |
| `-(으)ㄹ 줄 알다/모르다` | EXACT | **G074** · TOPIK 3 · Tendencia, decisión, capacidad |
| `-도록` | EXACT | **G060** · TOPIK 3 · Tendencia, decisión, capacidad |
| `-자마자` | EXACT | **G079** · TOPIK 3 · Tendencia, decisión, capacidad |
| `-(으)ㄴ 지` | EXACT | **G078** · TOPIK 3 · Tendencia, decisión, capacidad |
| `-아/어도` | EXACT | **G076** · TOPIK 3 · Concesión y restricción |
| `-(으)ㄴ/는데도` | EXACT | **G077** · TOPIK 3 · Concesión y restricción |
| `밖에 + neg` | EXACT | **G075** · TOPIK 3 · Concesión y restricción |
| `피동 (이/히/리/기)` | EXACT | **G161** · TOPIK 3 · Pasiva y causativa completas |
| `사동 (이/히/리/기/우/추)` | EXACT | **G162** · TOPIK 3 · Pasiva y causativa completas |
| `-(으)려다가` | EXACT | **G163** · TOPIK 3 · Procesos y descubrimientos |
| `-다 보면` | EXACT | **G164** · TOPIK 3 · Procesos y descubrimientos |
| `-다 보니` | EXACT | **G165** · TOPIK 3 · Procesos y descubrimientos |
| `-아/어 대다` | EXACT | **G166** · TOPIK 3 · Procesos y descubrimientos |
| `-고 말다` | EXACT | **G167** · TOPIK 3 · Procesos y descubrimientos |
| `-는다면 / -(이)라면` | EXACT | **G171** · TOPIK 3 · Procesos y descubrimientos |
| `-아/어 가다` | EXACT | **G205** · auxiliaries |
| `-아/어 오다` | EXACT | **G206** · auxiliaries |
| `-아/어 내다` | EXACT | **G207** · auxiliaries |
| `-지 그래(요)?` | EXACT | **G219** · auxiliaries |
| `-아/어야지(요)` | EXACT | **G220** · auxiliaries |
| `-거든(요)` | EXACT | **G240** · additional |
| `N + 답다` | EXACT | **G260** · additional |
| `N + 스럽다` | EXACT | **G261** · additional |
| `-다고 하다` | EXACT | **G089** · TOPIK 4 · Discurso indirecto (núcleo) |
| `-(으)라고 하다` | EXACT | **G090** · TOPIK 4 · Discurso indirecto (núcleo) |
| `-냐고 하다 / -(으)냐고 묻다` | EXACT | **G091** · TOPIK 4 · Discurso indirecto (núcleo) |
| `-자고 하다` | EXACT | **G092** · TOPIK 4 · Discurso indirecto (núcleo) |
| `-다면서요?` | EXACT | **G177** · TOPIK 4 · Discurso indirecto (núcleo) |
| `-(으)ㄹ 뿐만 아니라` | EXACT | **G080** · TOPIK 4 · Aditivas y contrastivas |
| `-는 반면에` | EXACT | **G081** · TOPIK 4 · Aditivas y contrastivas |
| `-에도 불구하고` | EXACT | **G082** · TOPIK 4 · Aditivas y contrastivas |
| `-(으)ㄹ수록` | EXACT | **G083** · TOPIK 4 · Aditivas y contrastivas |
| `-는 한` | EXACT | **G084** · TOPIK 4 · Aditivas y contrastivas |
| `-(으)ㄴ/는 데다가` | EXACT | **G088** · TOPIK 4 · Aditivas y contrastivas |
| `-(으)ㄹ 뿐더러` | EXACT | **G179** · TOPIK 4 · Aditivas y contrastivas |
| `-(으)ㄴ/는 한편` | EXACT | **G180** · TOPIK 4 · Aditivas y contrastivas |
| `-은/는 물론이고` | PART (de `은/는 물론이고`) | **G182** · TOPIK 4 · Aditivas y contrastivas |
| `-는 바람에` | EXACT | **G085** · TOPIK 4 · Causa con resultado inesperado |
| `-는 통에` | EXACT | **G183** · TOPIK 4 · Causa con resultado inesperado |
| `-(으)ㄹ 텐데` | EXACT | **G086** · TOPIK 4 · Suposición y arrepentimiento |
| `-(으)ㄹ 리가 없다` | EXACT | **G095** · TOPIK 4 · Suposición y arrepentimiento |
| `-(으)ㄹ걸 그랬다` | EXACT | **G178** · TOPIK 4 · Suposición y arrepentimiento |
| `-(으)ㄴ/는 것을 보니` | EXACT | **G176** · TOPIK 4 · Suposición y arrepentimiento |
| `-다가` | EXACT | **G087** · TOPIK 4 · Cambio, modos y conformidad |
| `-(으)ㄴ/는 척하다` | EXACT | **G094** · TOPIK 4 · Cambio, modos y conformidad |
| `-게 하다` | EXACT | **G096** · TOPIK 4 · Cambio, modos y conformidad |
| `-(으)ㄴ/는 대로` | EXACT | **G097** · TOPIK 4 · Cambio, modos y conformidad |
| `-(으)ㄹ 만하다` | EXACT | **G093** · TOPIK 4 · Cambio, modos y conformidad |
| `-(으)ㄹ 정도로` | PART (de `-(으)ㄹ 정도로 / -(으)ㄹ 정도이다`) | **G172** · TOPIK 4 · Extremo, semejanza, formalidad |
| `-(으)ㄹ 듯하다 / -(으)ㄹ 듯이` | EXACT | **G173** · TOPIK 4 · Extremo, semejanza, formalidad |
| `-기에 앞서` | EXACT | **G175** · TOPIK 4 · Extremo, semejanza, formalidad |
| `-(으)로서 / -(으)로써` | EXACT | **G174** · TOPIK 4 · Rol, instrumento, contrafactual |
| `-았/었더라면` | EXACT | **G181** · TOPIK 4 · Rol, instrumento, contrafactual |
| `-ㄴ/는다는 것이` | EXACT | **G184** · TOPIK 4 · Rol, instrumento, contrafactual |
| `-고서야` | EXACT | **G185** · TOPIK 4 · Rol, instrumento, contrafactual |
| `-아/어 빠지다` | EXACT | **G208** · auxiliaries |
| `-아/어 치우다` | EXACT | **G209** · auxiliaries |
| `-아/어 봤자 / 봐야` | EXACT | **G211** · auxiliaries |
| `-고 보다 / -고 보니(까)` | PART (de `-고 보다 / -고 보니까`) | **G214** · auxiliaries |
| `-고 말겠다` | EXACT | **G215** · auxiliaries |
| `-았/었어야 했다` | EXACT | **G221** · auxiliaries |
| `-(으)ㄹ 테니까` | EXACT | **G222** · auxiliaries |
| `-(으)ㄴ 채(로)` | EXACT | **G223** · auxiliaries |
| `-(으)ㄴ/는 김에` | EXACT | **G224** · auxiliaries |
| `-(으)ㄴ/는 길에` | EXACT | **G225** · auxiliaries |
| `-(으)ㄹ 겸` | EXACT | **G226** · auxiliaries |
| `-느라(고)` | EXACT | **G228** · auxiliaries |
| `-길래` | EXACT | **G229** · auxiliaries |
| `-다가는` | EXACT | **G231** · auxiliaries |
| `-다면서요? / -다며?` | EXACT | **D006** · indirectSpeech |
| `-다니(요)?` | EXACT | **D007** · indirectSpeech |
| `-다니까(요)` | EXACT | **D008** · indirectSpeech |
| `-다고(요)?` | EXACT | **D009** · indirectSpeech |
| `-다는 + N` | EXACT | **D010** · indirectSpeech |
| `-다고 + 생각하다 / 믿다 / 듣다 / 보다 / 알다 / 느끼다 / 여기다` | EXACT | **D011** · indirectSpeech |
| `-나 보다` | EXACT | **G234** · additional |
| `-(으)ㄴ가 보다` | EXACT | **G235** · additional |
| `-(으)ㄹ걸(요)` | EXACT | **G241** · additional |
| `-(으)면서도` | EXACT | **G244** · additional |
| `-아/어다(가)` | EXACT | **G250** · additional |
| `-(으)ㄴ/는 만큼` | EXACT | **G256** · additional |
| `-(으)ㄴ/는 척 + V` | EXACT | **G262** · additional |
| `-았/었었-` | EXACT | **G264** · complementary |
| `-지 않을 수 없다` | EXACT | **G269** · complementary |
| `-(으)ㄴ/는 데(에)다(가)` | EXACT | **G277** · complementary |
| `-아/어다(가) 주다` | EXACT | **G278** · complementary |
| `-(으)면 -(으)ㄹ수록` | EXACT | **G285** · complementary |
| `-았/었어야` | EXACT | **G290** · complementary |
| `-더니` | EXACT | **G098** · TOPIK 5 · Evidencialidad y observación |
| `-던` | EXACT | **G099** · TOPIK 5 · Evidencialidad y observación |
| `-더니만` | EXACT | **G193** · TOPIK 5 · Evidencialidad y observación |
| `-(으)ㄹ지언정` | EXACT | **G100** · TOPIK 5 · Concesión avanzada |
| `-(으)ㄹ지라도` | EXACT | **G107** · TOPIK 5 · Concesión avanzada |
| `-고도` | EXACT | **G186** · TOPIK 5 · Concesión avanzada |
| `-느니 (차라리)` | EXACT | **G187** · TOPIK 5 · Concesión avanzada |
| `-(으)면 몰라도` | EXACT | **G189** · TOPIK 5 · Concesión avanzada |
| `-다손 치더라도` | EXACT | **G195** · TOPIK 5 · Concesión avanzada |
| `-(으)ㄴ/는 셈이다` | EXACT | **G101** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-(으)ㄹ 따름이다` | EXACT | **G104** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-(으)ㄹ 뿐이다` | EXACT | **G190** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `에 불과하다` | EXACT | **G111** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-기 나름이다` | EXACT | **G191** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-(으)ㄹ 나위가 없다` | EXACT | **G192** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-(으)ㄹ 것 없이` | EXACT | **G194** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-(으)면 그만이다` | EXACT | **G196** · TOPIK 5 · Equivalencia, limitación, suficiencia |
| `-기에` | EXACT | **G102** · TOPIK 5 · Causa formal con matices |
| `-(으)ㄴ/는 탓에` | EXACT | **G103** · TOPIK 5 · Causa formal con matices |
| `-(으)로 인해(서)` | EXACT | **G110** · TOPIK 5 · Causa formal con matices |
| `-고자` | EXACT | **G109** · TOPIK 5 · Causa formal con matices |
| `-(으)ㄴ/는 나머지` | EXACT | **G105** · TOPIK 5 · Extremo y frustración |
| `-(으)ㄹ 지경이다` | EXACT | **G188** · TOPIK 5 · Extremo y frustración |
| `-는 커녕` | EXACT | **G108** · TOPIK 5 · Extremo y frustración |
| `-든지` | EXACT | **G106** · TOPIK 5 · Indiferencia |
| `-(으)ㄴ 끝에` | EXACT | **G227** · auxiliaries |
| `-자` | EXACT | **G230** · auxiliaries |
| `-고서` | EXACT | **G232** · auxiliaries |
| `-다 못해` | EXACT | **G233** · auxiliaries |
| `-다고 해서` | EXACT | **D013** · indirectSpeech |
| `-다고 해도` | EXACT | **D014** · indirectSpeech |
| `-다는 게` | EXACT | **D015** · indirectSpeech |
| `-다는데 / -다더라 / -다더니` | PART (de `-다는데 / -다더라 / -다더니 / -다더라고요`) | **D016** · indirectSpeech |
| `-다고 할까 봐 / -다고 할 줄 알았다` | EXACT | **D017** · indirectSpeech |
| `-(으)ㄹ까 싶다` | EXACT | **G236** · additional |
| `-지 싶다` | EXACT | **G237** · additional |
| `-(으)ㄴ/는 듯하다 / 듯싶다` | EXACT | **G238** · additional |
| `-(으)ㄴ가 싶다` | EXACT | **G239** · additional |
| `-(으)ㅁ` | EXACT | **G242** · additional |
| `명사화 비교 (-기 / -(으)ㅁ / -는 것)` | EXACT | **G243** · additional |
| `-(으)ㄴ/는 데에` | EXACT | **G245** · additional |
| `-(이)나마 / -(으)나마` | EXACT | **G246** · additional |
| `-느니만 못하다` | EXACT | **G247** · additional |
| `-았/었던들` | EXACT | **G248** · additional |
| `-(으)ㄹ 새(도) 없이` | EXACT | **G249** · additional |
| `즉시 표현 비교 (-자마자 / -는 대로 / -자 / -는 즉시)` | EXACT | **G251** · additional |
| `-(으)ㄴ/는 한이 있어도` | EXACT | **G254** · additional |
| `-답시고` | EXACT | **G257** · additional |
| `-(으)ㄴ/는다거나` | EXACT | **G259** · additional |
| `-(으)며` | EXACT | **G265** · complementary |
| `-(으)며 -(으)며` | EXACT | **G266** · complementary |
| `-(으)나` | EXACT | **G267** · complementary |
| `-(으)려고 들다` | EXACT | **G270** · complementary |
| `-기 십상이다` | EXACT | **G271** · complementary |
| `-(으)ㄴ/는 셈 치다` | EXACT | **G272** · complementary |
| `-(으)ㄹ락 말락 하다` | EXACT | **G273** · complementary |
| `-는 둥 마는 둥` | EXACT | **G274** · complementary |
| `-느냐에 따라(서)` | EXACT | **G275** · complementary |
| `-(으)ㄴ/는 가운데` | EXACT | **G276** · complementary |
| `-아/어 뵙다 / 봬요` | EXACT | **G279** · complementary |
| `-(으)랴 -(으)랴` | EXACT | **G281** · complementary |
| `-(으)ㄴ다는 게` | PART (de `-(으)ㄴ다는 게 / 것이`) | **G282** · complementary |
| `-(으)ㄹ 따름입니다` | EXACT | **G283** · complementary |
| `-(으)며 살다 / 지내다` | EXACT | **G287** · complementary |
| `-ㄴ들` | EXACT | **G197** · TOPIK 6 · Concesión retórica y literaria |
| `-(으)ㄹ망정` | EXACT | **G118** · TOPIK 6 · Concesión retórica y literaria |
| `-기로서니` | EXACT | **G201** · TOPIK 6 · Concesión retórica y literaria |
| `-(으)로 말미암아` | EXACT | **G112** · TOPIK 6 · Conectores literarios |
| `-(으)ㄴ/는 즉` | EXACT | **G113** · TOPIK 6 · Conectores literarios |
| `-거니와` | EXACT | **G198** · TOPIK 6 · Conectores literarios |
| `-는 마당에` | EXACT | **G114** · TOPIK 6 · Conectores literarios |
| `-는 즉시` | EXACT | **G202** · TOPIK 6 · Conectores literarios |
| `-(이)야말로` | EXACT | **G115** · TOPIK 6 · Énfasis máximo y aserción |
| `-건대 / 생각건대 / 바라건대` | EXACT | **G116** · TOPIK 6 · Énfasis máximo y aserción |
| `에 있어서` | EXACT | **G117** · TOPIK 6 · Énfasis máximo y aserción |
| `-는 법이다` | EXACT | **G119** · TOPIK 6 · Énfasis máximo y aserción |
| `-(으)ㄴ/는 이상` | EXACT | **G120** · TOPIK 6 · Énfasis máximo y aserción |
| `-다시피` | EXACT | **G121** · TOPIK 6 · Énfasis máximo y aserción |
| `-ㄴ/는다` | EXACT | **G122** · TOPIK 6 · Registros escritos y arcaicos |
| `-노라` | EXACT | **G123** · TOPIK 6 · Registros escritos y arcaicos |
| `-로다 / -(이)로다` | EXACT | **G200** · TOPIK 6 · Registros escritos y arcaicos |
| `-(으)ㄹ진대` | EXACT | **G124** · TOPIK 6 · Registros escritos y arcaicos |
| `-(으)련마는 / -(으)련만` | EXACT | **G199** · TOPIK 6 · Registros escritos y arcaicos |
| `-(으)ㄹ쏘냐` | EXACT | **G203** · TOPIK 6 · Registros escritos y arcaicos |
| `원인 표현 비교` | EXACT | **G125** · TOPIK 6 · Tablas comparativas (meta-tema) |
| `양보 표현 비교` | EXACT | **G204** · TOPIK 6 · Tablas comparativas (meta-tema) |
| `-아/어 마지않다` | EXACT | **G252** · additional |
| `-아/어 마땅하다` | EXACT | **G253** · additional |
| `-(으)리라(고)` | EXACT | **G255** · additional |
| `-(으)ㄹ세라` | EXACT | **G258** · additional |
| `질문 종결 비교` | EXACT | **G263** · additional |
| `-건만` | EXACT | **G268** · complementary |
| `-아/어 주십사 (하고)` | EXACT | **G280** · complementary |
| `-아/어 마다하지 않다` | EXACT | **G284** · complementary |
| `-노라면` | EXACT | **G288** · complementary |
| `-아/어 죽을 지경이다` | EXACT | **G289** · complementary |

## 2) Cobertura por nivel TOPIK

| Nivel | Total spine | En seed | Faltan |
|---|---:|---:|---:|
| TOPIK 1 | 50 | 50 | 0 |
| TOPIK 2 | 43 | 43 | 0 |
| TOPIK 3 | 32 | 32 | 0 |
| TOPIK 4 | 32 | 32 | 0 |
| TOPIK 5 | 25 | 25 | 0 |
| TOPIK 6 | 22 | 22 | 0 |

## 3) Items críticos (★★★) ausentes — prioridad de expansión

Total críticos ausentes: **0**

| ID | Patrón | Origen | Resumen |
|---|---|---|---|

## 4) Items frecuentes (★★) ausentes — siguiente prioridad

Total frecuentes ausentes: **0**

| ID | Patrón | Origen | Resumen |
|---|---|---|---|

## 5) Items matiz (★) ausentes — referencia

Total matiz ausentes: **1**

| ID | Patrón | Origen | Resumen |
|---|---|---|---|
| G286 | `-(이)야말로 (확장)` | complementary | Extensión de G115: combinaciones útiles con -(이)야말로 |

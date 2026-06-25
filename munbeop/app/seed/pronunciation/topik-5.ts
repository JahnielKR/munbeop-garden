import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 5 pronunciation guides — same "sound it out by syllables" model and
 * authoring convention as {@link TOPIK_1_PRONUNCIATION} (see topik-1.ts header).
 *
 * Covers every TOPIK-5 catalog grammar point that IS a single pronounceable
 * form. Deliberately skipped (comparison drills / category labels): 명사화 비교
 * (-기 / -(으)ㅁ / -는 것) and 즉시 표현 비교 (-자마자 / -는 대로 / -자 / -는 즉시).
 *
 * Convention recap: 어/었 realization for 아/어; voiced consonant-stem epenthesis
 * (으)→으, (으)+ㄹ→을, (으)+ㄴ→은, (으)+ㅁ→음; bare ㄴ/는 → 는; a synonym listing
 * sounds only the single most common SPOKEN representative (-다는데/-다더라/-다더니
 * → 다는데; -아/어 뵙다/봬요 → 어 뵙다; -(이)나마/-(으)나마 → 이나마); a DOUBLED pattern
 * sounds the core twice (-(으)랴 -(으)랴 → 으·랴·으·랴); optional parens dropped
 * (-(으)로 인해(서) → 으로 인해; -느니 (차라리) → 느니). PENDING wife native-review.
 */
export const TOPIK_5_PRONUNCIATION: PronunciationGuide[] = [
  // ── Retrospective / recalled ──────────────────────────────────────────────
  { ko: '-더니', parts: ['더', '니'] },
  { ko: '-던', parts: ['던'] },
  { ko: '-더니만', parts: ['더', '니', '만'] },

  // ── Concessive ────────────────────────────────────────────────────────────
  { ko: '-(으)ㄹ지언정', parts: ['을', '지', '언', '정'] },
  { ko: '-(으)ㄹ지라도', parts: ['을', '지', '라', '도'] },
  { ko: '-고도', parts: ['고', '도'] },
  { ko: '-느니 (차라리)', parts: ['느', '니'] },
  { ko: '-(으)면 몰라도', parts: ['으', '면', '몰', '라', '도'] },
  { ko: '-다손 치더라도', parts: ['다', '손', '치', '더', '라', '도'] },

  // ── "merely / amounts to / it is enough" ──────────────────────────────────
  { ko: '-(으)ㄴ/는 셈이다', parts: ['는', '셈', '이', '다'] },
  { ko: '-(으)ㄹ 따름이다', parts: ['을', '따', '름', '이', '다'] },
  { ko: '-(으)ㄹ 뿐이다', parts: ['을', '뿐', '이', '다'] },
  { ko: '에 불과하다', parts: ['에', '불', '과', '하', '다'] },
  { ko: '-기 나름이다', parts: ['기', '나', '름', '이', '다'] },
  { ko: '-(으)ㄹ 나위가 없다', parts: ['을', '나', '위', '가', '없', '다'] },
  { ko: '-(으)ㄹ 것 없이', parts: ['을', '것', '없', '이'] },
  { ko: '-(으)면 그만이다', parts: ['으', '면', '그', '만', '이', '다'] },

  // ── Cause / result / purpose ──────────────────────────────────────────────
  { ko: '-기에', parts: ['기', '에'] },
  { ko: '-(으)ㄴ/는 탓에', parts: ['는', '탓', '에'] },
  { ko: '-(으)로 인해(서)', parts: ['으', '로', '인', '해'] },
  { ko: '-고자', parts: ['고', '자'] },
  { ko: '-(으)ㄴ/는 나머지', parts: ['는', '나', '머', '지'] },
  { ko: '-(으)ㄹ 지경이다', parts: ['을', '지', '경', '이', '다'] },

  // ── Contrast / listing / sequence ─────────────────────────────────────────
  { ko: '-는 커녕', parts: ['는', '커', '녕'] },
  { ko: '-든지', parts: ['든', '지'] },
  { ko: '-(으)ㄴ 끝에', parts: ['은', '끝', '에'] },
  { ko: '-자', parts: ['자'] },
  { ko: '-고서', parts: ['고', '서'] },

  // ── "beyond / just because" + reported nuance ─────────────────────────────
  { ko: '-다 못해', parts: ['다', '못', '해'] },
  { ko: '-다고 해서', parts: ['다', '고', '해', '서'] },
  { ko: '-다고 해도', parts: ['다', '고', '해', '도'] },
  { ko: '-다는 게', parts: ['다', '는', '게'] },
  { ko: '-다는데 / -다더라 / -다더니', parts: ['다', '는', '데'] },
  { ko: '-다고 할까 봐 / -다고 할 줄 알았다', parts: ['다', '고', '할', '까', '봐'] },

  // ── Conjecture / nominalizer ──────────────────────────────────────────────
  { ko: '-(으)ㄹ까 싶다', parts: ['을', '까', '싶', '다'] },
  { ko: '-지 싶다', parts: ['지', '싶', '다'] },
  { ko: '-(으)ㄴ/는 듯하다 / 듯싶다', parts: ['는', '듯', '하', '다'] },
  { ko: '-(으)ㄴ가 싶다', parts: ['은', '가', '싶', '다'] },
  { ko: '-(으)ㅁ', parts: ['음'] },

  // ── Literary connectives / endings ────────────────────────────────────────
  { ko: '-(으)ㄴ/는 데에', parts: ['는', '데', '에'] },
  { ko: '-(이)나마 / -(으)나마', parts: ['이', '나', '마'] },
  { ko: '-느니만 못하다', parts: ['느', '니', '만', '못', '하', '다'] },
  { ko: '-았/었던들', parts: ['었', '던', '들'] },
  { ko: '-(으)ㄹ 새(도) 없이', parts: ['을', '새', '없', '이'] },
  { ko: '-(으)ㄴ/는 한이 있어도', parts: ['는', '한', '이', '있', '어', '도'] },
  { ko: '-답시고', parts: ['답', '시', '고'] },
  { ko: '-(으)ㄴ/는다거나', parts: ['는', '다', '거', '나'] },
  { ko: '-(으)며', parts: ['으', '며'] },
  { ko: '-(으)며 -(으)며', parts: ['으', '며', '으', '며'] },
  { ko: '-(으)나', parts: ['으', '나'] },
  { ko: '-(으)려고 들다', parts: ['으', '려', '고', '들', '다'] },
  { ko: '-기 십상이다', parts: ['기', '십', '상', '이', '다'] },

  // ── Idiomatic constructions ───────────────────────────────────────────────
  { ko: '-(으)ㄴ/는 셈 치다', parts: ['는', '셈', '치', '다'] },
  { ko: '-(으)ㄹ락 말락 하다', parts: ['을', '락', '말', '락', '하', '다'] },
  { ko: '-는 둥 마는 둥', parts: ['는', '둥', '마', '는', '둥'] },
  { ko: '-느냐에 따라(서)', parts: ['느', '냐', '에', '따', '라'] },
  { ko: '-(으)ㄴ/는 가운데', parts: ['는', '가', '운', '데'] },
  { ko: '-아/어 뵙다 / 봬요', parts: ['어', '뵙', '다'] },
  { ko: '-(으)랴 -(으)랴', parts: ['으', '랴', '으', '랴'] },
  { ko: '-(으)ㄴ다는 게', parts: ['는', '다', '는', '게'] },
  { ko: '-(으)ㄹ 따름입니다', parts: ['을', '따', '름', '입', '니', '다'] },
  { ko: '-(으)며 살다 / 지내다', parts: ['으', '며', '살', '다'] },
]

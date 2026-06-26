import type { PronunciationGuide } from '~/lib/domain'

/**
 * TOPIK 4 pronunciation guides — same "sound it out by syllables" model and
 * authoring convention as {@link TOPIK_1_PRONUNCIATION} (see topik-1.ts header).
 *
 * Covers all 65 TOPIK-4 catalog grammar points (every entry is a real
 * pronounceable form — no category labels or comparison drills to skip here).
 *
 * Convention recap (full policy in topik-1.ts): true allomorphs sound BOTH forms
 * — 아/어·았/었 (아요|어요) and (으)/(이) before a full syllable (으라고|라고); jamo-fusing
 * (으)+ㄹ→을, (으)+ㄴ→은 and bare ㄴ/는→는 stay single; a synonym listing sounds only
 * the single most common SPOKEN representative (-(으)로서/-(으)로써 → 으로서;
 * -아/어 봤자/봐야 → 어 봤자; -다면서요?/-다며? → 다면서요; -고 보다/-고 보니(까) → 고 보다);
 * optional parenthesized morphemes dropped (-(으)ㄴ 채(로) → 은 채; -느라(고) → 느라;
 * -다니(요)? → 다니; -(으)ㄴ/는 데(에)다(가) → 는 데다); a placeholder N/V or verb-slot
 * is not sounded (-다는 + N → 다는; -(으)ㄴ/는 척 + V → 는 척; -다고 + 생각하다/… → 다고).
 * PENDING wife native-review — the content gate.
 */
export const TOPIK_4_PRONUNCIATION: PronunciationGuide[] = [
  // ── Reported speech ───────────────────────────────────────────────────────
  { ko: '-다고 하다', forms: [{ parts: ['다', '고', '하', '다'] }] },
  { ko: '-(으)라고 하다', forms: [{ parts: ['으', '라', '고', '하', '다'] }, { parts: ['라', '고', '하', '다'] }] },
  { ko: '-냐고 하다 / -(으)냐고 묻다', forms: [{ parts: ['냐', '고', '하', '다'] }] },
  { ko: '-자고 하다', forms: [{ parts: ['자', '고', '하', '다'] }] },
  { ko: '-다면서요?', forms: [{ parts: ['다', '면', '서', '요'] }] },

  // ── Addition / contrast ───────────────────────────────────────────────────
  { ko: '-(으)ㄹ 뿐만 아니라', forms: [{ parts: ['을', '뿐', '만', '아', '니', '라'] }] },
  { ko: '-는 반면에', forms: [{ parts: ['는', '반', '면', '에'] }] },
  { ko: '-에도 불구하고', forms: [{ parts: ['에', '도', '불', '구', '하', '고'] }] },
  { ko: '-(으)ㄹ수록', forms: [{ parts: ['을', '수', '록'] }] },
  { ko: '-는 한', forms: [{ parts: ['는', '한'] }] },
  { ko: '-(으)ㄴ/는 데다가', forms: [{ parts: ['는', '데', '다', '가'] }] },
  { ko: '-(으)ㄹ 뿐더러', forms: [{ parts: ['을', '뿐', '더', '러'] }] },
  { ko: '-(으)ㄴ/는 한편', forms: [{ parts: ['는', '한', '편'] }] },
  { ko: '-은/는 물론이고', forms: [{ parts: ['은', '물', '론', '이', '고'] }, { parts: ['는', '물', '론', '이', '고'] }] },
  { ko: '-는 바람에', forms: [{ parts: ['는', '바', '람', '에'] }] },
  { ko: '-는 통에', forms: [{ parts: ['는', '통', '에'] }] },

  // ── Conjecture / regret / judgment ────────────────────────────────────────
  { ko: '-(으)ㄹ 텐데', forms: [{ parts: ['을', '텐', '데'] }] },
  { ko: '-(으)ㄹ 리가 없다', forms: [{ parts: ['을', '리', '가', '없', '다'] }] },
  { ko: '-(으)ㄹ걸 그랬다', forms: [{ parts: ['을', '걸', '그', '랬', '다'] }] },
  { ko: '-(으)ㄴ/는 것을 보니', forms: [{ parts: ['는', '것', '을', '보', '니'] }] },

  // ── Manner / pretense / causative / standard ──────────────────────────────
  { ko: '-다가', forms: [{ parts: ['다', '가'] }] },
  { ko: '-(으)ㄴ/는 척하다', forms: [{ parts: ['는', '척', '하', '다'] }] },
  { ko: '-게 하다', forms: [{ parts: ['게', '하', '다'] }] },
  { ko: '-(으)ㄴ/는 대로', forms: [{ parts: ['는', '대', '로'] }] },
  { ko: '-(으)ㄹ 만하다', forms: [{ parts: ['을', '만', '하', '다'] }] },
  { ko: '-(으)ㄹ 정도로', forms: [{ parts: ['을', '정', '도', '로'] }] },

  // ── Likeness / sequence / role / counterfactual ───────────────────────────
  { ko: '-(으)ㄹ 듯하다 / -(으)ㄹ 듯이', forms: [{ parts: ['을', '듯', '하', '다'] }] },
  { ko: '-기에 앞서', forms: [{ parts: ['기', '에', '앞', '서'] }] },
  { ko: '-(으)로서 / -(으)로써', forms: [{ parts: ['으', '로', '서'] }, { parts: ['로', '서'] }] },
  { ko: '-았/었더라면', forms: [{ parts: ['았', '더', '라', '면'] }, { parts: ['었', '더', '라', '면'] }] },
  { ko: '-ㄴ/는다는 것이', forms: [{ parts: ['는', '다', '는', '것', '이'] }] },
  { ko: '-고서야', forms: [{ parts: ['고', '서', '야'] }] },

  // ── Auxiliary verbs / resolve / past-modal ────────────────────────────────
  { ko: '-아/어 빠지다', forms: [{ parts: ['아', '빠', '지', '다'] }, { parts: ['어', '빠', '지', '다'] }] },
  { ko: '-아/어 치우다', forms: [{ parts: ['아', '치', '우', '다'] }, { parts: ['어', '치', '우', '다'] }] },
  { ko: '-아/어 봤자 / 봐야', forms: [{ parts: ['아', '봤', '자'] }, { parts: ['어', '봤', '자'] }] },
  { ko: '-고 보다 / -고 보니(까)', forms: [{ parts: ['고', '보', '다'] }] },
  { ko: '-고 말겠다', forms: [{ parts: ['고', '말', '겠', '다'] }] },
  { ko: '-았/었어야 했다', forms: [{ parts: ['았', '어', '야', '했', '다'] }, { parts: ['었', '어', '야', '했', '다'] }] },
  { ko: '-(으)ㄹ 테니까', forms: [{ parts: ['을', '테', '니', '까'] }] },

  // ── State / opportunity / purpose / cause ─────────────────────────────────
  { ko: '-(으)ㄴ 채(로)', forms: [{ parts: ['은', '채'] }] },
  { ko: '-(으)ㄴ/는 김에', forms: [{ parts: ['는', '김', '에'] }] },
  { ko: '-(으)ㄴ/는 길에', forms: [{ parts: ['는', '길', '에'] }] },
  { ko: '-(으)ㄹ 겸', forms: [{ parts: ['을', '겸'] }] },
  { ko: '-느라(고)', forms: [{ parts: ['느', '라'] }] },
  { ko: '-길래', forms: [{ parts: ['길', '래'] }] },

  // ── Reported-nuance sentence endings ──────────────────────────────────────
  { ko: '-다가는', forms: [{ parts: ['다', '가', '는'] }] },
  { ko: '-다면서요? / -다며?', forms: [{ parts: ['다', '면', '서', '요'] }] },
  { ko: '-다니(요)?', forms: [{ parts: ['다', '니'] }] },
  { ko: '-다니까(요)', forms: [{ parts: ['다', '니', '까'] }] },
  { ko: '-다고(요)?', forms: [{ parts: ['다', '고'] }] },
  { ko: '-다는 + N', forms: [{ parts: ['다', '는'] }] },
  { ko: '-다고 + 생각하다 / 믿다 / 듣다 / 보다 / 알다 / 느끼다 / 여기다', forms: [{ parts: ['다', '고'] }] },
  { ko: '-나 보다', forms: [{ parts: ['나', '보', '다'] }] },
  { ko: '-(으)ㄴ가 보다', forms: [{ parts: ['은', '가', '보', '다'] }] },
  { ko: '-(으)ㄹ걸(요)', forms: [{ parts: ['을', '걸'] }] },
  { ko: '-(으)면서도', forms: [{ parts: ['으', '면', '서', '도'] }, { parts: ['면', '서', '도'] }] },

  // ── Transfer / extent / pretense / double-past / emphasis ─────────────────
  { ko: '-아/어다(가)', forms: [{ parts: ['아', '다'] }, { parts: ['어', '다'] }] },
  { ko: '-(으)ㄴ/는 만큼', forms: [{ parts: ['는', '만', '큼'] }] },
  { ko: '-(으)ㄴ/는 척 + V', forms: [{ parts: ['는', '척'] }] },
  { ko: '-았/었었-', forms: [{ parts: ['았', '었'] }, { parts: ['었', '었'] }] },
  { ko: '-지 않을 수 없다', forms: [{ parts: ['지', '않', '을', '수', '없', '다'] }] },
  { ko: '-(으)ㄴ/는 데(에)다(가)', forms: [{ parts: ['는', '데', '다'] }] },
  { ko: '-아/어다(가) 주다', forms: [{ parts: ['아', '다', '주', '다'] }, { parts: ['어', '다', '주', '다'] }] },
  { ko: '-(으)면 -(으)ㄹ수록', forms: [{ parts: ['으', '면', '을', '수', '록'] }, { parts: ['면', '을', '수', '록'] }] },
  { ko: '-았/었어야', forms: [{ parts: ['았', '어', '야'] }, { parts: ['었', '어', '야'] }] },
]

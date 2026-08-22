import type { TopikLevel } from '~/lib/library/topik-level'

/**
 * Extra pair chunks needed by grammar points whose comparison was authored in
 * another TOPIK level's file. The grammar's own level is always loaded too.
 *
 * Keeping only the cross-level edges makes this index tiny (the localized pair
 * payload remains lazy). The exhaustive parity test compares it with the full
 * authored catalog, so a new cross-level pair cannot silently become one-sided.
 */
export const EXTRA_PAIR_CHUNKS: Readonly<Partial<Record<string, readonly TopikLevel[]>>> = {
  '-(으)니까': [1],
  '-아/어 있다': [1],
  '-(으)ㄹ 거예요': [2],
  '-아/어 드리다': [2],
  '(이)나': [2],
  '-아/어도': [2, 6],
  '-는 동안': [3],
  '-(으)러 가다/오다': [3],
  '-(으)ㄴ/는 것 같다': [3],
  '-고': [4],
  '-자마자': [6],
  '-기 마련이다': [6],
  '-(으)로 인해(서)': [6],
  '-(으)ㄹ 뿐만 아니라': [6],
  '-(으)ㄹ지언정': [6],
}

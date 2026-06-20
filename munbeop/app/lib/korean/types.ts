export type VerbClass =
  | 'regular' | 'hada' | 'p_irr' | 't_irr'
  | 'eu_elision' | 'reu_irr' | 'h_irr' | 's_irr' | 'l_drop'

export const ENDINGS = ['-아/어요', '-았/었어요', '-(으)니까', '-(으)면', '-(으)세요', '-(으)ㄹ 거예요'] as const
export type Ending = (typeof ENDINGS)[number]

export const PARTICLES = ['은/는', '이/가', '을/를', '와/과', '(으)로', '(이)나'] as const
export type Particle = (typeof PARTICLES)[number]

export interface OnboardingGateInput {
  ready: boolean
  logEmpty: boolean
  onboarded: boolean
}

/** The onboarding overlay auto-shows only for a hydrated, brand-new, not-yet-onboarded user. */
export function shouldShowOnboarding({ ready, logEmpty, onboarded }: OnboardingGateInput): boolean {
  return ready && logEmpty && !onboarded
}

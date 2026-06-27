import type { NumberDomain } from '~/lib/domain'

export interface NumberDomainDef {
  id: NumberDomain
  /** Korean label (shown as-is). */
  ko: string
  /** i18n key for the localized label. */
  labelKey: string
}

export const NUMBER_DOMAINS: NumberDomainDef[] = [
  { id: 'counting', ko: '고유어 세기', labelKey: 'numberMarket.domain.counting' },
  { id: 'sino-basics', ko: '한자어 기초', labelKey: 'numberMarket.domain.sino_basics' },
  { id: 'time', ko: '시간', labelKey: 'numberMarket.domain.time' },
  { id: 'money', ko: '돈', labelKey: 'numberMarket.domain.money' },
  { id: 'dates', ko: '날짜', labelKey: 'numberMarket.domain.dates' },
  { id: 'phone', ko: '전화·번호', labelKey: 'numberMarket.domain.phone' },
]

export const MASTER_DOMAIN_IDS = NUMBER_DOMAINS.map((d) => d.id)

export interface DomainProgress { id: NumberDomain; ko: string; done: boolean }

export function masteryOf(cleared: Set<string>) {
  const perDomain: DomainProgress[] = NUMBER_DOMAINS.map((d) => ({ id: d.id, ko: d.ko, done: cleared.has(d.id) }))
  const doneCount = perDomain.filter((p) => p.done).length
  return { perDomain, doneCount, total: MASTER_DOMAIN_IDS.length, earned: doneCount === MASTER_DOMAIN_IDS.length }
}

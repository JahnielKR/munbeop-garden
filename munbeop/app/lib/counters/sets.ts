export interface CounterSet {
  id: string
  /** Korean label for the set (shown as-is). */
  ko: string
  /** i18n key for the localized label. */
  labelKey: string
  counterIds: string[]
}

export const COUNTER_SETS: CounterSet[] = [
  { id: 'people-animals', ko: '사람·동물', labelKey: 'counters.set.people_animals', counterIds: ['myeong', 'bun-people', 'mari'] },
  { id: 'books-paper', ko: '책·종이', labelKey: 'counters.set.books_paper', counterIds: ['gwon', 'jang', 'pyeji'] },
  { id: 'food-drink', ko: '음식·음료', labelKey: 'counters.set.food_drink', counterIds: ['jan', 'byeong', 'inbun'] },
  { id: 'time-age', ko: '시간·나이', labelKey: 'counters.set.time_age', counterIds: ['si', 'sigan', 'sal', 'bun-minutes'] },
  { id: 'things', ko: '사물', labelKey: 'counters.set.things', counterIds: ['gae', 'dae', 'kyeolle', 'beol'] },
  { id: 'money-order', ko: '돈·순서', labelKey: 'counters.set.money_order', counterIds: ['won', 'cheung', 'beon-ordinal', 'beon-times'] },
]

export const MASTER_SET_IDS = COUNTER_SETS.map((s) => s.id)

export interface SetProgress { id: string; ko: string; done: boolean }

export function masteryOf(cleared: Set<string>) {
  const perSet: SetProgress[] = COUNTER_SETS.map((s) => ({ id: s.id, ko: s.ko, done: cleared.has(s.id) }))
  const doneCount = perSet.filter((p) => p.done).length
  return { perSet, doneCount, total: MASTER_SET_IDS.length, earned: doneCount === MASTER_SET_IDS.length }
}

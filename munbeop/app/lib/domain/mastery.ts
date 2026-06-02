export type MasteryLevel = 'seedling' | 'plant' | 'tree'

export interface SrsState {
  /** Unix ms timestamp of the last time this grammar was practiced; null if never. */
  lastSeen: number | null
  /** Count of entries marked easy AND not flagged as incorrect in review. */
  easyCount: number
  /** Count of entries marked hard AND not flagged as incorrect in review. */
  hardCount: number
  /** Current mastery level. */
  mastery: MasteryLevel
}

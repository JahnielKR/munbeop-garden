import { COUNTERS, counterById } from './catalog'
import { COUNT_ITEMS as COUNT_ITEMS_BASE } from './items'
import { COUNT_ITEMS_EXTRA } from './items-extra'

export { COUNTERS, counterById }
export const COUNT_ITEMS = [...COUNT_ITEMS_BASE, ...COUNT_ITEMS_EXTRA]

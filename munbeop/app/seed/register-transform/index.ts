// app/seed/register-transform/index.ts
import type { RegisterItem } from '~/lib/domain'
import { LEVEL_ITEMS } from './level'
import { HONOR_ITEMS } from './honor'
import { LEVEL_EXTRA } from './level-extra'
import { HONOR_EXTRA } from './honor-extra'

export const REGISTER_ITEMS: RegisterItem[] = [...LEVEL_ITEMS, ...HONOR_ITEMS, ...LEVEL_EXTRA, ...HONOR_EXTRA]

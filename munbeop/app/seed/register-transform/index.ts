// app/seed/register-transform/index.ts
import type { RegisterItem } from '~/lib/domain'
import { LEVEL_ITEMS } from './level'
import { HONOR_ITEMS } from './honor'

export const REGISTER_ITEMS: RegisterItem[] = [...LEVEL_ITEMS, ...HONOR_ITEMS]

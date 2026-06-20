import type {
  Character,
  ClassBoard,
  EquipmentCard,
  StatKey,
  StatRequirement,
  Tier,
} from '../types'
import { STAT_KEYS, TIER_UP_COST } from '../types'
import { statValueAt } from '../data'

/** Current numeric value of every stat, derived from the class board + tiers. */
export function currentStatValues(
  character: Character,
  cls: ClassBoard,
): Record<StatKey, number> {
  const out = {} as Record<StatKey, number>
  for (const k of STAT_KEYS) {
    out[k] = statValueAt(cls, k, character.stats[k])
  }
  return out
}

/** Soul cost to raise a stat from its current tier to the next. null if maxed. */
export function nextTierCost(currentTier: Tier): number | null {
  const target = (currentTier + 1) as Tier
  if (target > 3) return null
  return TIER_UP_COST[target]
}

/** Does the character meet a card's stat requirements? */
export function meetsRequirement(
  req: StatRequirement | undefined,
  values: Record<StatKey, number>,
): boolean {
  if (!req) return true
  return STAT_KEYS.every((k) => (req[k] ?? 0) <= values[k])
}

/** Which stat requirements are unmet (for UI hints). */
export function unmetStats(
  req: StatRequirement | undefined,
  values: Record<StatKey, number>,
): StatKey[] {
  if (!req) return []
  return STAT_KEYS.filter((k) => (req[k] ?? 0) > values[k])
}

export const isWeapon = (card: EquipmentCard): boolean =>
  card.slot === 'one-hand' || card.slot === 'two-hand'

export const isArmour = (card: EquipmentCard): boolean => card.slot === 'armour'

export const isUpgrade = (card: EquipmentCard): boolean =>
  card.slot === 'weapon-upgrade' || card.slot === 'armour-upgrade'

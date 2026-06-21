import type {
  Character,
  ClassBoard,
  EquipmentCard,
  StatKey,
  StatRequirement,
  Tier,
} from '../types'
import { STAT_KEYS, TIER_UP_COST, HAND_KINDS, UPGRADE_KINDS } from '../types'
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

/** Hand-held gear: occupies a hand slot (and backup). */
export const isHandHeld = (card: EquipmentCard): boolean =>
  HAND_KINDS.includes(card.kind)

export const isWeapon = (card: EquipmentCard): boolean => card.kind === 'weapon'

export const isArmour = (card: EquipmentCard): boolean => card.kind === 'armour'

/** Cards that attach into a gear item's upgrade slots (rings + gems/titanite). */
export const isUpgrade = (card: EquipmentCard): boolean =>
  UPGRADE_KINDS.includes(card.kind)

/** Takes both hands. */
export const isTwoHanded = (card: EquipmentCard): boolean => card.hands === 2

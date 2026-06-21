import type { Character, EquipmentCard } from '../types'
import { isArmour, isHandHeld, isTwoHanded } from '../lib/character'

export type HandPath = 'leftHand' | 'rightHand'
export type SlotTarget = 'armour' | HandPath | 'backup'

/** Hand-held items carried (hands + backup) — capped by MAX_WEAPONS. */
export function weaponCount(c: Character): number {
  return (
    (c.equipped.leftHand ? 1 : 0) +
    (c.equipped.rightHand ? 1 : 0) +
    c.equipped.backup.length
  )
}

/** Is the off-hand blocked because a two-handed item occupies the other hand? */
export function handBlockedBy(
  c: Character,
  hand: HandPath,
  getCard: (id: string) => EquipmentCard | undefined,
): boolean {
  const other = hand === 'leftHand' ? c.equipped.rightHand : c.equipped.leftHand
  if (!other) return false
  const card = getCard(other.cardId)
  return card ? isTwoHanded(card) : false
}

export function slotAcceptsCard(target: SlotTarget, card: EquipmentCard): boolean {
  if (target === 'armour') return isArmour(card)
  return isHandHeld(card)
}

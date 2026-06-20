import type { Character, EquipmentCard } from '../types'
import { isWeapon } from '../lib/character'

export type HandPath = 'leftHand' | 'rightHand'
export type SlotTarget = 'armour' | HandPath | 'backup'

export function weaponCount(c: Character): number {
  return (
    (c.equipped.leftHand ? 1 : 0) +
    (c.equipped.rightHand ? 1 : 0) +
    c.equipped.backup.length
  )
}

/** Is the off-hand blocked because a two-handed weapon occupies the other hand? */
export function handBlockedBy(
  c: Character,
  hand: HandPath,
  getCard: (id: string) => EquipmentCard | undefined,
): boolean {
  const other = hand === 'leftHand' ? c.equipped.rightHand : c.equipped.leftHand
  if (!other) return false
  return getCard(other.cardId)?.slot === 'two-hand'
}

export function slotAcceptsCard(target: SlotTarget, card: EquipmentCard): boolean {
  if (target === 'armour') return card.slot === 'armour'
  return isWeapon(card)
}

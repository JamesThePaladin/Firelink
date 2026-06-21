import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { getCard, getClass, startingEquipmentFor } from '../data'
import { isArmour, isTwoHanded } from '../lib/character'
import type { Character, EquippedItem } from '../types'

function emptyEquipped(): Character['equipped'] {
  return { armour: null, leftHand: null, rightHand: null, backup: [] }
}

function placeStartingEquipment(classId: string): Character['equipped'] {
  const eq = emptyEquipped()
  for (const id of startingEquipmentFor(classId)) {
    const card = getCard(id)
    if (!card) continue
    const item: EquippedItem = { cardId: id, upgrades: [] }
    if (isArmour(card)) {
      eq.armour = item
    } else if (isTwoHanded(card) && !eq.leftHand && !eq.rightHand) {
      // Two-handed: takes both hands.
      eq.leftHand = item
    } else if (!eq.leftHand) {
      eq.leftHand = item
    } else if (!eq.rightHand && !isTwoHanded(getCard(eq.leftHand.cardId)!)) {
      eq.rightHand = item
    } else {
      eq.backup.push(item)
    }
  }
  return eq
}

export function makeCharacter(name: string, classId: string): Character {
  const cls = getClass(classId)
  if (!cls) throw new Error(`Unknown class: ${classId}`)
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: name.trim() || cls.name,
    classId,
    set: cls.sets[0],
    createdAt: now,
    updatedAt: now,
    stats: { str: 0, dex: 0, int: 0, fai: 0 },
    staminaCubes: 0,
    damageCubes: 0,
    souls: 0,
    tokens: { estus: 'full', luck: 'ready', heroic: 'ready', ember: 'none' },
    equipped: placeStartingEquipment(classId),
    notes: '',
  }
}

export async function addCharacter(c: Character): Promise<void> {
  await db.characters.add(c)
}

export async function saveCharacter(c: Character): Promise<void> {
  await db.characters.put({ ...c, updatedAt: Date.now() })
}

export async function deleteCharacter(id: string): Promise<void> {
  await db.characters.delete(id)
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  return db.characters.get(id)
}

export function useCharacters(): Character[] | undefined {
  return useLiveQuery(() => db.characters.orderBy('updatedAt').reverse().toArray())
}

// Returns `undefined` while loading, `null` when not found, else the character.
export function useCharacter(
  id: string | undefined,
): Character | null | undefined {
  return useLiveQuery(async () => {
    if (!id) return null
    return (await db.characters.get(id)) ?? null
  }, [id])
}

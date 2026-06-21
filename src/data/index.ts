import { CLASSES } from './classes'
import { EQUIPMENT, STARTING_EQUIPMENT } from './equipment'
import type { ClassBoard, EquipmentCard, StatKey, Tier } from '../types'

const classById = new Map(CLASSES.map((c) => [c.id, c]))
const equipById = new Map(EQUIPMENT.map((e) => [e.id, e]))

export function getClass(id: string): ClassBoard | undefined {
  return classById.get(id)
}

export function getCard(id: string): EquipmentCard | undefined {
  return equipById.get(id)
}

/** Card ids a class starts equipped with (from the sheet's Base Item flag). */
export function startingEquipmentFor(classId: string): string[] {
  return STARTING_EQUIPMENT[classId] ?? []
}

/** The stat value a class has for a given stat at a given tier. */
export function statValueAt(cls: ClassBoard, stat: StatKey, tier: Tier): number {
  return cls.statTiers[stat][tier]
}

export { CLASSES, EQUIPMENT, STARTING_EQUIPMENT }

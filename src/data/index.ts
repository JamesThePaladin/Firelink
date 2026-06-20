import { CLASSES } from './classes'
import { EQUIPMENT } from './equipment'
import type {
  ClassBoard,
  EquipmentCard,
  SetId,
  StatKey,
  Tier,
} from '../types'

const classById = new Map(CLASSES.map((c) => [c.id, c]))
const equipById = new Map(EQUIPMENT.map((e) => [e.id, e]))

export function getClass(id: string): ClassBoard | undefined {
  return classById.get(id)
}

export function getCard(id: string): EquipmentCard | undefined {
  return equipById.get(id)
}

export function classesForSets(sets: SetId[]): ClassBoard[] {
  const enabled = new Set(sets)
  return CLASSES.filter((c) => c.sets.some((s) => enabled.has(s)))
}

export function equipmentForSets(sets: SetId[]): EquipmentCard[] {
  const enabled = new Set(sets)
  return EQUIPMENT.filter((e) => e.sets.some((s) => enabled.has(s)))
}

/** The stat value a class has for a given stat at a given tier. */
export function statValueAt(cls: ClassBoard, stat: StatKey, tier: Tier): number {
  return cls.statTiers[stat][tier]
}

export { CLASSES, EQUIPMENT }

import type { SetId } from '../types'

export interface SetInfo {
  id: SetId
  name: string
  short: string
  /** Whether we have playable class-board data for this set. */
  hasClasses: boolean
}

export const SETS: Record<SetId, SetInfo> = {
  'sunless-city': { id: 'sunless-city', name: 'The Sunless City', short: 'Sunless City', hasClasses: true },
  'characters-expansion': { id: 'characters-expansion', name: 'Characters Expansion', short: 'Characters', hasClasses: true },
  core: { id: 'core', name: 'Core (2017)', short: 'Core', hasClasses: true },
  'painted-world': { id: 'painted-world', name: 'Painted World of Ariamis', short: 'Painted World', hasClasses: true },
  'tomb-of-giants': { id: 'tomb-of-giants', name: 'Tomb of Giants', short: 'Tomb of Giants', hasClasses: true },
  'iron-keep': { id: 'iron-keep', name: 'Iron Keep', short: 'Iron Keep', hasClasses: false },
  darkroot: { id: 'darkroot', name: 'Darkroot', short: 'Darkroot', hasClasses: false },
  explorers: { id: 'explorers', name: 'Explorers', short: 'Explorers', hasClasses: false },
  phantoms: { id: 'phantoms', name: 'Phantoms', short: 'Phantoms', hasClasses: false },
  'asylum-demon': { id: 'asylum-demon', name: 'Asylum Demon', short: 'Asylum Demon', hasClasses: false },
  chariot: { id: 'chariot', name: 'Executioner Chariot', short: 'Chariot', hasClasses: false },
  'four-kings': { id: 'four-kings', name: 'The Four Kings', short: 'Four Kings', hasClasses: false },
  'gaping-dragon': { id: 'gaping-dragon', name: 'Gaping Dragon', short: 'Gaping Dragon', hasClasses: false },
  'guardian-dragon': { id: 'guardian-dragon', name: 'Guardian Dragon', short: 'Guardian Dragon', hasClasses: false },
  kalameet: { id: 'kalameet', name: 'Black Dragon Kalameet', short: 'Kalameet', hasClasses: false },
  'last-giant': { id: 'last-giant', name: 'The Last Giant', short: 'Last Giant', hasClasses: false },
  manus: { id: 'manus', name: 'Manus, Father of the Abyss', short: 'Manus', hasClasses: false },
  'old-iron-king': { id: 'old-iron-king', name: 'The Old Iron King', short: 'Old Iron King', hasClasses: false },
  vordt: { id: 'vordt', name: 'Vordt of the Boreal Valley', short: 'Vordt', hasClasses: false },
}

export const ALL_SET_IDS: readonly SetId[] = Object.keys(SETS) as SetId[]

// Domain model for the Dark Souls: The Board Game character sheet.
// Per-character tracking. Equipment catalog covers all sets/boxes (multi-box);
// class boards exist only for sets we have physical board data for.

export type SetId =
  | 'sunless-city'
  | 'characters-expansion'
  | 'core'
  | 'painted-world'
  | 'tomb-of-giants'
  | 'iron-keep'
  | 'darkroot'
  | 'explorers'
  | 'phantoms'
  | 'asylum-demon'
  | 'chariot'
  | 'four-kings'
  | 'gaping-dragon'
  | 'guardian-dragon'
  | 'kalameet'
  | 'last-giant'
  | 'manus'
  | 'old-iron-king'
  | 'vordt'

// ---- Stats ---------------------------------------------------------------

export type StatKey = 'str' | 'dex' | 'int' | 'fai'

export const STAT_KEYS: readonly StatKey[] = ['str', 'dex', 'int', 'fai'] as const

export const STAT_LABELS: Record<StatKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  int: 'Intelligence',
  fai: 'Faith',
}

export const STAT_ABBR: Record<StatKey, string> = {
  str: 'STR',
  dex: 'DEX',
  int: 'INT',
  fai: 'FAI',
}

export type Tier = 0 | 1 | 2 | 3

// Soul cost to advance INTO each tier (index = target tier). Base costs nothing.
export const TIER_UP_COST: readonly number[] = [0, 2, 4, 8] as const

export type StatRequirement = Partial<Record<StatKey, number>>

// ---- Dice ----------------------------------------------------------------

export type DiceColor = 'black' | 'blue' | 'orange' | 'green'

export const ATTACK_DICE: readonly DiceColor[] = ['black', 'blue', 'orange'] as const

export type DicePool = Partial<Record<DiceColor, number>>

// ---- Equipment -----------------------------------------------------------

/**
 * What kind of card this is. Body-equippable: weapon/shield/spell (hand slots),
 * armour (armour slot). Attach into a gear item's upgrade slots: ring + upgrade
 * (gems/titanite). Ember is tracked but not yet slotted (TODO).
 */
export type ItemKind =
  | 'weapon'
  | 'shield'
  | 'spell'
  | 'armour'
  | 'ring'
  | 'upgrade'
  | 'ember'

/** Where a card is acquired from — drives rarity styling. */
export type ItemSource =
  | 'base'
  | 'transposed'
  | 'legendary'
  | 'mini-boss'
  | 'main-boss'
  | 'mega-boss'
  | 'invader'

/** Secondary on-hit / action effects pulled from the source sheet. */
export type EffectTag =
  | 'node'
  | 'bleed'
  | 'poison'
  | 'frost'
  | 'stagger'
  | 'push'
  | 'move'
  | 'buff'
  | 'shaft'
  | 'repeat'

/** Cards that attach into another item's upgrade slots. */
export const UPGRADE_KINDS: readonly ItemKind[] = ['ring', 'upgrade'] as const

/** Cards that occupy a hand slot. */
export const HAND_KINDS: readonly ItemKind[] = ['weapon', 'shield', 'spell'] as const

/** A defensive roll: a dice pool plus a flat modifier (block or resist). */
export interface DefenceRoll {
  dice: DicePool
  modifier?: number
}

/**
 * Defensive stats from the sheet's Defence section. Present on shields, armour,
 * and many weapons. Block reduces physical damage, resist reduces magic; dodge
 * is the number of green dodge dice the gear grants.
 */
export interface Defence {
  block?: DefenceRoll
  resist?: DefenceRoll
  dodge?: number
}

export interface ItemAction {
  /** Optional label (sheet has none; UI falls back to stamina + dice). */
  name?: string
  /** Stamina cost; omitted for free/passive actions. */
  stamina?: number
  dice: DicePool
  modifier?: number
  range?: number
  /** Magic (resisted) rather than physical (blocked) damage. */
  magic?: boolean
  /** Secondary effects (bleed, stagger, push, …). */
  effects?: EffectTag[]
  text?: string
}

export interface EquipmentCard {
  id: string
  name: string
  /** Boxes this card appears in. Shown when ANY is in the owned sets. */
  sets: SetId[]
  kind: ItemKind
  /** Hands occupied by hand-held gear (weapon/shield/spell). 2 = both hands. */
  hands?: 1 | 2
  /** Class-locked treasure. Omitted = usable by any class. */
  classId?: string
  /** Stat requirements to equip. */
  req?: StatRequirement
  /** Upgrade slots on this gear (equippable gear has 2). */
  upgradeSlots?: number
  source?: ItemSource
  /** Block / resist / dodge from the sheet's Defence section. */
  defence?: Defence
  /** Weapon attacks / spell casts / an armour "Defend" roll. */
  actions?: ItemAction[]
  /** Card effect text / special rules. */
  text?: string
  notes?: string
}

// ---- Class boards --------------------------------------------------------

export interface ClassBoard {
  id: string
  /** Boxes this class ships in; sets[0] is the display/primary set. */
  sets: SetId[]
  name: string
  blurb?: string
  statTiers: Record<StatKey, [number, number, number, number]>
  heroicAction: { name: string; text: string }
  taunt: number
  // Starting/default loadout lives in STARTING_EQUIPMENT (generated from the sheet),
  // keyed by class id — see src/data/equipment.ts.
}

// ---- Persisted character state ------------------------------------------

export type TokenReady = 'ready' | 'used'

export interface EquippedItem {
  cardId: string
  upgrades: string[]
}

export interface Character {
  id: string
  name: string
  classId: string
  set: SetId
  createdAt: number
  updatedAt: number

  stats: Record<StatKey, Tier>

  staminaCubes: number
  damageCubes: number

  souls: number

  tokens: {
    estus: 'full' | 'empty'
    luck: TokenReady
    heroic: TokenReady
    ember: 'present' | 'none'
  }

  equipped: {
    armour: EquippedItem | null
    leftHand: EquippedItem | null
    rightHand: EquippedItem | null
    backup: EquippedItem[]
  }

  notes: string
}

export const ENDURANCE_MAX = 10

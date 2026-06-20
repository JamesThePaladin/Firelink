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

export type EquipSlot =
  | 'armour'
  | 'one-hand'
  | 'two-hand'
  | 'weapon-upgrade'
  | 'armour-upgrade'

export interface ItemAction {
  /** Optional label (sheet has none; UI falls back to stamina + dice). */
  name?: string
  stamina: number
  dice: DicePool
  modifier?: number
  range?: number
  /** Magic (resisted) rather than physical (blocked) damage. */
  magic?: boolean
  /** For defensive actions: flat dodge value. */
  dodge?: number
  text?: string
}

export interface EquipmentCard {
  id: string
  name: string
  /** Boxes this card appears in. Shown when ANY is in the owned sets. */
  sets: SetId[]
  slot: EquipSlot
  /** Spell tool (catalyst/talisman/flame) — equips in a hand. */
  spell?: boolean
  /** Class-locked treasure. Omitted = usable by any class. */
  classId?: string
  range?: number
  /** Stat requirements — OPTIONAL; supplied from physical cards over time. */
  req?: StatRequirement
  /** Flat defensive values (when known). */
  block?: number
  resist?: number
  dodge?: number
  upgradeSlots?: number
  /** Weapon attacks / spell casts / an armour "Defend" roll. */
  actions?: ItemAction[]
  /** Card effect text / special rules. */
  text?: string
  legendary?: boolean
  transposed?: boolean
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
  startingEquipment: string[]
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

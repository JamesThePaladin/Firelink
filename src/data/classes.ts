import type { ClassBoard } from '../types'

// TODO(verify): NONE of the numbers/text below are confirmed yet.
//   - statTiers:    APPROXIMATE (close, not exact) — replace from character boards.
//   - heroicAction: placeholder text — replace from boards.
//   - taunt:        placeholder — replace from boards.
// Class identity, ids and set membership are settled. A class can ship in
// several boxes; sets[0] is the display set (ordered to the box you own).
// See DATA_TODO.md.

export const CLASSES: ClassBoard[] = [
  // ---- The Sunless City (also Original Core) ----
  {
    id: 'warrior',
    sets: ['sunless-city', 'core'],
    name: 'Warrior',
    blurb: 'A frontline brawler who trades finesse for raw strength and staying power.',
    statTiers: {
      str: [18, 24, 32, 40],
      dex: [12, 18, 26, 35],
      int: [10, 14, 20, 30],
      fai: [12, 18, 26, 35],
    },
    heroicAction: {
      name: 'Unyielding',
      text: 'Ignore all damage from the next enemy attack that targets you this encounter.',
    },
    taunt: 3,
    startingEquipment: [],
  },
  {
    id: 'herald',
    sets: ['sunless-city', 'core'],
    name: 'Herald',
    blurb: 'A martial healer balancing sword and miracle to sustain the party.',
    statTiers: {
      str: [14, 20, 28, 37],
      dex: [12, 18, 26, 34],
      int: [9, 14, 20, 29],
      fai: [16, 22, 30, 40],
    },
    heroicAction: {
      name: 'Lay On Hands',
      text: 'A character on your node or adjacent removes up to 3 red cubes from their endurance bar.',
    },
    taunt: 2,
    startingEquipment: [],
  },
  {
    id: 'pyromancer',
    sets: ['sunless-city', 'painted-world'],
    name: 'Pyromancer',
    blurb: 'Wields fire that punishes clustered foes from mid range.',
    statTiers: {
      str: [13, 19, 27, 36],
      dex: [13, 19, 27, 36],
      int: [13, 20, 29, 38],
      fai: [13, 20, 29, 38],
    },
    heroicAction: {
      name: 'Combustion',
      text: 'Deal 2 magic damage to every enemy on your node and adjacent nodes.',
    },
    taunt: 1,
    startingEquipment: [],
  },

  // ---- Characters Expansion ----
  {
    id: 'cleric',
    sets: ['characters-expansion', 'tomb-of-giants'],
    name: 'Cleric',
    blurb: 'Faithful support, calling on miracles to heal and to smite.',
    statTiers: {
      str: [14, 20, 28, 36],
      dex: [10, 15, 22, 30],
      int: [9, 13, 18, 28],
      fai: [17, 24, 32, 40],
    },
    heroicAction: {
      name: 'Divine Blessing',
      text: 'Every ally at range removes up to 2 red cubes from their endurance bar.',
    },
    taunt: 2,
    startingEquipment: [],
  },
  {
    id: 'sorcerer',
    sets: ['characters-expansion'],
    name: 'Sorcerer',
    blurb: 'Punishes foes from afar with potent soul magic.',
    statTiers: {
      str: [9, 14, 20, 28],
      dex: [13, 19, 27, 36],
      int: [18, 24, 32, 40],
      fai: [12, 16, 22, 30],
    },
    heroicAction: {
      name: 'Homing Soulmass',
      text: 'Deal 1 magic damage to each of up to 3 different enemies within range.',
    },
    taunt: 1,
    startingEquipment: [],
  },
  {
    id: 'mercenary',
    sets: ['characters-expansion'],
    name: 'Mercenary',
    blurb: 'A versatile sellsword whose twinblades chain into rapid strikes.',
    statTiers: {
      str: [13, 19, 27, 36],
      dex: [17, 24, 32, 40],
      int: [11, 16, 22, 31],
      fai: [11, 15, 21, 30],
    },
    heroicAction: {
      name: 'Onslaught',
      text: 'Make an extra weapon attack this turn without spending Stamina.',
    },
    taunt: 2,
    startingEquipment: [],
  },
  {
    id: 'thief',
    sets: ['characters-expansion'],
    name: 'Thief',
    blurb: 'Agile and skillful, deadly at range with a bow and nimble in melee.',
    statTiers: {
      str: [10, 15, 22, 30],
      dex: [18, 24, 32, 40],
      int: [12, 17, 24, 32],
      fai: [11, 15, 21, 30],
    },
    heroicAction: {
      name: 'Backstab',
      text: 'Your next attack this turn rolls one additional die of its highest type.',
    },
    taunt: 1,
    startingEquipment: [],
  },
  {
    id: 'deprived',
    sets: ['characters-expansion'],
    name: 'Deprived',
    blurb: 'Begins with nothing but wits and bravery — the only class that reaches Tier 3 evenly across all four stats.',
    statTiers: {
      str: [11, 18, 26, 35],
      dex: [11, 18, 26, 35],
      int: [11, 18, 26, 35],
      fai: [11, 18, 26, 35],
    },
    heroicAction: {
      name: 'Desperation',
      text: 'Gain 2 Stamina (remove 2 black cubes), then make a weapon attack.',
    },
    taunt: 1,
    startingEquipment: [],
  },

  // ---- Original Core Set ----
  {
    id: 'knight',
    sets: ['core'],
    name: 'Knight',
    blurb: 'A well-rounded defender, sturdy in plate and capable with most arms.',
    statTiers: {
      str: [16, 22, 30, 40],
      dex: [14, 20, 28, 35],
      int: [10, 15, 22, 30],
      fai: [12, 16, 22, 30],
    },
    heroicAction: {
      name: 'Stalwart',
      text: 'Until your next turn, reduce all damage you suffer by 1.',
    },
    taunt: 3,
    startingEquipment: [],
  },
  {
    id: 'assassin',
    sets: ['core'],
    name: 'Assassin',
    blurb: 'A nimble skirmisher mixing blades and sorcery to strike and slip away.',
    statTiers: {
      str: [12, 18, 25, 34],
      dex: [16, 24, 32, 40],
      int: [14, 20, 28, 36],
      fai: [10, 14, 20, 30],
    },
    heroicAction: {
      name: 'Shadow Strike',
      text: 'Move up to 2 nodes, then make a weapon attack that ignores the target’s block.',
    },
    taunt: 1,
    startingEquipment: [],
  },
]

import type { ClassBoard } from '../types'

// Stat tiers, Heroic Action text, and taunt below are transcribed from the
// physical class boards (Tabletop Sim captures, 2026-06-20). Stat values are the
// numbers printed on each board's Base/Tier 1/Tier 2/Tier 3 track.
// A class can ship in several boxes; sets[0] is the display set (ordered to the
// box you own). Starting kit lives in STARTING_EQUIPMENT (src/data/equipment.ts).
//
// Die-granting heroics: Warrior gains a black die, Pyromancer an orange die.
// (Sorcerer's Spell Fury grants infinite range, not a die.)

export const CLASSES: ClassBoard[] = [
  // ---- The Sunless City (also Original Core) ----
  {
    id: 'warrior',
    sets: ['sunless-city', 'core'],
    name: 'Warrior',
    blurb: 'A frontline brawler who trades finesse for raw strength and staying power.',
    statTiers: {
      str: [16, 23, 32, 40],
      dex: [9, 16, 25, 35],
      int: [8, 15, 23, 30],
      fai: [9, 16, 25, 35],
    },
    heroicAction: {
      name: 'Berserk Charge',
      text: 'Once per spark during his activation, the Warrior may move one node without spending Stamina. The next range 0 attack he makes costs 0 Stamina and gains 1 black die.',
    },
    taunt: 9,
  },
  {
    id: 'herald',
    sets: ['sunless-city', 'core'],
    name: 'Herald',
    blurb: 'A martial healer balancing sword and miracle to sustain the party.',
    statTiers: {
      str: [12, 19, 28, 37],
      dex: [11, 17, 26, 34],
      int: [8, 12, 20, 29],
      fai: [13, 22, 31, 40],
    },
    heroicAction: {
      name: 'Perseverance',
      text: 'Once per spark during his activation, the Herald may use Perseverance. When he does, each character gains 2 Stamina.',
    },
    taunt: 4,
  },
  {
    id: 'pyromancer',
    sets: ['sunless-city', 'painted-world'],
    name: 'Pyromancer',
    blurb: 'Wields fire that punishes clustered foes from mid range.',
    statTiers: {
      str: [12, 17, 26, 35],
      dex: [9, 13, 20, 27],
      int: [14, 21, 31, 40],
      fai: [14, 19, 28, 38],
    },
    heroicAction: {
      name: 'Explosive Firepower',
      text: 'Once per spark when the Pyromancer makes a magic attack, it gains 1 orange die.',
    },
    taunt: 6,
  },

  // ---- Characters Expansion ----
  {
    id: 'cleric',
    sets: ['characters-expansion', 'tomb-of-giants'],
    name: 'Cleric',
    blurb: 'Faithful support, calling on miracles to heal and to smite.',
    statTiers: {
      str: [12, 18, 27, 37],
      dex: [8, 15, 24, 33],
      int: [7, 14, 22, 30],
      fai: [16, 23, 32, 40],
    },
    heroicAction: {
      name: 'Keep the Faith',
      text: 'Once per spark during her activation, the Cleric may use Keep the Faith. When she does, each character within range 1 removes 2 red cubes from their endurance bar.',
    },
    taunt: 3,
  },
  {
    id: 'sorcerer',
    sets: ['characters-expansion'],
    name: 'Sorcerer',
    blurb: 'Punishes foes from afar with potent soul magic.',
    statTiers: {
      str: [7, 14, 22, 31],
      dex: [12, 18, 27, 36],
      int: [16, 23, 32, 40],
      fai: [7, 15, 24, 33],
    },
    heroicAction: {
      name: 'Spell Fury',
      text: 'Once per spark, when the Sorcerer makes a magic attack, it gains infinite range and its Stamina cost is reduced by 3.',
    },
    taunt: 5,
  },
  {
    id: 'mercenary',
    sets: ['characters-expansion'],
    name: 'Mercenary',
    blurb: 'A versatile sellsword whose twinblades chain into rapid strikes.',
    statTiers: {
      str: [10, 17, 26, 35],
      dex: [16, 22, 32, 40],
      int: [10, 17, 26, 35],
      fai: [8, 14, 21, 30],
    },
    heroicAction: {
      name: 'Rapid Strike',
      text: 'Once per spark during their activation, the Mercenary may make an attack that costs 0 Stamina even if they already used that Weapon during their activation.',
    },
    taunt: 7,
  },
  {
    id: 'thief',
    sets: ['characters-expansion'],
    name: 'Thief',
    blurb: 'Agile and skillful, deadly at range with a bow and nimble in melee.',
    statTiers: {
      str: [9, 16, 24, 33],
      dex: [13, 21, 31, 40],
      int: [10, 18, 27, 36],
      fai: [8, 15, 23, 31],
    },
    heroicAction: {
      name: 'Lucky Break',
      text: 'Once per spark during his activation, the Thief may use Lucky Break. When he does, he removes 2 black and 2 red cubes from his endurance bar and flips his Luck token to the ready side.',
    },
    taunt: 2,
  },
  {
    id: 'deprived',
    sets: ['characters-expansion'],
    name: 'Deprived',
    blurb: 'Begins with nothing but wits and bravery — the only class that reaches Tier 3 evenly across all four stats.',
    statTiers: {
      str: [10, 20, 30, 40],
      dex: [10, 20, 30, 40],
      int: [10, 20, 30, 40],
      fai: [10, 20, 30, 40],
    },
    heroicAction: {
      name: 'Combat Versatility',
      text: 'Once per spark at the start of his activation, the Deprived may change equipment as if he had visited Blacksmith Andre.',
    },
    taunt: 1,
  },

  // ---- Original Core Set ----
  {
    id: 'knight',
    sets: ['core'],
    name: 'Knight',
    blurb: 'A well-rounded defender, sturdy in plate and capable with most arms.',
    statTiers: {
      str: [13, 21, 30, 40],
      dex: [12, 19, 29, 38],
      int: [9, 15, 23, 31],
      fai: [9, 15, 23, 31],
    },
    heroicAction: {
      name: 'Stand Fast',
      text: 'Once per spark after making a block roll, the Knight may roll an additional blue die and add it to the roll.',
    },
    taunt: 10,
  },
  {
    id: 'assassin',
    sets: ['core'],
    name: 'Assassin',
    blurb: 'A nimble skirmisher mixing blades and sorcery to strike and slip away.',
    statTiers: {
      str: [10, 16, 25, 34],
      dex: [14, 22, 31, 40],
      int: [11, 18, 27, 36],
      fai: [9, 14, 22, 30],
    },
    heroicAction: {
      name: 'Backstab',
      text: 'Once per spark after making a successful dodge, the Assassin may attack the enemy he dodged. The attack does not cost Stamina but must have range to the enemy.',
    },
    taunt: 8,
  },
]

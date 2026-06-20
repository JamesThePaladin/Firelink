import type { DiceColor } from '../types'

// Each die has 6 faces; a face's value = number of success/damage symbols.
// Ranges are confirmed (black 0-2, blue 1-3 all-success, orange 1-4 all-success,
// green = dodge successes). The exact count of each face is a best-effort seed —
// >>> VERIFY against your physical dice and edit this one table if needed. <<<
export const DIE_FACES: Record<DiceColor, number[]> = {
  black: [0, 1, 1, 1, 2, 2], // confirmed (Mathog sheet: min0/max2/avg1.2)
  blue: [1, 1, 2, 2, 2, 3], // confirmed (min1/max3/avg1.8)
  orange: [1, 2, 2, 3, 3, 4], // confirmed (min1/max4/avg2.5)
  green: [0, 0, 1, 1, 1, 2], // TODO(verify): dodge die guess — not in sheet; confirm from physical die
}

export const DIE_LABEL: Record<DiceColor, string> = {
  black: 'Black',
  blue: 'Blue',
  orange: 'Orange',
  green: 'Dodge',
}

// Display colours for dice chips.
export const DIE_STYLE: Record<DiceColor, { bg: string; fg: string; ring: string }> = {
  black: { bg: '#1c1c1c', fg: '#e8e8e8', ring: '#444' },
  blue: { bg: '#1e3a6b', fg: '#dce8ff', ring: '#3f6bb5' },
  orange: { bg: '#b3501f', fg: '#fff3e6', ring: '#e8893f' },
  green: { bg: '#22582f', fg: '#dcffe2', ring: '#3f9357' },
}

export function rollDie(color: DiceColor): number {
  const faces = DIE_FACES[color]
  return faces[Math.floor(Math.random() * faces.length)]
}

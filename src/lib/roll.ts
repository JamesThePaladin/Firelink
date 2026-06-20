import type { DiceColor, DicePool } from '../types'
import { ATTACK_DICE, STAT_KEYS } from '../types'
import { rollDie, DIE_LABEL } from '../data/dice'

export interface DieResult {
  color: DiceColor
  value: number
}

export interface RollResult {
  dice: DieResult[]
  modifier: number
  /** Raw sum of all dice faces. */
  sum: number
  /** Sum + modifier, floored at 0. */
  total: number
}

export function rollPool(pool: DicePool, modifier = 0): RollResult {
  const dice: DieResult[] = []
  const colors: DiceColor[] = [...ATTACK_DICE, 'green']
  for (const color of colors) {
    const n = pool[color] ?? 0
    for (let i = 0; i < n; i++) {
      dice.push({ color, value: rollDie(color) })
    }
  }
  const sum = dice.reduce((acc, d) => acc + d.value, 0)
  const total = Math.max(0, sum + modifier)
  return { dice, modifier, sum, total }
}

export function poolSize(pool: DicePool): number {
  return ([...ATTACK_DICE, 'green'] as DiceColor[]).reduce(
    (acc, c) => acc + (pool[c] ?? 0),
    0,
  )
}

export function poolLabel(pool: DicePool): string {
  const parts: string[] = []
  for (const c of [...ATTACK_DICE, 'green'] as DiceColor[]) {
    const n = pool[c] ?? 0
    if (n > 0) parts.push(`${n} ${DIE_LABEL[c]}`)
  }
  return parts.length ? parts.join(' + ') : 'no dice'
}

// Re-exported convenience so callers don't reach into types just for keys.
export { STAT_KEYS }

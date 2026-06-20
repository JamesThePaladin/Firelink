import type { Character } from '../types'
import { ENDURANCE_MAX } from '../types'

interface Props {
  character: Character
  update: (mut: (draft: Character) => void) => void
}

/**
 * 10-box endurance bar. Black (stamina) fills from the left, red (damage) from
 * the right. When all 10 are filled the character is dead. Estus clears all.
 */
export default function EnduranceBar({ character, update }: Props) {
  const { staminaCubes, damageCubes } = character
  const filled = staminaCubes + damageCubes
  const dead = filled >= ENDURANCE_MAX
  const free = ENDURANCE_MAX - filled

  const boxes = Array.from({ length: ENDURANCE_MAX }, (_, i) => {
    if (i < staminaCubes) return 'stamina'
    if (i >= ENDURANCE_MAX - damageCubes) return 'damage'
    return 'empty'
  })

  const addStamina = (n: number) =>
    update((d) => {
      d.staminaCubes = Math.max(
        0,
        Math.min(d.staminaCubes + n, ENDURANCE_MAX - d.damageCubes),
      )
    })
  const addDamage = (n: number) =>
    update((d) => {
      d.damageCubes = Math.max(
        0,
        Math.min(d.damageCubes + n, ENDURANCE_MAX - d.staminaCubes),
      )
    })
  const estus = () =>
    update((d) => {
      if (d.tokens.estus !== 'full') return
      d.staminaCubes = 0
      d.damageCubes = 0
      d.tokens.estus = 'empty'
    })

  return (
    <section className="rounded-lg border border-ash-700 bg-ash-850 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-serif text-soul-400">Endurance</h2>
        {dead ? (
          <span className="font-serif text-sm text-blood-500">YOU DIED</span>
        ) : (
          <span className="text-xs text-ash-500">{free} free</span>
        )}
      </div>

      <div className="mb-3 flex gap-1">
        {boxes.map((kind, i) => (
          <div
            key={i}
            className={`h-9 flex-1 rounded-sm border ${
              kind === 'stamina'
                ? 'border-ash-500 bg-ash-300'
                : kind === 'damage'
                  ? 'border-blood-500 bg-blood-600'
                  : 'border-ash-700 bg-ash-900'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Counter
          label="Stamina"
          value={staminaCubes}
          color="text-ash-200"
          onMinus={() => addStamina(-1)}
          onPlus={() => addStamina(1)}
          disablePlus={free <= 0}
        />
        <Counter
          label="Damage"
          value={damageCubes}
          color="text-blood-500"
          onMinus={() => addDamage(-1)}
          onPlus={() => addDamage(1)}
          disablePlus={free <= 0}
        />
      </div>

      <button
        onClick={estus}
        disabled={character.tokens.estus !== 'full'}
        className="mt-2 w-full rounded-md border border-ember-600/50 bg-ash-800 py-2 text-sm text-ember-400 disabled:opacity-30 active:bg-ash-700"
      >
        🔥 Drink Estus — clear all cubes
      </button>
    </section>
  )
}

function Counter({
  label,
  value,
  color,
  onMinus,
  onPlus,
  disablePlus,
}: {
  label: string
  value: number
  color: string
  onMinus: () => void
  onPlus: () => void
  disablePlus?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-ash-700 bg-ash-900 p-1">
      <button
        onClick={onMinus}
        className="h-9 w-9 rounded text-xl text-ash-300 active:bg-ash-800"
      >
        −
      </button>
      <div className="text-center">
        <div className={`font-serif text-lg ${color}`}>{value}</div>
        <div className="text-[10px] text-ash-500">{label}</div>
      </div>
      <button
        onClick={onPlus}
        disabled={disablePlus}
        className="h-9 w-9 rounded text-xl text-ash-300 disabled:opacity-30 active:bg-ash-800"
      >
        +
      </button>
    </div>
  )
}

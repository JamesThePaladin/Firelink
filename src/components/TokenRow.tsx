import type { Character, ClassBoard } from '../types'

interface Props {
  character: Character
  cls: ClassBoard
  update: (mut: (draft: Character) => void) => void
}

interface Chip {
  key: string
  label: string
  active: boolean
  activeText: string
  inactiveText: string
  onToggle: () => void
}

export default function TokenRow({ character, cls, update }: Props) {
  const t = character.tokens

  const chips: Chip[] = [
    {
      key: 'estus',
      label: 'Estus',
      active: t.estus === 'full',
      activeText: 'Full',
      inactiveText: 'Empty',
      onToggle: () =>
        update((d) => {
          d.tokens.estus = d.tokens.estus === 'full' ? 'empty' : 'full'
        }),
    },
    {
      key: 'luck',
      label: 'Luck',
      active: t.luck === 'ready',
      activeText: 'Ready',
      inactiveText: 'Used',
      onToggle: () =>
        update((d) => {
          d.tokens.luck = d.tokens.luck === 'ready' ? 'used' : 'ready'
        }),
    },
    {
      key: 'heroic',
      label: 'Heroic',
      active: t.heroic === 'ready',
      activeText: 'Ready',
      inactiveText: 'Used',
      onToggle: () =>
        update((d) => {
          d.tokens.heroic = d.tokens.heroic === 'ready' ? 'used' : 'ready'
        }),
    },
    {
      key: 'ember',
      label: 'Ember',
      active: t.ember === 'present',
      activeText: 'Lit',
      inactiveText: 'None',
      onToggle: () =>
        update((d) => {
          d.tokens.ember = d.tokens.ember === 'present' ? 'none' : 'present'
        }),
    },
  ]

  const rest = () =>
    update((d) => {
      d.tokens.estus = 'full'
      d.tokens.luck = 'ready'
      d.tokens.heroic = 'ready'
      d.staminaCubes = 0
      d.damageCubes = 0
    })

  return (
    <section className="rounded-lg border border-ash-700 bg-ash-850 p-3">
      <h2 className="mb-2 font-serif text-soul-400">Tokens</h2>
      <div className="grid grid-cols-4 gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            onClick={c.onToggle}
            className={`flex flex-col items-center rounded-md border py-2 ${
              c.active
                ? 'border-ember-500 bg-ember-600/15'
                : 'border-ash-700 bg-ash-900'
            }`}
          >
            <span
              className={`text-xs font-semibold ${
                c.active ? 'text-ember-400' : 'text-ash-500'
              }`}
            >
              {c.label}
            </span>
            <span className="text-[10px] text-ash-500">
              {c.active ? c.activeText : c.inactiveText}
            </span>
          </button>
        ))}
      </div>

      {/* Heroic Action detail */}
      <div className="mt-3 rounded-md border border-ash-700 bg-ash-900 p-2">
        <p className="font-serif text-sm text-ember-400">
          {cls.heroicAction.name}
          <span className="ml-2 text-[10px] text-ash-500">
            ({t.heroic === 'ready' ? 'available' : 'used'})
          </span>
        </p>
        <p className="mt-0.5 text-xs text-ash-400">{cls.heroicAction.text}</p>
      </div>

      <button
        onClick={rest}
        className="mt-3 w-full rounded-md border border-soul-500/40 bg-ash-800 py-2 text-sm text-soul-400 active:bg-ash-700"
      >
        🔥 Rest at Bonfire — refill Estus, ready Luck &amp; Heroic, clear cubes
      </button>
      <p className="mt-1 text-[10px] text-ash-600">
        (Ember is kept on rest; discard it manually only when defeated.)
      </p>
    </section>
  )
}

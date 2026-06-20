import type { Character, ClassBoard } from '../types'
import { STAT_KEYS, STAT_ABBR, STAT_LABELS, TIER_UP_COST } from '../types'

interface Props {
  character: Character
  cls: ClassBoard
  update: (mut: (draft: Character) => void) => void
}

const TIER_LABELS = ['Base', 'T1', 'T2', 'T3']

export default function StatTrack({ character, cls, update }: Props) {
  return (
    <section className="rounded-lg border border-ash-700 bg-ash-850 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-serif text-soul-400">Stats</h2>
        <span className="text-xs text-ash-500">tap a tier to set it</span>
      </div>
      <div className="flex flex-col gap-3">
        {STAT_KEYS.map((stat) => {
          const tier = character.stats[stat]
          return (
            <div key={stat} className="flex items-center gap-2">
              <div className="w-10 flex-none">
                <div className="font-serif text-soul-400">{STAT_ABBR[stat]}</div>
                <div className="text-[10px] text-ash-600">{STAT_LABELS[stat]}</div>
              </div>
              <div className="flex flex-1 gap-1">
                {([0, 1, 2, 3] as const).map((t) => {
                  const active = t === tier
                  const reached = t <= tier
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        update((d) => {
                          if (t === d.stats[stat]) return
                          if (t > d.stats[stat]) {
                            // Level up: pay each tier step we don't have souls? Pay only if affordable per-step total.
                            let total = 0
                            for (let s = d.stats[stat] + 1; s <= t; s++)
                              total += TIER_UP_COST[s]
                            if (d.souls < total) return
                            d.souls -= total
                          } else {
                            // Level down: refund spent souls.
                            let refund = 0
                            for (let s = t + 1; s <= d.stats[stat]; s++)
                              refund += TIER_UP_COST[s]
                            d.souls += refund
                          }
                          d.stats[stat] = t
                        })
                      }
                      className={`flex flex-1 flex-col items-center rounded border py-1.5 ${
                        active
                          ? 'border-ember-500 bg-ember-600/20'
                          : reached
                            ? 'border-ash-600 bg-ash-800'
                            : 'border-ash-700 bg-ash-900'
                      }`}
                    >
                      <span
                        className={`font-serif text-lg ${
                          reached ? 'text-soul-400' : 'text-ash-600'
                        }`}
                      >
                        {cls.statTiers[stat][t]}
                      </span>
                      <span className="text-[9px] text-ash-500">
                        {TIER_LABELS[t]}
                        {t > 0 && (
                          <span className="text-ash-600"> ·{TIER_UP_COST[t]}</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-[11px] text-ash-600">
        Leveling spends souls (2 / 4 / 8). Lowering a tier refunds them.
      </p>
    </section>
  )
}

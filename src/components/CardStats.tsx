import type { EquipmentCard, ItemKind, StatKey } from '../types'
import { STAT_KEYS, STAT_ABBR } from '../types'
import { poolLabel } from '../lib/roll'

interface Props {
  card: EquipmentCard
  statValues?: Record<StatKey, number>
  compact?: boolean
}

const KIND_LABEL: Record<ItemKind, string> = {
  weapon: 'Weapon',
  shield: 'Shield',
  spell: 'Spell',
  armour: 'Armour',
  ring: 'Ring',
  upgrade: 'Upgrade',
  ember: 'Ember',
}

function kindLabel(card: EquipmentCard): string {
  const base = KIND_LABEL[card.kind]
  if (card.hands) return `${card.hands === 2 ? 'Two' : 'One'}-handed ${base}`
  return base
}

export default function CardStats({ card, statValues, compact }: Props) {
  const reqEntries = STAT_KEYS.filter((k) => (card.req?.[k] ?? 0) > 0)

  return (
    <div className="text-sm">
      {!compact && (
        <div className="mb-1 flex items-center justify-between">
          <span className="font-serif text-soul-400">{card.name}</span>
          <span className="text-[10px] uppercase tracking-wide text-ash-500">
            {kindLabel(card)}
          </span>
        </div>
      )}

      {card.source && card.source !== 'base' && (
        <div className="text-xs text-ember-400">{card.source}</div>
      )}

      {reqEntries.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
          <span className="text-ash-500">Requires</span>
          {reqEntries.map((k) => {
            const need = card.req?.[k] ?? 0
            const have = statValues?.[k]
            const unmet = have != null && have < need
            return (
              <span
                key={k}
                className={unmet ? 'text-blood-500' : 'text-soul-400'}
              >
                {STAT_ABBR[k]} {need}
                {unmet && have != null ? ` (have ${have})` : ''}
              </span>
            )
          })}
        </div>
      )}

      {card.actions?.map((a, i) => {
        const dice = poolLabel(a.dice)
        const label = a.name ?? (a.stamina != null ? `${a.stamina} ST` : 'Passive')
        return (
          <div
            key={i}
            className="mt-1 rounded border border-ash-700 bg-ash-850 px-2 py-1 text-xs"
          >
            <span className="text-ember-400">{label}</span>
            {a.name && a.stamina != null && (
              <span className="text-ash-500"> · {a.stamina} ST</span>
            )}
            {dice && (
              <>
                <span className="text-ash-500"> · </span>
                <span className="text-ash-300">{dice}</span>
              </>
            )}
            {a.modifier ? (
              <span className="text-ash-300">
                {' '}
                {a.modifier > 0 ? `+${a.modifier}` : a.modifier}
              </span>
            ) : null}
            {a.range != null && <span className="text-ash-500"> · rng {a.range}</span>}
            {a.magic && <span className="text-blue-400"> · magic</span>}
            {a.effects && a.effects.length > 0 && (
              <span className="text-soul-500"> · {a.effects.join(', ')}</span>
            )}
          </div>
        )
      })}

      {card.text && !compact && (
        <p className="mt-1 text-xs text-ash-400">{card.text}</p>
      )}
    </div>
  )
}

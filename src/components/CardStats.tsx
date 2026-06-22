import type { DefenceRoll, EquipmentCard, ItemKind, StatKey } from '../types'
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

/** "1 blue +1" — dice pool plus a flat modifier, either of which may be absent. */
function defenceLabel(r: DefenceRoll): string {
  const hasDice = Object.values(r.dice).some((n) => (n ?? 0) > 0)
  const mod = r.modifier
    ? r.modifier > 0
      ? `+${r.modifier}`
      : `${r.modifier}`
    : ''
  return [hasDice ? poolLabel(r.dice) : '', mod].filter(Boolean).join(' ') || '—'
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

      {card.defence && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
          {card.defence.block && (
            <span>
              <span className="text-ash-500">Block </span>
              <span className="text-soul-300">
                {defenceLabel(card.defence.block)}
              </span>
            </span>
          )}
          {card.defence.resist && (
            <span>
              <span className="text-ash-500">Resist </span>
              <span className="text-blue-300">
                {defenceLabel(card.defence.resist)}
              </span>
            </span>
          )}
          {card.defence.dodge != null && (
            <span>
              <span className="text-ash-500">Dodge </span>
              <span className="text-green-300">{card.defence.dodge} green</span>
            </span>
          )}
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
        <div className="mt-2 whitespace-pre-line rounded border border-ash-700 bg-ash-900 p-2 text-xs leading-snug text-ash-300">
          {card.text}
        </div>
      )}
    </div>
  )
}

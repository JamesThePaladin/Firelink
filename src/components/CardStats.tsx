import type { EquipmentCard, StatKey } from '../types'
import { STAT_KEYS, STAT_ABBR } from '../types'
import { poolLabel } from '../lib/roll'

interface Props {
  card: EquipmentCard
  statValues?: Record<StatKey, number>
  compact?: boolean
}

const SLOT_LABEL: Record<EquipmentCard['slot'], string> = {
  armour: 'Armour',
  'one-hand': 'One-handed',
  'two-hand': 'Two-handed',
  'weapon-upgrade': 'Weapon upgrade',
  'armour-upgrade': 'Armour upgrade',
}

export default function CardStats({ card, statValues, compact }: Props) {
  const reqEntries = STAT_KEYS.filter((k) => (card.req?.[k] ?? 0) > 0)

  return (
    <div className="text-sm">
      {!compact && (
        <div className="mb-1 flex items-center justify-between">
          <span className="font-serif text-soul-400">{card.name}</span>
          <span className="text-[10px] uppercase tracking-wide text-ash-500">
            {SLOT_LABEL[card.slot]}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ash-400">
        {card.range != null && <span>Range {card.range}</span>}
        {card.block != null && card.block > 0 && <span>Block {card.block}</span>}
        {card.resist != null && card.resist > 0 && (
          <span>Resist {card.resist}</span>
        )}
        {card.dodge != null && card.dodge > 0 && <span>Dodge {card.dodge}</span>}
        {card.upgradeSlots != null && card.upgradeSlots > 0 && (
          <span>Upgrades {card.upgradeSlots}</span>
        )}
      </div>

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

      {card.actions?.map((a, i) => (
        <div
          key={i}
          className="mt-1 rounded border border-ash-700 bg-ash-850 px-2 py-1 text-xs"
        >
          <span className="text-ember-400">{a.name ?? `${a.stamina} ST`}</span>
          {a.name && <span className="text-ash-500"> · {a.stamina} ST</span>}
          <span className="text-ash-500"> · </span>
          <span className="text-ash-300">{poolLabel(a.dice)}</span>
          {a.modifier ? (
            <span className="text-ash-300">
              {' '}
              {a.modifier > 0 ? `+${a.modifier}` : a.modifier}
            </span>
          ) : null}
          {a.range != null && <span className="text-ash-500"> · rng {a.range}</span>}
          {a.magic && <span className="text-blue-400"> · magic</span>}
          {a.dodge != null && <span className="text-ash-500"> · dodge {a.dodge}</span>}
        </div>
      ))}

      {card.text && !compact && (
        <p className="mt-1 text-xs text-ash-400">{card.text}</p>
      )}
    </div>
  )
}

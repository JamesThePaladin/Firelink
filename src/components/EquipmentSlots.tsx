import { useMemo, useState } from 'react'
import type { Character, ClassBoard, EquippedItem } from '../types'
import { getCard, EQUIPMENT } from '../data'
import {
  currentStatValues,
  meetsRequirement,
  isUpgrade,
  isTwoHanded,
} from '../lib/character'
import Modal from './Modal'
import CardStats from './CardStats'
import {
  handBlockedBy,
  slotAcceptsCard,
  weaponCount,
  type SlotTarget,
} from './equipment-helpers'

interface Props {
  character: Character
  cls: ClassBoard
  update: (mut: (draft: Character) => void) => void
}

/** A concrete equip location: a slot, plus a backup index when target='backup'. */
type Target = { target: SlotTarget; index?: number }

const MAX_WEAPONS = 3

export default function EquipmentSlots({ character, cls, update }: Props) {
  const [picker, setPicker] = useState<Target | null>(null)
  const [upgradeFor, setUpgradeFor] = useState<Target | null>(null)
  const [detail, setDetail] = useState<Target | null>(null)
  const [swapFrom, setSwapFrom] = useState<Target | null>(null)
  const [query, setQuery] = useState('')
  const [upgradeQuery, setUpgradeQuery] = useState('')

  function itemForTarget(t: Target): EquippedItem | null {
    if (t.target === 'armour') return character.equipped.armour
    if (t.target === 'backup')
      return character.equipped.backup[t.index ?? -1] ?? null
    return character.equipped[t.target]
  }

  const statValues = useMemo(
    () => currentStatValues(character, cls),
    [character, cls],
  )
  const pool = EQUIPMENT

  function equip(t: Target, cardId: string) {
    update((d) => {
      const card = getCard(cardId)
      if (!card) return
      const item: EquippedItem = { cardId, upgrades: [] }
      if (t.target === 'armour') {
        d.equipped.armour = item
      } else if (t.target === 'backup') {
        if (t.index == null) d.equipped.backup.push(item)
        else d.equipped.backup[t.index] = item
      } else {
        if (isTwoHanded(card)) {
          const other = t.target === 'leftHand' ? 'rightHand' : 'leftHand'
          d.equipped[other] = null
        }
        d.equipped[t.target] = item
      }
    })
    setPicker(null)
    setQuery('')
  }

  function unequip(t: Target) {
    update((d) => {
      if (t.target === 'armour') d.equipped.armour = null
      else if (t.target === 'backup') d.equipped.backup.splice(t.index ?? 0, 1)
      else d.equipped[t.target] = null
    })
  }

  // Exchange the items at two locations (hand <-> hand, or backup <-> hand) so
  // you can move a backup weapon into a hand without rebuilding both slots.
  function swap(a: Target, b: Target) {
    update((d) => {
      const get = (t: Target): EquippedItem | null =>
        t.target === 'backup'
          ? d.equipped.backup[t.index ?? -1] ?? null
          : d.equipped[t.target as 'leftHand' | 'rightHand' | 'armour']
      const set = (t: Target, v: EquippedItem | null) => {
        if (t.target === 'backup') {
          if (v) d.equipped.backup[t.index ?? 0] = v
          else d.equipped.backup.splice(t.index ?? 0, 1)
        } else {
          d.equipped[t.target as 'leftHand' | 'rightHand' | 'armour'] = v
        }
      }
      const ia = get(a)
      const ib = get(b)
      set(a, ib)
      set(b, ia)
      // A two-handed weapon must occupy a hand alone: if one landed in a hand
      // while the other hand is full, bump the other hand's item to backup.
      for (const hand of ['leftHand', 'rightHand'] as const) {
        const it = d.equipped[hand]
        const card = it ? getCard(it.cardId) : null
        if (card && isTwoHanded(card)) {
          const other = hand === 'leftHand' ? 'rightHand' : 'leftHand'
          if (d.equipped[other]) {
            d.equipped.backup.push(d.equipped[other]!)
            d.equipped[other] = null
          }
        }
      }
    })
    setSwapFrom(null)
  }

  function mutateUpgrades(t: Target, fn: (cur: string[]) => string[]) {
    update((d) => {
      const it =
        t.target === 'armour'
          ? d.equipped.armour
          : t.target === 'backup'
            ? d.equipped.backup[t.index ?? -1]
            : d.equipped[t.target]
      if (it) it.upgrades = fn(it.upgrades)
    })
  }

  // Candidate cards for the equip picker: right slot, not an upgrade, not locked
  // to another class, meeting the search query.
  const candidates = useMemo(() => {
    if (!picker) return []
    const q = query.trim().toLowerCase()
    return pool.filter(
      (c) =>
        !isUpgrade(c) &&
        slotAcceptsCard(picker.target, c) &&
        (!c.classId || c.classId === character.classId) &&
        (q === '' || c.name.toLowerCase().includes(q)),
    )
  }, [picker, pool, query, character.classId])

  // Rings + gems/titanite that can attach into a gear item's upgrade slots.
  const upgradeCandidates = useMemo(() => {
    if (!upgradeFor) return []
    const q = upgradeQuery.trim().toLowerCase()
    return pool.filter(
      (c) =>
        isUpgrade(c) &&
        (!c.classId || c.classId === character.classId) &&
        (q === '' || c.name.toLowerCase().includes(q)),
    )
  }, [upgradeFor, pool, upgradeQuery, character.classId])

  // Where the swapFrom item is allowed to go. To keep index math simple we only
  // pair a backup item with the hand slots (and a hand with the other hand or a
  // backup item) — never backup<->backup.
  const swapTargets = useMemo(() => {
    if (!swapFrom) return []
    const list: { t: Target; label: string; item: EquippedItem | null }[] = []
    for (const [hand, label] of [
      ['leftHand', 'Left Hand'],
      ['rightHand', 'Right Hand'],
    ] as const) {
      if (swapFrom.target === hand) continue
      list.push({ t: { target: hand }, label, item: character.equipped[hand] })
    }
    if (swapFrom.target !== 'backup') {
      character.equipped.backup.forEach((it, i) =>
        list.push({ t: { target: 'backup', index: i }, label: `Backup ${i + 1}`, item: it }),
      )
    }
    return list
  }, [swapFrom, character])

  const panelProps = {
    statValues,
    onDetail: (t: Target) => setDetail(t),
    onSwap: (t: Target) => setSwapFrom(t),
    onChange: (t: Target) => setPicker(t),
    onUnequip: unequip,
    onAttach: (t: Target) => {
      setUpgradeQuery('')
      setUpgradeFor(t)
    },
    onRemoveUpgrade: (t: Target, i: number) =>
      mutateUpgrades(t, (cur) => cur.filter((_, idx) => idx !== i)),
  }

  const detailItem = detail ? itemForTarget(detail) : null
  const detailCard = detailItem ? getCard(detailItem.cardId) : null

  return (
    <section className="rounded-lg border border-ash-700 bg-ash-850 p-3">
      <h2 className="mb-2 font-serif text-soul-400">Equipment</h2>

      {character.equipped.armour ? (
        <EquippedPanel
          label="Armour"
          target={{ target: 'armour' }}
          item={character.equipped.armour}
          {...panelProps}
        />
      ) : (
        <EmptySlot label="Armour" onTap={() => setPicker({ target: 'armour' })} />
      )}

      <div className="grid grid-cols-2 gap-2">
        <HandSlot
          label="Left Hand"
          path="leftHand"
          character={character}
          panelProps={panelProps}
          onEquip={() => setPicker({ target: 'leftHand' })}
        />
        <HandSlot
          label="Right Hand"
          path="rightHand"
          character={character}
          panelProps={panelProps}
          onEquip={() => setPicker({ target: 'rightHand' })}
        />
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-ash-500">
            Backup ({weaponCount(character)}/{MAX_WEAPONS} hand items)
          </span>
          <button
            disabled={weaponCount(character) >= MAX_WEAPONS}
            onClick={() => setPicker({ target: 'backup' })}
            className="rounded border border-ash-700 px-2 py-0.5 text-xs text-ash-300 disabled:opacity-30 active:bg-ash-800"
          >
            + Add
          </button>
        </div>
        {character.equipped.backup.length === 0 && (
          <p className="text-xs text-ash-600">No backup items.</p>
        )}
        {character.equipped.backup.map((it, i) => (
          <EquippedPanel
            key={i}
            label={`Backup ${i + 1}`}
            target={{ target: 'backup', index: i }}
            item={it}
            {...panelProps}
          />
        ))}
      </div>

      {/* ---- Equip picker ---- */}
      {picker && (
        <Modal
          title="Equip"
          onClose={() => {
            setPicker(null)
            setQuery('')
          }}
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="mb-3 w-full rounded-lg border border-ash-700 bg-ash-850 px-3 py-2 text-soul-400 outline-none focus:border-ember-600"
          />
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-ash-600">{candidates.length} items</p>
            {candidates.slice(0, 60).map((c) => {
              const ok = meetsRequirement(c.req, statValues)
              return (
                <button
                  key={c.id}
                  disabled={!ok}
                  onClick={() => ok && equip(picker, c.id)}
                  className={`rounded-lg border p-2 text-left ${
                    ok
                      ? 'border-ash-700 bg-ash-850 active:bg-ash-800'
                      : 'cursor-not-allowed border-blood-600/40 bg-ash-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-soul-400">{c.name}</span>
                    {!ok && (
                      <span className="text-[10px] uppercase tracking-wide text-blood-500">
                        Requirements not met
                      </span>
                    )}
                  </div>
                  <CardStats card={c} statValues={statValues} compact />
                </button>
              )
            })}
            {candidates.length > 60 && (
              <p className="text-center text-xs text-ash-600">
                Showing 60 — refine your search.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ---- Upgrade picker ---- */}
      {upgradeFor && (
        <Modal title="Attach upgrade" onClose={() => setUpgradeFor(null)}>
          <input
            autoFocus
            value={upgradeQuery}
            onChange={(e) => setUpgradeQuery(e.target.value)}
            placeholder="Search rings / upgrades…"
            className="mb-3 w-full rounded-lg border border-ash-700 bg-ash-850 px-3 py-2 text-soul-400 outline-none focus:border-ember-600"
          />
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-ash-600">
              {upgradeCandidates.length} rings &amp; upgrades
            </p>
            {upgradeCandidates.length === 0 && (
              <p className="text-sm text-ash-500">No matching upgrade cards.</p>
            )}
            {upgradeCandidates.slice(0, 60).map((u) => {
              const ok = meetsRequirement(u.req, statValues)
              return (
                <button
                  key={u.id}
                  disabled={!ok}
                  onClick={() => {
                    if (!ok) return
                    mutateUpgrades(upgradeFor, (cur) => [...cur, u.id])
                    setUpgradeFor(null)
                  }}
                  className={`rounded-lg border p-2 text-left ${
                    ok
                      ? 'border-ash-700 bg-ash-850 active:bg-ash-800'
                      : 'cursor-not-allowed border-blood-600/40 bg-ash-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-soul-400">{u.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-ash-500">
                      {u.kind}
                    </span>
                  </div>
                  <CardStats card={u} statValues={statValues} compact />
                </button>
              )
            })}
            {upgradeCandidates.length > 60 && (
              <p className="text-center text-xs text-ash-600">
                Showing 60 — refine your search.
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* ---- Item detail ---- */}
      {detail && detailCard && detailItem && (
        <Modal title={detailCard.name} onClose={() => setDetail(null)}>
          <CardStats card={detailCard} statValues={statValues} />

          {(detailCard.upgradeSlots ?? 0) > 0 && (
            <div className="mt-3 border-t border-ash-700 pt-3">
              <p className="mb-1 text-xs text-ash-500">
                Upgrade slots ({detailItem.upgrades.length}/
                {detailCard.upgradeSlots})
              </p>
              {detailItem.upgrades.length === 0 && (
                <p className="text-xs text-ash-600">No upgrades attached.</p>
              )}
              {detailItem.upgrades.map((uid, i) => {
                const u = getCard(uid)
                return u ? (
                  <div
                    key={i}
                    className="mb-1 rounded border border-ember-600/40 bg-ash-850 p-2"
                  >
                    <div className="font-serif text-sm text-ember-300">
                      {u.name}
                    </div>
                    <CardStats card={u} statValues={statValues} compact />
                  </div>
                ) : null
              })}
            </div>
          )}
        </Modal>
      )}

      {/* ---- Swap chooser ---- */}
      {swapFrom &&
        (() => {
          const fromItem = itemForTarget(swapFrom)
          const fromCard = fromItem ? getCard(fromItem.cardId) : null
          return (
            <Modal
              title={`Swap ${fromCard?.name ?? 'item'} with…`}
              onClose={() => setSwapFrom(null)}
            >
              {swapTargets.length === 0 && (
                <p className="text-sm text-ash-500">Nowhere to swap to.</p>
              )}
              <div className="flex flex-col gap-2">
                {swapTargets.map(({ t, label, item }) => {
                  const c = item ? getCard(item.cardId) : null
                  return (
                    <button
                      key={`${t.target}-${t.index ?? ''}`}
                      onClick={() => swap(swapFrom, t)}
                      className="rounded-lg border border-ash-700 bg-ash-850 p-2 text-left active:bg-ash-800"
                    >
                      <div className="text-[10px] uppercase tracking-wide text-ash-500">
                        {label}
                      </div>
                      <div className="font-serif text-soul-400">
                        {c ? c.name : <span className="text-ash-600">Empty</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Modal>
          )
        })()}
    </section>
  )
}

interface PanelProps {
  statValues: Record<string, number>
  onDetail: (t: Target) => void
  onSwap: (t: Target) => void
  onChange: (t: Target) => void
  onUnequip: (t: Target) => void
  onAttach: (t: Target) => void
  onRemoveUpgrade: (t: Target, i: number) => void
}

function HandSlot({
  label,
  path,
  character,
  panelProps,
  onEquip,
}: {
  label: string
  path: 'leftHand' | 'rightHand'
  character: Character
  panelProps: PanelProps
  onEquip: () => void
}) {
  const item = character.equipped[path]
  const blocked = handBlockedBy(character, path, getCard)
  if (item)
    return (
      <EquippedPanel
        label={label}
        target={{ target: path }}
        item={item}
        {...panelProps}
      />
    )
  return (
    <EmptySlot
      label={label}
      blocked={blocked}
      onTap={blocked ? undefined : onEquip}
    />
  )
}

function EquippedPanel({
  label,
  target,
  item,
  statValues,
  onDetail,
  onSwap,
  onChange,
  onUnequip,
  onAttach,
  onRemoveUpgrade,
}: PanelProps & {
  label: string
  target: Target
  item: EquippedItem
}) {
  const card = getCard(item.cardId)
  if (!card)
    return (
      <div className="mb-2 rounded-lg border border-blood-600/40 bg-ash-900 p-2 text-xs text-blood-500">
        Unknown item: {item.cardId}
      </div>
    )
  const slots = card.upgradeSlots ?? 0
  const used = item.upgrades.length

  return (
    <div className="mb-2 rounded-lg border border-ash-600 bg-ash-800 p-2">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onDetail(target)}
          className="min-w-0 text-left active:opacity-70"
        >
          <div className="text-[10px] uppercase tracking-wide text-ash-500">
            {label}
            {card.hands === 2 && (
              <span className="text-ember-500"> · two-handed</span>
            )}
          </div>
          <div className="truncate font-serif text-soul-400 underline decoration-ash-600 decoration-dotted underline-offset-2">
            {card.name}
          </div>
        </button>
        <div className="flex flex-none gap-2 text-xs">
          {target.target !== 'armour' && (
            <button
              onClick={() => onSwap(target)}
              className="text-ash-400 active:text-ash-200"
            >
              Swap
            </button>
          )}
          <button
            onClick={() => onChange(target)}
            className="text-ash-400 active:text-ash-200"
          >
            Change
          </button>
          <button
            onClick={() => onUnequip(target)}
            className="text-blood-500 active:text-blood-400"
          >
            Unequip
          </button>
        </div>
      </div>

      <button
        onClick={() => onDetail(target)}
        className="mt-1 block w-full text-left active:opacity-70"
      >
        <CardStats card={card} statValues={statValues} compact />
      </button>

      {slots > 0 && (
        <div className="mt-2 border-t border-ash-700 pt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] text-ash-500">
              Upgrade slots ({used}/{slots})
            </span>
            {used < slots && (
              <button
                onClick={() => onAttach(target)}
                className="rounded border border-ash-700 px-2 py-0.5 text-[11px] text-ash-300 active:bg-ash-700"
              >
                + Attach
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: slots }).map((_, i) => {
              const uid = item.upgrades[i]
              const u = uid ? getCard(uid) : undefined
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded border px-2 py-1 ${
                    uid
                      ? 'border-ember-600/40 bg-ash-850'
                      : 'border-dashed border-ash-700 bg-ash-900'
                  }`}
                >
                  {uid ? (
                    <>
                      <span className="truncate text-xs text-ember-300">
                        {u?.name ?? uid}
                      </span>
                      <button
                        onClick={() => onRemoveUpgrade(target, i)}
                        className="flex-none text-[11px] text-blood-500 active:text-blood-400"
                      >
                        remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onAttach(target)}
                      className="w-full text-left text-[11px] text-ash-600 active:text-ash-400"
                    >
                      Empty slot — attach a ring or upgrade
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptySlot({
  label,
  blocked,
  onTap,
}: {
  label: string
  blocked?: boolean
  onTap?: () => void
}) {
  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      className={`mb-2 flex w-full items-center justify-between rounded-lg border p-2 text-left ${
        blocked
          ? 'border-ash-800 bg-ash-900 opacity-50'
          : 'border-dashed border-ash-700 bg-ash-900 active:bg-ash-850'
      }`}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-ash-500">
          {label}
        </div>
        <div className="truncate font-serif text-soul-400">
          {blocked ? 'Two-handed in use' : 'Empty'}
        </div>
      </div>
    </button>
  )
}

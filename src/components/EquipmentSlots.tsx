import { useMemo, useState } from 'react'
import type { Character, ClassBoard, EquippedItem, SetId } from '../types'
import { getCard, equipmentForSets } from '../data'
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
  ownedSets: SetId[]
  update: (mut: (draft: Character) => void) => void
}

type Detail = { target: SlotTarget; index?: number }

const MAX_WEAPONS = 3

export default function EquipmentSlots({
  character,
  cls,
  ownedSets,
  update,
}: Props) {
  const [picker, setPicker] = useState<SlotTarget | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [upgradeFor, setUpgradeFor] = useState<Detail | null>(null)
  const [query, setQuery] = useState('')

  const statValues = useMemo(
    () => currentStatValues(character, cls),
    [character, cls],
  )
  const pool = useMemo(() => equipmentForSets(ownedSets), [ownedSets])

  function itemAt(d: Detail): EquippedItem | null {
    if (d.target === 'armour') return character.equipped.armour
    if (d.target === 'backup')
      return character.equipped.backup[d.index ?? -1] ?? null
    return character.equipped[d.target]
  }

  function equip(target: SlotTarget, cardId: string) {
    update((d) => {
      const card = getCard(cardId)
      if (!card) return
      const item: EquippedItem = { cardId, upgrades: [] }
      if (target === 'armour') {
        d.equipped.armour = item
      } else if (target === 'backup') {
        d.equipped.backup.push(item)
      } else {
        if (isTwoHanded(card)) {
          const other = target === 'leftHand' ? 'rightHand' : 'leftHand'
          d.equipped[other] = null
        }
        d.equipped[target] = item
      }
    })
    setPicker(null)
    setQuery('')
  }

  function unequip(d0: Detail) {
    update((d) => {
      if (d0.target === 'armour') d.equipped.armour = null
      else if (d0.target === 'backup') d.equipped.backup.splice(d0.index ?? 0, 1)
      else d.equipped[d0.target] = null
    })
    setDetail(null)
  }

  function setUpgrades(d0: Detail, upgrades: string[]) {
    update((d) => {
      const it =
        d0.target === 'armour'
          ? d.equipped.armour
          : d0.target === 'backup'
            ? d.equipped.backup[d0.index ?? -1]
            : d.equipped[d0.target]
      if (it) it.upgrades = upgrades
    })
  }

  // candidate cards for the active picker: right slot, not an upgrade,
  // not locked to a different class, matching the search query.
  const candidates = useMemo(() => {
    if (!picker) return []
    const q = query.trim().toLowerCase()
    return pool.filter(
      (c) =>
        !isUpgrade(c) &&
        slotAcceptsCard(picker, c) &&
        (!c.classId || c.classId === character.classId) &&
        (q === '' || c.name.toLowerCase().includes(q)),
    )
  }, [picker, pool, query, character.classId])

  const detailCard = detail ? getCard(itemAt(detail)?.cardId ?? '') : undefined
  // Rings + gems/titanite (upgrade-kind cards) attach into a gear item's slots.
  const upgradeCandidates = upgradeFor ? pool.filter(isUpgrade) : []

  return (
    <section className="rounded-lg border border-ash-700 bg-ash-850 p-3">
      <h2 className="mb-2 font-serif text-soul-400">Equipment</h2>

      <Slot
        label="Armour"
        item={character.equipped.armour}
        onTap={() =>
          character.equipped.armour
            ? setDetail({ target: 'armour' })
            : setPicker('armour')
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <Slot
          label="Left Hand"
          item={character.equipped.leftHand}
          blocked={handBlockedBy(character, 'leftHand', getCard)}
          onTap={() =>
            character.equipped.leftHand
              ? setDetail({ target: 'leftHand' })
              : setPicker('leftHand')
          }
        />
        <Slot
          label="Right Hand"
          item={character.equipped.rightHand}
          blocked={handBlockedBy(character, 'rightHand', getCard)}
          onTap={() =>
            character.equipped.rightHand
              ? setDetail({ target: 'rightHand' })
              : setPicker('rightHand')
          }
        />
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-ash-500">
            Backup ({weaponCount(character)}/{MAX_WEAPONS} weapons)
          </span>
          <button
            disabled={weaponCount(character) >= MAX_WEAPONS}
            onClick={() => setPicker('backup')}
            className="rounded border border-ash-700 px-2 py-0.5 text-xs text-ash-300 disabled:opacity-30 active:bg-ash-800"
          >
            + Add
          </button>
        </div>
        {character.equipped.backup.length === 0 && (
          <p className="text-xs text-ash-600">No backup weapons.</p>
        )}
        {character.equipped.backup.map((it, i) => (
          <BackupRow
            key={i}
            item={it}
            onTap={() => setDetail({ target: 'backup', index: i })}
          />
        ))}
      </div>

      {/* ---- Equip picker ---- */}
      {picker && (
        <Modal title="Equip" onClose={() => { setPicker(null); setQuery('') }}>
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
                    {!ok ? (
                      <span className="text-[10px] uppercase tracking-wide text-blood-500">
                        Requirements not met
                      </span>
                    ) : (
                      c.source &&
                      c.source !== 'base' && (
                        <span className="text-[10px] text-ember-400">{c.source}</span>
                      )
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

      {/* ---- Item detail ---- */}
      {detail && detailCard && (
        <Modal title={detailCard.name} onClose={() => setDetail(null)}>
          <CardStats card={detailCard} statValues={statValues} />

          {(detailCard.upgradeSlots ?? 0) > 0 && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-ash-500">
                  Upgrades ({itemAt(detail)?.upgrades.length ?? 0}/
                  {detailCard.upgradeSlots})
                </span>
                <button
                  disabled={
                    (itemAt(detail)?.upgrades.length ?? 0) >=
                    (detailCard.upgradeSlots ?? 0)
                  }
                  onClick={() => setUpgradeFor(detail)}
                  className="rounded border border-ash-700 px-2 py-0.5 text-xs text-ash-300 disabled:opacity-30 active:bg-ash-800"
                >
                  + Attach
                </button>
              </div>
              {itemAt(detail)?.upgrades.map((uid, i) => {
                const u = getCard(uid)
                return (
                  <div
                    key={i}
                    className="mb-1 flex items-center justify-between rounded border border-ash-700 bg-ash-850 px-2 py-1"
                  >
                    <span className="text-xs text-ash-300">{u?.name ?? uid}</span>
                    <button
                      onClick={() => {
                        const cur = itemAt(detail)?.upgrades ?? []
                        setUpgrades(
                          detail,
                          cur.filter((_, idx) => idx !== i),
                        )
                      }}
                      className="text-xs text-blood-500"
                    >
                      remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <button
            onClick={() => unequip(detail)}
            className="mt-4 w-full rounded-md border border-blood-600/50 bg-ash-800 py-2 text-sm text-blood-500 active:bg-ash-700"
          >
            Unequip
          </button>
        </Modal>
      )}

      {/* ---- Upgrade picker ---- */}
      {upgradeFor && (
        <Modal title="Attach upgrade" onClose={() => setUpgradeFor(null)}>
          <div className="flex flex-col gap-2">
            {upgradeCandidates.length === 0 && (
              <p className="text-sm text-ash-500">
                No upgrade cards in the catalog yet.
              </p>
            )}
            {upgradeCandidates.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  const cur = itemAt(upgradeFor)?.upgrades ?? []
                  setUpgrades(upgradeFor, [...cur, u.id])
                  setUpgradeFor(null)
                }}
                className="rounded-lg border border-ash-700 bg-ash-850 p-2 text-left active:bg-ash-800"
              >
                <span className="font-serif text-soul-400">{u.name}</span>
                {u.text && <p className="text-xs text-ash-400">{u.text}</p>}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </section>
  )
}

function Slot({
  label,
  item,
  blocked,
  onTap,
}: {
  label: string
  item: EquippedItem | null
  blocked?: boolean
  onTap: () => void
}) {
  const card = item ? getCard(item.cardId) : undefined
  return (
    <button
      onClick={onTap}
      disabled={blocked && !item}
      className={`mb-2 flex w-full items-center justify-between rounded-lg border p-2 text-left ${
        item
          ? 'border-ash-600 bg-ash-800'
          : blocked
            ? 'border-ash-800 bg-ash-900 opacity-50'
            : 'border-dashed border-ash-700 bg-ash-900 active:bg-ash-850'
      }`}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-ash-500">
          {label}
        </div>
        <div className="truncate font-serif text-soul-400">
          {card?.name ?? (blocked ? 'Two-handed in use' : 'Empty')}
        </div>
      </div>
      {item && item.upgrades.length > 0 && (
        <span className="text-[10px] text-ember-400">+{item.upgrades.length}</span>
      )}
    </button>
  )
}

function BackupRow({ item, onTap }: { item: EquippedItem; onTap: () => void }) {
  const card = getCard(item.cardId)
  return (
    <button
      onClick={onTap}
      className="mb-1 flex w-full items-center justify-between rounded border border-ash-700 bg-ash-900 px-2 py-1.5 text-left active:bg-ash-850"
    >
      <span className="truncate font-serif text-sm text-soul-400">
        {card?.name ?? item.cardId}
      </span>
      {item.upgrades.length > 0 && (
        <span className="text-[10px] text-ember-400">+{item.upgrades.length}</span>
      )}
    </button>
  )
}

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import StatTrack from '../components/StatTrack'
import EnduranceBar from '../components/EnduranceBar'
import TokenRow from '../components/TokenRow'
import EquipmentSlots from '../components/EquipmentSlots'
import DiceRoller from '../components/DiceRoller'
import Modal from '../components/Modal'
import {
  useCharacter,
  saveCharacter,
  deleteCharacter,
} from '../db/characters'
import { getClass } from '../data'
import { SETS } from '../data/sets'
import { useOwnedSets } from '../lib/settings'
import type { Character } from '../types'

export default function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const character = useCharacter(id)
  const { ownedSets } = useOwnedSets()
  const [rolling, setRolling] = useState(false)
  const [menu, setMenu] = useState(false)

  if (character === undefined) {
    return (
      <>
        <TopBar title="…" back onBack={() => navigate('/')} />
        <p className="p-6 text-center text-ash-500">Loading…</p>
      </>
    )
  }
  if (character === null) {
    return (
      <>
        <TopBar title="Not found" back onBack={() => navigate('/')} />
        <p className="p-6 text-center text-ash-500">Character not found.</p>
      </>
    )
  }

  const cls = getClass(character.classId)
  if (!cls) {
    return (
      <>
        <TopBar title={character.name} back onBack={() => navigate('/')} />
        <p className="p-6 text-center text-ash-500">
          Unknown class “{character.classId}”. Enable the matching set in Settings.
        </p>
      </>
    )
  }

  const update = (mut: (draft: Character) => void) => {
    const next = structuredClone(character)
    mut(next)
    void saveCharacter(next)
  }

  const setSouls = (n: number) =>
    update((d) => {
      d.souls = Math.max(0, n)
    })

  return (
    <>
      <TopBar
        title={character.name}
        subtitle={`${cls.name} · ${SETS[character.set]?.short} · Taunt ${cls.taunt}`}
        back
        onBack={() => navigate('/')}
        right={
          <button
            onClick={() => setMenu(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-ash-700 text-ash-300 active:bg-ash-800"
            aria-label="Menu"
          >
            ⋯
          </button>
        }
      />

      <main className="flex flex-1 flex-col gap-3 p-3 pb-24">
        {/* Souls */}
        <section className="flex items-center justify-between rounded-lg border border-soul-500/30 bg-ash-850 p-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-ash-500">
              Souls
            </div>
            <SoulsInput value={character.souls} onChange={setSouls} />
          </div>
          <div className="flex items-center gap-2">
            {[-1, +1, +3, +5].map((n) => (
              <button
                key={n}
                onClick={() => setSouls(character.souls + n)}
                className="h-9 min-w-9 rounded-md border border-ash-700 bg-ash-900 px-2 text-sm text-soul-400 active:bg-ash-800"
              >
                {n > 0 ? `+${n}` : n}
              </button>
            ))}
          </div>
        </section>

        <StatTrack character={character} cls={cls} update={update} />
        <EnduranceBar character={character} update={update} />
        <TokenRow character={character} cls={cls} update={update} />
        <EquipmentSlots
          character={character}
          cls={cls}
          ownedSets={ownedSets}
          update={update}
        />
      </main>

      {/* Dice FAB */}
      <button
        onClick={() => setRolling(true)}
        className="fixed bottom-5 right-5 z-30 flex h-16 w-16 items-center justify-center rounded-full border border-ember-400 bg-ember-600 text-2xl text-ash-950 shadow-lg shadow-black/50 active:bg-ember-500"
        aria-label="Roll dice"
      >
        🎲
      </button>

      {rolling && (
        <DiceRoller character={character} cls={cls} onClose={() => setRolling(false)} />
      )}

      {menu && (
        <CharacterMenu
          character={character}
          onRename={(name) =>
            update((d) => {
              d.name = name
            })
          }
          onDelete={async () => {
            await deleteCharacter(character.id)
            navigate('/', { replace: true })
          }}
          onClose={() => setMenu(false)}
        />
      )}
    </>
  )
}

function SoulsInput({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  // While focused we keep a free-text draft (so the field can be empty mid-edit);
  // when blurred it falls back to the live souls value (kept current by the buttons).
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <input
      inputMode="numeric"
      value={draft ?? String(value)}
      onFocus={(e) => {
        setDraft(String(value))
        e.target.select()
      }}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        const t = e.target.value.replace(/[^0-9]/g, '')
        setDraft(t)
        onChange(t === '' ? 0 : parseInt(t, 10))
      }}
      aria-label="Souls"
      className="w-24 bg-transparent font-serif text-2xl text-soul-400 outline-none"
    />
  )
}

function CharacterMenu({
  character,
  onRename,
  onDelete,
  onClose,
}: {
  character: Character
  onRename: (name: string) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(character.name)
  const [confirm, setConfirm] = useState(false)
  return (
    <Modal title="Character" onClose={onClose}>
      <label className="mb-1 block text-sm text-ash-400">Name</label>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-ash-700 bg-ash-850 px-3 py-2 text-soul-400 outline-none focus:border-ember-600"
        />
        <button
          onClick={() => {
            if (name.trim()) onRename(name.trim())
            onClose()
          }}
          className="rounded-lg bg-ember-600 px-4 font-serif text-ash-950 active:bg-ember-500"
        >
          Save
        </button>
      </div>

      <div className="mt-6 border-t border-ash-700 pt-4">
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="w-full rounded-md border border-blood-600/50 bg-ash-800 py-2 text-sm text-blood-500 active:bg-ash-700"
          >
            Delete character
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-ash-700 py-2 text-sm text-ash-300"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="flex-1 rounded-md bg-blood-600 py-2 text-sm text-ash-100"
            >
              Delete forever
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

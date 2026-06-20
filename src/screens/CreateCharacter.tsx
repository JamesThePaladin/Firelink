import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useOwnedSets } from '../lib/settings'
import { classesForSets } from '../data'
import { SETS } from '../data/sets'
import { addCharacter, makeCharacter } from '../db/characters'
import type { SetId } from '../types'

export default function CreateCharacter() {
  const { ownedSets } = useOwnedSets()
  const navigate = useNavigate()
  const [classId, setClassId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const classes = useMemo(() => classesForSets(ownedSets), [ownedSets])
  const grouped = useMemo(() => {
    const map = new Map<SetId, typeof classes>()
    for (const c of classes) {
      const key = c.sets[0]
      const arr = map.get(key) ?? []
      arr.push(c)
      map.set(key, arr)
    }
    return map
  }, [classes])

  const selected = classes.find((c) => c.id === classId)

  async function create() {
    if (!classId || busy) return
    setBusy(true)
    const c = makeCharacter(name, classId)
    await addCharacter(c)
    navigate(`/c/${c.id}`, { replace: true })
  }

  return (
    <>
      <TopBar title="New Character" back />
      <main className="flex flex-1 flex-col gap-5 p-4">
        <section>
          <label className="mb-1 block text-sm text-ash-400">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ashen One"
            className="w-full rounded-lg border border-ash-700 bg-ash-850 px-3 py-3 text-soul-400 outline-none focus:border-ember-600"
          />
        </section>

        <section>
          <h2 className="mb-2 font-serif text-soul-400">Choose a class</h2>
          {[...grouped.entries()].map(([set, list]) => (
            <div key={set} className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-ash-500">
                {SETS[set].name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {list.map((c) => {
                  const on = c.id === classId
                  return (
                    <button
                      key={c.id}
                      onClick={() => setClassId(c.id)}
                      className={`rounded-lg border p-3 text-left ${
                        on
                          ? 'border-ember-500 bg-ash-800'
                          : 'border-ash-700 bg-ash-900 active:bg-ash-850'
                      }`}
                    >
                      <div className="font-serif text-soul-400">{c.name}</div>
                      <div className="mt-1 text-[11px] leading-snug text-ash-500">
                        {c.blurb}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {selected && (
          <section className="rounded-lg border border-ash-700 bg-ash-900 p-3 text-sm">
            <p className="font-serif text-ember-400">
              {selected.heroicAction.name}
            </p>
            <p className="mt-1 text-ash-400">{selected.heroicAction.text}</p>
          </section>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-ash-700 bg-ash-900/95 p-3 backdrop-blur">
        <button
          disabled={!classId || busy}
          onClick={create}
          className="block w-full rounded-lg bg-ember-600 py-3 text-center font-serif text-lg font-semibold text-ash-950 disabled:opacity-40 active:bg-ember-500"
        >
          Kindle Character
        </button>
      </footer>
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { CLASSES } from '../data'
import { addCharacter, makeCharacter } from '../db/characters'

export default function CreateCharacter() {
  const navigate = useNavigate()
  const [classId, setClassId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  const selected = CLASSES.find((c) => c.id === classId)

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
          <div className="grid grid-cols-2 gap-2">
            {CLASSES.map((c) => {
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

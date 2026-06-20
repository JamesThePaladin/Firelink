import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useCharacters } from '../db/characters'
import { getClass } from '../data'
import { SETS } from '../data/sets'

export default function Home() {
  const characters = useCharacters()
  const navigate = useNavigate()

  return (
    <>
      <TopBar
        title="Firelink"
        subtitle="Dark Souls — Character Sheets"
        right={
          <Link
            to="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-ash-700 text-ash-300 active:bg-ash-800"
            aria-label="Settings"
          >
            ⚙
          </Link>
        }
      />

      <main className="flex flex-1 flex-col gap-3 p-3">
        {characters === undefined && (
          <p className="mt-10 text-center text-ash-500">Loading…</p>
        )}

        {characters && characters.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="font-serif text-xl text-ash-400">No characters yet</p>
            <p className="max-w-xs text-sm text-ash-500">
              Kindle the first flame. Create a character to replace your paper board.
            </p>
          </div>
        )}

        {characters?.map((c) => {
          const cls = getClass(c.classId)
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/c/${c.id}`)}
              className="flex items-center gap-3 rounded-lg border border-ash-700 bg-ash-850 p-3 text-left active:bg-ash-800"
            >
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-md border border-ember-600/40 bg-ash-800 font-serif text-lg text-ember-400">
                {cls?.name.charAt(0) ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-serif text-lg text-soul-400">
                  {c.name}
                </div>
                <div className="truncate text-xs text-ash-400">
                  {cls?.name ?? c.classId} · {SETS[c.set]?.short}
                </div>
              </div>
              <span className="text-ash-600">›</span>
            </button>
          )
        })}
      </main>

      <footer className="sticky bottom-0 border-t border-ash-700 bg-ash-900/95 p-3 backdrop-blur">
        <Link
          to="/new"
          className="block rounded-lg bg-ember-600 py-3 text-center font-serif text-lg font-semibold text-ash-950 active:bg-ember-500"
        >
          + New Character
        </Link>
      </footer>
    </>
  )
}

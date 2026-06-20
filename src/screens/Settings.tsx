import TopBar from '../components/TopBar'
import { useOwnedSets } from '../lib/settings'
import { SETS, ALL_SET_IDS } from '../data/sets'

export default function Settings() {
  const { isOwned, toggleSet, ownedSets } = useOwnedSets()

  return (
    <>
      <TopBar title="Settings" back />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <section>
          <h2 className="mb-2 font-serif text-soul-400">Owned sets</h2>
          <p className="mb-3 text-sm text-ash-500">
            Enable the sets you own. Their classes and items become available when
            creating and equipping characters. You can mix freely across sets.
          </p>
          <div className="flex flex-col gap-2">
            {ALL_SET_IDS.map((id) => {
              const on = isOwned(id)
              const isLast = on && ownedSets.length === 1
              return (
                <button
                  key={id}
                  onClick={() => !isLast && toggleSet(id)}
                  className={`flex items-center justify-between rounded-lg border p-3 text-left ${
                    on
                      ? 'border-ember-600/50 bg-ash-800'
                      : 'border-ash-700 bg-ash-900'
                  }`}
                >
                  <span className="font-serif text-ash-300">{SETS[id].name}</span>
                  <span
                    className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${
                      on ? 'justify-end bg-ember-600' : 'justify-start bg-ash-600'
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full bg-ash-950" />
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-ash-600">
            At least one set must stay enabled.
          </p>
        </section>

        <section className="mt-4 rounded-lg border border-ash-700 bg-ash-900 p-3 text-xs text-ash-500">
          <p className="mb-1 font-semibold text-ash-400">About the data</p>
          <p>
            Class stats, Heroic Actions, equipment values and dice faces are
            best-effort seeds. Verify them against your physical components and
            correct any values — the app updates instantly.
          </p>
        </section>
      </main>
    </>
  )
}

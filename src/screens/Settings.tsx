import TopBar from '../components/TopBar'

export default function Settings() {
  return (
    <>
      <TopBar title="Settings" back />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <section className="rounded-lg border border-ash-700 bg-ash-900 p-3 text-xs text-ash-500">
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

import TopBar from '../components/TopBar'

const REPO_URL = 'https://github.com/JamesThePaladin/Firelink'
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1q76mS5wAMcfct8izvUsggbTJbezmfTuf_uPG5CPLsSc/edit'

export default function Settings() {
  return (
    <>
      <TopBar title="Settings" back />
      <main className="flex flex-1 flex-col gap-4 p-4">
        <section className="rounded-lg border border-ash-700 bg-ash-900 p-3 text-sm text-ash-400">
          <h2 className="mb-1 font-serif text-soul-400">About Firelink</h2>
          <p>
            A free, offline character sheet for <em>Dark Souls: The Board Game</em>,
            covering The Sunless City and the Characters Expansion. Everything is
            stored on this device — no account, nothing sent anywhere.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-ember-400 underline decoration-ember-600/50 underline-offset-2 active:text-ember-300"
          >
            View the project on GitHub →
          </a>
        </section>

        <section className="rounded-lg border border-ash-700 bg-ash-900 p-3 text-xs text-ash-500">
          <p className="mb-1 font-semibold text-ash-400">About the data</p>
          <p>
            Class stats, Heroic Actions, equipment values and dice faces are
            best-effort seeds. Verify them against your physical components and
            correct any values — the app updates instantly.
          </p>
          <p className="mt-2">
            The equipment catalog is built from the community{' '}
            <a
              href={SHEET_URL}
              target="_blank"
              rel="noreferrer"
              className="text-ember-400 underline decoration-ember-600/50 underline-offset-2 active:text-ember-300"
            >
              "Mathog" DS:TBG spreadsheet
            </a>{' '}
            — huge thanks to its authors for the meticulous data.
          </p>
        </section>
      </main>
    </>
  )
}

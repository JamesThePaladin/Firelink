# Hosting Firelink

Firelink is a **static PWA** — `npm run build` produces a `dist/` folder of plain
files (HTML/JS/CSS + a service worker). Any static web host can serve it; there's no
backend, database, or server code. It uses **HashRouter**, so it works on any subpath
without server rewrite rules, and `vite.config.ts` sets `base: './'` (relative paths),
so it runs from a subfolder too.

A PWA needs **HTTPS** for the service worker (offline install) to work. Every option
below provides HTTPS automatically. `localhost` is also treated as secure for testing.

---

## Option A — GitHub Pages (free, lives next to the code)

> ⚠️ **Private-repo caveat:** GitHub Pages on a **private** repo requires a paid plan
> (Pro/Team/Enterprise). On the **free** plan the repo must be **public** to use Pages.
> If you want to keep the repo private and free, use Option B instead.

### One-time setup
1. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Add the workflow below as `.github/workflows/deploy.yml`, commit, and push to `main`.
3. After it runs, your app is at `https://JamesThePaladin.github.io/Firelink/`.

Because `base` is `'./'`, the app already works under the `/Firelink/` subpath — no
config change needed.

### The workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Every push to `main` rebuilds and redeploys. (Add this file only once you've enabled
Pages, or the action will fail with a red ✗ until Pages is configured.)

---

## Option B — Netlify or Vercel (free, works with a private repo)

Both have generous free tiers and support **private** repos at no cost. Easiest path:

1. Sign in with GitHub, **Import** the `Firelink` repo.
2. Build settings (they usually auto-detect Vite):
   - **Build command:** `npm run build`
   - **Publish/output directory:** `dist`
3. Deploy. You get a `https://<name>.netlify.app` (or `.vercel.app`) URL with HTTPS,
   and it auto-redeploys on every push to `main`.

No-git alternative: run `npm run build` locally and **drag the `dist/` folder** onto
Netlify Drop (app.netlify.com/drop) — instant hosting, nothing else to configure.

---

## Option C — Any static host / self-host

`dist/` is just files. You can serve it with anything:

- **Cloudflare Pages / Firebase Hosting / GitHub Codespaces** — same idea: build, point
  at `dist/`.
- **Your own machine / Raspberry Pi (HTTPS):** `npm run build`, then serve `dist/` with
  nginx/Caddy. Caddy gives automatic HTTPS, which the PWA needs.
- **LAN testing only:** `npm run dev` and open the printed Network URL on your phone
  (same Wi-Fi). Service-worker offline install won't fully apply over plain-HTTP LAN, but
  it's fine for trying the app.

---

## Option D — Sideloaded APK via Capacitor (no host needed) — preferred

For infrequent use (≈monthly), standing up an HTTPS host just to launch the app is
overkill. Instead the app is wrapped with **[Capacitor](https://capacitorjs.com)**, which
**bundles the built `dist/` into a native Android APK** — fully offline, no server, no
Pages, nothing to maintain.

This is **already scaffolded** in the repo:

- `capacitor.config.ts` — `appId: com.firelink.app`, `appName: Firelink`, `webDir: dist`.
- `android/` — the native Android project (committed; build outputs are git-ignored).
- npm scripts: `cap:sync`, `android:open`, `android:apk`.

### One-time toolchain setup
Building the APK needs the **Android SDK** and a **compatible JDK**:

1. **JDK 21.** Capacitor 8 / Android Gradle Plugin target **JDK 21**. This machine has a
   newer JDK (26) which Gradle may reject — install a JDK 21 (e.g. Temurin 21) and point
   `JAVA_HOME` at it for the build.
2. **Android SDK.** Easiest is **Android Studio** (bundles the SDK + an emulator).
   Command-line only: install the **command-line tools**, then:
   ```bash
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   # accept licenses:
   sdkmanager --licenses
   ```
   Set `ANDROID_HOME` (e.g. `~/Android/Sdk`) and add `platform-tools` to `PATH`.

### Build the APK
On **this machine** the toolchain is already installed in user-space:
- JDK 21 → `~/.local/opt/jdk-21`
- Android SDK → `~/Android/Sdk` (build-tools 36.0.0, platform android-36, platform-tools)
- `android/local.properties` points Gradle at the SDK (git-ignored).

The system default JDK is 26 (too new for Gradle), so **export JDK 21 first**, then build:
```bash
export JAVA_HOME=~/.local/opt/jdk-21
export ANDROID_HOME=~/Android/Sdk
export PATH="$JAVA_HOME/bin:$PATH"
npm run android:apk
# = npm run build && cap sync android && cd android && ./gradlew assembleDebug
```
The debug APK lands at:
`android/app/build/outputs/apk/debug/app-debug.apk`

Copy it to your phone and open it to install (enable "install from unknown sources" once).
It runs fully offline — all data and assets are bundled. To rebuild after code changes,
re-export `JAVA_HOME` and run `npm run android:apk` again, then reinstall.

> A confirmed build (2026-06-20) produced a 4.2 MB debug APK — `com.firelink.app`,
> label "Firelink", targetSdk 36. Debug builds are auto-signed with the debug keystore,
> so they install without extra signing.

> Prefer Android Studio? `npm run android:open` opens the `android/` project; press Run, or
> **Build → Build Bundle(s)/APK(s) → Build APK(s)**.

**Optional — app icon:** the launcher currently uses Capacitor's default icon. To brand it,
generate icons from a source PNG with `@capacitor/assets`
(`npx @capacitor/assets generate --android`) and re-sync.

### Why not PWABuilder / Bubblewrap (TWA)?
They generate an Android package from a PWA, but a **TWA still points at a hosted HTTPS
URL**, so it wouldn't remove the host. Capacitor bundles the assets locally, which is the
whole point here.

---

## Installing on your phone (any option)

Open the hosted **HTTPS** URL in Chrome on Android → menu (⋮) → **Add to Home screen**.
It installs as a fullscreen app and works offline after the first load.

## Updating after a deploy
Change code → `git push` → (Pages/Netlify/Vercel rebuild automatically). On the phone,
the service worker auto-updates in the background; reopen the app once to pick up changes.

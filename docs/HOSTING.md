# Hosting & packaging Firelink

Firelink is a **static PWA** — `npm run build` produces a `dist/` folder of plain files
(HTML/JS/CSS + a service worker). Any static web host can serve it; there's no backend,
database, or server code. It uses **HashRouter** and `vite.config.ts` sets `base: './'`
(relative paths), so it runs from any domain or subfolder without rewrite rules.

A PWA needs **HTTPS** for the service worker (offline install) to work. Every hosted option
below provides HTTPS automatically; `localhost` is also treated as secure for testing.

---

## Option A — GitHub Pages (how the live app is deployed)

This repo already deploys to GitHub Pages on every push to `main`, via
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml). The result is the live
app linked from the README. Because `base` is `'./'`, it works under the `/Firelink/`
subpath with no extra config.

**To set this up on your own fork:**

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Keep (or copy) `.github/workflows/deploy.yml`. It builds the app and publishes `dist/`.
3. Push to `main`. After the Action finishes, your app is at
   `https://<your-username>.github.io/<repo>/`.

> GitHub Pages on a **private** repo needs a paid plan. On the free plan the repo must be
> **public** to use Pages — otherwise pick a host from Option B.

---

## Option B — Netlify or Vercel (free, works with private repos)

Both have generous free tiers and support private repos at no cost:

1. Sign in with GitHub and **import** the repo.
2. Build settings (usually auto-detected for Vite):
   - **Build command:** `npm run build`
   - **Publish/output directory:** `dist`
3. Deploy. You get an HTTPS `*.netlify.app` / `*.vercel.app` URL that auto-redeploys on
   every push to `main`.

No-git alternative: run `npm run build` locally and **drag the `dist/` folder** onto
[Netlify Drop](https://app.netlify.com/drop) — instant hosting, nothing to configure.

---

## Option C — Any static host / self-host

`dist/` is just files, so anything that serves static files works:

- **Cloudflare Pages / Firebase Hosting** — build, point at `dist/`.
- **Your own machine / Raspberry Pi:** `npm run build`, then serve `dist/` with nginx or
  **Caddy** (Caddy gives automatic HTTPS, which the PWA needs for offline install).
- **LAN testing only:** `npm run dev` and open the printed Network URL on your phone (same
  Wi-Fi). Offline install won't fully apply over plain-HTTP LAN, but it's fine for trying it.

---

## Option D — Sideloaded Android APK via Capacitor (no host needed)

If you'd rather not host anything, the app can be wrapped with
**[Capacitor](https://capacitorjs.com)**, which bundles the built `dist/` into a native
Android APK — fully offline, no server, nothing to maintain. This is already scaffolded:

- `capacitor.config.ts` — `appId: com.firelink.app`, `appName: Firelink`, `webDir: dist`.
- `android/` — the native Android project (committed; build outputs are git-ignored).
- npm scripts: `cap:sync`, `android:open`, `android:apk`.

### Toolchain

Building the APK needs the **Android SDK** and **JDK 21** (Capacitor 8 / the Android Gradle
Plugin target JDK 21; newer JDKs can fail Gradle's `jlink` step):

1. **JDK 21** — e.g. [Temurin 21](https://adoptium.net/temurin/releases/?version=21).
2. **Android SDK** — easiest via [Android Studio](https://developer.android.com/studio)
   (bundles the SDK + emulator). Command-line only:
   ```bash
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   sdkmanager --licenses
   ```
   Set `ANDROID_HOME` (e.g. `~/Android/Sdk`) and create `android/local.properties` with
   `sdk.dir=/path/to/Android/Sdk`.

If your system default JDK is newer than 21, point Gradle at a JDK 21 — either set
`JAVA_HOME` before building, or add `org.gradle.java.home=/path/to/jdk-21` to
`android/gradle.properties`.

### Build

```bash
npm run android:apk
# = npm run build && cap sync android && cd android && ./gradlew assembleDebug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it to your
phone and open it to install (enable "install from unknown sources" once). It runs fully
offline. Debug builds are auto-signed with the debug keystore, so they install without extra
signing. Prefer Android Studio? `npm run android:open` opens the project — **Build → Build
APK(s)**.

> **Why not PWABuilder / Bubblewrap (TWA)?** A TWA still points at a hosted HTTPS URL, so it
> wouldn't remove the host. Capacitor bundles the assets locally, which is the point here.

---

## Installing on your phone (any hosted option)

Open the HTTPS URL in Chrome on Android → menu (⋮) → **Add to Home screen**. It installs as
a fullscreen app and works offline after the first load.

## Updating after a deploy

Push to `main` → the host rebuilds automatically. On the phone, the service worker
auto-updates in the background; reopen the app once to pick up changes.

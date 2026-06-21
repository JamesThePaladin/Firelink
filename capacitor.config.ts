import type { CapacitorConfig } from '@capacitor/cli'

// Wraps the built PWA (dist/) into a native Android shell so the app can be
// sideloaded as an APK and run fully offline — no web host needed.
// Build flow: `npm run build` → `npx cap sync` → build the APK (see docs/HOSTING.md).
const config: CapacitorConfig = {
  appId: 'com.firelink.app',
  appName: 'Firelink',
  webDir: 'dist',
}

export default config

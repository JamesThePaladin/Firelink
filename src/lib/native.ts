import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'

/**
 * Native-only setup for the Capacitor Android shell. No-op on the web build.
 * Hides the status bar so the app runs fullscreen (the paper character board
 * never had a clock/notifications strip over it).
 */
export function initNative(): void {
  if (!Capacitor.isNativePlatform()) return
  // Don't let the webview draw under the bar, then hide it entirely.
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
  StatusBar.hide().catch(() => {})
}

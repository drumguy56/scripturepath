import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/

// Dev-only: index.html links /manifest.json, which Base44's hosting answers with
// a redirect to the app's generated manifest. Nothing in this repo serves that
// path, so the dev server would 403/fallback on it and log a console error on
// every load. Rather than proxying it (or shipping a public/manifest.json, which
// would override the platform's on publish), drop the tag from the dev HTML:
// nothing requests it, and the built output still links Base44's manifest.
function skipManifestInDev() {
  return {
    name: 'base44-skip-manifest-in-dev',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(/\s*<link[^>]*rel=["']manifest["'][^>]*>/i, '')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      base44({
        // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
        legacySDKImports: env.BASE44_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        analyticsTracker: true,
        visualEditAgent: true
      }),
      react(),
      skipManifestInDev(),
    ],
  }
})

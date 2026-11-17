import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Component tests only: they render the real pages against a mocked Base44
// client. The `@` alias comes from the Base44 Vite plugin in the app, so it is
// declared again here rather than pulling that plugin (and its dev server)
// into the test run.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    setupFiles: ['./src/test/setup.js'],
  },
});

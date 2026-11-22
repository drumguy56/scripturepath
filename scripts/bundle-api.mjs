// Bundles the Hono API into one self-contained ESM file for Vercel.
// Vercel's Node runtime cannot resolve the extensionless relative imports in server/,
// so the whole server/ tree is inlined here. Packages stay external and come from node_modules.
import { build } from 'esbuild';

await build({
  entryPoints: ['server/app.ts'],
  outfile: 'api/[...route].js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  logLevel: 'info',
});

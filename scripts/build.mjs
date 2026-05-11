import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = resolve(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await Promise.all([
  build({
    entryPoints: [resolve(root, 'src/background/index.ts')],
    bundle: true,
    outfile: resolve(dist, 'background.js'),
    target: 'chrome120'
  }),
  build({
    entryPoints: [resolve(root, 'src/content/index.ts')],
    bundle: true,
    outfile: resolve(dist, 'content.js'),
    target: 'chrome120'
  }),
  build({
    entryPoints: [resolve(root, 'src/popup/main.tsx')],
    bundle: true,
    outfile: resolve(dist, 'popup.js'),
    target: 'chrome120'
  })
]);

cpSync(resolve(root, 'src/popup/popup.html'), resolve(dist, 'popup.html'));

import { build } from 'esbuild';

build({
  entryPoints: ['server.ts'],
  outfile: 'dist/server.cjs',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  packages: 'bundle',
}).catch(() => process.exit(1));

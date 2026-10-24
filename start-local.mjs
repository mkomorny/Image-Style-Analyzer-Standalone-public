import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

process.env.NODE_ENV = 'production';

const serverPath = path.join(process.cwd(), 'dist', 'server.cjs');
if (!existsSync(serverPath)) {
  console.error('Build missing. Run: npm run build');
  process.exit(1);
}

const child = spawn(process.execPath, [serverPath], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
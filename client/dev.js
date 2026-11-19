import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDirectory = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(clientDirectory, 'package.json'));
const vitePackage = require.resolve('vite/package.json');
const vite = path.join(path.dirname(vitePackage), 'bin', 'vite.js');

const child = spawn(process.execPath, [vite, '--config', 'vite.config.js'], {
  cwd: clientDirectory,
  stdio: 'inherit',
  shell: false,
});

child.on('error', (error) => {
  console.error(`Could not start Vite: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
process.on('SIGINT', () => child.kill());
process.on('SIGTERM', () => child.kill());

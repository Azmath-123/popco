import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDirectory = path.join(root, 'client');
const require = createRequire(path.join(clientDirectory, 'package.json'));
const vitePackage = require.resolve('vite/package.json');
const viteCli = path.join(path.dirname(vitePackage), 'bin', 'vite.js');
const [command, ...args] = process.argv.slice(2);

const result = spawnSync(process.execPath, [viteCli, ...(command ? [command] : []), '--config', 'vite.config.js', ...args], {
  cwd: clientDirectory,
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.error(`Could not run Vite: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}

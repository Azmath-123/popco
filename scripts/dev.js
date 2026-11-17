import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDirectory = path.join(root, 'client');
const require = createRequire(path.join(clientDirectory, 'package.json'));
const vitePackage = require.resolve('vite/package.json');
const viteCli = path.join(path.dirname(vitePackage), 'bin', 'vite.js');
const processes = [
  {
    name: 'SERVER',
    cwd: path.join(root, 'server'),
    args: ['--watch', 'src/server.js'],
  },
  {
    name: 'CLIENT',
    cwd: clientDirectory,
    args: [viteCli, '--config', 'vite.config.js'],
  },
];

const children = processes.map(({ name, cwd, args }) => {
  const child = spawn(process.execPath, args, { cwd, stdio: 'inherit', shell: false });
  child.on('error', (error) => {
    console.error(`[${name}] ${error.message}`);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping && code !== 0) {
      console.error(`[${name}] stopped with exit code ${code ?? 'unknown'}`);
      stop(code || 1);
    }
  });
  return child;
});

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

import 'dotenv/config';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in server/.env.');

const directory = path.resolve(serverDir, process.env.BACKUP_DIRECTORY || 'backups');
await fs.mkdir(directory, { recursive: true });

const file = path.join(directory, `popco-${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}.dump`);
const child = spawn(process.env.PG_DUMP_PATH || 'pg_dump', [process.env.DATABASE_URL, '--format=custom', '--no-owner', '--file', file], { stdio: 'inherit', shell: false });

child.on('error', (error) => { console.error(`Backup failed: ${error.message}`); process.exitCode = 1; });
child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`pg_dump exited with code ${code}.`);
    process.exitCode = code || 1;
  } else {
    console.log(`Database backup written to ${file}`);
  }
});

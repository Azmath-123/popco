import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/database.js';

const directory = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const schema = await fs.readFile(path.join(directory, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('PostgreSQL schema is up to date.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runMigrations();
  await pool.end();
}

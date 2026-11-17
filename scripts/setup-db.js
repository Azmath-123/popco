import dotenv from 'dotenv';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, 'server', '.env') });

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in server/.env before creating the database.');

const targetUrl = new URL(process.env.DATABASE_URL);
const databaseName = decodeURIComponent(targetUrl.pathname.replace(/^\//, ''));
if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(databaseName)) {
  throw new Error('The database name in DATABASE_URL must use letters, numbers, and underscores.');
}
const adminUrl = new URL(targetUrl);
adminUrl.pathname = '/postgres';
const postgresPool = new Pool({ connectionString: adminUrl.toString() });

async function setup() {
  const check = await postgresPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
  if (check.rowCount === 0) {
    await postgresPool.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Database ${databaseName} created successfully.`);
  } else {
    console.log(`Database ${databaseName} already exists.`);
  }
  await postgresPool.end();
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});

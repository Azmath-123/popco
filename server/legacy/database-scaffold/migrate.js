// server/db/migrate.js
// Migration runner tracking applied migrations in schema_migrations

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pool, query } from '../src/config/db.js';
import logger from '../src/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

/**
 * Ensures schema_migrations tracking table exists.
 */
async function ensureMigrationTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

/**
 * Fetches all applied migration filenames.
 * @returns {Promise<Set<string>>}
 */
async function getAppliedMigrations() {
  const { rows } = await query('SELECT version FROM schema_migrations ORDER BY version ASC');
  return new Set(rows.map((r) => r.version));
}

/**
 * Runs all unapplied SQL migrations in alphanumeric order.
 * @returns {Promise<{ applied: string[], total: number }>}
 */
export async function runMigrations() {
  await ensureMigrationTable();
  const appliedSet = await getAppliedMigrations();

  let files;
  try {
    files = await fs.readdir(migrationsDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn(`Migrations directory not found at ${migrationsDir}`);
      return { applied: [], total: 0 };
    }
    throw err;
  }

  const sqlFiles = files
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const pendingFiles = sqlFiles.filter((file) => !appliedSet.has(file));

  if (pendingFiles.length === 0) {
    logger.info('PostgreSQL schema is up to date.');
    return { applied: [], total: sqlFiles.length };
  }

  const applied = [];

  for (const fileName of pendingFiles) {
    const filePath = path.join(migrationsDir, fileName);
    logger.info(`[MIGRATE] Applying migration: ${fileName}...`);
    const sql = await fs.readFile(filePath, 'utf8');

    const client = await pool.connect();
    try {
      // Execute the migration SQL
      await client.query(sql);

      // Record in schema_migrations
      await client.query(
        'INSERT INTO schema_migrations (version, applied_at) VALUES ($1, now()) ON CONFLICT (version) DO NOTHING',
        [fileName]
      );

      applied.push(fileName);
      logger.info(`[MIGRATE] Successfully applied migration: ${fileName}`);
    } catch (err) {
      logger.error(`[MIGRATE] Failed to apply migration: ${fileName}`, {
        error: err.message,
        detail: err.detail,
        position: err.position,
      });
      throw err;
    } finally {
      client.release();
    }
  }

  logger.info(`[MIGRATE] Applied ${applied.length} migration(s).`);
  return { applied, total: sqlFiles.length };
}

// CLI Execution handler
const isDirectExecution = process.argv[1] &&
  (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href ||
   process.argv[1].endsWith('migrate.js'));

if (isDirectExecution) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Migration failed:', err);
      try {
        await pool.end();
      } catch {
        // ignore cleanup error
      }
      process.exit(1);
    });
}

export default runMigrations;

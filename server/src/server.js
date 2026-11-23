import 'dotenv/config';
import app from './app.js';
import { pool } from './config/database.js';
import { runMigrations } from './database/migrate.js';
import { seedDefaults } from './database/seed.js';
import { startBackgroundJobs } from './jobs/notification.jobs.js';

const port = Number(process.env.PORT || 4000);

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. See .env.example.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Set JWT_SECRET to a random secret with at least 32 characters.');

await runMigrations();
await seedDefaults();

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`PopCo API listening on http://localhost:${port}`);
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) console.warn('ADMIN_EMAIL and ADMIN_PASSWORD are unset; no initial admin account was created.');
});

startBackgroundJobs();
pool.on('error', (error) => console.error(JSON.stringify({ event: 'postgres.pool_error', message: error.message })));

const shutdown = () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

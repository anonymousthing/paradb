import pg from 'pg';
import { getEnvVars } from 'services/env';

const db: { pool: pg.Pool | undefined } = { pool: undefined };

export async function initPool(maxConnections?: number) {
  // Test DB
  const envVars = getEnvVars();
  try {
    db.pool = new pg.Pool({
      host: envVars.pgHost,
      port: envVars.pgPort,
      database: envVars.pgDatabase,
      user: envVars.pgUser,
      password: envVars.pgPassword,
      min: maxConnections,
      max: maxConnections,
    });
    db.pool.on('error', (err) => console.error(err));

    // Quickly test connection to check that DB is running
    const client = await db.pool.connect();
    client.release();
  } catch (e) {
    throw new Error('Could not connect to database, is it running?');
  }

  return db.pool;
}

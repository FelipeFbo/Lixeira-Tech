import pg from 'pg';

try {
  process.loadEnvFile(new URL('./.env', import.meta.url));
} catch {
  // O arquivo .env é opcional; variáveis do sistema também são aceitas.
}

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const ssl = process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined;

export const pool = new Pool(
  connectionString
    ? { connectionString, ssl }
    : {
        host: process.env.PGHOST || '127.0.0.1',
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'lixeira_tech',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        ssl,
      },
);

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    matricula TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    class_name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    kiosk_code TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE users ADD COLUMN IF NOT EXISTS kiosk_code TEXT UNIQUE;
  UPDATE users
    SET kiosk_code = UPPER(SUBSTRING(REPLACE(id, '-', '') FROM 1 FOR 8))
    WHERE kiosk_code IS NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS users_name_normalized_idx ON users (LOWER(name));

  CREATE TABLE IF NOT EXISTS collection_bins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    capacity_pct INTEGER NOT NULL DEFAULT 0 CHECK (capacity_pct BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'maintenance', 'offline')),
    last_collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    weight_delta NUMERIC(10, 2) NOT NULL CHECK (weight_delta >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    points INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp_client TIMESTAMPTZ
  );

  ALTER TABLE deposits ADD COLUMN IF NOT EXISTS bin_id TEXT REFERENCES collection_bins(id) ON DELETE SET NULL;

  CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON deposits (user_id);
  CREATE INDEX IF NOT EXISTS deposits_status_created_at_idx ON deposits (status, created_at DESC);
  CREATE INDEX IF NOT EXISTS deposits_bin_id_idx ON deposits (bin_id);
`;

export async function initDatabase() {
  await pool.query(schema);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM collection_bins');
  if (rows[0].total === 0) {
    await pool.query(
      `INSERT INTO collection_bins (id, name, location, capacity_pct, status, last_collected_at)
       VALUES
         ('bin-centro', 'Lixeira Centro', 'Praça Central', 28, 'online', NOW() - INTERVAL '2 days'),
         ('bin-campus', 'Lixeira Campus', 'Universidade Municipal', 74, 'online', NOW() - INTERVAL '5 days'),
         ('bin-terminal', 'Lixeira Terminal', 'Terminal de Ônibus', 92, 'maintenance', NOW() - INTERVAL '8 days')`,
    );
  }
}

function toIso(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeUser(user) {
  return { ...user, points: Number(user.points), created_at: toIso(user.created_at) };
}

function normalizeBin(bin) {
  return {
    ...bin,
    capacity_pct: Number(bin.capacity_pct),
    last_collected_at: toIso(bin.last_collected_at),
    created_at: toIso(bin.created_at),
    updated_at: toIso(bin.updated_at),
  };
}

function normalizeDeposit(deposit) {
  return {
    ...deposit,
    quantity: Number(deposit.quantity),
    weight_delta: Number(deposit.weight_delta),
    points: Number(deposit.points),
    created_at: toIso(deposit.created_at),
    updated_at: toIso(deposit.updated_at),
    timestamp_client: toIso(deposit.timestamp_client),
  };
}

// Mantém a interface usada pelas rotas, mas a origem dos dados agora é PostgreSQL.
export async function readDB() {
  const [users, deposits, bins] = await Promise.all([
    pool.query('SELECT * FROM users'),
    pool.query('SELECT * FROM deposits'),
    pool.query('SELECT * FROM collection_bins'),
  ]);

  return {
    users: users.rows.map(normalizeUser),
    deposits: deposits.rows.map(normalizeDeposit),
    bins: bins.rows.map(normalizeBin),
  };
}

// As operações administrativas alteram o conjunto em memória e são persistidas
// em uma única transação, garantindo consistência entre pontos e depósitos.
export async function writeDB(db) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM deposits');
    await client.query('DELETE FROM collection_bins');
    await client.query('DELETE FROM users');

    for (const user of db.users) {
      await client.query(
        `INSERT INTO users (id, name, matricula, email, password_hash, class_name, points, kiosk_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [user.id, user.name, user.matricula || '', user.email, user.password_hash, user.class_name || user.name, Number(user.points) || 0, user.kiosk_code, user.created_at],
      );
    }

    for (const bin of db.bins || []) {
      await client.query(
        `INSERT INTO collection_bins (id, name, location, capacity_pct, status, last_collected_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [bin.id, bin.name, bin.location, Number(bin.capacity_pct) || 0, bin.status, bin.last_collected_at || null, bin.created_at, bin.updated_at || bin.created_at],
      );
    }

    for (const deposit of db.deposits) {
      await client.query(
        `INSERT INTO deposits
          (id, user_id, bin_id, item_type, quantity, weight_delta, status, points, description, created_at, updated_at, timestamp_client)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          deposit.id,
          deposit.user_id,
          deposit.bin_id || null,
          deposit.item_type,
          Number(deposit.quantity),
          Number(deposit.weight_delta),
          deposit.status,
          Number(deposit.points) || 0,
          deposit.description || '',
          deposit.created_at,
          deposit.updated_at || deposit.created_at,
          deposit.timestamp_client || deposit.created_at,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

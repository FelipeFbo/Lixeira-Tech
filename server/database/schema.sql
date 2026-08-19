CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  matricula TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  class_name TEXT NOT NULL,
  kiosk_code TEXT UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  bin_id TEXT REFERENCES collection_bins(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS deposits_user_id_idx ON deposits (user_id);
CREATE INDEX IF NOT EXISTS deposits_bin_id_idx ON deposits (bin_id);
CREATE INDEX IF NOT EXISTS deposits_status_created_at_idx ON deposits (status, created_at DESC);

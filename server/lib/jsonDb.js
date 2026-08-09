// lib/jsonDb.js
//
// "Banco de dados" em arquivo JSON, para rodar o projeto sem precisar
// instalar/configurar MySQL. Guarda tudo em server/database/db.json.
//
// Estrutura do arquivo:
// {
//   "users":    [{ id, name, matricula, email, password_hash, class_name, points, created_at }],
//   "deposits": [{ id, user_id, item_type, quantity, weight_delta, status, points, created_at, updated_at, timestamp_client }]
// }
//
// Quando quiserem migrar para um banco de verdade, só trocar as funções
// deste arquivo por queries reais — o index.js não precisa mudar.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database', 'db.json');

const EMPTY_DB = { users: [], deposits: [] };

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(EMPTY_DB, null, 2));
  }
}

export function readDB() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.deposits)) data.deposits = [];
    return data;
  } catch {
    return { ...EMPTY_DB };
  }
}

export function writeDB(db) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

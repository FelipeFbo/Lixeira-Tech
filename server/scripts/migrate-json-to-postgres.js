import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, pool, writeDB } from '../db.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(scriptDir, '..', 'database', 'db.json');

try {
  const raw = await fs.readFile(jsonPath, 'utf8');
  const legacyData = JSON.parse(raw);
  const db = {
    users: Array.isArray(legacyData.users) ? legacyData.users : [],
    deposits: Array.isArray(legacyData.deposits) ? legacyData.deposits : [],
  };

  await initDatabase();
  await writeDB(db);
  console.log(`✅ Migração concluída: ${db.users.length} usuário(s) e ${db.deposits.length} depósito(s).`);
} catch (error) {
  console.error('❌ Falha na migração:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

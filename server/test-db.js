import { initDatabase, pool } from './db.js';

try {
    await initDatabase();
    const { rows } = await pool.query('SELECT NOW() AS now');
    console.log('✅ Conexão PostgreSQL bem-sucedida!', rows[0].now);
} catch (err) {
    console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}

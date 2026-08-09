import { db } from './db.js';

try {
    const [rows] = await db.query('SELECT NOW() AS now');
    console.log('✅ Conexão bem-sucedida!', rows[0].now);
    process.exit(0);
} catch (err) {
    console.error('❌ Erro ao conectar no MariaDB:', err);
    process.exit(1);
}

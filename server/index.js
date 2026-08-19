// server/index.js
//
// Backend da Lixeira Tech. Todos os dados persistem em PostgreSQL.
// Os endpoints e formatos de resposta permanecem compatíveis com o frontend.

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase, readDB, writeDB } from './db.js';

const app = express();
const PORT = 3001;
const CO2_FACTOR_BY_TYPE = {
  celular: 12.5,
  notebook: 9,
  placa_mae: 14,
  bateria: 6.5,
  monitor: 4.5,
  cabo: 2.8,
  pilha: 3.5,
  outros: 3,
};

app.use(cors());
app.use(express.json());

// ---------- Helpers ----------

function generateAdminPassword(date = new Date()) {
  const dayLastDigit = date.getDate().toString().slice(-1);
  const monthLastDigit = (date.getMonth() + 1).toString().slice(-1);
  const yearLastDigit = date.getFullYear().toString().slice(-1);

  const digits = [dayLastDigit, monthLastDigit, yearLastDigit];
  let senha = '';

  for (const d of digits) {
    const n = parseInt(d);
    senha += d + (n * n);
  }

  return senha;
}

function calculateUserCO2(deposits) {
  return deposits.reduce((total, deposit) => {
    const type = String(deposit.item_type || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    const factor = CO2_FACTOR_BY_TYPE[type] || CO2_FACTOR_BY_TYPE.outros;
    return total + (Number(deposit.weight_delta) || 0) * factor;
  }, 0);
}

function isSameDay(isoA, isoB = new Date().toISOString()) {
  return String(isoA).slice(0, 10) === String(isoB).slice(0, 10);
}

function publicUser(user) {
  const { password_hash, matricula, class_name, kiosk_code, ...rest } = user;
  return { ...rest, kioskCode: kiosk_code };
}

// ---------- Auth ----------

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await readDB();

    if (![name, email, password].every((value) => String(value || '').trim())) {
      return res.status(400).json({ error: 'Preencha nome, e-mail e senha' });
    }

    const normalizedName = String(name || '').trim().toLocaleLowerCase('pt-BR');
    const existing = db.users.find((u) =>
      u.email === email ||
      String(u.name || '').trim().toLocaleLowerCase('pt-BR') === normalizedName
    );
    if (existing) {
      return res.status(400).json({ error: 'Já existe uma conta com este e-mail ou nome' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    const user = {
      id,
      name,
      matricula: '',
      email,
      password_hash,
      class_name: name,
      points: 0,
      kiosk_code: uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase(),
      created_at: new Date().toISOString(),
    };

    db.users.push(user);
    await writeDB(db);

    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login especial para admin
    if (email === 'admin') {
      const todayPassword = generateAdminPassword();
      if (password === todayPassword) {
        const adminUser = {
          id: 'admin',
          name: 'Administrador',
          email: 'admin',
          points: 0,
          is_admin: true,
        };
        return res.json({ user: adminUser });
      }
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const db = await readDB();
    const user = db.users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    res.json({ user: { ...publicUser(user), is_admin: false } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- User stats ----------

app.get('/api/user/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await readDB();

    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const userDeposits = db.deposits.filter((d) => d.user_id === userId && d.status === 'approved');
    const totalDeposits = userDeposits.length;
    const todayDeposits = userDeposits.filter((d) => isSameDay(d.created_at)).length;

    res.json({
      userName: user.name,
      totalPoints: user.points,
      totalDeposits,
      todayDeposits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Deposits ----------

app.get('/api/deposits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await readDB();

    const rows = db.deposits
      .filter((d) => d.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((d) => ({
        id: d.id,
        wasteType: d.item_type,
        quantity: d.quantity,
        weight: d.weight_delta,
        points: d.status === 'approved' ? d.points : 0,
        date: d.created_at,
        status: d.status,
        binName: db.bins.find((bin) => bin.id === d.bin_id)?.name || null,
      }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deposits', async (req, res) => {
  try {
    const { userId, binId, wasteType, quantity, weight, description } = req.body;
    const db = await readDB();
    const user = db.users.find((item) => item.id === userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const bin = binId ? db.bins.find((item) => item.id === binId) : null;
    if (binId && !bin) return res.status(404).json({ error: 'Lixeira não encontrada' });
    if (bin && bin.status !== 'online') return res.status(400).json({ error: 'Esta lixeira está indisponível no momento' });

    const now = new Date().toISOString();
    const deposit = {
      id: uuidv4(),
      user_id: userId,
      bin_id: bin?.id || null,
      item_type: wasteType,
      quantity: Number(quantity),
      weight_delta: Number(weight),
      status: 'pending',
      points: 0,
      description: description || '',
      created_at: now,
      updated_at: now,
      timestamp_client: now,
    };

    db.deposits.push(deposit);
    if (bin) {
      bin.capacity_pct = Math.min(100, bin.capacity_pct + Math.max(1, Math.ceil(Number(weight) * 2)));
      bin.updated_at = now;
    }
    await writeDB(db);

    res.json({ success: true, message: 'Depósito registrado e aguardando aprovação' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Admin: deposits history ----------

app.get('/api/admin/deposits/historico', async (req, res) => {
  try {
    const db = await readDB();

    const rows = db.deposits
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((d) => {
        const user = db.users.find((u) => u.id === d.user_id);
        return {
          id: d.id,
          user_id: d.user_id,
          userName: user?.name ?? '—',
          wasteType: d.item_type,
          quantity: d.quantity,
          weight: d.weight_delta,
          description: d.description || '',
          points: d.status === 'approved' ? d.points : 0,
          date: d.created_at,
          status: d.status,
          binName: db.bins.find((bin) => bin.id === d.bin_id)?.name || 'Depósito manual',
        };
      });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Quiosque e lixeiras físicas simuladas ----------

app.get('/api/kiosk/bins', async (_req, res) => {
  try {
    const db = await readDB();
    res.json(db.bins
      .filter((bin) => bin.status !== 'offline')
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      .map((bin) => ({ id: bin.id, name: bin.name, location: bin.location, capacity: bin.capacity_pct, status: bin.status })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/kiosk/users/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const db = await readDB();
    const user = db.users.find((item) => item.kiosk_code === code);
    if (!user) return res.status(404).json({ error: 'Código QR não encontrado' });
    res.json({ id: user.id, name: user.name, points: user.points, kioskCode: user.kiosk_code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Leaderboard ----------

app.get('/api/leaderboard/global', async (_req, res) => {
  try {
    const db = await readDB();

    const rows = db.users
      .map((user) => ({
        name: user.name,
        points: user.points || 0,
        co2Kg: calculateUserCO2(db.deposits.filter((deposit) => deposit.user_id === user.id && deposit.status === 'approved')),
      }))
      .filter((user) => user.points > 0)
      .sort((a, b) => b.points - a.points || b.co2Kg - a.co2Kg)
      .slice(0, 10)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/ranking/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await readDB();

    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const global = db.users.filter((u) => u.points > user.points).length + 1;
    res.json({ global, points: user.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- Admin ----------

app.get('/api/admin/bins', async (_req, res) => {
  try {
    const db = await readDB();
    res.json([...db.bins].sort((a, b) => b.capacity_pct - a.capacity_pct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/bins', async (req, res) => {
  try {
    const { name, location } = req.body;
    if (![name, location].every((value) => String(value || '').trim())) {
      return res.status(400).json({ error: 'Informe nome e localização da lixeira' });
    }
    const db = await readDB();
    const now = new Date().toISOString();
    const bin = { id: uuidv4(), name: String(name).trim(), location: String(location).trim(), capacity_pct: 0, status: 'online', last_collected_at: now, created_at: now, updated_at: now };
    db.bins.push(bin);
    await writeDB(db);
    res.status(201).json(bin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/bins/update', async (req, res) => {
  try {
    const { binId, status, capacity } = req.body;
    const db = await readDB();
    const bin = db.bins.find((item) => item.id === binId);
    if (!bin) return res.status(404).json({ error: 'Lixeira não encontrada' });
    if (status && !['online', 'maintenance', 'offline'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
    if (status) bin.status = status;
    if (capacity !== undefined) bin.capacity_pct = Math.min(100, Math.max(0, Number(capacity) || 0));
    bin.updated_at = new Date().toISOString();
    await writeDB(db);
    res.json(bin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/bins/collect', async (req, res) => {
  try {
    const { binId } = req.body;
    const db = await readDB();
    const bin = db.bins.find((item) => item.id === binId);
    if (!bin) return res.status(404).json({ error: 'Lixeira não encontrada' });
    const now = new Date().toISOString();
    bin.capacity_pct = 0;
    bin.status = 'online';
    bin.last_collected_at = now;
    bin.updated_at = now;
    await writeDB(db);
    res.json({ success: true, bin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/global-stats', async (_req, res) => {
  try {
    const db = await readDB();

    const totalUsers = db.users.length;
    const approved = db.deposits.filter((d) => d.status === 'approved');
    const totalDeposits = approved.length;
    const todayDeposits = approved.filter((d) => isSameDay(d.created_at)).length;

    res.json({ totalUsers, totalDeposits, todayDeposits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/user-rankings', async (_req, res) => {
  try {
    const db = await readDB();
    const result = db.users
      .map((user) => ({ userName: user.name, points: Number(user.points) || 0 }))
      .sort((a, b) => b.points - a.points || a.userName.localeCompare(b.userName, 'pt-BR'))
      .map((user, index) => ({ ...user, rank: index + 1 }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/pending-deposits', async (req, res) => {
  try {
    const db = await readDB();

    const rows = db.deposits
      .filter((d) => d.status === 'pending')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((d) => {
        const user = db.users.find((u) => u.id === d.user_id);
        return {
          id: d.id,
          user_id: d.user_id,
          userName: user?.name ?? '—',
          wasteType: d.item_type,
          quantity: d.quantity,
          weight: d.weight_delta,
          description: d.description || '',
          date: d.created_at,
          status: d.status,
        };
      });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/approve-deposit', async (req, res) => {
  try {
    const { depositId, points } = req.body;
    const db = await readDB();

    const deposit = db.deposits.find((d) => d.id === depositId);
    if (!deposit) return res.status(404).json({ error: 'Depósito não encontrado' });

    deposit.status = 'approved';
    deposit.points = points;
    deposit.updated_at = new Date().toISOString();

    const user = db.users.find((u) => u.id === deposit.user_id);
    if (user) user.points = (user.points || 0) + points;

    await writeDB(db);
    res.json({ success: true, message: 'Depósito aprovado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reject-deposit', async (req, res) => {
  try {
    const { depositId } = req.body;
    const db = await readDB();

    const deposit = db.deposits.find((d) => d.id === depositId);
    if (!deposit) return res.status(404).json({ error: 'Depósito não encontrado' });

    deposit.status = 'rejected';
    deposit.updated_at = new Date().toISOString();

    await writeDB(db);
    res.json({ success: true, message: 'Depósito rejeitado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', async (_req, res) => {
  try {
    const db = await readDB();
    const users = [...db.users]
      .sort((a, b) => b.points - a.points)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
        created_at: u.created_at,
      }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/delete-college', async (req, res) => {
  try {
    const { userId } = req.body;
    const db = await readDB();
    const userIndex = db.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

    const [removedCollege] = db.users.splice(userIndex, 1);
    const depositsBefore = db.deposits.length;
    db.deposits = db.deposits.filter((deposit) => deposit.user_id !== userId);
    const removedDeposits = depositsBefore - db.deposits.length;

    await writeDB(db);
    res.json({ success: true, userName: removedCollege.name, removedDeposits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reset-college-impact', async (req, res) => {
  try {
    const { userId } = req.body;
    const db = await readDB();
    const account = db.users.find((user) => user.id === userId);

    if (!account) return res.status(404).json({ error: 'Usuário não encontrado' });

    account.points = 0;
    const depositsBefore = db.deposits.length;
    db.deposits = db.deposits.filter((deposit) => deposit.user_id !== userId);
    const removedDeposits = depositsBefore - db.deposits.length;

    await writeDB(db);
    res.json({ success: true, userName: account.name, removedDeposits, points: account.points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/add-points', async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const db = await readDB();

    const user = db.users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    user.points = (user.points || 0) + points;

    const now = new Date().toISOString();
    db.deposits.push({
      id: uuidv4(),
      user_id: userId,
      item_type: reason || 'Pontos manuais',
      quantity: 1,
      weight_delta: points / 10,
      status: 'approved',
      points,
      created_at: now,
      updated_at: now,
      timestamp_client: now,
    });

    await writeDB(db);
    res.json({ success: true, message: 'Pontos adicionados com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// ASSISTENTE INTELIGENTE (proxy para OpenRouter)
// ============================================================
// Modelos gratuitos configurados via OPENROUTER_MODELS (fallback em
// cadeia — se um falhar/estiver indisponível, tenta o próximo).
// A chave fica em server/.env (OPENROUTER_API_KEY) e nunca é exposta
// ao front-end. Sem chave configurada, cai num fallback local por
// palavras-chave para o assistente continuar funcional na demo.
const OPENROUTER_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'google/gemma-4-31b-it:free',
  'openai/gpt-oss-20b:free',
];

const ASSISTANT_SYSTEM_PROMPT = `Você é o assistente virtual da Lixeira Tech, uma plataforma escolar de conscientização e coleta de lixo eletrônico.
Responda em português, de forma curta, clara e prática, sobre: descarte de eletrônicos, pilhas, baterias, riscos ambientais e como usar o sistema Lixeira Tech.
Quando fizer sentido, sugira a seção correspondente do site (ex: "veja mais no Museu Digital" ou "confira o Panorama Mundial").
Se a pergunta não tiver relação com eletrônicos/meio ambiente/reciclagem, responda educadamente que seu foco é esse tema.
Nunca invente números ou leis específicas com precisão que você não tem certeza — fale em termos gerais quando não tiver certeza.`;

function localAssistantFallback(userMessage = '') {
  const msg = userMessage.toLowerCase();
  if (msg.includes('pilha') || msg.includes('bateria')) {
    return 'Pilhas e baterias nunca devem ir no lixo comum: elas contêm metais pesados que contaminam solo e água. Leve a um ponto de coleta de eletrônicos ou registre o descarte aqui na Lixeira Tech. Dá uma olhada no Museu Digital para entender por que isso importa tanto.';
  }
  if (msg.includes('queimou') || msg.includes('quebrou') || msg.includes('estragou')) {
    return 'Equipamento com defeito também é e-lixo — não descarte no lixo comum. Guarde-o e leve a um ponto de coleta eletrônica (ou registre aqui na Lixeira Tech, se sua escola aceitar itens danificados).';
  }
  if (msg.includes('carregador') || msg.includes('cabo') || msg.includes('fio')) {
    return 'Sim! Carregadores e cabos são recicláveis — eles têm cobre e plástico que podem ser recuperados. Registre o descarte na aba "Registrar" para contar no seu impacto.';
  }
  if (msg.includes('reciclagem') || msg.includes('reciclar') || msg.includes('eletrônico')) {
    return 'Praticamente todo equipamento eletrônico é reciclável em algum grau — o problema é que a maior parte vai parar no lixo comum. Dá uma olhada no Panorama Mundial pra ver como isso se compara entre países.';
  }
  return 'Posso te ajudar com dúvidas sobre descarte de eletrônicos, pilhas e baterias. Pode perguntar algo como "posso jogar pilha no lixo comum?" ou "como descarto meu carregador?".';
}

app.post('/api/assistant/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages é obrigatório' });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.json({ role: 'assistant', content: localAssistantFallback(lastUserMessage), source: 'local' });
  }

  const payloadMessages = [
    { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
    ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
  ];

  for (const model of OPENROUTER_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages: payloadMessages }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return res.json({ role: 'assistant', content, source: model });
      }
    } catch {
      continue; // tenta o próximo modelo da lista
    }
  }

  // Todos os modelos falharam (chave inválida, sem créditos, modelo fora do ar etc.)
  return res.json({ role: 'assistant', content: localAssistantFallback(lastUserMessage), source: 'local-fallback' });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
      console.log('🐘 Dados persistidos em PostgreSQL');
      console.log(`📅 Senha admin de hoje: ${generateAdminPassword()}`);
    });
  } catch (error) {
    console.error('❌ Não foi possível iniciar o PostgreSQL:', error.message);
    console.error('Configure DATABASE_URL em server/.env e execute a migração dos dados.');
    process.exitCode = 1;
  }
}

startServer();

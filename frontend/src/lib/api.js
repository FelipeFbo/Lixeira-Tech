/**
 * Cliente de API — espelha 1:1 os endpoints existentes em server/index.js.
 * Nenhum contrato foi alterado. Se algo precisar mudar no back-end,
 * isso deve ser sinalizado separadamente antes de qualquer alteração.
 *
 * Configure a URL base via variável de ambiente Vite:
 *   VITE_API_URL=http://localhost:3001
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error || `Erro na requisição (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  auth: {
    signup: (payload) =>
      request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
    login: (email, password) =>
      request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  },

  user: {
    stats: (userId) => request(`/api/user/stats/${userId}`),
    ranking: (userId) => request(`/api/user/ranking/${userId}`),
  },

  deposits: {
    listByUser: (userId) => request(`/api/deposits/${userId}`),
    create: ({ userId, wasteType, quantity, weight, description }) =>
      request("/api/deposits", {
        method: "POST",
        body: JSON.stringify({ userId, wasteType, quantity, weight, description }),
      }),
  },

  leaderboard: {
    global: () => request("/api/leaderboard/global"),
  },

  assistant: {
    chat: (messages) =>
      request("/api/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ messages }),
      }),
  },

  admin: {
    depositsHistory: () => request("/api/admin/deposits/historico"),
    globalStats: () => request("/api/admin/global-stats"),
    classRankings: () => request("/api/admin/class-rankings"),
    pendingDeposits: () => request("/api/admin/pending-deposits"),
    approveDeposit: (depositId, points) =>
      request("/api/admin/approve-deposit", {
        method: "POST",
        body: JSON.stringify({ depositId, points }),
      }),
    rejectDeposit: (depositId) =>
      request("/api/admin/reject-deposit", {
        method: "POST",
        body: JSON.stringify({ depositId }),
      }),
    students: () => request("/api/admin/students"),
    addPoints: (userId, points, reason) =>
      request("/api/admin/add-points", {
        method: "POST",
        body: JSON.stringify({ userId, points, reason }),
      }),
  },
};

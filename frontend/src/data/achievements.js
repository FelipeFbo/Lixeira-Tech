/**
 * ============================================================
 * CONQUISTAS AMBIENTAIS
 * ============================================================
 * Calculadas 100% no cliente a partir do histórico de depósitos
 * aprovados do usuário (nenhuma alteração de schema no back-end
 * foi necessária). `check(ctx)` recebe:
 *   ctx = { deposits, impact, points }
 *   - deposits: lista de depósitos aprovados [{ wasteType, weight, ... }]
 *   - impact:   { ewasteKg, co2Kg, treesEquivalent } agregado
 *   - points:   pontos totais do usuário
 */

export const ACHIEVEMENTS = [
  {
    key: "primeiro-descarte",
    icon: "🌱",
    title: "Primeiro Descarte",
    description: "Registrou seu primeiro depósito aprovado.",
    check: (ctx) => ctx.deposits.length >= 1,
  },
  {
    key: "especialista-baterias",
    icon: "🔋",
    title: "Especialista em Baterias",
    description: "Descartou corretamente 5 ou mais baterias/pilhas.",
    check: (ctx) =>
      ctx.deposits.filter((d) => ["bateria", "pilha"].includes(normalize(d.wasteType))).length >= 5,
  },
  {
    key: "guardiao-tecnologia",
    icon: "💻",
    title: "Guardião da Tecnologia",
    description: "Completou 10 depósitos aprovados.",
    check: (ctx) => ctx.deposits.length >= 10,
  },
  {
    key: "protetor-planeta",
    icon: "🌍",
    title: "Protetor do Planeta",
    description: "Já desviou mais de 50 kg de e-lixo do descarte incorreto.",
    check: (ctx) => ctx.impact.ewasteKg >= 50,
  },
  {
    key: "mestre-reciclagem",
    icon: "♻️",
    title: "Mestre da Reciclagem",
    description: "Ultrapassou 100 kg de e-lixo desviado — nível avançado de impacto.",
    check: (ctx) => ctx.impact.ewasteKg >= 100,
  },
  {
    key: "arvore-ancestral",
    icon: "🌳",
    title: "Árvore Ancestral",
    description: "Sua árvore de sustentabilidade chegou ao estágio máximo: Floresta.",
    check: (ctx) => ctx.impact.ewasteKg >= 50,
  },
];

function normalize(raw = "") {
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Retorna a lista de conquistas com o campo `unlocked` calculado.
 */
export function evaluateAchievements(ctx) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(ctx) }));
}

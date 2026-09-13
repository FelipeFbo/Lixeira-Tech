/**
 * ============================================================
 * MOTOR DE CONVERSÃO DE IMPACTO AMBIENTAL
 * ============================================================
 * Transforma o dado técnico do sistema (peso em kg + tipo de
 * resíduo) em métricas de impacto real: kg de e-lixo desviado,
 * kg de CO2 evitado e árvores equivalentes preservadas.
 *
 * IMPORTANTE (para a apresentação/TCC):
 * Os fatores abaixo são estimativas plausíveis e "citáveis" em
 * ordem de grandeza, mas NÃO são um estudo de ciclo de vida (LCA)
 * dedicado ao Brasil. Antes de defender o trabalho, troque as
 * fontes abaixo por referências específicas que você validar:
 *
 *  - Fator base de CO2 evitado por kg de e-lixo reciclado:
 *    inspirado em ordens de grandeza usadas por relatórios como
 *    o "Global E-waste Monitor" (UNITAR/ITU) e modelos de
 *    substituição de matéria-prima (mineração evitada). Aqui
 *    usamos uma média conservadora de referência.
 *
 *  - Sequestro de CO2 por árvore/ano: valor amplamente citado em
 *    material educativo (ordem de ~20-25 kg CO2/ano por árvore
 *    madura). Usamos 21 kg CO2/ano/árvore como valor médio.
 *
 * Cada linha abaixo tem o multiplicador POR TIPO DE RESÍDUO,
 * porque a composição do material muda o impacto (placas e
 * baterias têm metais mais "caros" ambientalmente que um cabo,
 * por exemplo). Ajuste os números, não a estrutura.
 */

// kg de CO2e evitado por kg de resíduo, por categoria.
// (mineração + fabricação evitadas ao reaproveitar o material)
export const CO2_FACTOR_BY_TYPE = {
  celular: 12.5,      // alta densidade de metais raros/terras raras por kg
  notebook: 9.0,       // placas + bateria + alumínio
  placa_mae: 14.0,     // ouro, cobre, paládio em alta concentração
  bateria: 6.5,        // lítio/cobalto, mas processo de reciclagem mais caro em energia
  monitor: 4.5,        // vidro + plástico + placas em menor densidade
  cabo: 2.8,           // majoritariamente cobre + PVC
  pilha: 3.5,
  outros: 3.0,         // fallback conservador para categorias não mapeadas
};

// kg de CO2 sequestrado por uma árvore madura, por ano.
// Fonte de referência a substituir: ex. EPA / estudos de sequestro florestal.
export const CO2_PER_TREE_PER_YEAR = 21;

// Normaliza o tipo vindo do back-end (item_type) para uma chave conhecida.
function normalizeType(rawType = "") {
  const key = rawType
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, "_");
  return CO2_FACTOR_BY_TYPE[key] ? key : "outros";
}

/**
 * Calcula o impacto ambiental de UM depósito.
 * @param {number} weightKg - peso em kg (weight_delta no back-end)
 * @param {string} wasteType - item_type / wasteType retornado pela API
 * @returns {{ ewasteKg: number, co2Kg: number, treesEquivalent: number }}
 */
export function calculateImpact(weightKg = 0, wasteType = "outros") {
  const weight = Math.max(0, Number(weightKg) || 0);
  const type = normalizeType(wasteType);
  const factor = CO2_FACTOR_BY_TYPE[type];

  const ewasteKg = weight;
  const co2Kg = weight * factor;
  const treesEquivalent = co2Kg / CO2_PER_TREE_PER_YEAR;

  return {
    ewasteKg: round(ewasteKg),
    co2Kg: round(co2Kg),
    treesEquivalent: round(treesEquivalent, 2),
  };
}

/**
 * Soma o impacto de uma lista de depósitos (ex: histórico de um usuário).
 * Cada depósito deve ter { weight, wasteType }.
 */
export function calculateAggregateImpact(deposits = []) {
  return deposits.reduce(
    (acc, d) => {
      const impact = calculateImpact(d.weight, d.wasteType);
      return {
        ewasteKg: round(acc.ewasteKg + impact.ewasteKg),
        co2Kg: round(acc.co2Kg + impact.co2Kg),
        treesEquivalent: round(acc.treesEquivalent + impact.treesEquivalent, 2),
      };
    },
    { ewasteKg: 0, co2Kg: 0, treesEquivalent: 0 }
  );
}

// Estimativa média de kg de CO2 por ponto, usada apenas quando só temos o
// total de pontos agregado (ex: pontos de uma pessoa) e não o histórico
// de depósitos individual. Baseada na régua de conversão usada no fluxo
// de "adicionar pontos manualmente" do admin (10 pontos ~ 1kg de resíduo).
export const AVG_CO2_PER_POINT_SAFE =
  Object.values(CO2_FACTOR_BY_TYPE).reduce((a, b) => a + b, 0) /
  Object.values(CO2_FACTOR_BY_TYPE).length /
  10;

function round(n, decimals = 1) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/**
 * ============================================================
 * ÁRVORE DA SUSTENTABILIDADE
 * ============================================================
 * Estágio calculado a partir do total de kg de e-lixo desviado
 * (impact.ewasteKg agregado do usuário). Cada estágio tem um
 * limiar mínimo — quando o próximo limiar é atingido, a árvore
 * "evolui". O XP ambiental usa a mesma base de pontos já existente
 * no sistema (user.points), sem exigir campo novo no back-end.
 */
export const TREE_STAGES = [
  { key: "semente", icon: "🌱", label: "Semente", minKg: 0 },
  { key: "broto", icon: "🌿", label: "Broto", minKg: 2 },
  { key: "jovem", icon: "🌳", label: "Árvore Jovem", minKg: 8 },
  { key: "grande", icon: "🌲", label: "Árvore Grande", minKg: 20 },
  { key: "floresta", icon: "🌳🌲🌱", label: "Floresta", minKg: 50 },
];

export function getTreeStage(ewasteKg = 0) {
  let current = TREE_STAGES[0];
  let currentIndex = 0;
  for (let i = 0; i < TREE_STAGES.length; i++) {
    if (ewasteKg >= TREE_STAGES[i].minKg) {
      current = TREE_STAGES[i];
      currentIndex = i;
    }
  }
  const next = TREE_STAGES[currentIndex + 1] || null;
  const progressToNext = next
    ? Math.min(1, (ewasteKg - current.minKg) / (next.minKg - current.minKg))
    : 1;

  return {
    stage: current,
    stageIndex: currentIndex,
    totalStages: TREE_STAGES.length,
    next,
    progressToNext,
  };
}

// Nível ambiental: cada 100 pontos = 1 nível. Simples e reutiliza o
// campo `points` que já existe no back-end (nenhuma mudança de schema).
export function getEnvironmentalLevel(points = 0) {
  const level = Math.floor(points / 100) + 1;
  const xpIntoLevel = points % 100;
  return { level, xpIntoLevel, xpForNextLevel: 100 };
}

// Metadados de categorias usados na UI (label + ícone line-art + cor de apoio)
export const WASTE_CATEGORIES = [
  { key: "celular", label: "Celular", icon: "phone" },
  { key: "notebook", label: "Notebook", icon: "laptop" },
  { key: "placa_mae", label: "Placa-mãe", icon: "chip" },
  { key: "bateria", label: "Bateria", icon: "battery" },
  { key: "monitor", label: "Monitor", icon: "monitor" },
  { key: "cabo", label: "Cabo", icon: "cable" },
  { key: "pilha", label: "Pilha", icon: "cell" },
  { key: "outros", label: "Outros", icon: "misc" },
];

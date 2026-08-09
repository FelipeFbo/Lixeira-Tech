/**
 * ============================================================
 * DATASET — PANORAMA MUNDIAL DO LIXO ELETRÔNICO
 * ============================================================
 * Números aproximados, com ordem de grandeza baseada em relatórios
 * públicos amplamente citados (ex: Global E-waste Monitor,
 * UNITAR/ITU/UNU). NÃO são valores oficiais ano a ano — são
 * estimativas de referência para fins educativos.
 *
 * Antes de defender o trabalho, vale trocar por números da edição
 * mais recente do relatório e citar a fonte exata no rodapé da página.
 *
 * chave = código numérico ISO 3166-1 (id usado no topojson de países,
 * de forma que dá para casar 1:1 com o mapa em WorldMap.jsx).
 */

export const WORLD_EWASTE_DATA = {
  76: {
    name: "Brasil",
    generationKt: 2140,       // kt/ano de e-lixo gerado
    perCapitaKg: 10.2,
    recyclingRatePct: 3,
    population: 216_000_000,
    funFact: "O Brasil é o maior gerador de e-lixo da América Latina, mas recicla formalmente menos de 3% do que produz.",
  },
  840: {
    name: "Estados Unidos",
    generationKt: 6920,
    perCapitaKg: 21,
    recyclingRatePct: 15,
    population: 335_000_000,
    funFact: "Os EUA geram mais e-lixo por pessoa do que quase qualquer outro país do mundo.",
  },
  156: {
    name: "China",
    generationKt: 10129,
    perCapitaKg: 7.2,
    recyclingRatePct: 16,
    population: 1_412_000_000,
    funFact: "A China é o maior gerador absoluto de e-lixo do planeta — mas também investe pesado em polos formais de reciclagem.",
  },
  356: {
    name: "Índia",
    generationKt: 3800,
    perCapitaKg: 2.6,
    recyclingRatePct: 5,
    population: 1_428_000_000,
    funFact: "A reciclagem de e-lixo na Índia é dominada pelo setor informal, com risco alto de exposição a metais pesados.",
  },
  392: {
    name: "Japão",
    generationKt: 2569,
    perCapitaKg: 20.4,
    recyclingRatePct: 22,
    population: 123_000_000,
    funFact: "O Japão tem uma das legislações mais rígidas do mundo para descarte de eletrônicos.",
  },
  276: {
    name: "Alemanha",
    generationKt: 1607,
    perCapitaKg: 19.4,
    recyclingRatePct: 52,
    population: 84_000_000,
    funFact: "A Alemanha está entre os países com maior taxa formal de reciclagem de e-lixo do mundo.",
  },
  578: {
    name: "Noruega",
    generationKt: 122,
    perCapitaKg: 22.4,
    recyclingRatePct: 84,
    population: 5_500_000,
    funFact: "A Noruega é referência mundial em coleta de e-lixo — quase todo o volume gerado é recolhido formalmente.",
  },
  484: {
    name: "México",
    generationKt: 1300,
    perCapitaKg: 10,
    recyclingRatePct: 4,
    population: 128_000_000,
    funFact: "O México tem crescido rápido em geração de e-lixo puxado pelo consumo de eletrônicos importados.",
  },
  32: {
    name: "Argentina",
    generationKt: 465,
    perCapitaKg: 10.1,
    recyclingRatePct: 3,
    population: 45_800_000,
    funFact: "A Argentina ainda não tem uma lei federal específica de logística reversa para eletrônicos.",
  },
  566: {
    name: "Nigéria",
    generationKt: 461,
    perCapitaKg: 2.1,
    recyclingRatePct: 2,
    population: 223_000_000,
    funFact: "A Nigéria recebe grande volume de e-lixo importado ilegalmente disfarçado de 'doações' de eletrônicos usados.",
  },
  710: {
    name: "África do Sul",
    generationKt: 360,
    perCapitaKg: 6.1,
    recyclingRatePct: 11,
    population: 60_000_000,
    funFact: "A África do Sul lidera a reciclagem formal de e-lixo no continente africano.",
  },
  643: {
    name: "Rússia",
    generationKt: 1631,
    perCapitaKg: 11.2,
    recyclingRatePct: 8,
    population: 144_000_000,
    funFact: "A infraestrutura de reciclagem formal na Rússia ainda é concentrada nos grandes centros urbanos.",
  },
  360: {
    name: "Indonésia",
    generationKt: 1618,
    perCapitaKg: 5.9,
    recyclingRatePct: 4,
    population: 277_000_000,
    funFact: "A Indonésia é um dos países que mais cresce em geração de e-lixo no Sudeste Asiático.",
  },
  826: {
    name: "Reino Unido",
    generationKt: 1598,
    perCapitaKg: 23.9,
    recyclingRatePct: 40,
    population: 67_000_000,
    funFact: "O Reino Unido tem um dos maiores volumes per capita de e-lixo da Europa.",
  },
  250: {
    name: "França",
    generationKt: 1519,
    perCapitaKg: 23.1,
    recyclingRatePct: 45,
    population: 68_000_000,
    funFact: "A França exige que fabricantes financiem a coleta e reciclagem de seus próprios produtos eletrônicos.",
  },
  36: {
    name: "Austrália",
    generationKt: 554,
    perCapitaKg: 21.7,
    recyclingRatePct: 25,
    population: 26_000_000,
    funFact: "A Austrália proíbe o descarte de e-lixo em aterros em vários de seus estados.",
  },
  124: {
    name: "Canadá",
    generationKt: 758,
    perCapitaKg: 20.1,
    recyclingRatePct: 28,
    population: 39_000_000,
    funFact: "Programas provinciais de logística reversa cobrem a maior parte do território canadense.",
  },
  410: {
    name: "Coreia do Sul",
    generationKt: 818,
    perCapitaKg: 15.9,
    recyclingRatePct: 40,
    population: 51_800_000,
    funFact: "A Coreia do Sul é referência em reaproveitamento industrial de metais raros de eletrônicos.",
  },
  818: {
    name: "Egito",
    generationKt: 586,
    perCapitaKg: 5.4,
    recyclingRatePct: 3,
    population: 109_000_000,
    funFact: "O Egito enfrenta crescimento acelerado de e-lixo com infraestrutura formal ainda limitada.",
  },
  616: {
    name: "Polônia",
    generationKt: 484,
    perCapitaKg: 12.8,
    recyclingRatePct: 38,
    population: 37_800_000,
    funFact: "A Polônia segue as metas de coleta da União Europeia para resíduos eletrônicos.",
  },
};

// Média mundial de referência, usada para comparação no painel.
export const WORLD_AVERAGE = {
  perCapitaKg: 7.8,
  recyclingRatePct: 22,
};

export const BRAZIL_ID = 76;

/**
 * ============================================================
 * MUSEU DIGITAL — ACERVO
 * ============================================================
 * Cada item representa um marco tecnológico e serve de gancho
 * educativo: o objetivo não é só nostalgia, é mostrar como cada
 * geração de eletrônicos carrega materiais diferentes — e riscos
 * de descarte diferentes.
 */

export const MUSEUM_ITEMS = [
  {
    slug: "disquete",
    name: "Disquete (Floppy Disk)",
    year: 1971,
    manufacturer: "IBM",
    icon: "misc",
    tagline: "O ancestral do 'salvar arquivo'.",
    funFacts: [
      "O ícone de 'salvar' que usamos até hoje em softwares é literalmente um disquete.",
      "Um disquete de 3,5\" armazenava cerca de 1,44 MB — hoje uma única foto de celular já ultrapassa isso.",
    ],
    materials: ["Plástico (invólucro)", "Óxido de ferro (disco magnético)", "Metal (trava deslizante)"],
    disposal: "Não é perigoso, mas não deve ir ao lixo comum em grande volume: plástico e metal são recicláveis em pontos de coleta eletrônica.",
    timeline: [
      { year: 1971, label: "Disquete de 8\" (IBM)" },
      { year: 1976, label: "Disquete de 5,25\"" },
      { year: 1984, label: "Disquete de 3,5\" (padrão popular)" },
      { year: 2003, label: "Fabricação em massa encerrada pela Sony" },
    ],
  },
  {
    slug: "walkman",
    name: "Walkman",
    year: 1979,
    manufacturer: "Sony",
    icon: "misc",
    tagline: "O primeiro 'player de música pessoal' de sucesso comercial.",
    funFacts: [
      "Antes do Walkman, ouvir música fora de casa em fones de ouvido praticamente não existia como hábito cultural.",
      "A Sony vendeu mais de 200 milhões de unidades ao longo de décadas.",
    ],
    materials: ["Plástico ABS", "Placa de circuito impresso", "Ímãs (motor do mecanismo de fita)", "Pilhas"],
    disposal: "Pilhas e placas nunca devem ir ao lixo comum — contêm metais pesados. O corpo plástico pode ser reciclado separadamente.",
    timeline: [
      { year: 1979, label: "Sony TPS-L2 (primeiro Walkman)" },
      { year: 1984, label: "Versões à prova d'água" },
      { year: 1992, label: "Introdução do formato MiniDisc" },
      { year: 2010, label: "Fim da produção de modelos a fita pela Sony no Japão" },
    ],
  },
  {
    slug: "nokia-3310",
    name: "Nokia 3310",
    year: 2000,
    manufacturer: "Nokia",
    icon: "phone",
    tagline: "O celular 'indestrutível' que virou meme de durabilidade.",
    funFacts: [
      "Vendeu mais de 126 milhões de unidades no mundo todo.",
      "Sua bateria durava dias, não horas — algo impensável nos smartphones atuais.",
    ],
    materials: ["Policarbonato", "Placa de circuito", "Bateria de Íon-lítio", "Tela LCD monocromática"],
    disposal: "Celulares nunca devem ir ao lixo comum: a bateria de lítio pode vazar e contaminar solo e água. Leve a um ponto de coleta de eletrônicos.",
    timeline: [
      { year: 2000, label: "Lançamento do Nokia 3310" },
      { year: 2003, label: "Nokia se torna a maior fabricante de celulares do mundo" },
      { year: 2017, label: "Relançamento 'nostálgico' do 3310" },
    ],
  },
  {
    slug: "monitor-crt",
    name: "Monitor CRT",
    year: 1974,
    manufacturer: "Diversos fabricantes",
    icon: "monitor",
    tagline: "O tubo de raios catódicos que dominou décadas de telas.",
    funFacts: [
      "Um monitor CRT pode conter até alguns quilos de chumbo dentro do tubo, usado para bloquear radiação.",
      "O peso de um CRT de 17\" podia passar de 15 kg — hoje um monitor do mesmo tamanho pesa menos de 2 kg.",
    ],
    materials: ["Vidro com chumbo", "Fósforo (revestimento interno)", "Cobre (bobinas)", "Plástico"],
    disposal: "Um dos itens mais perigosos para descarte incorreto por causa do chumbo. Deve ir obrigatoriamente para reciclagem especializada, nunca para o lixo comum ou aterro.",
    timeline: [
      { year: 1974, label: "Populariza-se em computadores pessoais" },
      { year: 1997, label: "Pico de vendas globais" },
      { year: 2007, label: "Ultrapassado pelas telas LCD em vendas" },
      { year: 2015, label: "Produção praticamente descontinuada" },
    ],
  },
  {
    slug: "game-boy",
    name: "Game Boy",
    year: 1989,
    manufacturer: "Nintendo",
    icon: "misc",
    tagline: "O portátil que ensinou uma geração inteira a jogar em qualquer lugar.",
    funFacts: [
      "Funcionava com 4 pilhas AA e durava cerca de 15 horas — um recorde para a época.",
      "Vendeu mais de 118 milhões de unidades somando toda a linha Game Boy.",
    ],
    materials: ["Plástico ABS", "Placa de circuito", "Cristal líquido (tela)", "Pilhas alcalinas"],
    disposal: "Pilhas alcalinas não devem ir ao lixo comum. O console em si pode ser doado ou reciclado em pontos de coleta eletrônica.",
    timeline: [
      { year: 1989, label: "Lançamento do Game Boy original" },
      { year: 1998, label: "Game Boy Color" },
      { year: 2001, label: "Game Boy Advance" },
      { year: 2003, label: "Encerramento gradual da linha original" },
    ],
  },
  {
    slug: "dvd-player",
    name: "DVD Player",
    year: 1996,
    manufacturer: "Toshiba / Diversos",
    icon: "misc",
    tagline: "A ponte entre a fita VHS e o streaming.",
    funFacts: [
      "O primeiro DVD player comercial custava o equivalente a milhares de reais em valores atuais.",
      "O formato DVD chegou a coexistir com Blu-ray e streaming por quase uma década.",
    ],
    materials: ["Plástico", "Placa de circuito", "Laser (diodo óptico)", "Motor (leitor)"],
    disposal: "Componentes eletrônicos e o diodo laser devem ser separados em reciclagem especializada, não descartados no lixo comum.",
    timeline: [
      { year: 1996, label: "Primeiros DVD players no Japão" },
      { year: 2003, label: "DVD ultrapassa VHS em vendas nos EUA" },
      { year: 2006, label: "Chegada do Blu-ray" },
      { year: 2015, label: "Queda acentuada por causa do streaming" },
    ],
  },
  {
    slug: "ipod-classic",
    name: "iPod Classic",
    year: 2001,
    manufacturer: "Apple",
    icon: "misc",
    tagline: "'1.000 músicas no seu bolso' — e o início do domínio da Apple em eletrônicos pessoais.",
    funFacts: [
      "O primeiro iPod tinha 5 GB de armazenamento — hoje isso mal caberia um punhado de vídeos em alta resolução.",
      "Foi descontinuado oficialmente em 2014, após mais de uma década de vendas.",
    ],
    materials: ["Alumínio", "Bateria de íon-lítio", "Placa de circuito", "HD miniaturizado (modelos clássicos)"],
    disposal: "Baterias de lítio íon exigem descarte especializado — risco de superaquecimento se descartadas incorretamente.",
    timeline: [
      { year: 2001, label: "Lançamento do iPod original" },
      { year: 2007, label: "iPod Classic ganha esse nome com a chegada do iPhone" },
      { year: 2014, label: "Descontinuado pela Apple" },
    ],
  },
  {
    slug: "telefone-de-disco",
    name: "Telefone de Disco",
    year: 1919,
    manufacturer: "Diversos fabricantes",
    icon: "misc",
    tagline: "Discar um número era, literalmente, girar um disco.",
    funFacts: [
      "Discar um número de 7 dígitos podia levar mais de 10 segundos — hoje isso é quase instantâneo.",
      "O mecanismo é inteiramente eletromecânico, sem nenhum chip.",
    ],
    materials: ["Baquelite ou metal (carcaça)", "Cobre (fiação interna)", "Componentes eletromecânicos"],
    disposal: "Baixo risco ambiental comparado a eletrônicos modernos, mas o cobre interno vale a pena ser recuperado em reciclagem.",
    timeline: [
      { year: 1919, label: "Popularização do disco rotativo" },
      { year: 1963, label: "Introdução dos telefones de teclado (touch-tone)" },
      { year: 1980, label: "Declínio acentuado do modelo de disco" },
    ],
  },
  {
    slug: "windows-95-pc",
    name: "Computador com Windows 95",
    year: 1995,
    manufacturer: "Diversos fabricantes (PC compatível)",
    icon: "laptop",
    tagline: "O sistema operacional que popularizou o computador pessoal em massa.",
    funFacts: [
      "O Windows 95 foi um dos lançamentos de software mais hypados da história, com filas em lojas ao redor do mundo.",
      "Um PC típico da época tinha 4 a 8 MB de RAM — menos que uma única foto de celular hoje.",
    ],
    materials: ["Placas de circuito múltiplas", "Metais pesados (soldas antigas com chumbo)", "Plástico", "HD magnético"],
    disposal: "PCs antigos concentram muitos componentes perigosos (soldas com chumbo, capacitores) — descarte apenas em pontos formais de reciclagem eletrônica.",
    timeline: [
      { year: 1995, label: "Lançamento do Windows 95" },
      { year: 1998, label: "Windows 98" },
      { year: 2001, label: "Windows XP encerra a era 9x" },
    ],
  },
  {
    slug: "fita-vhs",
    name: "Fita VHS + Videocassete",
    year: 1976,
    manufacturer: "JVC",
    icon: "misc",
    tagline: "A locadora de filmes cabia numa fita magnética.",
    funFacts: [
      "A 'Guerra de Formatos' entre VHS e Betamax é um caso clássico estudado até hoje em cursos de tecnologia e mercado.",
      "Uma fita VHS armazenava vídeo analógico — cada cópia perdia qualidade em relação à anterior.",
    ],
    materials: ["Fita magnética (óxido de ferro)", "Plástico", "Motor e componentes eletromecânicos (videocassete)"],
    disposal: "O aparelho videocassete tem placas e motor que devem ir para reciclagem eletrônica; a fita em si pode ser descartada como plástico comum em pequena escala.",
    timeline: [
      { year: 1976, label: "Lançamento do formato VHS pela JVC" },
      { year: 1988, label: "VHS vence a 'guerra de formatos' contra o Betamax" },
      { year: 2006, label: "Última fábrica de videocassetes do Japão encerra produção" },
    ],
  },
];

export function getMuseumItem(slug) {
  return MUSEUM_ITEMS.find((item) => item.slug === slug);
}

# Lixeira Tech — Front-end (refatoração visual)

Front-end completo, refeito do zero em React + Vite, consumindo o mesmo
back-end Express/MySQL já existente (`server/`, não alterado).

## Por que refazer do zero?

O zip original trazia apenas o **build compilado** (`dist/`) do front-end
anterior, sem o código-fonte React. Como o pedido era uma refatoração visual
completa (design system, motion, storytelling), reconstruir do zero — mas
consumindo exatamente os mesmos endpoints — foi o caminho mais direto.
Nenhum contrato de API foi alterado.

## Stack

- **React 19 + Vite** — mantido conforme pedido.
- **React Router 7** — roteamento das 6 telas (landing, login, cadastro,
  dashboard, ranking, depósito, admin).
- **Framer Motion** — todas as microinterações e transições de UI/estado.
- **@react-three/fiber + three** — cena 3D do hero (ver seção abaixo).
- **GSAP + ScrollTrigger** — controla o progresso da transição 3D em função
  do scroll (0 → 1), sincronizado ao Lenis.
- **Lenis** — scroll suave em toda a aplicação.

## Decisões de design (documentar na apresentação)

### 1. Paleta e tipografia (`src/styles/tokens.css`)
Fundo quase-preto (`#0a0c0a`, nunca preto puro) + um único accent
verde-ácido/elétrico (`#d4ff3d`) — deliberadamente **não** o verde pastel
"ONG" clichê. Tipografia dupla: **display** (Bricolage Grotesque) para
storytelling, **mono** (JetBrains Mono) para todo dado numérico — reforça a
ideia de "isso é uma medição real", não uma decoração.

### 2. Hero 3D (`src/components/three/`)
Em vez de morphing de vértices real entre modelos 3D (custo de
desenvolvimento e risco técnico altos para o prazo do trabalho), o hero
usa **cross-fade + transform entre dois objetos wireframe** (aparelho →
árvore), ambos desenhados como line-art (`EdgesGeometry`), coerente com a
linguagem visual do resto do site. O progresso vem do GSAP ScrollTrigger e
é lido via `useFrame` sem re-render do React (performance).

**Fallback:** `src/lib/deviceCapability.js` detecta ausência de WebGL,
`prefers-reduced-motion` ou dispositivo móvel de baixo desempenho e troca
a cena 3D por um par de ícones SVG estáticos equivalentes
(`hero-fallback` em `HeroScene.css`).

### 3. Impacto real vs. pontos (`src/lib/impact.js`)
Toda a regra de produto pedida — "impacto real sempre em primeiro plano,
pontos como dado técnico secundário" — está centralizada nesse arquivo.
A fórmula (`CO2_FACTOR_BY_TYPE`, kg de e-lixo → kg de CO2 evitado → árvores
equivalentes) está comentada com as fontes de referência a validar antes
da defesa do trabalho (ordem de grandeza de relatórios como o Global
E-waste Monitor / UNITAR-ITU; sequestro médio de CO2 por árvore/ano).
**Ajuste os números aqui, a estrutura do cálculo já está pronta.**

### 4. Onde a API não expõe impacto agregado
`/api/leaderboard/global` e `/api/leaderboard/class/:name` retornam apenas
pontos (sem histórico de depósitos por usuário). Nesses pontos específicos
(prévia da landing, ranking da comunidade), o CO2 é uma **estimativa**
baseada numa média dos fatores por categoria — sinalizado no código e na
UI ("estimativa ilustrativa"). O dashboard do próprio aluno usa o cálculo
exato, a partir do histórico real (`/api/deposits/:userId`).

## Rodando localmente

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
```

Certifique-se de que o back-end (`server/`) está rodando (`node index.js`,
porta 3001 por padrão) e que o `.env` do servidor aponta para o MySQL.

## Estrutura

```
src/
  components/
    ui/        design system (Button, Card, Nav, Timeline, Podium, LineIcon, ...)
    three/     cena 3D do hero + fallback
    landing/   seções específicas da landing (scrollytelling, prévia de impacto)
    auth/      painel ambiente do split-screen de login/cadastro
  lib/         api.js (cliente HTTP), impact.js (fórmulas), useLenis.js, deviceCapability.js
  store/       AuthContext (sessão via localStorage)
  pages/       Landing, Login, Signup, Dashboard, Ranking, Deposit, Admin
```

## Pontos em aberto / próximos passos sugeridos

- Validar e trocar os fatores de `impact.js` por uma fonte específica
  citável (o comentário no arquivo já indica onde).
- Testar a cena 3D em dispositivos reais de baixo desempenho e ajustar o
  limiar de `isLowPowerDevice()` se necessário.
- Adicionar testes automatizados (não fazia parte do escopo pedido).

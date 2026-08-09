<div align="center">

# 🌱 Lixeira Tech

**Plataforma escolar de conscientização e coleta de lixo eletrônico**

Transformando o descarte correto de eletrônicos em impacto ambiental visível, mensurável e gamificado.

</div>

---

## 📖 Sobre o projeto

O **Lixeira Tech** nasceu como um projeto acadêmico com um objetivo simples e urgente: tornar
visível um problema que hoje passa despercebido — o acúmulo de lixo eletrônico. Diferente do
lixo comum, o e-lixo não fica "à vista"; ele se acumula em gavetas, depósitos e aterros sem que
ninguém realmente veja a escala do problema.

A plataforma conecta colégios em um sistema de descarte responsável, onde cada
depósito registrado é convertido em **impacto ambiental real** — kg de e-lixo desviado, CO₂
evitado, árvores equivalentes preservadas — e não apenas em pontos abstratos de gamificação.

## ✨ Funcionalidades

### Landing institucional
- Hero em **3D** (React Three Fiber) com transição objeto eletrônico → elemento orgânico
- **Scrollytelling** com rolagem suave (Lenis) contando o problema, a solução e o impacto
- Estética *thin line art* animada, paleta eco-tech dark + verde elétrico

### Sistema principal (área logada)
- **Dashboard do colégio** — impacto em kg/CO₂/árvores e histórico de depósitos
- **Registrar depósito** — fluxo simples de descarte com feedback imediato de impacto
- **Ranking da comunidade** — pódio de impacto real, global e por colégio
- **Painel admin** — aprovação/rejeição de depósitos, gestão de colégios, estatísticas globais

### Educação ambiental
- 🌎 **Panorama Mundial** — mapa-múndi interativo com dados de geração de e-lixo por país, comparando com o Brasil e a média mundial
- 🖥️ **Museu Digital** — galeria de 10 equipamentos icônicos (Walkman, Nokia 3310, CRT, Game Boy...) com curiosidades, materiais e forma correta de descarte
- 🌳 **Árvore da Sustentabilidade** — evolui em 5 estágios (semente → floresta) conforme o impacto acumulado do usuário
- 🏅 **Conquistas Ambientais** — badges desbloqueadas por marcos de uso e impacto
- 🤖 **Assistente Inteligente** — chat flutuante que tira dúvidas sobre descarte de eletrônicos, pilhas e baterias

## 🛠️ Stack técnica

| Camada | Tecnologias |
|---|---|
| Front-end | React + Vite, React Router |
| 3D / Motion | React Three Fiber, Framer Motion, Lenis (scroll suave) |
| Mapa | d3-geo + topojson-client (renderização SVG, sem dependências pesadas) |
| Back-end | Node.js + Express |
| Persistência | Banco em arquivo JSON (`server/database/db.json`) — sem necessidade de servidor de banco externo |
| IA | Proxy para [OpenRouter](https://openrouter.ai) (modelos gratuitos), com fallback local caso a chave não esteja configurada |

## 🚀 Rodando o projeto localmente

### Pré-requisitos
- Node.js 20.6 ou superior

### 1. Back-end

```bash
cd server
npm install
npm run dev
```

O servidor sobe em `http://localhost:3001`. Na primeira execução, ele cria automaticamente o
banco de dados (`server/database/db.json`) vazio — cadastre um usuário pela interface para começar
a popular os dados. A senha de admin do dia aparece no console ao iniciar o servidor.

**Opcional — Assistente com IA de verdade:**

```bash
cp server/.env.example server/.env
```

Preencha `OPENROUTER_API_KEY` com uma chave gratuita de [openrouter.ai/keys](https://openrouter.ai/keys).
Sem essa chave, o assistente continua funcional, respondendo com um conjunto de respostas locais
por palavra-chave.

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## 📁 Estrutura do projeto

```
LixeiraTech-main/
├── frontend/               # React + Vite
│   └── src/
│       ├── components/     # UI, mapa, museu, árvore, conquistas, assistente
│       ├── pages/           # Landing, Dashboard, Ranking, Admin, Panorama, Museu...
│       ├── data/             # Datasets (países, museu, conquistas)
│       ├── lib/               # API client, cálculo de impacto, scroll
│       └── styles/            # Design tokens e estilos globais
└── server/                 # Node + Express
    ├── database/            # Banco de dados em JSON
    └── index.js             # Rotas da API
```

## ⚠️ Nota sobre os dados do Panorama Mundial

Os números de geração de e-lixo por país são **estimativas plausíveis para fins educativos**,
não valores oficiais linha a linha. Antes de usar em uma apresentação/defesa acadêmica, vale
substituir pelos números da edição mais recente do *Global E-waste Monitor* (UNITAR/ITU/UNU) e
citar a fonte.

## 📄 Licença

Projeto acadêmico — livre para estudo, adaptação e uso educacional.

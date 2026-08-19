import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { StoryDeck } from "../components/landing/StoryDeck";
import { ImpactDial } from "../components/landing/ImpactDial";
import { Marquee } from "../components/landing/Marquee";
import { SpotlightCard } from "../components/landing/SpotlightCard";
import { ImpactPreview } from "../components/landing/ImpactPreview";
import { LineIcon } from "../components/ui/LineIcon";
import { Button } from "../components/ui/Button";
import { SoundToggle } from "../components/ui/SoundToggle";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { useSound } from "../lib/useSound";
import { WASTE_CATEGORIES, CO2_PER_TREE_PER_YEAR } from "../lib/impact";
import "./Landing.css";

// Estatísticas do cenário nacional, dispostas como um mostrador de
// relógio (00h / 06h / 12h / 18h) — referência direta ao menu de
// capítulos em formato de horário do lemansclassic.richardmille.com.
const SCENARIO_STATS = [
  {
    id: "gerado",
    hour: "00h",
    value: 2.4,
    decimals: 1,
    suffix: " mi t",
    label: "e-lixo gerado por ano",
    hint: "no Brasil / ano",
  },
  {
    id: "coletado",
    hour: "06h",
    value: 1,
    decimals: 0,
    prefix: "~",
    suffix: "%",
    label: "é coletado formalmente",
    hint: "por canais adequados",
  },
  {
    id: "crescimento",
    hour: "12h",
    value: 2,
    decimals: 0,
    prefix: "+",
    suffix: "×",
    label: "ritmo de crescimento",
    hint: "vs. população mundial",
  },
  {
    id: "arvore",
    hour: "18h",
    value: CO2_PER_TREE_PER_YEAR,
    decimals: 0,
    suffix: " kg",
    label: "CO2/árvore/ano",
    hint: "referência de conversão",
  },
];

const EASE = [0.16, 1, 0.3, 1];

// Cada "assinatura" de animação é usada em um slide diferente —
// a ideia é que cada capítulo da história entre de um jeito
// visualmente distinto, nunca o mesmo fade genérico repetido.
const staggerContainer = (stagger = 0.08, delay = 0.05) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -56 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 56 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};
const wordPop = {
  hidden: { opacity: 0, y: 26, rotate: -3 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.55, ease: EASE } },
};
const scaleSpin = {
  hidden: { opacity: 0, scale: 0.82, rotate: -6 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.85, ease: EASE } },
};
const springPop = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } },
};

const viewportOnce = { once: true, amount: 0.5 };

const HOW_IT_WORKS = [
  { icon: "chip", title: "Registra", text: "Cada depósito vira um dado: peso, tipo de resíduo, autor." },
  { icon: "leaf", title: "Calcula", text: "O motor de impacto converte kg em CO2 evitado e árvores equivalentes." },
  { icon: "misc", title: "Prova", text: "A escola sai com números citáveis — não só pontos de um jogo." },
];

export default function Landing() {
  const { enabled, toggle, playClick, playHover } = useSound();

  // ============ CONTEÚDO DE CADA "CAPÍTULO" DA HISTÓRIA ============
  const slides = [
    {
      id: "intro",
      label: "Abertura",
      content: (
        <motion.div
          className="story-content story-content-hero"
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
        >
          <motion.p className="eyebrow" variants={fadeUp}>Lixeira Tech — Gamificação ambiental</motion.p>
          <h1 className="display story-hero-title">
            <motion.span className="hero-word" variants={wordPop} onMouseEnter={playHover}>Cada</motion.span>{" "}
            <motion.span className="hero-word" variants={wordPop} onMouseEnter={playHover}>resíduo</motion.span>{" "}
            <motion.span className="hero-word text-accent" variants={wordPop} onMouseEnter={playHover}>é um dado.</motion.span>
            <br />
            <motion.span className="hero-word" variants={wordPop} onMouseEnter={playHover}>Cada</motion.span>{" "}
            <motion.span className="hero-word" variants={wordPop} onMouseEnter={playHover}>dado,</motion.span>{" "}
            <motion.span className="hero-word text-accent" variants={wordPop} onMouseEnter={playHover}>uma prova.</motion.span>
          </h1>
          <motion.p className="story-hero-sub text-dim" variants={fadeUp}>Role para começar a história.</motion.p>
        </motion.div>
      ),
    },
    {
      id: "problema",
      label: "01 — O problema",
      content: (
        <div className="story-content">
          <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeLeft}>
            01 — O problema
          </motion.p>
          <motion.h2
            className="display story-title"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeLeft}
            transition={{ delay: 0.08 }}
          >
            O e-lixo é o resíduo que ninguém vê crescer.
          </motion.h2>
          <motion.p
            className="story-body text-dim"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ delay: 0.22 }}
          >
            Celulares, notebooks e placas descartados não cheiram, não fazem barulho, não
            aparecem no noticiário todo dia. Mas se acumulam — e o{" "}
            <strong className="text-accent">Brasil é um dos maiores geradores de lixo
            eletrônico do mundo</strong>, com a maior parte disso sem qualquer destinação correta.
          </motion.p>
        </div>
      ),
    },
    {
      id: "dificuldade",
      label: "02 — A dificuldade",
      content: (
        <div className="story-content story-content-wide">
          <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp}>
            02 — A dificuldade
          </motion.p>
          <motion.h2
            className="display story-title-sm"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ delay: 0.08 }}
          >
            Os números que ninguém está mostrando.
          </motion.h2>
          <motion.div
            style={{ width: "100%" }}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={scaleSpin}
            transition={{ delay: 0.15 }}
          >
            <ErrorBoundary>
              <ImpactDial stats={SCENARIO_STATS} />
            </ErrorBoundary>
          </motion.div>
        </div>
      ),
    },
    {
      id: "solucao",
      label: "03 — A solução",
      content: (
        <div className="story-content story-content-wide">
          <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp}>
            03 — A solução
          </motion.p>
          <motion.h2
            className="display story-title-sm"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ delay: 0.08 }}
          >
            Transformar descarte em dado — e dado em prova.
          </motion.h2>
          <motion.div
            className="how-it-works"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer(0.12, 0.2)}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.title} variants={fadeUp}>
                <SpotlightCard className="how-it-works-card" onMouseEnter={playHover}>
                  <LineIcon name={step.icon} size={32} delay={i * 0.05} className="text-accent" />
                  <span className="mono how-it-works-title">{step.title}</span>
                  <p className="text-dim how-it-works-text">{step.text}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ),
    },
    {
      id: "prova",
      label: "04 — A prova",
      content: (
        <div className="story-content">
          <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeLeft}>
            04 — A prova
          </motion.p>
          <motion.h2
            className="display story-title-sm"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeLeft}
            transition={{ delay: 0.08 }}
          >
            A comunidade já está gerando resultado.
          </motion.h2>
          <motion.p
            className="story-body text-dim"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ delay: 0.18 }}
          >
            Cada pessoa constrói um histórico real de impacto —
            números que podem ser citados, comparados e apresentados como prova de mudança
            de comportamento.
          </motion.p>
          <motion.div
            style={{ width: "100%" }}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={fadeRight}
            transition={{ delay: 0.3 }}
          >
            <ErrorBoundary>
              <ImpactPreview />
            </ErrorBoundary>
          </motion.div>
        </div>
      ),
    },
    {
      id: "venda",
      label: "05 — Comece agora",
      content: (
        <div className="story-content" style={{ textAlign: "center", alignItems: "center" }}>
          <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={viewportOnce} variants={fadeUp}>
            05 — Comece agora
          </motion.p>
          <motion.h2
            className="display story-title cta-title"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={springPop}
          >
            Sua escola também pode<br />virar esse número em algo real.
          </motion.h2>
          <motion.div
            className="cta-actions"
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            variants={staggerContainer(0.1, 0.35)}
          >
            <motion.div variants={fadeUp}>
              <Button as={Link} to="/cadastro" onMouseEnter={playHover} onClick={playClick}>
                Cadastrar minha escola
              </Button>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Button as={Link} to="/login" variant="ghost" onMouseEnter={playHover} onClick={playClick}>
                Já tenho conta
              </Button>
            </motion.div>
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <div className="landing">
      <SoundToggle enabled={enabled} onToggle={() => { toggle(); playClick(); }} onHover={playHover} />

      <ErrorBoundary
        fallback={
          <div className="story-fallback container">
            <h2 className="display">Cada resíduo é um dado. Cada dado, uma prova.</h2>
            <Button as={Link} to="/cadastro">Cadastrar minha escola</Button>
          </div>
        }
      >
        <StoryDeck slides={slides} />
      </ErrorBoundary>

      <Marquee text="TRANSFORME DESCARTE EM DADO" />

      {/* ============ CATEGORIAS — detalhe além da história principal ============ */}
      <section className="section container">
        <p className="eyebrow">O que pode virar impacto</p>
        <h2 className="display section-title">Cada categoria tem um peso ambiental diferente.</h2>
        <div className="category-grid">
          {WASTE_CATEGORIES.slice(0, 6).map((cat, i) => (
            <SpotlightCard key={cat.key} className="category-item" onMouseEnter={playHover}>
              <LineIcon name={cat.icon} size={40} delay={i * 0.05} className="text-accent" />
              <span className="mono">{cat.label}</span>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* ============ BLOCOS EDITORIAIS ============ */}
      <section className="section container">
        <div className="editorial-blocks">
          <Link to="/ranking" className="editorial-block" onMouseEnter={playHover} onClick={playClick}>
            <span className="editorial-block-kicker mono text-faint">Comunidade</span>
            <h3 className="display editorial-block-title">Quem já<br />virou impacto</h3>
            <span className="editorial-block-arrow" aria-hidden="true">→</span>
          </Link>
          <Link
            to="/cadastro"
            className="editorial-block editorial-block-accent"
            onMouseEnter={playHover}
            onClick={playClick}
          >
            <span className="editorial-block-kicker mono">Comece agora</span>
            <h3 className="display editorial-block-title">Cadastre<br />sua escola</h3>
            <span className="editorial-block-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Marquee text="LIXEIRA TECH" repeat={8} />

      <footer className="footer container mono text-faint">
        <span>LIXEIRA TECH — projeto acadêmico de gamificação ambiental</span>
      </footer>
    </div>
  );
}

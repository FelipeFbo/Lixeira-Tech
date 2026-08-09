import { motion, useTransform } from "framer-motion";
import "./ScrollPanel.css";

/**
 * Painel de texto que "flutua" sobre a cena 3D fixa (sticky) do hero.
 * O hero-track empilha o canvas 3D e os 3 painéis na MESMA posição da
 * tela (grid-area 1/1, ver Landing.css) — por isso a visibilidade de
 * cada painel precisa ser controlada pela posição real do scroll
 * (`progress`, 0→1 ao longo de toda a faixa), e não por "está visível
 * na tela" (whileInView), já que todos estão sempre sobrepostos.
 *
 * `range` = [start, end] é a fatia de `progress` em que este painel é
 * o protagonista; fora dela ele fica com opacidade 0.
 */
export function ScrollPanel({ eyebrow, title, children, align = "left", progress, range }) {
  const [start, end] = range;
  const span = end - start;
  // pequenas margens de fade-in/fade-out dentro da própria fatia,
  // pra transição suave em vez de corte seco entre um painel e outro
  const fadeIn = start + span * 0.15;
  const fadeOut = end - span * 0.15;

  const opacity = useTransform(progress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, fadeIn], [24, 0]);

  return (
    <div className={`scroll-panel scroll-panel-${align}`}>
      <motion.div className="scroll-panel-inner" style={{ opacity, y }}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2 className="display scroll-panel-title">{title}</h2>}
        <div className="scroll-panel-body">{children}</div>
      </motion.div>
    </div>
  );
}

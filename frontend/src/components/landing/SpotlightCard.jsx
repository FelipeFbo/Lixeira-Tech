import { useRef } from "react";
import { motion } from "framer-motion";
import "./SpotlightCard.css";

/**
 * Card com spotlight/borda reagindo ao cursor — padrão recorrente em
 * sites curados no recent.design ("border beam effect", hover-reveal
 * cards). A posição do mouse vira variáveis CSS (--x/--y) consumidas
 * por um gradiente radial no ::before, sem depender de bibliotecas
 * extras.
 */
export function SpotlightCard({ children, className = "", onMouseEnter, ...props }) {
  const ref = useRef(null);

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <motion.div
      ref={ref}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

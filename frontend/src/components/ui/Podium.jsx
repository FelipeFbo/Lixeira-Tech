import { motion } from "framer-motion";
import "./Podium.css";

/**
 * Pódio visual dos 3 primeiros colocados, baseado em impacto real
 * (kg de CO2 evitado), com pontos como legenda secundária.
 * entries: [{ name, co2Kg, points }] já ordenado por posição.
 */
export function Podium({ entries = [] }) {
  const order = [1, 0, 2]; // 2º, 1º, 3º — arranjo visual clássico de pódio
  const heights = { 0: 180, 1: 130, 2: 100 };

  return (
    <div className="podium">
      {order.map((idx) => {
        const entry = entries[idx];
        if (!entry) return <div key={idx} className="podium-slot podium-empty" />;
        return (
          <motion.div
            key={idx}
            className={`podium-slot podium-rank-${idx + 1}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="podium-rank mono">#{idx + 1}</div>
            <div className="podium-name">{entry.name}</div>
            <div className="podium-co2 mono text-accent">{entry.co2Kg?.toFixed(1)} kg CO2</div>
            <div
              className="podium-bar"
              style={{ height: heights[idx] }}
            >
              <span className="podium-points mono">{entry.points} pts</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

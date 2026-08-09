import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Podium } from "../components/ui/Podium";
import "./Ranking.css";

export default function Ranking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.leaderboard.global()
      .then((data) => setRows(data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const entries = rows.map((r) => ({
    name: r.name,
    points: r.points,
    co2Kg: Number(r.co2Kg || 0),
  }));

  return (
    <div className="ranking container">
      <p className="eyebrow">Impacto da comunidade</p>
      <h1 className="display ranking-title">Quem está transformando descarte em resultado.</h1>

      {!loading && entries.length > 0 && (
        <motion.div layout className="ranking-podium-wrap">
          <Podium entries={entries.slice(0, 3)} />
        </motion.div>
      )}

      <motion.ol layout className="ranking-list">
        {entries.slice(3).map((entry, i) => (
          <motion.li
            layout
            key={`${entry.name}-${i}`}
            className="ranking-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <span className="mono text-faint">#{i + 4}</span>
            <span className="ranking-row-name">{entry.name}</span>
            <span className="mono text-accent">~{entry.co2Kg.toFixed(1)} kg CO2</span>
            <span className="text-faint mono ranking-row-points">{entry.points} pts</span>
          </motion.li>
        ))}
      </motion.ol>

      {!loading && entries.length === 0 && (
        <p className="text-dim ranking-empty">Ainda não há depósitos aprovados nesse recorte.</p>
      )}
    </div>
  );
}

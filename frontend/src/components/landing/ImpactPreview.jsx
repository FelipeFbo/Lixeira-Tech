import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import { AVG_CO2_PER_POINT_SAFE } from "../../lib/impact";
import "./ImpactPreview.css";

// /api/leaderboard/global retorna apenas pontos (dado técnico), sem o
// histórico de depósitos de cada pessoa — por isso usamos aqui a mesma
// estimativa média documentada em lib/impact.js, só para efeito ilustrativo.
// O valor exato de cada pessoa aparece no dashboard, calculado a partir do
// histórico real de depósitos.

/**
 * Prévia leve do ranking/impacto da comunidade na landing. Falha de
 * forma graciosa (não quebra a landing) se a API não estiver acessível
 * no momento — mostra um estado de placeholder discreto.
 */
export function ImpactPreview() {
  const [state, setState] = useState({ loading: true, error: false, entries: [] });

  useEffect(() => {
    let cancelled = false;
    api.leaderboard
      .global()
      .then((rows) => {
        if (cancelled) return;
        setState({ loading: false, error: false, entries: (rows || []).slice(0, 3) });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, entries: [] });
      });
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return <div className="impact-preview-skeleton mono text-dim">Carregando impacto da comunidade…</div>;
  }

  if (state.error || state.entries.length === 0) {
    return (
      <div className="impact-preview-skeleton mono text-dim">
        O ranking da comunidade aparece aqui assim que o primeiro depósito for aprovado.
      </div>
    );
  }

  return (
    <div className="impact-preview">
      {state.entries.map((entry, i) => {
        const estimatedCo2 = Number(entry.points || 0) * AVG_CO2_PER_POINT_SAFE;
        return (
          <motion.div
            key={entry.name || i}
            className="impact-preview-row"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <span className="mono text-faint">#{entry.rank ?? i + 1}</span>
            <span className="impact-preview-name">
              {entry.name}
              {entry.class && <span className="text-dim mono impact-preview-class"> · {entry.class}</span>}
            </span>
            <span className="mono text-accent">~{estimatedCo2.toFixed(1)} kg CO2</span>
          </motion.div>
        );
      })}
      <p className="impact-preview-note mono text-faint">
        estimativa ilustrativa — o impacto exato de cada pessoa aparece no dashboard
      </p>
    </div>
  );
}

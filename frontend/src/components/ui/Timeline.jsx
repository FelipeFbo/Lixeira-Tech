import { motion } from "framer-motion";
import { calculateImpact } from "../../lib/impact";
import { LineIcon } from "./LineIcon";
import "./Timeline.css";

const STATUS_LABEL = {
  approved: { label: "Aprovado", color: "var(--color-accent)" },
  pending: { label: "Em análise", color: "var(--color-support-amber)" },
  rejected: { label: "Rejeitado", color: "var(--color-support-coral)" },
};

const TYPE_TO_ICON = {
  celular: "phone", notebook: "laptop", placa_mae: "chip",
  bateria: "battery", monitor: "monitor", cabo: "cable", pilha: "cell",
};

/**
 * Histórico de depósitos como linha do tempo visual, não tabela crua.
 * deposits: itens vindos de GET /api/deposits/:userId
 */
export function Timeline({ deposits = [] }) {
  if (deposits.length === 0) {
    return <p className="text-dim">Nenhum depósito registrado ainda. Que tal começar agora?</p>;
  }

  return (
    <ol className="timeline">
      {deposits.map((d, i) => {
        const impact = calculateImpact(d.weight, d.wasteType);
        const status = STATUS_LABEL[d.status] || STATUS_LABEL.pending;
        return (
          <motion.li
            key={d.id}
            className="timeline-item"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="timeline-marker" style={{ borderColor: status.color }}>
              <LineIcon name={TYPE_TO_ICON[d.wasteType] || "misc"} size={22} animate={false} />
            </div>
            <div className="timeline-content">
              <div className="timeline-row">
                <span className="timeline-type">{d.wasteType}</span>
                <span className="timeline-status mono" style={{ color: status.color }}>{status.label}</span>
              </div>
              <div className="timeline-meta mono text-dim">
                {new Date(d.date).toLocaleDateString("pt-BR")} · {d.weight} kg
              </div>
              {d.status === "approved" && (
                <div className="timeline-impact mono text-accent">
                  +{impact.co2Kg} kg CO2 evitado · +{d.points} pts
                </div>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

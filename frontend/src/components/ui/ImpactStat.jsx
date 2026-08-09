import { CountUp } from "./CountUp";
import "./ImpactStat.css";

/**
 * Bloco de estatística de impacto. Regra de produto: impacto real
 * (kg / CO2 / árvores) sempre em destaque; pontos aparecem como
 * dado técnico secundário, nunca como protagonista.
 */
export function ImpactStat({ label, value, decimals = 1, suffix = "", icon, accent = "accent" }) {
  return (
    <div className={`impact-stat impact-stat-${accent}`}>
      {icon && <div className="impact-stat-icon">{icon}</div>}
      <div className="impact-stat-value">
        <CountUp value={value} decimals={decimals} suffix={suffix} className="fs-mono-xl" />
      </div>
      <div className="impact-stat-label eyebrow">{label}</div>
    </div>
  );
}

export function PointsBadge({ points }) {
  return (
    <div className="points-badge mono">
      <span>{points}</span> pts <span className="text-faint">(técnico)</span>
    </div>
  );
}

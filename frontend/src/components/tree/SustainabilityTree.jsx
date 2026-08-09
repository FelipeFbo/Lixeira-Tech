import { motion } from "framer-motion";
import { TREE_STAGES, getTreeStage, getEnvironmentalLevel } from "../../lib/impact";
import "./SustainabilityTree.css";

/**
 * Árvore da Sustentabilidade: representação visual do progresso do
 * usuário, calculada a partir do total de kg de e-lixo desviado
 * (mesma fonte de dado que já alimenta os ImpactStat do dashboard).
 * Não exige nenhum campo novo no back-end.
 */
export function SustainabilityTree({ ewasteKg = 0, points = 0, streakDays = 0 }) {
  const { stage, stageIndex, totalStages, next, progressToNext } = getTreeStage(ewasteKg);
  const { level, xpIntoLevel, xpForNextLevel } = getEnvironmentalLevel(points);

  return (
    <div className="sustainability-tree">
      <div className="sustainability-tree-visual">
        <motion.div
          key={stage.key}
          className="sustainability-tree-emoji"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {stage.icon}
        </motion.div>
        <div className="sustainability-tree-stages">
          {TREE_STAGES.map((s, i) => (
            <span
              key={s.key}
              className={`sustainability-tree-node ${i <= stageIndex ? "is-reached" : ""}`}
              title={s.label}
            />
          ))}
        </div>
      </div>

      <div className="sustainability-tree-info">
        <p className="eyebrow">Árvore da sustentabilidade</p>
        <h3 className="display sustainability-tree-stage-name">{stage.label}</h3>

        {next ? (
          <>
            <div className="sustainability-tree-progress-track">
              <motion.div
                className="sustainability-tree-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext * 100}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="text-dim fs-body-sm">
              Faltam {Math.max(0, next.minKg - ewasteKg).toFixed(1)} kg para virar {next.label.toLowerCase()}
            </p>
          </>
        ) : (
          <p className="text-accent fs-body-sm">Estágio máximo alcançado 🌟</p>
        )}

        <div className="sustainability-tree-meta">
          <div>
            <span className="mono text-accent">Nível {level}</span>
            <p className="text-dim fs-body-sm">{xpIntoLevel}/{xpForNextLevel} XP ambiental</p>
          </div>
          {streakDays > 0 && (
            <div>
              <span className="mono">{streakDays}🔥</span>
              <p className="text-dim fs-body-sm">dias seguidos usando o sistema</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

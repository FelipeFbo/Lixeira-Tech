import { motion, AnimatePresence } from "framer-motion";
import "./AchievementsGrid.css";

export function AchievementsGrid({ achievements = [] }) {
  return (
    <div className="achievements-grid">
      <AnimatePresence>
        {achievements.map((a, i) => (
          <motion.div
            key={a.key}
            className={`achievement-badge ${a.unlocked ? "is-unlocked" : "is-locked"}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
            title={a.description}
          >
            <span className="achievement-badge-icon">{a.unlocked ? a.icon : "🔒"}</span>
            <span className="achievement-badge-title mono">{a.title}</span>
            <span className="achievement-badge-desc text-dim">{a.description}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

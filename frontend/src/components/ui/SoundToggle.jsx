import { motion } from "framer-motion";
import "./SoundToggle.css";

/**
 * Botão flutuante "Sound: On/Off" — referência direta ao toggle do
 * lemansclassic.richardmille.com (texto sempre visível, nunca só um
 * ícone) e ao "Click to enable sound" do aether1.ai. Fica ancorado no
 * canto da viewport, acompanha o scroll (position: fixed).
 */
export function SoundToggle({ enabled, onToggle, onHover }) {
  return (
    <motion.button
      type="button"
      className={`sound-toggle mono ${enabled ? "is-on" : ""}`}
      onClick={onToggle}
      onMouseEnter={onHover}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-pressed={enabled}
      aria-label={enabled ? "Desativar som" : "Ativar som"}
    >
      <span className="sound-toggle-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      Som: {enabled ? "On" : "Off"}
    </motion.button>
  );
}

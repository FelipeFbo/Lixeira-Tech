import { motion } from "framer-motion";
import { LineIcon } from "../ui/LineIcon";
import "./AuthAmbient.css";

const ICONS = ["phone", "laptop", "chip", "battery", "cable", "leaf"];

/**
 * Painel esquerdo das telas de login/cadastro: ícones line-art
 * flutuando em loop lento. Leve o suficiente para não pesar
 * (SVG + CSS transforms, sem WebGL).
 */
export function AuthAmbient() {
  return (
    <div className="auth-ambient">
      <div className="auth-ambient-grid">
        {ICONS.map((name, i) => (
          <motion.div
            key={name}
            className="auth-ambient-icon"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            <LineIcon name={name} size={56} />
          </motion.div>
        ))}
      </div>
      <div className="auth-ambient-copy">
        <p className="eyebrow">Lixeira Tech</p>
        <h1 className="display auth-ambient-title">Todo depósito<br/>conta uma história.</h1>
      </div>
    </div>
  );
}

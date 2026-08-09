import { motion, useTransform } from "framer-motion";
import { LineIcon } from "../ui/LineIcon";
import "./HeroBackdrop.css";

/**
 * Pano de fundo fixo (sticky) da faixa de scrollytelling — versão sem
 * WebGL do que antes era a cena Three.js. Em vez de um objeto 3D, usa
 * malha de gradiente + grade de números mono + ícones line-art à deriva,
 * todos reagindo ao progresso do scroll (0→1). Mantém o mesmo "peso"
 * cinematográfico das referências (saze/le mans) sem o custo de GPU.
 */
export function HeroBackdrop({ progress }) {
  const blobX = useTransform(progress, [0, 1], ["-10%", "30%"]);
  const blobY = useTransform(progress, [0, 0.5, 1], ["-10%", "20%", "60%"]);
  const rotate = useTransform(progress, [0, 1], [0, 40]);
  const gridOpacity = useTransform(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const iconOpacity = useTransform(progress, [0, 0.34, 0.5, 0.66, 1], [0.5, 0.9, 0.5, 0.9, 0.5]);

  return (
    <div className="hero-backdrop" aria-hidden="true">
      <motion.div className="hero-backdrop-blob" style={{ x: blobX, y: blobY, rotate }} />
      <motion.div className="hero-backdrop-grid" style={{ opacity: gridOpacity }} />

      <motion.div className="hero-backdrop-icon hero-backdrop-icon-1" style={{ opacity: iconOpacity }}>
        <LineIcon name="phone" size={120} animate={false} />
      </motion.div>
      <motion.div className="hero-backdrop-icon hero-backdrop-icon-2" style={{ opacity: iconOpacity }}>
        <LineIcon name="chip" size={90} animate={false} />
      </motion.div>
      <motion.div className="hero-backdrop-icon hero-backdrop-icon-3" style={{ opacity: iconOpacity }}>
        <LineIcon name="leaf" size={150} animate={false} />
      </motion.div>

      <div className="hero-backdrop-vignette" />
    </div>
  );
}

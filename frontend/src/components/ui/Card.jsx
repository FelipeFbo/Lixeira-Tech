import { motion } from "framer-motion";
import "./Card.css";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <motion.div
      className={`card ${hover ? "card-hover" : ""} ${className}`}
      whileHover={hover ? { y: -4, borderColor: "var(--color-border-strong)" } : undefined}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

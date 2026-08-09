import { motion } from "framer-motion";

/**
 * Ícones em line-art (stroke apenas, sem fill) com animação de
 * "desenho" via pathLength. Usados nas categorias de resíduo,
 * tanto na landing (storytelling) quanto no fluxo de depósito
 * (funcional, mas mantendo a mesma linguagem visual).
 */
const PATHS = {
  phone: [
    "M9 2h6a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z",
    "M11 19h2",
  ],
  laptop: [
    "M4 5h16v10H4z",
    "M2 19h20l-2-4H4l-2 4Z",
  ],
  chip: [
    "M7 7h10v10H7z",
    "M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3",
  ],
  battery: [
    "M3 8h15v9H3z",
    "M18 10.5h2.5v4H18",
    "M6 11v4M9 11v4",
  ],
  monitor: [
    "M3 4h18v12H3z",
    "M9 20h6M12 16v4",
  ],
  cable: [
    "M4 8c4 0 4 8 8 8s4-8 8-8",
    "M4 5v3M20 5v3",
  ],
  cell: [
    "M8 3h8l1 5v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z",
  ],
  misc: [
    "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z",
  ],
  leaf: [
    "M4 20C4 10 12 4 20 4c0 8-6 16-16 16Z",
    "M4 20c3-6 8-10 14-13",
  ],
};

export function LineIcon({ name = "misc", size = 40, animate = true, delay = 0, className = "" }) {
  const paths = PATHS[name] || PATHS.misc;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
          whileInView={animate ? { pathLength: 1, opacity: 1 } : undefined}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, delay: delay + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}

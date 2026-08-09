import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CountUp } from "../ui/CountUp";
import { useSound } from "../../lib/useSound";
import "./ImpactDial.css";

const SIZE = 360;
const CENTER = SIZE / 2;
const R_TICKS = 155;
const R_DOT = 136;
const R_FACE = 112;

/**
 * Mostrador circular de métricas — a peça central de "exibição de
 * números" da landing, inspirada no menu de capítulos em formato de
 * relógio do lemansclassic.richardmille.com (cada capítulo cravado num
 * horário: 06:30, 10:30, 12:45...). Aqui cada "horário" é substituído
 * por uma métrica real de impacto ambiental, cravada ao redor do
 * mostrador como se fosse a agenda do dia da comunidade.
 *
 * `stats`: [{ id, hour: "02h", value, decimals, prefix, suffix, label, hint }]
 */
export function ImpactDial({ stats }) {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { playTick, playHover } = useSound();

  const positioned = useMemo(
    () =>
      stats.map((s, i) => {
        const angle = (i / stats.length) * 360 - 90; // começa no topo (12h)
        const rad = (angle * Math.PI) / 180;
        return {
          ...s,
          angle,
          dot: { x: CENTER + R_DOT * Math.cos(rad), y: CENTER + R_DOT * Math.sin(rad) },
          tickOuter: { x: CENTER + R_TICKS * Math.cos(rad), y: CENTER + R_TICKS * Math.sin(rad) },
        };
      }),
    [stats]
  );

  return (
    <div className="impact-dial" ref={ref}>
      <div className="impact-dial-face">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="impact-dial-svg" aria-hidden="true">
          {/* trilha externa fina */}
          <circle cx={CENTER} cy={CENTER} r={R_TICKS} className="dial-ring" />
          <circle cx={CENTER} cy={CENTER} r={R_FACE} className="dial-ring dial-ring-inner" />

          {/* 60 marcações finas, como um mostrador de relógio de verdade */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const isMajor = i % 5 === 0;
            const rOuter = R_TICKS;
            const rInner = R_TICKS - (isMajor ? 14 : 6);
            return (
              <line
                key={i}
                x1={CENTER + rOuter * Math.cos(rad)}
                y1={CENTER + rOuter * Math.sin(rad)}
                x2={CENTER + rInner * Math.cos(rad)}
                y2={CENTER + rInner * Math.sin(rad)}
                className={isMajor ? "dial-tick dial-tick-major" : "dial-tick"}
              />
            );
          })}

          {/* ponteiro lento, sempre girando — o "tempo" da comunidade nunca para */}
          <motion.line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2={CENTER - R_FACE + 10}
            className="dial-hand"
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          />

          {/* linhas conectando cada métrica ao seu ponto no mostrador */}
          {positioned.map((s, i) => (
            <line
              key={s.id}
              x1={s.dot.x}
              y1={s.dot.y}
              x2={s.tickOuter.x}
              y2={s.tickOuter.y}
              className={`dial-spoke ${active === i ? "is-active" : ""}`}
            />
          ))}

          {/* pontos de cada métrica */}
          {positioned.map((s, i) => (
            <circle
              key={s.id}
              cx={s.dot.x}
              cy={s.dot.y}
              r={active === i ? 7 : 5}
              className={`dial-dot ${active === i ? "is-active" : ""}`}
            />
          ))}

          <circle cx={CENTER} cy={CENTER} r={4} className="dial-hub" />
        </svg>

        <div className="impact-dial-center">
          <span className="eyebrow">{positioned[active]?.hour}</span>
          <span className="impact-dial-value">
            {isInView && (
              <CountUp
                value={positioned[active]?.value ?? 0}
                decimals={positioned[active]?.decimals ?? 0}
                prefix={positioned[active]?.prefix ?? ""}
                suffix={positioned[active]?.suffix ?? ""}
                className="fs-mono-xl text-accent"
              />
            )}
          </span>
          <span className="impact-dial-label">{positioned[active]?.label}</span>
        </div>
      </div>

      <ul className="impact-dial-legend">
        {positioned.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`impact-dial-legend-btn mono ${active === i ? "is-active" : ""}`}
              onClick={() => {
                setActive(i);
                playTick();
              }}
              onMouseEnter={() => {
                setActive(i);
                playHover();
              }}
            >
              <span className="impact-dial-legend-hour text-faint">{s.hour}</span>
              <span className="impact-dial-legend-label">{s.label}</span>
              <span className="impact-dial-legend-hint text-dim">{s.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

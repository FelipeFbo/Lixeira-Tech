import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Contador animado. Sobe suavemente de 0 até `value` quando entra
 * na viewport (usado nos heros de impacto — kg, CO2, árvores).
 *
 * IMPORTANTE: o valor exibido fica em estado do React (`useState`),
 * nunca escrito diretamente no DOM via `textContent`. Um <span> cujo
 * conteúdo é gerenciado pelo React não pode ser mutado por fora dele
 * (mesmo "só o texto") — isso descasa a árvore de fibers do que está
 * de fato no DOM e derruba o app com erros de reconciliação
 * (`insertBefore ... not a child of this node`) assim que o componente
 * pai re-renderiza por qualquer outro motivo (ex: troca de métrica
 * ativa no dial). Ficar 100% dentro do ciclo do React resolve isso.
 */
export function CountUp({ value = 0, decimals = 0, suffix = "", prefix = "", className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20, mass: 1 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => setDisplay(latest));
  }, [spring]);

  return (
    <span ref={ref} className={`mono ${className}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

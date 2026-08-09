import { useCallback, useState } from "react";
import { sound } from "./sound";

/**
 * Estado reativo do som ambiente + helpers já "guardados" contra o
 * toggle desligado (chamar playHover() com o som off é no-op, então os
 * componentes não precisam checar `enabled` toda vez que tocam algo).
 */
export function useSound() {
  const [enabled, setEnabledState] = useState(() => sound.isEnabled());

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabledState(next);
    sound.setEnabled(next);
    if (next) sound.chime();
  }, [enabled]);

  const guard = useCallback(
    (fn) => (...args) => {
      if (!sound.isEnabled()) return;
      fn(...args);
    },
    []
  );

  return {
    enabled,
    toggle,
    playClick: guard(sound.click),
    playHover: guard(sound.hover),
    playWhoosh: guard(sound.whoosh),
    playTick: guard(sound.tick),
  };
}

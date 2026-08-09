/**
 * Heurística simples para decidir se vale a pena carregar a cena 3D:
 * sem WebGL, em conexões muito fracas, ou se o usuário pediu
 * prefers-reduced-motion, caímos para o fallback leve (SVG estático).
 */
export function canRun3D() {
  if (typeof window === "undefined") return false;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return false;

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) return false;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export function isLowPowerDevice() {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 4;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile && cores <= 4;
}

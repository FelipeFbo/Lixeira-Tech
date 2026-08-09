import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenisInstance } from "./lenisInstance";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ativa o scroll suave (Lenis) e sincroniza com o GSAP ScrollTrigger,
 * para que a timeline 3D controlada por scroll (hero) e as animações
 * de scrollytelling fiquem no mesmo "relógio" do scroll.
 *
 * Desativado automaticamente se o usuário pedir prefers-reduced-motion,
 * ou em telas muito pequenas com baixa performance (fallback simples:
 * mantém scroll nativo do navegador).
 */
export function useLenis() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    setLenisInstance(lenis);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      setLenisInstance(null);
      gsap.ticker.remove(lenis.raf);
    };
  }, []);
}

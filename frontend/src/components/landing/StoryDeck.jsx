import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useSound } from "../../lib/useSound";
import { getLenis } from "../../lib/lenisInstance";
import "./StoryDeck.css";

const SNAP_IDLE_MS = 150; // tempo parado no scroll até "decidir" encaixar no slide mais perto
const SNAP_DURATION = 0.9; // segundos da animação de encaixe

/**
 * ============================================================
 * STORY DECK — scroll continua vertical (como sempre), mas cada
 * seção ocupa a tela inteira e "encaixa" (snap) na mais próxima
 * assim que o usuário para de rolar. O efeito é o de "passar de
 * slide/capítulo" sem nunca cortar ou sobrepor conteúdo — diferente
 * da primeira versão (pin + desliza para o lado), que conflitava com
 * o Lenis e deixava dois slides visíveis ao mesmo tempo.
 *
 * O snap é feito via `lenis.scrollTo` (o mesmo motor de scroll suave
 * do resto do site) para não “brigar” com o Lenis; se por algum
 * motivo o Lenis não estiver disponível, cai para `window.scrollTo`.
 */
export function StoryDeck({ slides }) {
  const trackRef = useRef(null);
  const slideRefsRef = useRef([]);
  const [active, setActive] = useState(0);
  const [trackInView, setTrackInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { playWhoosh } = useSound();

  slideRefsRef.current = [];
  const registerSlide = (el) => {
    if (el && !slideRefsRef.current.includes(el)) slideRefsRef.current.push(el);
  };

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const trackEl = trackRef.current;
    if (!trackEl) return undefined;

    let idleTimer = null;
    let isSnapping = false;

    const trackObserver = new IntersectionObserver(
      ([entry]) => setTrackInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    trackObserver.observe(trackEl);

    function closestSlideIndex() {
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      let closest = 0;
      let closestDist = Infinity;
      slideRefsRef.current.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const elCenter = window.scrollY + rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - viewportCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      return closest;
    }

    function isTrackNearViewport() {
      const rect = trackEl.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    function handleScroll() {
      if (isSnapping || !isTrackNearViewport()) return;

      const idx = closestSlideIndex();
      setActive((prev) => {
        if (prev !== idx) playWhoosh();
        return idx;
      });

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!isTrackNearViewport()) return;
        const targetIdx = closestSlideIndex();
        const targetEl = slideRefsRef.current[targetIdx];
        if (!targetEl) return;

        const targetY = window.scrollY + targetEl.getBoundingClientRect().top;
        if (Math.abs(targetY - window.scrollY) < 4) return; // já está encaixado

        isSnapping = true;
        const lenis = getLenis();
        if (lenis?.scrollTo) {
          lenis.scrollTo(targetY, {
            duration: SNAP_DURATION,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            onComplete: () => {
              isSnapping = false;
            },
          });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
          setTimeout(() => {
            isSnapping = false;
          }, SNAP_DURATION * 1000);
        }
      }, SNAP_IDLE_MS);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      trackObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(idleTimer);
    };
  }, [prefersReducedMotion, playWhoosh]);

  return (
    <div className="story-track" ref={trackRef}>
      {slides.map((slide, i) => (
        <section key={slide.id} ref={registerSlide} className="story-slide">
          {slide.content}
        </section>
      ))}

      {!prefersReducedMotion && trackInView && (
        <>
          <div className="story-progress mono" aria-hidden="true">
            <span className="story-progress-index text-accent">{String(active + 1).padStart(2, "0")}</span>
            <div className="story-progress-track">
              {slides.map((s, i) => (
                <span key={s.id} className={`story-progress-dot ${i === active ? "is-active" : ""}`} />
              ))}
            </div>
            <span className="story-progress-total text-faint">{String(slides.length).padStart(2, "0")}</span>
          </div>
          <span className="story-progress-label mono text-faint" aria-hidden="true">
            {slides[active]?.label}
          </span>
        </>
      )}
    </div>
  );
}

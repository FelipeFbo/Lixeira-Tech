import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DeviceToTreeScene } from "./DeviceToTreeScene";
import { canRun3D, isLowPowerDevice } from "../../lib/deviceCapability";
import { LineIcon } from "../ui/LineIcon";
import "./HeroScene.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * `scrollContainerRef` deve apontar para a section que serve de "trilho"
 * de scroll do hero (normalmente alta, ex: 250vh), para que o usuário
 * tenha espaço de rolagem suficiente para perceber a transição.
 */
export function HeroScene({ scrollContainerRef }) {
  const progressRef = useRef(0);
  const [enabled3D] = useState(() => canRun3D() && !isLowPowerDevice());

  useEffect(() => {
    if (!enabled3D || !scrollContainerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, [enabled3D, scrollContainerRef]);

  if (!enabled3D) {
    return (
      <div className="hero-fallback" aria-hidden="true">
        <LineIcon name="cell" size={140} />
        <LineIcon name="leaf" size={140} className="hero-fallback-leaf" />
      </div>
    );
  }

  return (
    <div className="hero-canvas-wrap">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <DeviceToTreeScene progressRef={progressRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

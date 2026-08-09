import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Cena central do hero. Não fazemos morphing de vértice real (custo alto
 * e frágil para o prazo do projeto) — em vez disso, cross-fade + transform
 * entre dois objetos wireframe (aparelho obsoleto -> árvore), o que já
 * comunica bem a metáfora "lixo eletrônico se transformando em algo vivo"
 * e é muito mais leve em dispositivos fracos.
 *
 * `progress` vem do ScrollTrigger (0 a 1) via prop, atualizado a cada frame
 * pelo componente pai (HeroScene), sem re-render do React.
 */
export function DeviceToTreeScene({ progressRef }) {
  const deviceGroup = useRef();
  const treeGroup = useRef();
  const particlesRef = useRef();

  const deviceGeom = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.1, 2.2, 0.12)), []);
  const camGeom = useMemo(() => new THREE.EdgesGeometry(new THREE.CircleGeometry(0.18, 24)), []);

  const trunkGeom = useMemo(() => new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.08, 0.14, 1.4, 8)), []);
  const canopyGeoms = useMemo(
    () => [
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.7, 0)),
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.5, 0)),
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.45, 0)),
    ],
    []
  );

  const particleGeom = useMemo(() => {
    const count = 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  useFrame((state) => {
    const t = progressRef.current ?? 0; // 0 = dispositivo, 1 = árvore
    const clock = state.clock.getElapsedTime();

    if (deviceGroup.current) {
      const deviceOpacity = THREE.MathUtils.clamp(1 - t * 1.4, 0, 1);
      deviceGroup.current.visible = deviceOpacity > 0.01;
      deviceGroup.current.traverse((obj) => {
        if (obj.material) obj.material.opacity = deviceOpacity;
      });
      deviceGroup.current.rotation.y = t * Math.PI * 1.2 + clock * 0.05;
      deviceGroup.current.scale.setScalar(1 - t * 0.4);
      deviceGroup.current.position.y = t * -0.6;
    }

    if (treeGroup.current) {
      const treeOpacity = THREE.MathUtils.clamp((t - 0.25) * 1.5, 0, 1);
      treeGroup.current.visible = treeOpacity > 0.01;
      treeGroup.current.traverse((obj) => {
        if (obj.material) obj.material.opacity = treeOpacity;
      });
      treeGroup.current.rotation.y = (1 - t) * -Math.PI * 0.4 + clock * 0.06;
      treeGroup.current.scale.setScalar(0.6 + t * 0.6);
      treeGroup.current.position.y = -0.4 + t * 0.2;
    }

    if (particlesRef.current) {
      // "poeira" de decomposição, mais visível na metade da transição
      const dustOpacity = Math.sin(Math.min(t, 1) * Math.PI) * 0.6;
      particlesRef.current.material.opacity = dustOpacity;
      particlesRef.current.rotation.y = clock * 0.03;
    }
  });

  return (
    <group>
      <group ref={deviceGroup}>
        <lineSegments geometry={deviceGeom}>
          <lineBasicMaterial color="#d4ff3d" transparent opacity={1} />
        </lineSegments>
        <lineSegments geometry={camGeom} position={[0, 0.85, 0.07]}>
          <lineBasicMaterial color="#d4ff3d" transparent opacity={1} />
        </lineSegments>
      </group>

      <group ref={treeGroup} position={[0, -0.4, 0]}>
        <lineSegments geometry={trunkGeom} position={[0, -0.3, 0]}>
          <lineBasicMaterial color="#d4ff3d" transparent opacity={0} />
        </lineSegments>
        {canopyGeoms.map((g, i) => (
          <lineSegments
            key={i}
            geometry={g}
            position={[i === 0 ? 0 : i === 1 ? -0.5 : 0.5, 0.6 + i * 0.15, 0]}
          >
            <lineBasicMaterial color="#d4ff3d" transparent opacity={0} />
          </lineSegments>
        ))}
      </group>

      <points ref={particlesRef} geometry={particleGeom}>
        <pointsMaterial color="#d4ff3d" size={0.02} transparent opacity={0} />
      </points>
    </group>
  );
}

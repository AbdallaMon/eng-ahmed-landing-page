import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// Minimal scene proving the contract end-to-end: procedural geometry, brand
// material, polyBudget-aware detail, reducedMotion-aware idle spin. Replaced per
// stage by the real scenes (SP-1..4); kept as the safe fallback for any unknown
// scene key.
export default function PlaceholderScene({ quality, reducedMotion }) {
  const ref = useRef();
  const detail = quality?.polyBudget >= 1 ? 1 : 0;

  useFrame((_, delta) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.3;
    ref.current.rotation.x += delta * 0.12;
  });

  return (
    <group>
      <mesh ref={ref} position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[1.4, detail]} />
        <meshStandardMaterial {...standardMat(PALETTE.gold)} />
      </mesh>
      {/* ground plane to catch the warm light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial {...standardMat(PALETTE.bg, { flat: false })} />
      </mesh>
    </group>
  );
}

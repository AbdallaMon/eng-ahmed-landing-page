import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// CancelScene — payment/booking CANCELLED. A quiet, desaturated "paused / on
// hold" tableau: two upright brown pause-bars on a dim plinth, encircled by a
// softly dimmed ring. Brand browns (brown/clay/goldDark), darker + higher
// roughness than the success/active scenes. Never alarming, never "error red".
// Procedural geometry only — texture-free, emissive kept dim.
export default function CancelScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // polyBudget → segment counts (sane mins so the low end still reads round).
  const ringSeg = budget >= 1 ? 64 : budget >= 0.75 ? 48 : 32;
  const ringTubeSeg = budget >= 1 ? 16 : budget >= 0.75 ? 10 : 6;
  const barSeg = budget >= 0.75 ? 2 : 1; // box subdivisions for flat-shaded facets
  const plinthSeg = budget >= 1 ? 48 : budget >= 0.75 ? 32 : 20;

  const group = useRef();
  const ring = useRef();
  const accent = useRef();

  // Darker, higher-roughness variants of the brand browns for the muted mood.
  const barMat = useMemo(
    () => standardMat(PALETTE.clay, { roughness: 0.88, metalness: 0.04 }),
    [],
  );
  const ringMat = useMemo(
    () => standardMat(PALETTE.goldDark, { roughness: 0.85, metalness: 0.08 }),
    [],
  );
  const plinthMat = useMemo(
    () => standardMat(PALETTE.brown, { roughness: 0.95, metalness: 0.02 }),
    [],
  );
  const groundMat = useMemo(
    () => standardMat(PALETTE.brown, { flat: false, roughness: 1, metalness: 0 }),
    [],
  );
  // Faint emissive "still alive" pulse — dim by design (this is the paused state).
  const accentColor = useMemo(() => PALETTE.gold.clone(), []);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    // Very slow, gentle rotation of the whole hero — the scene feels paused.
    if (group.current) group.current.rotation.y += delta * 0.08;
    // Faint breathing of the single dim emissive accent.
    if (accent.current) {
      const t = state.clock.elapsedTime;
      const pulse = 0.1 + 0.06 * (0.5 + 0.5 * Math.sin(t * 0.7));
      accent.current.material.emissiveIntensity = pulse;
    }
  });

  return (
    <group>
      {/* Hero: two upright pause-bars + an encircling dimmed ring, centered on origin. */}
      <group ref={group} position={[0, 0.2, 0]}>
        {/* Pause bars — calm, evenly spaced uprights. */}
        <mesh ref={accent} position={[-0.42, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 1.7, 0.42, barSeg, barSeg, barSeg]} />
          <meshStandardMaterial
            {...barMat}
            emissive={accentColor}
            emissiveIntensity={0.12}
          />
        </mesh>
        <mesh position={[0.42, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 1.7, 0.42, barSeg, barSeg, barSeg]} />
          <meshStandardMaterial {...barMat} />
        </mesh>

        {/* Softly dimmed ring around the bars, tilted slightly for depth. */}
        <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[1.55, 0.07, ringTubeSeg, ringSeg]} />
          <meshStandardMaterial {...ringMat} />
        </mesh>
      </group>

      {/* Dim brown plinth near the base. */}
      <mesh position={[0, -1.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.95, 0.3, plinthSeg]} />
        <meshStandardMaterial {...plinthMat} />
      </mesh>

      {/* Ground plane to ground the composition in shadow. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.3, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial {...groundMat} />
      </mesh>
    </group>
  );
}

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// IntroScene — the brand DESIGN hero. A refined low-poly golden villa maquette:
// a few stacked rectangular volumes with a flat roof + clean setbacks, a slim
// entrance canopy, and emissive cream window insets, sitting on a soft circular
// gold/cream plinth near y=-1.2. Reads as a premium interior-design brand hero.
//
// Contract: returns three.js JSX only (renders inside an existing <Canvas>).
// Camera looks at (0,0.2,0); content is centered on origin inside a ~6w×5h×6d box.
//
// polyBudget scaling: plinth radial segments + the number of emissive window
// rows on the tall tower scale with quality.polyBudget (with safe minimums) so
// low-end mobile stays cheap. reducedMotion → static pose, no useFrame.
export default function IntroScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // Cheap on low-end: round the circular plinth less and drop a window row.
  const plinthSegments = Math.max(24, Math.round(48 * budget));
  const towerWindowRows = budget >= 1 ? 4 : budget >= 0.75 ? 3 : 2;

  // Spin/bob the whole massing as one unit; pulse the window glow separately.
  const massingRef = useRef();

  // Per-window emissive cream material (cloned so the pulse is shared by ref but
  // the base look is consistent). Memoized so we build it once.
  const windowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: PALETTE.cream,
        emissive: PALETTE.cream,
        emissiveIntensity: 0.85,
        roughness: 0.5,
        metalness: 0.05,
        flatShading: true,
      }),
    [],
  );

  // Window inset positions on the tall tower's front face (+z). Rows scale with
  // budget; two columns. Built procedurally so counts stay data-driven.
  const towerWindows = useMemo(() => {
    const out = [];
    const cols = [-0.42, 0.42];
    const rowGap = 0.62;
    const baseY = 1.05;
    for (let r = 0; r < towerWindowRows; r += 1) {
      for (let c = 0; c < cols.length; c += 1) {
        out.push([cols[c], baseY + r * rowGap, 0.83]);
      }
    }
    return out;
  }, [towerWindowRows]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (massingRef.current) {
      // Slow turntable + very gentle vertical bob.
      massingRef.current.rotation.y += delta * 0.2;
      massingRef.current.position.y =
        0.06 * Math.sin(state.clock.elapsedTime * 0.6);
    }
    // Soft pulse on the shared window glow.
    windowMat.emissiveIntensity =
      0.85 + 0.25 * Math.sin(state.clock.elapsedTime * 1.4);
  });

  // Static reduced-motion pose: steady, slightly brighter glow (no per-frame pulse).
  if (reducedMotion) windowMat.emissiveIntensity = 0.95;

  return (
    <group>
      {/* ---- Circular plinth / base near y=-1.2 (gold rim + cream top) ---- */}
      <group position={[0, -1.2, 0]}>
        {/* gold base cylinder */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.34, plinthSegments]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>
        {/* slightly inset cream cap to read as a polished plinth top */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[2.2, 2.3, 0.06, plinthSegments]} />
          <meshStandardMaterial {...standardMat(PALETTE.cream, { roughness: 0.55 })} />
        </mesh>
        {/* soft brown shadow ring under the structure footprint */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.335, 0]}>
          <circleGeometry args={[1.6, plinthSegments]} />
          <meshStandardMaterial
            {...standardMat(PALETTE.brown, { roughness: 0.9 })}
            transparent
            opacity={0.18}
          />
        </mesh>
      </group>

      {/* ---- The villa massing (everything that spins/bobs together) ---- */}
      <group ref={massingRef}>
        {/* Base wide volume (ground floor slab) */}
        <mesh position={[0, -0.55, 0]} castShadow>
          <boxGeometry args={[3.0, 0.9, 2.4]} />
          <meshStandardMaterial {...standardMat(PALETTE.gold)} />
        </mesh>

        {/* Mid volume — setback on +x, lifted, the main living block */}
        <mesh position={[-0.35, 0.25, 0.1]} castShadow>
          <boxGeometry args={[2.2, 0.7, 2.0]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>

        {/* Tall tower volume — clean vertical accent, setback again */}
        <mesh position={[0.55, 0.95, -0.1]} castShadow>
          <boxGeometry args={[1.5, 2.4, 1.6]} />
          <meshStandardMaterial {...standardMat(PALETTE.gold)} />
        </mesh>

        {/* Flat roof cap / parapet on the tower for a crisp modern top */}
        <mesh position={[0.55, 2.2, -0.1]}>
          <boxGeometry args={[1.62, 0.12, 1.72]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>

        {/* Slim flat roof slab over the mid volume */}
        <mesh position={[-0.35, 0.63, 0.1]}>
          <boxGeometry args={[2.32, 0.1, 2.12]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>

        {/* ---- Slim entrance canopy (cantilevered over the door) ---- */}
        {/* thin horizontal slab */}
        <mesh position={[-0.35, -0.18, 1.35]}>
          <boxGeometry args={[1.2, 0.08, 0.7]} />
          <meshStandardMaterial {...standardMat(PALETTE.cream, { roughness: 0.55 })} />
        </mesh>
        {/* two slim canopy posts */}
        <mesh position={[-0.85, -0.55, 1.6]}>
          <boxGeometry args={[0.08, 0.66, 0.08]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>
        <mesh position={[0.15, -0.55, 1.6]}>
          <boxGeometry args={[0.08, 0.66, 0.08]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>

        {/* Tall glowing entrance/door inset (cream emissive) on base volume */}
        <mesh position={[-0.35, -0.55, 1.21]} material={windowMat}>
          <boxGeometry args={[0.5, 0.72, 0.04]} />
        </mesh>

        {/* ---- Emissive cream window insets ---- */}
        <group>
          {/* Tower windows (rows scale with polyBudget) on the +z face */}
          {towerWindows.map((p, i) => (
            <mesh key={`tw-${i}`} position={p} material={windowMat}>
              <boxGeometry args={[0.34, 0.42, 0.04]} />
            </mesh>
          ))}

          {/* A couple of wide ribbon windows on the mid living block (+z) */}
          <mesh position={[-0.35, 0.28, 1.11]} material={windowMat}>
            <boxGeometry args={[1.4, 0.34, 0.04]} />
          </mesh>

          {/* Side accent window on the tower (+x face) */}
          <mesh
            position={[1.31, 1.2, -0.1]}
            rotation={[0, Math.PI / 2, 0]}
            material={windowMat}
          >
            <boxGeometry args={[0.7, 0.5, 0.04]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// ConstructionVillaScene — a villa mid-build. Procedural, texture-free, mobile-first.
// Returns three.js JSX only (renders inside an existing <Canvas>). Camera looks at
// (0, 0.2, 0); everything is centered on origin within ~6w x 5h x 6d, base near y=-1.2.
//
// Reads as "under construction": partial/uneven walls, a half-framed roof, exposed
// columns + beams, an INSTANCED scaffold lattice on one side, and a simple crane
// (lattice mast + boom + counterweight + hook line). Idle (when !reducedMotion):
// the crane boom slowly yaws around the mast and the hook line gently bobs.
export default function ConstructionVillaScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // Scaffold density scales with poly budget (sane mins so it never looks empty).
  const scaffold = useMemo(() => buildScaffold(budget), [budget]);

  // Refs for the only animated parts (mutated in useFrame, never setState).
  const boomRef = useRef();
  const hookRef = useRef();

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    // Slow boom yaw around the mast — gentle sweep, not a full spin.
    if (boomRef.current) {
      boomRef.current.rotation.y = Math.sin(t * 0.18) * 0.55 - 0.4;
    }
    // Hook line bobs up/down subtly.
    if (hookRef.current) {
      hookRef.current.position.y = -0.9 + Math.sin(t * 0.8) * 0.12;
    }
  });

  return (
    <group position={[0, -1.2, 0]}>
      {/* ───────── Ground plinth (dusty, earthy) ───────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial {...standardMat(PALETTE.bg, { flat: false })} />
      </mesh>
      {/* Raised earth pad under the build */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[5.4, 0.12, 5]} />
        <meshStandardMaterial {...standardMat(PALETTE.sand)} />
      </mesh>
      <mesh position={[-0.1, 0.13, -0.1]}>
        <boxGeometry args={[4.2, 0.06, 3.8]} />
        <meshStandardMaterial {...standardMat(PALETTE.clay)} />
      </mesh>

      {/* ───────── Material piles (tiny cones) ───────── */}
      <mesh position={[2.0, 0.32, 1.5]}>
        <coneGeometry args={[0.34, 0.42, 7]} />
        <meshStandardMaterial {...standardMat(PALETTE.sand)} />
      </mesh>
      <mesh position={[2.45, 0.26, 1.05]}>
        <coneGeometry args={[0.26, 0.32, 7]} />
        <meshStandardMaterial {...standardMat(PALETTE.clay)} />
      </mesh>

      {/* ───────── Villa massing — PARTIAL / uneven walls ───────── */}
      <VillaMassing />

      {/* ───────── Exposed structural frame (columns + beams) ───────── */}
      <StructuralFrame />

      {/* ───────── Scaffold lattice wrapping the right side ───────── */}
      <group position={[1.55, 0, -0.9]}>
        <Instances limit={scaffold.length} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
          {scaffold.map((b, i) => (
            <Instance key={i} position={b.pos} rotation={b.rot} scale={b.scale} />
          ))}
        </Instances>
      </group>

      {/* ───────── Crane ───────── */}
      <Crane budget={budget} boomRef={boomRef} hookRef={hookRef} />
    </group>
  );
}

/* ===================================================================== */
/* Villa massing: a two-block house with deliberately unfinished walls.   */
/* Some panels are full-height, some are short stubs, one face is open.   */
/* ===================================================================== */
function VillaMassing() {
  const sand = standardMat(PALETTE.sand);
  const clay = standardMat(PALETTE.clay);
  const cream = standardMat(PALETTE.cream);

  return (
    <group position={[-0.5, 0, 0]}>
      {/* Ground-floor slab */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[3.2, 0.18, 2.6]} />
        <meshStandardMaterial {...cream} />
      </mesh>

      {/* Back wall — full height (finished) */}
      <mesh position={[0, 1.25, -1.25]}>
        <boxGeometry args={[3.2, 2.0, 0.16]} />
        <meshStandardMaterial {...sand} />
      </mesh>

      {/* Left wall — full height */}
      <mesh position={[-1.55, 1.1, 0]}>
        <boxGeometry args={[0.16, 1.7, 2.6]} />
        <meshStandardMaterial {...sand} />
      </mesh>

      {/* Right wall — only a LOW stub (unfinished) */}
      <mesh position={[1.55, 0.65, 0.55]}>
        <boxGeometry args={[0.16, 0.78, 1.5]} />
        <meshStandardMaterial {...clay} />
      </mesh>

      {/* Front wall — two short panels with a gap (doorway / open face) */}
      <mesh position={[-1.0, 0.78, 1.25]}>
        <boxGeometry args={[1.0, 1.04, 0.16]} />
        <meshStandardMaterial {...sand} />
      </mesh>
      <mesh position={[1.05, 0.55, 1.25]}>
        <boxGeometry args={[0.9, 0.58, 0.16]} />
        <meshStandardMaterial {...clay} />
      </mesh>

      {/* First-floor partial slab (only half laid) */}
      <mesh position={[-0.45, 2.18, -0.3]}>
        <boxGeometry args={[2.3, 0.16, 2.0]} />
        <meshStandardMaterial {...cream} />
      </mesh>

      {/* Upper short wall stub — one piece, mid-construction */}
      <mesh position={[-1.4, 2.6, -0.9]}>
        <boxGeometry args={[0.16, 0.7, 1.0]} />
        <meshStandardMaterial {...sand} />
      </mesh>
    </group>
  );
}

/* ===================================================================== */
/* Structural frame: thin columns + beams in goldDark/brown, some poking  */
/* up past the unfinished walls (clearly "framed, not yet clad").         */
/* ===================================================================== */
function StructuralFrame() {
  const beam = standardMat(PALETTE.brown);
  const col = standardMat(PALETTE.goldDark);

  // Column footprint corners around the villa.
  const cols = [
    [-2.05, -1.25],
    [-2.05, 1.25],
    [1.05, -1.25],
    [1.05, 1.25],
    [-0.5, 1.25],
  ];

  return (
    <group position={[-0.5, 0, 0]}>
      {/* Vertical columns — some taller than walls (exposed). */}
      {cols.map(([x, z], i) => {
        const h = 2.6 + (i % 2) * 0.7; // alternate taller posts
        return (
          <mesh key={`c${i}`} position={[x, h / 2 + 0.2, z]}>
            <boxGeometry args={[0.12, h, 0.12]} />
            <meshStandardMaterial {...col} />
          </mesh>
        );
      })}

      {/* Horizontal ring beams at the top frame line. */}
      <mesh position={[-0.5, 2.5, -1.25]}>
        <boxGeometry args={[3.2, 0.12, 0.12]} />
        <meshStandardMaterial {...beam} />
      </mesh>
      <mesh position={[-0.5, 2.5, 1.25]}>
        <boxGeometry args={[3.2, 0.12, 0.12]} />
        <meshStandardMaterial {...beam} />
      </mesh>
      <mesh position={[-2.05, 2.5, 0]}>
        <boxGeometry args={[0.12, 0.12, 2.6]} />
        <meshStandardMaterial {...beam} />
      </mesh>
      <mesh position={[1.05, 2.5, 0]}>
        <boxGeometry args={[0.12, 0.12, 2.6]} />
        <meshStandardMaterial {...beam} />
      </mesh>

      {/* Roof — only PARTLY framed: a few rafters, no decking. */}
      <mesh position={[-0.5, 3.05, -0.7]} rotation={[0, 0, Math.PI / 14]}>
        <boxGeometry args={[3.0, 0.1, 0.1]} />
        <meshStandardMaterial {...beam} />
      </mesh>
      <mesh position={[-0.5, 3.05, 0.0]} rotation={[0, 0, Math.PI / 14]}>
        <boxGeometry args={[3.0, 0.1, 0.1]} />
        <meshStandardMaterial {...beam} />
      </mesh>
      {/* ridge */}
      <mesh position={[-0.5, 3.2, -0.35]}>
        <boxGeometry args={[0.1, 0.1, 1.4]} />
        <meshStandardMaterial {...beam} />
      </mesh>
    </group>
  );
}

/* ===================================================================== */
/* Crane: lattice mast + boom + counterweight + hook line.                */
/* boomRef yaws around the mast; hookRef bobs (set in parent useFrame).    */
/* ===================================================================== */
function Crane({ budget, boomRef, hookRef }) {
  const mast = standardMat(PALETTE.gold);
  const dark = standardMat(PALETTE.goldDark);
  const brown = standardMat(PALETTE.brown);

  const mastH = 4.2;
  const mastX = 2.4;
  const mastZ = -1.6;

  // Lattice rungs on the mast — count scales with budget.
  const rungs = Math.max(4, Math.round(7 * budget));
  const rungYs = useMemo(
    () => Array.from({ length: rungs }, (_, i) => 0.4 + ((i + 1) / (rungs + 1)) * mastH),
    [rungs, mastH],
  );

  return (
    <group position={[mastX, 0, mastZ]}>
      {/* Base block */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial {...brown} />
      </mesh>

      {/* Four mast legs */}
      {[
        [-0.18, -0.18],
        [0.18, -0.18],
        [-0.18, 0.18],
        [0.18, 0.18],
      ].map(([x, z], i) => (
        <mesh key={`leg${i}`} position={[x, mastH / 2 + 0.4, z]}>
          <boxGeometry args={[0.06, mastH, 0.06]} />
          <meshStandardMaterial {...mast} />
        </mesh>
      ))}

      {/* Lattice cross-rungs */}
      {rungYs.map((y, i) => (
        <mesh key={`rung${i}`} position={[0, y, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.42]} />
          <meshStandardMaterial {...dark} />
        </mesh>
      ))}

      {/* Rotating assembly: boom + counterweight + hook (yaws via boomRef). */}
      <group ref={boomRef} position={[0, mastH + 0.4, 0]}>
        {/* Boom arm reaching toward the villa */}
        <mesh position={[-1.7, 0, 0]}>
          <boxGeometry args={[3.6, 0.1, 0.12]} />
          <meshStandardMaterial {...dark} />
        </mesh>
        {/* Boom top chord (lattice feel) */}
        <mesh position={[-1.7, 0.18, 0]}>
          <boxGeometry args={[3.0, 0.06, 0.06]} />
          <meshStandardMaterial {...mast} />
        </mesh>

        {/* Counterweight at the back of the boom */}
        <mesh position={[0.9, -0.1, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.4]} />
          <meshStandardMaterial {...brown} />
        </mesh>

        {/* Hook line + hook block (bobs via hookRef) */}
        <group ref={hookRef} position={[-3.2, -0.9, 0]}>
          {/* line */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.025, 0.9, 0.025]} />
            <meshStandardMaterial {...brown} />
          </mesh>
          {/* hook block */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.16, 0.16, 0.16]} />
            <meshStandardMaterial {...mast} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ===================================================================== */
/* Scaffold lattice builder — instanced unit-cube bars.                   */
/* Verticals + horizontals + a diagonal brace. Returns per-bar transform  */
/* (position, rotation, scale of the 1x1x1 box). Count scales w/ budget.  */
/* ===================================================================== */
function buildScaffold(budget) {
  const bars = [];
  const bayW = 0.9; // horizontal spacing
  const lvlH = 0.85; // vertical spacing
  const depth = 2.4; // along z (wraps one side of villa)

  // Bays/levels scale with budget (sane mins keep the lattice readable).
  const bays = Math.max(2, Math.round(4 * budget));
  const levels = Math.max(2, Math.round(4 * budget));
  const thin = 0.05;
  const baseY = 0.2;

  // Verticals (one per bay edge, across depth start & end).
  for (let b = 0; b <= bays; b++) {
    const x = b * bayW;
    const h = levels * lvlH;
    bars.push({ pos: [x, baseY + h / 2, 0], rot: [0, 0, 0], scale: [thin, h, thin] });
    bars.push({ pos: [x, baseY + h / 2, -depth], rot: [0, 0, 0], scale: [thin, h, thin] });
  }

  // Horizontal ledgers (each level, front + back runs + depth ties).
  for (let l = 0; l <= levels; l++) {
    const y = baseY + l * lvlH;
    const w = bays * bayW;
    bars.push({ pos: [w / 2, y, 0], rot: [0, 0, 0], scale: [w, thin, thin] });
    bars.push({ pos: [w / 2, y, -depth], rot: [0, 0, 0], scale: [w, thin, thin] });
    // depth ties at the two ends
    bars.push({ pos: [0, y, -depth / 2], rot: [0, 0, 0], scale: [thin, thin, depth] });
    bars.push({ pos: [w, y, -depth / 2], rot: [0, 0, 0], scale: [thin, thin, depth] });
  }

  // Diagonal braces on the front face (one per bay, alternating direction).
  for (let b = 0; b < bays; b++) {
    const x = b * bayW + bayW / 2;
    const y = baseY + lvlH / 2;
    const diagLen = Math.hypot(bayW, lvlH);
    const angle = b % 2 === 0 ? Math.PI / 4 : -Math.PI / 4;
    bars.push({ pos: [x, y, 0], rot: [0, 0, angle], scale: [diagLen, thin, thin] });
  }

  return bars;
}

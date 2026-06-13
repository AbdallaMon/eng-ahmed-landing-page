import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// AmbientFormScene — a quiet, premium ambient backdrop that sits BEHIND a
// glassmorphic form in the center of the screen. Design intent: the center
// foreground stays calm/empty so it never competes with the form; visual
// interest is pushed to the edges and the back (negative Z, left/right/top).
// Everything is low-contrast, soft (high roughness), and drifts barely
// perceptibly. Procedural geometry only — no textures/models/HDRI.

// A hand-placed field of large soft shapes. Each is intentionally kept toward
// the back (z mostly <= 0) and away from the central foreground column so the
// form area reads as calm negative space. Positions are normalized; we keep an
// empty "well" around the origin (small |x| + small |y| + positive-ish z).
const SHAPES = [
  // --- back wall: large, very soft, low contrast (deep negative Z) ---
  { type: "ico", pos: [-2.6, 1.1, -3.4], scale: 1.5, color: "cream", emissive: false, roughness: 0.9, speed: 0.6, phase: 0.0 },
  { type: "sphere", pos: [2.9, 1.5, -3.8], scale: 1.7, color: "bg", emissive: false, roughness: 0.95, speed: 0.5, phase: 1.3 },
  { type: "rbox", pos: [0.4, 2.4, -4.2], scale: 1.3, color: "sand", emissive: false, roughness: 0.9, speed: 0.4, phase: 2.1 },
  { type: "sphere", pos: [-3.2, -1.4, -3.2], scale: 1.4, color: "cream", emissive: false, roughness: 0.95, speed: 0.55, phase: 3.4 },

  // --- left / right edges: mid-depth, frame the calm center ---
  { type: "rbox", pos: [-3.0, 0.1, -1.4], scale: 1.0, color: "sand", emissive: false, roughness: 0.85, speed: 0.7, phase: 0.8 },
  { type: "sphere", pos: [3.1, -0.3, -1.6], scale: 1.1, color: "bg", emissive: false, roughness: 0.9, speed: 0.65, phase: 4.2 },
  { type: "ico", pos: [3.3, 1.9, -2.2], scale: 0.85, color: "gold", emissive: true, roughness: 0.75, speed: 0.8, phase: 5.0 },

  // --- top accents: drift above the form, gentle ---
  { type: "sphere", pos: [-1.6, 2.7, -2.6], scale: 0.9, color: "cream", emissive: false, roughness: 0.9, speed: 0.75, phase: 2.7 },

  // --- one small low gold accent, pushed to a back corner (faint glow) ---
  { type: "ico", pos: [-3.4, 2.1, -2.8], scale: 0.7, color: "gold", emissive: true, roughness: 0.7, speed: 0.9, phase: 1.9 },

  // --- extra fillers, only added at higher poly budgets (see below) ---
  { type: "sphere", pos: [2.3, 2.6, -3.0], scale: 0.8, color: "sand", emissive: false, roughness: 0.9, speed: 0.6, phase: 3.9 },
  { type: "rbox", pos: [-2.2, -1.8, -2.4], scale: 0.95, color: "bg", emissive: false, roughness: 0.9, speed: 0.5, phase: 0.4 },
  { type: "ico", pos: [1.9, -1.6, -2.8], scale: 0.9, color: "cream", emissive: false, roughness: 0.9, speed: 0.55, phase: 4.8 },
];

// Rounded geometry per type. Detail/segments scale with poly budget so mobile
// (0.5) stays cheap. RoundedBox-style softness is approximated cheaply with low
// segment counts + flat shading rather than pulling in drei's RoundedBox.
function geometryFor(type, detailLevel) {
  switch (type) {
    case "ico":
      return <icosahedronGeometry args={[1, detailLevel >= 2 ? 2 : detailLevel]} />;
    case "rbox": {
      // soft, slightly bevel-feeling box via modest segment counts
      const seg = detailLevel >= 1 ? 2 : 1;
      return <boxGeometry args={[1.2, 1.2, 1.2, seg, seg, seg]} />;
    }
    case "sphere":
    default: {
      const w = detailLevel >= 2 ? 24 : detailLevel >= 1 ? 16 : 12;
      const h = detailLevel >= 2 ? 16 : detailLevel >= 1 ? 12 : 8;
      return <sphereGeometry args={[0.85, w, h]} />;
    }
  }
}

// One soft drifting shape. Refs are mutated in useFrame (no per-frame setState).
function AmbientShape({ shape, detailLevel, reducedMotion }) {
  const ref = useRef();
  const base = useMemo(
    () => new THREE.Vector3(shape.pos[0], shape.pos[1], shape.pos[2]),
    [shape.pos],
  );
  const color = PALETTE[shape.color] ?? PALETTE.cream;

  useFrame((state) => {
    const o = ref.current;
    if (reducedMotion || !o) return;
    const t = state.clock.elapsedTime * 0.06 * shape.speed + shape.phase;
    // barely-perceptible float: small offsets layered on the base position
    o.position.x = base.x + Math.sin(t * 0.9) * 0.18;
    o.position.y = base.y + Math.sin(t * 1.1 + 1.2) * 0.22;
    o.position.z = base.z + Math.sin(t * 0.7 + 0.6) * 0.12;
    // extremely slow rotation, different axis weighting per phase
    o.rotation.x += 0.0009 * shape.speed;
    o.rotation.y += 0.0014 * shape.speed;
  });

  return (
    <mesh
      ref={ref}
      position={shape.pos}
      scale={shape.scale}
      rotation={[shape.phase * 0.3, shape.phase * 0.5, 0]}
    >
      {geometryFor(shape.type, detailLevel)}
      <meshStandardMaterial
        {...standardMat(color, { flat: shape.type !== "sphere", roughness: shape.roughness })}
        emissive={shape.emissive ? PALETTE.gold : PALETTE.brown}
        emissiveIntensity={shape.emissive ? 0.22 : 0}
      />
    </mesh>
  );
}

// Far-back gradient backdrop plane (vertexColors bg -> cream), very soft, low
// contrast. Adds depth without any texture. Sits well behind everything.
function GradientBackdrop() {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(28, 20, 1, 1);
    const top = PALETTE.cream;
    const bottom = PALETTE.bg;
    // plane verts order: top-left, top-right, bottom-left, bottom-right
    const colorsArr = new Float32Array([
      top.r, top.g, top.b,
      top.r, top.g, top.b,
      bottom.r, bottom.g, bottom.b,
      bottom.r, bottom.g, bottom.b,
    ]);
    g.setAttribute("color", new THREE.BufferAttribute(colorsArr, 3));
    return g;
  }, []);

  return (
    <mesh geometry={geom} position={[0, 0.2, -6]}>
      <meshBasicMaterial vertexColors toneMapped={false} />
    </mesh>
  );
}

export default function AmbientFormScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // Scale shape COUNT by budget (sane minimum keeps the scene composed even on
  // the cheapest tier). Low: ~8, Mid: ~10, High: all 12.
  const count = budget >= 1 ? SHAPES.length : budget >= 0.75 ? 10 : 8;

  // Scale per-shape DETAIL by budget. 0 = cheapest (flat low-poly), 2 = richer.
  const detailLevel = budget >= 1 ? 2 : budget >= 0.75 ? 1 : 0;

  const shapes = useMemo(() => SHAPES.slice(0, count), [count]);

  return (
    <group position={[0, 0.2, 0]}>
      <GradientBackdrop />
      {shapes.map((shape, i) => (
        <AmbientShape
          key={i}
          shape={shape}
          detailLevel={detailLevel}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}

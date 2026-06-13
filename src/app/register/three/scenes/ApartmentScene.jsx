import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// "ApartmentScene" — a stylized modern residential high-rise (project type:
// APARTMENT). A tall goldDark/cream tower is the hero, fronted by an INSTANCED
// grid of emissive cream windows, a few protruding balcony slabs, a slim
// penthouse setback, and a shorter companion tower set back for depth. All
// procedural, texture-free; window "lights" are emissive. Mobile-first: windows
// share one InstancedMesh so the whole facade is a single draw call.

// Hero tower massing — kept ~4.2 tall and centered so its mid-section frames in
// the fixed camera (looks at 0,0.2,0) without running off the top.
const TOWER_W = 1.9;
const TOWER_H = 4.2;
const TOWER_D = 1.5;
const TOWER_CY = 0.25; // tower vertical center (origin-ish)
const FACE_Z = TOWER_D / 2 + 0.01; // front facade plane
const GROUND_Y = -1.2;

export default function ApartmentScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  const groupRef = useRef();
  const windowsRef = useRef(); // <Instances> handle for emissive pulse

  // Window grid scaled by polyBudget (sane mins so 0.5 still reads as a tower).
  const { cols, rows, windows } = useMemo(() => {
    const cols = Math.max(3, Math.round(3 + budget * 3)); // 4..6
    const rows = Math.max(7, Math.round(7 + budget * 7)); // ~10..14
    const win = [];

    const winW = 0.16;
    const winH = 0.26;
    // Lay the grid across the front face with margins top/bottom/sides.
    const usableW = TOWER_W * 0.78;
    const usableH = TOWER_H * 0.82;
    const topY = TOWER_CY + usableH / 2;
    const stepX = usableW / (cols - 1);
    const stepY = usableH / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -usableW / 2 + c * stepX;
        const y = topY - r * stepY;
        // Pick ~40% of windows to be "active" (brighter, eligible to pulse).
        const active = (r * 7 + c * 3) % 5 < 2;
        win.push({ x, y, w: winW, h: winH, active });
      }
    }
    return { cols, rows, windows: win };
  }, [budget]);

  // Companion tower only at higher budgets (keeps low-end draw calls down).
  const showCompanion = budget >= 0.75;
  const companionWindows = useMemo(() => {
    if (!showCompanion) return [];
    const cCols = 3;
    const cRows = Math.max(6, Math.round(6 + budget * 4));
    const cW = 1.2;
    const cH = 3.0;
    const cCenterY = -0.05;
    const usableW = cW * 0.7;
    const usableH = cH * 0.8;
    const topY = cCenterY + usableH / 2;
    const stepX = usableW / (cCols - 1);
    const stepY = usableH / (cRows - 1);
    const out = [];
    for (let r = 0; r < cRows; r++) {
      for (let c = 0; c < cCols; c++) {
        out.push({
          x: -usableW / 2 + c * stepX,
          y: topY - r * stepY,
        });
      }
    }
    return out;
  }, [showCompanion, budget]);

  // Balcony slabs: a handful of protruding thin boxes on the front face.
  const balconies = useMemo(() => {
    const ys = [-0.7, 0.0, 0.7, 1.35];
    const xs = [-TOWER_W * 0.22, TOWER_W * 0.22];
    const out = [];
    ys.forEach((y, i) => {
      // Alternate sides for a residential, asymmetric rhythm.
      out.push({ x: xs[i % 2], y: TOWER_CY + y });
    });
    return out;
  }, []);

  const emWindow = useMemo(() => PALETTE.cream.clone(), []);
  const baseEmissive = 0.55;

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    // Subtle parallax sway of the whole group (slow, gentle).
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.22) * 0.06;
      groupRef.current.position.x = Math.sin(t * 0.17) * 0.04;
      groupRef.current.position.y = Math.sin(t * 0.31) * 0.02;
    }

    // Soft slow pulse — drive the single shared window material's
    // emissiveIntensity for a unified, cheap "evening lights" breathing across
    // the whole facade (one material, no per-instance writes).
    const inst = windowsRef.current;
    if (inst?.material) {
      inst.material.emissiveIntensity =
        baseEmissive + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.6));
    }
  });

  return (
    <group ref={groupRef}>
      {/* ground / plinth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial {...standardMat(PALETTE.bg, { flat: false })} />
      </mesh>
      <mesh position={[0.1, GROUND_Y + 0.12, 0]}>
        <boxGeometry args={[3.4, 0.24, 3.0]} />
        <meshStandardMaterial {...standardMat(PALETTE.sand, { flat: false })} />
      </mesh>

      {/* companion tower (set back, depth) */}
      {showCompanion && (
        <group position={[-1.65, 0, -1.1]}>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[1.2, 3.0, 1.0]} />
            <meshStandardMaterial {...standardMat(PALETTE.clay)} />
          </mesh>
          <Instances limit={companionWindows.length} range={companionWindows.length}>
            <boxGeometry args={[0.14, 0.2, 0.04]} />
            <meshStandardMaterial
              {...standardMat(PALETTE.cream)}
              emissive={PALETTE.cream}
              emissiveIntensity={0.4}
            />
            {companionWindows.map((w, i) => (
              <Instance key={i} position={[w.x, w.y, 0.51]} />
            ))}
          </Instances>
        </group>
      )}

      {/* hero tower massing */}
      <mesh position={[0, TOWER_CY, 0]}>
        <boxGeometry args={[TOWER_W, TOWER_H, TOWER_D]} />
        <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
      </mesh>
      {/* a cream vertical pilaster to break the massing */}
      <mesh position={[TOWER_W / 2 - 0.04, TOWER_CY, FACE_Z - 0.04]}>
        <boxGeometry args={[0.12, TOWER_H * 0.98, 0.06]} />
        <meshStandardMaterial {...standardMat(PALETTE.cream)} />
      </mesh>

      {/* penthouse setback near the top */}
      <mesh position={[0, TOWER_CY + TOWER_H / 2 + 0.32, -0.05]}>
        <boxGeometry args={[TOWER_W * 0.62, 0.62, TOWER_D * 0.72]} />
        <meshStandardMaterial {...standardMat(PALETTE.cream)} />
      </mesh>
      {/* slim roof cap / parapet */}
      <mesh position={[0, TOWER_CY + TOWER_H / 2 + 0.66, -0.05]}>
        <boxGeometry args={[TOWER_W * 0.5, 0.1, TOWER_D * 0.6]} />
        <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
      </mesh>

      {/* balcony slabs — protruding thin boxes on the front face */}
      {balconies.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.y, FACE_Z + 0.16]}>
            <boxGeometry args={[0.66, 0.05, 0.34]} />
            <meshStandardMaterial {...standardMat(PALETTE.cream)} />
          </mesh>
          {/* thin glass-rail front edge (cream, subtle) */}
          <mesh position={[b.x, b.y + 0.1, FACE_Z + 0.32]}>
            <boxGeometry args={[0.66, 0.16, 0.02]} />
            <meshStandardMaterial
              {...standardMat(PALETTE.sand, { flat: false })}
            />
          </mesh>
        </group>
      ))}

      {/* INSTANCED window grid — one draw call for the whole hero facade.
          Emissive cream so they read as lit windows; material emissiveIntensity
          breathes in useFrame when motion is allowed. */}
      <Instances
        ref={windowsRef}
        limit={windows.length}
        range={windows.length}
        position={[0, 0, FACE_Z]}
      >
        <boxGeometry args={[1, 1, 0.04]} />
        <meshStandardMaterial
          {...standardMat(emWindow)}
          emissive={emWindow}
          emissiveIntensity={baseEmissive}
        />
        {windows.map((w, i) => (
          <Instance
            key={i}
            position={[w.x, w.y, 0]}
            scale={[w.w, w.h, 1]}
            color={w.active ? PALETTE.cream : PALETTE.sand}
          />
        ))}
      </Instances>
    </group>
  );
}

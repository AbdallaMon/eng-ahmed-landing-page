import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// "PartOfHomeScene" — a cutaway house with its FRONT CORNER removed, revealing
// ONE highlighted interior room that glows warm. Communicates "we design just
// one PART of the home": the whole house is matte/un-lit, the single revealed
// room pulses with emissive light so the eye goes straight to it.
//
// Layout (camera looks at 0,0.2,0; content within ~6w x 5h x 6d; base ~y=-1.2):
//   The house body is a box centred near origin. The +X/+Z front corner volume
//   is left OPEN — instead of one solid box we build the shell from a back wall
//   (-Z), a left wall (-X), a roof, and a floor slab, then the two SHORT return
//   walls that stop short of the open corner. The open quadrant exposes the
//   highlighted room (cream floor + two cream walls + furniture blocks).
export default function PartOfHomeScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // The highlighted room's emissive bits are gathered into one ref'd group so
  // useFrame can pulse their emissiveIntensity together (no per-frame setState).
  const glowRef = useRef();
  const bobRef = useRef();
  const lightRef = useRef();
  const t = useRef(0);

  // House footprint / heights. Origin sits at the centre of the floor plane.
  const W = 3.4; // full house width (X)
  const D = 3.4; // full house depth (Z)
  const H = 2.2; // wall height (Y)
  const baseY = -1.2; // floor level
  const wallTh = 0.18; // wall thickness

  // The room occupies the +X/+Z quadrant (the open corner). Its inner size:
  const roomW = W / 2 - wallTh; // along X
  const roomD = D / 2 - wallTh; // along Z
  const roomCx = W / 4; // room centre X
  const roomCz = D / 4; // room centre Z

  // polyBudget → how much furniture/extra detail we add. Sane minimum of a
  // sofa block + a table even at the lowest budget; rug + lamp + stool scale in.
  const detail = useMemo(() => {
    const extras = budget >= 1 ? 3 : budget >= 0.75 ? 2 : 1;
    return {
      roundSeg: budget >= 1 ? 16 : budget >= 0.75 ? 12 : 8, // cylinder segments
      extras, // 1: rug · 2: +lamp · 3: +stool
    };
  }, [budget]);

  // Emissive material props for the glowing room surfaces. We DON'T spread
  // standardMat here because we need live emissive control; built once.
  const glowFloorMat = useMemo(
    () => ({
      color: PALETTE.cream,
      emissive: PALETTE.gold.clone(),
      emissiveIntensity: 0.55,
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false,
    }),
    [],
  );
  const glowWallMat = useMemo(
    () => ({
      color: PALETTE.cream,
      emissive: PALETTE.cream.clone(),
      emissiveIntensity: 0.35,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: false,
    }),
    [],
  );

  useFrame((_, delta) => {
    if (reducedMotion) return;
    t.current += delta;

    // Soft warm pulse on the highlighted room: slow sine, stays clearly lit.
    const pulse = 0.5 + 0.5 * Math.sin(t.current * 1.1); // 0..1
    if (glowRef.current) {
      glowRef.current.traverse((o) => {
        if (o.isMesh && o.material && o.material.emissive) {
          // Floor glows stronger than walls; both breathe together.
          const base = o.userData.glowBase ?? 0.35;
          o.material.emissiveIntensity = base + pulse * 0.45;
        }
      });
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.1 + pulse * 0.9;
    }
    // Tiny calm overall bob of the whole house.
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t.current * 0.7) * 0.04;
    }
  });

  return (
    <group ref={bobRef}>
      {/* ===== HOUSE SHELL (matte, un-lit — the "whole home") ===== */}
      {/* Floor slab under the whole house */}
      <mesh position={[0, baseY - 0.09, 0]}>
        <boxGeometry args={[W + 0.4, 0.18, D + 0.4]} />
        <meshStandardMaterial {...standardMat(PALETTE.clay)} />
      </mesh>

      {/* Back wall (-Z), full width */}
      <mesh position={[0, baseY + H / 2, -D / 2 + wallTh / 2]}>
        <boxGeometry args={[W, H, wallTh]} />
        <meshStandardMaterial {...standardMat(PALETTE.sand)} />
      </mesh>

      {/* Left wall (-X), full depth */}
      <mesh position={[-W / 2 + wallTh / 2, baseY + H / 2, 0]}>
        <boxGeometry args={[wallTh, H, D]} />
        <meshStandardMaterial {...standardMat(PALETTE.sand)} />
      </mesh>

      {/* Front return wall (+Z side) — only the LEFT half, leaving the corner open */}
      <mesh position={[-W / 4, baseY + H / 2, D / 2 - wallTh / 2]}>
        <boxGeometry args={[W / 2, H, wallTh]} />
        <meshStandardMaterial {...standardMat(PALETTE.brown)} />
      </mesh>

      {/* Right return wall (+X side) — only the BACK half, leaving the corner open */}
      <mesh position={[W / 2 - wallTh / 2, baseY + H / 2, -D / 4]}>
        <boxGeometry args={[wallTh, H, D / 2]} />
        <meshStandardMaterial {...standardMat(PALETTE.brown)} />
      </mesh>

      {/* Interior divider wall that separates the open room from the rest of the
          house: runs along X at z=0 for the +X half (the room's "back" wall is
          the glow wall; this is the house-side partition seen as matte). */}
      <mesh position={[0, baseY + H / 2, 0]}>
        <boxGeometry args={[W, H, wallTh * 0.7]} />
        <meshStandardMaterial {...standardMat(PALETTE.sand, { roughness: 0.85 })} />
      </mesh>

      {/* Gabled roof: two slanted slabs forming a ridge along X. Sits on top of
          walls and overhangs slightly. The open corner stays revealed from the
          front because the camera looks down toward origin. */}
      <group position={[0, baseY + H, 0]}>
        <mesh
          position={[0, 0.45, -D / 4]}
          rotation={[Math.PI * 0.13, 0, 0]}
        >
          <boxGeometry args={[W + 0.5, 0.14, D / 2 + 0.5]} />
          <meshStandardMaterial {...standardMat(PALETTE.brown)} />
        </mesh>
        <mesh
          position={[0, 0.45, D / 4]}
          rotation={[-Math.PI * 0.13, 0, 0]}
        >
          <boxGeometry args={[W + 0.5, 0.14, D / 2 + 0.5]} />
          <meshStandardMaterial {...standardMat(PALETTE.brown)} />
        </mesh>
        {/* ridge cap */}
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[W + 0.55, 0.1, 0.14]} />
          <meshStandardMaterial {...standardMat(PALETTE.clay)} />
        </mesh>
      </group>

      {/* ===== HIGHLIGHTED ROOM (the ONE revealed part — glows warm) ===== */}
      <group ref={glowRef}>
        {/* Glowing cream floor of the room */}
        <mesh
          position={[roomCx, baseY + 0.011, roomCz]}
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{ glowBase: 0.55 }}
        >
          <planeGeometry args={[roomW, roomD]} />
          <meshStandardMaterial {...glowFloorMat} />
        </mesh>

        {/* Room inner wall along -Z edge of the quadrant (faces +Z, into the room) */}
        <mesh
          position={[roomCx, baseY + H / 2, wallTh * 0.5]}
          userData={{ glowBase: 0.35 }}
        >
          <boxGeometry args={[roomW, H - 0.2, 0.04]} />
          <meshStandardMaterial {...glowWallMat} />
        </mesh>

        {/* Room inner wall along -X edge of the quadrant (faces +X, into the room) */}
        <mesh
          position={[wallTh * 0.5, baseY + H / 2, roomCz]}
          userData={{ glowBase: 0.35 }}
        >
          <boxGeometry args={[0.04, H - 0.2, roomD]} />
          <meshStandardMaterial {...glowWallMat} />
        </mesh>
      </group>

      {/* ===== FURNITURE (gold / goldDark / clay blocks, matte-ish) ===== */}
      <group>
        {/* Sofa/bed block against the inner -X wall */}
        <group position={[roomCx - roomW / 2 + 0.42, baseY, roomCz]}>
          {/* base */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.55, 0.32, roomD * 0.7]} />
            <meshStandardMaterial {...standardMat(PALETTE.gold)} />
          </mesh>
          {/* backrest */}
          <mesh position={[-0.22, 0.42, 0]}>
            <boxGeometry args={[0.12, 0.5, roomD * 0.7]} />
            <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
          </mesh>
        </group>

        {/* Low table near the open corner */}
        <group position={[roomCx + roomW * 0.18, baseY, roomCz + roomD * 0.18]}>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[0.6, 0.06, 0.4]} />
            <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
          </mesh>
          {/* single pedestal leg (low draw count) */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.34, detail.roundSeg]} />
            <meshStandardMaterial {...standardMat(PALETTE.clay)} />
          </mesh>
        </group>

        {/* Rug (always present — budget extra #1): a thin glowing-cream-edged
            clay slab on the floor, tying the room together */}
        {detail.extras >= 1 && (
          <mesh
            position={[roomCx + 0.1, baseY + 0.02, roomCz + 0.05]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[roomW * 0.62, roomD * 0.55]} />
            <meshStandardMaterial {...standardMat(PALETTE.clay, { roughness: 0.95 })} />
          </mesh>
        )}

        {/* Floor lamp (budget extra #2) — a slim pole + a small emissive shade
            that adds to the warm glow. Joined to the glow group so it pulses. */}
        {detail.extras >= 2 && (
          <group position={[roomCx + roomW * 0.32, baseY, roomCz - roomD * 0.28]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.0, detail.roundSeg]} />
              <meshStandardMaterial {...standardMat(PALETTE.brown)} />
            </mesh>
            <mesh position={[0, 1.05, 0]}>
              <cylinderGeometry
                args={[0.1, 0.16, 0.22, detail.roundSeg]}
              />
              <meshStandardMaterial
                color={PALETTE.cream}
                emissive={PALETTE.gold}
                emissiveIntensity={1.4}
                roughness={0.6}
                metalness={0}
              />
            </mesh>
          </group>
        )}

        {/* Stool (budget extra #3) — a small cylinder seat by the table */}
        {detail.extras >= 3 && (
          <mesh
            position={[roomCx - roomW * 0.05, baseY + 0.18, roomCz + roomD * 0.32]}
          >
            <cylinderGeometry args={[0.16, 0.16, 0.36, detail.roundSeg]} />
            <meshStandardMaterial {...standardMat(PALETTE.gold)} />
          </mesh>
        )}
      </group>

      {/* ===== Optional single warm point light inside the room ===== */}
      {/* One small pointLight reinforces the "lit room" pocket; emissive does the
          heavy lifting. Placed near the lamp/ceiling of the open quadrant. */}
      <pointLight
        ref={lightRef}
        position={[roomCx, baseY + H - 0.4, roomCz]}
        color={PALETTE.gold}
        intensity={reducedMotion ? 1.4 : 1.4}
        distance={4.5}
        decay={2}
      />
    </group>
  );
}

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// WizardAmbientScene — a calm, slightly architectural ambient backdrop that
// sits BEHIND a centered multi-step wizard form. Design intent: keep the
// center quiet, push all interest to the background/edges, low contrast, slow.
// Procedural geometry only, no textures/HDRI; gradients via vertexColors.

// ---------------------------------------------------------------------------
// Gradient backdrop: a large vertical-gradient plane far back (bg -> cream).
// vertexColors only, unlit-ish via low roughness/no metalness, so it reads as a
// soft horizon rather than a competing surface.
function GradientBackdrop() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(40, 26, 1, 1);
    const top = PALETTE.cream;
    const bottom = PALETTE.bg;
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      // y runs -13..13; normalize to 0..1 then ease toward the calmer bg low.
      const t = THREE.MathUtils.clamp((pos.getY(i) + 13) / 26, 0, 1);
      const c = bottom.clone().lerp(top, t * t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 1.5, -9]}>
      <meshStandardMaterial
        vertexColors
        flatShading={false}
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}

// Ground / platform: a muted near-horizontal plane at y=-1.3 with a faint
// front-to-back gradient so the foreground stays calm and recedes into the bg.
function Ground() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(40, 28, 1, 1);
    const near = PALETTE.bg;
    const far = PALETTE.sand;
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      // After the -90deg X rotation, plane Y maps to world depth.
      const t = THREE.MathUtils.clamp((pos.getY(i) + 14) / 28, 0, 1);
      const c = near.clone().lerp(far, (1 - t) * 0.5);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.3, -2]}
    >
      <meshStandardMaterial
        vertexColors
        flatShading={false}
        metalness={0.02}
        roughness={0.95}
      />
    </mesh>
  );
}

// A thin open rectangular "frame" (box outline) built from 4 slim bars. Reads
// as architectural without a heavy filled face. Low contrast, edge content.
function Frame({ width = 2.2, height = 3, thickness = 0.07, color }) {
  const half = thickness / 2;
  const w = width;
  const h = height;
  return (
    <group>
      {/* top & bottom bars */}
      <mesh position={[0, h / 2 - half, 0]}>
        <boxGeometry args={[w, thickness, thickness]} />
        <meshStandardMaterial {...standardMat(color)} />
      </mesh>
      <mesh position={[0, -h / 2 + half, 0]}>
        <boxGeometry args={[w, thickness, thickness]} />
        <meshStandardMaterial {...standardMat(color)} />
      </mesh>
      {/* left & right bars */}
      <mesh position={[-w / 2 + half, 0, 0]}>
        <boxGeometry args={[thickness, h, thickness]} />
        <meshStandardMaterial {...standardMat(color)} />
      </mesh>
      <mesh position={[w / 2 - half, 0, 0]}>
        <boxGeometry args={[thickness, h, thickness]} />
        <meshStandardMaterial {...standardMat(color)} />
      </mesh>
    </group>
  );
}

export default function WizardAmbientScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // Element-count + detail scaling. Keep sane minimums so the lowest tier still
  // reads as "a built place", not an empty void.
  const columnSeg = budget >= 1 ? 12 : budget >= 0.75 ? 8 : 6;
  const showSecondFrame = budget >= 0.75;
  const showExtraSlab = budget >= 0.75;
  const showSecondColumn = budget >= 1;
  const showAccents = budget >= 0.75;

  // Refs for the drifting primitives. Each gets its own base transform + phase
  // so the whole field breathes asynchronously and slowly.
  const frameAR = useRef();
  const frameBR = useRef();
  const daisR = useRef();
  const slabR = useRef();
  const colAR = useRef();
  const colBR = useRef();
  const accentR = useRef();

  // Stable per-element base poses + phase offsets (kept off the central
  // foreground; spread to background/edges).
  const bases = useMemo(
    () => ({
      frameA: { pos: [-3.2, 0.7, -3.6], rot: 0.12, phase: 0.0, amp: 0.12 },
      frameB: { pos: [3.4, 1.2, -4.4], rot: -0.18, phase: 1.7, amp: 0.1 },
      dais: { pos: [0, -1.15, -3.2], phase: 0.6 },
      slab: { pos: [2.6, 0.1, -2.4], rot: -0.3, phase: 2.4, amp: 0.14 },
      colA: { pos: [-3.9, 0.2, -2.0], phase: 0.9, amp: 0.1 },
      colB: { pos: [3.9, 0.0, -1.4], phase: 3.1, amp: 0.09 },
      accent: { pos: [-2.7, 1.6, -3.0], phase: 1.2, amp: 0.08 },
    }),
    [],
  );

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    // Slow, low-amplitude drift. ~0.25 rad/s base on a sine => very calm.
    if (frameAR.current) {
      const b = bases.frameA;
      frameAR.current.position.y = b.pos[1] + Math.sin(t * 0.22 + b.phase) * b.amp;
      frameAR.current.rotation.z = b.rot + Math.sin(t * 0.15 + b.phase) * 0.04;
    }
    if (frameBR.current) {
      const b = bases.frameB;
      frameBR.current.position.y = b.pos[1] + Math.sin(t * 0.19 + b.phase) * b.amp;
      frameBR.current.rotation.z = b.rot + Math.cos(t * 0.13 + b.phase) * 0.04;
    }
    if (daisR.current) {
      const b = bases.dais;
      daisR.current.rotation.y = Math.sin(t * 0.06 + b.phase) * 0.06;
    }
    if (slabR.current) {
      const b = bases.slab;
      slabR.current.position.y = b.pos[1] + Math.sin(t * 0.17 + b.phase) * b.amp;
      slabR.current.rotation.x = Math.sin(t * 0.1 + b.phase) * 0.05;
      slabR.current.rotation.z = b.rot + Math.cos(t * 0.12 + b.phase) * 0.03;
    }
    if (colAR.current) {
      const b = bases.colA;
      colAR.current.position.y = b.pos[1] + Math.sin(t * 0.2 + b.phase) * b.amp;
    }
    if (colBR.current) {
      const b = bases.colB;
      colBR.current.position.y = b.pos[1] + Math.sin(t * 0.16 + b.phase) * b.amp;
    }
    if (accentR.current) {
      const b = bases.accent;
      accentR.current.position.y = b.pos[1] + Math.sin(t * 0.25 + b.phase) * b.amp;
    }
  });

  return (
    <group>
      {/* Soft horizon + recessive ground keep depth without center clutter. */}
      <GradientBackdrop />
      <Ground />

      {/* Thin open frames, pushed to the edges/background, low contrast. */}
      <group ref={frameAR} position={bases.frameA.pos} rotation={[0, 0.35, bases.frameA.rot]}>
        <Frame width={2.2} height={3.1} color={PALETTE.goldDark} />
      </group>

      {showSecondFrame && (
        <group ref={frameBR} position={bases.frameB.pos} rotation={[0, -0.4, bases.frameB.rot]}>
          <Frame width={1.8} height={2.6} color={PALETTE.clay} />
        </group>
      )}

      {/* Low platform / dais centered-back, low and muted so it grounds the
          scene without rising into the form's reading area. */}
      <group ref={daisR} position={bases.dais.pos}>
        <mesh>
          <cylinderGeometry args={[2.4, 2.6, 0.3, columnSeg * 2]} />
          <meshStandardMaterial {...standardMat(PALETTE.sand)} />
        </mesh>
      </group>

      {/* A slim floating slab off to the right edge. */}
      {showExtraSlab && (
        <group ref={slabR} position={bases.slab.pos} rotation={[0, -0.5, bases.slab.rot]}>
          <mesh>
            <boxGeometry args={[0.12, 2.0, 1.1]} />
            <meshStandardMaterial {...standardMat(PALETTE.clay)} />
          </mesh>
        </group>
      )}

      {/* Slim columns at the far left/right, away from the center. */}
      <group ref={colAR} position={bases.colA.pos}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.18, 3.4, columnSeg]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>
      </group>

      {showSecondColumn && (
        <group ref={colBR} position={bases.colB.pos}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.17, 2.8, columnSeg]} />
            <meshStandardMaterial {...standardMat(PALETTE.sand)} />
          </mesh>
        </group>
      )}

      {/* Tiny gold emissive accents — edges only, small, for a faint glow.
          Not bloom-heavy; just a warm point of interest in the background. */}
      {showAccents && (
        <group ref={accentR} position={bases.accent.pos}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color={PALETTE.gold}
              emissive={PALETTE.gold}
              emissiveIntensity={0.6}
              metalness={0}
              roughness={0.5}
            />
          </mesh>
        </group>
      )}

      {showAccents && (
        <mesh position={[3.6, 1.9, -4.0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color={PALETTE.gold}
            emissive={PALETTE.gold}
            emissiveIntensity={0.5}
            metalness={0}
            roughness={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

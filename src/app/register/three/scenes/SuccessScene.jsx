import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Instances, Instance } from "@react-three/drei";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// SuccessScene — payment/booking SUCCESS celebration. A calm gold checkmark hero
// at center with a soft emissive glow, surrounded by a gentle fountain of
// instanced golden confetti drifting/falling with per-particle rotation + sway.
// Procedural geometry only, texture-free, mobile-first (one draw call for all
// confetti). Hero gently bobs and its glow softly pulses when in motion.

// Confetti tones cycle through the warm brand palette.
const CONFETTI_TONES = [PALETTE.gold, PALETTE.goldDark, PALETTE.cream, PALETTE.sand];

// Deterministic confetti field. Each particle gets a randomized start position,
// fall speed, sway phase/amplitude, spin axis/speed, scale and tone index. We
// precompute everything once so useFrame only mutates matrices.
function makeConfetti(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.3 + Math.random() * 2.2; // burst spread around the hero
    arr.push({
      // base column the particle falls down
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      // staggered vertical start so the fall looks continuous, not banded
      yStart: 2.6 + Math.random() * 2.4,
      ySpan: 4.6 + Math.random() * 1.2, // total fall distance before recycling
      fallSpeed: 0.35 + Math.random() * 0.55,
      swayAmp: 0.12 + Math.random() * 0.3,
      swayFreq: 0.6 + Math.random() * 0.9,
      swayPhase: Math.random() * Math.PI * 2,
      // independent spin per axis for a tumbling-confetti feel
      spinX: (Math.random() - 0.5) * 1.8,
      spinY: (Math.random() - 0.5) * 1.8,
      spinZ: (Math.random() - 0.5) * 1.8,
      rotPhase: Math.random() * Math.PI * 2,
      scale: 0.07 + Math.random() * 0.06,
      tone: i % CONFETTI_TONES.length,
    });
  }
  return arr;
}

function Confetti({ count, reducedMotion }) {
  const instRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => makeConfetti(count), [count]);

  // Callback ref on the InstancedMesh. When reducedMotion is on we freeze the
  // confetti in a pleasing scattered mid-fall arrangement exactly once here
  // (no useFrame). When motion is on we still capture the ref for useFrame.
  const setMesh = useCallback(
    (mesh) => {
      instRef.current = mesh;
      if (!mesh || !reducedMotion) return;
      particles.forEach((p, i) => {
        // frozen mid-fall, pleasingly scattered with a fixed tilt
        const y = p.yStart - p.ySpan * ((i % 7) / 7) - 0.4;
        const sway = Math.sin(p.swayPhase) * p.swayAmp;
        dummy.position.set(p.x + sway, y, p.z);
        dummy.rotation.set(p.spinX + p.rotPhase, p.spinY, p.spinZ + p.rotPhase);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
    // particles/dummy are stable (useMemo); reducedMotion drives the branch
    [particles, dummy, reducedMotion],
  );

  useFrame((state) => {
    if (reducedMotion) return;
    const mesh = instRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // continuous downward drift, wrapped within [yStart - ySpan, yStart]
      const fallen = (t * p.fallSpeed) % p.ySpan;
      const y = p.yStart - fallen;
      const sway = Math.sin(t * p.swayFreq + p.swayPhase) * p.swayAmp;
      dummy.position.set(p.x + sway, y, p.z + sway * 0.5);
      dummy.rotation.set(
        p.spinX * t + p.rotPhase,
        p.spinY * t,
        p.spinZ * t + p.rotPhase,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <Instances ref={setMesh} limit={count} range={count}>
      {/* thin flat box = low-poly confetti flake; one geometry, one draw call */}
      <boxGeometry args={[1, 1.4, 0.08]} />
      <meshStandardMaterial
        {...standardMat(PALETTE.gold, { metalness: 0.25, roughness: 0.45 })}
        emissive={PALETTE.gold}
        emissiveIntensity={0.18}
      />
      {particles.map((p, i) => (
        <Instance key={i} color={CONFETTI_TONES[p.tone]} />
      ))}
    </Instances>
  );
}

// Gold checkmark hero built from two boxes joined at the elbow. Wrapped in a
// group so the whole mark bobs / glows as one.
function CheckmarkHero({ reducedMotion }) {
  const groupRef = useRef();
  const shortRef = useRef();
  const longRef = useRef();

  useFrame((state) => {
    if (reducedMotion) return;
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // gentle vertical bob + the faintest tilt sway
    g.position.y = 0.2 + Math.sin(t * 1.1) * 0.08;
    g.rotation.z = Math.sin(t * 0.6) * 0.03;
    // soft glow pulse on both strokes
    const pulse = 0.55 + Math.sin(t * 1.6) * 0.2;
    if (shortRef.current) shortRef.current.emissiveIntensity = pulse;
    if (longRef.current) longRef.current.emissiveIntensity = pulse;
  });

  const goldMat = standardMat(PALETTE.gold, { metalness: 0.35, roughness: 0.35 });

  return (
    <group ref={groupRef} position={[0, 0.2, 0]}>
      {/* short stroke (down-left arm of the check) */}
      <mesh position={[-0.62, -0.28, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.32, 1.05, 0.32]} />
        <meshStandardMaterial
          ref={shortRef}
          {...goldMat}
          emissive={PALETTE.gold}
          emissiveIntensity={0.55}
        />
      </mesh>
      {/* long stroke (up-right arm of the check) */}
      <mesh position={[0.32, 0.18, 0]} rotation={[0, 0, -Math.PI / 3.2]}>
        <boxGeometry args={[0.32, 2.0, 0.32]} />
        <meshStandardMaterial
          ref={longRef}
          {...goldMat}
          emissive={PALETTE.gold}
          emissiveIntensity={0.55}
        />
      </mesh>
      {/* cream rounded backing disc to seat the mark and lift it off the bg */}
      <mesh position={[0, -0.05, -0.35]}>
        <cylinderGeometry args={[1.45, 1.45, 0.18, 36]} />
        <meshStandardMaterial {...standardMat(PALETTE.cream, { flat: false })} />
      </mesh>
    </group>
  );
}

export default function SuccessScene({ quality, reducedMotion }) {
  // Scale confetti COUNT hard by polyBudget: ~60 high / ~30 med / ~15 low.
  const budget = quality?.polyBudget ?? 1;
  const count = Math.max(8, Math.round(60 * budget));

  return (
    <group>
      {/* warm celebratory key light + soft fill so gold reads bright */}
      <pointLight position={[2.5, 3.5, 3]} intensity={1.4} color={PALETTE.cream} />
      <pointLight position={[-3, 1.5, 2]} intensity={0.5} color={PALETTE.sand} />

      <CheckmarkHero reducedMotion={reducedMotion} />

      <Confetti count={count} reducedMotion={reducedMotion} />

      {/* warm base plane near y=-1.2 to catch the light and ground the scene */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial {...standardMat(PALETTE.bg, { flat: false })} />
      </mesh>
    </group>
  );
}

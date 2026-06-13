import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// "Inside the UAE" — a stylized warm sunset vista: low-poly desert dunes as the
// ground, a goldDark/brown skyline with a tall Burj-like spire as the focal
// point, a couple of palm trees, and a vertex-colored sunset backdrop (no
// textures). Mobile-first: detail/instance counts scale with polyBudget, idle
// motion only when !reducedMotion (fronds sway, slow drift, subtle sky shimmer).
export default function InsideUaeScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  // --- polyBudget-aware segment/instance counts (sane minimums) ---------------
  const duneSegs = Math.max(6, Math.round(14 * budget)); // dune sphere segments
  const trunkSegs = Math.max(4, Math.round(8 * budget)); // palm trunk sides
  const frondCount = Math.max(5, Math.round(8 * budget)); // fronds per palm
  const spireSegs = Math.max(4, Math.round(6 * budget)); // spire needle sides

  // --- refs for idle motion ---------------------------------------------------
  const driftRef = useRef(); // whole-scene slow drift
  const palmARef = useRef(); // palm A frond crown
  const palmBRef = useRef(); // palm B frond crown
  const skyRef = useRef(); // backdrop (subtle emissive shimmer)

  // --- sunset backdrop geometry with a vertical vertex-color gradient ----------
  // Warm gold near the horizon (bottom) → deeper brown at the top. No texture.
  const skyGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(34, 22, 1, 6);
    const pos = geo.attributes.position;
    const horizon = new THREE.Color(PALETTE.gold);
    const top = new THREE.Color(PALETTE.brown);
    const colorAttr = new THREE.Float32BufferAttribute(pos.count * 3, 3);
    const c = new THREE.Color();
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const span = maxY - minY || 1;
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) - minY) / span; // 0 bottom → 1 top
      // ease so warmth lingers near the horizon
      const e = t * t;
      c.copy(horizon).lerp(top, e);
      colorAttr.setXYZ(i, c.r, c.g, c.b);
    }
    geo.setAttribute("color", colorAttr);
    return geo;
  }, []);

  // --- dune field (smoothed low-poly mounds) ----------------------------------
  // Wide squashed spheres make soft sand mounds. Spread across the lower area.
  const dunes = useMemo(
    () => [
      { pos: [0, -1.65, 0.4], scale: [4.6, 1.4, 3.2], color: PALETTE.sand },
      { pos: [-2.6, -1.75, -0.6], scale: [3.0, 1.1, 2.2], color: PALETTE.clay },
      { pos: [2.7, -1.75, -0.4], scale: [3.2, 1.2, 2.2], color: PALETTE.clay },
      { pos: [0.2, -1.85, -2.2], scale: [5.2, 1.3, 2.4], color: PALETTE.sand },
    ],
    [],
  );

  // --- background skyline towers (short, for depth) ---------------------------
  const towers = useMemo(
    () => [
      { pos: [-1.7, 0.1, -1.9], size: [0.5, 2.4, 0.5], color: PALETTE.brown },
      { pos: [-1.0, -0.1, -1.6], size: [0.42, 1.9, 0.42], color: PALETTE.goldDark },
      { pos: [1.1, 0.0, -1.7], size: [0.46, 2.1, 0.46], color: PALETTE.goldDark },
      { pos: [1.8, -0.15, -2.0], size: [0.5, 1.7, 0.5], color: PALETTE.brown },
      { pos: [0.0, -0.25, -2.3], size: [0.38, 1.4, 0.38], color: PALETTE.brown },
    ],
    [],
  );

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    // very slow whole-scene drift (gentle breathing parallax)
    if (driftRef.current) {
      driftRef.current.rotation.y = Math.sin(t * 0.08) * 0.04;
      driftRef.current.position.y = Math.sin(t * 0.25) * 0.02;
    }
    // palm fronds sway (small opposing rotations so the two palms feel alive)
    if (palmARef.current) {
      palmARef.current.rotation.z = Math.sin(t * 0.9) * 0.08;
      palmARef.current.rotation.x = Math.cos(t * 0.7) * 0.05;
    }
    if (palmBRef.current) {
      palmBRef.current.rotation.z = Math.sin(t * 0.9 + 1.2) * 0.08;
      palmBRef.current.rotation.x = Math.cos(t * 0.7 + 0.8) * 0.05;
    }
    // subtle sky shimmer via emissive intensity pulse
    if (skyRef.current) {
      skyRef.current.emissiveIntensity = 0.35 + Math.sin(t * 0.4) * 0.06;
    }
  });

  return (
    <group ref={driftRef}>
      {/* ---- sunset backdrop: vertex-colored gradient, faces the camera ---- */}
      <mesh geometry={skyGeometry} position={[0, 2.2, -5.2]}>
        <meshStandardMaterial
          ref={skyRef}
          vertexColors
          flatShading={false}
          metalness={0}
          roughness={1}
          emissive={PALETTE.gold}
          emissiveIntensity={0.35}
          side={THREE.FrontSide}
          fog={false}
        />
      </mesh>

      {/* ---- sun disc low on the horizon, glowing ---- */}
      <mesh position={[0, -0.3, -4.9]}>
        <circleGeometry args={[1.1, Math.max(10, Math.round(24 * budget))]} />
        <meshStandardMaterial
          color={PALETTE.cream}
          emissive={PALETTE.gold}
          emissiveIntensity={0.9}
          flatShading={false}
          metalness={0}
          roughness={1}
        />
      </mesh>

      {/* ---- desert dunes (ground) ---- */}
      {dunes.map((d, i) => (
        <mesh key={`dune-${i}`} position={d.pos} scale={d.scale}>
          <sphereGeometry
            args={[1, duneSegs, Math.max(4, Math.round(duneSegs * 0.6))]}
          />
          <meshStandardMaterial {...standardMat(d.color, { roughness: 0.95 })} />
        </mesh>
      ))}

      {/* ---- background skyline towers (depth) ---- */}
      {towers.map((tw, i) => (
        <mesh key={`tower-${i}`} position={tw.pos}>
          <boxGeometry args={tw.size} />
          <meshStandardMaterial {...standardMat(tw.color)} />
        </mesh>
      ))}

      {/* ---- focal Burj-like spire: stacked tapering boxes + cone needle ---- */}
      <group position={[0, 0, -1.1]}>
        {/* three stacked tapering tiers */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[0.7, 1.5, 0.7]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.46, 1.3, 0.46]} />
          <meshStandardMaterial {...standardMat(PALETTE.gold)} />
        </mesh>
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[0.28, 1.0, 0.28]} />
          <meshStandardMaterial {...standardMat(PALETTE.goldDark)} />
        </mesh>
        {/* tapered shoulder into the needle */}
        <mesh position={[0, 2.65, 0]}>
          <coneGeometry args={[0.16, 0.7, spireSegs]} />
          <meshStandardMaterial {...standardMat(PALETTE.gold)} />
        </mesh>
        {/* the needle tip, lightly glowing against the sunset */}
        <mesh position={[0, 3.4, 0]}>
          <coneGeometry args={[0.05, 0.9, spireSegs]} />
          <meshStandardMaterial
            color={PALETTE.cream}
            emissive={PALETTE.gold}
            emissiveIntensity={0.5}
            flatShading
            metalness={0.1}
            roughness={0.5}
          />
        </mesh>
      </group>

      {/* ---- palm tree A (left, foreground) ---- */}
      <PalmTree
        position={[-2.2, -1.4, 1.1]}
        trunkSegs={trunkSegs}
        frondCount={frondCount}
        crownRef={palmARef}
        scale={1.0}
      />

      {/* ---- palm tree B (right, slightly back & smaller) ---- */}
      <PalmTree
        position={[2.3, -1.5, 0.4]}
        trunkSegs={trunkSegs}
        frondCount={frondCount}
        crownRef={palmBRef}
        scale={0.85}
      />
    </group>
  );
}

// A single low-poly palm: a slightly curved brown trunk (stacked cylinders) and
// a crown of cream/gold frond cones fanned around the top. The crown group is
// ref'd so the parent can sway it in useFrame.
function PalmTree({ position, trunkSegs, frondCount, crownRef, scale = 1 }) {
  const fronds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < frondCount; i++) {
      const a = (i / frondCount) * Math.PI * 2;
      arr.push({
        rotY: a,
        // alternate frond colors for a little richness
        color: i % 2 === 0 ? PALETTE.cream : PALETTE.gold,
      });
    }
    return arr;
  }, [frondCount]);

  const trunkH = 1.8;

  return (
    <group position={position} scale={scale}>
      {/* trunk — two stacked cylinders give a subtle taper */}
      <mesh position={[0, trunkH * 0.28, 0]}>
        <cylinderGeometry args={[0.13, 0.17, trunkH * 0.55, trunkSegs]} />
        <meshStandardMaterial {...standardMat(PALETTE.clay, { roughness: 0.9 })} />
      </mesh>
      <mesh position={[0.04, trunkH * 0.74, 0]} rotation={[0, 0, -0.08]}>
        <cylinderGeometry args={[0.09, 0.13, trunkH * 0.5, trunkSegs]} />
        <meshStandardMaterial {...standardMat(PALETTE.brown, { roughness: 0.9 })} />
      </mesh>

      {/* frond crown — fanned cones, tilted outward; ref'd for sway */}
      <group ref={crownRef} position={[0.05, trunkH, 0]}>
        {fronds.map((f, i) => (
          <group key={`frond-${i}`} rotation={[0, f.rotY, 0]}>
            <mesh position={[0.45, 0.05, 0]} rotation={[0, 0, -Math.PI / 2.4]}>
              <coneGeometry args={[0.16, 1.0, 4]} />
              <meshStandardMaterial {...standardMat(f.color, { roughness: 0.6 })} />
            </mesh>
          </group>
        ))}
        {/* small crown cap to hide the frond joins */}
        <mesh position={[0, 0.02, 0]}>
          <icosahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial {...standardMat(PALETTE.gold)} />
        </mesh>
      </group>
    </group>
  );
}

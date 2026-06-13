import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, standardMat } from "@/app/register/three/lib/materials";

// "International / outside the UAE" scene: a slow low-poly globe with stylized
// raised continents, a tilted orbit ring, and an instanced star field. Cooler
// than the UAE scene — leans on brown/bg with gold accents. Procedural only:
// no textures, no model loads; glow via emissive, gradients via vertexColors.
export default function OutsideUaeScene({ quality, reducedMotion }) {
  const budget = quality?.polyBudget ?? 0.5;

  const globeRef = useRef();
  const ringRef = useRef();
  const starsRef = useRef();

  // --- Globe: flat-shaded icosphere with a few facets nudged outward to read
  //     as "land masses". Detail and continent count scale with polyBudget.
  const globeDetail = budget >= 1 ? 3 : budget >= 0.75 ? 2 : 1;
  const globeGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, globeDetail);
    geo.deleteAttribute("uv");

    // Deterministic pseudo-random so the continents are stable across renders.
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Pick a handful of "continent" centers on the unit sphere; vertices near a
    // center get pushed outward (raised land) and tinted gold.
    const continentCount = Math.max(3, Math.round(6 * budget));
    const centers = [];
    for (let i = 0; i < continentCount; i++) {
      const v = new THREE.Vector3(
        rand() * 2 - 1,
        rand() * 2 - 1,
        rand() * 2 - 1,
      );
      if (v.lengthSq() < 1e-4) v.set(0, 1, 0);
      centers.push(v.normalize());
    }

    const pos = geo.attributes.position;
    const colorAttr = new Float32Array(pos.count * 3);
    const land = PALETTE.goldDark;
    const ocean = PALETTE.brown;
    const tmp = new THREE.Vector3();
    const dir = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i);
      dir.copy(tmp).normalize();

      // Closest continent center → land strength (0 ocean .. 1 land).
      let best = -1;
      for (let c = 0; c < centers.length; c++) {
        const d = dir.dot(centers[c]);
        if (d > best) best = d;
      }
      const landAmt = THREE.MathUtils.smoothstep(best, 0.82, 0.95);

      // Raise land facets slightly outward.
      const scale = 1 + landAmt * 0.08;
      pos.setXYZ(i, tmp.x * scale, tmp.y * scale, tmp.z * scale);

      const r = THREE.MathUtils.lerp(ocean.r, land.r, landAmt);
      const g = THREE.MathUtils.lerp(ocean.g, land.g, landAmt);
      const b = THREE.MathUtils.lerp(ocean.b, land.b, landAmt);
      colorAttr[i * 3] = r;
      colorAttr[i * 3 + 1] = g;
      colorAttr[i * 3 + 2] = b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colorAttr, 3));
    geo.computeVertexNormals();
    return geo;
  }, [globeDetail, budget]);

  // --- Orbit ring: thin tilted torus. Radial segments scale with budget.
  const ringSegments = Math.max(48, Math.round(160 * budget));
  const ringGeometry = useMemo(
    () => new THREE.TorusGeometry(2.55, 0.018, 8, ringSegments),
    [ringSegments],
  );

  // --- Star field: instanced tiny spheres scattered on a shell around origin.
  //     Count scales hard with budget; phases drive subtle twinkle.
  const starCount = Math.max(40, Math.round(220 * budget));
  const { starGeometry, starMatrices, starPhases } = useMemo(() => {
    let seed = 9001;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const matrices = [];
    const phases = new Float32Array(starCount);
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();

    for (let i = 0; i < starCount; i++) {
      // Random direction on a sphere, radius in a thick shell (kept off-globe).
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      p.set(r * Math.cos(theta), u, r * Math.sin(theta));
      const radius = 3.4 + rand() * 2.2;
      p.multiplyScalar(radius);

      const scale = 0.01 + rand() * 0.03;
      s.set(scale, scale, scale);
      m.compose(p, q, s);
      matrices.push(m.clone());
      phases[i] = rand() * Math.PI * 2;
    }

    return {
      starGeometry: new THREE.IcosahedronGeometry(1, 0),
      starMatrices: matrices,
      starPhases: phases,
    };
  }, [starCount]);

  // Apply the precomputed instance matrices once the mesh exists.
  const applyStarMatrices = (mesh) => {
    if (!mesh || mesh.userData.seeded) return;
    for (let i = 0; i < starMatrices.length; i++) {
      mesh.setMatrixAt(i, starMatrices[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.seeded = true;
  };

  // Static pose (reducedMotion): tilt the globe a touch so continents read.
  const staticTilt = reducedMotion ? 0.35 : 0;

  useFrame((state, delta) => {
    if (reducedMotion) return;

    if (globeRef.current) globeRef.current.rotation.y += delta * 0.15;
    // Orbit ring slowly counter-rotates on its own axis.
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.08;

    // Cheap twinkle: gently pulse overall star emissive intensity.
    if (starsRef.current) {
      const t = state.clock.elapsedTime;
      const mat = starsRef.current.material;
      if (mat) mat.emissiveIntensity = 0.85 + Math.sin(t * 1.5) * 0.25;
    }
  });

  return (
    <group>
      {/* GLOBE — flat-shaded icosphere, vertex-colored ocean→land gradient */}
      <mesh ref={globeRef} geometry={globeGeometry} rotation={[staticTilt, 0, 0]}>
        <meshStandardMaterial
          {...standardMat(PALETTE.brown, { roughness: 0.85 })}
          vertexColors
          emissive={PALETTE.goldDark}
          emissiveIntensity={0.06}
        />
      </mesh>

      {/* ORBIT RING — thin gold torus tilted ~25° */}
      <mesh
        ref={ringRef}
        geometry={ringGeometry}
        rotation={[Math.PI / 2 - 0.44, 0, 0]}
      >
        <meshStandardMaterial
          {...standardMat(PALETTE.gold, { flat: false, metalness: 0.3, roughness: 0.4 })}
          emissive={PALETTE.gold}
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* STAR FIELD — instanced tiny cream points, subtle emissive twinkle */}
      <instancedMesh
        ref={(node) => {
          starsRef.current = node;
          applyStarMatrices(node);
        }}
        args={[starGeometry, undefined, starCount]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          {...standardMat(PALETTE.cream, { flat: false })}
          emissive={PALETTE.cream}
          emissiveIntensity={0.85}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

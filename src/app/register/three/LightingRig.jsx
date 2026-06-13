import { PALETTE } from "@/app/register/three/lib/materials";

// Warm, brand-tinted procedural lighting. No HDRI/environment fetch (mobile-first).
// Key from upper-right, warm fill, cool-ish rim for separation.
export default function LightingRig({ quality }) {
  const shadows = Boolean(quality?.shadows);
  return (
    <group>
      <hemisphereLight args={["#fff4e0", "#3a2f27", 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[5, 7, 4]}
        intensity={1.15}
        color={"#ffe9c7"}
        castShadow={shadows}
        shadow-mapSize-width={shadows ? 1024 : undefined}
        shadow-mapSize-height={shadows ? 1024 : undefined}
      />
      <directionalLight
        position={[-6, 3, -4]}
        intensity={0.4}
        color={"#cfe0ff"}
      />
      <pointLight position={[0, 2, 3]} intensity={0.4} color={PALETTE.gold} />
    </group>
  );
}

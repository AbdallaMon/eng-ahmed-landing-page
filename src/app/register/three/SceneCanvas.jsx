"use client";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import { getQualityProfile } from "@/app/register/three/lib/quality";
import SceneDirector from "@/app/register/three/SceneDirector";

// The ONE persistent canvas. Renders fixed/full-screen behind the DOM UI. Starts
// at the detected tier and steps DOWN under sustained low FPS (PerformanceMonitor).
export default function SceneCanvas({ tier, renderedKey, reducedMotion }) {
  const [quality, setQuality] = useState(() => getQualityProfile(tier));

  return (
    <Canvas
      dpr={quality.dpr}
      shadows={quality.shadows}
      gl={{
        antialias: quality.antialias,
        powerPreference: "high-performance",
        alpha: false,
      }}
      camera={{ position: [0, 1.1, 6.2], fov: 52 }}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1c1611"]} />
      <PerformanceMonitor
        onDecline={() => setQuality(getQualityProfile("low"))}
      />
      <AdaptiveDpr pixelated={false} />
      <SceneDirector
        renderedKey={renderedKey}
        quality={quality}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

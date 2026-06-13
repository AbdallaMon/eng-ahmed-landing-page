"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { detectCapability } from "@/app/register/three/lib/capability";
import { useSceneTransition } from "@/app/register/three/lib/transitions";
import { Register3DContext } from "@/app/register/three/Register3DContext";
import Backdrop2D from "@/app/register/three/fallback/Backdrop2D";
import colors from "@/app/register/theme/colors";

// Heavy 3D bundle is client-only + code-split: never in the SSR/initial payload.
const SceneCanvas = dynamic(
  () => import("@/app/register/three/SceneCanvas"),
  { ssr: false },
);

export default function Register3DProvider({ children }) {
  // Conservative until the client resolves capability (avoids SSR/hydration cost
  // and a flash of canvas on devices that will fall back).
  const [capability, setCapability] = useState({
    use3D: false,
    tier: "none",
    reducedMotion: false,
    webgl: false,
  });
  const [sceneKey, setSceneKey] = useState("intro");

  useEffect(() => {
    setCapability(detectCapability());
  }, []);

  const { rendered, veil, veilMs } = useSceneTransition(sceneKey);
  const ctx = useMemo(
    () => ({ capability, sceneKey, setSceneKey }),
    [capability, sceneKey],
  );

  return (
    <Register3DContext.Provider value={ctx}>
      {capability.use3D ? (
        <>
          <SceneCanvas
            tier={capability.tier}
            renderedKey={rendered}
            reducedMotion={capability.reducedMotion}
          />
          {/* DOM cross-fade veil over the canvas swap */}
          <div
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              background: colors.bgPrimary,
              opacity: veil,
              transition: `opacity ${veilMs}ms ease`,
            }}
          />
        </>
      ) : (
        <Backdrop2D />
      )}
      {children}
    </Register3DContext.Provider>
  );
}

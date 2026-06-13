"use client";
import { useEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "@/app/register/lib/animations";
import { Register3DContext } from "@/app/register/three/Register3DContext";

/**
 * Neutralized global 3D provider.
 *
 * Historically this capability-detected the device and mounted a heavy WebGL
 * `SceneCanvas` (the old procedural "blocky" scenes) behind EVERY /register
 * route. The 3D redesign replaces that with per-variant rendering under
 * `core/` + `variants/`, so this global provider must NO LONGER mount any
 * WebGL canvas.
 *
 * It now simply provides the SAME `Register3DContext` value shape — but with
 * `capability.use3D` forced to `false` — so existing consumers (`CheckoutView`,
 * `SuccessView`, `CancelView`, `BookingWizard`, `StepLayout`) keep working
 * unchanged: they all read `capability.use3D` and already have a 2D branch,
 * which they now always take. `sceneKey`/`setSceneKey` are kept as harmless
 * state so their existing `setSceneKey(...)` effects remain no-ops.
 *
 * Net effect: the old procedural scenes are gone from the whole section,
 * nothing breaks, and booking still works. The variants own all real 3D.
 */
export default function Register3DProvider({ children }) {
  // We still detect reduced-motion so the context reports it honestly, but we
  // never gate any WebGL on it here (there is no WebGL in this provider).
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sceneKey, setSceneKey] = useState("intro");

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  const ctx = useMemo(
    () => ({
      // 3D is always off at this global level — variants render their own 3D.
      capability: {
        use3D: false,
        tier: "none",
        webgl: false,
        reducedMotion,
      },
      sceneKey,
      setSceneKey,
    }),
    [reducedMotion, sceneKey],
  );

  return (
    <Register3DContext.Provider value={ctx}>
      {children}
    </Register3DContext.Provider>
  );
}

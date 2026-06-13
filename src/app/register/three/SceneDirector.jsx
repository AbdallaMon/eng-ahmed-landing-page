import { Suspense } from "react";
import { resolveSceneComponent } from "@/app/register/three/sceneRegistry";
import LightingRig from "@/app/register/three/LightingRig";
import CameraRig from "@/app/register/three/CameraRig";
import Effects from "@/app/register/three/Effects";

// Renders exactly ONE scene at a time (the DOM veil covers the swap, so we never
// pay for two scenes on mobile). renderedKey comes from useSceneTransition.
export default function SceneDirector({ renderedKey, quality, reducedMotion }) {
  const Scene = resolveSceneComponent(renderedKey);
  return (
    <>
      <LightingRig quality={quality} />
      <CameraRig reducedMotion={reducedMotion} />
      <Suspense fallback={null}>
        <Scene quality={quality} reducedMotion={reducedMotion} />
      </Suspense>
      <Effects quality={quality} />
    </>
  );
}

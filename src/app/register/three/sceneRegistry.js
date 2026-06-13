import { lazy } from "react";

// sceneKey → lazy 3D scene component. Keys are stable contract strings the
// director + overlays agree on. Scenes are code-split (each loads on demand).
//
// Lines below the placeholder are added as each scene file lands (SP-1..4). Keep
// a key commented until its file exists, so the bundler never tries to resolve a
// missing module. Unknown/uncommented keys safely fall back to the placeholder.
export const SCENES = {
  placeholder: lazy(() =>
    import("@/app/register/three/scenes/PlaceholderScene"),
  ),
  // intro: lazy(() => import("@/app/register/three/scenes/IntroScene")),
  // INSIDE_UAE: lazy(() => import("@/app/register/three/scenes/InsideUaeScene")),
  // OUTSIDE_UAE: lazy(() => import("@/app/register/three/scenes/OutsideUaeScene")),
  // APARTMENT: lazy(() => import("@/app/register/three/scenes/ApartmentScene")),
  // CONSTRUCTION_VILLA: lazy(() => import("@/app/register/three/scenes/ConstructionVillaScene")),
  // PART_OF_HOME: lazy(() => import("@/app/register/three/scenes/PartOfHomeScene")),
  // form: lazy(() => import("@/app/register/three/scenes/AmbientFormScene")),
  // wizard: lazy(() => import("@/app/register/three/scenes/WizardAmbientScene")),
  // success: lazy(() => import("@/app/register/three/scenes/SuccessScene")),
  // cancel: lazy(() => import("@/app/register/three/scenes/CancelScene")),
};

// Unknown keys fall back to the placeholder so a missing scene never crashes the
// canvas (it just shows the neutral seam scene).
export function resolveSceneComponent(key) {
  return SCENES[key] || SCENES.placeholder;
}

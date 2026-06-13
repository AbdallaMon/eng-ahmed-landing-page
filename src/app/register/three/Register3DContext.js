"use client";
import { createContext, useContext } from "react";

// Overlays read capability + drive the active scene through this context.
export const Register3DContext = createContext({
  capability: { use3D: false, tier: "none", reducedMotion: false, webgl: false },
  sceneKey: "intro",
  setSceneKey: () => {},
});

export function useRegister3D() {
  return useContext(Register3DContext);
}

// Map the lead-selection flow stage to a sceneKey. The richest signal wins so a
// chosen item's scene is shown immediately (even during the item→form beat),
// then location, then the design intro. Called with (step, location, item) from
// useLeadFlow; the result is passed to setSceneKey.
export function leadStageToSceneKey(step, location, item) {
  if (item) return item; // APARTMENT | CONSTRUCTION_VILLA | PART_OF_HOME
  if (location && step === "item") return location; // INSIDE_UAE | OUTSIDE_UAE
  return "intro"; // designIntro | email | location(unselected)
}

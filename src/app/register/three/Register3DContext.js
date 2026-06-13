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

// Map the lead-selection flow stage to a sceneKey. SP-1 overlays call this with
// (step, location, item) from useLeadFlow and pass the result to setSceneKey.
export function leadStageToSceneKey(step, location, item) {
  if (step === "item" && location) return location; // INSIDE_UAE | OUTSIDE_UAE
  if (step === "form" && item) return item; // APARTMENT | CONSTRUCTION_VILLA | PART_OF_HOME
  return "intro"; // designIntro | email | location(unselected)
}

import * as THREE from "three";
import colors from "@/app/register/theme/colors";

// Brand palette as THREE colors (parsed once). Mirrors register/theme/colors so
// the 3D world matches the gold/beige identity.
export const PALETTE = {
  gold: new THREE.Color(colors.primary), // #d3ac71
  goldDark: new THREE.Color(colors.primaryDark), // #be975c
  cream: new THREE.Color(colors.primaryAlt), // #f7eedd
  sand: new THREE.Color(colors.secondary), // #e3b79a
  clay: new THREE.Color(colors.secondaryDark), // #a07559
  brown: new THREE.Color(colors.heading), // #383028
  bg: new THREE.Color(colors.bgPrimary), // #eae7e2
};

// Texture-free standard material props — flat-shaded low-poly look, no downloads.
// Spread onto a material: <meshStandardMaterial {...standardMat(color)} />.
export function standardMat(
  color,
  { flat = true, metalness = 0.05, roughness = 0.7 } = {},
) {
  return { color, flatShading: flat, metalness, roughness };
}

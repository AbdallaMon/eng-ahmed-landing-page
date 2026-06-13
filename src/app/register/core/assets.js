// Asset manifest for the /register 3D variants.
//
// Maps the flow's imagery to LOCAL `/public` paths, initialized with EXISTING
// files so variants never stall on a download at runtime. All paths are served
// from `/public`; there are NO external requests.
//
// NOTE: the per-item images below are INITIAL picks reusing the project-3
// gallery (apartment / villa / part-of-home). They are placeholders to be
// refined later with dedicated, clearly-representative interior stills (see the
// spec's Assets plan). Swap the paths here — variants read only through the
// helpers — when better imagery is dropped into `/public`.

export const assets = {
  // Hero / DESIGN intro backdrop (the category photo).
  hero: "/design.jfif",
  design: "/design.jfif",

  // Location option imagery (INSIDE_UAE | OUTSIDE_UAE).
  locations: {
    INSIDE_UAE: "/inside-uae.webp",
    OUTSIDE_UAE: "/outside-uae.jpg",
  },

  // Design sub-type (item) imagery. Initial picks from the project-3 gallery —
  // refine later with dedicated apartment / villa / room stills.
  items: {
    APARTMENT: "/projects/project-3/1.jpg",
    CONSTRUCTION_VILLA: "/projects/project-3/5.jpg",
    PART_OF_HOME: "/projects/project-3/10.jpg",
  },

  // GLB models for the WebGL variants (V2 gallery / V3 hero).
  // Intentionally null for now — drop compressed CC0 `.glb` files into
  // `public/register/assets/` later and wire their paths here. While null, the
  // WebGL variants fall back to photography / a lit fallback (never a crash).
  models: {
    hero: null, // V3 single signature hero object
    APARTMENT: null,
    CONSTRUCTION_VILLA: null,
    PART_OF_HOME: null,
  },
};

/**
 * Local image path for a location value.
 * @param {"INSIDE_UAE"|"OUTSIDE_UAE"|string} value
 * @returns {string} a `/public` path (falls back to the hero/design photo)
 */
export function imageForLocation(value) {
  return assets.locations[value] || assets.hero;
}

/**
 * Local image path for a design sub-type (item) value.
 * @param {"APARTMENT"|"CONSTRUCTION_VILLA"|"PART_OF_HOME"|string} value
 * @returns {string} a `/public` path (falls back to the hero/design photo)
 */
export function imageForItem(value) {
  return assets.items[value] || assets.hero;
}

/**
 * Local GLB model path for a key (e.g. "hero" or an item value), or null when
 * none is wired yet (caller should fall back).
 * @param {string} key
 * @returns {string|null}
 */
export function modelFor(key) {
  return assets.models[key] ?? null;
}

export default assets;

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
  // Hero / DESIGN intro backdrop — a WIDE/landscape premium living space
  // (starry ceiling, indoor garden) for full-bleed full-screen use + the
  // "enter the design" push-in. Curated from the owner's project-5 render and
  // optimized to WebP (1920w, q72) under /public/register/assets/v1wide.
  hero: "/register/assets/v1wide/hero.webp",
  design: "/register/assets/v1wide/hero.webp",

  // Location option imagery (INSIDE_UAE | OUTSIDE_UAE).
  locations: {
    INSIDE_UAE: "/inside-uae.webp",
    OUTSIDE_UAE: "/outside-uae.webp",
  },

  // Design sub-type (item) imagery — clean, distinct, WIDE/landscape on-brand
  // interiors curated from the owner's real renders and compressed to WebP
  // (<=1920w, q72) under /public/register/assets/v1wide:
  //   APARTMENT — high-rise apartment living/dining with a city-skyline view,
  //   CONSTRUCTION_VILLA — a grand marble + gold majlis (villa/palace scale),
  //   PART_OF_HOME — a single elegant living room ("part of a home").
  items: {
    APARTMENT: "/register/assets/v1wide/apartment.webp",
    CONSTRUCTION_VILLA: "/register/assets/v1wide/villa.webp",
    PART_OF_HOME: "/register/assets/v1wide/partOfHome.webp",
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

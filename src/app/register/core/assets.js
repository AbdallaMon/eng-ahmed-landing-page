// Asset manifest for the /register flow. Maps the flow's imagery to LOCAL
// `/public` paths (curated + WebP-optimized) — there are NO external requests.
// Variants read only through the helpers, so swapping imagery is path-only.

export const assets = {
  // Hero / DESIGN intro backdrop — wide premium living space for full-bleed use.
  hero: "/register/assets/v1wide/hero.webp",
  design: "/register/assets/v1wide/hero.webp",

  // Location option imagery (INSIDE_UAE | OUTSIDE_UAE).
  locations: {
    INSIDE_UAE: "/inside-uae.webp",
    OUTSIDE_UAE: "/outside-uae.webp",
  },

  // Design sub-type (item) imagery.
  items: {
    APARTMENT: "/register/assets/v1wide/apartment.webp",
    CONSTRUCTION_VILLA: "/register/assets/v1wide/villa.webp",
    PART_OF_HOME: "/register/assets/v1wide/partOfHome.webp",
  },
};

/** Local image path for a location value (falls back to the hero photo). */
export function imageForLocation(value) {
  return assets.locations[value] || assets.hero;
}

/** Local image path for a design sub-type (item) value (falls back to hero). */
export function imageForItem(value) {
  return assets.items[value] || assets.hero;
}

export default assets;

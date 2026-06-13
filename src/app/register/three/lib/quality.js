// Concrete quality profile per device tier. Scenes + canvas read from this so
// quality scales DOWN on weak devices (mobile-first). Values are deliberately
// conservative on low/medium — fidelity is secondary to a smooth funnel.
export const QUALITY_PROFILES = {
  low: {
    tier: "low",
    dpr: [1, 1.25],
    postProcessing: false,
    bloom: false,
    dof: false,
    shadows: false,
    polyBudget: 0.5, // scenes multiply segment/instance counts by this
    antialias: false,
  },
  medium: {
    tier: "medium",
    dpr: [1, 1.5],
    postProcessing: true,
    bloom: false,
    dof: false,
    shadows: false,
    polyBudget: 0.75,
    antialias: true,
  },
  high: {
    tier: "high",
    dpr: [1, 2],
    postProcessing: true,
    bloom: true,
    dof: true,
    shadows: true,
    polyBudget: 1,
    antialias: true,
  },
};

export function getQualityProfile(tier) {
  return QUALITY_PROFILES[tier] || QUALITY_PROFILES.low;
}

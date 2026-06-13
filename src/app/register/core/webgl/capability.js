"use client";
// WebGL + perf capability detection for the /register 3D variants.
//
// Decoupled copy of the original `three/lib/capability.js`, moved into `core/`
// so the variants (V2 WebGL gallery, V3 hybrid hero) can capability-gate their
// real-3D paths without depending on the old `three/` system. Cheap signals
// only — runs once on the client at mount, never benchmarks on the critical
// path. SSR-safe (returns the conservative path on the server).

/** Whether the browser can create a WebGL context at all. */
export function supportsWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

/** Whether the user has asked the OS to minimise motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Coarse device tier from cheap, widely-available signals.
export function detectTier() {
  if (typeof window === "undefined") return "low";
  const mem = navigator.deviceMemory || 4; // GB where exposed (Chrome/Android)
  const cores = navigator.hardwareConcurrency || 4;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (mem <= 3 || cores <= 4) return coarse ? "low" : "medium";
  if (mem <= 6 || cores <= 6) return "medium";
  return "high";
}

/**
 * use3D gates the whole WebGL path: a present GPU AND motion not suppressed.
 * @returns {{ use3D: boolean, tier: "none"|"low"|"medium"|"high", reducedMotion: boolean, webgl: boolean }}
 */
export function detectCapability() {
  const webgl = supportsWebGL();
  const reducedMotion = prefersReducedMotion();
  const tier = webgl ? detectTier() : "none";
  return { webgl, reducedMotion, tier, use3D: webgl && !reducedMotion };
}

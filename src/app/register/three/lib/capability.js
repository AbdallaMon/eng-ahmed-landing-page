"use client";
// Detect rendering capability + a coarse perf tier for the 3D register.
// Cheap signals only — runs once on the client at mount, never benchmarks on
// the critical path. SSR-safe (returns the conservative path on the server).

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

// use3D gates the whole WebGL path: present GPU AND motion not suppressed.
export function detectCapability() {
  const webgl = supportsWebGL();
  const reducedMotion = prefersReducedMotion();
  const tier = webgl ? detectTier() : "none";
  return { webgl, reducedMotion, tier, use3D: webgl && !reducedMotion };
}

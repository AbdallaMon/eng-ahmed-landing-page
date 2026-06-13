"use client";
import { useEffect, useRef, useState } from "react";
import {
  getUrlSpeed,
  MOTION_SCALE,
  prefersReducedMotion,
} from "@/app/register/lib/animations";

// Cross-fade between scenes via a DOM veil (cheaper than rendering two scenes on
// mobile): when sceneKey changes, fade a brand veil IN, swap the rendered scene
// at the peak, then fade OUT. Honors ?speed= and prefers-reduced-motion.
export function useSceneTransition(sceneKey) {
  const [rendered, setRendered] = useState(sceneKey);
  const [veil, setVeil] = useState(0);
  const prev = useRef(sceneKey);
  const timers = useRef([]);

  useEffect(() => {
    if (sceneKey === prev.current) return;
    prev.current = sceneKey;
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (prefersReducedMotion()) {
      setRendered(sceneKey);
      return;
    }
    const half = (260 * MOTION_SCALE) / getUrlSpeed();
    setVeil(1);
    timers.current.push(setTimeout(() => setRendered(sceneKey), half));
    timers.current.push(setTimeout(() => setVeil(0), half + 30));
    return () => timers.current.forEach(clearTimeout);
  }, [sceneKey]);

  // veilMs is exposed so the DOM veil's CSS transition matches the swap timing.
  const veilMs = (260 * MOTION_SCALE) / getUrlSpeed();
  return { rendered, veil, veilMs };
}

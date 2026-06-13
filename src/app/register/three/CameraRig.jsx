import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";

// Owns the camera. Portrait-first framing; widened on landscape/desktop. Gentle
// idle float when motion is allowed. Scenes are authored to this framing so
// transitions stay continuous (variety comes from scene CONTENT, not camera).
export default function CameraRig({ reducedMotion }) {
  const { camera, size } = useThree();
  const base = useRef([0, 1.1, 6.2]);

  useEffect(() => {
    const portrait = size.height >= size.width;
    base.current = portrait ? [0, 1.1, 6.2] : [0, 1.0, 5.4];
    camera.fov = portrait ? 52 : 40;
    camera.position.set(...base.current);
    camera.lookAt(0, 0.2, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    camera.position.x = base.current[0] + Math.sin(t * 0.25) * 0.25;
    camera.position.y = base.current[1] + Math.sin(t * 0.32) * 0.12;
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

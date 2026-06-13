"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, OrbitControls, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { supportsWebGL } from "@/app/register/core/webgl/capability";
import { prefersReducedMotion } from "@/app/register/lib/animations";

/**
 * Reusable R3F stage for loading a real GLB model — shared by V2 (gallery) and
 * V3 (single hero). Designed to be imported via `next/dynamic(..., { ssr:false })`
 * by the variants (it touches WebGL + window). Generic on purpose: variants
 * supply the `src` (a `/public` GLB path) and a `fallback`; this file bundles
 * NO GLB.
 *
 * Behaviour:
 *  - Softly lit (HDRI `Environment` + a key/fill light), gentle auto-rotate,
 *    subtle pointer parallax (the model leans toward the cursor).
 *  - `onReady(api)` hands the variant a camera api: `api.flyIn(opts)` tweens the
 *    camera toward the model (GSAP) on demand; `api.reset()` returns it.
 *  - Resilience: if WebGL is unavailable OR `src` fails to load/404s, the whole
 *    stage renders `fallback` instead (never a hard crash, never the old blocky
 *    look). It logs what it substituted.
 *
 * @param {{
 *   src: string,                         // GLB path under /public
 *   fallback?: React.ReactNode,          // shown when WebGL/model unavailable
 *   autoRotate?: boolean,                // gentle turntable (default true)
 *   onReady?: (api: { flyIn: Function, reset: Function }) => void,
 *   cameraFly?: boolean,                 // auto-fire flyIn once on ready
 *   controls?: boolean,                  // expose OrbitControls (default false)
 *   environmentPreset?: string,          // drei Environment preset (default "apartment")
 *   modelScale?: number,                 // uniform scale applied to the model
 *   height?: number | string,            // canvas height (default "100%")
 * }} props
 */
export default function ModelStage({
  src,
  fallback = null,
  autoRotate = true,
  onReady,
  cameraFly = false,
  controls = false,
  environmentPreset = "apartment",
  modelScale = 1,
  height = "100%",
}) {
  // WebGL availability is resolved synchronously on the client via a lazy
  // initializer (this component is always mounted ssr:false by variants, so the
  // initializer runs in the browser — no effect/cascade needed). SSR-safe:
  // `supportsWebGL()` returns false on the server.
  const [webglOk] = useState(() => supportsWebGL());
  // Flipped to true if the GLB fails to load (error boundary below).
  const [modelFailed, setModelFailed] = useState(false);

  if (!webglOk) {
    console.warn(
      "[ModelStage] WebGL unavailable — falling back (no 3D model rendered).",
    );
    return fallback;
  }
  if (modelFailed) {
    console.warn(
      `[ModelStage] model failed to load (${src}) — falling back to provided fallback.`,
    );
    return fallback;
  }
  if (!src) {
    // No model wired yet (e.g. assets.models.* still null) → fallback.
    return fallback;
  }

  return (
    <div style={{ width: "100%", height }}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.4, 4.2], fov: 42 }}
      >
        <ModelErrorBoundary onError={() => setModelFailed(true)}>
          <Suspense fallback={null}>
            <SceneContents
              src={src}
              autoRotate={autoRotate}
              onReady={onReady}
              cameraFly={cameraFly}
              environmentPreset={environmentPreset}
              modelScale={modelScale}
            />
          </Suspense>
        </ModelErrorBoundary>
        {controls && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            makeDefault
          />
        )}
      </Canvas>
    </div>
  );
}

/**
 * Inside-canvas contents: lights + environment + the GLB, the gentle
 * auto-rotate / pointer parallax, and the GSAP camera api exposed via onReady.
 */
function SceneContents({
  src,
  autoRotate,
  onReady,
  cameraFly,
  environmentPreset,
  modelScale,
}) {
  const { scene } = useGLTF(src);
  const groupRef = useRef(null);
  const { camera } = useThree();
  const reduce = useMemo(() => prefersReducedMotion(), []);
  // Smoothed pointer target for the parallax lean.
  const pointer = useRef({ x: 0, y: 0 });
  const camTween = useRef(null);

  // Clone so the same cached GLB can be mounted by more than one stage safely.
  const model = useMemo(() => scene.clone(true), [scene]);

  // Expose the camera api to the variant once mounted.
  useEffect(() => {
    if (!onReady) return undefined;
    const home = camera.position.clone();
    const api = {
      /**
       * Tween the camera toward the model (the "fly in" beat). Reduced-motion
       * snaps instantly.
       * @param {{ z?: number, y?: number, duration?: number, onComplete?: Function }} [o]
       */
      flyIn(o = {}) {
        const { z = 2.2, y = 0.2, duration = 1.1, onComplete } = o;
        if (camTween.current) camTween.current.kill();
        if (reduce) {
          camera.position.set(0, y, z);
          camera.updateProjectionMatrix();
          onComplete?.();
          return;
        }
        camTween.current = gsap.to(camera.position, {
          x: 0,
          y,
          z,
          duration,
          ease: "power3.inOut",
          onUpdate: () => camera.updateProjectionMatrix(),
          onComplete,
        });
      },
      /** Return the camera to its starting framing. */
      reset(o = {}) {
        const { duration = 1 } = o;
        if (camTween.current) camTween.current.kill();
        if (reduce) {
          camera.position.copy(home);
          camera.updateProjectionMatrix();
          return;
        }
        camTween.current = gsap.to(camera.position, {
          x: home.x,
          y: home.y,
          z: home.z,
          duration,
          ease: "power3.inOut",
          onUpdate: () => camera.updateProjectionMatrix(),
        });
      },
    };
    onReady(api);
    if (cameraFly) api.flyIn();
    return () => {
      if (camTween.current) camTween.current.kill();
    };
    // camera + flags are stable for the stage's lifetime.
  }, [onReady, cameraFly, reduce, camera]);

  // Track pointer (normalised) for the parallax lean.
  useEffect(() => {
    if (reduce) return undefined;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    if (autoRotate && !reduce) {
      g.rotation.y += delta * 0.25; // gentle turntable
    }
    if (!reduce) {
      // Subtle parallax lean toward the cursor (eased).
      const targetX = pointer.current.y * 0.12;
      const targetZ = pointer.current.x * 0.12;
      g.rotation.x += (targetX - g.rotation.x) * 0.05;
      g.rotation.z += (-targetZ - g.rotation.z) * 0.05;
    }
  });

  return (
    <>
      {/* Soft, warm lighting that flatters interior pieces. */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} />
      <Environment preset={environmentPreset} />

      <Float
        speed={reduce ? 0 : 1.1}
        rotationIntensity={reduce ? 0 : 0.2}
        floatIntensity={reduce ? 0 : 0.4}
      >
        <group ref={groupRef} scale={modelScale} dispose={null}>
          <primitive object={model} />
        </group>
      </Float>
    </>
  );
}

/**
 * Error boundary so a failed GLB load (404 / decode error) flips the parent to
 * its `fallback` instead of crashing the tree. React error boundaries must be
 * class components.
 */
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn("[ModelStage] GLB load/render error:", error?.message || error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) return null; // parent swaps to fallback
    return this.props.children;
  }
}

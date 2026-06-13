import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

// Postprocessing is OFF on low tier (composer not mounted). Vignette on medium+,
// Bloom only on high. Keeps mobile cheap while desktop gets the cinematic look.
export default function Effects({ quality }) {
  if (!quality?.postProcessing) return null;
  return (
    <EffectComposer
      disableNormalPass
      multisampling={quality.antialias ? 2 : 0}
    >
      {quality.bloom ? (
        <Bloom intensity={0.6} luminanceThreshold={0.7} mipmapBlur />
      ) : null}
      <Vignette eskil={false} offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
}

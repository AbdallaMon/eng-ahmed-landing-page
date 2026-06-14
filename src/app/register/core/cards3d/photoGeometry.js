// Shared backdrop-photo geometry for the V1 "Living Cards" flow.
//
// ONE source of truth so the full-screen backdrop (`PerspectiveStage`) and the
// card → full-screen COVER morph (`coverMorph`) land on the EXACT same framing.
// If they ever disagree, the card hand-off "flashes" (the image visibly jumps to
// a different crop/scale the instant the flow advances). Keeping the overscan
// here — imported by both — makes the morph's final frame pixel-identical to the
// backdrop's resting frame, so the swap is invisible.
//
// PHOTO_OVERSCAN: the resting scale of the full-bleed photo. It stays > 1 so the
// parallax / Ken-Burns nudge never reveals an edge. Both the backdrop layer
// (`transform: scale(OVERSCAN)` over an inset:0, `cover`, centred box) and the
// morph overlay (a centred box sized `OVERSCAN × viewport`, `cover`) resolve to
// the identical crop because both boxes share the viewport's aspect ratio.

export const PHOTO_OVERSCAN = 1.14;

// How much further the slow Ken-Burns drifts past the resting scale.
export const PHOTO_KENBURNS = 0.1;

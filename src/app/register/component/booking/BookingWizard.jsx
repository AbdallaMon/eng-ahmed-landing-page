"use client";

import { useEffect } from "react";
import { Box, Container, useTheme } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRegister3D } from "@/app/register/three/Register3DContext";
import { VideoIntro } from "./VideoIntro";
import { StepsController } from "./steps/StepsController";

/**
 * Booking wizard shell. Shows the video intro by default; reveals the 9-step
 * wizard when `?booking=true`.
 *
 * Deep-linking: a link with `?step=N` and/or `?leadId=X` opens the wizard
 * straight away (no need to click the CTA first), and useBookingSteps resumes
 * the right step / lead from those params.
 */
export function BookingWizard() {
  const theme = useTheme();
  const searchParams = useSearchParams();

  // Drive the persistent 3D backdrop to the calm ambient "wizard" scene while
  // the booking wizard is mounted. On the 2D fallback this is a no-op.
  const { capability, setSceneKey } = useRegister3D();
  const use3D = capability.use3D;

  useEffect(() => {
    setSceneKey("wizard");
  }, [setSceneKey]);

  const hasDeepLink =
    searchParams.get("step") !== null || searchParams.get("leadId") !== null;
  const showForm = searchParams.get("booking") === "true" || hasDeepLink;

  return (
    <Box
      sx={{
        height: showForm ? "auto" : "100dvh",
        width: "100%",
        overflow: "hidden",
        // On the WebGL path the fixed 3D canvas IS the backdrop, so this layer
        // stays transparent to let it show through. The 2D fallback keeps the
        // original opaque brand background.
        bgcolor: use3D ? "transparent" : theme.palette.background.default,
        minHeight: "100dvh",
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Container
          maxWidth="md"
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            pt: { xs: 3, sm: 4 },
            pb: 2,
            px: { xs: 2, sm: 3 },
            gap: 2,
          }}
        >
          <VideoIntro showForm={showForm} />
          {showForm && <StepsController />}
        </Container>
      </Box>
    </Box>
  );
}

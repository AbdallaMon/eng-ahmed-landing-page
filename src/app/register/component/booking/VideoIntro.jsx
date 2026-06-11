"use client";

import { Box, Button, Typography, useTheme } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { BOOKING } from "./data";

/**
 * Landing video + call-to-action. Clicking the CTA sets `?booking=true`,
 * which reveals the wizard. Hidden once the wizard is showing.
 */
export function VideoIntro({ showForm = false }) {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translate } = useLanguage();

  if (showForm) return null;

  return (
    <>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: theme.shadows[8],
            bgcolor: "#000",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            component="iframe"
            src={BOOKING.landingIframeSrc}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("booking", "true");
            router.push(`?${params.toString()}`);
          }}
          sx={{
            height: { xs: 56, sm: 60 },
            maxHeight: { xs: 56, sm: 60 },
            borderRadius: 999,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            fontWeight: 700,
            boxShadow: theme.shadows[4],
            textTransform: "none",
          }}
        >
          {translate(BOOKING.bookButton)}
        </Button>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontSize: { xs: "1rem", sm: "1.1rem" },
            fontWeight: 500,
          }}
        >
          {translate(BOOKING.makeDream)}
        </Typography>
      </Box>
    </>
  );
}

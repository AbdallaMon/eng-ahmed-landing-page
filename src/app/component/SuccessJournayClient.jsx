"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import { LinkButton } from "./buttons/LinkButton";
import { colors } from "../data/constants";

export function SuccessJourneyClient({
  children,
  buttons,
  imageBannerSrc,
  videoUrl = "https://www.youtube.com/embed/Ovh-UNeKgVQ",
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Image column */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          component="img"
          sx={{
            maxWidth: "100%",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 1,
            cursor: "pointer",
          }}
          src={imageBannerSrc}
          alt=""
          onClick={handleOpen}
        />
      </Grid>

      {/* Text + buttons column */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ py: { xs: 3, md: 6 } }}>
        {children}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: { xs: 4, md: 0 },
          }}
        >
          {/* Booking button (keeps its original behavior) */}
          <LinkButton
            {...buttons.booking}
            borderColor={colors.primary}
            bgColor={colors.primary}
            textColor={colors.white}
            sx={{
              mt: 1.5,
              fontSize: {
                xs: "0.8rem",
                md: "1rem",
              },
            }}
            icon={"./arrow-left.png"}
          />

          {/* Watch video button -> opens dialog */}
          <LinkButton
            {...buttons.watchVideo}
            borderColor={colors.teritary}
            bgColor={colors.teritary}
            textColor={colors.primary}
            sx={{
              mt: 1.5,
              fontSize: {
                xs: "0.8rem",
                md: "1.1rem",
              },
            }}
            onClick={handleOpen} // override / add click handler
          />
        </Box>
      </Grid>

      {/* Video dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, py: 1.5 }}>
            مشاهدة الفيديو
          </Typography>
          <IconButton onClick={handleClose} aria-label="close video">
            <IoClose />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            pb: 0,
            px: 0,
            p: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%", // 16:9 ratio
            }}
          >
            {open && (
              <Box
                component="iframe"
                src={videoUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: { xs: `calc(100vh - 64px)`, md: "100%" },
                  border: 0,
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

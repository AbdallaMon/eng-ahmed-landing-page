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

export function PreviewYoutubeVideo({
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

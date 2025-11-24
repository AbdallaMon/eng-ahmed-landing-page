// components/Project/ProjectImagesLightboxClient.jsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Dialog, IconButton } from "@mui/material";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";
import LanguageCacheProvider from "../../providers/LanguageCacheProvider";

export default function ProjectImagesLightboxClient({
  projectId,
  images,
  project,
  lng,
}) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef(null);

  const total = images.length;
  const currentImage = images[currentIndex];

  const handleOpenAt = useCallback((index) => {
    setCurrentIndex(index);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const showPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const showNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Attach click listeners to server-rendered buttons
  useEffect(() => {
    const selector = `[data-project-lightbox-trigger="${projectId}"]`;
    const elements = Array.from(document.querySelectorAll(selector));

    const handlers = elements.map((el) => {
      const index = Number(el.getAttribute("data-lightbox-index") || "0");
      const handler = () => handleOpenAt(index);
      el.addEventListener("click", handler);
      return { el, handler };
    });

    return () => {
      handlers.forEach(({ el, handler }) =>
        el.removeEventListener("click", handler)
      );
    };
  }, [projectId, handleOpenAt]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!open) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        lng === "ar" ? showNext() : showPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        lng === "ar" ? showPrev() : showNext();
      } else if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    },
    [open, showPrev, showNext, handleClose, lng]
  );

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartXRef.current == null) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const threshold = 50;

    if (deltaX > threshold) {
      // swipe right
      showPrev();
    } else if (deltaX < -threshold) {
      // swipe left
      showNext();
    }

    touchStartXRef.current = null;
  };

  const topLabel =
    lng === "ar"
      ? `${project.name} • ${currentIndex + 1} من ${total}`
      : `${project.name} • ${currentIndex + 1} / ${total}`;

  return (
    <LanguageCacheProvider rtl={lng === "ar"}>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: "rgba(0,0,0,0.96)",
          },
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              color: "white",
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            {topLabel}
          </Box>
          <IconButton
            onClick={handleClose}
            aria-label={lng === "ar" ? "إغلاق" : "Close"}
            sx={{ color: "white" }}
          >
            <MdClose />
          </IconButton>
        </Box>

        {/* Image area */}
        <Box
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          sx={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            outline: "none",
          }}
        >
          {/* Prev arrow */}
          {total > 1 && (
            <IconButton
              onClick={lng === "ar" ? showNext : showPrev}
              aria-label={lng === "ar" ? "الصورة السابقة" : "Previous image"}
              sx={{
                position: "absolute",
                left: { xs: 8, md: 24 },
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(0,0,0,0.4)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              {lng === "ar" ? <MdChevronRight /> : <MdChevronLeft />}
            </IconButton>
          )}

          {/* Image */}
          {currentImage && (
            <Box
              component="img"
              src={currentImage.src}
              alt={currentImage.alt}
              loading="lazy"
              sx={{
                maxWidth: "100vw",
                maxHeight: "100vh",
                objectFit: "contain",
              }}
            />
          )}

          {/* Next arrow */}
          {total > 1 && (
            <IconButton
              onClick={lng === "ar" ? showPrev : showNext}
              aria-label={lng === "ar" ? "الصورة التالية" : "Next image"}
              sx={{
                position: "absolute",
                right: { xs: 8, md: 24 },
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(0,0,0,0.4)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              {lng === "ar" ? <MdChevronLeft /> : <MdChevronRight />}
            </IconButton>
          )}
        </Box>
      </Dialog>
    </LanguageCacheProvider>
  );
}

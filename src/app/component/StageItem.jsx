// components/StageItem.jsx
"use client";

import { useState } from "react";
import { Box, Button, Collapse, Paper, Typography } from "@mui/material";
import { colors } from "../data/constants";
import { useSearchParams } from "next/navigation";

export default function StageItem({ title, subTitle, description }) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const lng = searchParams.get("lng") || "ar";

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1,
        mb: 3,
        width: { xs: "100%", md: "600px" },
        maxWidth: "600px",
        mx: "auto",
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1rem",
                md: "1.25rem",
              },
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              fontSize: { xs: "0.9rem", md: "1.05rem" },
            }}
          >
            {subTitle}
          </Typography>
        </Box>

        {/* Left side: button */}
        <Button
          onClick={() => setOpen((p) => !p)}
          variant={"contained"}
          sx={{
            minWidth: 140,
            backgroundColor: open ? colors.highlight : colors.primary,
            color: open ? colors.primary : colors.white,
            fontSize: { xs: "0.75rem", md: "1rem" },
            px: { xs: 1, md: 2 },
          }}
        >
          {lng === "ar"
            ? open
              ? "إخفاء التفاصيل"
              : "قراءة المزيد"
            : open
            ? "Hide Details"
            : "Read More"}
        </Button>
      </Box>

      {/* Description (below, slightly different background) */}
      <Collapse in={open} timeout={300} unmountOnExit>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.action.hover
                : theme.palette.background.default,
            color: "text.primary",
            whiteSpace: "pre-wrap",
            // textAlign: "right",
            fontSize: { xs: "0.9rem", md: "1.1rem" },
          }}
        >
          {description}
        </Box>
      </Collapse>
    </Paper>
  );
}

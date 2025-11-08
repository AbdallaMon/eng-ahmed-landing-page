// components/StageItem.jsx
"use client";

import { useState } from "react";
import { Box, Button, Collapse, Paper, Typography } from "@mui/material";
import { colors } from "../data/constants";

export default function StageItem({ title, subTitle, description }) {
  const [open, setOpen] = useState(false);

  return (
    <Paper
      sx={{ p: 2, borderRadius: 1, mb: 3, width: "100%", maxWidth: "600px" }}
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
          <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "right" }}>
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.primary", textAlign: "right" }}
          >
            {subTitle}
          </Typography>
        </Box>

        {/* Left side: button */}
        <Button
          onClick={() => setOpen((p) => !p)}
          variant={"contained"}
          //   color={!open ? "primary" : "inherit"}
          sx={{
            minWidth: 140,
            backgroundColor: open ? colors.highlight : colors.primary,
            color: open ? colors.primary : colors.white,
          }}
        >
          قراءة المزيد
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
            textAlign: "right",
          }}
        >
          {description}
        </Box>
      </Collapse>
    </Paper>
  );
}

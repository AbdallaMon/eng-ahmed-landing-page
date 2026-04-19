"use client";

import React from "react";
import { Fab, Tooltip } from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";
import { handleOpenWhatsApp } from "@/app/utility/redirectToWhatsapp";

export default function FloatingWhatsAppButton() {
  return (
    <Tooltip title="Chat on WhatsApp" placement="left">
      <Fab
        color="success"
        aria-label="whatsapp"
        onClick={handleOpenWhatsApp}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1400,
          "&:hover": {
            transform: "scale(1.08)",
            boxShadow: "0 10px 28px rgba(37, 211, 102, 0.45)",
          },
        }}
      >
        <FaWhatsapp size={30} />
      </Fab>
    </Tooltip>
  );
}

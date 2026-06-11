"use client";
import { Typography } from "@mui/material";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

/**
 * Small notice shown once the email has been captured.
 *
 * @param {{ visible?: boolean }} props
 */
export function EmailCapturedNote({ visible }) {
  const { translate } = useLanguage();

  return (
    <Typography
      variant="body2"
      sx={{
        mt: 2,
        color: "primary.main",
        fontWeight: 500,
        position: "relative",
        zIndex: 10,
        textAlign: "center",
        mb: -8,
        opacity: visible ? 1 : 0,
      }}
    >
      {translate("register.emailAnimatedNotice")}
    </Typography>
  );
}

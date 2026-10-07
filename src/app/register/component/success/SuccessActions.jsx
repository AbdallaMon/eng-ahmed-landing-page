"use client";

import { Box, Button, Stack } from "@mui/material";
import { FaHome } from "react-icons/fa";
import { MdAppRegistration } from "react-icons/md";
import { t } from "@/app/register/data/dictionary";
import colors from "@/app/register/theme/colors";

/** Shared "back home" + "new registration" CTAs, shown once loading resolves. */
export default function SuccessActions({ lng, homeHref }) {
  return (
    <Stack
      data-reveal
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ mt: 4, opacity: 0 }}
    >
      <Button
        variant="contained"
        component="a"
        href={homeHref}
        size="large"
        startIcon={<FaHome />}
        sx={{
          bgcolor: colors.primary,
          color: "#fff",
          borderRadius: 2,
          px: 3,
          "&:hover": { bgcolor: colors.primaryDark },
        }}
      >
        {t("success.backHome", lng)}
      </Button>
      <Button
        variant="outlined"
        component="a"
        href="/register"
        size="large"
        startIcon={<MdAppRegistration />}
        sx={{
          color: colors.primaryDark,
          borderColor: colors.primary,
          borderRadius: 2,
          px: 3,
          "&:hover": {
            borderColor: colors.primaryDark,
            backgroundColor: `${colors.primary}14`,
          },
        }}
      >
        {t("success.goRegister", lng)}
      </Button>
    </Stack>
  );
}

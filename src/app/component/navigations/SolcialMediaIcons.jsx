import { socialMediaIconsLinks } from "@/app/data/constants";
import { getTranslation } from "@/app/i18n";
import { Box, Typography } from "@mui/material";

export default async function SocialMediaIcons({ sx, lng, includeText }) {
  const { t } = await getTranslation(lng);
  const followMeText = t("followMe");
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        mt: 1,
        mb: 5,
        ...sx,
      }}
    >
      {includeText && (
        <Typography
          variant="body1"
          sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
        >
          {followMeText}
        </Typography>
      )}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 2.5 } }}
      >
        {socialMediaIconsLinks.map((icon, index) => (
          <Box
            key={index}
            component="a"
            href={icon.href}
            sx={{ display: "block" }}
          >
            <Box
              component="img"
              src={icon.iconSrc}
              sx={{ width: { xs: "35px", md: "40px" } }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

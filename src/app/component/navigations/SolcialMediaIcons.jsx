import { socialMediaIconsLinks } from "@/app/data/constants";
import { getTranslation } from "@/app/i18n";
import { Box, Typography } from "@mui/material";

export default async function SocialMediaIcons({ lng, includeText }) {
  const { t } = await getTranslation(lng);
  const followMeText = t("followMe");
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 1, mb: 5 }}>
      {includeText && (
        <Typography
          variant="body1"
          sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
        >
          {followMeText}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
              sx={{ width: { xs: "30px", md: "35px" } }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

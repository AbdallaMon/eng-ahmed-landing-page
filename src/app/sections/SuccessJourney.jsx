import { Box, Container, Grid, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import { colors, imageBannerSrc } from "../data/constants";
import { LinkButton } from "../component/buttons/LinkButton";

export async function SuccessJourney({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("successJourney", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <Box sx={{ mt: { xs: 6, md: 12 }, mb: { xs: 0, md: 8 } }}>
      <Container maxWidth="xl">
        <Box>
          <Grid container spacing={{ xs: 2, md: 8 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="img"
                sx={{
                  maxWidth: "100%",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 1,
                }}
                src={imageBannerSrc}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ py: { xs: 3, md: 6 } }}>
              <Box>
                <Box sx={{ maxWidth: "600px" }}>
                  <Typography
                    variant="h3"
                    fontSize={{ xs: "1.1rem", md: "2rem" }}
                    sx={{
                      maxWidth: {
                        xs: "300px",
                        md: "500px",
                      },
                      lineHeight: {
                        xs: "23px",
                        md: "42px",
                      },
                    }}
                  >
                    {data.title.primary}
                    <Box component={"span"} sx={{ color: colors.secondary }}>
                      {data.title.secondary}
                    </Box>
                  </Typography>
                  <Typography
                    variant="body1"
                    mt={2}
                    fontSize={{ xs: "0.9rem", md: "1.1rem" }}
                  >
                    {data.description.primary}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontSize={{ xs: "0.9rem", md: "1.1rem" }}
                  >
                    {data.description.secondary}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: { xs: 1.5, md: 2 },
                  alignItems: "center",
                  mt: { xs: 3, md: 5 },
                  mb: {
                    xs: 4,
                    md: 6,
                  },
                }}
              >
                {data.badges.map((badge, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: colors.lightBrown,
                      padding: { xs: "6px 12px", md: "8px 15px" },
                      borderRadius: "6px",
                      color: colors.primary,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      fontSize: { xs: "0.7rem", md: "1rem" },
                    }}
                  >
                    <Typography variant="caption">{badge}</Typography>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: { xs: 4, md: 0 },
                }}
              >
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
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

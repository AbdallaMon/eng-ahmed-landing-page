import { Box, Container, Grid, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import { colors, imageBannerSrc } from "../data/constants";
import { LinkButton } from "../component/buttons/LinkButton";
import { SuccessJourneyClient } from "../component/SuccessJournayClient";

export async function SuccessJourney({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("successJourney", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <Box sx={{ mt: { xs: 6, md: 12 }, mb: { xs: 0, md: 8 } }}>
      <Container maxWidth="xl">
        <Box>
          <Grid container spacing={{ xs: 2, md: 8 }}>
            <SuccessJourneyClient
              lng={lng}
              data={data}
              buttons={buttons}
              imageBannerSrc={imageBannerSrc}
            >
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
            </SuccessJourneyClient>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

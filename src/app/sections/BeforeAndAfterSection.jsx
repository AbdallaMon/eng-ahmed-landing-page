// BeforeAndAfterSection.jsx
import { Container, Grid } from "@mui/system";
import { getTranslation } from "../i18n";
import { Box, Typography } from "@mui/material";
import { colors } from "../data/constants";
import BeforeAndAfterSlider from "../component/BeforeAndAfterSlider";
import { LinkButton } from "../component/buttons/LinkButton";

export async function BeforeAndAfterSection({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("beforeAndAfter", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });

  return (
    <Box sx={{ mt: { xs: 4, md: 4 }, mb: { xs: 6, md: 12 } }}>
      <Container maxWidth="xl">
        <Box>
          <Grid container spacing={{ xs: 3, md: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  px: { md: 2 },
                  mt: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    fontSize: {
                      xs: "1.4rem",
                      md: "2.8rem",
                    },
                  }}
                >
                  {data.title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: { xs: 0, md: 4 },
                    fontSize: { xs: "0.85rem", md: "1.1rem" },
                    maxWidth: "500px",
                    color: colors.secondary,
                  }}
                >
                  {data.description}
                </Typography>

                <Box sx={{ display: "flex", mt: 4 }}>
                  <LinkButton
                    {...buttons.booking}
                    bgColor={colors.primary}
                    borderColor={colors.primary}
                    textColor={colors.white}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }} container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <BeforeAndAfterSlider
                  beforeSrc={data.images.before[0]}
                  afterSrc={data.images.after[0]}
                  lng={lng}
                  initialPct={35}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <BeforeAndAfterSlider
                  beforeSrc={data.images.before[1]}
                  afterSrc={data.images.after[1]}
                  lng={lng}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>{" "}
    </Box>
  );
}

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
          <Grid container spacing={{ xs: 3, md: 6, lg: 10, xl: 12 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <BeforeAndAfterSlider
                beforeSrc={data.images.before}
                afterSrc={data.images.after}
                lng={lng}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
                    color: "text.secondary",
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
              </Box>{" "}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

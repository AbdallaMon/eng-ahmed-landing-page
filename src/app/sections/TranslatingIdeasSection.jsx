import { Box, Container, fontSize, Grid, minWidth } from "@mui/system";
import { getTranslation } from "../i18n";
import { pcTranslatingIdeaImage } from "../data/translating-ideas";
import { Typography } from "@mui/material";
import { LinkButton } from "../component/buttons/LinkButton";
import { colors } from "../data/constants";

export async function TranslatingIdeasSection({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("translatingIdeasSection", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Container
          maxWidth="xl"
          sx={{
            backgroundColor: colors.brown,
            px: "0 !important",
            borderRadius: 2,
          }}
        >
          <Box>
            <Grid container spacing={2}>
              <Grid size={6} sx={{ overflow: "hidden" }}>
                <Box
                  component="img"
                  sx={{
                    maxWidth: "100%",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  src={pcTranslatingIdeaImage}
                />
              </Grid>
              <Grid size={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    pt: { xs: 6, md: 2 },
                    pb: { xs: 3, md: 2 },
                    pl: { xs: 4, md: 6, xl: 8 },
                    gap: { xs: 2, md: 3 },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: {
                        xs: "0.8rem",
                        md: "1.2rem",
                      },
                      fontWeight: 400,
                      color: colors.white,
                    }}
                  >
                    {data.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                      fontSize: {
                        xs: "0.9rem",
                        md: "2.8rem",
                      },
                      color: colors.white,
                    }}
                  >
                    {data.description}
                  </Typography>
                  <Box sx={{ display: "flex" }}>
                    <LinkButton
                      {...buttons.booking}
                      borderColor={colors.white}
                      bgColor={colors.white}
                      textColor={colors.primary}
                      sx={{
                        mt: 1.5,
                        fontSize: {
                          xs: "0.7rem",
                          md: "1rem",
                        },
                        px: { xs: "12px !important", md: "20px !important" },
                        py: { xs: "10px !important", md: "14px !important" },
                      }}
                      icon={"./arrow-left-colored.png"}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
}

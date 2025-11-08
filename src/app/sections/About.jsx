import { Box, Container, Grid, Typography } from "@mui/material";
import AboutImageContainer from "../component/image-containers/AboutImage";
import { getTranslation } from "../i18n";
import { LinkButton } from "../component/buttons/LinkButton";
import { colors } from "../data/constants";
import SocialMediaIcons from "../component/navigations/SolcialMediaIcons";

export default async function About({ lng }) {
  const { t } = await getTranslation(lng);

  const aboutData = t("about", { returnObjects: true });
  const buttonData = t("buttons", { returnObjects: true });
  return (
    <Box>
      <Container maxWidth="xl">
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <AboutImageContainer images={aboutData.aboutImages} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AboutMe
                aboutData={aboutData}
                buttonData={buttonData}
                lng={lng}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

function AboutMe({ lng, aboutData, buttonData }) {
  return (
    <Box
      sx={{
        my: "atuo",
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          //   alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              lineHeight: {
                xs: "2.5rem",
                md: "2.8rem",
              },
              letterSpacing: {
                xs: "-0.51px",
                md: "-0.84px",
              },
              fontSize: {
                xs: "1.6rem",
                md: "2.2rem",
              },
              mb: {
                xs: 3,
                md: 4,
              },
            }}
          >
            {aboutData.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
            }}
          >
            {aboutData.description}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2, mt: { xs: 4, md: 6 } }}>
          <LinkButton
            {...buttonData.booking}
            bgColor={colors.primary}
            textColor={colors.white}
            borderColor={colors.primary}
          />
          <LinkButton
            {...buttonData.viewPortfolio}
            bgColor={colors.teritary}
            textColor={colors.primary}
            borderColor={colors.borderColor}
          />
        </Box>
        <SocialMediaIcons lng={lng} includeText={true} />
      </Box>
    </Box>
  );
}

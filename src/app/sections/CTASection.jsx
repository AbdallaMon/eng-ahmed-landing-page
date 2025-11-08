import { Box, Container, Grid } from "@mui/material";
import { getTranslation } from "../i18n";
import CTACard from "../component/cards/CTACard";

export default async function CTASection({ lng }) {
  const { t } = await getTranslation(lng);

  const ctaData = t("vission", { returnObjects: true }).cards;

  return (
    <Box
      sx={{
        py: {
          xs: 5,
          md: 7,
        },
        my: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          maxWidth="1000px"
          mx="auto"
          sx={{
            my: { xs: 2, md: 3 },
          }}
        >
          <Grid container spacing={2}>
            {ctaData.map((cardData, i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
                <CTACard data={cardData} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

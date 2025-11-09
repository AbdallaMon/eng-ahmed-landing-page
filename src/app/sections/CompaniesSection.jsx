import { Box, Container, Grid, Typography } from "@mui/material";
import { LinkButton } from "../component/buttons/LinkButton";
import { colors } from "../data/constants";
import { getTranslation } from "../i18n";

export default async function CompaniesSection({ lng }) {
  const { t } = await getTranslation(lng);

  const companiesData = t("companies", { returnObjects: true });
  return (
    <Box sx={{ pb: 5 }}>
      <Container maxWidth="xl">
        <Box sx={{ px: { lg: 5, xl: 10 } }}>
          <Box sx={{ mt: { xs: 8, md: 10 }, mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                maxWidth: { xs: "250px", md: "400px" },
                mx: "auto",
                fontSize: {
                  xs: "1.8rem",
                  md: "2.8rem",
                },
              }}
            >
              {companiesData.title}
            </Typography>
          </Box>
          <Box>
            <Grid container spacing={2}>
              {companiesData.cards.map((card, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Companycard cardData={card} key={index} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export function Companycard({ cardData }) {
  console.log(cardData, "cardData");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: { xs: "24px 16px", md: "32px 20px" },
        backgroundColor: "primary.main",
        borderRadius: "8px",
        textAlign: "center",
        height: "100%",
      }}
    >
      <Box
        component="img"
        src={cardData.image}
        sx={{
          width: { xs: "120px", md: "180px" },
          height: { md: "80px" },
          mb: 2,
        }}
      />
      <Typography
        variant="body1"
        sx={{ mb: 3, fontWeight: 400, color: colors.white }}
      >
        {cardData.text}
      </Typography>
      <LinkButton
        href={cardData.href}
        bgColor={colors.highlight}
        textColor={colors.primary}
        borderColor={colors.primary}
        name={cardData.buttonText}
        sx={{
          textAlign: "center",
          paddingX: 6,
        }}
      />
    </Box>
  );
}

import { Box, Container, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import { FaqComponent } from "../component/FaqComponent";

export async function FAQ({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("faqs", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });

  return (
    <Box>
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 6, md: 12 },
          pb: { xs: 10, md: 18 },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",

              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              mt={2}
              mb={1.2}
              sx={{
                fontSize: { xs: "1.5rem", md: "2.5rem" },
              }}
            >
              {data.title}
            </Typography>
            <Typography
              variant="body1"
              component="h5"
              sx={{
                fontSize: { xs: "1rem", md: "1.2rem" },
              }}
            >
              {data.subTitle}
            </Typography>
          </Box>
          <Box mt={6}>
            <FaqComponent faqData={data.faqs} lng={lng} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

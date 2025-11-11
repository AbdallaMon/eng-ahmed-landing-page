import { Box, Container, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import { TestmonailsSlider } from "../component/TestmonailsSlider";
import { LinkButton } from "../component/buttons/LinkButton";
import { colors } from "../data/constants";

export async function Testmonails({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("testmonails", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <>
      <Box sx={{ overflow: "hidden", height: "auto" }}>
        <Container
          maxWidth="xl"
          sx={{
            pt: { xs: 6, md: 12 },
            backgroundColor: colors.backgroundLight,
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
                variant="body1"
                component="h5"
                sx={{
                  fontSize: { xs: "1rem", md: "1.2rem" },
                }}
              >
                {data.subTitle}
              </Typography>
              <Typography
                variant="h3"
                mt={2}
                mb={4}
                sx={{
                  fontSize: { xs: "1.5rem", md: "2.5rem" },
                }}
              >
                {data.title}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <LinkButton
                  {...buttons.booking}
                  bgColor={colors.primary}
                  borderColor={colors.primary}
                  textColor={colors.white}
                />
              </Box>
            </Box>
          </Box>
        </Container>
        <Container
          maxWidth="xl"
          sx={{
            pb: { xs: 2, md: 6 },
            backgroundColor: colors.backgroundLight,
            position: "relative",
          }}
        >
          <Box
            component="img"
            src="./testmonials-blur.png"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "auto",
              objectFit: "contain",
              scale: 1.2,
              scaleY: 1,
              display: { xs: "none", md: "block" },
            }}
          />

          <Box
            component="img"
            src="./testmonials-blur-mobile.png"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "auto",
              objectFit: "contain",
              scale: 2,
              display: { xs: "block", md: "none" },
            }}
          />
          <TestmonailsSlider data={data} rtl={lng === "ar"}>
            {/* {data.reviews.map((review, index) => (
                <TestMonailCard key={index} data={review} />
              ))} */}
          </TestmonailsSlider>
        </Container>
      </Box>
    </>
  );
}

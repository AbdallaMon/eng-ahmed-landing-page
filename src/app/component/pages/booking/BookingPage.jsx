import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import { BookingForm } from "../../form/BookingForm";
import { imageBannerMobileSrc, imageBannerSrc } from "@/app/data/constants";
import { PreviewYoutubeVideo } from "../../PreviewYoutubeVideo";

export function BookingPage({ bookingData, lng }) {
  console.log(bookingData, "bookingData in BookingPage");
  return (
    <Container maxWidth="xl">
      <Grid
        container
        spacing={3}
        sx={{
          direction: "ltr",
        }}
      >
        <Grid
          size={{ xs: 12, md: 7 }}
          sx={{
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              height: "100%",
            }}
          >
            <PreviewYoutubeVideo imageBannerSrc={imageBannerMobileSrc} />
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: "100%",
            }}
          >
            <PreviewYoutubeVideo imageBannerSrc={imageBannerSrc} />
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            display: "flex",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              py: { xs: 4, md: 4 },
              px: { xs: 2, md: 8 },
              borderRadius: 2,
              backgroundColor: "#fff",
              width: "100%",
              ml: { md: "-100px" },
              mt: { xs: "-140px", md: 0 },
              height: { md: "95%" },
              my: { md: "auto !important" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: { xs: 4, md: 8 },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: {
                    xs: "1.5rem",
                    md: "2.5rem",
                  },
                  lineHeight: 1.2,
                  textAlign: "center",
                  maxWidth: lng === "ar" ? "300px" : "400px",
                }}
              >
                {bookingData.title}
              </Typography>
              <Typography variant="body1" mt={2}>
                {bookingData.subTitle}
              </Typography>
            </Box>
            <BookingForm bookingData={bookingData} lng={lng} />
            <Box
              sx={{
                mt: 4,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.8rem", md: "1rem" },
                }}
              >
                {bookingData.callToActionText.light}
              </Typography>
              <Typography
                fontWeight="bold"
                sx={{
                  fontSize: { xs: "0.8rem", md: "1rem" },
                }}
              >
                {bookingData.callToActionText.highlight}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

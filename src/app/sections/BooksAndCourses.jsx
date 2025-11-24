// BeforeAndAfterSection.jsx
import { Container, Grid } from "@mui/system";
import { getTranslation } from "../i18n";
import { Box, Typography } from "@mui/material";
import { colors } from "../data/constants";
import { BooksAndCoursesCard } from "../component/cards/BooksAndCoursesCard";

export async function BooksAndCourses({ lng }) {
  const { t } = await getTranslation(lng);

  const data = t("bookAndCourses", { returnObjects: true });

  const bookAndCoursesData = data.data;

  return (
    <Box sx={{ mt: { xs: 4, md: 12 }, mb: { xs: 6, md: 12 } }}>
      <>
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 2 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 2,
              fontSize: {
                xs: "1.8rem",
                md: "3rem",
              },
            }}
          >
            {data.title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: { xs: 4, md: 6 },
              maxWidth: "500px",
              mx: "auto",
              color: colors.secondary,
            }}
          >
            {data.subTitle}
          </Typography>
          <Box>
            <Grid container spacing={2}>
              {bookAndCoursesData.map((item, index) => (
                <Grid size={{ xs: 6, md: 6 }} key={index}>
                  <BooksAndCoursesCard lng={lng} cardData={item} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </>
    </Box>
  );
}

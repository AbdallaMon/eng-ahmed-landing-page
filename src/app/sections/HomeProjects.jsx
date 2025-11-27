import { Box, Container, Grid, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import ProjectCard from "../component/cards/ProjectCard";
import { LinkButton } from "../component/buttons/LinkButton";
import { colors } from "../data/constants";

export async function HomeProjects({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("projects", { returnObjects: true });
  const homeProjects = data.filter((project) => project.isHome).reverse();
  const homeProjectsSection = t("homeProjectsSection", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <Box sx={{ mt: { xs: 0, md: 0 }, mb: { xs: 8, md: 12 } }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          component="h1"
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
          {homeProjectsSection.title}
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
          {homeProjectsSection.subTitle}
        </Typography>
        <Grid container spacing={{ xs: 4, md: 3 }}>
          {homeProjects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, md: 4 }}>
              <ProjectCard
                id={project.id}
                description={project.homeDescription}
                imageSrc={project.imageSrc}
                buttonText={lng === "ar" ? "شاهد المزيد" : "View more"}
                category={project.category}
                imgAlt={project.name}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <LinkButton
            {...buttons.viewAllProjects}
            bgColor={colors.primary}
            borderColor={colors.primary}
            textColor={colors.white}
          />
        </Box>
      </Container>
    </Box>
  );
}

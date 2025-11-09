import { Box, Container, Grid } from "@mui/material";
import { getTranslation } from "../i18n";
import HomeProjectCard from "../component/cards/HomeProjectCard";

export async function HomeProjects({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("projects", { returnObjects: true });

  const homeProjects = data.filter((project) => project.isHome);
  return (
    <Container maxWidth="xl">
      <Grid container spacing={{ xs: 4, md: 3 }}>
        {homeProjects.map((project) => (
          <Grid key={project.id} size={{ xs: 12, md: 4 }}>
            <HomeProjectCard
              id={project.id}
              description={project.homeDescription}
              imageSrc={project.imageSrc}
              buttonText={lng === "ar" ? "شاهد المزيد" : "View more"}
              category={project.category}
              imgAlt={project.title}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

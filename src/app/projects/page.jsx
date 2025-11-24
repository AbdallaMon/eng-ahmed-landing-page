import { Box, Chip, Container, Grid } from "@mui/material";
import { getTranslation } from "../i18n";
import { cookies } from "next/headers";
export async function generateMetadata({ params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return metaData.projectsPage;
}
export default async function page({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
  return (
    <Box>
      <Container maxWidth="xl">
        <Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, md: 3 }} container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[0]} />
              </Grid>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[1]} />
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} container spacing={{ xs: 2, md: 3 }}>
              <ProjectCard data={projects[2]} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[3]} />
              </Grid>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[4]} />
              </Grid>
            </Grid>

            <Grid size={{ xs: 12 }} container spacing={{ xs: 2, md: 3 }}>
              <ProjectCard data={projects[5]} />
            </Grid>

            <Grid
              size={{ xs: 12, md: 12 }}
              container
              spacing={{ xs: 1.5, md: 3 }}
            >
              <Grid size={{ xs: 4, md: 4 }} spacing={{ xs: 1.5, md: 3 }}>
                <ProjectCard data={projects[6]} />
              </Grid>
              <Grid size={{ xs: 4, md: 4 }} spacing={{ xs: 1.5, md: 3 }}>
                <ProjectCard data={projects[7]} />
              </Grid>
              <Grid size={{ xs: 4, md: 4 }} spacing={{ xs: 1.5, md: 3 }}>
                <ProjectCard data={projects[8]} />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

function ProjectCard({ data }) {
  return (
    <Box
      component="a"
      href={data.href}
      target="_blank"
      rel="noreferrer"
      className="project-card"
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "block",
        textDecoration: "none",
      }}
    >
      {/* Category chip */}
      {data.category && (
        <Box className="project-card__category">
          <Chip
            label={data.category}
            size="small"
            className="project-card__chip"
          />
        </Box>
      )}

      {/* Project image */}
      <Box
        component="img"
        className="project-card__image"
        sx={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
        }}
        src={`./projects/project-${data.id}.png`}
        alt={data.name}
      />
    </Box>
  );
}

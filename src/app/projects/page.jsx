import { Box, Container, Grid } from "@mui/material";
import { getTranslation } from "../i18n";

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
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        component={"img"}
        sx={{
          width: "100%",
          height: "100%",
        }}
        src={`./projects/project-${data.id}.png`}
        alt={data.name}
      />
    </Box>
  );
}

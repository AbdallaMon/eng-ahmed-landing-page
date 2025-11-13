import { colors } from "@/app/data/constants";
import { getTranslation } from "@/app/i18n";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default async function page({ params, searchParams }) {
  const awaitedSearchParams = await searchParams;
  const awaitedParams = await params;
  const lng = awaitedSearchParams.lng;
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
  const projectId = awaitedParams.id;
  const projectData = projects.find((project) => project.id == projectId);
  const breadcrumbs = [
    <Box component={"a"} underline="hover" key="1" color="inherit" href="/">
      {lng === "ar" ? "الصفحة الرئيسية" : "Home"}
    </Box>,
    <Box underline="hover" key="2" color="inherit" href="/projects">
      {lng === "ar" ? "المشاريع" : "Projects"}
    </Box>,
    <Typography key="3" sx={{ color: "text.primary" }}>
      {projectData.name}
    </Typography>,
  ];
  return (
    <Box>
      <Container maxWidth="xl">
        <Breadcrumbs
          separator={">"}
          aria-label="breadcrumb"
          sx={{ my: 3, mt: 4 }}
        >
          {breadcrumbs}
        </Breadcrumbs>
        <Box>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
            {lng === "ar" ? "تفاصيل المشروع" : "Project Details"}
          </Typography>
          <ProjectCard data={projectData} lng={lng} />
        </Box>
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 6 }}>
          <Grid container size={{ xs: 12, md: 4 }} spacing={{ xs: 2, md: 3 }}>
            <Grid size={12}>
              <Box
                component="img"
                src={`/projects/project-${projectId}/1.png`}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Grid>
            <Grid size={12}>
              <Box
                component="img"
                src={`/projects/project-${projectId}/2.png`}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Grid>
          </Grid>
          <Grid container size={{ xs: 12, md: 4 }} spacing={{ xs: 2, md: 3 }}>
            <Grid size={12}>
              <Box
                component="img"
                src={`/projects/project-${projectId}/3.png`}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Grid>
            <Grid size={12}>
              <Box
                component="img"
                src={`/projects/project-${projectId}/4.png`}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Grid>
          </Grid>
          <Grid container size={{ xs: 12, md: 4 }} spacing={{ xs: 2, md: 3 }}>
            <Grid size={12}>
              <Box
                component="img"
                src={`/projects/project-${projectId}/5.png`}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Grid>
            <Grid size={12}>
              <Box
                component="img"
                src={`/projects/project-${projectId}/6.png`}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
function ProjectCard({ data, lng }) {
  return (
    <Card
      sx={{
        py: 3,
        px: 2,
        backgroundColor: "#f9f6f4",
        mt: 3,
        width: { xs: "100%", md: "fit-content" },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <ProjectDetailsItem
            label={lng === "ar" ? "عنوان المشروع" : "Project Title"}
            value={data.name}
          />
          <ProjectDetailsItem
            label={lng === "ar" ? "وصف المشروع" : "Project Description"}
            value={data.description}
          />
          <ProjectDetailsItem
            label={lng === "ar" ? "الموقع او المدينة" : "Location or City"}
            value={data.location}
          />
          <ProjectDetailsItem
            label={lng === "ar" ? "تاريخ التنفيذ" : "Execution Date"}
            value={data.year}
          />
          <ProjectDetailsItem
            label={lng === "ar" ? "حالة المشروع" : "Project Status"}
            value={data.status}
          />
          <ProjectDetailsItem
            label={lng === "ar" ? "فئة المشروع" : "Project Category"}
            value={data.category}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

function ProjectDetailsItem({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Typography
        component="span"
        variant="subtitle2"
        sx={{
          color: colors.primary,
          display: "block",
        }}
      >
        {label}:
      </Typography>
      <Typography
        variant="body1"
        sx={{
          flex: 1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

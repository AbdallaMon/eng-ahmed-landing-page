import { Box, Typography, Grid } from "@mui/material";
import ProjectCard from "../cards/ProjectCard";

export default function ProjectRelatedSection({
  relatedProjects = [],
  lng = "ar",
}) {
  if (!relatedProjects.length) return null;

  const title = lng === "ar" ? "مشاريع مرتبطة" : "Related projects";
  const subTitle =
    lng === "ar"
      ? "اكتشف مشاريع أخرى قريبة من ذوق هذا المشروع"
      : "Discover other projects similar to this one";

  return (
    <Box
      component="section"
      aria-label={title}
      sx={{
        mt: 8,
        width: "100%",
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {subTitle}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {relatedProjects.map((project) => (
          <Grid key={project.id} size={{ xs: 12, md: 4 }}>
            <ProjectCard
              id={project.id}
              description={project.description}
              imageSrc={project.cover}
              buttonText={lng === "ar" ? "شاهد المزيد" : "View more"}
              category={project.category}
              imgAlt={project.name}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

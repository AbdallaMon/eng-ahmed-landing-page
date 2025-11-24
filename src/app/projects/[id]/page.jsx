import ProjectImagesGrid from "@/app/component/projects/ProjectImagesGrid";
import ProjectRelatedSection from "@/app/component/projects/ProjectRelatedSection";
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
import { cookies } from "next/headers";

export async function generateMetadata({ params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });

  const awaitedParams = await params;
  const projectId = awaitedParams.id;
  const projectData = projects.find((project) => project.id == projectId);

  if (!projectData) {
    return {
      title: lng === "ar" ? "المشروع غير موجود" : "Project Not Found",
    };
  }

  const engAhmedText =
    lng === "ar"
      ? "- مشاريع المهندس احمد المبيض"
      : "- Eng Ahmed Almobayed Projects";

  const description = `${projectData.description} ${engAhmedText}`;

  // Base URL for correct absolute URLs in meta
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";

  // Prefer cover, fallback to first image if exists
  const ogImage =
    projectData.cover || projectData.images?.[0]
      ? {
          url: `${baseUrl}${(
            projectData.cover || projectData.images?.[0]
          ).replace("./", "/")}`,
          width: 1200,
          height: 630,
          alt: projectData.name,
        }
      : null;

  const keywords =
    lng === "ar"
      ? [
          "مشاريع",
          "تصميم داخلي",
          "هندسة معمارية",
          "ديكور",
          "المهندس احمد",
          "مشاريع احمد المبيض",
          "المهندس احمد المبيض",
          projectData.name,
          projectData.location,
          projectData.category,
          String(projectData.year),
        ]
      : [
          "projects",
          "interior design",
          "architecture",
          "decor",
          "eng ahmed",
          "ahmed almobayed",
          "eng ahmed almobayed",
          projectData.name,
          projectData.location,
          projectData.category,
          String(projectData.year),
        ];

  return {
    title: projectData.name,
    description,
    keywords,
    openGraph: {
      title: projectData.name,
      description,
      type: "article",
      url: `${baseUrl}/projects/${projectId}?lng=${lng}`,
      images: ogImage ? [ogImage] : undefined,
      locale: lng === "ar" ? "ar" : "en",
      siteName: lng === "ar" ? "المهندس احمد المبيض" : "Eng Ahmed Almobayed",
    },
    twitter: {
      card: "summary_large_image",
      title: projectData.name,
      description,
      images: ogImage ? [ogImage.url] : undefined,
    },
    alternates: {
      canonical: `${baseUrl}/projects/${projectId}`,
    },
  };
}

export default async function page({ params, searchParams }) {
  const awaitedSearchParams = await searchParams;
  const awaitedParams = await params;
  const lng = awaitedSearchParams.lng;
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
  const projectId = awaitedParams.id;
  const projectData = projects.find((project) => project.id == projectId);
  const relatedIds = projectData?.relatedIds;
  const relatedProjects = projects.filter((project) => {
    return relatedIds.includes(project.id);
  });
  const breadcrumbs = [
    <Box component={"a"} underline="hover" key="1" color="inherit" href="/">
      {lng === "ar" ? "الصفحة الرئيسية" : "Home"}
    </Box>,
    <Box
      component={"a"}
      underline="hover"
      key="2"
      color="inherit"
      href="/projects"
    >
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
        <Box sx={{ py: 4 }}>
          <ProjectImagesGrid project={projectData} lng={lng} />
        </Box>
        <Box>
          <ProjectRelatedSection relatedProjects={relatedProjects} lng={lng} />
        </Box>
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

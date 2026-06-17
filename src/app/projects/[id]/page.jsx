import ProjectImagesGrid from "@/app/component/projects/ProjectImagesGrid";
import ProjectRelatedSection from "@/app/component/projects/ProjectRelatedSection";
import { colors } from "@/app/data/constants";
import { getTranslation } from "@/app/i18n";
import {
  getBreadcrumbJsonLd,
  getProjectArticleJsonLd,
  getProfessionalServiceJsonLd,
  getProjectSeoParagraph,
} from "@/app/seo/jsonLdHelpers";
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
import { notFound } from "next/navigation";
import JsonLd from "../../seo/JsonLd";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";

export async function generateMetadata({ params, searchParams }) {
  const cookieStore = await cookies();
  const awaitedSearchParams = await searchParams;
  // نفضّل لغة الرابط (?lng=) لتطابق الميتا مع محتوى الصفحة المعروض، ثم الكوكي
  const lng =
    awaitedSearchParams?.lng || cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
  const awaitedParams = await params;
  const projectId = awaitedParams.id;

  const projectData = projects.find((project) => project.id == projectId);

  if (!projectData) {
    const baseTitle = lng === "ar" ? "المشروع غير موجود" : "Project Not Found";

    return {
      title: baseTitle,
      description: baseTitle,
      robots: { index: false, follow: false },
      openGraph: {
        title: baseTitle,
        description: baseTitle,
      },
      twitter: {
        card: "summary_large_image",
        title: baseTitle,
        description: baseTitle,
      },
      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
      },
    };
  }

  // Prefer cover, fallback to first image, fallback to hero.png
  const rawImagePath =
    projectData.cover || projectData.images?.[0]?.src || "/hero.png";

  const normalizedImagePath = rawImagePath.startsWith("http")
    ? rawImagePath
    : `${baseUrl}${rawImagePath.replace("./", "/")}`;

  // نوع المشروع (سكني/تجاري) لبناء عنوان ووصف وكلمات مفتاحية دقيقة
  const isCommercial = /تجاري|commercial/i.test(projectData.category || "");
  const sectionLabel =
    lng === "ar"
      ? isCommercial
        ? "تصميم داخلي تجاري"
        : "تصميم داخلي سكني"
      : isCommercial
        ? "Commercial Interior Design"
        : "Residential Interior Design";

  const keywordsList =
    lng === "ar"
      ? [
          projectData.name,
          sectionLabel,
          "تصميم داخلي",
          "ديكور",
          "تصميم وتنفيذ",
          "تصميم فلل",
          "تصميم شقق",
          "تصميم مجالس",
          "هندسة معمارية",
          projectData.location,
          projectData.category,
          "المهندس أحمد المبيض",
          "دريم ستوديو",
          String(projectData.year),
        ]
      : [
          projectData.name,
          sectionLabel,
          "interior design",
          "decor",
          "design and execution",
          "villa design",
          "apartment design",
          "majlis design",
          "architecture",
          projectData.location,
          projectData.category,
          "Eng. Ahmad Almobayed",
          "Dream Studio",
          String(projectData.year),
        ];

  const keywords = keywordsList.filter(Boolean).join(", ");

  const title =
    lng === "ar"
      ? `${projectData.name} – ${sectionLabel} في ${projectData.location} | المهندس أحمد المبيض`
      : `${projectData.name} – ${sectionLabel} in ${projectData.location} | Eng. Ahmad Almobayed`;

  const description =
    lng === "ar"
      ? `${projectData.description} — مشروع ${sectionLabel} في ${projectData.location}، بتصميم وتنفيذ المهندس أحمد المبيض ودريم ستوديو. تصميم داخلي وديكور احترافي.`
      : `${projectData.description} — A ${sectionLabel.toLowerCase()} project in ${projectData.location}, designed and executed by Eng. Ahmad Almobayed and Dream Studio. Professional interior design and decor.`;

  return {
    title,
    description,
    keywords,

    openGraph: {
      title, // خليه نفس الـ title عشان يبقى متسق
      description,
      url: `${baseUrl}/projects/${projectId}?lng=${lng}`,
      type: "article",
      locale: lng === "ar" ? "ar_AR" : "en_US",
      siteName: lng === "ar" ? "المهندس أحمد المبيض" : "Eng. Ahmad Almobayed",
      images: [
        {
          url: normalizedImagePath,
          width: 1200,
          height: 630,
          alt: projectData.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [normalizedImagePath],
    },

    alternates: {
      canonical: `${baseUrl}/projects/${projectId}`,
      languages: {
        ar: `${baseUrl}/projects/${projectId}?lng=ar`,
        en: `${baseUrl}/projects/${projectId}?lng=en`,
      },
    },

    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default async function page({ params, searchParams }) {
  const awaitedSearchParams = await searchParams;
  const awaitedParams = await params;
  const lng = awaitedSearchParams.lng || "ar";
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
  const { t: otherLngT } = await getTranslation(lng === "ar" ? "en" : "ar");
  const otherLngProjects = otherLngT("projects", { returnObjects: true });

  const projectId = awaitedParams.id;
  const projectData = projects.find((project) => project.id == projectId);
  if (!projectData) notFound();
  const otherLngProject = otherLngProjects?.find(
    (project) => project.id == projectId
  );
  const relatedIds = projectData.relatedIds || [];
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
  const rawImagePath =
    projectData.cover || projectData.images?.[0]?.src || "/hero.png";

  const normalizedImagePath = rawImagePath.startsWith("http")
    ? rawImagePath
    : `${baseUrl}${rawImagePath.replace("./", "/")}`;
  const breadcrumbJsonLd = getBreadcrumbJsonLd({
    baseUrl,
    lng,
    items: [
      {
        nameAr: "الرئيسية",
        nameEn: "Home",
        href: lng === "ar" ? "/?lng=ar" : "/?lng=en",
      },
      {
        nameAr: "المشاريع",
        nameEn: "Projects",
        href: lng === "ar" ? "/projects?lng=ar" : "/projects?lng=en",
      },
      {
        nameAr:
          lng === "ar"
            ? projectData.name
            : otherLngProject?.name || projectData.name,
        nameEn:
          lng === "en"
            ? projectData.name
            : otherLngProject?.name || projectData.name,
        href:
          lng === "ar"
            ? `/projects/${projectId}?lng=ar`
            : `/projects/${projectId}?lng=en`,
      },
    ],
  });

  // Article schema
  const articleJsonLd = getProjectArticleJsonLd({
    baseUrl,
    lng,
    projectData,
    normalizedImagePath,
  });
  return (
    <>
      <JsonLd id={`breadcrumb-project-${projectId}`} data={breadcrumbJsonLd} />

      <JsonLd id={`article-project-${projectId}`} data={articleJsonLd} />

      <JsonLd
        id={`service-project-${projectId}`}
        data={getProfessionalServiceJsonLd(baseUrl, lng)}
      />
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
            <Typography
              component="h1"
              variant="h4"
              sx={{ mb: 1, fontWeight: "bold" }}
            >
              {lng === "ar"
                ? `${projectData.name} – تصميم داخلي في ${projectData.location}`
                : `${projectData.name} – Interior Design in ${projectData.location}`}
            </Typography>
            <Typography
              component="p"
              variant="subtitle1"
              sx={{ mb: 3, color: "text.secondary" }}
            >
              {lng === "ar" ? "تفاصيل المشروع" : "Project Details"}
            </Typography>
            <ProjectCard data={projectData} lng={lng} />
          </Box>
          <Box sx={{ py: 4 }}>
            <ProjectImagesGrid project={projectData} lng={lng} />
          </Box>
          <Box component="section" sx={{ pb: 2 }}>
            <Typography
              component="h2"
              variant="h6"
              sx={{ mb: 1.5, fontWeight: 600 }}
            >
              {lng === "ar" ? "عن المشروع" : "About this project"}
            </Typography>
            <Typography
              component="p"
              variant="body1"
              sx={{ color: "text.secondary", lineHeight: 1.9, maxWidth: 900 }}
            >
              {getProjectSeoParagraph(projectData, lng)}
            </Typography>
          </Box>
          <Box>
            <ProjectRelatedSection
              relatedProjects={relatedProjects}
              lng={lng}
            />
          </Box>
        </Container>
      </Box>
    </>
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

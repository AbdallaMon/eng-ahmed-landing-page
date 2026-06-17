import { Box, Chip, Container, Grid, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import { cookies } from "next/headers";
import {
  getBreadcrumbJsonLd,
  getProfessionalServiceJsonLd,
  getProjectsCollectionJsonLd,
  getProjectsFaq,
  getFaqJsonLd,
} from "../seo/jsonLdHelpers";
import JsonLd from "../seo/JsonLd";
import Image from "next/image";
export async function generateMetadata({ params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return {
    ...metaData.projectsPage,
    alternates: {
      canonical: `${baseUrl}/projects`,
      languages: {
        ar: `${baseUrl}/projects?lng=ar`,
        en: `${baseUrl}/projects?lng=en`,
      },
    },
  };
}
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";
export default async function page({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng || "ar";
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
  const faqs = getProjectsFaq(lng);
  const serviceChips =
    lng === "ar"
      ? [
          "تصميم فلل",
          "تصميم شقق",
          "تصميم مجالس",
          "تصميم صالات",
          "تصميم عيادات",
          "تصميم مكاتب",
          "تصميم مراكز تجميل",
          "ديكور داخلي",
          "تصميم وتنفيذ",
        ]
      : [
          "Villa design",
          "Apartment design",
          "Majlis design",
          "Hall design",
          "Clinic design",
          "Office design",
          "Beauty center design",
          "Interior decor",
          "Design & fit-out",
        ];
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
    ],
  });
  return (
    <Box>
      <JsonLd id="breadcrumb-projects" data={breadcrumbJsonLd} />
      <JsonLd
        id="projects-collection"
        data={getProjectsCollectionJsonLd({ baseUrl, lng, projects })}
      />
      <JsonLd
        id="projects-service"
        data={getProfessionalServiceJsonLd(baseUrl, lng)}
      />
      <JsonLd id="projects-faq" data={getFaqJsonLd(lng)} />

      <Container maxWidth="xl">
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.3rem", md: "1.6rem" },
              fontWeight: 600,
              mb: 1,
            }}
          >
            {lng === "ar"
              ? "مشاريع التصميم الداخلي – المهندس أحمد المبيض"
              : "Interior Design Projects – Eng. Ahmed Almobayd"}
          </Typography>

          <Typography
            component="p"
            sx={{
              fontSize: { xs: "0.85rem", md: "0.95rem" },
              color: "text.secondary",
              maxWidth: 700,
            }}
          >
            {lng === "ar"
              ? "استكشف مجموعة من مشاريع التصميم الداخلي السكنية والتجارية في الإمارات والخليج — فلل وشقق ومجالس ومكاتب وعيادات — بتصميم وتنفيذ المهندس أحمد المبيض ودريم ستوديو."
              : "Explore a selection of residential and commercial interior design projects across the UAE and the Gulf — villas, apartments, majlis, offices and clinics — designed and executed by Eng. Ahmed Almobayd and Dream Studio."}
          </Typography>
        </Box>
        <Box
          component="nav"
          aria-label={lng === "ar" ? "خدمات التصميم" : "Design services"}
          sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}
        >
          {serviceChips.map((label) => (
            <Chip key={label} label={label} variant="outlined" size="small" />
          ))}
        </Box>
        <Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, md: 3 }} container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[0]} lng={lng} />
              </Grid>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[1]} lng={lng} />
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} container spacing={{ xs: 2, md: 3 }}>
              <ProjectCard data={projects[2]} lng={lng} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[3]} lng={lng} />
              </Grid>
              <Grid size={{ xs: 6, md: 12 }} spacing={{ xs: 2, md: 3 }}>
                <ProjectCard data={projects[4]} lng={lng} />
              </Grid>
            </Grid>

            <Grid size={{ xs: 12 }} container spacing={{ xs: 2, md: 3 }}>
              <ProjectCard data={projects[5]} lng={lng} />
            </Grid>

            <Grid
              size={{ xs: 12, md: 12 }}
              container
              spacing={{ xs: 1.5, md: 3 }}
            >
              <Grid size={{ xs: 4, md: 4 }} spacing={{ xs: 1.5, md: 3 }}>
                <ProjectCard data={projects[6]} lng={lng} />
              </Grid>
              <Grid size={{ xs: 4, md: 4 }} spacing={{ xs: 1.5, md: 3 }}>
                <ProjectCard data={projects[7]} lng={lng} />
              </Grid>
              <Grid size={{ xs: 4, md: 4 }} spacing={{ xs: 1.5, md: 3 }}>
                <ProjectCard data={projects[8]} lng={lng} />
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Box component="section" sx={{ mt: 5, mb: 5 }}>
          <Typography
            component="h2"
            variant="h5"
            sx={{ mb: 2, fontWeight: 700 }}
          >
            {lng === "ar"
              ? "أسئلة شائعة عن التصميم الداخلي والديكور"
              : "Interior Design & Decor FAQ"}
          </Typography>
          {faqs.map((item, i) => (
            <Box key={i} sx={{ mb: 2.5, maxWidth: 900 }}>
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                {item.q}
              </Typography>
              <Typography
                component="p"
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.9 }}
              >
                {item.a}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function ProjectCard({ data, lng }) {
  return (
    <Box
      component="a"
      href={data.href}
      target="_blank"
      rel="noreferrer"
      className="project-card"
      aria-label={
        lng === "ar"
          ? `عرض تفاصيل مشروع ${data.name}`
          : `View details of ${data.name} project`
      }
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

      <Image
        // component="img"
        className="project-card__image"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
        }}
        width={1200}
        height={1200}
        src={`/projects/project-${data.id}.webp`}
        alt={
          lng === "ar"
            ? `مشروع ${data.name} – تصميم داخلي بإشراف المهندس أحمد المبيض`
            : `${data.name} interior design project by Eng. Ahmed Almobayd`
        }
      />
    </Box>
  );
}

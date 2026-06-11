import { Box, Chip, Container, Grid, Typography } from "@mui/material";
import { getTranslation } from "../i18n";
import { cookies } from "next/headers";
import { getBreadcrumbJsonLd } from "../seo/jsonLdHelpers";
import JsonLd from "../seo/JsonLd";
import Image from "next/image";
export async function generateMetadata({ params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return metaData.projectsPage;
}
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";
export default async function page({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;
  const { t } = await getTranslation(lng);
  const projects = t("projects", { returnObjects: true });
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
              ? "استكشف مجموعة من المشاريع السكنية والتجارية..."
              : "Explore a selection of residential and commercial interior design projects..."}
          </Typography>
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
        src={`/projects/project-${data.id}.png`}
        alt={
          lng === "ar"
            ? `مشروع ${data.name} – تصميم داخلي بإشراف المهندس أحمد المبيض`
            : `${data.name} interior design project by Eng. Ahmed Almobayd`
        }
      />
    </Box>
  );
}

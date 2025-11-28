// src/app/seo/jsonLdHelpers.js
import {
  arFullName,
  enFullName,
  arProfession,
  enProfession,
  siteEmail,
  socialMediaIconsLinks,
} from "@/app/data/constants";
import { arAboutData, enAboutData } from "../data/about";

// Helper صغير عشان نحدد اسم المعروض حسب اللغة
function getLocalizedName(lng) {
  return lng === "ar" ? arFullName : enFullName;
}

// 1) Person schema (شخص واحد: أحمد المبيض)
export function getPersonJsonLd(baseUrl) {
  const sameAs = socialMediaIconsLinks
    .filter((link) => link.href && link.href.startsWith("http"))
    .map((link) => link.href);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`, // ID ثابت نستخدمه في بقيّة الSchemas
    name: arFullName, // الاسم الرئيسي بالعربي
    alternateName: [enFullName], // اسم إنجليزي كـ alias
    jobTitle: arProfession, // ممكن تخليها "مهندس تصميم داخلي" لو حابب
    url: baseUrl,
    image: `${baseUrl}/hero.png`,
    email: `mailto:${siteEmail}`,
    sameAs,
  };
}

// 2) Organization schema (براند/مكتب – نفس الشخص هنا)
export function getOrganizationJsonLd(baseUrl) {
  const sameAs = socialMediaIconsLinks
    .filter((link) => link.href && link.href.startsWith("http"))
    .map((link) => link.href);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: arFullName, // تقدر تغيّرها لاسم تجاري لو عندك
    url: baseUrl,
    logo: `${baseUrl}/hero.png`,
    email: `mailto:${siteEmail}`,
    sameAs,
  };
}

// 3) Breadcrumb generic helper
// items = [{ nameAr, nameEn, href }]
export function getBreadcrumbJsonLd({ baseUrl, lng, items }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: lng === "ar" ? item.nameAr : item.nameEn,
      item: `${baseUrl}${item.href}`,
    })),
  };
}

// 4) About WebPage schema
export function getAboutWebPageJsonLd({ baseUrl, lng }) {
  const name = lng === "ar" ? arAboutData.title : enAboutData.title;

  const description =
    lng === "ar" ? arAboutData.description : enAboutData.description;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${baseUrl}/about`,
    url: `${baseUrl}/about`,
    name,
    description,
    inLanguage: lng === "ar" ? "ar" : "en",
    about: {
      "@id": `${baseUrl}/#person`, // ربط صفحة about بنفس الـ Person
    },
  };
}

// 5) Project Article schema (لمشاريع /projects/[id])
export function getProjectArticleJsonLd({
  baseUrl,
  lng,
  projectData,
  normalizedImagePath,
}) {
  // If عندك URLs منفصلة للعربي / الانجليزي ممكن تزود ?lng=...
  const projectUrl = `${baseUrl}/projects/${projectData.id}`;

  // ---- 1) Build gallery images for JSON-LD ----
  const galleryImages =
    Array.isArray(projectData.images) && projectData.images.length
      ? projectData.images
          .map((img, index) => {
            // Some setups بيكون img مجرد string مش object
            const rawSrc = typeof img === "string" ? img : img.src;

            if (!rawSrc) return null;

            const url = rawSrc.startsWith("http")
              ? rawSrc
              : `${baseUrl}${rawSrc.replace("./", "/")}`;

            const width =
              typeof img === "object" && img.width ? img.width : 1200;
            const height =
              typeof img === "object" && img.height ? img.height : 800;

            const caption =
              lng === "ar"
                ? `صورة رقم ${index + 1} من مشروع ${projectData.name} في ${
                    projectData.location
                  }`
                : `Image ${index + 1} from ${projectData.name} project in ${
                    projectData.location
                  }`;

            return {
              "@type": "ImageObject",
              url,
              width,
              height,
              caption,
            };
          })
          .filter(Boolean)
      : [
          {
            "@type": "ImageObject",
            url: normalizedImagePath,
            width: 1200,
            height: 800,
            caption: projectData.name,
          },
        ];
  // ---- 2) Optional: dates if you have them on projectData ----
  // لو عندك createdAt / updatedAt استخدمهم بدال السنة بس
  const datePublished =
    projectData.year && String(projectData.year).length === 4
      ? `${projectData.year}-01-01`
      : undefined;

  // ---- 3) Build the Article JSON-LD ----
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: projectData.name,
    description: projectData.description,

    // 👈 هنا بقى جوجل يشوف كل الصور مش واحدة بس
    image: galleryImages,
    thumbnailUrl: galleryImages[0]?.url,

    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: getLocalizedName(lng),
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: getLocalizedName(lng),
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/hero.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": projectUrl,
    },
    inLanguage: lng === "ar" ? "ar" : "en",
  };

  if (datePublished) {
    articleJsonLd.datePublished = datePublished;
    articleJsonLd.dateModified = datePublished;
  }

  return articleJsonLd;
}

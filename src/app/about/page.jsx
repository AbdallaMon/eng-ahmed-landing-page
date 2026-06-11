import { Box } from "@mui/material";
import CTASection from "../sections/CTASection";
import About from "../sections/About";
import StagesSection from "../sections/StagesSection";
import CompaniesSection from "../sections/CompaniesSection";
import { OurNumbersSection } from "../sections/OurNumbers";
import { BeforeAndAfterSection } from "../sections/BeforeAndAfterSection";
import { HomeProjects } from "../sections/HomeProjects";
import { TranslatingIdeasSection } from "../sections/TranslatingIdeasSection";
import { SuccessJourney } from "../sections/SuccessJourney";
import { Testmonails } from "../sections/Testmonails";
import { FAQ } from "../sections/FAQ";
import { Hero } from "../sections/Hero";
import { BooksAndCourses } from "../sections/BooksAndCourses";
import {
  getAboutWebPageJsonLd,
  getBreadcrumbJsonLd,
  getProfilePageJsonLd,
  getBookJsonLd,
} from "../seo/jsonLdHelpers";
import JsonLd from "../seo/JsonLd";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ahmadmobayed.com";
export default async function Home({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng;
  const aboutPageJsonLd = getAboutWebPageJsonLd({ baseUrl, lng });

  // ProfilePage schema (الغلاف الرسمي لصفحة الشخص + بياناته الكاملة)
  const profilePageJsonLd = getProfilePageJsonLd({ baseUrl, lng });

  // Book schema (كتاب من تأليفه)
  const bookJsonLd = getBookJsonLd({ baseUrl, lng });

  // 2) Breadcrumb schema
  const breadcrumbJsonLd = getBreadcrumbJsonLd({
    baseUrl,
    lng,
    items: [
      {
        nameAr: "الرئيسية",
        nameEn: "Home",
        href: lng === "ar" ? "/?lng=ar" : "/?lng=en", // عدلها لو مسارك مختلف
      },
      {
        nameAr: "عن المهندس",
        nameEn: "About",
        href: lng === "ar" ? "/about?lng=ar" : "/about?lng=en",
      },
    ],
  });
  return (
    <Box>
      <JsonLd id="profile-page-schema" data={profilePageJsonLd} />

      <JsonLd id="book-schema" data={bookJsonLd} />

      <JsonLd id="about-webpage-schema" data={aboutPageJsonLd} />

      <JsonLd id="breadcrumb-about" data={breadcrumbJsonLd} />

      <Hero lng={lng} />
      <CTASection lng={lng} />
      <About lng={lng} />
      <StagesSection lng={lng} />
      <CompaniesSection lng={lng} />
      <OurNumbersSection lng={lng} />
      <HomeProjects lng={lng} />
      <BeforeAndAfterSection lng={lng} />
      <BooksAndCourses lng={lng} />
      <TranslatingIdeasSection lng={lng} />
      <SuccessJourney lng={lng} />
      <Testmonails lng={lng} />
      <FAQ lng={lng} />
    </Box>
  );
}

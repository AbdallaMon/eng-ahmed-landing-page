export const arName = "أحمد المبيض";
export const enName = "Ahmed almobayd";
export const arProfession = "مهندس تصميم داخلي";
export const enProfession = "Interior Design Eng";
export const arProfessionSuffix = "مهندس";
export const enProfessionSuffix = "Eng";
export const arFullName = `${arProfessionSuffix} أحمد المبيض`;
export const enFullName = `${enProfessionSuffix} Ahmed Almobayd`;
export const pageLanguages = [
  {
    label: "العربية",
    value: "ar",
  },
  {
    label: "English",
    value: "en",
  },
];
export const devloperName = "AbdallaMon";
export const developerLink = "https://abdalla-webportfolio.vercel.app";
export const siteEmail = "info@ahmadmobayed.com";
export const arFollowMeText = "تابعني على حساباتي الرسمية:";
export const enFollowMeText = "Follow me on my official accounts:";

export const colors = {
  primary: "#594534", // اللون الرئيسي
  secondary: "#A4978D", // اللون الثانوي
  highlight: "#D7CCC4", // هايت لايت
  highlightDark: "#C19877", // هايت لايت غامق
  white: "#EBE7DF", // الأبيض (أوف وايت دافئ)
  solidWhite: "#FFFFFF", // الأبيض
  teritary: "#EFEFEF",
  borderColor: "#201B17",
  borderColor2: "#D9DBE9",
  brown: "#322A23",
  lightBrown: "#FDF9F5",
  backgroundLight: "#fafafa",
};
export const socialMediaIconsLinks = [
  {
    title: "YouTube",
    href: "https://www.youtube.com/@ahmadalmobayed",
    iconSrc: "/social-media/youtube.png",
  },
  {
    title: "Instagram",
    href: "https://www.instagram.com/eng.ahmad_almobayed/?hl=ar",
    iconSrc: "/social-media/Instagram.png",
  },
  {
    title: "TikTok",
    href: "https://www.tiktok.com/@ahmadmobayed",
    iconSrc: "/social-media/tiktok.png",
  },
  {
    title: "Mail",
    href: `mailto:${siteEmail}`,
    iconSrc: "/social-media/mail.png",
  },
];

export const imageBannerSrc = "/video-banner-pc.png";
export const imageBannerMobileSrc = "/video-banner-mobile.png";
export const whatsAppNumber = "+971585564778";

// ====== بيانات الـ SEO الخاصة بالشخص (للـ JSON-LD فقط — لا تؤثر على شكل الموقع) ======

// المسمى الوظيفي المستخدم في schema (مهندس معماري) — منفصل عن الـ UI
export const arJobTitle = "مهندس معماري";
export const enJobTitle = "Architect";

// سنة الميلاد — العمر 30 مبدئياً (مؤقت، عدّلها لما تتأكد)
export const personBirthYear = "1996";

// الجنسية ومكان الإقامة (سوري مقيم في الإمارات)
export const arNationality = "سوري";
export const enNationality = "Syrian";
export const livingCountryCode = "AE";
export const arLivingCountry = "الإمارات العربية المتحدة";
export const enLivingCountry = "United Arab Emirates";

// مجالات الخبرة (knowsAbout)
export const arKnowsAbout = [
  "العمارة",
  "التصميم الداخلي",
  "الديكور",
  "صناعة المحتوى",
  "التصميم التجاري",
  "التصميم السكني",
];
export const enKnowsAbout = [
  "Architecture",
  "Interior Design",
  "Decor",
  "Content Creation",
  "Commercial Design",
  "Residential Design",
];

// الشركات التي يقودها (worksFor / founder)
export const personCompanies = [
  {
    arName: "دريم استديو",
    enName: "Dream Studio",
    url: "https://www.instagram.com/dreamstudiio.ae/",
    logo: "/dream-studio-logo.png",
  },
  {
    arName: "ديكور ستورز",
    enName: "Decor Stores",
    url: "",
    logo: "/decor-stores-logo.png",
  },
];

// صور البروفايل المقصوصة بنِسب مختلفة (يفضّلها جوجل في ProfilePage)
export const personProfileImages = [
  "/profile/ahmad-1x1.jpg",
  "/profile/ahmad-4x3.jpg",
  "/profile/ahmad-16x9.jpg",
];

// آخر تحديث لصفحة البروفايل — لازم ISO 8601 كاملة بالوقت والـ timezone
// (توقيت الإمارات +04:00). حدّثه يدوياً عند تغيير بيانات الشخص.
export const profileLastModified = "2026-06-11T12:00:00+04:00";

export const arName = "أحمد المبيض";
export const enName = "Ahmed almobayd";
export const arProfession = "مهندس تصميم داخلي";
export const enProfession = "Interior Design Eng";
export const arProfessionSuffix = "مهندس";
export const enProfessionSuffix = "Eng";
export const arFullName = `${arProfessionSuffix} أحمد المبيض`;
export const enFullName = `${enProfessionSuffix} Ahmed Almobayd`;

// ====== الاسم الإنجليزي القانوني (Canonical) المطابق للدومين والويكيداتا ======
// يُستخدم في الميتا (titles/descriptions) وفي بيانات schema (alternateName) فقط —
// ولا يغيّر الاسم الظاهر في واجهة الموقع (enFullName) الذي يبقى "Eng Ahmed Almobayd".
export const enSeoName = "Ahmad Almobayed";
export const enSeoFullName = "Eng. Ahmad Almobayed";

// كل صيغ الاسم المعروفة (لغتين + ألقاب الويكيداتا) لمساعدة محركات البحث على ربط الكيان
export const personAlternateNames = [
  enSeoFullName, // Eng. Ahmad Almobayed (القانوني)
  enSeoName, // Ahmad Almobayed
  enFullName, // Eng Ahmed Almobayd (الظاهر في الموقع)
  enName, // Ahmed almobayd
  "Engineer Ahmed El-Mobayed",
  "Engineer Ahmed",
  arFullName, // مهندس أحمد المبيض
  arName, // أحمد المبيض
  "المهندس أحمد المبيض",
  "المهندس احمد",
];
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

// المسمى الوظيفي المستخدم في schema — مطابق لمهن الويكيداتا P106
// (مهندس معماري + متخصص تصميم داخلي + مهندس) — منفصل عن الـ UI
export const arJobTitle = ["مهندس معماري", "متخصص تصميم داخلي", "مهندس"];
export const enJobTitle = ["Architect", "Interior Design Specialist", "Engineer"];

// تاريخ الميلاد (4 يناير 1998) — صيغة ISO 8601
export const personBirthDate = "1998-01-04";

// محل الميلاد (حماة، سوريا) — مطابق للويكيداتا P19 (حماة Q173545)
export const arBirthPlace = "حماة، سوريا";
export const enBirthPlace = "Hama, Syria";

// الجنسية (سوري) — مطابق للويكيداتا P27 (دولة المواطنة: سوريا Q858)
export const arNationality = "سوري";
export const enNationality = "Syrian";

// مكان الإقامة الحالي (دبي، الإمارات) — مطابق للويكيداتا P551 (دبي Q612)
export const livingCountryCode = "AE";
export const arLivingCountry = "الإمارات العربية المتحدة";
export const enLivingCountry = "United Arab Emirates";
export const arLivingCity = "دبي";
export const enLivingCity = "Dubai";

// التعليم (alumniOf)
export const personEducation = [
  {
    arName: "جامعة البعث",
    enName: "Al-Baath University",
    arField: "هندسة معمارية",
    enField: "Architecture",
    year: "2022",
  },
];

// مجالات الخبرة (knowsAbout)
export const arKnowsAbout = [
  "العمارة",
  "التصميم الداخلي",
  "الديكور",
  "صناعة المحتوى",
  "التسويق",
  "التصميم التجاري",
  "التصميم السكني",
];
export const enKnowsAbout = [
  "Architecture",
  "Interior Design",
  "Decor",
  "Content Creation",
  "Marketing",
  "Commercial Design",
  "Residential Design",
];

// الشركات التي يملكها (هو founder للاتنين)
// دريم استديو = الأساسية، وديكور ستورز = شركة ديكور فرعية تابعة ليها
export const personCompanies = [
  {
    key: "dream",
    arName: "دريم استديو",
    enName: "Dream Studio",
    url: "https://www.instagram.com/dreamstudiio.ae/",
    logo: "/dream-studio-logo.png",
    foundingDate: "2025",
    primary: true,
  },
  {
    key: "decor",
    arName: "ديكور ستورز",
    enName: "Decor Stores",
    url: "https://decorstores.ltd/",
    logo: "/decor-stores-logo.png",
    foundingDate: "2022",
    parentKey: "dream", // شركة فرعية تابعة لدريم استديو
  },
];

// روابط حسابات إضافية تُستخدم في schema فقط (لا تظهر كأيقونات في الموقع)
export const extraPersonSameAs = [
  "https://www.facebook.com/engahmedalmobayed/",
  "https://www.threads.com/@eng.ahmad_almobayed",
  "https://www.wikidata.org/wiki/Q140180035",
];

// محتوى إعلامي اتعمل *عنه* (subjectOf) — مقابلات ومقالات من طرف ثالث
export const mediaAboutPerson = [
  {
    type: "CreativeWork",
    arName: "مقابلة المهندس أحمد المبيض على تلفزيون أبوظبي",
    enName: "Eng. Ahmad Almobayed interview on Abu Dhabi TV",
    url: "https://www.instagram.com/abudhabitv/reel/DQrzYtFlce2/",
    arPublisher: "تلفزيون أبوظبي",
    enPublisher: "Abu Dhabi TV",
  },
  {
    type: "CreativeWork",
    arName: "ظهور المهندس أحمد المبيض على تلفزيون أبوظبي",
    enName: "Eng. Ahmad Almobayed feature on Abu Dhabi TV",
    url: "https://www.instagram.com/abudhabitv/reel/DPCD9JBCY0Q/",
    arPublisher: "تلفزيون أبوظبي",
    enPublisher: "Abu Dhabi TV",
  },
  {
    type: "CreativeWork",
    arName: "لقاء المهندس أحمد المبيض على تلفزيون أبوظبي",
    enName: "Eng. Ahmad Almobayed segment on Abu Dhabi TV",
    url: "https://www.instagram.com/abudhabitv/reel/DT0qQKzD4NE/",
    arPublisher: "تلفزيون أبوظبي",
    enPublisher: "Abu Dhabi TV",
  },
  {
    type: "CreativeWork",
    arName: "رحلة المهندس أحمد المبيض المُلهمة في التصميم",
    enName: "Ahmad Almobayed's Inspiring Design Journey",
    url: "https://uaestories.com/ahmad-almobayeds-inspiring-design-journey/",
    arPublisher: "يو إيه إي ستوريز",
    enPublisher: "UAE Stories",
  },
];

// كتاب من تأليفه (نشر ذاتي — لا توجد دار نشر)
export const personBook = {
  arName: "كتاب ستايلات التصميم الداخلي",
  enName: "Interior Design Styles Book",
  url: "https://decorstores.ltd/products/book",
};

// صور البروفايل المعتمدة (مقصوصة من صورة الـ entity) بنِسب 1x1 / 4x3 / 16x9
export const personProfileImages = [
  "/profile/ahmed-almobayed-1x1.jpg",
  "/profile/ahmed-almobayed-4x3.jpg",
  "/profile/ahmed-almobayed-16x9.jpg",
];

// آخر تحديث لصفحة البروفايل — لازم ISO 8601 كاملة بالوقت والـ timezone
// (توقيت الإمارات +04:00). حدّثه يدوياً عند تغيير بيانات الشخص.
export const profileLastModified = "2026-06-11T12:00:00+04:00";

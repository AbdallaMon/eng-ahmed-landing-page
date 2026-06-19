// src/app/seo/jsonLdHelpers.js
import {
  arFullName,
  enFullName,
  arName,
  enName,
  enSeoFullName,
  personAlternateNames,
  siteEmail,
  socialMediaIconsLinks,
  arJobTitle,
  enJobTitle,
  personBirthDate,
  arBirthPlace,
  enBirthPlace,
  arNationality,
  enNationality,
  livingCountryCode,
  arLivingCountry,
  enLivingCountry,
  arLivingCity,
  enLivingCity,
  personEducation,
  arKnowsAbout,
  enKnowsAbout,
  personCompanies,
  extraPersonSameAs,
  mediaAboutPerson,
  personBook,
  personProfileImages,
  profileLastModified,
} from "@/app/data/constants";
import { arAboutData, enAboutData } from "../data/about";

// Helper صغير عشان نحدد اسم المعروض حسب اللغة
function getLocalizedName(lng) {
  return lng === "ar" ? arFullName : enFullName;
}

// روابط الحسابات الرسمية الخاصة بالشخص (أيقونات الموقع + حسابات إضافية للـ schema)
function getPersonSameAs() {
  const fromIcons = socialMediaIconsLinks
    .filter((link) => link.href && link.href.startsWith("http"))
    .map((link) => link.href);
  return [...fromIcons, ...extraPersonSameAs];
}

// الشركات اللي يملكها (تُستخدم في worksFor) — هو founder للكل
// ديكور ستورز = متجر أونلاين (OnlineStore) تابع لدريم استديو
function getCompaniesJsonLd(baseUrl, lng) {
  const byKey = (key) => personCompanies.find((c) => c.key === key);
  return personCompanies.map((company) => {
    const org = {
      "@type": company.key === "decor" ? "OnlineStore" : "Organization",
      name: lng === "ar" ? company.arName : company.enName,
      logo: `${baseUrl}${company.logo}`,
      founder: { "@id": `${baseUrl}/#person` }, // هو مؤسّس الشركة
    };
    if (company.foundingDate) org.foundingDate = company.foundingDate;
    if (company.url) {
      // لو الرابط موقع رسمي نخليه url، ولو سوشيال نخليه sameAs
      if (company.url.includes("instagram.com")) org.sameAs = [company.url];
      else org.url = company.url;
    }
    // الشركة الفرعية تشير لشركتها الأم
    if (company.parentKey) {
      const parent = byKey(company.parentKey);
      if (parent) {
        org.parentOrganization = {
          "@type": "Organization",
          name: lng === "ar" ? parent.arName : parent.enName,
        };
      }
    }
    return org;
  });
}

// المحتوى الإعلامي اللي اتعمل *عنه* (مقابلات/مقالات) — subjectOf
function getMediaAboutPerson(lng) {
  return mediaAboutPerson.map((item) => ({
    "@type": item.type,
    name: lng === "ar" ? item.arName : item.enName,
    url: item.url,
    publisher: {
      "@type": "Organization",
      name: lng === "ar" ? item.arPublisher : item.enPublisher,
    },
  }));
}

// التعليم (alumniOf)
function getAlumniOf(lng) {
  return personEducation.map((edu) => ({
    "@type": "EducationalOrganization",
    name: lng === "ar" ? edu.arName : edu.enName,
  }));
}

// 1) Person schema (شخص واحد: أحمد المبيض) — النسخة الدسمة
export function getPersonJsonLd(baseUrl, lng = "ar") {
  const description = (
    lng === "ar" ? arAboutData.description : enAboutData.description
  ).trim();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/#person`, // ID ثابت نستخدمه في بقيّة الSchemas
    name: lng === "ar" ? arFullName : enFullName,
    // كل صيغ الاسم المعروفة (تشمل التهجئة القانونية وألقاب الويكيداتا) لربط الكيان
    alternateName: [...new Set(personAlternateNames)],
    description,
    jobTitle: lng === "ar" ? arJobTitle : enJobTitle,
    // hasOccupation أدق من jobTitle ويطابق مهن الويكيداتا (P106)
    hasOccupation: (lng === "ar" ? arJobTitle : enJobTitle).map((title) => ({
      "@type": "Occupation",
      name: title,
    })),
    gender: "Male",
    birthDate: personBirthDate,
    birthPlace: {
      "@type": "Place",
      name: lng === "ar" ? arBirthPlace : enBirthPlace,
    },
    nationality: {
      "@type": "Country",
      name: lng === "ar" ? arNationality : enNationality,
    },
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: livingCountryCode,
        addressRegion: lng === "ar" ? arLivingCountry : enLivingCountry,
        addressLocality: lng === "ar" ? arLivingCity : enLivingCity,
      },
    },
    alumniOf: getAlumniOf(lng),
    knowsAbout: lng === "ar" ? arKnowsAbout : enKnowsAbout,
    worksFor: getCompaniesJsonLd(baseUrl, lng),
    subjectOf: getMediaAboutPerson(lng),
    url: baseUrl,
    // صور بنِسب 1x1 / 4x3 / 16x9 (يفضّلها جوجل) بدون المساس بصورة الموقع
    image: personProfileImages.map((src) => `${baseUrl}${src}`),
    email: `mailto:${siteEmail}`,
    sameAs: getPersonSameAs(),
  };
}

// 1.c) Book schema — كتاب من تأليف الشخص (نشر ذاتي)
export function getBookJsonLd({ baseUrl, lng = "ar" }) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: lng === "ar" ? personBook.arName : personBook.enName,
    url: personBook.url,
    inLanguage: lng === "ar" ? "ar" : "en",
    author: {
      "@id": `${baseUrl}/#person`, // نفس الشخص = المؤلف
      "@type": "Person",
      name: lng === "ar" ? arFullName : enFullName,
    },
  };
}

// 1.b) ProfilePage schema — الغلاف الرسمي لصفحة "عن المهندس"
// ده النوع اللي جوجل عامله مخصوص لصفحات الأشخاص، وبيلف حوالين نفس الـ Person
export function getProfilePageJsonLd({ baseUrl, lng = "ar" }) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${baseUrl}/about#profilepage`,
    url: `${baseUrl}/about`,
    dateModified: profileLastModified,
    inLanguage: lng === "ar" ? "ar" : "en",
    // الكيان الأساسي للصفحة = نفس الـ Person (بنفس الـ @id فيتدمجوا عند جوجل)
    mainEntity: getPersonJsonLd(baseUrl, lng),
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

  // ---- 2.b) القسم + الكلمات المفتاحية (لإثراء السيو) ----
  const isCommercial = /تجاري|commercial/i.test(projectData.category || "");
  const sectionLabel =
    lng === "ar"
      ? isCommercial
        ? "تصميم داخلي تجاري"
        : "تصميم داخلي سكني"
      : isCommercial
        ? "Commercial Interior Design"
        : "Residential Interior Design";

  const keywordList =
    lng === "ar"
      ? [
          projectData.name,
          sectionLabel,
          "تصميم داخلي",
          "ديكور",
          "تصميم وتنفيذ",
          projectData.location,
          projectData.category,
          arFullName,
          "دريم ستوديو",
        ]
      : [
          projectData.name,
          sectionLabel,
          "interior design",
          "decor",
          "design and execution",
          projectData.location,
          projectData.category,
          enSeoFullName,
          "Dream Studio",
        ];

  // ---- 3) Build the Article JSON-LD ----
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: projectData.name,
    description: projectData.description,
    articleSection: sectionLabel,
    keywords: keywordList.filter(Boolean).join(", "),

    // 👈 هنا بقى جوجل يشوف كل الصور مش واحدة بس
    image: galleryImages,
    thumbnailUrl: galleryImages[0]?.url,

    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: getLocalizedName(lng),
      url: baseUrl,
    },
    creator: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: getLocalizedName(lng),
    },
    // المشروع "عن" نفس الشخص (يربط المقال بكيان المهندس)
    about: [{ "@id": `${baseUrl}/#person` }],
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      // الاسم يُورَّث من تعريف #organization الأساسي (تفادي تعارض الاسم بين اللغات)
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

  // مكان تنفيذ المشروع (مدينة/دولة) — إشارة جغرافية مفيدة
  if (projectData.location) {
    articleJsonLd.contentLocation = {
      "@type": "Place",
      name: projectData.location,
    };
  }

  if (datePublished) {
    articleJsonLd.datePublished = datePublished;
    articleJsonLd.dateModified = datePublished;
  } else {
    articleJsonLd.dateModified = profileLastModified;
  }

  return articleJsonLd;
}

// ===================================================================
//  تقوية البحث: نوع المشروع + المنطقة + فقرة محتوى غنية بالكلمات
// ===================================================================

// نوع المشروع وكلماته المفتاحية القريبة (مجلس/شقة/صالة/عيادة/مكتب/مركز تجميل)
export function getProjectKind(projectData, lng) {
  const n = `${projectData?.name || ""}`;
  const has = (re) => re.test(n);

  if (has(/مجلس|majlis/i))
    return lng === "ar"
      ? { label: "تصميم مجلس", keywords: ["تصميم مجلس", "ديكور مجلس", "تصميم مجالس"] }
      : { label: "majlis design", keywords: ["majlis design", "majlis decor"] };
  if (has(/شق[ةه]|apartment/i))
    return lng === "ar"
      ? { label: "تصميم شقة", keywords: ["تصميم شقة", "ديكور شقة", "تصميم ديكور شقة"] }
      : { label: "apartment design", keywords: ["apartment design", "apartment interior design"] };
  if (has(/تجميل|سبا|beauty|spa/i))
    return lng === "ar"
      ? { label: "تصميم مركز تجميل", keywords: ["تصميم مركز تجميل", "تصميم سبا", "تصميم صالون تجميل"] }
      : { label: "beauty center design", keywords: ["beauty center design", "spa design"] };
  if (has(/عياد[ةه]|عيادات|انتظار|clinic|lounge/i))
    return lng === "ar"
      ? { label: "تصميم عيادة", keywords: ["تصميم عيادة", "تصميم عيادات", "تصميم صالة انتظار"] }
      : { label: "clinic design", keywords: ["clinic design", "waiting lounge design"] };
  if (has(/مكتب|مكاتب|office/i))
    return lng === "ar"
      ? { label: "تصميم مكتب", keywords: ["تصميم مكتب", "تصميم مكاتب", "تصميم مكاتب الشركات"] }
      : { label: "office design", keywords: ["office design", "corporate office design"] };
  if (has(/صال[ةه]|hall/i))
    return lng === "ar"
      ? { label: "تصميم صالة", keywords: ["تصميم صالة", "تصميم صالة مفتوحة", "تصميم صالات"] }
      : { label: "hall design", keywords: ["open hall design", "living hall design"] };

  const commercial = /تجاري|commercial/i.test(projectData?.category || "");
  return lng === "ar"
    ? {
        label: commercial ? "تصميم داخلي تجاري" : "تصميم داخلي سكني",
        keywords: commercial
          ? ["تصميم داخلي تجاري", "تصميم محلات", "تصميم مكاتب"]
          : ["تصميم داخلي سكني", "تصميم شقق", "تصميم فلل"],
      }
    : {
        label: commercial ? "commercial interior design" : "residential interior design",
        keywords: commercial
          ? ["commercial interior design", "retail design"]
          : ["residential interior design", "villa design"],
      };
}

// المنطقة/المدينة المشتقّة من موقع المشروع (الترتيب يحسم التداخل)
export function getProjectRegion(projectData, lng) {
  const loc = `${projectData?.location || ""}`;
  const rules = [
    { re: /العراق|بغداد|iraq|baghdad/i, ar: "العراق", en: "Iraq" },
    { re: /السعودية|saudi/i, ar: "السعودية", en: "Saudi Arabia" },
    { re: /العين|al[\s-]?ain/i, ar: "العين، الإمارات", en: "Al Ain, UAE" },
    { re: /رأس الخيمة|راس الخيمة|ras\s?al/i, ar: "رأس الخيمة، الإمارات", en: "Ras Al Khaimah, UAE" },
    { re: /دبي|dubai|مارينا|marina/i, ar: "دبي، الإمارات", en: "Dubai, UAE" },
    {
      re: /أبو\s?ظبي|ابو\s?ظبي|abu[\s-]?dhabi|محمد بن زايد|بني ياس|baniyas/i,
      ar: "أبوظبي، الإمارات",
      en: "Abu Dhabi, UAE",
    },
  ];
  const hit = rules.find((r) => r.re.test(loc));
  if (hit) return lng === "ar" ? hit.ar : hit.en;
  return lng === "ar" ? "الإمارات والخليج" : "the UAE and the Gulf";
}

// فقرة محتوى غنية وطبيعية لصفحة المشروع — تلتقط البحث القريب دون حشو
export function getProjectSeoParagraph(projectData, lng) {
  const kind = getProjectKind(projectData, lng);
  const region = getProjectRegion(projectData, lng);
  const name = projectData?.name || "";
  const desc = `${projectData?.description || ""}`.trim().replace(/[.،,]+$/, "");

  if (lng === "ar") {
    return `يقدّم المهندس أحمد المبيض و«دريم ستوديو» خدمات تصميم داخلي وديكور وتشطيب وتنفيذ (فيت اوت) احترافية. «${name}» مشروع ${kind.label} في ${region}${
      desc ? `، ${desc}` : ""
    }. إذا كنت تبحث عن ${kind.keywords.join("، ")}، أو عن مهندس ديكور أو مصمم ديكور أو مصمم داخلي أو شركة تصميم داخلي وديكور في ${region}، فهذا نموذج من أعمالنا في الديكور والتصميم الداخلي — استعرض الصور واطلب استشارة لمعرفة الأفكار وتفاصيل وأسعار التصميم الداخلي.`;
  }
  return `Eng. Ahmad Almobayed and Dream Studio provide professional interior design, decor and fit-out services. "${name}" is a ${kind.label} project in ${region}${
    desc ? `, ${desc}` : ""
  }. If you are looking for ${kind.keywords.join(", ")}, or a decor engineer, decor designer, interior designer or interior design & decor company in ${region}, this is a sample of our decor and interior design work — browse the photos and request a consultation for ideas and interior design pricing.`;
}

// 5.c) أسئلة شائعة مخصّصة لكل مشروع حسب نوعه (صالة/مجلس/شقة/عيادة/مكتب/مركز تجميل)
// الهدف: التقاط نية البحث القريبة — "تصميم {النوع}"، "تكلفة..."، "أفضل مهندس..."،
// "تصميم وتنفيذ..." — مع دعوة واضحة للتواصل في كل إجابة. (٤ أسئلة فقط لتفادي الحشو)
export function getProjectFaq(projectData, lng) {
  const kind = getProjectKind(projectData, lng);
  const name = projectData?.name || "";
  const commercial = /تجاري|commercial/i.test(projectData?.category || "");

  if (lng === "ar") {
    // نقود بالمصطلح الواسع الأكثر بحثاً (مش بالموقع الدقيق) + مظلّة أعمّ
    // (تصميم منزل/تصميم داخلي/ديكور) عشان نلتقط البحث العام مش بس المدينة.
    const broad = commercial
      ? ["تصميم داخلي", "ديكور", "تصميم وتنفيذ", "تصميم محلات ومكاتب"]
      : ["تصميم منزل", "تصميم داخلي", "ديكور منزل", "تصميم وتنفيذ"];
    const terms = [...kind.keywords, ...broad].join("، ");
    return [
      {
        q: `هل تبحث عن ${kind.label}؟`,
        a: `«${name}» نموذج من أعمال المهندس أحمد المبيض و«دريم ستوديو» في ${kind.label}. سواء كنت تبحث عن ${terms} في الإمارات، تواصل معنا عبر صفحة الحجز لنصمّم وننفّذ لك مشروعاً مشابهاً.`,
      },
      {
        q: `كم تكلفة ${kind.label}؟`,
        a: `تختلف تكلفة ${kind.label} حسب المساحة ومستوى التشطيب والخامات. اطلب عرض سعر مخصّص لمشروعك من خلال صفحة الحجز.`,
      },
      {
        q: `من هو أفضل مهندس ديكور ومصمم داخلي في الإمارات؟`,
        a: `يُعدّ المهندس أحمد المبيض و«دريم ستوديو» من أبرز الأسماء في التصميم الداخلي والديكور في الإمارات، بخبرة في ${kind.label} وأكثر من 220 مشروعاً منفّذاً. استعرض المشروع واحجز استشارة.`,
      },
      {
        q: `هل تقدّمون التصميم والتنفيذ (فيت اوت)؟`,
        a: `نعم، نقدّم خدمة متكاملة من التصميم حتى التنفيذ والتشطيب (فيت اوت) لـ${kind.label} وأعمال الديكور والتصميم الداخلي في أبوظبي ودبي والعين وجميع أنحاء الإمارات.`,
      },
    ];
  }
  const broad = commercial
    ? ["interior design", "decor", "design and fit-out", "shop & office design"]
    : ["home design", "interior design", "home decor", "design and fit-out"];
  const terms = [...kind.keywords, ...broad].join(", ");
  return [
    {
      q: `Looking for ${kind.label}?`,
      a: `"${name}" is a sample of Eng. Ahmad Almobayed and Dream Studio's work in ${kind.label}. Whether you're looking for ${terms} in the UAE, contact us through the booking page and we'll design and execute a similar project for you.`,
    },
    {
      q: `How much does ${kind.label} cost?`,
      a: `The cost of ${kind.label} depends on the area, finishing level and materials used. Request a custom quote for your project through the booking page.`,
    },
    {
      q: `Who is the best decor engineer and interior designer in the UAE?`,
      a: `Eng. Ahmad Almobayed and Dream Studio are among the leading names in interior design and decor in the UAE, with experience in ${kind.label} and 220+ completed projects. Browse the project and book a consultation.`,
    },
    {
      q: `Do you offer design and fit-out?`,
      a: `Yes — we provide an end-to-end service from design to execution and fit-out for ${kind.label} and full interior design and decor across Abu Dhabi, Dubai, Al Ain and the UAE.`,
    },
  ];
}

// FAQPage schema مبني على أسئلة المشروع المخصّصة أعلاه
export function getProjectFaqJsonLd(projectData, lng) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getProjectFaq(projectData, lng).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

// 6) ProfessionalService — كيان "شركة/مصمم تصميم داخلي" (يستهدف البحث العام)
export function getProfessionalServiceJsonLd(baseUrl, lng = "ar") {
  const dream = personCompanies.find((c) => c.key === "dream");
  const serviceTypes =
    lng === "ar"
      ? [
          "تصميم داخلي",
          "ديكور",
          "تصميم ديكور",
          "ديكورات",
          "تصميم وتنفيذ",
          "تشطيب وتنفيذ",
          "فيت اوت",
          "تجديد وديكور",
          "تصميم فلل",
          "تصميم شقق",
          "تصميم مجالس",
          "تصميم صالات",
          "تصميم عيادات",
          "تصميم مكاتب",
          "تصميم مراكز تجميل",
        ]
      : [
          "interior design",
          "decor",
          "decoration design",
          "decorations",
          "design and fit-out",
          "interior fit-out",
          "office fit-out",
          "renovation",
          "villa design",
          "apartment design",
          "majlis design",
          "hall design",
          "clinic design",
          "office design",
          "beauty center design",
        ];
  const areas =
    lng === "ar"
      ? ["أبوظبي", "دبي", "العين", "الإمارات العربية المتحدة"]
      : ["Abu Dhabi", "Dubai", "Al Ain", "United Arab Emirates"];

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}/#designservice`,
    name:
      lng === "ar"
        ? `${dream?.arName || "دريم استديو"} للتصميم الداخلي`
        : `${dream?.enName || "Dream Studio"} Interior Design`,
    alternateName:
      lng === "ar"
        ? [
            arFullName,
            "مهندس ديكور",
            "مصمم ديكور",
            "مهندس تصميم داخلي",
            "مصمم داخلي",
          ]
        : [
            enSeoFullName,
            "decor engineer",
            "decor designer",
            "interior designer",
          ],
    description:
      lng === "ar"
        ? "من أبرز شركات التصميم الداخلي والديكور في الإمارات، بقيادة المهندس أحمد المبيض (مهندس ومصمم ديكور وتصميم داخلي)، متخصّصة في تصميم وتنفيذ الفلل والشقق والمجالس والصالات والعيادات والمكاتب ومراكز التجميل، مع أكثر من 220 مشروعًا منفّذًا، ومحتوى تجاوزت مشاهداته المليار وأكثر من 2.5 مليون متابع."
        : "Among the leading interior design and decor companies in the UAE, led by Eng. Ahmad Almobayed (decor engineer and interior designer), specialized in designing and executing villas, apartments, majlis, halls, clinics and offices — with 220+ completed projects, content exceeding a billion views and over 2.5 million followers.",
    slogan:
      lng === "ar"
        ? "نحو أفضل تصميم داخلي وديكور في الإمارات"
        : "Toward the best interior design and decor in the UAE",
    url: baseUrl,
    image: `${baseUrl}/hero.png`,
    logo: `${baseUrl}${dream?.logo || "/hero.png"}`,
    founder: { "@id": `${baseUrl}/#person` },
    provider: { "@id": `${baseUrl}/#person` },
    areaServed: areas.map((name) => ({ "@type": "AdministrativeArea", name })),
    serviceType: serviceTypes,
    knowsAbout: lng === "ar" ? arKnowsAbout : enKnowsAbout,
    priceRange: "$$",
    sameAs: getPersonSameAs(),
    makesOffer: serviceTypes.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s,
        serviceType: s,
        provider: { "@id": `${baseUrl}/#person` },
        areaServed:
          lng === "ar" ? "الإمارات العربية المتحدة" : "United Arab Emirates",
      },
    })),
  };
}

// 7) CollectionPage + ItemList لصفحة /projects (تعرّف جوجل بمعرض الأعمال)
export function getProjectsCollectionJsonLd({ baseUrl, lng, projects }) {
  const list = Array.isArray(projects) ? projects : [];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/projects`,
    url: `${baseUrl}/projects`,
    name:
      lng === "ar"
        ? "مشاريع التصميم الداخلي والديكور – المهندس أحمد المبيض"
        : "Interior Design & Decor Projects – Eng. Ahmad Almobayed",
    inLanguage: lng === "ar" ? "ar" : "en",
    about: { "@id": `${baseUrl}/#person` },
    isPartOf: { "@id": `${baseUrl}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: list.length,
      itemListElement: list.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${baseUrl}/projects/${p.id}`,
        name: p.name,
      })),
    },
  };
}

// 8) الأسئلة الشائعة — تلتقط نية البحث (سعر/مدن/أنواع/حجز) + FAQPage schema
export function getProjectsFaq(lng) {
  return lng === "ar"
    ? [
        {
          q: "من هو أفضل مهندس وأفضل شركة تصميم داخلي في الإمارات؟",
          a: "يُعد المهندس أحمد المبيض وشركته دريم ستوديو من أبرز الأسماء في التصميم الداخلي والديكور في الإمارات؛ بخبرة في تصميم وتنفيذ الفلل والشقق والمجالس والعيادات والمكاتب بأساليب كلاسيك ومودرن ولاكجري، وأكثر من 220 مشروعًا منفّذًا، ومحتوى تجاوزت مشاهداته المليار وأكثر من 2.5 مليون متابع، وظهور على تلفزيون أبوظبي. استعرض المشاريع واحجز استشارة لتقييم مشروعك.",
        },
        {
          q: "هل المهندس أحمد المبيض مهندس ديكور أم مصمم داخلي؟",
          a: "الاثنان وجهان لتخصّص واحد؛ فمهندس الديكور هو نفسه مهندس ومصمم التصميم الداخلي. يقدّم المهندس أحمد المبيض خدمات تصميم داخلي وديكور وديكورات كاملة — تصميم وتنفيذ — للفلل والشقق والمجالس والصالات والعيادات والمكاتب.",
        },
        {
          q: "ما هي تكلفة أو سعر التصميم الداخلي؟",
          a: "تختلف أسعار التصميم الداخلي حسب نوع المشروع (شقة، فيلا، مجلس، صالة، عيادة، مكتب) ومساحته ومستوى التشطيب. تواصل معنا عبر صفحة الحجز للحصول على عرض سعر مخصّص لمشروعك.",
        },
        {
          q: "ما أنواع المشاريع التي تصممونها؟",
          a: "نُصمّم وننفّذ الفلل والشقق والمجالس والصالات والعيادات والمراكز التجارية والمكاتب ومراكز التجميل، بأساليب كلاسيك ومودرن ومينيمال ولاكجري، بالإضافة إلى أعمال التشطيب والتنفيذ (فيت اوت) وتجديد الديكور.",
        },
        {
          q: "في أي المدن تقدّمون خدمات التصميم الداخلي؟",
          a: "نقدّم خدمات التصميم الداخلي والديكور في أبوظبي ودبي والعين وجميع أنحاء الإمارات، بالإضافة إلى مشاريع في الخليج والعراق.",
        },
        {
          q: "كيف أحجز استشارة تصميم داخلي مع المهندس أحمد المبيض؟",
          a: "يمكنك حجز استشارة مع المهندس أحمد المبيض و«دريم ستوديو» من خلال صفحة الحجز، باختيار نوع المشروع وموقعك لبدء العمل.",
        },
      ]
    : [
        {
          q: "Who is the best interior designer and interior design company in the UAE?",
          a: "Eng. Ahmad Almobayed and his company Dream Studio are among the leading names in interior design and decor in the UAE — with 220+ completed projects, experience designing and executing villas, apartments, majlis, clinics and offices in classic, modern and luxury styles, content exceeding a billion views and over 2.5 million followers, and features on Abu Dhabi TV. Browse the projects and book a consultation to assess your project.",
        },
        {
          q: "Is Eng. Ahmad Almobayed a decor engineer or an interior designer?",
          a: "They are two sides of the same specialty — a decor engineer is the same as an interior design engineer and designer. Eng. Ahmad Almobayed offers full interior design and decor services — design and execution — for villas, apartments, majlis, halls, clinics and offices.",
        },
        {
          q: "How much does interior design cost?",
          a: "Interior design pricing depends on the project type (apartment, villa, majlis, hall, clinic, office), its area and the finishing level. Contact us through the booking page for a custom quote for your project.",
        },
        {
          q: "What types of projects do you design?",
          a: "We design and execute villas, apartments, majlis, halls, clinics, commercial spaces, offices and beauty centers, in classic, modern, minimalist and luxury styles, plus full fit-out, execution and renovation works.",
        },
        {
          q: "Which cities do you offer interior design services in?",
          a: "We offer interior design and decor services in Abu Dhabi, Dubai, Al Ain and across the UAE, in addition to projects in the Gulf and Iraq.",
        },
        {
          q: "How do I book an interior design consultation with Eng. Ahmad Almobayed?",
          a: "You can book a consultation with Eng. Ahmad Almobayed and Dream Studio through the booking page by selecting your project type and location to get started.",
        },
      ];
}

export function getFaqJsonLd(lng) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getProjectsFaq(lng).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

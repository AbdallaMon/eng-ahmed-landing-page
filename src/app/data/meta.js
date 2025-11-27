import { arAboutData, enAboutData } from "./about";

const baseUrl = "https://ahmadmobayed.com";

/* ---------------------------------------------
   SHORT SEO VERSIONS (أفضل نسخة للسيو)
--------------------------------------------- */

// Arabic SEO description for ABOUT page
const arAboutSeoDescription =
  "تعرف على المهندس أحمد المبيض، مهندس معماري ومتخصص في التصميم الداخلي وصانع محتوى تجاوزت مشاهداته المليار، يقدم حلولاً مبتكرة للمشاريع السكنية والتجارية ويقود شركات رائدة في مجال التصميم.";

// English SEO description for ABOUT page
const enAboutSeoDescription =
  "Learn about Eng. Ahmed Almobayd, an architect and interior design specialist with over one billion views, providing innovative residential and commercial solutions and leading top design companies.";

/* ---------------------------------------------
   META (ARABIC VERSION)
--------------------------------------------- */

export const arMetaData = {
  mainPage: {
    title: `مهندس أحمد المبيض - تصميم داخلي وتخطيط وتنفيذ`,
    description: `استشارات تصميم داخلي، تخطيط، وتنفيذ مشاريع سكنية وتجارية باحترافية عالية مع المهندس أحمد المبيض.`,
    keywords: `تصميم داخلي, مهندس داخلي, ديكور, تخطيط مشاريع, تنفيذ ديكور, أحمد المبيض, تصميم منازل, تصميم مكاتب`,
    openGraph: {
      title: `مهندس أحمد المبيض - تصميم داخلي وتخطيط وتنفيذ`,
      description: `استشارات تصميم داخلي، تخطيط وتنفيذ المشاريع السكنية والتجارية. احجز استشارتك الآن.`,
      url: baseUrl,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: "المهندس أحمد المبيض - تصميم داخلي وتخطيط وتنفيذ",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "المهندس أحمد المبيض - تصميم داخلي",
      description:
        "استشارات تصميم داخلي وتخطيط وتنفيذ المشاريع السكنية والتجارية.",
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },

  /* ---------- ABOUT PAGE ---------- */
  aboutPage: {
    title: `عن المهندس أحمد المبيض – مهندس معماري وتصميم داخلي`,
    description: arAboutSeoDescription,
    keywords: `عن أحمد المبيض, مهندس معماري, تصميم داخلي, ديكور, خبرة تصميم داخلي, مشاريع أحمد المبيض, سيرة ذاتية, Dream Studio, Decor Stores`,
    openGraph: {
      title: `عن المهندس أحمد المبيض – خبرة في التصميم الداخلي والعمارة`,
      description: arAboutSeoDescription,
      url: `${baseUrl}/about`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: arAboutData.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `عن المهندس أحمد المبيض`,
      description: arAboutSeoDescription,
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },

  /* ---------- BOOKING PAGE ---------- */
  bookingPage: {
    title: `احجز استشارتك مع المهندس أحمد المبيض – تصميم داخلي وتخطيط`,
    description: `احجز جلسة استشارية مع المهندس أحمد المبيض لتحويل رؤيتك التصميمية إلى واقع مميز.`,
    keywords: `احجز استشارة, تصميم داخلي, مهندس داخلي, تصميم منازل, تخطيط مشاريع, تنفيذ ديكور, أحمد المبيض`,
    openGraph: {
      title: `احجز استشارتك مع المهندس أحمد المبيض`,
      description: `جلسات استشارية في التصميم الداخلي والتخطيط والتنفيذ.`,
      url: `${baseUrl}/booking`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: "احجز استشارتك مع المهندس أحمد المبيض",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "احجز استشارتك الآن",
      description: `تصميم داخلي، ديكور، تخطيط وتنفيذ مع المهندس أحمد المبيض.`,
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },

  /* ---------- PROJECTS PAGE ---------- */
  projectsPage: {
    title: `مشاريع تصميم داخلي وتنفيذ – المهندس أحمد المبيض`,
    description: `استكشف أحدث مشاريع التصميم الداخلي والتنفيذ التي قدمها المهندس أحمد المبيض، مع حلول مبتكرة وجودة عالية.`,
    keywords: `مشاريع تصميم داخلي, مشاريع ديكور, تنفيذ ديكور, مشاريع أحمد المبيض, تصميم داخلي سكني, تصميم مكاتب`,
    openGraph: {
      title: `مشاريع تصميم داخلي – المهندس أحمد المبيض`,
      description: `نماذج من أعمال التصميم الداخلي والتنفيذ للمهندس أحمد المبيض.`,
      url: `${baseUrl}/projects`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: "مشاريع تصميم داخلي – المهندس أحمد المبيض",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "مشاريع تصميم داخلي",
      description: `تعرف على أبرز مشاريع التصميم الداخلي والتنفيذ.`,
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },
};

/* ---------------------------------------------
   META (ENGLISH VERSION)
--------------------------------------------- */

export const enMetaData = {
  mainPage: {
    title: `Eng. Ahmed Almobayd - Interior Design, Planning & Execution`,
    description: `Professional interior design consultation, planning, and execution services for residential and commercial projects.`,
    keywords: `interior design, interior designer, decor, project planning, execution, home design, office design, Ahmed Almobayd`,
    openGraph: {
      title: `Eng. Ahmed Almobayd - Interior Design Expert`,
      description: `Interior design, planning and execution for homes and businesses.`,
      url: baseUrl,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: "Eng Ahmed Almobayd Interior Design",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Interior Design Consultation",
      description:
        "Get expert interior design and planning with Eng. Ahmed Almobayd.",
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },

  /* ---------- ABOUT PAGE ---------- */
  aboutPage: {
    title: `About Eng. Ahmed Almobayd – Architect & Interior Design Expert`,
    description: enAboutSeoDescription,
    keywords: `About Ahmed Almobayd, architect, interior design expert, resume, Dream Studio, Decor Stores`,
    openGraph: {
      title: `About Eng. Ahmed Almobayd`,
      description: enAboutSeoDescription,
      url: `${baseUrl}/about`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: enAboutData.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `About Eng. Ahmed Almobayd`,
      description: enAboutSeoDescription,
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/about.ico",
      shortcut: "/about.ico",
      apple: "/about.ico",
    },
  },

  /* ---------- BOOKING PAGE ---------- */
  bookingPage: {
    title: `Book a Consultation – Eng. Ahmed Almobayd`,
    description: `Book an interior design consultation with Eng. Ahmed Almobayd to bring your vision to life.`,
    keywords: `book consultation, interior design, project planning, decor execution, Ahmed Almobayd`,
    openGraph: {
      title: `Book Your Consultation`,
      description: `Professional interior design and planning consultation.`,
      url: `${baseUrl}/booking`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: "Book Interior Design Consultation",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Book Now",
      description: `Interior design & decor consultation with Eng. Ahmed.`,
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },

  /* ---------- PROJECTS PAGE ---------- */
  projectsPage: {
    title: `Interior Design & Execution Projects – Eng. Ahmed Almobayd`,
    description: `Explore interior design and execution projects delivered by Eng. Ahmed Almobayd with creativity and attention to detail.`,
    keywords: `interior design projects, decor execution, Ahmed Almobayd, home design, office design, project examples`,
    openGraph: {
      title: `Interior Design Projects – Eng. Ahmed`,
      description: `A collection of interior design and decor execution projects.`,
      url: `${baseUrl}/projects`,
      type: "website",
      images: [
        {
          url: `${baseUrl}/hero.png`,
          width: 1200,
          height: 630,
          alt: "Interior Design Projects – Eng. Ahmed",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Interior Design Projects",
      description:
        "Explore creative interior design and decor execution projects.",
      images: [`${baseUrl}/hero.png`],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  },
};

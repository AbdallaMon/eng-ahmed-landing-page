import { arFullName, enFullName } from "./constants";

const heroImages = {
  heroImage: "./hero-croped.png",
  heroSkitchImage: "./hero-skitch-croped.png",
  heroBackgroundImage: "./hero-bg.png",
  heroMobileBackgroundImage: "./hero-bg-mobile.png",
  heroPattern: "./hero-pattern.png",
};

export const arHero = {
  rightText: {
    title: "مهندس معماري",
    description:
      "مهندس معماري متخصص في تصميم المباني والمساحات الداخلية والخارجية، مع التركيز على الابتكار والجمال والوظيفة.",
  },
  leftText: {
    title: "مخطط عمراني",
    description:
      "مخطط عمراني يعمل على تطوير تصاميم مستدامة وعملية، ويركز على دمج التفاصيل التقنية مع الرؤية الإبداعية.",
  },
  floatingText: {
    top: "تحليل المشروع",
    center: "ستايل حديث",
    left: "مساحات فارغة",
    right: "تخطيط",
  },
  images: {
    hero: {
      src: heroImages.heroImage,
      alt: `صورة ${arFullName} في واجهة الموقع كمهندس معماري`,
    },
    heroSkitch: {
      src: heroImages.heroSkitchImage,
      alt: `رسم تخطيطي معماري يوضح أسلوب عمل ${arFullName}`,
    },
    heroBackground: {
      src: heroImages.heroBackgroundImage,
      alt: `خلفية معمارية عصرية لواجهة ${arFullName}`,
    },
    heroMobileBackground: {
      src: heroImages.heroMobileBackgroundImage,
      alt: `خلفية معمارية مخصصة لواجهة الجوال لموقع ${arFullName}`,
    },
    heroPattern: {
      src: heroImages.heroPattern,
      alt: `نمط زخرفي معماري ضمن هوية ${arFullName} البصرية`,
    },
  },
};

export const enHero = {
  rightText: {
    title: "Architect",
    description:
      "An architect specialized in designing buildings and interior and exterior spaces, with a strong focus on innovation, aesthetics, and functionality.",
  },
  leftText: {
    title: "Urban Planner",
    description:
      "An urban planner who develops sustainable and practical designs, integrating technical details with a clear creative vision.",
  },
  floatingText: {
    top: "Project analysis",
    center: "Modern style",
    left: "Open spaces",
    right: "Space planning",
  },
  images: {
    hero: {
      src: heroImages.heroImage,
      alt: `Hero image of ${enFullName}, architectural engineer and designer`,
    },
    heroSkitch: {
      src: heroImages.heroSkitchImage,
      alt: `Architectural sketch representing ${enFullName}'s design approach`,
    },
    heroBackground: {
      src: heroImages.heroBackgroundImage,
      alt: `Modern architectural background behind ${enFullName}'s hero section`,
    },
    heroMobileBackground: {
      src: heroImages.heroMobileBackgroundImage,
      alt: `Mobile-optimized architectural background for ${enFullName}'s hero section`,
    },
    heroPattern: {
      src: heroImages.heroPattern,
      alt: `Decorative architectural pattern used in ${enFullName}'s visual identity`,
    },
  },
};

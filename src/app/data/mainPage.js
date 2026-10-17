const requestDesignUrl = process.env.NEXT_PUBLIC_REGISTER_URL;
export const arMainPageData = [
  {
    title: "من هو المهندس أحمد؟",
    // subTitle: "وهذا السبب اللي خلّاني أبدأ",
    href: "/about",
    // href: process.env.NEXT_PUBLIC_REGISTER_URL,
    image: "/main-page-hero.png",
  },
  {
    title: "حجز استشارة",
    href: "https://decorstores.ltd/en/products/consultation-with-engineer-ahmed",
    image: "/consultation.jpg",
    type: "COVER",
  },
  {
    title: "حجز تصميم",
    // href: "whatsapp://channel/0029Vb6IrAgFy72LBOHa7t3E",
    // image: "/whats-app-icon.png",
    image: "/projects/project-2.png",
    href: requestDesignUrl,
  },
  {
    title: "الدائرة المقربة",
    href: "whatsapp://channel/0029Vb6IrAgFy72LBOHa7t3E",
    image: "/whats-app-icon.png",
  },
];

export const enMainPageData = [
  {
    title: "Who is Engineer Ahmed?",
    // subTitle: "And that's the reason I started",
    // href: process.env.NEXT_PUBLIC_REGISTER_URL,
    image: "/main-page-hero.png",
    href: "/about",
  },
  {
    title: "Book a Consultation",
    href: "https://decorstores.ltd/en/products/consultation-with-engineer-ahmed",
    image: "/consultation.jpg",
    type: "COVER",
  },
  {
    title: "Book a Design",
    // href: "whatsapp://channel/0029Vb6IrAgFy72LBOHa7t3E",
    // image: "/whats-app-icon.png",
    image: "/projects/project-2.png",
    href: requestDesignUrl,
  },
  {
    title: "The Inner Circle",
    href: "whatsapp://channel/0029Vb6IrAgFy72LBOHa7t3E",
    image: "/whats-app-icon.png",
  },
];

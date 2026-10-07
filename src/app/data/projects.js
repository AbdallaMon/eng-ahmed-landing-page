// projects-data.js

function getProjectImages(project) {
  const totalImages =
    project.imagesNumbers ||
    (Array.isArray(project.images) ? project.images.length : 0);

  if (!totalImages || !project.id) return [];

  // SEO-friendly descriptive file prefix when a slug is set, else legacy "1.webp".
  const prefix = project.imageSlug ? `${project.imageSlug}-` : "";

  return Array.from({ length: totalImages }, (_, index) => ({
    src: `/projects/project-${project.id}/${prefix}${index + 1}.${
      project.imagesExtension || "webp"
    }`,
    index,
  }));
}

// Descriptive image slugs per project — used to build SEO-friendly image file
// names (gallery, cover, card thumbnail, home thumbnail) for Google Images.
const PROJECT_SLUGS = {
  1: "mens-majlis-classic-abu-dhabi",
  2: "outdoor-majlis-minimalist-abu-dhabi",
  3: "open-hall-garden-baghdad",
  4: "apartment-damac-heights-dubai-marina",
  5: "open-hall-modern-rustic-abu-dhabi",
  6: "clinic-waiting-lounge-abu-dhabi",
  7: "beauty-center-spa-al-ain",
  8: "majlis-reception-neoclassic-riyadh",
  9: "private-office-aysco-baniyas-abu-dhabi",
};

// Builds the derived, SEO-named image fields shared by ar/en project lists.
function withProjectImages(project) {
  const imageSlug = PROJECT_SLUGS[project.id];
  return {
    ...project,
    imageSlug,
    cover: imageSlug
      ? `/projects/project-${project.id}/${imageSlug}-cover.png`
      : project.cover,
    imageSrc:
      project.imageSrc && imageSlug
        ? `./projects/${imageSlug}-home.webp`
        : project.imageSrc,
    images: getProjectImages({ ...project, imageSlug }),
  };
}
export const arInitialProjects = [
  {
    id: 1,
    relatedIds: [2, 5, 4, 8],
    slug: "project-1",
    href: "/projects/1",
    imagesNumbers: 8,

    images: [
      "./projects/project-1/1.png",
      "./projects/project-1/2.png",
      "./projects/project-1/3.png",
      "./projects/project-1/4.png",
      "./projects/project-1/5.png",
      "./projects/project-1/6.png",
    ],
    cover: "/projects/project-1/1.png",
    name: "مجلس رجال كلاسيك فاخر",
    seoTitle: "تصميم مجلس رجال كلاسيك فاخر في أبوظبي",
    seoContent:
      "مجلس رجال بطابع كلاسيكي فاخر، صُمّم ونُفّذ بإشراف المهندس أحمد المبيض و«دريم ستوديو» بين أبوظبي ورأس الخيمة. اعتمد التصميم على تفاصيل جبسية دقيقة وإضاءة هادئة وتنجيد فخم بدرجات دافئة، ليجمع بين هيبة المجالس العربية الكلاسيكية وراحة الاستقبال اليومي. نموذج من أعمالنا في تصميم وديكور المجالس الكلاسيك في الإمارات — استعرض الصور واطلب استشارة لمجلس مماثل.",
    description: "مجلس علي ستايل كلاسيك لاكجري",
    location: "ابو ظبي ،راس الخيمة",
    year: 2025,
    status: "مكتمل",
    category: "سكني",
  },
  {
    id: 2,
    relatedIds: [1, 5, 8],
    slug: "project-2",
    href: "/projects/2",
    imagesNumbers: 17,

    images: [
      "./projects/project-2/1.png",
      "./projects/project-2/2.png",
      "./projects/project-2/3.png",
      "./projects/project-2/4.png",
      "./projects/project-2/5.png",
      "./projects/project-2/6.png",
    ],
    cover: "/projects/project-2/1.png",
    name: "مجلس خارجي مينيمال مع طاولة طعام",
    seoTitle: "تصميم مجلس خارجي مينيمال مع طاولة طعام في أبوظبي",
    seoContent:
      "مجلس خارجي على ستايل مينيمال لاكجري في مدينة محمد بن زايد بأبوظبي، يجمع بين جلسة المجلس وطاولة طعام ومغاسل وحمام ضمن مساحة واحدة متناسقة. ركّز التصميم على الخطوط النظيفة والخامات الطبيعية والإضاءة الخارجية المدروسة ليكون مكاناً مريحاً لاستقبال الضيوف في الهواء الطلق طوال العام. تصميم وتنفيذ المهندس أحمد المبيض و«دريم ستوديو» — مثال على ديكور المجالس الخارجية الحديثة.",
    description:
      "مجلس خارجي مع طاولة طعام ومغاسل وحمام على ستايل مينيماليست لاكجري.",
    location: "أبو ظبي، مدينة محمد بن زايد",
    year: 2025,
    status: "مكتمل",
    category: "سكني",
  },
  {
    id: 3,
    relatedIds: [5, 8, 4],
    slug: "project-3",
    href: "/projects/3",
    imagesNumbers: 50,

    images: [
      "./projects/project-3/1.png",
      "./projects/project-3/2.png",
      "./projects/project-3/3.png",
      "./projects/project-3/4.png",
      "./projects/project-3/5.png",
      "./projects/project-3/6.png",
    ],
    cover: "/projects/project-3/1.png",
    name: "صالة مفتوحة مع حديقة",
    seoContent:
      "صالة استقبال ومعيشة مفتوحة تتوسّطها حديقة داخلية صارت روح البيت، في مشروع سكني ببغداد على ستايل مينيمالست عصري. وُزّعت المساحات لتدفّق الضوء والحركة حول الحديقة، مع لمسات خضراء وخامات طبيعية تربط الداخل بالخارج. من تصميم المهندس أحمد المبيض و«دريم ستوديو» — استعرض لقطات المشروع واطلب استشارة لتصميم صالة مفتوحة مماثلة.",
    description:
      "صالة استقبال مع معيشة وحديقة في المنتصف كانت روح البيت على ستايل مينماليست عصري.",
    location: "العراق، بغداد",
    year: 2024,
    status: "تصميم",
    category: "سكني",
  },
  {
    id: 4,
    relatedIds: [1, 5, 3],
    imagesNumbers: 15,

    slug: "project-4",
    href: "/projects/4",
    images: [
      "./projects/project-4/1.png",
      "./projects/project-4/2.png",
      "./projects/project-4/3.png",
      "./projects/project-4/4.png",
      "./projects/project-4/5.png",
      "./projects/project-4/6.png",
    ],
    cover: "/projects/project-4/1.png",
    name: "شقة فاخرة ستايل وابي سابي في داماك هايت",
    seoTitle: "تصميم شقة فاخرة ستايل وابي سابي في داماك هايت دبي",
    seoContent:
      "شقة فاخرة في برج داماك هايت بمارينا دبي، صُمّمت على مزيج بين اللاكجري وفلسفة «وابي سابي» التي تحتفي بجمال البساطة والخامات الطبيعية. عُني التصميم بالتفاصيل المعمارية والإضاءة وتدرّجات الألوان الترابية لخلق إحساس هادئ وراقٍ داخل الشقة. تصميم وتنفيذ المهندس أحمد المبيض و«دريم ستوديو» — نموذج لتصميم وديكور الشقق الفاخرة في دبي.",
    description: "شقة على ستايل لاكجري وابي سابي",
    homeDescription:
      "صممت شقة فاخرة في داماك هايت مع التركيز على التفاصيل المعمارية والفخامة",
    imageSrc: "./projects/home-project-3.webp",
    isHome: true,
    location: "مارينا دبي",
    year: 2025,
    status: "مكتمل",
    category: "سكني",
  },
  {
    id: 5,
    relatedIds: [1, 2, 3, 4],
    imagesType: "NOT_EQUAL",
    imagesNumbers: 11,

    slug: "project-5",
    href: "/projects/5",
    images: [
      "./projects/project-5/1.png",
      "./projects/project-5/2.png",
      "./projects/project-5/3.png",
      "./projects/project-5/4.png",
      "./projects/project-5/5.png",
      "./projects/project-5/6.png",
    ],
    cover: "/projects/project-5/1.png",
    name: "صالة مفتوحة مع طعام ودرج",
    seoTitle: "تصميم صالة مفتوحة مع طعام ودرج في أبوظبي",
    seoContent:
      "صالة مفتوحة تضم منطقة طعام ومدخلاً ودرجاً، بتصميم مودرن ريفي يوازن بين دفء الطابع الريفي ونظافة الخطوط العصرية، في مدينة الرياض بأبوظبي. اختيرت الخامات والإضاءة لتمنح المساحة إحساساً عائلياً مريحاً مع لمسة فخامة هادئة. مشروع قيد التنفيذ من المهندس أحمد المبيض و«دريم ستوديو» — مثال على تصميم الصالات والمساحات المفتوحة.",
    description: "صالة مفتوحة مع طعام ومدخل ودرج على ستايل مودرن ريفي.",
    location: "أبو ظبي، مدينة الرياض",
    year: 2025,
    status: "قيد الإنشاء",
    category: "سكني",
  },
  {
    id: 6,
    relatedIds: [7, 9],
    slug: "project-6",

    href: "/projects/6",
    imagesExtension: "webp",

    imagesNumbers: 6,
    images: [
      "./projects/project-6/1.png",
      "./projects/project-6/2.png",
      "./projects/project-6/3.png",
      "./projects/project-6/4.png",
      "./projects/project-6/5.png",
      "./projects/project-6/6.png",
    ],
    cover: "/projects/project-6/1.png",
    name: "صالة انتظار عيادة مع بار",
    seoTitle: "تصميم صالة انتظار عيادة مع بار في أبوظبي",
    seoContent:
      "صالة انتظار ضمن مشروع عيادات في أبوظبي، أُعيد توزيع مساحاته لاستغلالها بذكاء وتضمين جلسة انتظار وبار يجعل انتظار الزائر تجربة مريحة لا مملّة. وازن التصميم بين الجمالية والوظيفية وسهولة الحركة، بما يليق بالطابع الطبي الراقي. تصميم وتنفيذ المهندس أحمد المبيض و«دريم ستوديو» — نموذج لتصميم وديكور العيادات وصالات الانتظار التجارية.",
    description:
      "مشروع عيادات في ابو ظبي تم توزيع المساحات واستغلالها لتتضمن صالة انتظار مع جلسة وبار ليتمكن الزائر الأنتظار دون ملل",
    imageSrc: "./projects/home-project-2.webp",
    homeDescription:
      "صممت مشروع صالة إنتظار مبتكرًا يجمع بين الجمالية والوظيفية لتجربة مريحة وفاخرة",
    isHome: true,
    location: "ابو ظبي",
    year: 2025,
    status: "مكتمل",
    category: "تجاري",
  },
  {
    id: 7,
    relatedIds: [6, 9],
    slug: "project-7",
    href: "/projects/7",
    imagesNumbers: 20,

    images: [
      "./projects/project-7/1.png",
      "./projects/project-7/2.png",
      "./projects/project-7/3.png",
      "./projects/project-7/4.png",
      "./projects/project-7/5.png",
      "./projects/project-7/6.png",
    ],
    cover: "/projects/project-7/1.png",
    name: "مركز تجميل وسبا مع حمام مغربي",
    seoTitle: "تصميم مركز تجميل وسبا مع حمام مغربي في العين",
    seoContent:
      "مركز مساج داخل مركز تجميل بمدينة العين، يضم حماماً مغربياً وغرف مساج خاصة ومشالح ومغاسل، بتصميم عصري يوازن بين الراحة والفخامة. دُرس تدفّق الحركة بدقة هندسية لضمان الخصوصية والانسيابية بين الأقسام، مع إضاءة وخامات تبعث على الاسترخاء. تصميم المهندس أحمد المبيض و«دريم ستوديو» — مثال على تصميم وديكور مراكز التجميل والسبا في الإمارات.",
    description:
      "مركز مساج داخل مركز تجميل يضم حمام مغربي وغرف مساج خاصة ومشالح مع مغاسل.",
    homeDescription:
      "صممت مركز تجميل عصريًا يوازن بين الراحة والفخامة مع مراعاة تدفق الحركة بدقة هندسية",
    imageSrc: "./projects/home-project-1.webp",
    isHome: true,
    location: "أبو ظبي، مدينة العين",
    year: 2025,
    status: "تصميم منتهي",
    category: "تجاري",
  },
  {
    id: 8,
    relatedIds: [2, 3, 1],
    slug: "project-8",
    href: "/projects/8",
    imagesNumbers: 18,

    images: [
      "./projects/project-8/1.png",
      "./projects/project-8/2.png",
      "./projects/project-8/3.png",
      "./projects/project-8/4.png",
      "./projects/project-8/5.png",
      "./projects/project-8/6.png",
    ],
    cover: "/projects/project-8/1.png",
    name: "مجلس نيو كلاسيك مع استقبال وحديقة",
    seoTitle: "تصميم مجلس نيو كلاسيك مع استقبال وحديقة في الرياض",
    seoContent:
      "مجلس مع منطقة استقبال ومقلط وحديقة على ستايل نيو كلاسيك فاخر، في مشروع سكني بالرياض. جمع التصميم بين رُقيّ الكلاسيك الحديث والتفاصيل الفخمة والتوزيع المريح للضيوف، مع حديقة تضيف بُعداً طبيعياً للمساحة. تصميم المهندس أحمد المبيض و«دريم ستوديو» — نموذج لتصميم وديكور المجالس النيو كلاسيك في السعودية والخليج.",
    description: "مجلس مع مقلط وحديقة على ستايل نيو كلاسيك لاكجري",
    location: "الرياض السعودية",
    year: 2024,
    status: "تصميم",
    category: "سكني",
  },
  {
    id: 9,
    relatedIds: [6, 7],
    slug: "project-9",
    href: "/projects/9",
    images: [
      "./projects/project-9/1.png",
      "./projects/project-9/2.png",
      "./projects/project-9/3.png",
      "./projects/project-9/4.png",
      "./projects/project-9/5.png",
      "./projects/project-9/6.png",
    ],
    cover: "/projects/project-9/1.png",
    imagesNumbers: 24,

    name: "مكتب شركة عصري",
    seoTitle: "تصميم مكتب شركة عصري في أبوظبي",
    seoContent:
      "مكتب خاص لشركة «آيسكو» المتخصصة في أعمال التكييف ببني ياس في أبوظبي، يضم غرفة مدير وغرفتي عمل وغرفة اجتماعات وحمّامين وبوفيه خدمي وأرشيفاً. وُزّعت المساحات لتخدم سير العمل والخصوصية والاجتماعات بكفاءة، بهوية بصرية تعكس احترافية الشركة. تصميم وتنفيذ المهندس أحمد المبيض و«دريم ستوديو» — مثال على تصميم وديكور المكاتب والمساحات التجارية في أبوظبي.",
    description:
      "مكتب لشركة آيسكو المتخصصة في أعمال التكييف: غرفة مدير، غرفتا عمل، غرفة اجتماعات، حمّامان، بوفيه خدمي وأرشيف.",
    location: "أبو ظبي، بني ياس",
    year: 2025,
    status: "تصميم وتنفيذ منتهي",
    category: "تجاري",
  },
];
export const arProjects = arInitialProjects.map(withProjectImages);

export const enInitialProjects = [
  {
    id: 1,
    relatedIds: [2, 5, 4, 8],
    slug: "project-1",
    href: "/projects/1",
    imagesNumbers: 8,
    images: [
      "./projects/project-1/1.png",
      "./projects/project-1/2.png",
      "./projects/project-1/3.png",
      "./projects/project-1/4.png",
      "./projects/project-1/5.png",
      "./projects/project-1/6.png",
    ],
    cover: "/projects/project-1/1.png",
    name: "Classic Luxury Men's Majlis",
    seoTitle: "Classic Luxury Men's Majlis Design in Abu Dhabi",
    seoContent:
      "A men's majlis in a refined classic style, designed and executed by Eng. Ahmad Almobayed and Dream Studio between Abu Dhabi and Ras Al Khaimah. The design relies on detailed gypsum work, soft lighting and rich upholstery in warm tones, blending the prestige of a classic Arabic majlis with everyday comfort. A sample of our work in classic majlis interior design and decor in the UAE — browse the photos and request a consultation for a similar majlis.",
    description: "Majlis in a classic luxury style",
    location: "Abu Dhabi, Ras Al Khaimah",
    year: 2025,
    status: "Completed",
    category: "Residential",
  },
  {
    id: 2,
    relatedIds: [1, 5, 8],
    slug: "project-2",
    href: "/projects/2",
    imagesNumbers: 17,
    images: [
      "./projects/project-2/1.png",
      "./projects/project-2/2.png",
      "./projects/project-2/3.png",
      "./projects/project-2/4.png",
      "./projects/project-2/5.png",
      "./projects/project-2/6.png",
    ],
    cover: "/projects/project-2/1.png",
    name: "Minimalist Outdoor Majlis with Dining Table",
    seoTitle: "Minimalist Outdoor Majlis Design with Dining Table in Abu Dhabi",
    seoContent:
      "An outdoor majlis in a minimalist luxury style in Mohammed Bin Zayed City, Abu Dhabi, combining a majlis seating area, a dining table, wash basins and a bathroom within one cohesive space. The design focuses on clean lines, natural materials and considered outdoor lighting to create a comfortable place to host guests in the open air year-round. Designed and executed by Eng. Ahmad Almobayed and Dream Studio — an example of modern outdoor majlis decor.",
    description:
      "Outdoor majlis with dining table, wash basins and bathroom in a minimalist luxury style.",
    location: "Abu Dhabi, Mohammed Bin Zayed City",
    year: 2025,
    status: "Completed",
    category: "Residential",
  },
  {
    id: 3,
    relatedIds: [5, 8, 4],
    slug: "project-3",
    href: "/projects/3",
    imagesNumbers: 50,
    images: [
      "./projects/project-3/1.png",
      "./projects/project-3/2.png",
      "./projects/project-3/3.png",
      "./projects/project-3/4.png",
      "./projects/project-3/5.png",
      "./projects/project-3/6.png",
    ],
    cover: "/projects/project-3/1.png",
    name: "Open Hall with Garden",
    seoContent:
      "An open reception and living hall wrapped around a central indoor garden that became the heart of the home, in a residential project in Baghdad with a modern minimalist style. Spaces were arranged so light and movement flow around the garden, with greenery and natural materials linking inside and out. Designed by Eng. Ahmad Almobayed and Dream Studio — browse the project shots and request a consultation for a similar open hall.",
    description:
      "Reception hall with living area and a central garden that became the heart of the home in a modern minimalist style.",
    location: "Iraq, Baghdad",
    year: 2024,
    status: "Design",
    category: "Residential",
  },
  {
    id: 4,
    relatedIds: [1, 5, 3],
    slug: "project-4",
    href: "/projects/4",
    imagesNumbers: 15,
    images: [
      "./projects/project-4/1.png",
      "./projects/project-4/2.png",
      "./projects/project-4/3.png",
      "./projects/project-4/4.png",
      "./projects/project-4/5.png",
      "./projects/project-4/6.png",
    ],
    cover: "/projects/project-4/1.png",
    name: "Luxury Wabi-Sabi Apartment in Damac Heights",
    seoTitle: "Luxury Wabi-Sabi Apartment Design in Damac Heights, Dubai",
    seoContent:
      "A luxury apartment in Damac Heights, Dubai Marina, designed around a blend of luxury and the 'wabi-sabi' philosophy that celebrates the beauty of simplicity and natural materials. The design pays close attention to architectural details, lighting and earthy color gradients to create a calm, elegant feel throughout the apartment. Designed and executed by Eng. Ahmad Almobayed and Dream Studio — a sample of luxury apartment interior design in Dubai.",
    description: "Apartment in a luxury and wabi-sabi style",
    homeDescription:
      "I designed a luxury apartment in Damac Heights with a focus on architectural details and opulence",
    imageSrc: "./projects/home-project-3.webp",
    isHome: true,
    location: "Dubai Marina",
    year: 2025,
    status: "Completed",
    category: "Residential",
  },
  {
    id: 5,
    relatedIds: [1, 2, 3, 4],
    imagesType: "NOT_EQUAL",
    imagesNumbers: 11,
    slug: "project-5",
    href: "/projects/5",
    images: [
      "./projects/project-5/1.png",
      "./projects/project-5/2.png",
      "./projects/project-5/3.png",
      "./projects/project-5/4.png",
      "./projects/project-5/5.png",
      "./projects/project-5/6.png",
    ],
    cover: "/projects/project-5/1.png",
    name: "Open Hall with Dining & Staircase",
    seoTitle: "Open Hall Design with Dining & Staircase in Abu Dhabi",
    seoContent:
      "An open hall with a dining area, entrance and staircase in a modern rustic style, balancing the warmth of a rustic character with clean contemporary lines, in Riyadh City, Abu Dhabi. Materials and lighting were chosen to give the space a comfortable family feel with quiet luxury. A project under construction by Eng. Ahmad Almobayed and Dream Studio — an example of hall and open-space design.",
    description:
      "Open hall with dining area, entrance and staircase in a modern rustic style.",
    location: "Abu Dhabi, Riyadh City",
    year: 2025,
    status: "Under Construction",
    category: "Residential",
  },
  {
    id: 6,
    relatedIds: [7, 9],
    slug: "project-6",
    href: "/projects/6",
    imagesExtension: "webp",
    imagesNumbers: 6,
    images: [
      "./projects/project-6/1.png",
      "./projects/project-6/2.png",
      "./projects/project-6/3.png",
      "./projects/project-6/4.png",
      "./projects/project-6/5.png",
      "./projects/project-6/6.png",
    ],
    cover: "/projects/project-6/1.png",
    name: "Clinic Waiting Lounge with Bar",
    seoTitle: "Clinic Waiting Lounge Design with Bar in Abu Dhabi",
    seoContent:
      "A waiting lounge within a clinic project in Abu Dhabi, whose spaces were re-planned and optimized to include a seating area and a bar that turn the visitor's wait into a comfortable, un-boring experience. The design balances aesthetics, functionality and easy circulation, befitting a refined medical setting. Designed and executed by Eng. Ahmad Almobayed and Dream Studio — a sample of clinic and commercial waiting-lounge design and decor.",
    description:
      "Clinic project in Abu Dhabi where spaces were laid out and optimized to include a waiting lounge with seating and a bar so visitors can wait without boredom.",
    imageSrc: "./projects/home-project-2.webp",
    homeDescription:
      "I designed an innovative waiting lounge project that combines aesthetics and functionality for a comfortable, luxurious experience",
    isHome: true,
    location: "Abu Dhabi",
    year: 2025,
    status: "Completed",
    category: "Commercial",
  },
  {
    id: 7,
    relatedIds: [6, 9],
    slug: "project-7",
    href: "/projects/7",
    imagesNumbers: 20,
    images: [
      "./projects/project-7/1.png",
      "./projects/project-7/2.png",
      "./projects/project-7/3.png",
      "./projects/project-7/4.png",
      "./projects/project-7/5.png",
      "./projects/project-7/6.png",
    ],
    cover: "/projects/project-7/1.png",
    name: "Beauty Center & Spa with Moroccan Bath",
    seoTitle: "Beauty Center & Spa Design with Moroccan Bath in Al Ain",
    seoContent:
      "A massage center inside a beauty center in Al Ain, featuring a Moroccan bath, private massage rooms, changing rooms and wash basins, with a contemporary design that balances comfort and luxury. Circulation was studied with engineering precision to ensure privacy and smooth flow between sections, with lighting and materials that invite relaxation. Designed by Eng. Ahmad Almobayed and Dream Studio — an example of beauty center and spa interior design in the UAE.",
    description:
      "Massage center inside a beauty center featuring a Moroccan bath, private massage rooms, changing rooms and wash basins.",
    homeDescription:
      "I designed a contemporary beauty center that balances comfort and luxury while carefully considering circulation flow",
    imageSrc: "./projects/home-project-1.webp",
    isHome: true,
    location: "Abu Dhabi, Al Ain City",
    year: 2025,
    status: "Design Completed",
    category: "Commercial",
  },
  {
    id: 8,
    relatedIds: [2, 3, 1],
    slug: "project-8",
    href: "/projects/8",
    imagesNumbers: 18,
    images: [
      "./projects/project-8/1.png",
      "./projects/project-8/2.png",
      "./projects/project-8/3.png",
      "./projects/project-8/4.png",
      "./projects/project-8/5.png",
      "./projects/project-8/6.png",
    ],
    cover: "/projects/project-8/1.png",
    name: "Neo-Classic Majlis with Reception & Garden",
    seoTitle: "Neo-Classic Majlis Design with Reception & Garden in Riyadh",
    seoContent:
      "A majlis with a reception area, a service room and a garden in a neo-classical luxury style, in a residential project in Riyadh. The design blends the elegance of modern classic with opulent details and a comfortable layout for guests, with a garden that adds a natural dimension to the space. Designed by Eng. Ahmad Almobayed and Dream Studio — a sample of neo-classical majlis design and decor in Saudi Arabia and the Gulf.",
    description:
      "Majlis with dining area and garden in a neo-classical luxury style",
    location: "Riyadh, Saudi Arabia",
    year: 2024,
    status: "Design",
    category: "Residential",
  },
  {
    id: 9,
    relatedIds: [6, 7],
    slug: "project-9",
    href: "/projects/9",
    imagesNumbers: 24,
    images: [
      "./projects/project-9/1.png",
      "./projects/project-9/2.png",
      "./projects/project-9/3.png",
      "./projects/project-9/4.png",
      "./projects/project-9/5.png",
      "./projects/project-9/6.png",
    ],
    cover: "/projects/project-9/1.png",
    name: "Modern Corporate Office",
    seoTitle: "Modern Corporate Office Design in Abu Dhabi",
    seoContent:
      "A private office for 'Aysco', a company specialized in HVAC works, in Baniyas, Abu Dhabi, comprising a manager's office, two work rooms, a meeting room, two bathrooms, a service pantry and an archive. Spaces were arranged to serve workflow, privacy and meetings efficiently, with a visual identity that reflects the company's professionalism. Designed and executed by Eng. Ahmad Almobayed and Dream Studio — an example of office and commercial interior design in Abu Dhabi.",
    description:
      "Office for Aysco company specialized in HVAC works: manager's office, two work rooms, meeting room, two bathrooms, service pantry and archive.",
    location: "Abu Dhabi, Baniyas",
    year: 2025,
    status: "Design and Execution Completed",
    category: "Commercial",
  },
];
export const enProjects = enInitialProjects.map(withProjectImages);

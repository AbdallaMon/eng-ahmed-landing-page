import { arFullName, enFullName, siteEmail } from "./constants";

// Shared bullets for EN; AR has its own localized list below
const infoUseList = [
  "Provide and operate the Service",
  "Authenticate users and keep accounts secure",
  "Create calendar events you request after you connect Google",
  "Improve performance and reliability",
  "Prevent fraud, abuse, and unauthorized access",
  "Comply with legal obligations",
];

const arInfoUseList = [
  "تقديم وتشغيل الخدمة",
  "توثيق المستخدمين وحماية الحسابات",
  "إنشاء أحداث التقويم التي تطلبها بعد ربط Google (اختياري)",
  "تحسين الأداء والاعتمادية",
  "منع الاحتيال أو سوء الاستخدام أو الوصول غير المصرح",
  "الامتثال للالتزامات القانونية",
];

export const arPrivacy = {
  title: "سياسة الخصوصية",
  brand: `${arFullName} (مالك DreamStudiio)`,
  effectiveDate: "15 ديسمبر 2025",
  intro:
    'نحترم خصوصيتك. توضح هذه السياسة ما نجمعه من معلومات وكيف نستخدمها وما هي اختياراتك عند استخدامك لموقعنا وخدماتنا ("الخدمة").',
  sections: [
    {
      id: "information",
      title: "1) المعلومات التي نجمعها",
      subSections: [
        {
          title: "أ) معلومات الحساب والتواصل",
          body: [
            "عند إنشاء حساب أو تسجيل الدخول، قد نجمع اسمك وبريدك الإلكتروني وصورتك الشخصية إن وفرها مزود تسجيل الدخول.",
          ],
        },
        {
          title: "ب) بيانات حساب Google (في حال الربط)",
          body: [
            'الربط مع Google اختياري. عند الضغط على "الربط مع Google" نطلب صلاحية تقويم Google اللازمة لإنشاء أو حذف الأحداث في تقويمك للاجتماعات المؤكدة فقط. لا نقرأ بريدك أو جهات الاتصال أو باقي بياناتك.',
            "التفاصيل التي نرسلها للأحداث مقتصرة على ما تزوده به (عنوان، وقت، بريد المدعو إن أدخلته). لا نبيع بيانات Google ولا نستخدمها للإعلانات.",
          ],
        },
        {
          title: "ج) بيانات الاستخدام والتقنية",
          body: [
            "قد نجمع بيانات تقنية أساسية لأغراض الأمان والتحليلات مثل عنوان الـ IP، معلومات الجهاز/المتصفح، وسجلات التصفح (الصفحات/الأفعال).",
          ],
        },
      ],
    },
    {
      id: "usage",
      title: "2) كيف نستخدم المعلومات",
      list: arInfoUseList,
    },
    {
      id: "google",
      title: "3) استخدام بيانات Google وقيود الاستخدام",
      body: [
        "إذا وصلت خدمتنا إلى بيانات مستخدم Google فنحن نستخدمها فقط لتقديم الميزات التي تطلبها. لا نستخدم بيانات Google لبناء ملفات إعلانية، لا نبيع بيانات Google لأطراف ثالثة، ولا نسمح للبشر بقراءة بياناتك إلا بطلبك وموافقتك الصريحة للدعم، أو للامتثال القانوني أو الأمان أو صيانة الخدمة.",
        "يمكنك فصل حساب Google في أي وقت من داخل الخدمة (إن توفرت) أو من صفحة أذونات حسابك في Google؛ نتوقف عن إنشاء الأحداث فور الفصل.",
        "لا نعدّل أو نحذف أي أحداث موجودة في Google Calendar؛ نقوم فقط بإنشاء الأحداث الجديدة التي تطلبها.",
        "يمكنك إلغاء الصلاحية مباشرة من https://myaccount.google.com/permissions.",
      ],
    },
    {
      id: "sharing",
      title: "4) مشاركة المعلومات",
      body: [
        "قد نشارك المعلومات مع مزودي الخدمة (الاستضافة، الرصد) حسب الحاجة لتشغيل الخدمة، الامتثال القانوني، أو حماية الخدمة والمستخدمين. لا نبيع البيانات الشخصية.",
      ],
    },
    {
      id: "retention",
      title: "5) الاحتفاظ بالبيانات",
      body: [
        "نحتفظ بالبيانات الشخصية فقط طالما كانت ضرورية لتقديم الخدمة والامتثال للمتطلبات القانونية وحل النزاعات وإنفاذ الاتفاقيات. يمكنك طلب حذف حسابك وبياناته بالتواصل معنا.",
      ],
    },
    {
      id: "security",
      title: "6) الأمان",
      body: [
        "نطبق تدابير تقنية وتنظيمية معقولة لحماية بياناتك بما في ذلك ضوابط الوصول والتشفير حيثما كان مناسبًا. لا توجد وسيلة نقل أو تخزين آمنة بنسبة 100٪.",
      ],
    },
    {
      id: "rights",
      title: "7) اختياراتك وحقوقك",
      list: [
        "فصل حساب Google في أي وقت (من داخل الخدمة إن توفرت، أو من صفحة أذونات حساب Google).",
        "طلب الوصول لبياناتك أو تصحيحها أو حذفها عبر التواصل معنا.",
      ],
    },
    {
      id: "children",
      title: "8) خصوصية الأطفال",
      body: [
        "الخدمة غير موجهة للأطفال دون 13 عامًا ولا نجمع عمدًا معلومات شخصية منهم.",
      ],
    },
    {
      id: "transfers",
      title: "9) التحويلات الدولية",
      body: [
        "قد تُعالج بياناتك في دول يعمل فيها مزودو الخدمة لدينا. نتخذ خطوات لضمان وجود ضوابط مناسبة.",
      ],
    },
    {
      id: "changes",
      title: "10) التغييرات على هذه السياسة",
      body: [
        "قد نحدّث سياسة الخصوصية من وقت لآخر. سنحدّث تاريخ السريان وقد نخطرك داخل الخدمة.",
      ],
    },
    {
      id: "contact",
      title: "11) تواصل معنا",
      body: [
        `${arFullName} – مالك DreamStudiio`,
        `البريد الإلكتروني: ${siteEmail}`,
      ],
    },
  ],
};

export const enPrivacy = {
  title: "Privacy Policy",
  brand: `${enFullName} (owner of DreamStudiio)`,
  effectiveDate: "December 15, 2025",
  intro:
    "We respect your privacy. This policy explains what we collect, how we use it, and your choices when you use our website and services (the “Service”).",
  sections: [
    {
      id: "information",
      title: "1) Information We Collect",
      subSections: [
        {
          title: "A) Account & Contact Information",
          body: [
            "When you sign in or create an account, we may collect your name, email address, and profile picture (if provided by your sign-in provider).",
          ],
        },
        {
          title: "B) Google Account Data (If you connect Google)",
          body: [
            "Connecting Google is optional. When you tap “Link with Google”, we request only the Google Calendar permission needed to create or delete events on your calendar for confirmed meetings you ask us to place. We do not read your Gmail, contacts, or other data.",
            "Event details we send are limited to what you provide (title, date/time, attendee email if entered). We do not sell your Google data and we do not use it for advertising.",
          ],
        },
        {
          title: "C) Usage & Technical Data",
          body: [
            "We may collect basic technical data for security and analytics such as IP address, device/browser information, and log data (timestamps, pages/actions).",
          ],
        },
      ],
    },
    {
      id: "usage",
      title: "2) How We Use Information",
      list: infoUseList,
    },
    {
      id: "google",
      title: "3) Google API Data Use & Limited Use",
      body: [
        "If our Service accesses Google user data, we only use that data to provide the features you request. We do not use Google data to build advertising profiles, we do not sell Google data to third parties, and we do not allow humans to read your Google data unless you explicitly request support and consent, or it is required for security, legal compliance, or to maintain the Service.",
        "You can disconnect Google at any time from within our app (if available) or from your Google Account permissions page; we stop creating events once you disconnect.",
        "We never modify or delete existing Google Calendar events—only create the new ones you ask us to add.",
        "You can revoke access anytime at https://myaccount.google.com/permissions.",
      ],
    },
    {
      id: "sharing",
      title: "4) Sharing of Information",
      body: [
        "We may share information only with service providers (hosting, logging/monitoring) as needed to run the Service, for legal compliance, or to protect the Service and users. We do not sell personal data.",
      ],
    },
    {
      id: "retention",
      title: "5) Data Retention",
      body: [
        "We retain personal data only as long as needed to provide the Service, meet legal requirements, resolve disputes, and enforce agreements. You can request deletion of your account and associated data by contacting us.",
      ],
    },
    {
      id: "security",
      title: "6) Security",
      body: [
        "We use reasonable technical and organizational measures to protect your data, including access controls and encryption where appropriate. No method of transmission or storage is 100% secure.",
      ],
    },
    {
      id: "rights",
      title: "7) Your Choices & Rights",
      list: [
        "Disconnect your Google account at any time (from within the Service if available, or from your Google Account permissions page).",
        "Request access, correction, or deletion of your data by contacting us.",
      ],
    },
    {
      id: "children",
      title: "8) Children’s Privacy",
      body: [
        "Our Service is not intended for children under 13, and we do not knowingly collect personal information from children.",
      ],
    },
    {
      id: "transfers",
      title: "9) International Transfers",
      body: [
        "Your data may be processed in countries where our service providers operate. We take steps to ensure appropriate safeguards are in place.",
      ],
    },
    {
      id: "changes",
      title: "10) Changes to This Policy",
      body: [
        "We may update this Privacy Policy from time to time. We will update the “Effective date” above and may notify you within the Service.",
      ],
    },
    {
      id: "contact",
      title: "11) Contact Us",
      body: [`${enFullName} – owner of DreamStudiio`, `Email: ${siteEmail}`],
    },
  ],
};

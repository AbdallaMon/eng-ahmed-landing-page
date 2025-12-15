import { arFullName, enFullName, siteEmail } from "./constants";

export const arTerms = {
  title: "شروط الخدمة",
  brand: `${arFullName} (مالك DreamStudiio)`,
  effectiveDate: "15 ديسمبر 2025",
  intro:
    'هذه الشروط تحكم استخدامك لموقعنا وخدماتنا ("الخدمة"). بالاستخدام، أنت توافق على هذه الشروط بالكامل. إذا لم توافق، يرجى عدم استخدام الخدمة.',
  sections: [
    {
      id: "acceptance",
      title: "1) قبول الشروط",
      body: [
        "بزيارتك وتسجيلك في الخدمة، أنت توافق على الالتزام بجميع الشروط والأحكام الواردة هنا.",
        "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات تصبح نافذة فور نشرها على الموقع.",
      ],
    },
    {
      id: "use",
      title: "2) استخدام الخدمة",
      body: [
        "أنت توافق على استخدام الخدمة فقط للأغراض المشروعة وبما يتفق مع هذه الشروط.",
        "لا يجب عليك:",
        "• القيام بأي نشاط احتيالي أو غير قانوني",
        "• محاولة الوصول غير المصرح إلى الخدمة أو أنظمتنا",
        "• نقل أو توزيع محتوى الخدمة بدون إذن",
        "• استخدام الخدمة لإرسال محتوى مسيء أو مزعج",
      ],
    },
    {
      id: "accounts",
      title: "3) حسابات المستخدمين",
      body: [
        "أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة مرورك.",
        "أنت توافق على تقديم معلومات دقيقة وصحيحة عند التسجيل.",
        "أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك.",
      ],
    },
    {
      id: "booking",
      title: "4) حجوزات المشاريع والاستشارات",
      body: [
        "عند حجزك لمشروع أو استشارة، أنت توافق على الشروط المتعلقة بالحجز (التواريخ، الأسعار، الشروط).",
        "التأكيدات تتم عبر البريد الإلكتروني أو رسائل أخرى من الخدمة.",
        "قد تطلب منك الخدمة معلومات إضافية لتأكيد الحجز.",
      ],
    },
    {
      id: "google",
      title: "5) ربط Google Calendar (اختياري)",
      body: [
        "ربط Google Calendar اختياري تماماً.",
        "بالربط، تمنح الخدمة صلاحية محدودة لإنشاء أو حذف الأحداث في تقويمك فقط.",
        "لا نصل إلى أي بيانات أخرى في حسابك على Google.",
        "يمكنك فصل الربط في أي وقت من إعدادات حسابك أو من أذونات Google.",
      ],
    },
    {
      id: "content",
      title: "6) الملكية الفكرية",
      body: [
        `جميع محتوى الخدمة (النصوص والصور والتصاميم) ملك ${arFullName} أو مرخص له.`,
        "لا يسمح بنسخ أو إعادة نشر أو توزيع أي محتوى من الخدمة بدون إذن خطي.",
        `جميع مشاريع وتصاميم ${arFullName} محمية بموجب قوانين الملكية الفكرية.`,
      ],
    },
    {
      id: "limitation",
      title: "7) تحديد المسؤولية",
      body: [
        'الخدمة تُقدم "على حالتها" بدون ضمانات من أي نوع.',
        "في أقصى الحدود المسموحة قانوناً، لا نتحمل مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناجمة عن استخدام الخدمة.",
        "لا نتحمل مسؤولية عن خسائر الأرباح أو البيانات الناجمة عن توقف الخدمة.",
      ],
    },
    {
      id: "indemnity",
      title: "8) تعويض",
      body: [
        `أنت توافق على تعويض ${arFullName} عن أي مطالبات أو نزاعات ناشئة عن انتهاكك لهذه الشروط.`,
      ],
    },
    {
      id: "termination",
      title: "9) إنهاء الخدمة",
      body: [
        "يمكننا إنهاء أو إعلق حسابك في أي وقت إذا انتهكت الشروط أو للأسباب التالية:",
        "• الأنشطة غير القانونية أو المسيئة",
        "• انتهاك حقوق الملكية الفكرية",
        "• الاحتيال أو التضليل",
      ],
    },
    {
      id: "changes",
      title: "10) التعديلات على الخدمة",
      body: [
        "نحتفظ بالحق في تعديل أو إيقاف أي جزء من الخدمة في أي وقت.",
        "لن نكون مسؤولين عن أي خسائر أو أضرار ناجمة عن التعديلات أو الإيقاف.",
      ],
    },
    {
      id: "governing",
      title: "11) القانون الحاكم",
      body: [
        "هذه الشروط تحكمها القوانين المعمول بها، وتخضع لاختصاص المحاكم المختصة.",
      ],
    },
    {
      id: "contact",
      title: "12) تواصل معنا",
      body: [
        `${arFullName} – مالك DreamStudiio`,
        `البريد الإلكتروني: ${siteEmail}`,
        "إذا كان لديك أسئلة حول هذه الشروط، يرجى التواصل معنا.",
      ],
    },
  ],
};

export const enTerms = {
  title: "Terms of Service",
  brand: `${enFullName} (owner of DreamStudiio)`,
  effectiveDate: "December 15, 2025",
  intro:
    'These Terms govern your use of our website and services ("Service"). By using the Service, you agree to all terms and conditions herein. If you do not agree, please do not use the Service.',
  sections: [
    {
      id: "acceptance",
      title: "1) Acceptance of Terms",
      body: [
        "By accessing and registering with the Service, you agree to be bound by all terms and conditions contained herein.",
        "We reserve the right to modify these terms at any time. Modifications become effective upon posting to the website.",
      ],
    },
    {
      id: "use",
      title: "2) Use of Service",
      body: [
        "You agree to use the Service only for lawful purposes and in accordance with these terms.",
        "You must not:",
        "• Engage in any fraudulent or illegal activity",
        "• Attempt unauthorized access to the Service or our systems",
        "• Transfer or distribute Service content without permission",
        "• Use the Service to send abusive, offensive, or harassing content",
      ],
    },
    {
      id: "accounts",
      title: "3) User Accounts",
      body: [
        "You are responsible for maintaining the confidentiality of your account credentials and password.",
        "You agree to provide accurate and truthful information during registration.",
        "You are responsible for all activities that occur under your account.",
      ],
    },
    {
      id: "booking",
      title: "4) Project & Consultation Bookings",
      body: [
        "When you book a project or consultation, you agree to the terms of the booking (dates, pricing, conditions).",
        "Confirmations are sent via email or other messages from the Service.",
        "The Service may request additional information to confirm your booking.",
      ],
    },
    {
      id: "google",
      title: "5) Google Calendar Linking (Optional)",
      body: [
        "Google Calendar linking is entirely optional.",
        "By linking, you grant the Service limited permission to create or delete events on your calendar only.",
        "We do not access any other data in your Google account.",
        "You can disconnect at any time from your account settings or Google permissions.",
      ],
    },
    {
      id: "content",
      title: "6) Intellectual Property",
      body: [
        `All Service content (text, images, designs) is owned by or licensed to ${enFullName}.`,
        "Copying, republishing, or distributing any Service content without written permission is prohibited.",
        `All projects and designs by ${enFullName} are protected under intellectual property laws.`,
      ],
    },
    {
      id: "limitation",
      title: "7) Limitation of Liability",
      body: [
        'The Service is provided "as is" without any warranties of any kind.',
        "To the maximum extent permitted by law, we are not liable for any direct or indirect damages arising from your use of the Service.",
        "We are not responsible for loss of profits or data resulting from Service downtime.",
      ],
    },
    {
      id: "indemnity",
      title: "8) Indemnification",
      body: [
        `You agree to indemnify ${enFullName} against any claims or disputes arising from your violation of these terms.`,
      ],
    },
    {
      id: "termination",
      title: "9) Service Termination",
      body: [
        "We may terminate or suspend your account at any time if you violate these terms or for the following reasons:",
        "• Illegal or abusive activities",
        "• Intellectual property infringement",
        "• Fraud or misrepresentation",
      ],
    },
    {
      id: "changes",
      title: "10) Service Modifications",
      body: [
        "We reserve the right to modify or discontinue any part of the Service at any time.",
        "We are not liable for any loss or damage resulting from modifications or discontinuation.",
      ],
    },
    {
      id: "governing",
      title: "11) Governing Law",
      body: [
        "These terms are governed by applicable law and subject to the jurisdiction of the competent courts.",
      ],
    },
    {
      id: "contact",
      title: "12) Contact Us",
      body: [
        `${enFullName} – owner of DreamStudiio`,
        `Email: ${siteEmail}`,
        "If you have questions about these terms, please contact us.",
      ],
    },
  ],
};

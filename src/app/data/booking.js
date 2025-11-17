export const arBooking = {
  title: "احجز اجتماع مع م.أحمد المبيض",
  subTitle: "تخطيط - تصميم - تنفيذ - استشارات",
  inputs: [
    {
      label: "الاسم",
      placeholder: "أدخل اسمك الكامل",
      type: "text",
      id: "name",
      isRequired: true,
    },
    {
      label: "الهاتف",
      placeholder: "أدخل رقم هاتفك",
      type: "tel",
      id: "phone",
      isRequired: true,
    },
    {
      label: "البريد الإلكتروني",
      placeholder: "أدخل بريدك الإلكتروني",
      type: "email",
      id: "email",
      isRequired: true,
    },
  ],
  buttonText: "احجز الأن مجانا",
  callToActionText: {
    light: "وقتك ووقتنا ثمين، في حال لم نتمكن من تقديم الحل المناسب لك، ",
    highlight: "سيتم استرجاع المبلغ المدفوع بالكامل.",
  },
};

export const enBooking = {
  title: "Book a Meeting with Eng. Ahmed Almobayd",
  subTitle: "Planning - Design - Implementation - Consultation",
  inputs: [
    {
      label: "Name",
      placeholder: "Enter your full name",
      type: "text",
      id: "name",
      isRequired: true,
    },
    {
      label: "Phone",
      placeholder: "Enter your phone number",
      type: "tel",
      id: "phone",
      isRequired: true,
    },
    {
      label: "Email",
      placeholder: "Enter your email address",
      type: "email",
      id: "email",
      isRequired: true,
    },
  ],
  buttonText: "Book Now for Free",
  callToActionText: {
    light:
      "Your time and ours are valuable, if we cannot provide the right solution for you, ",
    highlight: "the full amount paid will be refunded.",
  },
};

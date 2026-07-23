import { arFullName, pageLanguages, siteEmail } from "./constants";

export const arNavigations = [
  { label: "الرئيسية", href: "/", type: "HREF" },
  { label: "المشاريع", href: "/projects", type: "HREF" },
  {
    label: "التواصل",
    //redirect to eng email
    href: `mailto:${siteEmail}?subject=استشارة%20مع%20المهندس%20أحمد&body=مرحباً%20المهندس%20أحمد%2C%0A%0Aأود%20أن%20أستشيرك%20في%20...`,
    type: "HREF",
  },
  { label: "الخصوصية", href: "/privacy", type: "HREF" },
  { label: "الشروط", href: "/terms", type: "HREF" },
];
export const enNavigations = [
  { label: "Home", href: "/", type: "HREF" },
  { label: "Projects", href: "/projects", type: "HREF" },
  {
    label: "Contact",
    //redirect to eng email
    href: `mailto:${siteEmail}?subject=Consultation%20with%20Engineer%20Ahmed&body=Hello%20Engineer%20Ahmed%2C%0A%0AI%20would%20like%20to%20consult%20you%20about%20...`,
    type: "HREF",
  },
  { label: "Privacy", href: "/privacy", type: "HREF" },
  { label: "Terms", href: "/terms", type: "HREF" },
];

export const languagesSelector = {
  title: "",
  type: "SELECTOR",
  options: pageLanguages,
};

export const arNavbar = [...arNavigations, languagesSelector];
export const enNavbar = [...enNavigations, languagesSelector];
export const arFooterNavigations = [...arNavigations];
export const enFooterNavigations = [...enNavigations];

export const arCopyRightText = {
  title: `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${arFullName}`,
  developerName: "عبدالله عبدالصبور",
};
export const enCopyRightText = {
  title: `All rights reserved © ${new Date().getFullYear()} ${arFullName}`,
  developerName: "Abdalla Abdelsabour",
};
export const arFooter = {
  navigations: arFooterNavigations,
  copyRight: arCopyRightText,
};

export const enFooter = {
  navigations: enFooterNavigations,
  copyRight: enCopyRightText,
};

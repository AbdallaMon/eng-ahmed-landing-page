import { arFullName, pageLanguages } from "./constants";

export const arNavigations = [
  { label: "الرئيسية", href: "/", type: "HREF" },
  { label: "المشاريع", href: "/projects", type: "HREF" },
  { label: "التواصل", href: "/contact", type: "HREF" },
];
export const enNavigations = [
  { label: "Home", href: "/", type: "HREF" },
  { label: "Projects", href: "/projects", type: "HREF" },
  { label: "Contact", href: "/contact", type: "HREF" },
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
  subTitle: `تم تطوير بواسطة`,
};
export const enCopyRightText = {
  title: `All rights reserved © ${new Date().getFullYear()} ${arFullName}`,
  subTitle: `Developed by`,
};
export const arFooter = {
  navigations: arFooterNavigations,
  copyRight: arCopyRightText,
};

export const enFooter = {
  navigations: enFooterNavigations,
  copyRight: enCopyRightText,
};

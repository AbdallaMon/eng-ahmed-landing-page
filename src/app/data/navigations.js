import { arFullName, pageLanguages } from "./constants";

export const arNavigations = [
  { title: "الرئيسية", path: "/", type: "HREF" },
  { title: "المشاريع", path: "/projects", type: "HREF" },
  { title: "التواصل", path: "/contact", type: "HREF" },
];
export const enNavigations = [
  { title: "Home", path: "/", type: "HREF" },
  { title: "Projects", path: "/projects", type: "HREF" },
  { title: "Contact", path: "/contact", type: "HREF" },
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

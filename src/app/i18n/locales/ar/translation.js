import { arAboutData } from "@/app/data/about";
import { arBeforeAndAfter } from "@/app/data/BeforeAndAfter";
import { arButtons } from "@/app/data/buttons";
import { arCompanies } from "@/app/data/companies";

import { arFollowMeText } from "@/app/data/constants";
import { arFaq } from "@/app/data/FAQData";
import { arHero } from "@/app/data/hero";
import { arFooter, arNavbar } from "@/app/data/navigations";
import { arOurNumbersData } from "@/app/data/our-numbers";
import { arProjects } from "@/app/data/projects";
import { arStages } from "@/app/data/stages";
import { arSuccessJourney } from "@/app/data/successJourney";
import { arTestmonials } from "@/app/data/testmonials";
import { arTranslatingIdeas } from "@/app/data/translating-ideas";
import { arVisionData } from "@/app/data/vision";

const translation = {
  navBar: arNavbar,
  hero: arHero,
  vission: arVisionData,
  about: arAboutData,
  followMe: arFollowMeText,
  stages: arStages,
  companies: arCompanies,
  ourNumbers: arOurNumbersData,
  beforeAndAfter: arBeforeAndAfter,
  projects: arProjects,
  translatingIdeasSection: arTranslatingIdeas,
  successJourney: arSuccessJourney,
  testmonails: arTestmonials,
  faqs: arFaq,
  footer: arFooter,
  buttons: arButtons,
};
export default translation;

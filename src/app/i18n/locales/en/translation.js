import { enAboutData } from "@/app/data/about";
import { enBeforeAndAfter } from "@/app/data/BeforeAndAfter";
import { enBooking } from "@/app/data/booking";
import { enButtons } from "@/app/data/buttons";
import { enCompanies } from "@/app/data/companies";
import { enFollowMeText } from "@/app/data/constants";
import { enFaq } from "@/app/data/FAQData";
import { enHero } from "@/app/data/hero";
import { enBookAndCoursesData, enMainPageData } from "@/app/data/mainPage";
import { enMetaData } from "@/app/data/meta";
import { enFooter, enNavbar } from "@/app/data/navigations";
import { enOurNumbersData } from "@/app/data/our-numbers";
import { enProjects } from "@/app/data/projects";
import { enStages } from "@/app/data/stages";
import { enSuccessJourney } from "@/app/data/successJourney";
import { enTestmonials } from "@/app/data/testmonials";
import { enTranslatingIdeas } from "@/app/data/translating-ideas";
import { enVisionData } from "@/app/data/vision";

const translation = {
  navBar: enNavbar,
  main: enMainPageData,
  bookAndCourses: enBookAndCoursesData,
  hero: enHero,
  vission: enVisionData,
  about: enAboutData,
  followMe: enFollowMeText,
  stages: enStages,
  companies: enCompanies,
  ourNumbers: enOurNumbersData,
  beforeAndAfter: enBeforeAndAfter,
  projects: enProjects,
  translatingIdeasSection: enTranslatingIdeas,
  successJourney: enSuccessJourney,
  testmonails: enTestmonials,
  faqs: enFaq,
  booking: enBooking,
  footer: enFooter,
  buttons: enButtons,
  meta: enMetaData,
};
export default translation;

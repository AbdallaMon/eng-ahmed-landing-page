import { cookies } from "next/headers";
import { getTranslation } from "../i18n";

export async function generateMetadata({ params }) {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return metaData.aboutPage;
}

export default async function AboutLayout({ children, params }) {
  return children;
}

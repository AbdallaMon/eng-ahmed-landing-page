import { HeroBanner } from "../component/HeroBanner";
import { getTranslation } from "../i18n";

export async function Hero({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("hero", { returnObjects: true });
  return <HeroBanner data={data} lng={lng} />;
}

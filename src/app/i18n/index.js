import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions } from "./settings";

export async function getTranslation(lng, ns = "translation") {
  const i18nInstance = createInstance();

  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend((language) => {
        return import(`@/app/i18n/locales/${language}/${ns}.js`);
      })
    )
    .init(getOptions(lng));

  return {
    t: i18nInstance.getFixedT(lng),
    i18n: i18nInstance,
  };
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";
import hu from "@/locales/hu.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: { translation: en },
      hu: { translation: hu },
    },
  });

export default i18n;

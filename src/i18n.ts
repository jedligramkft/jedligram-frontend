import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hu from './locales/hu.json';
import en from './locales/en.json';

const resources = {
  hu: { translation: hu },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'hu',
    fallbackLng: 'hu',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import bgCommon from '../../public/locales/bg/common.json';
import enCommon from '../../public/locales/en/common.json';

const resources = {
  bg: {
    common: bgCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'bg', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n; 
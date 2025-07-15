const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    localeDetection: false,
  },
  defaultNS: 'common',
  ns: ['common'],
  fallbackLng: 'bg',
  localePath: path.resolve('./public/locales'),
}; 
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    localeDetection: false,
  },
  localePath: typeof window === 'undefined' 
    ? path.join(process.cwd(), 'public', 'locales')
    : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

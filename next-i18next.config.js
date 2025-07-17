module.exports = {
  i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    localeDetection: true,
  },
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

// next-i18next.config.js
module.exports = {
    i18n: {
    defaultLocale: 'bg',
    locales: ['bg', 'en'],
    },
    localePath: './public/locales',
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};
  
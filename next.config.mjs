/** @type {import('next').NextConfig} */
/** @type {import('next-i18next').UserConfig} */

const nextConfig = {
     i18n: {
    locales: ['bg', 'en'],
    defaultLocale: 'bg',
    localeDetection: false 
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};


export default nextConfig;

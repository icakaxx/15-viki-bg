/** @type {import('next').NextConfig} */
/** @type {import('next-i18next').UserConfig} */

const nextConfig = {
  i18n: {
    locales: ['bg', 'en'],
    defaultLocale: 'bg',
    localeDetection: false 
  },
};

export default nextConfig;

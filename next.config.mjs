/** @type {import('next').NextConfig} */
import nextI18NextConfig from './next-i18next.config.js';

const nextConfig = {
  // Force Pages Router mode
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nticlbmuetfeuwkkukwz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  i18n: nextI18NextConfig.i18n,
  
  // Include next-i18next config in serverless function bundle (required for Vercel)
  outputFileTracingIncludes: {
    '/*': ['./next-i18next.config.js', './public/locales/**/*'],
  },
  
  // Redirect from home page to /buy
  async redirects() {
    return [
      {
        source: '/',
        destination: '/buy',
        permanent: false, // Use 307 temporary redirect
      },
      {
        source: '/solutions/air_conditioning',
        destination: '/buy',
        permanent: false, // Fix broken solution path (air_conditioning → buy)
      },
    ];
  },
};

export default nextConfig;

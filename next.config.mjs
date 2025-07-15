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
};

export default nextConfig;

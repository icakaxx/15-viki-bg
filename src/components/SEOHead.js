import Head from 'next/head';
import { useContext } from 'react';
import { LanguageContext } from './Layout Components/Header';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  noIndex = false 
}) => {
  const { locale } = useContext(LanguageContext) || { locale: 'bg' };

  const fullTitle = title ? `${title} - BGVIKI15 Ltd` : 'BGVIKI15 Ltd - Air Conditioning & Climate Solutions';
  const fullDescription = description || 'Quality and reliable air conditioning solutions since 2000. Air conditioners, climate control and energy efficient solutions in Bulgaria.';
  const fullKeywords = keywords || (locale === 'bg' ? 
    'климатици, климатизация, БГВИКИ15, България, енергийна ефективност' : 
    'air conditioning, climate control, BGVIKI15, Bulgaria, energy efficiency'
  );
  const fullImage = image || '/images/bgVIKI15-eood.jpg';
  const fullUrl = url || 'https://bgviki15.bg';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content="БГВИКИ15 ЕООД" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:locale" content={locale === 'bg' ? 'bg_BG' : 'en_US'} />
      <meta property="og:site_name" content="BGVIKI15 Ltd" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <html lang={locale} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
    </Head>
  );
};

export default SEOHead; 
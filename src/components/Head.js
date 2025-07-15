import NextHead from 'next/head';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const Head = ({ 
  titleKey = 'metaTitle',
  descriptionKey = 'metaDescription',
  customTitle = null,
  customDescription = null
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const locale = router.locale || 'bg';

  // Use custom values if provided, otherwise use translations
  const title = customTitle || t(titleKey);
  const description = customDescription || t(descriptionKey);
  
  // Set language attribute based on current locale
  const htmlLang = locale === 'bg' ? 'bg' : 'en';

  return (
    <NextHead>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <html lang={htmlLang} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={locale === 'bg' ? 'bg_BG' : 'en_US'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Additional SEO meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="БГВИКИ15 ЕООД" />
      <meta name="keywords" content={locale === 'bg' ? 
        'климатици, климатизация, БГВИКИ15, България, енергийна ефективност' : 
        'air conditioning, climate control, BGVIKI15, Bulgaria, energy efficiency'
      } />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
    </NextHead>
  );
};

export default Head; 
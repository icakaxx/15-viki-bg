import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/Page Styles/NotFoundPage.module.css';

const NotFoundPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const locale = router.locale || 'bg';
  const isBg = locale === 'bg';

  return (
    <>
      <Head>
        <title>{isBg ? '404 - Страницата не е намерена' : '404 - Page Not Found'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>
            {isBg ? 'Страницата не е намерена' : 'Page Not Found'}
          </h1>
          <p className={styles.description}>
            {isBg 
              ? 'Съжаляваме, но страницата, която търсите, не съществува или е преместена.' 
              : 'Sorry, the page you are looking for does not exist or has been moved.'}
          </p>
          
          <div className={styles.actions}>
            <Link href="/" className={styles.homeButton}>
              {isBg ? 'Върнете се към началната страница' : 'Return to Home Page'}
            </Link>
            <Link href="/products" className={styles.secondaryButton}>
              {isBg ? 'Разгледайте нашите продукти' : 'Browse Our Products'}
            </Link>
          </div>

          <div className={styles.helpSection}>
            <p className={styles.helpText}>
              {isBg 
                ? 'Можете да се върнете към началната страница или да разгледате нашите продукти и услуги.' 
                : 'You can return to the home page or browse our products and services.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
    },
  };
}

export default NotFoundPage;


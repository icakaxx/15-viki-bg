import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LanguageContext } from '../components/Layout Components/Header';
import styles from '../styles/Page Styles/index.module.css';

const HomePage = () => {
  const { t } = useContext(LanguageContext);

  return (
    <>
      <Head>
        <title>{t('metaTitle')}</title>
        <meta name="description" content={t('metaDescription')} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={t('metaTitle')} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="og:type" content="website" />
      </Head>
      
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {t('hero.title')}
            </h1>
            <p className={styles.heroSubtitle}>
              {t('hero.subtitle')}
            </p>
            <div className={styles.heroActions}>
              <Link href="/buy" className={styles.primaryButton}>
                {t('hero.shopNow')}
              </Link>
              <Link href="/buy" className={styles.secondaryButton}>
                {t('hero.learnMore')}
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src="/images/bgVIKI15-eood.jpg" 
              alt={t('company.name')}
              className={styles.companyLogo}
            />
          </div>
        </section>

        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>{t('features.title')}</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3>{t('features.quality.title')}</h3>
              <p>{t('features.quality.description')}</p>
            </div>
            <div className={styles.featureCard}>
              <h3>{t('features.service.title')}</h3>
              <p>{t('features.service.description')}</p>
            </div>
            <div className={styles.featureCard}>
              <h3>{t('features.experience.title')}</h3>
              <p>{t('features.experience.description')}</p>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.description')}</p>
          <Link href="/buy" className={styles.ctaButton}>
            {t('cta.button')}
          </Link>
        </section>
      </div>
    </>
  );
};

export default HomePage;
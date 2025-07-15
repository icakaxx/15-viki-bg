import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { solutions } from "../lib/solutionsData";
import styles from '../styles/Page Styles/Products.module.css';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const ProductsPage = () => {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  const services = [
    {
      title: t('productsPage.services.consultation.title'),
      description: t('productsPage.services.consultation.description'),
      image: '/images/products/consultation.jpg'    },
    {
      title: t('productsPage.services.installation.title'),
      description: t('productsPage.services.installation.description'),
      image: '/images/products/ACInstall.jpg'
    },
    {
      title: t('productsPage.services.maintenance.title'),
      description: t('productsPage.services.maintenance.description'),
      image: '/images/products/maintenance.jpg'    },
    {
      title: t('productsPage.services.warranty.title'),
      description: t('productsPage.services.warranty.description'),
      image: '/images/products/warranty.jpg'    }
  ];

  return (
    <>
      <Head>
        <title>{`${t('productsPage.title')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={t('productsPage.metaDescription')} />
        <meta name="robots" content="index, follow" />
      </Head>

      
      <div className={styles.container}>
        <h1 className={styles.title}>{t('productsPage.title')}</h1>
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#2c5530', marginBottom: '2rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
          {i18n.language === 'bg'
            ? 'Открийте най-добрите климатични решения и услуги за вашия дом или бизнес. Разгледайте нашите продукти и изберете най-подходящото за вас!'
            : 'Discover the best climate solutions and services for your home or business. Explore our products and find the perfect fit for your needs!'}
        </p>
        
        {/* Climate Solutions Section */}
        <section className={styles.solutionsSection}>
          <div className={styles.solutionsGrid}>
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className={styles.serviceCard}
              >
                <div className={styles.imageContainer}>
                  <img
                    src={solution.image}
                    alt={t(`${solution.translationKey}.title`)}
                    className={styles.serviceCardImage}
                  />
                </div>
                <h3 className={styles.serviceCardTitle}>
                  {t(`${solution.translationKey}.title`)}
                </h3>
                <p className={styles.serviceCardDescription}>
                  {t(`${solution.translationKey}.short`)}
                </p>
                <button
                  onClick={() => {
                    if (solution.id === 'air_conditioning') {
                      router.push('/buy');
                    } else {
                      router.push(`/solutions/${solution.id}`);
                    }
                  }}
                  className={styles.learnMoreButton}
                >
                  {i18n.language === "bg" ? "Научи повече" : "Learn More"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className={styles.servicesSection}>
          <h2 className={styles.servicesTitle}>
            {t('productsPage.services.title')}
          </h2>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceInfoCard}>
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.title}
                    className={styles.serviceCardImage}
                  />
                )}
                <h3 className={styles.serviceCardTitle}>{service.title}</h3>
                <p className={styles.serviceCardDescription}>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>{t('productsPage.cta.title')}</h2>
          <p className={styles.ctaSubtitle}>
            {t('productsPage.cta.subtitle')}
          </p>
          <div className={styles.ctaActions}>
            <Link href="/inquiry" className={styles.ctaInquiryButton}>
              {t('productsPage.cta.inquiry')}
            </Link>
            <Link href="/contact" className={styles.ctaContactButton}>
              {t('productsPage.cta.contact')}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductsPage; 
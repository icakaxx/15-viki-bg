import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { solutions } from "../lib/solutionsData";
import styles from '../styles/Page Styles/BuyPage.module.css';
import stylesIndex from "../styles/Page Styles/index.module.css";
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
      description: t('productsPage.services.consultation.description')
    },
    {
      title: t('productsPage.services.installation.title'),
      description: t('productsPage.services.installation.description')
    },
    {
      title: t('productsPage.services.maintenance.title'),
      description: t('productsPage.services.maintenance.description')
    },
    {
      title: t('productsPage.services.warranty.title'),
      description: t('productsPage.services.warranty.description')
    }
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
        
        {/* Hero Section */}
        <section style={{ marginBottom: '4rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            {t('productsPage.hero.title')}
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto 2rem' }}>
            {t('productsPage.hero.subtitle')}
          </p>
          <Link href="/buy" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            {t('productsPage.hero.cta')}
          </Link>
        </section>



        {/* Climate Solutions Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>{t("products_solutions_section_title", "Продукти и решения")}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "3rem",
              maxWidth: 1400,
              margin: "0 auto",
              padding: "2rem 1rem"
            }}
          >
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className="service-card"
              >
                <div className="image-container">
                  <img
                    src={solution.image}
                    alt={t(`${solution.translationKey}.title`)}
                  />
                </div>
                <h3>
                  {t(`${solution.translationKey}.title`)}
                </h3>
                <p className="description">
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
                >
                  {i18n.language === "bg" ? "Научи повече" : "Learn More"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
            {t('productsPage.services.title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {services.map((service, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#2c5530' }}>{service.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
          padding: '3rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('productsPage.cta.title')}</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
            {t('productsPage.cta.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/inquiry" style={{
              display: 'inline-block',
              background: 'white',
              color: '#2c5530',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              {t('productsPage.cta.inquiry')}
            </Link>
            <Link href="/contact" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              {t('productsPage.cta.contact')}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default ProductsPage; 
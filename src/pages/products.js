import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LanguageContext } from '../components/Layout Components/Header';
import styles from '../styles/Page Styles/BuyPage.module.css';

const ProductsPage = () => {
  const { t } = useContext(LanguageContext);

  const productCategories = [
    {
      title: t('productsPage.categories.residential.title'),
      description: t('productsPage.categories.residential.description'),
      features: [
        t('productsPage.categories.residential.features.split'),
        t('productsPage.categories.residential.features.multiSplit'),
        t('productsPage.categories.residential.features.inverter'),
        t('productsPage.categories.residential.features.wifi')
      ],
      image: "/images/placeholder-ac.svg"
    },
    {
      title: t('productsPage.categories.commercial.title'), 
      description: t('productsPage.categories.commercial.description'),
      features: [
        t('productsPage.categories.commercial.features.vrf'),
        t('productsPage.categories.commercial.features.cassette'),
        t('productsPage.categories.commercial.features.ducted'),
        t('productsPage.categories.commercial.features.central')
      ],
      image: "/images/placeholder-ac.svg"
    },
    {
      title: t('productsPage.categories.industrial.title'),
      description: t('productsPage.categories.industrial.description'),
      features: [
        t('productsPage.categories.industrial.features.chillers'),
        t('productsPage.categories.industrial.features.rooftop'),
        t('productsPage.categories.industrial.features.precision'),
        t('productsPage.categories.industrial.features.ventilation')
      ],
      image: "/images/placeholder-ac.svg"
    }
  ];

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

        {/* Product Categories */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
            {t('productsPage.categories.title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {productCategories.map((category, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={category.image} alt={category.title} style={{ maxWidth: '150px', opacity: '0.7' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>{category.title}</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>{category.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {category.features.map((feature, idx) => (
                    <li key={idx} style={{
                      padding: '0.5rem 0',
                      borderBottom: idx < category.features.length - 1 ? '1px solid #f0f0f0' : 'none',
                      color: '#555'
                    }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
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
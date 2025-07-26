import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/ContactPage.module.css';

const ContactPage = () => {
  const { t } = useTranslation('common');
  const [mapUrl, setMapUrl] = useState('');
  const contactInfo = [
    {
      icon: '📞',
      title: t('contactPage.info.phone.title'),
      details: t('contactPage.info.phone.details', { returnObjects: true }),
      description: t('contactPage.info.phone.description')
    },
    {
      icon: '✉️',
      title: t('contactPage.info.email.title'),
      details: t('contactPage.info.email.details', { returnObjects: true }),
      description: t('contactPage.info.email.description')
    },
    {
      icon: '📍',
      title: t('contactPage.info.address.title'),
      details: [t('contactPage.info.address.details.0'), t('contactPage.info.address.details.1')],
      description: t('contactPage.info.address.description')
    },
    {
      icon: '🕐',
      title: t('contactPage.info.hours.title'),
      details: [
        t('contactPage.info.hours.schedule.0'),
        t('contactPage.info.hours.schedule.1'),
        t('contactPage.info.hours.schedule.2')
      ],
      description: t('contactPage.info.hours.description')
    }
  ];

  // Main phone/email for quick actions
  const mainPhone = t('contactPage.info.phone.details', { returnObjects: true })[0] || '';
  const mainEmail = t('contactPage.info.email.details', { returnObjects: true })[0] || '';

  const departments = [
    {
      name: t('contactPage.departments.sales.name'),
      phone: mainPhone,
      email: mainEmail,
      description: t('contactPage.departments.sales.description')
    },
    {
      name: t('contactPage.departments.support.name'),
      phone: mainPhone,
      email: mainEmail,
      description: t('contactPage.departments.support.description')
    },
    {
      name: t('contactPage.departments.projects.name'),
      phone: mainPhone,
      email: mainEmail,
      description: t('contactPage.departments.projects.description')
    }
  ];

  useEffect(() => {
    fetch('/api/maps-embed-url')
      .then(res => res.json())
      .then(data => setMapUrl(data.url));
  }, []);

  return (
    <>
      <Head>
        <title>{`${t('contactPage.title')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={t('contactPage.metaDescription')} />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div className={styles.container}>
        
        {/* Hero Section */}
        <section style={{ marginBottom: '4rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
            {t('contactPage.hero.title')}
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            {t('contactPage.hero.subtitle')}
          </p>
        </section>

        {/* Contact Info Grid */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {contactInfo.map((info, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{info.icon}</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>{info.title}</h3>
                <div style={{ marginBottom: '1rem' }}>
                  {info.details.map((detail, idx) => (
                    info.title === t('contactPage.info.phone.title') ? (
                      <p key={idx} style={{ margin: '0.5rem 0', color: '#2c5530', fontWeight: '600', fontSize: '1.1rem' }}>
                        <a href={`tel:${detail.replace(/\s+/g, '')}`} className={styles.contactLink}>{detail}</a>
                      </p>
                    ) : info.title === t('contactPage.info.email.title') ? (
                      <p key={idx} style={{ margin: '0.5rem 0', color: '#2c5530', fontWeight: '600', fontSize: '1.1rem' }}>
                        <a href={`mailto:${detail}`} className={styles.contactLink}>{detail}</a>
                      </p>
                    ) : info.title === t('contactPage.info.address.title') && detail ? (
                      <p key={idx} style={{ margin: '0.5rem 0', color: '#2c5530', fontWeight: '600', fontSize: '1.1rem' }}>
                        <a href="https://maps.app.goo.gl/B74QyWSEYh1oV5Pk9" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>{detail}</a>
                      </p>
                    ) : (
                      <p key={idx} style={{ margin: '0.5rem 0', color: '#2c5530', fontWeight: '600', fontSize: '1.1rem' }}>{detail}</p>
                    )
                  ))}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{info.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Company Info */}
        <section style={{ marginBottom: '4rem' }}>
          <div className={styles.companyAndQuickWrapper}>
            {/* Company Details */}
            <div className={styles.companyCol}>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>{t('contactPage.company.title')}</h2>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#2c5530' }}>{t('contactPage.company.name')}</h3>
                <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '1rem' }}>
                  {t('contactPage.company.description1')}
                </p>
                <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '1rem' }}>
                  {t('contactPage.company.description2')}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>{t('contactPage.company.businessInfo.title')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong>{t('contactPage.company.businessInfo.eik')}</strong> 123456789<br />
                    <strong>{t('contactPage.company.businessInfo.vat')}</strong> BG123456789<br />
                    <strong>{t('contactPage.company.businessInfo.headquarters')}</strong> София, България
                  </div>
                  <div>
                    <strong>{t('contactPage.company.businessInfo.bank')}</strong> Уникредит Булбанк<br />
                    <strong>{t('contactPage.company.businessInfo.iban')}</strong> BG80UNCR76301234567890<br />
                    <strong>{t('contactPage.company.businessInfo.bic')}</strong> UNCRBGSF
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>{t('contactPage.company.certificates.title')}</h4>
                <ul style={{ paddingLeft: '1rem', color: '#666' }}>
                  <li>{t('contactPage.company.certificates.trading')}</li>
                  <li>{t('contactPage.company.certificates.refrigerant')}</li>
                  <li>{t('contactPage.company.certificates.iso')}</li>
                  <li>{t('contactPage.company.certificates.partners')}</li>
                </ul>
              </div>
            </div>

            {/* Quick Actions + Emergency Line Wrapper */}
            <div className={styles.quickAndEmergencyCol}>
              <div style={{
                background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '2rem'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('contactPage.quickContact.title')}</h3>
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ marginBottom: '1rem' }}>{t('contactPage.quickContact.subtitle')}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <a href={`tel:${mainPhone.replace(/\s+/g, '')}`} className={styles.contactButton}>
                      📞 {t('contactPage.quickContact.callNow')}
                    </a>
                    <a href={`mailto:${mainEmail}`} className={styles.contactButton}>
                      ✉️ {t('contactPage.quickContact.sendEmail')}
                    </a>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>{t('contactPage.emergency.title')}</h3>
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {t('contactPage.emergency.description')}
                </p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
                   <a href={`tel:${mainPhone.replace(/\s+/g, '')}`} className={styles.contactLink}>📞 {mainPhone}</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Departments */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
            {t('contactPage.departments.title')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {departments.map((dept, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2c5530' }}>{dept.name}</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>{dept.description}</p>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>{t('contactPage.info.phone.title')}:</strong> <a href={`tel:${dept.phone.replace(/\s+/g, '')}`} className={styles.contactLink}>{dept.phone}</a>
                  </p>
                  <p style={{ marginBottom: '0' }}>
                    <strong>Имейл:</strong> <a href={`mailto:${dept.email}`} className={styles.contactLink}>{dept.email}</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
            {t('contactPage.map.howToFindUs')}
          </h2>
          <div className={styles.mapSectionBox}>
            <div className={styles.mapAndButtonsRow}>
              {/* Map and Buttons Parent */}
              <div className={styles.mapButtonsParent}>
                <div className={styles.mapCol}>
                  {/* Google Maps Embed */}
                  <iframe
                    title="BGVIKI15 Location Map"
                    className={styles.mapIframe}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapUrl || ''}
                  ></iframe>
                </div>
                <div className={styles.buttonsCol}>
                  <a
                    href="https://maps.app.goo.gl/B74QyWSEYh1oV5Pk9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapButton + ' ' + styles.googleMapsButton}
                  >
                    <img src="/images/contacts/icons8-google-maps.svg" alt="Google Maps" className={styles.mapButtonIcon} onError={(e) => { e.target.style.display = 'none'; }} />
                    {t('contactPage.map.googleMaps')}
                  </a>
                  <a
                    href="https://waze.com/ul?ll=43.142072,24.718314&navigate=yes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapButton + ' ' + styles.wazeButton}
                  >
                    <img src="/images/contacts/icons8-waze.svg" alt="Waze" className={styles.mapButtonIcon} onError={(e) => { e.target.style.display = 'none'; }} />
                    {t('contactPage.map.waze')}
                  </a>
                  <a
                    href="https://maps.apple.com/?ll=43.142072,24.718314&q=BGVIKI15"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapButton + ' ' + styles.appleMapsButton}
                  >
                    <img src="/images/contacts/icons8-apple-maps.svg" alt="Apple Maps" className={styles.mapButtonIcon + ' ' + styles.appleMapsIcon} onError={(e) => { e.target.style.display = 'none'; }} />
                    {t('contactPage.map.appleMaps')}
                  </a>
                </div>
              </div>
            </div>
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
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('contactPage.cta.title')}</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
            {t('contactPage.cta.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/inquiry" style={{
              display: 'inline-block',
              background: 'white',
              color: '#2c5530',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              {t('contactPage.cta.inquiry')}
            </a>
            <a href="/buy" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              {t('contactPage.cta.products')}
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale || 'bg', ['common'])),
    },
  };
}

export default ContactPage; 
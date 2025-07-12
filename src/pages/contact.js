import React, { useContext } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { LanguageContext } from '../components/Layout Components/Header';
import styles from '../styles/Page Styles/BuyPage.module.css';

const ContactPage = () => {
  const { t } = useContext(LanguageContext);

  const contactInfo = [
    {
      icon: '📞',
      title: t('contactPage.info.phone.title'),
      details: ['+359 888 123 456', '+359 2 123 4567'],
      description: t('contactPage.info.phone.description')
    },
    {
      icon: '✉️',
      title: t('contactPage.info.email.title'),
      details: ['info@bgviki15.bg', 'sales@bgviki15.bg'],
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
      details: [t('contactPage.info.hours.schedule.0'), t('contactPage.info.hours.schedule.1'), t('contactPage.info.hours.schedule.2')],
      description: t('contactPage.info.hours.description')
    }
  ];

  const departments = [
    {
      name: t('contactPage.departments.sales.name'),
      phone: '+359 888 123 456',
      email: 'sales@bgviki15.bg',
      description: t('contactPage.departments.sales.description')
    },
    {
      name: t('contactPage.departments.support.name'),
      phone: '+359 888 234 567',
      email: 'support@bgviki15.bg',
      description: t('contactPage.departments.support.description')
    },
    {
      name: t('contactPage.departments.projects.name'),
      phone: '+359 888 345 678',
      email: 'projects@bgviki15.bg',
      description: t('contactPage.departments.projects.description')
    }
  ];

  return (
    <>
      <Head>
        <title>{`${t('contactPage.title')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={t('contactPage.metaDescription')} />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div className={styles.container}>
        <h1 className={styles.title}>{t('contactPage.title')}</h1>
        
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
                    <p key={idx} style={{ margin: '0.5rem 0', color: '#2c5530', fontWeight: '600', fontSize: '1.1rem' }}>
                      {detail}
                    </p>
                  ))}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{info.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Company Info */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Company Details */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e0e0e0'
            }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#333' }}>За компанията</h2>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#2c5530' }}>БГВИКИ15 ЕООД</h3>
                <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '1rem' }}>
                  От 2000 година сме водещ доставчик на климатизационни решения в България. 
                  Специализираме се в продажбата, монтажа и сервиза на климатици за битови, 
                  комерсиални и промишлени приложения.
                </p>
                <p style={{ lineHeight: '1.6', color: '#666', marginBottom: '1rem' }}>
                  Нашият екип от сертифицирани техници и инженери има над 20 години опит в бранша 
                  и е готов да ви предложи най-подходящото решение за вашите нужди.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>Търговска информация:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <strong>ЕИК:</strong> 123456789<br />
                    <strong>ДДС номер:</strong> BG123456789<br />
                    <strong>Седалище:</strong> София, България
                  </div>
                  <div>
                    <strong>Банка:</strong> Уникредит Булбанк<br />
                    <strong>IBAN:</strong> BG80UNCR76301234567890<br />
                    <strong>BIC:</strong> UNCRBGSF
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>Лицензи и сертификати:</h4>
                <ul style={{ paddingLeft: '1rem', color: '#666' }}>
                  <li>Лиценз за търговия с климатизационно оборудване</li>
                  <li>Сертификат за работа с хладилни агенти</li>
                  <li>ISO 9001:2015 - Система за управление на качеството</li>
                  <li>Партньорски сертификати от водещи производители</li>
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '2rem'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Бърза връзка</h3>
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ marginBottom: '1rem' }}>Нужна ви е спешна помощ или консултация?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <a href="tel:+359888123456" style={{
                      display: 'block',
                      background: 'white',
                      color: '#2c5530',
                      padding: '1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      📞 Обади се сега
                    </a>
                    <a href="mailto:info@bgviki15.bg" style={{
                      display: 'block',
                      background: 'transparent',
                      color: 'white',
                      border: '2px solid white',
                      padding: '1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      ✉️ Изпрати имейл
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
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>Аварийна линия</h3>
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  24/7 техническа поддръжка за спешни случаи
                </p>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
                  📞 +359 888 999 000
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Departments */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
            Отдели и специалисти
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
                    <strong>{t('contactPage.info.phone.title')}:</strong> {dept.phone}
                  </p>
                  <p style={{ marginBottom: '0' }}>
                    <strong>Имейл:</strong> {dept.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: '#333' }}>
            Как да ни намерите
          </h2>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'center' }}>
              <div style={{
                height: '400px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #ddd'
              }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <p>Интерактивна карта ще бъде добавена тук</p>
                  <small>Google Maps API интеграция</small>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Транспорт</h3>
                <ul style={{ paddingLeft: '1rem', color: '#666', lineHeight: '1.8' }}>
                  <li><strong>Метро:</strong> Станция "Сердика" (5 мин пеша)</li>
                  <li><strong>Автобус:</strong> Линии 94, 280, 306</li>
                  <li><strong>Трамвай:</strong> Линии 6, 7, 8</li>
                  <li><strong>Паркинг:</strong> Платен паркинг в близост</li>
                </ul>
                
                <h4 style={{ fontSize: '1.2rem', margin: '1.5rem 0 1rem', color: '#333' }}>Ориентири</h4>
                <ul style={{ paddingLeft: '1rem', color: '#666', lineHeight: '1.8' }}>
                  <li>До Централна гара - 10 мин</li>
                  <li>До НДК - 15 мин</li>
                  <li>До Виtosha Blvd - 5 мин</li>
                </ul>
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
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Готови за следващата стъпка?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
            Направете запитване или разгледайте нашите продукти още днес.
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
              Направи запитване
            </Link>
            <Link href="/buy" style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Разгледай продукти
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage; 
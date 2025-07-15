import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../../styles/Page Styles/BuyPage.module.css';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const ColdRoomsPage = () => {
  const { t, i18n } = useTranslation('common');

  const features = [
    {
      bg: "Прецизен контрол на температура от +15°C до -30°C",
      en: "Precise temperature control from +15°C to -30°C"
    },
    {
      bg: "Съответствие с HACCP и фармацевтични стандарти",
      en: "Compliance with HACCP and pharmaceutical standards"
    },
    {
      bg: "Енергийно ефективна изолация и уплътнения",
      en: "Energy-efficient insulation and sealing"
    },
    {
      bg: "Автоматично наблюдение и аларма при отклонения",
      en: "Automatic monitoring and deviation alarms"
    },
    {
      bg: "Модулна конструкция за лесно разширяване",
      en: "Modular design for easy expansion"
    }
  ];

  return (
    <>
      <Head>
        <title>Хладилни камери - Професионални решения | БГВИКИ15 ЕООД</title>
        <meta name="description" content="Хладилни камери за съхранение на храни и медицински материали. Професионални решения с прецизен контрол на температурата и съответствие със стандартите." />
      </Head>

      <div className={styles.container}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1a202c',
          fontWeight: '700'
        }}>
          {i18n.language === 'bg' ? 'Хладилни камери' : 'Cold Storage Rooms'}
        </h1>

        {/* Rich Description */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: '#4a5568'
          }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg' 
                ? 'Хладилните камери са жизненоважни за множество индустрии - от хранително-вкусовата промишленост до фармацията и биотехнологиите. Нашите професионални решения за студено съхранение гарантират оптимални условия за запазване на качеството, свежестта и безопасността на продуктите през целия им жизнен цикъл. Проектираме и изграждаме хладилни камери според специфичните изисквания на всеки клиент, като спазваме най-строгите международни стандарти за качество и безопасност.'
                : 'Cold storage rooms are vital for multiple industries - from food and beverage to pharmaceuticals and biotechnology. Our professional cold storage solutions guarantee optimal conditions for preserving product quality, freshness and safety throughout their entire lifecycle. We design and build cold storage rooms according to each client\'s specific requirements, adhering to the strictest international quality and safety standards.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Съвременните хладилни камери използват интелигентни системи за управление, които осигуряват постоянен мониторинг на температурата, влажността и други критични параметри. Нашите решения включват автоматично регистриране на данни, аларми при отклонения и дистанционно наблюдение чрез мобилни приложения. Това е особено важно за фармацевтичната индустрия, където дори минимални отклонения в температурата могат да компрометират ефективността на лекарствата.'
                : 'Modern cold storage rooms use intelligent control systems that provide constant monitoring of temperature, humidity and other critical parameters. Our solutions include automatic data logging, deviation alarms and remote monitoring via mobile applications. This is particularly important for the pharmaceutical industry, where even minimal temperature deviations can compromise drug efficacy.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Нашите хладилни камери се отличават с изключителна енергийна ефективност благодарение на висококачествената изолация, прецизните системи за климатизация и интелигентното управление. Модулната конструкция позволява лесно разширяване при нарастване на нуждите, а специализираните подови настилки и стенни панели осигуряват хигиенна и лесна за почистване среда, съответстваща на изискванията на HACCP и други регулаторни стандарти.'
                : 'Our cold storage rooms excel in exceptional energy efficiency thanks to high-quality insulation, precision climate control systems and intelligent management. The modular design allows easy expansion when needs grow, while specialized flooring and wall panels provide a hygienic and easy-to-clean environment that meets HACCP and other regulatory standards requirements.'
              }
            </p>
          </div>
        </section>

        {/* Images Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://via.placeholder.com/500x300.png?text=Cold+Storage+Room"
                alt="Cold Storage Room"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://via.placeholder.com/500x300.png?text=Food+Storage+Facility"
                alt="Food Storage Facility"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#2c5530'
          }}>
            {i18n.language === 'bg' ? 'Ключови предимства' : 'Key Benefits'}
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {features.map((feature, index) => (
                <li key={index} style={{
                  background: 'white',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderLeft: '4px solid #007bff',
                  fontSize: '1.1rem',
                  color: '#4a5568'
                }}>
                  ✓ {i18n.language === 'bg' ? feature.bg : feature.en}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section style={{
          background: 'linear-gradient(135deg, #2c5530 0%, #4a7c59 100%)',
          padding: '3rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            {i18n.language === 'bg' ? 'Готови за консултация?' : 'Ready for consultation?'}
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>
            {i18n.language === 'bg' 
              ? 'Свържете се с нашите експерти за безплатна консултация и оферта за вашия проект.'
              : 'Contact our experts for free consultation and quote for your project.'
            }
          </p>
          <Link href="/contact" style={{
            display: 'inline-block',
            background: 'white',
            color: '#2c5530',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.2s ease'
          }}>
            {i18n.language === 'bg' ? 'Свържете се с нас' : 'Contact Us'}
          </Link>
        </section>
      </div>
    </>
  );
};

export default ColdRoomsPage; 
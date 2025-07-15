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

const VentilationPage = () => {
  const { t, i18n } = useTranslation('common');

  const features = [
    {
      bg: "До 95% възвръщане на топлинната енергия",
      en: "Up to 95% heat energy recovery"
    },
    {
      bg: "HEPA филтрация за премахване на 99.97% от частиците",
      en: "HEPA filtration removing 99.97% of particles"
    },
    {
      bg: "Автоматично регулиране на въздушния дебит",
      en: "Automatic airflow regulation"
    },
    {
      bg: "Интелигентни сензори за качество на въздуха",
      en: "Smart air quality sensors"
    },
    {
      bg: "Тих режим на работа под 35 dB",
      en: "Quiet operation under 35 dB"
    }
  ];

  return (
    <>
      <Head>
        <title>Вентилационни системи - Чист въздух и рекуперация | БГВИКИ15 ЕООД</title>
        <meta name="description" content="Професионални вентилационни системи с рекуперация на топлина. Решения за чист въздух, филтрация и оптимална циркулация във всякакъв тип помещения." />
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
          {i18n.language === 'bg' ? 'Вентилационни системи' : 'Ventilation Systems'}
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
                ? 'Качеството на въздуха в затворени помещения е от критично значение за здравето, комфорта и производителността на хората. Нашите професионални вентилационни системи осигуряват непрекъснато обновяване на въздуха, ефективна филтрация и оптимална циркулация във всякакъв тип сгради - от жилищни и офисни до индустриални и медицински обекти. Съвременните технологии за рекуперация на топлина позволяват значителни икономии на енергия, като същевременно поддържат идеални климатични условия.'
                : 'Indoor air quality is critically important for people\'s health, comfort and productivity. Our professional ventilation systems ensure continuous air renewal, effective filtration and optimal circulation in all types of buildings - from residential and office to industrial and medical facilities. Modern heat recovery technologies enable significant energy savings while maintaining ideal climate conditions.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Системите с рекуперация на топлина (HRV и ERV) представляват революционна технология, която позволява обмен на свеж външен въздух с отработения вътрешен въздух, като същевременно възвръща до 95% от топлинната енергия. Това прави вентилацията изключително ефективна дори в най-студените зимни месеци. Интегрираните HEPA филтри премахват фини прахови частици, алергени, бактерии и вируси, осигурявайки болнично ниво на чистота на въздуха.'
                : 'Heat recovery ventilation systems (HRV and ERV) represent revolutionary technology that allows fresh outdoor air exchange with stale indoor air while recovering up to 95% of thermal energy. This makes ventilation extremely efficient even in the coldest winter months. Integrated HEPA filters remove fine dust particles, allergens, bacteria and viruses, providing hospital-level air cleanliness.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Нашите интелигентни вентилационни системи включват сензори за качество на въздуха, които автоматично регулират въздушния дебит според реалните нужди. Това не само оптимизира енергопотреблението, но и осигурява винаги оптимални условия за пребиваване. Възможността за дистанционно управление и мониторинг чрез мобилни приложения прави системите изключително удобни за експлоатация и поддръжка.'
                : 'Our intelligent ventilation systems include air quality sensors that automatically regulate airflow according to actual needs. This not only optimizes energy consumption but also ensures always optimal living conditions. Remote control and monitoring capabilities via mobile applications make the systems extremely convenient for operation and maintenance.'
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
                src="https://via.placeholder.com/500x300.png?text=Ventilation+System+Installation"
                alt="Ventilation System"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://via.placeholder.com/500x300.png?text=Heat+Recovery+Unit"
                alt="Heat Recovery Unit"
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

export default VentilationPage; 
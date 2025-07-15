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

const ChillersPage = () => {
  const { t, i18n } = useTranslation('common');

  const features = [
    {
      bg: "Висока енергийна ефективност и икономия на разходи",
      en: "High energy efficiency and cost savings"
    },
    {
      bg: "Надеждна работа при екстремни температури",
      en: "Reliable operation in extreme temperatures"
    },
    {
      bg: "Модулна конструкция за лесно разширение",
      en: "Modular design for easy expansion"
    },
    {
      bg: "Интелигентно управление и мониторинг",
      en: "Intelligent control and monitoring systems"
    },
    {
      bg: "Екологично решение с ниски емисии",
      en: "Eco-friendly solution with low emissions"
    }
  ];

  return (
    <>
      <Head>
        <title>Чилъри - Индустриални решения за охлаждане | БГВИКИ15 ЕООД</title>
        <meta name="description" content="Професионални чилъри за индустриални и търговски сгради. Високоефективни системи за охлаждане с надеждна работа и ниски разходи за поддръжка." />
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
          {i18n.language === 'bg' ? 'Чилъри' : 'Chillers'}
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
                ? 'Чилърите представляват сърцето на всяка голяма система за климатизация в индустриални и търговски сгради. Тези високотехнологични устройства осигуряват надеждно и ефективно охлаждане за офиси, заводи, болници, търговски центрове и други големи обекти. Нашите чилъри използват най-съвременните технологии за постигане на максимална енергийна ефективност при минимални разходи за експлоатация.'
                : 'Chillers represent the heart of any large air conditioning system in industrial and commercial buildings. These high-tech devices provide reliable and efficient cooling for offices, factories, hospitals, shopping centers and other large facilities. Our chillers use the most advanced technologies to achieve maximum energy efficiency with minimal operating costs.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Съвременните чилъри работят по принципа на парокомпресионния цикъл, където хладилен агент циркулира между испарител и кондензатор. Тази технология позволява прецизен контрол на температурата и влажността в големи пространства, осигурявайки комфортна работна среда през цялата година. Нашите системи са проектирани да работят безотказно дори при екстремни външни условия.'
                : 'Modern chillers operate on the vapor compression cycle principle, where refrigerant circulates between evaporator and condenser. This technology allows precise control of temperature and humidity in large spaces, ensuring a comfortable working environment throughout the year. Our systems are designed to operate reliably even in extreme external conditions.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Инвестицията в качествен чилър се изплаща бързо благодарение на значителните икономии от електроенергия и ниските разходи за поддръжка. Нашите специалисти предлагат пълно проектиране, инсталиране и сервизно обслужване, гарантирайки дългогодишна безпроблемна работа на вашата система за климатизация.'
                : 'Investment in a quality chiller pays off quickly thanks to significant electricity savings and low maintenance costs. Our specialists offer complete design, installation and service, guaranteeing years of trouble-free operation of your air conditioning system.'
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
                src="https://via.placeholder.com/500x300.png?text=Industrial+Chiller+System"
                alt="Industrial Chiller"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://via.placeholder.com/500x300.png?text=Chiller+Installation"
                alt="Chiller Installation"
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

export default ChillersPage; 
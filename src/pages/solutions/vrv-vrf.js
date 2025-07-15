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

const VrvVrfPage = () => {
  const { t, i18n } = useTranslation('common');

  const features = [
    {
      bg: "Индивидуален контрол на температурата във всяка зона",
      en: "Individual temperature control in each zone"
    },
    {
      bg: "До 40% икономия на енергия спрямо традиционните системи",
      en: "Up to 40% energy savings compared to traditional systems"
    },
    {
      bg: "Тих режим на работа с минимално ниво на шум",
      en: "Quiet operation with minimal noise levels"
    },
    {
      bg: "Възможност за едновременно отопление и охлаждане",
      en: "Simultaneous heating and cooling capability"
    },
    {
      bg: "Интелигентно управление чрез мобилно приложение",
      en: "Smart control via mobile application"
    }
  ];

  return (
    <>
      <Head>
        <title>VRV/VRF Системи - Енергийно ефективни решения | БГВИКИ15 ЕООД</title>
        <meta name="description" content="VRV/VRF системи за климатизация с променлив дебит на хладилен агент. Енергийно ефективни решения за офиси, хотели и търговски центрове." />
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
          {i18n.language === 'bg' ? 'VRV/VRF Системи' : 'VRV/VRF Systems'}
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
                ? 'VRV (Variable Refrigerant Volume) и VRF (Variable Refrigerant Flow) системите представляват революционна технология в областта на климатизацията, която позволява прецизен контрол на температурата в множество зони едновременно. Тези системи са идеални за големи комерсиални сгради, офиси, хотели и търговски центрове, където различните помещения имат различни изисквания за комфорт.'
                : 'VRV (Variable Refrigerant Volume) and VRF (Variable Refrigerant Flow) systems represent revolutionary technology in air conditioning that allows precise temperature control in multiple zones simultaneously. These systems are ideal for large commercial buildings, offices, hotels and shopping centers where different rooms have different comfort requirements.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Принципът на работа се основава на променливия дебит на хладилен агент, който се регулира автоматично според нуждите на всяка отделна зона. Това позволява една външна единица да обслужва множество вътрешни единици с различни капацитети и режими на работа. Системата може едновременно да охлажда едни помещения, докато отоплява други, постигайки максимална ефективност и комфорт.'
                : 'The operating principle is based on variable refrigerant flow, which is automatically regulated according to the needs of each individual zone. This allows one outdoor unit to serve multiple indoor units with different capacities and operating modes. The system can simultaneously cool some rooms while heating others, achieving maximum efficiency and comfort.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Съвременните VRV/VRF системи интегрират интелигентни функции като автоматично разпознаване на присъствие, адаптивно управление според времето и възможност за дистанционно наблюдение и контрол. Тези иновации не само повишават комфорта на потребителите, но и осигуряват значителни икономии от енергия и намаляват въздействието върху околната среда.'
                : 'Modern VRV/VRF systems integrate smart features such as automatic presence detection, adaptive time-based control and remote monitoring capabilities. These innovations not only enhance user comfort but also provide significant energy savings and reduce environmental impact.'
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
                src="https://via.placeholder.com/500x300.png?text=VRV+VRF+System+Installation"
                alt="VRV/VRF System"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://via.placeholder.com/500x300.png?text=Multi+Zone+Control+Panel"
                alt="Multi Zone Control"
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

export default VrvVrfPage; 
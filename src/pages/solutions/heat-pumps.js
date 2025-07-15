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

const HeatPumpsPage = () => {
  const { t, i18n } = useTranslation('common');

  const features = [
    {
      bg: "До 300% енергийна ефективност (COP 3.0 и повече)",
      en: "Up to 300% energy efficiency (COP 3.0 and above)"
    },
    {
      bg: "Екологично решение без изгаряне на горива",
      en: "Eco-friendly solution without fuel combustion"
    },
    {
      bg: "Работа при температури до -25°C",
      en: "Operation in temperatures down to -25°C"
    },
    {
      bg: "Комбинирано отопление, охлаждане и БГВ",
      en: "Combined heating, cooling and domestic hot water"
    },
    {
      bg: "Възможност за интеграция с соларни панели",
      en: "Integration possibility with solar panels"
    }
  ];

  return (
    <>
      <Head>
        <title>Термопомпи - Енергийно ефективни решения | БГВИКИ15 ЕООД</title>
        <meta name="description" content="Термопомпи въздух-въздух и въздух-вода за отопление и охлаждане. Екологични и икономични решения за жилищни и бизнес сгради." />
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
          {i18n.language === 'bg' ? 'Термопомпи' : 'Heat Pumps'}
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
                ? 'Термопомпите представляват една от най-ефективните и екологични технологии за отопление и охлаждане в съвременното строителство. Тези иновативни системи използват възобновяема енергия от околната среда - въздух, земя или вода, за да осигурят комфортна температура във вашия дом или офис през цялата година. Нашите термопомпи достигат енергийна ефективност от 300% и повече, което означава, че за всеки kWh консумирана електроенергия произвеждат 3 kWh топлинна енергия.'
                : 'Heat pumps represent one of the most efficient and eco-friendly technologies for heating and cooling in modern construction. These innovative systems use renewable energy from the environment - air, ground or water, to provide comfortable temperature in your home or office throughout the year. Our heat pumps achieve energy efficiency of 300% and more, which means that for every kWh of consumed electricity they produce 3 kWh of thermal energy.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Съществуват два основни типа термопомпи - въздух-въздух и въздух-вода. Термопомпите въздух-въздух са идеални за директно отопление и охлаждане на помещения чрез вътрешни единици, докато системите въздух-вода могат да се интегрират с подово отопление, радиатори и бойлери за битова гореща вода. Съвременните инверторни технологии позволяват плавна регулация на мощността според нуждите, осигурявайки постоянен комфорт при минимален разход на енергия.'
                : 'There are two main types of heat pumps - air-to-air and air-to-water. Air-to-air heat pumps are ideal for direct heating and cooling of rooms through indoor units, while air-to-water systems can be integrated with underfloor heating, radiators and domestic hot water boilers. Modern inverter technologies allow smooth power regulation according to needs, ensuring constant comfort with minimal energy consumption.'
              }
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              {i18n.language === 'bg'
                ? 'Инвестицията в термопомпа се изплаща бързо благодарение на драматично намалените разходи за отопление и възможностите за финансиране чрез европейски и национални програми за енергийна ефективност. Освен икономическите ползи, термопомпите значително намаляват въглеродния отпечатък на сградата и допринасят за опазването на околната среда за бъдещите поколения.'
                : 'Investment in a heat pump pays off quickly thanks to dramatically reduced heating costs and financing opportunities through European and national energy efficiency programs. In addition to economic benefits, heat pumps significantly reduce the building\'s carbon footprint and contribute to environmental protection for future generations.'
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
                src="https://via.placeholder.com/500x300.png?text=Heat+Pump+Installation"
                alt="Heat Pump Installation"
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="https://via.placeholder.com/500x300.png?text=Air+to+Water+Heat+Pump"
                alt="Air to Water Heat Pump"
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

export default HeatPumpsPage; 
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from '../styles/Page Styles/index.module.css';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

const HomePage = () => {
  const { t, i18n } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('metaTitle')}</title>
        <meta name="description" content={t('metaDescription')} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={t('metaTitle')} />
        <meta property="og:description" content={t('metaDescription')} />
        <meta property="og:type" content="website" />
      </Head>
      
      {/* Hero Section */}
      <section 
        className={styles.hero}
        style={{
          backgroundImage: 'url(https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg/hero_background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {i18n.language === 'bg' ? 'Професионални HVAC решения' : 'Professional HVAC Solutions'}
              <br />
              <span className={styles.heroSubtext}>
                {i18n.language === 'bg' ? 'От 2000 година' : 'Since 2000'}
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              {i18n.language === 'bg' 
                ? 'Водещ доставчик на климатични, отоплителни и вентилационни системи в България. Качествени инсталации, енергийно ефективни решения и експертно обслужване.'
                : 'Leading provider of air conditioning, heating, and ventilation systems in Bulgaria. Quality installations, energy-efficient solutions, and expert service you can trust.'
              }
            </p>
            
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>2000+</span>
                <span className={styles.statLabel}>
                  {i18n.language === 'bg' ? 'Инсталации' : 'Installations'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>20+</span>
                <span className={styles.statLabel}>
                  {i18n.language === 'bg' ? 'Години опит' : 'Years Experience'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>
                  {i18n.language === 'bg' ? 'Доволни клиенти' : 'Satisfied Clients'}
                </span>
              </div>
            </div>
            
            <div className={styles.heroButtons}>
              <Link href="/products" className={styles.btnPrimary}>
                🔍 {i18n.language === 'bg' ? 'Разгледай услуги' : 'View Services'}
              </Link>
              <Link href="/contact" className={styles.btnSecondary}>
                💬 {i18n.language === 'bg' ? 'Заяви оферта' : 'Get Quote'}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Cards for All Services */}
        <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
          <h3>❄️ {i18n.language === 'bg' ? 'Климатици' : 'Air Conditioning'}</h3>
          <p>
            {i18n.language === 'bg' 
              ? 'Професионални инсталации с гаранция за качество и надеждност'
              : 'Professional installations with quality and reliability guarantee'
            }
          </p>
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
          <h3>🏭 {i18n.language === 'bg' ? 'Чилъри' : 'Chillers'}</h3>
          <p>
            {i18n.language === 'bg' 
              ? 'Индустриални решения за охлаждане на големи обекти'
              : 'Industrial cooling solutions for large buildings'
            }
          </p>
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard3}`}>
          <h3>🏢 {i18n.language === 'bg' ? 'VRV/VRF системи' : 'VRV/VRF Systems'}</h3>
          <p>
            {i18n.language === 'bg' 
              ? 'Високоефективни системи за многозонов контрол'
              : 'High-efficiency multi-zone control systems'
            }
          </p>
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard4}`}>
          <h3>🔥 {i18n.language === 'bg' ? 'Термопомпи' : 'Heat Pumps'}</h3>
          <p>
            {i18n.language === 'bg' 
              ? 'Енергийно ефективни решения за отопление'
              : 'Energy-efficient heating solutions'
            }
          </p>
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard5}`}>
          <h3>🧊 {i18n.language === 'bg' ? 'Хладилни камери' : 'Cold Rooms'}</h3>
          <p>
            {i18n.language === 'bg' 
              ? 'Специализирани решения за съхранение'
              : 'Specialized storage solutions'
            }
          </p>
        </div>

        <div className={`${styles.floatingCard} ${styles.floatingCard6}`}>
          <h3>🌀 {i18n.language === 'bg' ? 'Вентилация' : 'Ventilation'}</h3>
          <p>
            {i18n.language === 'bg' 
              ? 'Системи за качествен въздух'
              : 'Quality air circulation systems'
            }
          </p>
        </div>
      </section>


      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h2>
                {i18n.language === 'bg' ? 'За БГВИКИ15 ЕООД' : 'About BGVIKI15 Ltd'}
              </h2>
              <p>
                {i18n.language === 'bg' 
                  ? 'С над 20 години опит в HVAC индустрията, ние сме водещата компания в България за продажба, инсталация и поддръжка на климатични, отоплителни и вентилационни системи.'
                  : 'With over 20 years of experience in the HVAC industry, we are the leading company in Bulgaria for sales, installation and maintenance of air conditioning, heating and ventilation systems.'
                }
              </p>
              <p>
                {i18n.language === 'bg' 
                  ? 'Нашият екип от сертифицирани специалисти осигурява най-високо качество на услугите и използва най-модерните технологии за енергийна ефективност.'
                  : 'Our team of certified specialists ensures the highest quality of services and uses the most modern technologies for energy efficiency.'
                }
              </p>
              
              <ul className={styles.aboutFeatures}>
                <li>{i18n.language === 'bg' ? 'Сертифицирани специалисти' : 'Certified specialists'}</li>
                <li>{i18n.language === 'bg' ? 'Гаранция за качество' : 'Quality guarantee'}</li>
                <li>{i18n.language === 'bg' ? 'Енергийно ефективни решения' : 'Energy efficient solutions'}</li>
                <li>{i18n.language === 'bg' ? '24/7 техническа поддръжка' : '24/7 technical support'}</li>
              </ul>
            </div>
            
            <div className={styles.aboutImage}>
              <img 
                src="https://nticlbmuetfeuwkkukwz.supabase.co/storage/v1/object/public/images-viki15bg//lanes-ac-installation-replacement%20(1).png" 
                alt={i18n.language === 'bg' ? 'Нашият екип' : 'Our Team'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>
            {i18n.language === 'bg' ? 'Готови за професионална HVAC консултация?' : 'Ready for professional HVAC consultation?'}
          </h2>
          <p>
            {i18n.language === 'bg' 
              ? 'Свържете се с нас за безплатна оценка и персонализирано предложение'
              : 'Contact us for a free assessment and personalized proposal'
            }
          </p>
          <Link href="/products" className={styles.btnPrimary}>
            {i18n.language === 'bg' ? 'Продукти и решения' : 'Products & Solutions'}
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
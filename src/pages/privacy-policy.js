import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Layout from '@/components/Layout';
import styles from '@/styles/Page Styles/PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
  const { t } = useTranslation('common');

    return (
    <>
      <Head>
        <title>{t('privacyPolicy.title')} - {t('metaTitle')}</title>
        <meta name="description" content={t('privacyPolicy.description')} />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t('privacyPolicy.title')}</h1>
          <p className={styles.lastUpdated}>{t('privacyPolicy.lastUpdated')}: 29.07.2025</p>
          
          <div className={styles.section}>
            <p className={styles.intro}>
              {t('privacyPolicy.intro')}
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. {t('privacyPolicy.dataController.title')}</h2>
            <p className={styles.companyName}>{t('privacyPolicy.dataController.company')}</p>
            <div className={styles.contactInfo}>
              <p><strong>{t('privacyPolicy.dataController.eik')}:</strong> 206631138</p>
              <p><strong>{t('privacyPolicy.dataController.address')}:</strong> {t('privacyPolicy.dataController.addressValue')}</p>
              <p><strong>{t('privacyPolicy.dataController.email')}:</strong> bgviki.ltd@abv.bg</p>
              <p><strong>{t('privacyPolicy.dataController.phone')}:</strong> +359 895 460 717</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. {t('privacyPolicy.dataCollected.title')}</h2>
            <p>{t('privacyPolicy.dataCollected.intro')}</p>
            <ul className={styles.list}>
              <li>{t('privacyPolicy.dataCollected.name')}</li>
              <li>{t('privacyPolicy.dataCollected.phone')}</li>
              <li>{t('privacyPolicy.dataCollected.email')}</li>
              <li>{t('privacyPolicy.dataCollected.address')}</li>
              <li>{t('privacyPolicy.dataCollected.orderData')}</li>
              <li>{t('privacyPolicy.dataCollected.technicalData')}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. {t('privacyPolicy.purposes.title')}</h2>
            <p>{t('privacyPolicy.purposes.intro')}</p>
            <ul className={styles.list}>
              <li>{t('privacyPolicy.purposes.orderFulfillment')}</li>
              <li>{t('privacyPolicy.purposes.customerContact')}</li>
              <li>{t('privacyPolicy.purposes.billing')}</li>
              <li>{t('privacyPolicy.purposes.legalRights')}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. {t('privacyPolicy.legalBasis.title')}</h2>
            <ul className={styles.list}>
              <li>{t('privacyPolicy.legalBasis.contract')}</li>
              <li>{t('privacyPolicy.legalBasis.legalObligation')}</li>
              <li>{t('privacyPolicy.legalBasis.consent')}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>5. {t('privacyPolicy.dataSharing.title')}</h2>
            <p>{t('privacyPolicy.dataSharing.intro')}</p>
            <ul className={styles.list}>
              <li>{t('privacyPolicy.dataSharing.couriers')}</li>
              <li>{t('privacyPolicy.dataSharing.installers')}</li>
              <li>{t('privacyPolicy.dataSharing.accounting')}</li>
              <li>{t('privacyPolicy.dataSharing.hosting')}</li>
            </ul>
            <p>{t('privacyPolicy.dataSharing.protection')}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>6. {t('privacyPolicy.retention.title')}</h2>
            <ul className={styles.list}>
              <li>{t('privacyPolicy.retention.orders')}</li>
              <li>{t('privacyPolicy.retention.inquiries')}</li>
              <li>{t('privacyPolicy.retention.consent')}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>7. {t('privacyPolicy.rights.title')}</h2>
            <p>{t('privacyPolicy.rights.intro')}</p>
            <ul className={styles.list}>
              <li>{t('privacyPolicy.rights.access')}</li>
              <li>{t('privacyPolicy.rights.correction')}</li>
              <li>{t('privacyPolicy.rights.deletion')}</li>
              <li>{t('privacyPolicy.rights.restriction')}</li>
              <li>{t('privacyPolicy.rights.objection')}</li>
              <li>{t('privacyPolicy.rights.portability')}</li>
              <li>{t('privacyPolicy.rights.complaint')}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>8. {t('privacyPolicy.dataProtection.title')}</h2>
            <p>{t('privacyPolicy.dataProtection.description')}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>9. {t('privacyPolicy.cookies.title')}</h2>
            <p>{t('privacyPolicy.cookies.description')}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>10. {t('privacyPolicy.contact.title')}</h2>
            <p>{t('privacyPolicy.contact.intro')}</p>
            <div className={styles.contactInfo}>
              <p><strong>{t('privacyPolicy.contact.email')}:</strong> bgviki.ltd@abv.bg</p>
              <p><strong>{t('privacyPolicy.contact.phone')}:</strong> +359 895 460 717</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default PrivacyPolicy; 
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Layout from '@/components/Layout';
import styles from '@/styles/Page Styles/CookiePolicy.module.css';

const CookiePolicy = () => {
  const { t } = useTranslation('common');

    return (
    <>
      <Head>
        <title>{t('cookiePolicy.title')} - {t('metaTitle')}</title>
        <meta name="description" content={t('cookiePolicy.description')} />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t('cookiePolicy.title')}</h1>
          <p className={styles.lastUpdated}>{t('cookiePolicy.lastUpdated')}: 29.07.2025</p>
          
          <div className={styles.section}>
            <p className={styles.intro}>
              {t('cookiePolicy.intro')}
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. {t('cookiePolicy.whatAreCookies.title')}</h2>
            <p>{t('cookiePolicy.whatAreCookies.description')}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. {t('cookiePolicy.howWeUseCookies.title')}</h2>
            <p>{t('cookiePolicy.howWeUseCookies.intro')}</p>
            <ul className={styles.list}>
              <li>{t('cookiePolicy.howWeUseCookies.essential')}</li>
              <li>{t('cookiePolicy.howWeUseCookies.analytics')}</li>
              <li>{t('cookiePolicy.howWeUseCookies.preferences')}</li>
              <li>{t('cookiePolicy.howWeUseCookies.marketing')}</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. {t('cookiePolicy.cookieTypes.title')}</h2>
            
            <div className={styles.cookieType}>
              <h3 className={styles.cookieTypeTitle}>{t('cookiePolicy.cookieTypes.essential.title')}</h3>
              <p>{t('cookiePolicy.cookieTypes.essential.description')}</p>
              <ul className={styles.list}>
                <li><strong>{t('cookiePolicy.cookieTypes.essential.consent')}:</strong> {t('cookiePolicy.cookieTypes.essential.consentDesc')}</li>
                <li><strong>{t('cookiePolicy.cookieTypes.essential.cart')}:</strong> {t('cookiePolicy.cookieTypes.essential.cartDesc')}</li>
                <li><strong>{t('cookiePolicy.cookieTypes.essential.session')}:</strong> {t('cookiePolicy.cookieTypes.essential.sessionDesc')}</li>
              </ul>
            </div>

            <div className={styles.cookieType}>
              <h3 className={styles.cookieTypeTitle}>{t('cookiePolicy.cookieTypes.analytics.title')}</h3>
              <p>{t('cookiePolicy.cookieTypes.analytics.description')}</p>
              <ul className={styles.list}>
                <li><strong>Vercel Analytics:</strong> {t('cookiePolicy.cookieTypes.analytics.vercel')}</li>
                <li><strong>{t('cookiePolicy.cookieTypes.analytics.custom')}:</strong> {t('cookiePolicy.cookieTypes.analytics.customDesc')}</li>
              </ul>
            </div>

            <div className={styles.cookieType}>
              <h3 className={styles.cookieTypeTitle}>{t('cookiePolicy.cookieTypes.functional.title')}</h3>
              <p>{t('cookiePolicy.cookieTypes.functional.description')}</p>
              <ul className={styles.list}>
                <li><strong>{t('cookiePolicy.cookieTypes.functional.language')}:</strong> {t('cookiePolicy.cookieTypes.functional.languageDesc')}</li>
                <li><strong>{t('cookiePolicy.cookieTypes.functional.preferences')}:</strong> {t('cookiePolicy.cookieTypes.functional.preferencesDesc')}</li>
              </ul>
            </div>

            <div className={styles.cookieType}>
              <h3 className={styles.cookieTypeTitle}>{t('cookiePolicy.cookieTypes.thirdParty.title')}</h3>
              <p>{t('cookiePolicy.cookieTypes.thirdParty.description')}</p>
              <ul className={styles.list}>
                <li><strong>Stripe:</strong> {t('cookiePolicy.cookieTypes.thirdParty.stripe')}</li>
                <li><strong>Supabase:</strong> {t('cookiePolicy.cookieTypes.thirdParty.supabase')}</li>
              </ul>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. {t('cookiePolicy.cookieTable.title')}</h2>
            <div className={styles.tableContainer}>
              <table className={styles.cookieTable}>
                <thead>
                  <tr>
                    <th>{t('cookiePolicy.cookieTable.name')}</th>
                    <th>{t('cookiePolicy.cookieTable.purpose')}</th>
                    <th>{t('cookiePolicy.cookieTable.duration')}</th>
                    <th>{t('cookiePolicy.cookieTable.type')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>termsAccepted</td>
                    <td>{t('cookiePolicy.cookieTable.consentPurpose')}</td>
                    <td>{t('cookiePolicy.cookieTable.consentDuration')}</td>
                    <td>{t('cookiePolicy.cookieTable.essential')}</td>
                  </tr>
                  <tr>
                    <td>termsAcceptedTimestamp</td>
                    <td>{t('cookiePolicy.cookieTable.timestampPurpose')}</td>
                    <td>{t('cookiePolicy.cookieTable.consentDuration')}</td>
                    <td>{t('cookiePolicy.cookieTable.essential')}</td>
                  </tr>
                  <tr>
                    <td>termsAcceptedVersion</td>
                    <td>{t('cookiePolicy.cookieTable.versionPurpose')}</td>
                    <td>{t('cookiePolicy.cookieTable.consentDuration')}</td>
                    <td>{t('cookiePolicy.cookieTable.essential')}</td>
                  </tr>
                  <tr>
                    <td>viki15-cart</td>
                    <td>{t('cookiePolicy.cookieTable.cartPurpose')}</td>
                    <td>{t('cookiePolicy.cookieTable.cartDuration')}</td>
                    <td>{t('cookiePolicy.cookieTable.essential')}</td>
                  </tr>
                  <tr>
                    <td>Vercel Analytics</td>
                    <td>{t('cookiePolicy.cookieTable.analyticsPurpose')}</td>
                    <td>{t('cookiePolicy.cookieTable.analyticsDuration')}</td>
                    <td>{t('cookiePolicy.cookieTable.analytics')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>5. {t('cookiePolicy.managingCookies.title')}</h2>
            <p>{t('cookiePolicy.managingCookies.intro')}</p>
            
            <div className={styles.managementMethod}>
              <h3 className={styles.managementMethodTitle}>{t('cookiePolicy.managingCookies.browser.title')}</h3>
              <p>{t('cookiePolicy.managingCookies.browser.description')}</p>
            </div>

            <div className={styles.managementMethod}>
              <h3 className={styles.managementMethodTitle}>{t('cookiePolicy.managingCookies.consent.title')}</h3>
              <p>{t('cookiePolicy.managingCookies.consent.description')}</p>
            </div>

            <div className={styles.managementMethod}>
              <h3 className={styles.managementMethodTitle}>{t('cookiePolicy.managingCookies.withdrawal.title')}</h3>
              <p>{t('cookiePolicy.managingCookies.withdrawal.description')}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>6. {t('cookiePolicy.contact.title')}</h2>
            <p>{t('cookiePolicy.contact.intro')}</p>
            <div className={styles.contactInfo}>
              <p><strong>{t('cookiePolicy.contact.email')}:</strong> bgviki.ltd@abv.bg</p>
              <p><strong>{t('cookiePolicy.contact.phone')}:</strong> +359 895 460 717</p>
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

export default CookiePolicy; 
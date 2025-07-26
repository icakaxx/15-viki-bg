import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styles from '../styles/Page Styles/OrderSuccess.module.css';

const OrderSuccessPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { orderId, paymentMethod } = router.query;

  return (
    <>
      <Head>
        <title>{`${t('orderSuccess.title')} - ${t('metaTitle')}`}</title>
        <meta name="description" content={t('orderSuccess.description')} />
        <meta name="robots" content="noindex, follow" />
      </Head>
      
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            ✅
          </div>
          
          <h1 className={styles.title}>
            {t('orderSuccess.title')}
          </h1>
          
          <p className={styles.message}>
            {t('orderSuccess.message')}
          </p>
          
          {orderId && (
            <div className={styles.orderDetails}>
              <p className={styles.orderId}>
                <strong>{t('orderSuccess.orderId')}:</strong> {orderId}
              </p>
              {paymentMethod === 'online' && (
                <p className={styles.paymentInfo}>
                  <strong>{t('orderSuccess.paymentMethod')}:</strong> {t('orderSuccess.paidByCard')}
                </p>
              )}
            </div>
          )}
          
          <div className={styles.nextSteps}>
            <h2>{t('orderSuccess.nextSteps.title')}</h2>
            <ul>
              <li>{t('orderSuccess.nextSteps.contact')}</li>
              <li>{t('orderSuccess.nextSteps.delivery')}</li>
              <li>{t('orderSuccess.nextSteps.questions')}</li>
            </ul>
          </div>
          
          <div className={styles.actions}>
            <Link href="/" className={styles.button}>
              {t('orderSuccess.backToHome')}
            </Link>
            <Link href="/products" className={styles.buttonSecondary}>
              {t('orderSuccess.continueShopping')}
            </Link>
          </div>
        </div>
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

export default OrderSuccessPage; 
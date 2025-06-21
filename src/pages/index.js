import styles from '../styles/Page Styles/index.module.css';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';



export default function Home() {
   const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Next.js!</h1>
      <p className={styles.subtitle}>This is the home page.</p>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
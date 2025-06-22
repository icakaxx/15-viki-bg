import styles from '../styles/Page Styles/index.module.css';
import Head from '../components/Head';

export default function Home() {
  return (
    <>
      <Head />
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Next.js!</h1>
        <p className={styles.subtitle}>This is the home page.</p>
        <p className={styles.subtitle}>This is the home page.</p>
        <p className={styles.subtitle}>This is the home page.</p>
      </div>
    </>
  );
}
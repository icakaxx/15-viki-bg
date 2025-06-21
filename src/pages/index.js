import styles from '../styles/Page Styles/index.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Next.js!</h1>
      <p className={styles.subtitle}>This is the home page.</p>
    </div>
  );
}

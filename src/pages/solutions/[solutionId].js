import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import styles from '../../styles/Page Styles/SolutionDetail.module.css';

const placeholder = '/images/products/placeholder-product.svg';
const solutions = {
  'chillers': {
    titleKey: 'solutions.chillers.title',
    shortKey: 'solutions.chillers.short',
    paragraphs: [
      'solutions.chillers.p1',
      'solutions.chillers.p2',
      'solutions.chillers.p3',
      'solutions.chillers.p4',
    ],
    images: [placeholder, placeholder, placeholder],
  },
  'vrv-vrf': {
    titleKey: 'solutions.vrv_vrf.title',
    shortKey: 'solutions.vrv_vrf.short',
    paragraphs: [
      'solutions.vrv_vrf.p1',
      'solutions.vrv_vrf.p2',
      'solutions.vrv_vrf.p3',
      'solutions.vrv_vrf.p4',
    ],
    images: ['/images/products/VRVVRF.png', '/images/products/VRVVRF2.png', '/images/products/VRVVRF3.png'],
  },
  'heat-pumps': {
    titleKey: 'solutions.heat_pumps.title',
    shortKey: 'solutions.heat_pumps.short',
    paragraphs: [
      'solutions.heat_pumps.p1',
      'solutions.heat_pumps.p2',
      'solutions.heat_pumps.p3',
      'solutions.heat_pumps.p4',
    ],
    images: [placeholder, placeholder, placeholder],
  },
  'cold-rooms': {
    titleKey: 'solutions.cold_rooms.title',
    shortKey: 'solutions.cold_rooms.short',
    paragraphs: [
      'solutions.cold_rooms.p1',
      'solutions.cold_rooms.p2',
      'solutions.cold_rooms.p3',
      'solutions.cold_rooms.p4',
    ],
    images: [placeholder, placeholder, placeholder],
  },
  'ventilation': {
    titleKey: 'solutions.ventilation.title',
    shortKey: 'solutions.ventilation.short',
    paragraphs: [
      'solutions.ventilation.p1',
      'solutions.ventilation.p2',
      'solutions.ventilation.p3',
      'solutions.ventilation.p4',
    ],
    images: [placeholder, placeholder, placeholder],
  }
};

export default function SolutionPage({ solutionId: propSolutionId }) {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  
  // Use prop during SSG, fallback to query during client-side navigation
  const solutionId = propSolutionId || query.solutionId;
  const solution = solutions[solutionId];

  if (!solution) return <div className={styles.notFound}>Solution not found</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backButtonContainer}>
        <a href="/products" className={styles.backButton}>← {t('nav.products')}</a>
      </div>
      <div className={styles.solutionDetailOuter}>
        <div className={styles.solutionDetailCard}>
          <div className={styles.textSection}>
            <h1 className={styles.title}>{t(solution.titleKey)}</h1>
            <h2 className={styles.subtitle}>{t(solution.shortKey)}</h2>
            {solution.paragraphs.map((key, idx) => (
              <p className={styles.paragraph} key={key}>{t(key)}</p>
            ))}
          </div>
          <div className={styles.imagesSection}>
            {solution.images.map((src, idx) => (
              <img key={src + idx} src={src} alt={solutionId + ' image ' + (idx + 1)} className={styles.solutionImage} />
            ))}
          </div>
        </div>
        <div className={styles.actionsSection}>
          <h3 className={styles.actionsTitle}>{t('productsPage.cta.title')}</h3>
          <div className={styles.actionsContainer}>
            <a href="/inquiry" className={styles.greenButton}>{t('nav.inquiry')}</a>
            <a href="/contact" className={styles.greenButton}>{t('nav.contact')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  // Generate only the most popular solution at build time
  const paths = [{ params: { solutionId: 'heat-pumps' } }];
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ locale, params }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Pass the solution ID to avoid runtime lookups
      solutionId: params.solutionId
    },
    // Regenerate page at most once every hour
    revalidate: 3600
  };
} 
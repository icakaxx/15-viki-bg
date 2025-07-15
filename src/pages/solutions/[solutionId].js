import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const solutions = {
  'chillers': {
    titleKey: 'solutions.chillers.title',
    shortKey: 'solutions.chillers.short',
    detailsKey: 'solutions.chillers.details',
  },
  'vrv-vrf': {
    titleKey: 'solutions.vrv_vrf.title',
    shortKey: 'solutions.vrv_vrf.short',
    detailsKey: 'solutions.vrv_vrf.details',
  },
  'heat-pumps': {
    titleKey: 'solutions.heat_pumps.title',
    shortKey: 'solutions.heat_pumps.short',
    detailsKey: 'solutions.heat_pumps.details',
  },
  'cold-rooms': {
    titleKey: 'solutions.cold_rooms.title',
    shortKey: 'solutions.cold_rooms.short',
    detailsKey: 'solutions.cold_rooms.details',
  },
  'ventilation': {
    titleKey: 'solutions.ventilation.title',
    shortKey: 'solutions.ventilation.short',
    detailsKey: 'solutions.ventilation.details',
  }
};

export default function SolutionPage({ solutionId: propSolutionId }) {
  const { t } = useTranslation('common');
  const { query } = useRouter();
  
  // Use prop during SSG, fallback to query during client-side navigation
  const solutionId = propSolutionId || query.solutionId;
  const solution = solutions[solutionId];

  if (!solution) return <div>Solution not found</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t(solution.titleKey)}</h1>
      <p>{t(solution.shortKey)}</p>
      <p>{t(solution.detailsKey)}</p>
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
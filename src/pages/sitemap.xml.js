/**
 * Dynamic sitemap.xml for SEO.
 * Returns XML with all crawlable public pages.
 * Product detail URLs are not included (would require Supabase fetch at request time).
 */

const SITE_URL = 'https://www.hc-clima.bg';

const staticUrls = [
  '/',
  '/products',
  '/buy',
  '/contact',
  '/inquiry',
  '/privacy-policy',
  '/cookie-policy',
];

const solutionIds = ['chillers', 'vrv-vrf', 'heat-pumps', 'cold-rooms', 'ventilation'];

function buildSitemapXml() {
  const urls = [
    ...staticUrls,
    ...solutionIds.map((id) => `/solutions/${id}`),
  ];

  const urlEntries = urls.map(
    (path) => `  <url>
    <loc>${SITE_URL}${path === '/' ? '' : path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' || path === '/buy' ? '1.0' : path === '/products' || path === '/contact' ? '0.9' : '0.8'}</priority>
  </url>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const xml = buildSitemapXml();
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SitemapXmlPage() {
  return null;
}

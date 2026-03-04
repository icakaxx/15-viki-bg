# BGVIKI15 Project Audit Report

**Date:** March 4, 2026  
**Project:** 15-viki-bg (hc-clima.bg)  
**Auditor:** AI Code Assistant

---

## Executive Summary

| Area | Status | Key Finding |
|------|--------|-------------|
| Architecture | ⚠️ | Pages Router (not App Router) |
| `/buy` rendering | ❌ | Client-only – "Loading..." because no SSR for products |
| SEO | ⚠️ | Products not in initial HTML; missing canonical/og:image |
| Data layer | ✅ | Supabase working, but no shared client module |
| Performance | ⚠️ | N+1 queries in order APIs; no caching on product API |
| UX | ⚠️ | Skeleton loader present but products load slowly |

### Why `/buy` shows "Loading..." (Зареждане...)

1. Products are fetched **client-side only** via `useEffect` after hydration
2. `getStaticProps` only loads i18n translations, not product data
3. Initial HTML contains skeleton placeholders, not actual products
4. Google and users see "Loading..." until JavaScript executes

---

## 1. Project Architecture

### Router Type

**Pages Router** (confirmed, not App Router)

Evidence:
- `next.config.mjs` comment: `// Force Pages Router mode`
- No `app/` directory exists
- Uses `_app.js` wrapper pattern
- i18n via `next-i18next` (typical for Pages Router)

### Main Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/pages/index.js` | Redirects to `/buy` (307) |
| `/buy` | `src/pages/buy.js` | **Product catalog** (AC units) |
| `/buy/[productId]` | `src/pages/buy/[productId].js` | Product detail |
| `/products` | `src/pages/products.js` | Services/solutions overview |
| `/solutions/[solutionId]` | `src/pages/solutions/[solutionId].js` | Solution detail |
| `/checkout` | `src/pages/checkout.js` | Checkout flow |
| `/order-success` | `src/pages/order-success.js` | Order confirmation |
| `/contact` | `src/pages/contact.js` | Contact page |
| `/inquiry` | `src/pages/inquiry.js` | Inquiry form |
| `/administraciq` | `src/pages/administraciq.js` | Admin panel |
| `/admin/analytics` | `src/pages/admin/analytics.js` | Analytics dashboard |

### Folder Structure

```
15-viki-bg/
├── package.json
├── next.config.mjs
├── next-i18next.config.js
├── public/
│   ├── locales/
│   │   ├── bg/common.json
│   │   └── en/common.json
│   └── images/
├── src/
│   ├── components/
│   │   ├── Layout Components/
│   │   │   ├── Header.js
│   │   │   └── Footer.js
│   │   ├── DskCreditCalculator.js
│   │   ├── TbiCreditCalculator.js
│   │   ├── PriceFilter.js
│   │   ├── ProductsManagementTab.js
│   │   ├── OrdersManagementTab.js
│   │   ├── SEOHead.js
│   │   └── ...
│   ├── contexts/
│   │   └── CartContext.js
│   ├── lib/
│   │   ├── dskApi.js
│   │   ├── tbiApi.js
│   │   ├── analytics.js
│   │   ├── slotUtils.js
│   │   └── ...
│   ├── pages/
│   │   ├── _app.js
│   │   ├── api/           (30+ API routes)
│   │   └── ...
│   └── styles/
│       ├── globals.css
│       ├── Component Styles/
│       └── Page Styles/
```

### API Routes (Key Ones)

| Route | Purpose |
|-------|---------|
| `/api/get-products` | List products from Supabase |
| `/api/get-product` | Single product by ID |
| `/api/get-accessories` | List accessories |
| `/api/submit-order` | Create order |
| `/api/dsk-calculate` | DSK Bank credit calculation |
| `/api/tbi-calculate` | TBI Bank credit calculation |
| `/api/dsk-pay` | DSK Bank payment |
| `/api/tbi-pay` | TBI Bank payment |

---

## 2. Data Layer (Supabase)

### Initialization

**No shared client module.** Each API route creates its own Supabase client:

```javascript
// Example from src/pages/api/get-products.js
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (client-side, admin login) |

### Database Tables

| Table | Purpose |
|-------|---------|
| `products` | Main product catalog |
| `accessories` | AC accessories |
| `orders` | Customer orders |
| `order_items` | Order line items |
| `invoice_info` | Invoice data |
| `payment_and_tracking` | Payment/delivery tracking |
| `inquiries` | Customer inquiries |
| `installation_schedule` | Installation booking |
| `order_status_view` | Order status (view) |

**Note:** No separate `brands` or `categories` tables. Brand/category data is derived from `products` table columns.

### Product Query (get-products.js)

```javascript
// Columns selected
const columns = `
  id, brand, model, colour, capacity_btu, energy_rating, price, previous_price,
  image_url, stock, discount, is_archived, created_at, updated_at, cop, scop,
  power_consumption_cooling, power_consumption_heating, operating_temp_range,
  indoor_dimensions, outdoor_dimensions, noise_level, warranty_period,
  room_size_recommendation, installation_type, description, features,
  is_featured, is_bestseller, is_new
`;

// Filters
.eq('is_archived', false)  // if showArchived=false
.or(`brand.ilike.%${search}%,model.ilike.%${search}%`)  // if search provided

// Sorting
.order(sortBy, { ascending: sortOrder === 'asc' })  // default: updated_at desc

// Pagination
.range(offset, offset + limit - 1)  // default: limit=50, offset=0
```

### RLS (Row Level Security)

**Not configured in code.** All API routes use the service role key, which bypasses RLS. No migrations or policy definitions found in the codebase.

---

## 3. `/buy` Page Behavior

### Current Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Browser requests /buy                                        │
├─────────────────────────────────────────────────────────────────┤
│ 2. Next.js returns static HTML with skeleton loader             │
│    (products array is empty, loading=true)                      │
├─────────────────────────────────────────────────────────────────┤
│ 3. JavaScript hydrates, useEffect sets mounted=true             │
├─────────────────────────────────────────────────────────────────┤
│ 4. Second useEffect triggers fetch('/api/get-products')         │
│    └─► API route queries Supabase                               │
│    └─► Returns { products: [...], total, hasMore }              │
├─────────────────────────────────────────────────────────────────┤
│ 5. setProducts() updates state, setLoading(false)               │
├─────────────────────────────────────────────────────────────────┤
│ 6. Products render in grid                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Code Locations

**Loading state check (buy.js:670-686):**
```javascript
if (!mounted || loading) {
  return (
    <>
      <Head>
        <title>Buy ACs - BGVIKI15 Ltd</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('buyPage.title')}</h1>
        <p>{t('buyPage.loading')}</p>  {/* "Зареждане..." */}
        <SkeletonLoader />
      </div>
    </>
  );
}
```

**Product fetch (buy.js:66-117):**
```javascript
useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-products?showArchived=true');
      const data = await response.json();
      setProducts(data.products || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (mounted) {
    fetchProducts();
  }
}, [mounted]);
```

**getStaticProps (buy.js:1183-1191):**
```javascript
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
// ❌ Only loads translations, NOT products
```

### Why "Loading..." Appears

1. **No SSR/SSG for products** – `getStaticProps` doesn't fetch product data
2. **Client-only fetch** – Products load via `useEffect` after hydration
3. **Two-step mount** – First waits for `mounted=true`, then fetches
4. **Network latency** – API call to Supabase takes 200-500ms+

---

## 4. SEO & Rendering

### Products in Initial HTML

| Page | Products in HTML? | Method |
|------|-------------------|--------|
| `/buy` | ❌ No | Client-side fetch |
| `/buy/[productId]` | ✅ Yes | `getServerSideProps` |

**Verification:** View source of `/buy` shows:
- Empty product grid
- Skeleton loader markup
- "Зареждане..." text

### Metadata Configuration

**`/buy` metadata (buy.js:706-713):**
```html
<Head>
  <title>{t('buyPage.title')} - {t('metaTitle')}</title>
  <meta name="description" content={t('metaDescription')} />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:type" content="website" />
</Head>
```

| Element | Status |
|---------|--------|
| `<title>` | ✅ Present |
| `meta description` | ✅ Present |
| `robots` | ✅ `index, follow` |
| `og:title` | ✅ Present |
| `og:description` | ✅ Present |
| `og:image` | ❌ Missing |
| `og:url` | ❌ Missing |
| `canonical` | ❌ Missing |

**Note:** A reusable `SEOHead.js` component exists but is not used on `/buy`.

### robots.txt

❌ **Not present** in the project.

### Indexability Issues

1. **Products not crawlable** – Google sees skeleton, not products
2. **No canonical URL** – Risk of duplicate content
3. **Missing og:image** – Poor social sharing appearance
4. **No robots.txt** – Missing crawl directives

---

## 5. Performance & UX

### Data Fetching Pattern

| Aspect | Current | Optimal |
|--------|---------|---------|
| Products fetched | Up to 50 (API default) | Paginated with cursor |
| Pagination | Client-side (20/page) | Server-side |
| Caching | None | `revalidate` or SWR |

### N+1 Query Issues

**`get-order-products.js` (lines 65-154):**
```javascript
// ❌ N+1: One query per order item
const productsPromises = orderItems.map(async (item) => {
  const { data: product } = await supabase
    .from('products')
    .select('brand, model, price, image_url')
    .eq('ProductID', item.product_id)
    .single();
});
```

**`get-installed-orders.js` (lines 79-179):**
- Same pattern – separate query for each product in each order

### Image Optimization

| Location | Method | Status |
|----------|--------|--------|
| `/buy` product images | `next/image` | ✅ Good |
| `/buy/[productId]` | `next/image` | ⚠️ Missing `sizes` |
| `/checkout` | `<img>` | ❌ Not optimized |
| Bank logos | `<img>` | ❌ Hosts not in `remotePatterns` |

**next.config.mjs image config:**
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'nticlbmuetfeuwkkukwz.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
// ❌ Missing: cdn.tbibank.support, dskbank.bg
```

### Caching

| Resource | Cache Strategy |
|----------|----------------|
| `/api/get-products` | None |
| `/solutions/[solutionId]` | `revalidate: 3600` |
| DSK public key | In-memory cache |
| Product images | Browser cache only |

---

## 6. Recommendations

### Option A: SSR with `getServerSideProps` (Recommended)

**Files to change:** `src/pages/buy.js`

**Steps:**
1. Replace `getStaticProps` with `getServerSideProps`
2. Fetch products server-side
3. Pass products as props
4. Remove client-side fetch for initial load

**Example implementation:**

```javascript
// src/pages/buy.js

import { createClient } from '@supabase/supabase-js';

export async function getServerSideProps({ locale, query }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const page = parseInt(query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data: products, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      initialProducts: products || [],
      totalProducts: count || 0,
      currentPage: page,
    },
  };
}

export default function BuyPage({ initialProducts, totalProducts, currentPage }) {
  const [products, setProducts] = useState(initialProducts);
  // Products are immediately available, no loading state needed for initial render
  // ...
}
```

**Pros:**
- Products in initial HTML (SEO ✅)
- Faster perceived load time
- Google can crawl products

**Cons:**
- Slightly slower TTFB (server must query DB)
- No static caching

---

### Option B: ISR with `getStaticProps` + `revalidate`

**Files to change:** `src/pages/buy.js`

**Steps:**
1. Fetch products in `getStaticProps`
2. Add `revalidate` for ISR
3. Use client-side fetch only for filters/search

**Example implementation:**

```javascript
// src/pages/buy.js

export async function getStaticProps({ locale }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(50);

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      initialProducts: products || [],
    },
    revalidate: 300, // Regenerate every 5 minutes
  };
}
```

**Pros:**
- Fast TTFB (cached at edge)
- Products in initial HTML
- Automatic background updates

**Cons:**
- Products can be up to 5 min stale
- Full page revalidation on any change

---

### Option C: Hybrid (Recommended for Best UX)

Combine SSR for initial load with client-side updates for filters:

```javascript
export async function getServerSideProps({ locale, query }) {
  // Fetch initial products server-side
  const products = await fetchProducts({ page: 1, limit: 20 });
  
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      initialProducts: products,
    },
  };
}

export default function BuyPage({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState({});
  
  // Client-side fetch only when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchFilteredProducts(filters).then(setProducts);
    }
  }, [filters]);
  
  // Initial render has products immediately
  // ...
}
```

---

## 7. Prioritized Action Plan

| # | Task | Impact | Effort | Priority |
|---|------|--------|--------|----------|
| 1 | **Add `getServerSideProps` to `/buy`** – fetch products server-side | 🔥 High | Medium | P0 |
| 2 | **Add canonical URLs** to `/buy` and product pages | Medium | Low | P1 |
| 3 | **Add `og:image`** to `/buy` (use hero image or first product) | Medium | Low | P1 |
| 4 | **Create `robots.txt`** with sitemap reference | Medium | Low | P1 |
| 5 | **Create shared Supabase client** module (`src/lib/supabase.js`) | Low | Low | P2 |
| 6 | **Fix N+1 queries** in `get-order-products.js` and `get-installed-orders.js` | Medium | Medium | P2 |
| 7 | **Add `Cache-Control` headers** to `/api/get-products` | Medium | Low | P2 |
| 8 | **Replace `<img>` with `next/image`** in checkout and solutions | Low | Low | P3 |
| 9 | **Add image hosts to `remotePatterns`** (tbibank, dskbank) | Low | Low | P3 |
| 10 | **Use `SEOHead` component** consistently across all pages | Low | Medium | P3 |

---

## Appendix: File References

### Key Files

| File | Purpose |
|------|---------|
| `src/pages/buy.js` | Product catalog page |
| `src/pages/buy/[productId].js` | Product detail page |
| `src/pages/api/get-products.js` | Products API endpoint |
| `src/pages/api/get-product.js` | Single product API |
| `src/components/SEOHead.js` | Reusable SEO component |
| `next.config.mjs` | Next.js configuration |

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DSK_UNICID=xxx
DSK_API_URL=https://merchantsonline.dskbank.bg/api/index.php
DSK_PUBLIC_CERT_PEM=-----BEGIN PUBLIC KEY-----...
TBI_RESELLER_CODE=xxx
TBI_RESELLER_KEY=xxx
TBI_ENCRYPTION_KEY=xxx
TBI_API_URL=https://beta.tbibank.support/api
```

---

## Conclusion

The primary issue causing "Loading..." on `/buy` is **client-only product fetching**. Implementing `getServerSideProps` (Option A) will immediately resolve this and improve SEO. The remaining recommendations are lower priority but will further enhance performance and search visibility.

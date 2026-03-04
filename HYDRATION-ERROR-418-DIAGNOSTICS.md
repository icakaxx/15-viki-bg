# Hydration Error #418 — Diagnostics Export

**Error:** `Uncaught Error: Minified React error #418` (hydration mismatch)  
**Purpose:** Export exact diagnostics and code evidence to identify root cause.  
**Generated:** From repository scan and codebase evidence only.

---

## A) Runtime / Build Context

### 1) Output

#### Next.js version
- **next:** `^16.1.6` (from `package.json` line 21)

#### React version
- **react:** `^19.2.1`  
- **react-dom:** `^19.2.1`  
(from `package.json` lines 25–26)

#### Node version used in build
- Not pinned in repo. Check with: `node -v` on build host / Vercel.

#### Deployment platform
- **Detectable:** `@vercel/analytics` present (`package.json` line 17) — suggests Vercel deployment. Not confirmed in config.

#### next.config.* relevant parts
- **File:** `next.config.mjs`
- **Contents:**
  - `pageExtensions: ['js', 'jsx', 'ts', 'tsx']`
  - `images.remotePatterns`: Supabase storage host
  - `i18n: nextI18NextConfig.i18n` (from `next-i18next.config.js`)
  - `redirects`: `/` → `/buy` (307)
- **Not set:** `reactStrictMode`, `swcMinify`, `trailingSlash` (use Next defaults).

#### package.json dependencies (next / react / react-dom)
```json
"next": "^16.1.6",
"react": "^19.2.1",
"react-dom": "^19.2.1"
```

#### Build and start commands
- **Build:** `next build` (script `"build": "next build"`)
- **Start:** `next start` (script `"start": "next start"`)

---

## B) Hydration Error Evidence

### 2) Where the error occurs

- **Route:** `/buy` is the primary SSR data page and the one that renders product list, filters, and formatted prices. Error #418 is consistent with this page.
- **Bundle/component tree:** The failing tree is in the chunk that contains `src/pages/buy.js` and its descendants (e.g. `PriceFilter`, `QuantitySelector`). The minified error does not name the component; a dev build is required to get the exact component.

### 3) Reproduce locally (production mode)

Run:

```bash
cd 15-viki-bg
npm run build
npm run start
```

Then open `http://localhost:3000/buy` and:

- **Browser console:** Capture the full hydration error and any “Text content does not match” or “Did not expect server HTML to contain…” messages.
- **Server terminal:** Capture any SSR logs or errors during the request for `/buy`.

**To get the non-minified error and component stack:** Run `next build` with `NODE_ENV=development` or use a development build and load `/buy` to see the exact element and tree reported by React.

---

## C) SSR vs Client HTML Diff

### 4) How to capture and what to compare

- **SSR HTML:**  
  - With `npm run start` running, fetch: `curl -s http://localhost:3000/buy` or “View Page Source” on `/buy`.  
  - Save the response body as `buy-ssr.html`.

- **Post-hydration DOM:**  
  - In browser DevTools, after page load (and after any hydration error), copy the outer HTML of a root container (e.g. `document.querySelector('main')?.innerHTML` or the main content div) and save as `buy-client.html`.

- **Diff summary:**  
  - Compare `buy-ssr.html` and `buy-client.html` for the first place where text or attributes differ.  
  - Typical causes: different number/date formatting (e.g. `1 234,56 лв.` vs `1234.56 лв.`), different whitespace, or extra/missing nodes (e.g. from conditional client-only render).

**If full diff is not done:** Focus on:

- The first product card or the first price text (e.g. `formatPrice` / `formatPriceEUR` output).
- The “Showing X–Y of Z results” line (pagination text).
- Any text produced by `Intl.NumberFormat` or `toLocaleString` (see hotspots below).

**Exact snippet to compare (example):**  
In the SSR HTML, locate the first product price in the grid (e.g. a node with BGN or EUR). In the client DOM, locate the same product. Compare the text content of those nodes. Any difference there is a hydration mismatch.

---

## D) Code Hotspots Checklist (Exported Matches)

All matches below are in **render path or in functions called during render** (unless noted). Only SSR-rendered pages (e.g. `/buy`) can cause hydration mismatch from these.

### Date.now / new Date() / toLocaleString / Intl.NumberFormat

| File | Line(s) | Code snippet |
|------|--------|--------------|
| **src/pages/buy.js** | 227–231 | `return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(price);` |
| **src/pages/buy.js** | 236–239 | `return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(eurPrice);` |
| **src/pages/buy.js** | 429 | `{capacity ? capacity.toLocaleString() : capacity} BTU` |
| **src/pages/buy.js** | 897 | `{capacity ? capacity.toLocaleString() : capacity} BTU` (mobile filters) |
| **src/components/PriceFilter.js** | 179–180 | `min: minBound.toLocaleString('bg-BG'), max: maxBound.toLocaleString('bg-BG')` (in helper text) |
| **src/components/PriceFilterWithSlider.js** | 148–149 | `minBound.toLocaleString('bg-BG')`, `maxBound.toLocaleString('bg-BG')` |
| **src/components/PriceFilterWithSlider.js** | 226–227 | `min: minBound.toLocaleString('bg-BG')`, `max: maxBound.toLocaleString('bg-BG')` |
| **src/contexts/CartContext.js** | 367, 375 | `Intl.NumberFormat('bg-BG', ...)`, `Intl.NumberFormat('en-EU', ...)` (if cart/price rendered on /buy) |
| **src/pages/admin/analytics.js** | 56, 245 | `Intl.NumberFormat('bg-BG', ...)`, `toLocaleString()` (admin page, not /buy) |

**Note:** `en-EU` is not a standard BCP 47 locale. Node and browsers can format it differently or one may fall back, causing server HTML to differ from client.

### Math.random

| File | Line | Code snippet |
|------|------|--------------|
| **src/pages/checkout.js** | 395 | `sessionId: 'session_' + Date.now() + '_' + Math.random()...` (not in initial render of /buy) |
| **src/components/ProductsManagementTab.js** | 546 | `Date.now()-${Math.random()...}` (filename; not on /buy) |

No `Math.random` in `/buy` render path.

### window / document / navigator (in render vs in effects)

| File | Line(s) | Code snippet | In render? |
|------|--------|--------------|------------|
| **src/pages/buy.js** | 179, 185 | `document.body.style.overflow` in `openMobileFilters` / `closeMobileFilters` | No (event handlers) |
| **src/pages/buy.js** | 307–312, 325, 340, 350, 366–373 | `document.addEventListener`, `window.addEventListener`, `document.querySelector` | No (useEffect) |
| **next-i18next.config.js** | 7 | `typeof window === 'undefined' ? require('path').resolve(...) : '/locales'` | Config only (runs in Node and in client); can affect which path is used and cause different initial content if locale loading differs. |

For `/buy`, `window`/`document` usage is inside effects or handlers, so not the direct cause of a first-render mismatch.

### conditional render: typeof window / process.browser

| File | Line(s) | Code snippet |
|------|--------|--------------|
| **src/pages/administraciq.js** | 30 | `if (typeof window !== 'undefined')` (not /buy) |
| **src/lib/consentManager.js** | 14, 41, 62, 81 | `typeof window === 'undefined'` (guards, not used to render different HTML on /buy) |
| **src/lib/cookieManager.js** | 15, 41, 70, 100, 130, 162, 182 | Same (guards) |
| **src/components/ConsentProvider.js** | 62, 69 | `if (typeof window !== 'undefined')` (event listener setup) |

None of these are in the `/buy` component render path for the main content.

### localStorage / cookies in render

- No `localStorage` or `document.cookie` read during the **render** of `buy.js`.  
- CartContext loads from localStorage in **useEffect** (after mount), so it can cause mismatch only if cart-dependent UI is rendered before that effect and differs from SSR (e.g. cart count). Not in the product grid itself.

### Translations (next-i18next)

- **Locale source:** `router.locale` or `locale` from `getServerSideProps`; translations come from `serverSideTranslations(locale, ['common'])`.
- **Risk:** If server uses one locale and client first paint uses another (e.g. from `router.locale` before hydration), `t('...')` strings can differ. Ensure `getServerSideProps` and client both use the same locale for the first render.
- **buy.js:** Uses `t('buyPage....')` throughout. Same `locale` must be used on server and client for initial HTML.

### Non-deterministic sorting in render

| File | Line(s) | Code snippet |
|------|--------|--------------|
| **src/pages/buy.js** (getServerSideProps) | 1037–1040 | `brands: [...brands].sort()`, `capacities: [...capacities].sort((a,b)=>a-b)`, etc. — runs on **server** only; result is passed as props. Client uses `filterOptions` from props, so order is deterministic if props are stable. |

No client-side non-deterministic sort in the render path of `/buy`.

---

## E) Page-Specific Deep Dive (/buy)

### 6) getServerSideProps

- **File:** `src/pages/buy.js` (lines 980–1067).
- **Behavior:** Fetches paginated products and a separate “all products” fetch for filter options; computes `filterOptions` (brands, capacities, energyRatings, colors) and `priceBounds` from the full list; returns `initialProducts`, `totalProducts`, `currentPage`, `pageSize`, `ssrError`, `ssrSortBy`, `ssrSearch`, `filterOptions`, `priceBounds`, plus `serverSideTranslations(locale, ['common'])`.

### First render path (initial state from props)

- `products` = `useState(initialProducts)` → from SSR.
- `currentPage`, `pageSize`, `totalProducts` from props (no state).
- `filters` = `useState({ ..., priceRange: { min: priceBounds.min, max: priceBounds.max } })` → derived from SSR `priceBounds`.
- `sortBy` = `useState(ssrSortBy)`, `searchTerm` = `useState(ssrSearch)`.
- `filterOptions` read directly from props (`uniqueBrands`, etc.).

So the first client render uses the same props as SSR; the only way to get a mismatch is from **derived output** (e.g. formatting) or from **children** (e.g. PriceFilter).

### useEffects that change state affecting visible DOM

- **Lines 97–99:** `useEffect(() => { setLoading(false); }, [initialProducts, currentPage]);`  
  - After hydration, sets `loading` to false. If SSR never showed “Loading…” and client initially had `loading === true`, the first client paint could briefly differ. Current code sets `loading = useState(false)`, so initial client render matches SSR unless something else sets it to true before this effect.

- No other effect in `buy.js` changes state that directly controls the product grid or pagination text on first paint.

### Formatting functions used in visible text

- **formatPrice(price)** (lines 224–230): `Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(price)`.
- **formatPriceEUR(price)** (lines 233–239): `Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(eurPrice)`.
- **capacity** (lines 429, 897): `capacity.toLocaleString()` (no locale argument → environment default).

**Intl locale tags:**

- `bg-BG`: Standard; behavior can still differ slightly between Node and browser (e.g. spacing, grouping).
- **`en-EU`**: Not a valid BCP 47 locale. Node may not support it and fall back or throw; browser may render differently. This is the **single most likely** source of a server/client text mismatch on prices.

**Currency formatting:**

- BGN: Server and client might both support `bg-BG`; small differences (e.g. narrow no-break space) can still cause mismatch.
- EUR with `en-EU`: High risk of different output or fallback between Node and browser.

**Default values SSR vs client:**

- `filterOptions` and `priceBounds` are computed on server and passed as props; client does not recompute them for first render. No empty-array vs computed divergence on first paint from these.

---

## F) Minimal Fix Proposal

### 7) Most likely mismatch source

- **Primary:** **`Intl.NumberFormat('en-EU', ...)`** in `src/pages/buy.js` (lines 235–238).  
  - `en-EU` is non-standard; Node and browser can produce different strings for the same number, or one may fall back to a different locale, causing “Text content does not match” and React #418.

**Secondary (if fixing `en-EU` is not enough):**

- Use an explicit locale for `capacity.toLocaleString()` (e.g. `toLocaleString('bg-BG')` or `en-GB`) so server and client use the same one.
- Ensure PriceFilter’s `toLocaleString('bg-BG')` is only used with the same `minBound`/`maxBound` on server and client (they come from props on /buy, so should match).

### Minimal patch (single most likely fix)

**File:** `src/pages/buy.js`

**Change:** Replace the non-standard `en-EU` locale with a standard locale that yields EU-style number formatting and is widely supported in both Node and browser (e.g. `de-DE` for “1.234,56 €” or `en-GB` for “€1,234.56”). Prefer one that matches your product/market (e.g. Bulgarian users often see EU-style EUR).

**Diff:**

```diff
--- a/src/pages/buy.js
+++ b/src/pages/buy.js
@@ -232,7 +232,7 @@
   const formatPriceEUR = (price) => {
     if (price == null || isNaN(price)) return '€0.00';
     const eurPrice = price / 1.95583;
-    return new Intl.NumberFormat('en-EU', {
+    return new Intl.NumberFormat('de-DE', {
       style: 'currency',
       currency: 'EUR'
     }).format(eurPrice);
```

**Reason:** `de-DE` is a standard BCP 47 locale supported in Node and browsers with consistent EUR formatting, avoiding server/client divergence.

**Optional (if mismatch persists):** Make capacity formatting deterministic:

```diff
- {capacity ? capacity.toLocaleString() : capacity} BTU
+ {capacity != null ? capacity.toLocaleString('bg-BG') : ''} BTU
```

Apply in both places (sidebar and mobile filter panel) so server and client use the same locale.

### Verification steps (after applying fix)

1. **Production build:**  
   `npm run build && npm run start`

2. **Load /buy:**  
   Open `http://localhost:3000/buy` (or your production URL). Hard refresh (Ctrl+Shift+R / Cmd+Shift+R).

3. **Console:**  
   Confirm there is no “Minified React error #418” and no “Hydration failed” or “Text content does not match” in the console.

4. **View source vs Inspect:**  
   - View Page Source for `/buy`.  
   - Find the first product price (EUR) in the HTML.  
   - In the live DOM, find the same price element.  
   - Confirm the text is identical (including spaces and symbols).

5. **Change page/sort:**  
   Go to page 2 or change sort; confirm no hydration error and prices still render consistently.

6. **Deploy:**  
   Deploy to Vercel (or your host), open production `/buy`, and repeat steps 3–5.

---

## Summary Table

| Section | Finding |
|--------|---------|
| A | Next 16.1.6, React 19.2.1, Pages Router, i18n from next-i18next. |
| B | Route: /buy. Reproduce with `npm run build && npm run start` and capture console + server logs. |
| C | Compare SSR HTML vs post-hydration DOM; first divergence is likely around price or “Showing X–Y of Z” text. |
| D | Hotspots: `Intl.NumberFormat('en-EU', ...)` and `toLocaleString()` in buy.js and PriceFilter. |
| E | getServerSideProps feeds initial state; formatPriceEUR('en-EU') and capacity.toLocaleString() are used in visible output. |
| F | Replace `en-EU` with `de-DE` (minimal patch); optionally fix capacity locale. Verify with production build and deploy. |

All claims above reference file paths, line numbers, or code snippets from the repository.

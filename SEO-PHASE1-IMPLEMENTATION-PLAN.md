# SEO Phase 1 — Implementation Plan & Risk Assessment

**Document:** Phase A — Analysis Only (No Code Yet)  
**Date:** March 2025  
**Scope:** Sitemap, metadata, solution paths, homepage CTA, Products → Services labeling, footer, local SEO (Lovech)

---

## 1. Current Implementation Map

### Files That Control Key Functionality

| Concern | File(s) | Notes |
|---------|---------|-------|
| **Header/Navigation** | `src/components/Layout Components/Header.js` | Uses `navigationItems` array; links: `/`, `/products`, `/buy`, `/inquiry`, `/contact`. Labels from `t('nav.*')`. |
| **Footer** | `src/components/Layout Components/Footer.js` | `navigationItems` + `policyItems`; same 5 pages + `/privacy-policy`, `/cookie-policy`. Labels from `t('footer.navigation.*')`. |
| **Homepage (Index)** | `src/pages/index.js` | Hero, about, CTA. **Currently never shown** — see Redirect below. |
| **Redirect / → /buy** | `next.config.mjs` | `redirects()`: `source: '/'` → `destination: '/buy'`, `permanent: false`. |
| **Sitemap** | *(none)* | robots.txt references `/sitemap.xml` but no sitemap file or route exists → **404**. |
| **Metadata/Titles** | Per-page `Head` in each page | `index.js`, `buy.js`, `products.js`, `contact.js`, `inquiry.js`, `privacy-policy.js`, `cookie-policy.js`, `buy/[productId].js`. |
| **Translation keys** | `public/locales/bg/common.json`, `public/locales/en/common.json` | `metaTitle`, `metaDescription`, `nav.*`, `footer.navigation.*`, `productsPage.*`, `contactPage.*`, `inquiryPage.*`, `buyPage.*`. |
| **Products/Solutions labels** | Same locales + `nav.products`, `productsPage.title`, `footer.navigation.products` | BG: "Продукти и решения". EN: "Products & Solutions". |
| **Solution routes** | `src/pages/solutions/[solutionId].js`, `src/lib/solutionsData.js` | `solutions` object: `chillers`, `vrv-vrf`, `heat-pumps`, `cold-rooms`, `ventilation`. **No `air_conditioning`** in route handler. |
| **Products → Solution links** | `src/pages/products.js` | `onClick`: `air_conditioning` → `router.push('/buy')`; others → `router.push(\`/solutions/${id}\`)`. No href to `/solutions/air_conditioning`. |
| **robots.txt** | `public/robots.txt` | Allows `/`, disallows `/api/`, `/administraciq`, `/admin/`. Sitemap: `https://www.hc-clima.bg/sitemap.xml`. |
| **Canonical/meta** | `buy.js` has `rel="canonical"` for `/buy`. | Other pages: no canonical in current code. |

### Important Structural Finding: Homepage Redirect

**The site redirects `/` to `/buy`.** The real homepage (`index.js`) is never served. Users and crawlers visiting `hc-clima.bg/` are redirected (307) to `/buy`.

**Implication for "Add homepage CTA to /buy":**  
If we keep the redirect, there is no separate homepage — `/buy` effectively is the homepage. The "homepage CTA to /buy" improvement then means either:
- **(A)** Remove the redirect, show the real homepage (`index.js`), and add a clear CTA button to `/buy` in the hero, **or**
- **(B)** Keep the redirect; the improvement is satisfied because `/buy` already is the landing page.

**Recommendation:** Remove the redirect and restore the homepage. The audit assumes a distinct homepage with hero and CTAs. The current redirect hides valuable content (about, services overview, trust signals) and may hurt SEO. **This change affects site structure** — it is medium risk and should be confirmed.

---

## 2. Safe Change Candidates

### 2.1 Sitemap (`/sitemap.xml`)

| Aspect | Detail |
|--------|--------|
| **Files** | New: `src/pages/sitemap.xml.js` (Next.js API route) or `src/pages/sitemap.xml/index.js` — Next.js 12+ supports `getServerSideProps` for dynamic routes. **Better:** Use `pages/sitemap.xml.js` as a page that returns XML with `Content-Type: application/xml`. |
| **Implementation** | Create `src/pages/sitemap.xml.js` that: (1) Returns `application/xml`; (2) Lists static URLs: `/`, `/products`, `/buy`, `/contact`, `/inquiry`, `/privacy-policy`, `/cookie-policy`; (3) Lists `/solutions/chillers`, `/solutions/vrv-vrf`, `/solutions/heat-pumps`, `/solutions/cold-rooms`, `/solutions/ventilation`; (4) Optionally fetches product IDs from Supabase and lists `/buy/[id]` (requires env vars at build/SSR). |
| **Risk** | **Low.** New file only. No change to existing routes. |
| **Isolated?** | Yes. Only adds a new route. |
| **Product URLs** | `fetchProductsServer` needs Supabase. At build time, `getStaticProps` cannot run async DB. Use `getServerSideProps` for sitemap page, or a separate API route that returns XML. |

### 2.2 SEO Metadata Review

| Page | Current State | Safe Improvements |
|------|---------------|-------------------|
| **Homepage** (index) | Uses `metaTitle`, `metaDescription` (global). | Add Lovech to meta description if we restore homepage. |
| **/buy** | Uses `buyPage.title` + `metaTitle`; `metaDescription` (generic). | Add `buyPage.metaDescription` in locales; include Lovech naturally. |
| **/products** | `productsPage.title`, `productsPage.metaDescription`. | Add Lovech to metaDescription if desired. |
| **/contact** | `contactPage.title`, `contactPage.metaDescription`. | Already has Lovech in address; can strengthen meta. |
| **/inquiry** | `inquiryPage.title`, `inquiryPage.metaDescription`. | Optional: mention Lovech region. |
| **Solution pages** | No dedicated Head in `[solutionId].js` — uses Layout only. | Add Head with dynamic title/description per solution. |
| **Privacy / Cookie** | Standard. | No change unless local relevance needed. |

**Risk:** **Low.** Only translation values and per-page Head. No logic changes.

### 2.3 Broken Solution Paths

| Issue | Detail | Fix |
|-------|--------|-----|
| **`/solutions/air_conditioning`** | Not in `solutions` object in `[solutionId].js`. Visiting this URL shows "Solution not found". | Products page correctly uses `router.push('/buy')` for air_conditioning — no internal link. Someone could still land via external link or typo. **Fix:** Add `air_conditioning` to solutions with redirect to `/buy`, or add a minimal page that redirects. **Safest:** Add entry that redirects (Next.js redirect in getServerSideProps or client-side redirect). |
| **Other solution IDs** | `chillers`, `vrv-vrf`, `heat-pumps`, `cold-rooms`, `ventilation` — all valid. | No fix needed. |

**Risk:** **Low.** Add one route handler branch or redirect. No change to products.js logic.

### 2.4 Homepage CTA to /buy

| Aspect | Detail |
|--------|--------|
| **Precondition** | Must remove redirect `/` → `/buy` to show the real homepage. |
| **Files** | `next.config.mjs` (remove redirect), `src/pages/index.js` (add CTA link). |
| **Change** | In `index.js` hero buttons: add a third button or replace/adjust: e.g. "Купи климатици" → `/buy`. Currently: "Разгледай услуги" → `/products`, "Заяви оферта" → `/contact`. Add "Купи климатици" → `/buy` as primary or secondary CTA. |
| **Risk** | **Medium.** Removing redirect changes user flow. Users used to landing on `/buy` will now see homepage first. |
| **Rollback** | Restore redirect in next.config.mjs. |

### 2.5 "Products" → "Services and Solutions"

| Aspect | Detail |
|--------|--------|
| **Current** | BG: "Продукти и решения"; EN: "Products & Solutions". |
| **Target** | BG: "Услуги и решения"; EN: "Services and Solutions". |
| **Files** | `public/locales/bg/common.json`, `public/locales/en/common.json`. Keys: `nav.products`, `footer.navigation.products`, `productsPage.title`. |
| **Route** | Stays `/products`. No route change. |
| **Risk** | **Low.** Translation-only. |
| **Binding check** | Header and Footer use `t('nav.products')` and `t('footer.navigation.products')` — no hardcoded strings. productsPage uses `t('productsPage.title')`. |

### 2.6 Footer Improvement

| Aspect | Detail |
|--------|--------|
| **Current** | Nav (5 links) + Policies (2 links) + Contact. |
| **Proposed** | Add "Услуги" / "Services" section with links to: `/solutions/heat-pumps`, `/solutions/chillers`, `/solutions/vrv-vrf`, `/solutions/cold-rooms`, `/solutions/ventilation`. Rename "Навигация" to clearer structure. Keep policies and contact. |
| **Files** | `src/components/Layout Components/Footer.js`, possibly new translation keys. |
| **Risk** | **Low.** Additive link changes. Ensure all solution URLs are valid. |

### 2.7 Local SEO for Lovech

| Area | Current | Safe Improvement |
|------|---------|-------------------|
| **Homepage meta** | Generic Bulgaria. | Add "Ловеч и региона" / "Lovech and region" naturally. |
| **/buy meta** | Generic. | Add buy-specific meta with Lovech. |
| **/contact** | Address: "Ловеч Център, ул. 'Търговска' 60". | Already good. Can add subtitle/tagline: "Климатици и климатизация в Ловеч". |
| **Footer** | Tagline generic. | Add "Ловеч и региона" in brand/tagline section. |
| **Schema** | Not present. | Add LocalBusiness schema on contact — **medium effort**, verify when implemented. |

**Risk:** **Low** for copy/meta. **Medium** for schema if done incorrectly.

---

## 3. Risk Assessment

### High Risk (Do Not Change Without Explicit Approval)

| Item | Risk | Reason |
|------|------|--------|
| Checkout flow | — | Do not touch. |
| Product fetch/filter logic | — | Do not touch. |
| API routes (pay, orders, inquiry) | — | Do not touch. |
| Admin/administraciq | — | Already disallowed in robots. |

### Medium Risk (Verify Before/After)

| Item | Risk | Mitigation |
|------|------|------------|
| **Removing / → /buy redirect** | Users accustomed to landing on /buy will see homepage first. May affect bounce/conversion short-term. | A/B test or monitor analytics. Easy rollback. |
| **Sitemap fetching products** | Requires Supabase at request time. If env missing, sitemap may fail. | Fallback: list only static URLs if fetch fails. |
| **Adding `air_conditioning` redirect** | Must not break existing solution routes. | Use redirect in getServerSideProps before render, or add redirect in next.config for `/solutions/air_conditioning` → `/buy`. |

### Low Risk (Safe to Proceed)

| Item | Risk |
|------|------|
| New sitemap route | None. |
| Translation updates (nav, footer, products) | None. |
| Metadata updates in locales | None. |
| Footer link additions | None if URLs are valid. |
| Homepage hero CTA addition (if redirect removed) | Low. |

### Potential Breaking Points

| Scenario | Mitigation |
|----------|------------|
| Translation key typo | Test both locales after change. |
| Footer link to non-existent solution | Only link to IDs in `solutions` object. |
| Sitemap 404 if route misconfigured | Use standard Next.js page for `/sitemap.xml`. |

---

## 4. Local SEO Opportunities (Lovech)

### Natural Placement (No Keyword Stuffing)

1. **Homepage** (if restored): Tagline or meta: "Климатици и климатизация в Ловеч и региона | БГВИКИ15"
2. **/buy**: Meta: "Купи климатици в Ловеч – професионален монтаж и гаранция. Налични марки като Daikin, Gree, Mitsubishi."
3. **/contact**: Meta: "Контакти – БГВИКИ15 | Климатици и HVAC решения в Ловеч. Офис, телефон, работно време."
4. **/products**: Meta: "Услуги и решения за климатизация в Ловеч – продажба, монтаж, сервиз."
5. **Footer tagline**: "Качество и надеждност от 2000 г. – Ловеч и региона"

### Do Not

- Repeat "Ловеч" in every sentence.
- Create doorway pages.
- Add fake service area claims.
- Stuff keywords in H1s.

---

## 5. Final Pre-Implementation Plan (Execution Order)

### Step 1: Sitemap (Low Risk)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Create `src/pages/sitemap.xml.js` that returns XML with static URLs + solution URLs. Optionally fetch product IDs and add `/buy/[id]` (with error fallback). | New file | `/sitemap.xml` returns 200 with valid sitemap | Delete file |

### Step 2: Fix /solutions/air_conditioning (Low Risk)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Add redirect in `next.config.mjs`: `/solutions/air_conditioning` → `/buy` (permanent: false). | `next.config.mjs` | Visiting `/solutions/air_conditioning` redirects to /buy | Remove redirect |

**Alternative:** Add `air_conditioning` to `[solutionId].js` that redirects. Prefer next.config for simplicity.

### Step 3: Products → Services and Solutions (Low Risk)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Update `nav.products`, `footer.navigation.products`, `productsPage.title` in bg and en locales. BG: "Услуги и решения"; EN: "Services and Solutions". | `public/locales/bg/common.json`, `public/locales/en/common.json` | Nav and footer show new labels | Revert translations |

### Step 4: Homepage Redirect & CTA (Medium Risk — Requires Confirmation)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Remove redirect `/` → `/buy` from `next.config.mjs`. Add "Купи климатици" CTA button in `index.js` hero linking to `/buy`. | `next.config.mjs`, `src/pages/index.js` | Homepage visible; clear CTA to buy | Restore redirect; remove CTA |

**Decision needed:** Confirm removal of redirect. If not, skip this step.

### Step 5: Footer Improvement (Low Risk)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Add "Услуги" / "Services" section in Footer with links to 5 solution pages. Add translation keys for section title and solution labels. | `Footer.js`, locales | Footer has solution links | Remove section |

### Step 6: Metadata & Local SEO (Low Risk)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Add/update `buyPage.metaDescription`, `contactPage.metaDescription` with Lovech. Update `metaDescription` in bg for homepage. Add solution page Head with title/description. | `common.json`, `[solutionId].js` | Better meta for SEO and local intent | Revert translations and Head |

### Step 7: Solution Page Metadata (Low Risk)

| Action | File(s) | Outcome | Rollback |
|--------|---------|---------|----------|
| Add `Head` to `[solutionId].js` with dynamic title and meta description per solution. | `[solutionId].js` | Solution pages have proper meta | Remove Head |

---

## 6. Summary: Safe vs Unsafe

### Safe to Implement (Phase B)

- Sitemap
- Redirect for `/solutions/air_conditioning`
- Products → Services and Solutions (translations)
- Footer solution links
- Metadata updates (buy, contact, products, inquiry)
- Solution page Head/metadata
- Local SEO copy in meta descriptions

### Requires Explicit Decision

- **Remove `/` → `/buy` redirect** — restores homepage, enables homepage CTA. Medium risk, high impact.

---

## 7. Exact Files to Be Touched

| File | Changes |
|------|---------|
| `next.config.mjs` | Remove `/` → `/buy` redirect (optional); add `/solutions/air_conditioning` → `/buy` redirect. |
| `src/pages/sitemap.xml.js` | **New.** Dynamic sitemap. |
| `src/pages/index.js` | Add CTA link to `/buy` in hero (if redirect removed). |
| `src/components/Layout Components/Footer.js` | Add "Услуги" section with solution links. |
| `src/pages/solutions/[solutionId].js` | Add Head with title/meta. |
| `public/locales/bg/common.json` | `nav.products`, `footer.navigation.products`, `productsPage.title`, `buyPage.metaDescription`, `contactPage.metaDescription`, `metaDescription`, new footer keys. |
| `public/locales/en/common.json` | Same keys, English. |

**Total new files:** 1 (sitemap).  
**Total modified files:** 6–7.

---

*End of Phase A. Proceed to Phase B (implementation) only for approved, safe items.*

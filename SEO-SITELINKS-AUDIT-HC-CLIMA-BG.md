# SEO & Sitelinks Audit: hc-clima.bg

**Report Date:** March 2025  
**Focus:** Site structure, SEO health, and sitelink eligibility for branded Google searches

---

## 1. General Overview of the Website

### Type of Website
hc-clima.bg is a **B2B/B2C e-commerce and service website** for a Bulgarian HVAC company (БГВИКИ15 ЕООД). It sells air conditioners, offers consultation/inquiry forms, and presents broader HVAC solutions (chillers, VRV/VRF, heat pumps, cold rooms, ventilation).

### Main Purpose
- **Primary:** Generate leads and sell AC units (online catalog with checkout).
- **Secondary:** Inform about services (installation, maintenance, solutions) and build trust.

### Main User Journeys
1. **Buy journey:** Homepage / products → Buy AC → Product detail → Add to cart → Checkout → Order success  
2. **Inquiry journey:** Homepage / products → Inquiry form → Submit  
3. **Contact journey:** Homepage / contact → View contacts / map / call  
4. **Info journey:** Products → Solution detail (e.g. heat pumps) → Inquiry or contact

### Overall Structure
The structure is **reasonably clear** but has some confusion:
- **Header/Footer:** 5 main links (About, Products, Buy, Inquiry, Contact) + Privacy / Cookie policies in footer.
- **Homepage:** Hero, about, CTA; appears to be separate from `/buy` (product listing). *(Note: Live site may redirect `/` to `/buy` – needs verification.)*
- **Overlap:** “Products” (`/products`) shows service categories; “Buy” (`/buy`) is the AC shop. New users may not immediately distinguish between them.
- **Solution pages:** `/solutions/[id]` (heat-pumps, chillers, vrv-vrf, etc.) exist, but “air_conditioning” goes to `/buy` and is not a standalone solution page.

---

## 2. Site Architecture and Navigation

### Main Pages and Sections

| URL | Purpose | In header | In footer |
|-----|---------|-----------|-----------|
| `/` | Homepage (hero, about, CTA) | ✓ “За нас” | ✓ |
| `/products` | Products & solutions overview | ✓ | ✓ |
| `/buy` | AC catalog / shop | ✓ | ✓ |
| `/buy/[productId]` | Product detail | — | — |
| `/inquiry` | Inquiry form | ✓ | ✓ |
| `/contact` | Contact page | ✓ | ✓ |
| `/solutions/[solutionId]` | Solution detail (heat-pumps, chillers, etc.) | — | — |
| `/checkout` | Checkout form | — | — |
| `/order-success` | Order confirmation | — | — |
| `/privacy-policy` | Privacy policy | — | ✓ |
| `/cookie-policy` | Cookie policy | — | ✓ |
| `/administraciq` | Admin | — | — (correctly hidden) |

### How Pages Are Connected
- **Header:** `/`, `/products`, `/buy`, `/inquiry`, `/contact` — direct links.
- **Footer:** Same 5 main pages + Privacy + Cookie.
- **From products:** “Научи повече” on cards → `/buy` (for AC) or `/solutions/[id]` (others).
- **From solution pages:** Back to `/products`, links to `/inquiry` and `/contact`.
- **From contact/inquiry:** Links to `/buy`, `/inquiry`, `/contact`.
- **Product cards on `/buy`:** Link to `/buy/[id]` and `#installments`.

### Navigation Assessment
- **Simple:** Yes — few top-level items.
- **Logical:** Partly — “Products” vs “Buy” can be unclear.
- **User-friendly:** Reasonably so; main actions (buy, inquire, contact) are easy to find.

### Hidden or Weakly Linked Pages
- **Solution pages** (`/solutions/heat-pumps`, etc.): Not in header/footer; reachable only from `/products` cards.
- **Checkout / Order success:** Correctly not in nav (conversion funnels).
- **Product detail pages:** Only from `/buy`; no direct header link (acceptable).

---

## 3. Best Sitelink Candidates

Google shows sitelinks for **branded queries** (e.g. “hc-clima”, “БГВИКИ15”) based on:
- Clear hierarchy and internal linking
- Distinct, valuable content
- Strong crawlability and relevance
- Sufficient authority for the brand

### Strong Candidates (ranked)

| Rank | Page | Why good | Why weaker |
|------|------|----------|------------|
| 1 | `/buy` — Купи климатици | Primary conversion; core product listing. Clear purpose. | Title could be more distinct from brand. |
| 2 | `/contact` | Contact is a common sitelink; clear intent. | — |
| 3 | `/products` | Overview of services; informative and unique. | Overlaps conceptually with `/buy`. |
| 4 | `/inquiry` | Lead gen; distinct action. | Form page; less “content-rich” than others. |
| 5 | `/privacy-policy` | Standard sitelink for trust pages. | Low user priority; useful but not primary. |
| 6 | `/solutions/heat-pumps` (or similar) | Unique, long-form content. | No header/footer link; poorly exposed. |

### Weaker Candidates
- **Product detail pages** (`/buy/136`, etc.): Too many; individual URLs rarely sitelinked for small catalogs.
- **Checkout / Order success:** Transactional; not suitable for sitelinks.
- **Cookie policy:** Similar to privacy; secondary.
- **Homepage:** May compete with branded result; sitelinks usually show sub-pages.

### Recommendation
For branded queries, Google is most likely to show sitelinks for: **Купи климатици**, **Контакти**, **Продукти и решения**, **Направи запитване**, and possibly **Политика за поверителност** — if internal linking, crawlability, and content are improved.

---

## 4. Internal Linking Evaluation

### Header
- Links: `/`, `/products`, `/buy`, `/inquiry`, `/contact`
- **Gap:** No link to solutions or policy pages.

### Footer
- Same 5 main pages + `/privacy-policy`, `/cookie-policy`
- **Good:** Policy pages are linked.

### Homepage (from codebase)
- Links to `/products` and `/contact` in hero CTAs
- Links to `/products` in CTA section
- **Gap:** No direct link to `/buy` in hero; users go Products → Buy. Adding “Купи климатици” to the hero would strengthen it.

### Contextual Links
- **Products page:** Buttons go to `/buy` (AC) or `/solutions/[id]` (others) — good.
- **Contact / Inquiry:** Link to each other and `/buy` — good.
- **Solution pages:** Link back to `/products`, `/inquiry`, `/contact` — good.
- **Product cards:** Link to `/buy/[id]` and `#installments` — good.

### Missing or Weak Link Paths
1. **Solution pages** not in header/footer — only reachable from `/products`.
2. **“Купи климатици”** not prominently on homepage — users must go via Products.
3. **Product detail → related products:** Unknown; cross-linking could help.
4. **Footer:** No “Купи климатици” call-out separate from generic nav (though it is in the list).

---

## 5. Technical SEO Considerations

### Crawlability and Indexability
- **robots.txt:** Allows `/`; disallows `/api/`, `/administraciq`, `/admin/` — correct.
- **Sitemap:** Referenced in robots.txt (`/sitemap.xml`) but returns **404** — critical fix.
- **Rendering:** Next.js; most content is server-rendered or static. Product list and detail use `getServerSideProps` — content in initial HTML.

### JavaScript Dependency
- **Product listing** (`/buy`): SSR via `getServerSideProps` — content present in HTML.
- **Product detail** (`/buy/[id]`): SSR — content in HTML.
- **Homepage, Products, Contact, Inquiry, etc.:** `getStaticProps` — static HTML.
- **Filters (brand, BTU, price):** Client-side; filtered state is not critical for indexing.
- **Conclusion:** Core content does not rely on heavy JavaScript for indexing.

### Technical Issues
1. **Sitemap 404** — Google cannot use it for discovery.
2. **Solution pages** — `getStaticPaths` pre-generates only `heat-pumps`; others use `fallback: 'blocking'` (first request may be slower).
3. **`/solutions/air_conditioning`** — not defined in solution pages; shows “Solution not found” — UX and crawl issue.
4. **Canonical / hreflang:** Not verified in fetched content; recommend checking for multi-language support.

### Content in Initial HTML
- Pages use Next.js SSR/SSG — main content, titles, meta, and headings are in the initial HTML. No major reliance on client-side rendering for critical content.

---

## 6. On-Page SEO Signals

### Page Titles (from fetched pages)
- `/buy`: “Купи климатици - БГВИКИ15 ЕООД - Климатици и климатизация”
- `/contact`: “Контакти - БГВИКИ15 ЕООД - Климатици и климатизация”
- `/inquiry`: “Направи запитване - БГВИКИ15 ЕООД - Климатици и климатизация”
- `/products`: “Продукти и решения - БГВИКИ15 ЕООД - Климатици и климатизация”
- `/privacy-policy`: “Политика за поверителност” (likely with brand suffix)

**Assessment:** Consistent brand suffix; purpose clear. Good.

### Headings and Purpose
- **Products:** H1 “Продукти и решения”; clear.
- **Contact:** H2 “Свържете се с нас”; purpose obvious.
- **Inquiry:** H2 “Безплатна консултация и оферта”; clear.
- **Buy:** H2 “Филтри” visible; main H1 may be in page structure — worth verifying.
- **Solution (heat-pumps):** H1 with solution title; good.

### Content Uniqueness
- Main pages have distinct content.
- Product detail pages are unique per product.
- Solution pages are unique per solution.
- Risk of thin content on some solution pages (e.g. cold rooms, ventilation) — worth enriching.

### Pages Needing Stronger Structure
- **Buy:** Ensure a clear, unique H1 (e.g. “Купи климатици” or similar) above the product grid.
- **Homepage:** Confirm H1 matches main value proposition.
- **Product detail:** Verify H1 = product name (Brand + Model).

---

## 7. UX vs SEO Balance

### Current State
- Navigation is simple and task-oriented.
- Main journeys (buy, inquire, contact) are clear.
- “Products” vs “Buy” can confuse users expecting a single “shop” entry.

### SEO Improvements vs UX
- **Adding solution links to footer:** Helps SEO and power users; does not hurt UX.
- **Adding “Купи климатици” to homepage hero:** Improves SEO and UX.
- **Fix air_conditioning solution:** Improves UX (no “Solution not found”).
- **Sitemap fix:** SEO-only; no UX impact.
- **More internal links in content:** Can help SEO; avoid link spam.

### Recommended Balance
- Keep header minimal; add 1–2 high-value links (e.g. “Купи климатици” more prominent) if it clarifies the journey.
- Add solution links in footer under a “Услуги” or “Решения” section.
- Ensure homepage clearly connects to both “Услуги” (products) and “Купи” (shop).

---

## 8. Key Problems (Prioritized)

| Priority | Problem | Impact |
|----------|---------|--------|
| 1 | **Sitemap 404** | Google cannot use sitemap for discovery; hurts crawl efficiency and indexing. |
| 2 | **Solution pages not in header/footer** | Important content underlinked; weaker sitelink and relevance signals. |
| 3 | **`/solutions/air_conditioning` → “Solution not found”** | Bad UX; broken internal link and possible crawl waste. |
| 4 | **Homepage does not link directly to “Купи”** | Weakens authority and clarity of the main commercial page. |
| 5 | **Products vs Buy overlap** | Possible keyword cannibalization; users may be unsure where to shop. |
| 6 | **No dedicated breadcrumbs** | Weaker hierarchy signals (minor for sitelinks). |

---

## 9. Action Plan

### Quick Wins (1–2 days)
1. **Fix sitemap** — Implement `/sitemap.xml` (dynamic or static) listing: `/`, `/products`, `/buy`, `/contact`, `/inquiry`, `/privacy-policy`, `/cookie-policy`, `/solutions/*`, `/buy/[id]`.
2. **Fix air_conditioning** — Either add `air_conditioning` to solution pages or change products page to link to `/buy` (already done) and remove any broken `/solutions/air_conditioning` links.
3. **Add “Купи климатици” to homepage hero** — Extra CTA button linking to `/buy`.
4. **Verify H1 on `/buy`** — Ensure a clear, descriptive H1 is present.

### Medium-Priority (1–2 weeks)
5. **Add solution links to footer** — New section “Услуги” or “Решения” with links to `/solutions/heat-pumps`, `/solutions/chillers`, etc.
6. **Clarify Products vs Buy** — E.g. rename “Продукти” to “Услуги и решения” and make “Купи климатици” the obvious shop entry.
7. **Enrich solution pages** — Add more unique text where content is thin.
8. **Canonical and hreflang** — If BG/EN versions exist, implement correctly.

### High-Impact Structural (2–4 weeks)
9. **Strengthen internal linking** — More contextual links from product detail → related products, solutions → buy.
10. **Breadcrumbs** — Add breadcrumbs on product detail, solutions, etc.
11. **Schema markup** — LocalBusiness, Product, BreadcrumbList where applicable.
12. **Content strategy** — Blog or guides (e.g. “Как да изберете климатик”) to support authority and long-tail searches.

---

## 10. Final Recommendation

### Is hc-clima.bg currently a realistic sitelink candidate for branded Google searches?

**Assessment: Partially – with conditions.**

**Reasons it could qualify:**
- Clear site structure and main sections.
- Core content in initial HTML (SSR/SSG).
- Main pages well-linked from header and footer.
- Distinct, branded page purposes.
- robots.txt correctly configured.

**Reasons it may not yet qualify:**
1. **Sitemap 404** — Significant technical gap.
2. **Solution pages underlinked** — Important content is not part of the main navigation.
3. **Low page count** — Fewer than ~6 strong, well-linked pages limit sitelink options.
4. **Brand authority** — Sitelinks depend on brand recognition; smaller brands may not get them even with a good structure.

### Under what conditions could sitelinks appear?

- Sitemap fixed and submitted.
- Solution pages (or equivalent high-value pages) linked from header/footer.
- No critical crawl/index issues.
- Increased brand searches and domain authority over time.

### Top actions to increase sitelink likelihood

1. Fix `/sitemap.xml` and submit in Search Console.
2. Link solution pages from footer (and consider header if it stays clean).
3. Add “Купи климатици” to the homepage hero.
4. Fix `/solutions/air_conditioning` (or remove the broken path).
5. Ensure each important page has a clear H1, unique title, and meta description.

---

*End of report. For implementation details, refer to the Action Plan section.*

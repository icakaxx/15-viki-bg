# SEO Phase 1 — Changelog

**Date:** March 2025  
**Scope:** Sitemap, redirects, labels, footer, metadata, local SEO (Lovech), solution page Head/meta

---

## Summary

Implementations from SEO Phase 1 audit. All changes are safe, additive, or translation-only. No business logic, checkout, filters, forms, admin, or payment flows were modified. The `/` → `/buy` redirect was **kept** as requested.

---

## 1. Sitemap — Working `/sitemap.xml`

**File created:** `src/pages/sitemap.xml.js`

- Dynamic sitemap route returning valid XML with `Content-Type: application/xml`
- **Included URLs:**
  - Static: `/`, `/products`, `/buy`, `/contact`, `/inquiry`, `/privacy-policy`, `/cookie-policy`
  - Solutions: `/solutions/chillers`, `/solutions/vrv-vrf`, `/solutions/heat-pumps`, `/solutions/cold-rooms`, `/solutions/ventilation`
- Product detail pages (`/buy/[id]`) not included (would require Supabase fetch; left for future enhancement)
- Cache header: `public, max-age=3600`
- `robots.txt` already pointed to `https://www.hc-clima.bg/sitemap.xml` — now resolves correctly

---

## 2. Redirect — `/solutions/air_conditioning` → `/buy`

**File modified:** `next.config.mjs`

- Added redirect: `source: '/solutions/air_conditioning'` → `destination: '/buy'`, `permanent: false`
- Prevents "Solution not found" for visitors reaching this URL
- Existing redirect `/` → `/buy` unchanged

---

## 3. Label Change — "Products" → "Services and Solutions"

**Files modified:**
- `public/locales/bg/common.json`
- `public/locales/en/common.json`

**Keys updated:**
- `nav.products`: BG "Услуги и решения" | EN "Services and Solutions"
- `footer.navigation.products`: same
- `productsPage.title`: same

**Route:** `/products` — unchanged. Only visible labels updated.

---

## 4. Footer — Services Section

**File modified:** `src/components/Layout Components/Footer.js`

- New section **"Услуги" / "Services"** with links to:
  - `/solutions/chillers`
  - `/solutions/vrv-vrf`
  - `/solutions/heat-pumps`
  - `/solutions/cold-rooms`
  - `/solutions/ventilation`
- Uses `footer.services.*` translation keys
- Styling reuses `policySection` styles

**New translation keys (bg + en):**
- `footer.services.title`
- `footer.services.chillers`, `vrvVrf`, `heatPumps`, `coldRooms`, `ventilation`

---

## 5. Metadata Improvements

**Files modified:**
- `public/locales/bg/common.json`
- `public/locales/en/common.json`
- `src/pages/buy.js`

**Changes:**
- **Global** `metaDescription`: Lovech-focused copy in Bulgarian and English
- **buyPage.metaDescription** (new): page-specific meta for `/buy`
- **buy.js**: uses `t('buyPage.metaDescription')` with fallback to `t('metaDescription')`
- **productsPage.metaDescription**: updated with Lovech and services
- **contactPage.metaDescription**: updated with Lovech
- **inquiryPage.metaDescription**: updated with Lovech

---

## 6. Local SEO — Lovech and Region

**Files modified:** `public/locales/bg/common.json`, `public/locales/en/common.json`

**Changes:**
- `metaDescription`: "климатици в Ловеч и региона" / "Lovech and the region"
- `footer.brandInfo.tagline`: "Качество и надеждност от 2000 г. – Ловеч и региона"
- Meta descriptions for buy, contact, inquiry, products include Lovech
- Solution meta descriptions include "в Ловеч" / "in Lovech"
- No keyword stuffing; wording kept natural

---

## 7. Solution Pages — Head and Meta

**File modified:** `src/pages/solutions/[solutionId].js`

- Added `Head` with:
  - Dynamic `title`: solution title + brand
  - `meta description`: `solutions.[id].metaDescription` or fallback to `solutions.[id].short`
  - `robots`: index, follow
  - `rel="canonical"` with full URL
- **New translation keys** `solutions.[id].metaDescription` for: chillers, vrv_vrf, heat_pumps, cold_rooms, ventilation

---

## Files Changed — Quick Reference

| File | Change Type |
|------|-------------|
| `src/pages/sitemap.xml.js` | **New** |
| `next.config.mjs` | Modified (redirect) |
| `src/components/Layout Components/Footer.js` | Modified (services section) |
| `src/pages/solutions/[solutionId].js` | Modified (Head, meta) |
| `src/pages/buy.js` | Modified (meta description source) |
| `public/locales/bg/common.json` | Modified (translations) |
| `public/locales/en/common.json` | Modified (translations) |

---

## Intentionally Not Changed

- `/` → `/buy` redirect
- Checkout flow
- Product logic, filters, cart
- Forms (inquiry, contact)
- Admin and API routes
- Payment / leasing / financing flows

---

## Manual Verification Checklist

- [ ] Homepage (redirects to `/buy`) loads
- [ ] Header navigation works (labels show "Услуги и решения" / "Services and Solutions")
- [ ] Footer links work (main nav + services + policies)
- [ ] `/buy` works and shows correct meta in page source
- [ ] Product details load
- [ ] Inquiry page works
- [ ] Contact page works
- [ ] `/sitemap.xml` returns valid XML (200)
- [ ] `/solutions/air_conditioning` redirects to `/buy`
- [ ] Solution pages (`/solutions/heat-pumps`, etc.) show correct title/meta
- [ ] `robots.txt` still valid
- [ ] No broken internal links
- [ ] Metadata in page source looks correct (BG and EN)
- [ ] Local SEO copy reads naturally (no keyword stuffing)

---

## Build Verification

- `npm run build` completed successfully
- Sitemap route builds as dynamic (`ƒ`)
- No new linter errors

# Installments Teaser – Option A – Change Summary

## Goal

Replace the two bank logo buttons on `/buy` product cards with a neutral informational row and a link to the product page installments section. Card remains clickable; "Виж условия" navigates to the product page and scrolls to installments without double-firing the card click.

---

## Files Changed

### 1. `src/pages/buy.js`

**Change:** In the product card (inside the grid), the block that showed "Купи на изплащане" plus two bank logo buttons was replaced with a single teaser row.

- **Removed:**  
  - `.installmentText` with `t('buyPage.actionButtons.buyOnInstallment')`  
  - `.actionButtons` wrapper and both bank `<button>` elements (TBI and DSK logo images)

- **Added:**  
  - `.installmentTeaserRow` containing:  
    - Text: `t('buyPage.actionButtons.buyOnInstallmentTeaser')` → "Купи на изплащане (DSK / TBI)" (BG)  
    - Optional small bank icons: two inline `<img>` (TBI, DSK), non-clickable, `aria-hidden`, class `installmentTeaserIcon`  
    - Link "Виж условия" (`t('buyPage.actionButtons.viewTerms')`) with:  
      - `href={/buy/${product.ProductID}#installments}`  
      - `onClick={(e) => e.stopPropagation()}` so the card click is not triggered

**Result:** One compact, non-button row per card; link goes to product page and anchor `#installments`.

---

### 2. `src/pages/buy/[productId].js`

**Changes:**

1. **Installments section wrapper**  
   - Wrapped the existing credit calculators block (DskCreditCalculator + TbiCreditCalculator) in a `<div id="installments">` so the URL hash `#installments` has a target.

2. **Scroll to installments on load**  
   - Added a `useEffect` that, when the route is ready and `window.location.hash === '#installments'`, calls `document.getElementById('installments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })` so that opening the page via "Виж условия" scrolls to the installments section (works for both full load and client-side navigation).

---

### 3. `src/styles/Page Styles/Products.module.css`

**Change:** New styles for the installments teaser (placed after `.installmentText`, before `.actionButtons`).

- **`.installmentTeaserRow`** – flex row, wrap, centered, compact margins; holds text, icons, and link.
- **`.installmentTeaserText`** – small font (0.875rem), medium weight, neutral color.
- **`.installmentTeaserIcons`** – inline-flex for the two bank icons.
- **`.installmentTeaserIcon`** – small fixed size (1.25rem), object-fit contain, non-interactive.
- **`.installmentTeaserLink`** – small link (0.8rem), blue, underline on hover.

No new button-style CTAs; layout stays consistent with the existing card.

---

### 4. `public/locales/bg/common.json`

**Change:** Under `buyPage.actionButtons`:

- **Added:**  
  - `"buyOnInstallmentTeaser": "Купи на изплащане (DSK / TBI)"`  
  - `"viewTerms": "Виж условия"`

---

### 5. `public/locales/en/common.json`

**Change:** Under `buyPage.actionButtons`:

- **Added:**  
  - `"buyOnInstallmentTeaser": "Buy on installments (DSK / TBI)"`  
  - `"viewTerms": "See conditions"`

---

## Behavior Summary

| Item | Behavior |
|------|----------|
| Catalog card | Still fully clickable → opens `/buy/[productId]`. |
| "Виж условия" link | Goes to `/buy/[productId]#installments` and does not trigger the card click (`stopPropagation`). |
| Product page | Section with DSK/TBI calculators has `id="installments"`; page scrolls to it when opened with `#installments`. |
| Bank logos on card | Shown as small inline icons (non-clickable); no CTA buttons. |

---

## Verification

1. **On `/buy`**  
   - Each product card shows: "Купи на изплащане (DSK / TBI)", small DSK/TBI icons, and "Виж условия" link.  
   - No bank logo buttons.

2. **Click "Виж условия"**  
   - Navigates to `/buy/{productId}#installments`.  
   - Product page opens and scrolls to the installments (DSK/TBI) section.  
   - Card is not opened twice (link click is isolated).

3. **Click elsewhere on card**  
   - Opens product page without hash; no auto-scroll to installments.

4. **Styling**  
   - Teaser is compact, text + small link; no large CTA buttons; matches existing card layout.

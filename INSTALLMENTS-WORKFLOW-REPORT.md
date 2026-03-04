# Installments Workflow – End-to-End Report (DSK / TBI)

**Project:** 15-viki-bg (hc-clima.bg)  
**Stack:** Next.js (Pages Router) + React + Supabase  
**Scope:** Cart, checkout, DSK/TBI installments, add-ons, installation.

---

## 1) User flow map (end-to-end)

### A) Single product installments (from /buy card → product → cart → checkout → bank)

- **Step 1 – Catalog `/buy`**  
  - User sees product cards with installment teaser: “Купи на изплащане с DSK или TBI”, DSK/TBI icons, link “Виж условия”.
  - **Trigger:** Click “Виж условия” → navigates to `/buy/[productId]#installments` (scrolls to installments section).  
  - **Trigger:** Click card or “Buy” (quantity selector) → navigates to `/buy/[productId]` (with optional `?qty=N`).

- **Step 2 – Product page `/buy/[productId]`**  
  - User sees: price, quantity, accessories (checkboxes), installation option (fixed price per unit), DSK and TBI credit calculators (expandable), “поръчай с един клик” button.
  - **Trigger:** “поръчай с един клик” → `addToCartEnhanced(product, quantity, selectedAccessories, installationSelected, INSTALLATION_PRICE_PER_UNIT)` then `router.push('/buy')`. No direct checkout.

- **Step 3 – Cart**  
  - There is **no dedicated `/cart` page**. Cart is in **Header** (dropdown) and full cart + form on **`/checkout`**.
  - User goes to checkout via header/CTA (e.g. “Checkout” from cart dropdown or site navigation).

- **Step 4 – Checkout `/checkout`**  
  - User fills: Personal info, Invoice (optional), Payment method (office / dsk_credit / tbi_credit / cash).
  - If **dsk_credit** or **tbi_credit**: `DskCreditCalculator` or `TbiCreditCalculator` is shown with `price={cart.totalPrice}` (DSK) or `price={cart.totalPrice/1.95583}` (TBI EUR). User selects scheme (period).
  - **Trigger:** Submit → `POST /api/submit-order` (creates order in DB) → then:
    - **DSK:** `POST /api/dsk-pay` → response `url_redirect` → `window.location.href = redirectUrl` (redirect to DSK).
    - **TBI:** `POST /api/tbi-pay` → response `url` → `window.location.href = url` (redirect to TBI).

- **Step 5 – Bank redirect**  
  - **DSK:** User completes flow on DSK; success/failure handled by bank; no in-app callback URL documented in the snippets (status can be polled via `/api/dsk-status` with `orderid`).
  - **TBI:** `successRedirectURL` = `/order-success?orderId=...&paymentMethod=tbi_credit`, `failRedirectURL` = `/checkout?error=tbi_failed`.

---

### B) Multiple products installments (second AC, accessories, installation)

- **Adding a second (or more) product:**  
  - From `/buy`: use **QuantitySelector** on another card → “Buy” → `/buy/[productId]?qty=N`. On product page, add to cart with accessories/installation → back to `/buy`.  
  - Or add first product from product page, then from `/buy` add a different product the same way.  
  - Cart supports **multiple items**; each item has its own `productId`, `quantity`, `accessories`, `installation`, `installationPrice` (see Cart model below).

- **Accessories:**  
  - Chosen on **product page** per product (checkboxes). Stored per cart line in `item.accessories[]` with `quantity` (defaults to product quantity).  
  - **Per-unit:** Accessory cost is `(acc.Price || 0) * (acc.quantity || item.quantity)` in `calculateItemTotal`.

- **Installation:**  
  - Optional per product on product page. Fixed price **per AC unit** in frontend (e.g. 300 BGN or 300/1.95583 in one place – see issues).  
  - In **checkout**, installation is shown per item; `INSTALLATION_PRICE_PER_UNIT = 300.00` (BGN) in `checkout.js`.

- **Checkout:**  
  - Same as (A). Cart total includes all items, accessories, and installation. DSK/TBI calculators use `cart.totalPrice` (and TBI uses EUR conversion). Submit creates one order and sends all items to the chosen bank.

---

### C) Normal purchase (no installments)

- Same path: `/buy` → `/buy/[productId]` → add to cart (with or without accessories/installation) → `/checkout`.
- On checkout, user selects **office**, **cash**, or other non-credit method.
- **Trigger:** Submit → `POST /api/submit-order` → success → `clearCart()` and redirect to `/order-success?orderId=...&paymentMethod=...`. No bank redirect.

---

## 2) Key pages and UI entry points

### `/buy` (catalog)

- **What is shown:** Grid of product cards (image, brand, model, features, stock, **installment teaser row**, price). Per card: quantity selector and “Buy” button.
- **Installment area (per card):**  
  - Row 1: Text “Купи на изплащане с DSK или TBI” + small DSK/TBI icons (non-clickable).  
  - Row 2: Link “Виж условия” → `/buy/[productId]#installments`.
- **Actions:**  
  - Click card (or price block) → `/buy/[productId]`.  
  - “Виж условия” → `/buy/[productId]#installments`.  
  - “Buy” (QuantitySelector) → `/buy/[productId]?qty=N`.  
- **Relevant:** `src/pages/buy.js` (grid, `installmentTeaserRow`, `installmentTeaserLink`). No DSK/TBI calculation on catalog.

### `/buy/[productId]` (product detail)

- **What is shown:** Product image, title, price, quantity, accessories list (from `/api/get-accessories`), installation checkbox (price per unit), add to cart “поръчай с един клик”, **installments section** (`id="installments"`).
- **Installment section:**  
  - `DskCreditCalculator` and `TbiCreditCalculator` with `price` = product total (currentPrice × quantity for DSK; same / 1.95583 for TBI).  
  - Used for **preview only** on this page; actual credit submission happens on checkout.
- **Actions:**  
  - Add to cart (with accessories + installation) → `addToCartEnhanced(...)` then `router.push('/buy')`.  
  - Scroll to `#installments` when opened with that hash (e.g. from “Виж условия”).
- **Relevant:** `src/pages/buy/[productId].js` (installments block, `handleAddToCart`, `DskCreditCalculator`, `TbiCreditCalculator`).

### Cart (no `/cart` page)

- Cart is **only** in:  
  - **Header** (e.g. cart icon + dropdown) – `src/components/Layout Components/Header.js` (cart state from `useCart()`).  
  - **Checkout page** – full cart content, quantity/accessory/installation edits, then form + payment.
- **Relevant:** `CartContext` (state), Header (dropdown), checkout (full cart UI).

### `/checkout`

- **What is shown:** Accordion: (1) Personal info, (2) Invoice, (3) Payment. Cart summary with line items, quantity controls, accessories, installation, totals. Payment options: office, dsk_credit, tbi_credit, cash.
- **Installments section:**  
  - When `paymentMethod === 'dsk_credit'`: `<DskCreditCalculator price={cart.totalPrice} productId={cart.items[0]?.productId || '0'} onSchemeSelect={setSelectedDskScheme} />`.  
  - When `paymentMethod === 'tbi_credit'`: `<TbiCreditCalculator price={cart.totalPrice / 1.95583} productId={cart.items[0]?.productId || '0'} onSchemeSelect={setSelectedTbiScheme} />`.  
  - DSK uses **BGN** total; TBI uses **EUR** total.
- **Actions:**  
  - Submit → `submit-order` then, for DSK/TBI, `dsk-pay` / `tbi-pay` and redirect to bank.  
  - Success/fail redirects as in §1.
- **Relevant:** `src/pages/checkout.js` (form, payment options, DSK/TBI blocks, `submitDskCredit`, `submitTbiCredit`, `handleSubmit`).

---

## 3) Cart model (CRITICAL)

### Cart state shape (CartContext)

- **Storage:** `localStorage` key **`viki15-cart`**. Persisted on every cart change; loaded on mount.
- **State:**  
  `{ items: [], totalItems: number, totalPrice: number }`

- **Single item (enhanced) – from reducer `ADD_TO_CART_ENHANCED`:**

```js
{
  cartItemId: `${product.ProductID}-${accessoryIds}-${installation}`,  // unique per product+accessories+installation
  productId: product.ProductID,
  quantity: number,
  product: { ...product },
  accessories: [ { ...acc, quantity: number } ],  // per accessory quantity (default product quantity)
  installation: boolean,
  installationPrice: number,
  basePrice: product.Price,
  accessoryTotal?: number,
  installationCostPerUnit?: number,
  itemTotalPrice?: number
}
```

- **Simple item (ADD_TO_CART):**  
  `productId`, `quantity`, `product`, `accessories: []`, `installation: false`, `basePrice`.

### Total calculation (BGN)

- **`calculateItemTotal(item)`** in `src/contexts/CartContext.js`:

```js
const basePrice = item.basePrice || item.product?.Price || 0;
const accessoryTotal = item.accessories?.reduce((sum, acc) => {
  const q = acc.quantity || item.quantity;
  return sum + ((acc.Price || 0) * q);
}, 0) || 0;
const installationCost = item.installation ? (item.installationPrice || 0) * item.quantity : 0;
return (basePrice * item.quantity) + accessoryTotal + installationCost;
```

- **totalPrice:** sum of `calculateItemTotal(item)` over all items. All in **BGN** (product.Price and installationPrice are expected in BGN; one inconsistency on product page is noted in §7).

### Key cart actions (exact usage)

- **addToCart(product, quantity = 1)** – simple add, no accessories/installation.  
  `src/contexts/CartContext.js` → `dispatch(ADD_TO_CART, { product, quantity })`.

- **addToCartEnhanced(product, quantity, accessories = [], installation = false, installationPrice = 0)** – used from product page.  
  `dispatch(ADD_TO_CART_ENHANCED, { product, quantity, accessories, installation, installationPrice })`.  
  Accessories are stored with per-line quantity (initialized to product quantity).

- **updateQuantity(productId, quantity, cartItemId = null)** – update by `productId` or `cartItemId`; if quantity ≤ 0, item is removed.

- **removeFromCart(productId, cartItemId = null)** – remove by `productId` or `cartItemId`.

- **updateItemAccessories(cartItemId, accessories)** – replace accessories for one line.

- **updateAccessoryQuantity(cartItemId, accessoryIndex, quantity)** – change one accessory’s quantity.

- **updateItemInstallation(cartItemId, installation)** – toggle installation for one line.

- **getCartItemsForOrder()** – returns array suitable for submit-order:  
  `{ productId, quantity, product, accessories, installation, installationPrice, totalPrice }` per item.

- **One-click order:** On product page, the single button “поръчай с един клик” only runs **add to cart + redirect to /buy**. It does **not** skip to checkout or submit an order. Full flow is: product page → cart → user must go to checkout manually.

### Multiple products

- Cart supports multiple items. Each line is identified by `cartItemId` (product + accessories signature + installation) or by `productId` for simple adds. Same product with different accessories/installation creates different lines.

---

## 4) Installments calculation

### Endpoints (our API routes → bank)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dsk-calculate` | POST | Get DSK schemes for a given price/product |
| `/api/tbi-calculate` | POST | Get TBI schemes for a given amount (EUR) |

- **Client never calls DSK/TBI directly;** all calls go through these API routes (server-side `callDskApi` / `getCalculations` + helpers).

### `/api/dsk-calculate`

- **Input (body):**  
  `{ price: string (BGN), product_id: string, initial_payment?: string }`
- **Server:** `callDskApi('getCalculationForAllSchemes', { price, product_id, initial_payment })`.
- **Output:** `{ success: true, schemes: result }` where `result` is the DSK API response (array or object of schemes with e.g. `id`, `name`, `monthly_payment`, `total_amount_due`, `gpr`, `glp`, `default`).
- **Called from:**  
  - **Product page:** `DskCreditCalculator` with `price={getDynamicPricing().currentPrice * quantity}` (BGN), `productId={product.ProductID}`.  
  - **Checkout:** `DskCreditCalculator` with `price={cart.totalPrice}` (BGN), `productId={cart.items[0]?.productId || '0'}`.

**Snippet – DskCreditCalculator fetch (`src/components/DskCreditCalculator.js`):**

```js
const response = await fetch('/api/dsk-calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    price: price.toFixed(2),
    product_id: String(productId),
    initial_payment: '0',
  }),
});
```

### `/api/tbi-calculate`

- **Input (body):**  
  `{ amount: string (EUR), category_id?: null }`
- **Server:** `getCalculations(amount, category_id)` then filter by amount range and enrich with `calculateInstallment(amount, scheme)` and `calculateTotalDue(amount, scheme)`.
- **Output:** `{ success: true, schemes: enrichedSchemes }` (each scheme has e.g. `monthly_payment`, `total_amount_due`, `period`, `apr`, `nir`).
- **Called from:**  
  - **Product page:** `TbiCreditCalculator` with `price={(getDynamicPricing().currentPrice * quantity) / 1.95583}` (EUR).  
  - **Checkout:** `TbiCreditCalculator` with `price={cart.totalPrice / 1.95583}` (EUR).

**Snippet – TbiCreditCalculator fetch (`src/components/TbiCreditCalculator.js`):**

```js
const response = await fetch('/api/tbi-calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: price.toFixed(2),
    category_id: null,
  }),
});
```

---

## 5) Installments submission (bank)

### Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/dsk-pay` | POST | Send order to DSK; get redirect URL |
| `/api/tbi-pay` | POST | Register application with TBI; get redirect URL |
| `/api/dsk-status` | POST | Poll DSK status (e.g. `getDskPayStatus`) by `orderid` |

### `/api/dsk-pay`

- **Input (body):**  
  `orderid`, `first_name`, `last_name`, `phone`, `email`, `address`, `addresscity`, `address2`, `address2city`, `postcode`, `price` (total BGN), `currency`, `type_client`, `items`.
- **items:** array of `{ products_id, products_name, products_q, products_p, products_i }` (id, name, qty, price BGN, image URL).
- **Server:** `callDskApi('sendDskPay', { ... })`.
- **Output:**  
  - Success: `{ success: true, url_redirect: result.url_redirect }`.  
  - Failure: `{ success: false, error: ... }`.
- **Checkout usage:** After `submit-order` returns `orderId`, `submitDskCredit(orderId)` builds `dskItems` from `cart.items` (product id, name, qty, **item product Price**, image), sends total `cart.totalPrice` (BGN). Then `window.location.href = result.url_redirect`.

**Note:** DSK payload uses **per-item product price** (`item.product.Price`), not line total including accessories/installation. Total amount sent is `cart.totalPrice` (which does include accessories and installation). Confirm with DSK docs that this is correct.

### `/api/tbi-pay`

- **Input (body):**  
  `orderid`, `firstname`, `lastname`, `surname`, `email`, `phone`, `deliveryaddress`, `items`, `period`, `promo`, `successRedirectURL`, `failRedirectURL`, `statusURL`.
- **items:** array of `{ name, description, qty, price (EUR), sku, category, imagelink }`. Checkout maps cart to EUR: `price: (item.product.Price / EUR_RATE).toFixed(2)` (again product price only, not line total).
- **Server:** `registerApplication(applicationData)` → TBI `RegisterApplication`.
- **Output:**  
  - Success: `{ success: true, url, order_id, token }`.  
  - Redirect: `result.url`.
- **Redirects:**  
  - Success: `/order-success?orderId=...&paymentMethod=tbi_credit`.  
  - Fail: `/checkout?error=tbi_failed`.

### Callback / status

- **DSK:** No success URL in the snippets; status can be checked with `POST /api/dsk-status` with `{ orderid }` (calls `getDskPayStatus`). Front-end redirect after DSK flow is not shown in the snippets.
- **TBI:** Explicit success/fail URLs as above.

---

## 6) Add-ons and installation rules

### Add-ons (accessories)

- **Source:** `/api/get-accessories` (Supabase `accessories` table: id, name, price, active, created_at). Mapped to `AccessoryID`, `Name`, `Price`, etc.
- **Per-unit vs one-time:** Treated **per product line** and **per quantity**: in `calculateItemTotal`, each accessory contributes `(acc.Price || 0) * (acc.quantity || item.quantity)`. So accessories scale with product quantity (per-unit).
- **Where:** Product page – checkboxes; cart item `accessories[]` with `quantity`; checkout can edit via `updateItemAccessories` / `updateAccessoryQuantity`.  
  **Code:** `src/contexts/CartContext.js` (`calculateItemTotal`, `UPDATE_ITEM_ACCESSORIES`, `UPDATE_ACCESSORY_QUANTITY`), `src/pages/buy/[productId].js` (accessory selection), `src/pages/checkout.js` (accessory controls).

### Installation

- **Price:**  
  - **Product page:** `INSTALLATION_PRICE_PER_UNIT = 300.00 / 1.95583` (EUR) – see §7.  
  - **Checkout:** `INSTALLATION_PRICE_PER_UNIT = 300.00` (BGN) in `checkout.js` for display/fallback.
- **Application:** In cart, installation is **per quantity**: `installationCost = item.installation ? (item.installationPrice || 0) * item.quantity : 0` in `calculateItemTotal`. So “per AC unit” in the UI.
- **Backend (submit-order):** Installation is added **once per cart line**, not multiplied by quantity:  
  `if (item.installation && item.installationPrice) itemTotal += item.installationPrice;`  
  So there is a **mismatch**: frontend total uses `installationPrice * quantity`, backend uses `installationPrice` once per item. See §7.
- **Where:** Product page – installation checkbox and price; cart `installation` + `installationPrice`; checkout – installation toggle and `updateItemInstallation`.  
  **Code:** `src/pages/buy/[productId].js` (INSTALLATION_PRICE_PER_UNIT, installationSelected), `src/contexts/CartContext.js` (calculateItemTotal, UPDATE_ITEM_INSTALLATION), `src/pages/checkout.js` (getInstallationPrice, installation UI), `src/pages/api/submit-order.js` (itemTotal += item.installationPrice once).

### Office payment and installation

- If user has installation in cart, “office” payment is disabled (`hasInstallation()` → office option disabled).  
  **Code:** `checkout.js` – `hasInstallation()`, payment option disabled and message “Not available with installation”.

---

## 7) Current issues / inconsistencies

1. **Installation price currency and backend vs frontend**  
   - Product page uses `INSTALLATION_PRICE_PER_UNIT = 300 / 1.95583` (EUR) and passes it into the cart. Cart and product prices are in BGN; mixing EUR into `itemTotalPrice` is inconsistent.  
   - Checkout uses 300 BGN. Recommendation: use **300 BGN** everywhere and pass that into the cart.  
   - **Backend vs frontend:** `submit-order` adds `item.installationPrice` **once per line**; `calculateItemTotal` uses `installationPrice * item.quantity`. So backend total can be lower than frontend if quantity > 1. Align: either both “per quantity” or both “per line” and document.

2. **DSK/TBI item payload vs cart total**  
   - Checkout sends to DSK/TBI **per-item product price** (and qty), not line total (product + accessories + installation). The **total** sent is `cart.totalPrice` (correct). Confirm with bank docs that they accept “total + list of products at unit price × qty” and that they do not require line totals.

3. **“One click” wording**  
   - “поръчай с един клик” only adds to cart and redirects to `/buy`. It does not go to checkout or place an order. May confuse users expecting a single-step order.

4. **DSK PEM / decoder error**  
   - Production has seen `error:1E08010C:DECODER routines::unsupported` when using `DSK_PUBLIC_CERT_PEM` from env. Fix applied: single-line PEM in `.env` with `\n`, and PEM used without creating a KeyObject in a path that triggers the decoder. If the error persists, ensure PEM is complete and correctly normalized (see `src/lib/dskApi.js` and env setup).

5. **Checkout calculator productId**  
   - For multi-item cart, DSK/TBI calculators receive `productId={cart.items[0]?.productId || '0'}`. DSK API may use it for product-specific schemes; impact of always using first product when cart has several is unclear.

6. **No dedicated /cart page**  
   - Cart is only in header dropdown and on checkout. Users cannot see a full “cart page” before proceeding to checkout; they go straight to checkout for full cart view and editing.

---

## Files touched list

| File | Role |
|------|------|
| `src/contexts/CartContext.js` | Cart state, localStorage `viki15-cart`, add/update/remove, totals, getCartItemsForOrder |
| `src/pages/buy.js` | Catalog grid, installment teaser row, “Виж условия” link, QuantitySelector |
| `src/pages/buy/[productId].js` | Product detail, accessories, installation, addToCartEnhanced, DskCreditCalculator, TbiCreditCalculator, #installments |
| `src/components/QuantitySelector.js` | Catalog “Buy” → navigate to product page with qty |
| `src/pages/checkout.js` | Full cart UI, form, payment options, DskCreditCalculator/TbiCreditCalculator, submit-order then dsk-pay/tbi-pay, redirects |
| `src/components/DskCreditCalculator.js` | Fetches /api/dsk-calculate, shows schemes, onSchemeSelect |
| `src/components/TbiCreditCalculator.js` | Fetches /api/tbi-calculate, shows schemes, onSchemeSelect |
| `src/pages/api/dsk-calculate.js` | POST → callDskApi('getCalculationForAllSchemes') |
| `src/pages/api/dsk-pay.js` | POST → callDskApi('sendDskPay'), returns url_redirect |
| `src/pages/api/dsk-status.js` | POST → callDskApi('getDskPayStatus') |
| `src/pages/api/tbi-calculate.js` | POST → getCalculations, enrich schemes |
| `src/pages/api/tbi-pay.js` | POST → registerApplication, returns url |
| `src/pages/api/submit-order.js` | POST → creates order, invoice, payment_and_tracking, order_items |
| `src/pages/api/get-accessories.js` | GET → Supabase accessories |
| `src/lib/dskApi.js` | callDskApi, encryptChunked, loadPublicKeyPem, DSK_API_URL, DSK_UNICID, DSK_PUBLIC_CERT_PEM |
| `src/lib/tbiApi.js` | getCalculations, registerApplication, calculateInstallment, calculateTotalDue, TBI_* env |
| `src/components/Layout Components/Header.js` | Cart dropdown (cart state from useCart) |

---

*Report generated from repository code and structure. Where behavior depends on env or external APIs, it is noted for verification.*

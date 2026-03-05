# TBI Totals Investigation Report

**Date:** 2025-03-04  
**Goal:** Explain why the site shows a correct installment preview but the TBI hosted page shows a much smaller financed amount.  
**Scope:** Code trace only — no changes made.

---

## Step 1) Full TBI flow (code trace)

### A) Checkout submit (client) — `src/pages/checkout.js`

#### 1. Location of TBI submit

- **Function:** `submitTbiCredit(orderId)` at **lines 458–497**.

#### 2. Code that builds payload for `/api/tbi-pay`

```javascript
// src/pages/checkout.js, lines 458–490 (excerpt)

const submitTbiCredit = async (orderId) => {
  const EUR_RATE = 1.95583;
  const tbiItems = cart.items.map(item => ({
    name: `${item.product.Brand} ${item.product.Model}`.substring(0, 255),
    description: item.product.Description || '',
    qty: String(item.quantity),
    price: (item.product.Price / EUR_RATE).toFixed(2),   // ← only product.Price
    sku: String(item.productId),
    category: 0,
    imagelink: item.product.ImageURL || '',
  }));

  const response = await fetch('/api/tbi-pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderid: String(orderId),
      firstname: formData.firstName,
      lastname: formData.lastName,
      surname: formData.middleName || '',
      email: formData.email || '',
      phone: formData.phone,
      deliveryaddress: { ... },
      items: tbiItems,
      period: selectedTbiScheme?.period || 12,
      successRedirectURL: `...`,
      failRedirectURL: `...`,
    }),
  });
  // ...
};
```

- **`cartTotalBGN`:** Not computed or sent. The client does not send a separate “cart total” field to `/api/tbi-pay`; TBI infers the financed amount from `items`.
- **`cartTotalEUR`:** Not computed or sent.
- **`items` (tbiItems):** One object per `cart.items` entry. Each item has:
  - `name`, `description`, `qty`, `price`, `sku`, `category`, `imagelink`
  - **`price`** = `(item.product.Price / EUR_RATE).toFixed(2)` → **only the product base price**, converted to EUR. Accessories and installation are **not** included.

#### 3. Assumed currency of `item.product.Price`

- **BGN.**  
- Cart is filled from the product page with `productWithDiscountedPrice` where `Price: currentPrice` (BGN). Backend `submit-order.js` and `CartContext` treat all amounts as BGN. So at checkout, `item.product.Price` is in BGN.

#### 4. Numeric analysis (computed from code logic)

**Scenario (from your spec):**

- Product 136 base: €1034.99 ≈ 2024.26 BGN  
- Add-ons + installation total: €1359.66 ≈ 2659.26 BGN  
- So full cart total: 2024.26 + 2659.26 = **4683.52 BGN** (≈ €2395.99).

**What we send in `tbiItems`:**

- One line per cart line: `price = (item.product.Price / 1.95583).toFixed(2)` (EUR), `qty = item.quantity`.
- Only **product base** is used; accessories and installation are **not** in `price` and there are no extra lines for them.

**Example (single cart line: 1× product 136 base + add-ons + installation):**

- `item.product.Price` = 2024.26 BGN  
- `price` sent = 2024.26 / 1.95583 ≈ **1034.99** EUR  
- `qty` = 1  
- **Sum of this line sent to TBI:** 1034.99 EUR.

**Expected from our UI (full total in EUR):**

- `cart.totalPrice` = 4683.52 BGN (from `CartContext.calculateItemTotal`, which includes base + accessories + installation).
- UI “expected” total in EUR = `cart.totalPrice / 1.95583` = 4683.52 / 1.95583 ≈ **2395.99** EUR.

**Comparison:**

| Source                         | Amount (EUR) | Notes                                      |
|--------------------------------|-------------:|--------------------------------------------|
| Sum of `tbiItems.price * qty`  |    ~1034.99  | Only product base for 1 unit               |
| Expected (cart.totalPrice/rate)|    ~2395.99  | Full total: base + add-ons + installation  |
| **Mismatch**                   | **~1361.00** | TBI financed amount is far too small       |

So: the **preview** uses the full cart total in EUR; the **submission** sends only the base price per product line in EUR. Accessories and installation are missing from the TBI payload.

---

### B) Server API route — `src/pages/api/tbi-pay.js`

#### 1. Location

- **File:** `src/pages/api/tbi-pay.js`  
- **Handler:** Reads `req.body` and builds `applicationData` (lines 9–63), then calls `registerApplication(applicationData)` (line 65).

#### 2. Code that builds `applicationData` and `items`

```javascript
// src/pages/api/tbi-pay.js, lines 29–57

const applicationData = {
  orderid: String(orderid),
  firstname: firstname || '',
  lastname: lastname || '',
  surname: surname || '',
  email: email || '',
  phone: phone || '',
  deliveryaddress: { ... },
  items: items.map(item => ({
    name: String(item.name || '').substring(0, 255),
    description: item.description || '',
    qty: String(item.qty || 1),
    price: String(item.price),    // ← passed through as received from client
    sku: item.sku || '',
    category: item.category || 0,
    imagelink: item.imagelink || '',
  })),
};
// period, successRedirectURL, failRedirectURL, etc. added from req.body
```

- **`items`:** Taken from `req.body.items` (the client’s `tbiItems`). Each `item.price` is **passed through as-is** (only stringified). There is **no** conversion or recomputation on the server.
- **Amount/total:** There is **no** separate `amount` or `total` field set in `applicationData`. The API only sends `items` (and order/customer/redirect fields). So TBI’s financed amount is whatever they compute from `items` (e.g. sum of `price * qty` per line).
- **Currency:** No explicit currency field in the snippet; TBI’s API is assumed to treat `items[].price` as EUR (as the client intends).

#### 3. Computed summary (server side)

- **Sum of `items.price * qty` (EUR) sent to TBI:** Same as on the client: only product base prices converted to EUR; **accessories and installation are not included**.
- **Accessories and installation:** **Excluded** — they are never added to `items` or to any `price` in this flow.
- **Conversion:** BGN→EUR is done **once**, on the client, when building `tbiItems` (`item.product.Price / EUR_RATE`). The server does not convert again.

---

## Step 2) Structured report

### 1) Where the preview total comes from (`tbi-calculate`)

| Question | Answer |
|----------|--------|
| **Which value we pass to `/api/tbi-calculate`** | On **checkout:** `price={cart.totalPrice / 1.95583}` (see `src/pages/checkout.js` line 1136). So **full cart total in EUR**. On **product page:** `price={getTotalPrice() / 1.95583}` (product + accessories + installation for that page), also EUR. |
| **Based on product page or cart total?** | **Checkout:** cart total. **Product page:** that page’s total (one product + its add-ons + installation). |
| **Currency used** | **EUR.** The client divides BGN by 1.95583 before calling the API. `tbi-calculate` receives `amount` in EUR and passes it to `getCalculations(amount, category_id)` (`src/pages/api/tbi-calculate.js` and `src/lib/tbiApi.js`). |

So the **preview** is correct because it uses the **full** total (base + accessories + installation) in EUR.

---

### 2) Where the submission total comes from (`tbi-pay`)

| Question | Answer |
|----------|--------|
| **Exact payload fields sent to TBI** | `orderid`, `firstname`, `lastname`, `surname`, `email`, `phone`, `deliveryaddress`, **`items`** (array of `{ name, description, qty, price, sku, category, imagelink }`), `period`, `successRedirectURL`, `failRedirectURL` (and optionally `promo`, `statusURL`). No separate `amount` or `total` field. |
| **Computed total from items** | Sum over items of `Number(item.price) * Number(item.qty)`. In our code this equals the sum of **(product base price in BGN / 1.95583) × quantity** per cart line. Accessories and installation are not in `items`. |
| **Currency assumptions** | Client sends `price` in **EUR** (base price only). Server forwards it. TBI is assumed to interpret `items[].price` as EUR. |

So the **submission** total is **only** the product base(s) in EUR; add-ons and installation are missing.

---

### 3) Root cause hypothesis (code evidence only)

- **Only product base price is included; accessories and installation are missing.**  
  - In `checkout.js`, `tbiItems` is built from `cart.items` with `price: (item.product.Price / EUR_RATE).toFixed(2)`.  
  - `item.product.Price` is the product’s base price (BGN).  
  - There are no entries for accessories or installation, and they are not added into any `price`.  
  - So the financed amount on TBI’s page is the sum of base prices in EUR, which is much smaller than the full cart total in EUR (base + accessories + installation).

- **No double conversion.**  
  - BGN→EUR is applied once on the client when building `tbiItems`. The server does not convert again.

- **Wrong field for “line total”.**  
  - We use `item.product.Price` (unit base price) instead of a full line total (e.g. `calculateItemTotal(item)` or equivalent) that includes accessories and installation. So the “wrong field” is intentional in code but logically wrong for matching the preview.

---

### 4) What to change (proposed fix plan — do not implement yet)

#### Minimal changes

1. **`src/pages/checkout.js`** (around 458–468) — build `tbiItems` so the **per-line total** sent to TBI matches what we show in the preview:
   - Either:
     - **Option A:** One line per cart item: `price` in EUR = **(full line total in BGN) / 1.95583**, with `qty: 1` (so the item represents the whole line including accessories and installation), **or**
     - **Option B:** Keep one line per product but set `price` = **(line total / quantity) in EUR** so that `price * qty` = line total in EUR, where “line total” = base×qty + accessories + installation from `CartContext.calculateItemTotal(item)`.
   - Use a single source for the line total: e.g. `calculateItemTotal(item)` from `useCart()`, or the same formula (base×qty + accessory total + installation cost). All in BGN, then convert to EUR **once** when setting `price`.

2. **Optional but recommended:** Add **explicit line items** for accessories and installation (e.g. extra rows in `items` with their own `name`, `qty`, `price` in EUR) so the TBI hosted page shows a breakdown. Then the sum of `items[].price * items[].qty` must still equal **cart.totalPrice / 1.95583** (one-time BGN→EUR).

#### Ensure exactly-once conversion

- Treat **BGN as source of truth** in the cart (as now).  
- Convert to EUR only when building the payload for TBI:  
  - `lineTotalEUR = (calculateItemTotal(item) or equivalent in BGN) / 1.95583`  
  - Use `lineTotalEUR` (or its decomposition into product + accessory + installation lines) for `items[].price` and `qty`.  
- Do **not** convert again in `tbi-pay.js`; keep passing through the client’s `items` (with the corrected prices).

#### Numeric example (current vs should)

**Scenario:** Product 136 base 2024.26 BGN, add-ons + installation 2659.26 BGN, total 4683.52 BGN (≈ 2395.99 EUR).

| What | Current (wrong) | Should be |
|------|-----------------|-----------|
| Items sent | 1 line: price ≈ 1034.99 EUR, qty 1 | 1 line (or more for breakdown): so that sum(price×qty) = 2395.99 EUR |
| Sum sent to TBI | ~1034.99 EUR | ~2395.99 EUR |
| Match to preview | No | Yes (preview already uses cart.totalPrice/1.95583) |

**Files and areas to modify (no code written here):**

- **`src/pages/checkout.js`:**  
  - `submitTbiCredit`: build `tbiItems` using full line total (and optionally separate lines for accessories/installation). Use `calculateItemTotal(item)` (or equivalent) in BGN, then divide by 1.95583 once per line (or per sub-line).  
- **`src/pages/api/tbi-pay.js`:**  
  - No change needed if the client sends correct `items`; keep passing `items` through.  
- **`src/contexts/CartContext.js`:**  
  - No change if we use existing `calculateItemTotal`; ensure checkout has access to it (e.g. via `useCart().calculateItemTotal`).

---

## Summary

| Topic | Finding |
|-------|--------|
| **Preview (tbi-calculate)** | Uses full total in EUR (cart or product page). Correct. |
| **Submission (tbi-pay)** | Uses only product base price per line, converted once BGN→EUR. Accessories and installation not sent. |
| **Root cause** | Only product base included; accessories and installation missing from TBI items. |
| **Fix direction** | Build TBI `items` from full line totals (and optionally itemized lines) in BGN, convert to EUR once, so sum(price×qty) = cart.totalPrice / 1.95583. |

All conclusions are based only on the repository code inspected; no code was modified.

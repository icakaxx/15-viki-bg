# TBI EUR Transition – Compliance Audit Report

**Context:** After 1 Jan 2026, TBI requires: `registerApplication` must send `currency="EUR"` and all amounts in EUR; `GetCalculations` returns a `currency` field (use as-is); embedded calculator must use `currency=EUR`.

**Scope:** Audit only. No code changes. Evidence + impact + minimal change plan.

---

## 1) Audit: registerApplication (`/api/tbi-pay` + `tbiApi.registerApplication`)

### 1a) Is `"currency": "EUR"` included in `applicationData`?

**No.** It is missing.

- **`src/pages/api/tbi-pay.js`** builds `applicationData` (lines 29–61). The object has: `orderid`, `firstname`, `lastname`, `surname`, `email`, `phone`, `deliveryaddress`, `items`, and conditionally `period`, `promo`, `successRedirectURL`, `failRedirectURL`, `statusURL`. There is no `currency` property.
- **Evidence:** Lines 29–55 show the full object; no `currency` key anywhere.

### 1b) Other currency-related fields?

**None.** No currency-related fields are sent to TBI in `applicationData` or in the request body to `/api/tbi-pay`.

### 1c) What TBI likely assumes when currency is missing?

- We send **numeric amounts that are already in EUR** (BGN converted by fixed rate in checkout).
- We do **not** send any currency hint.
- From existing behavior (see `TBI-CURRENCY-INVESTIGATION-CURRENCY-MISMATCH.md`): DEV showed EUR, PROD showed BGN for the same payload → TBI likely infers currency from **reseller/environment configuration** when the field is absent.
- **Conclusion:** When currency is missing, TBI likely assumes a default (e.g. BGN for some resellers), which can cause **label/numeric mismatch** (our numbers are EUR, their label BGN) and, after Jan 2026, **possible rejection** if the API starts requiring explicit `currency`.

---

### Verification: All financial amounts sent to TBI are EUR

**1a) In `src/pages/checkout.js` → `submitTbiCredit`, what currency are `items[].price` in?**

They are **EUR**. Each price is derived from BGN divided by a fixed EUR rate.

| Line   | Evidence |
|--------|----------|
| 459    | `const EUR_RATE = 1.95583;` |
| 469    | Product: `price: (item.product.Price / EUR_RATE).toFixed(2)` — `item.product.Price` is BGN (site currency). |
| 485    | Accessory: `price: (accPrice / EUR_RATE).toFixed(2)` — `accPrice` from `acc.Price` / `acc.price` (BGN). |
| 500    | Installation: `price: (instPrice / EUR_RATE).toFixed(2)` — `instPrice` is BGN. |

So every `tbiItems[].price` is BGN→EUR using the same rate. The client then sends `items: tbiItems` to `/api/tbi-pay` (line 537).

**1b) Server: convert or pass through?**

**Pass-through.** The server does not convert; it forwards client amounts.

- **`src/pages/api/tbi-pay.js`** (lines 46–54): `items` are mapped from `req.body.items` with `price: String(item.price)`. No conversion, no currency field added.
- So the **numerical** amounts TBI receives are already EUR; we simply never label them with `currency: "EUR"`.

---

### Summary table: registerApplication

| Requirement | Status   | File + line evidence |
|-------------|----------|----------------------|
| Send `currency: "EUR"` in `applicationData` | **Missing** | `tbi-pay.js` 29–55: `applicationData` has no `currency` key. |
| Send other currency-related fields | **N/A** | None sent; only explicit currency field is relevant. |
| All amounts in EUR | **Present** | `checkout.js` 459, 469, 485, 500: all prices = BGN / 1.95583; server passes through in `tbi-pay.js` 50. |

---

## 2) Audit: GetCalculations (`/api/tbi-calculate` + TbiCreditCalculator)

### 2a) Do we read and use the new `currency` field from the response?

**No.**

- **`src/lib/tbiApi.js`** (lines 26–60): `getCalculations(amount, categoryId)` builds query params with `amount` and `category_id` only. No `currency` is sent. The response is parsed and `return data;` — we do not read or expose `data.currency`.
- **`src/pages/api/tbi-calculate.js`** (lines 11–30): Calls `getCalculations(amount, category_id)`. Uses the return value as `schemes` (and checks `Array.isArray(schemes)`). Does not read or forward any `currency` from the response. Enriched schemes are returned without a currency field.
- **`src/components/TbiCreditCalculator.js`**: Consumes `/api/tbi-calculate` and only uses `data.schemes`. No reference to `currency` anywhere.

So we **do not** read or use the GetCalculations `currency` field.

### 2b) Do we display amounts according to the returned `currency` (“use fields as-is”)?

**No.** We display with a **hardcoded** EUR symbol.

- **TbiCreditCalculator.js**: All amount displays use a fixed `€` and no logic based on response currency, e.g.:
  - Line 173: `€{parseFloat(minScheme.monthly_payment).toFixed(2)}`
  - Lines 209, 214, 235: `€{parseFloat(selectedScheme.monthly_payment).toFixed(2)}`, etc.
- So we **assume** amounts are EUR and show "€". We do **not** use the API’s `currency` “as-is” for display (e.g. if they returned BGN we would still show €).

### 2c) Do we incorrectly assume EUR always, or handle BGN/EUR properly?

We **assume EUR always** for display and for the amount we send:

- Calculator is fed `price` (from product page/checkout) that is already in EUR (e.g. `priceEUR` in cache key and variable names — see line 8, 21, 42).
- We never branch on `currency` from the API; we always show €.
- So: **correct** for the intended EUR transition, but **fragile** if TBI ever returns BGN or another currency — we would mislabel it as EUR.

---

### Summary: GetCalculations

| What we do now | What we should do per doc | Risks if we ignore `currency` |
|----------------|----------------------------|--------------------------------|
| Do not send `currency` to GetCalculations. | (Doc says response returns `currency`; may also allow request param for consistency.) | Request might default to BGN in some environments; schemes could be in BGN. |
| Do not read `currency` from response. | Use response `currency` “as-is” for display and logic. | If TBI returns BGN (or another code), we would still show € → wrong label and possible compliance/confusion. |
| Display all amounts with hardcoded €. | Display using the returned `currency` (e.g. “BGN” vs “EUR”). | Misleading labeling; mismatch with TBI-hosted pages or documents. |
| Assume input amount is EUR (price passed in is already EUR). | Align request amount currency with API (e.g. pass EUR and, if supported, currency=EUR). | Same as above; possible wrong scheme set if API interprets amount as BGN. |

---

## 3) Audit: Embedded calculator

- Searched for: `tbibank.support`, “embedded calculator”, “calculator link”, `amount=`, `currency=` in repo (src + docs).
- **Findings:**
  - **`src/pages/buy.js`** (line 734): Only usage of `tbibank.support` is an **image** URL: `https://cdn.tbibank.support/logo/tbi-bank.png` (logo in installments teaser). No calculator URL.
  - No iframe or link to a TBI-hosted calculator page with query params (e.g. `?amount=...&currency=EUR`).
  - Our “calculator” is the **in-app** `TbiCreditCalculator` component, which calls our **`/api/tbi-calculate`** (which calls TBI’s GetCalculations). We do not embed an external TBI calculator page/link.

**Answers:**

- **3a) Do we include `currency=EUR` in the URL?**  
  **N/A.** We do not use an embedded calculator **link** (no TBI calculator URL with params). Only in-app component + our API.

- **3b) Are we passing amount in matching currency?**  
  We pass **amount in EUR** to our API (product/checkout prices already in EUR). We do not pass a currency param to TBI’s GetCalculations (see section 2). So “matching” is only by convention (we send EUR-sized numbers, we don’t send currency).

**Conclusion:** No external embedded calculator link to audit. Compliance for “embedded calculator requires currency=EUR” would apply if we later add a link to TBI’s calculator; for the current in-app flow, the relevant gap is **GetCalculations** (request/response currency), not a URL.

---

## 4) Impact analysis (no code)

### Missing: `currency: "EUR"` in registerApplication

- **User-facing:** After Jan 2026, if TBI rejects requests without `currency`, users may see application creation failures or generic errors when choosing TBI credit at checkout.
- **Risk prevented:** Ensures TBI treats our amounts as EUR and does not reject or mis-label; aligns with post–Jan 2026 API contract.
- **Break risk:** If older TBI endpoints ignore unknown fields, adding `currency: "EUR"` is low risk. If they strictly validate and reject unknown fields (unlikely for a new required field), we’d need to confirm with TBI. **Recommendation:** Confirm with TBI that `currency` is accepted (and required after cutover).

### Missing: Handling GetCalculations `currency` (request + response)

- **User-facing:** Wrong currency label (e.g. showing € when TBI returns BGN) or schemes for wrong currency; possible confusion or wrong expectations.
- **Risk prevented:** Correct labeling and correct scheme set; compliance with “use fields as-is.”
- **Break risk:** Reading and displaying `currency` is additive; only risk is if we change request (e.g. send `currency=EUR`) and an old endpoint does not support it — then we’d need a fallback or feature flag.

### Missing: Embedded calculator link with `currency=EUR`

- **User-facing:** Not applicable today; no such link.
- **Risk prevented:** If we add a TBI calculator link later, having `currency=EUR` (and amount in EUR) avoids mis-display or errors on their side.
- **Break risk:** N/A for current codebase.

---

## 5) Recommendation (no code / no patch)

Minimal change plan to become compliant:

1. **registerApplication – currency field**
   - **File:** `src/pages/api/tbi-pay.js`
   - **Change:** Add to `applicationData` (e.g. after `items` or with other top-level fields): `currency: 'EUR'`.
   - **Check:** Confirm with TBI that this field is accepted now and will be required after 1 Jan 2026; confirm no breaking behavior on current endpoints.

2. **GetCalculations – use of `currency`**
   - **Files:**  
     - `src/lib/tbiApi.js`: If TBI’s GetCalculations accepts a request parameter for currency, add it (e.g. `currency=EUR`) when calling the API.  
     - `src/lib/tbiApi.js` and/or `src/pages/api/tbi-calculate.js`: Read `currency` from the GetCalculations response (e.g. `data.currency` or per-scheme) and include it in the payload returned to the client.  
     - `src/components/TbiCreditCalculator.js`: Use the returned `currency` for display (symbol/label) instead of hardcoded €; if response has no currency, fallback to EUR for backward compatibility.

3. **Embedded calculator link**
   - **Files:** None at present.
   - **If/when** we add a link or iframe to a TBI-hosted calculator URL: ensure the URL includes `currency=EUR` and that the amount passed is in EUR.

---

## Output summary

### Compliance matrix

| Requirement | Present / Missing | File + line evidence |
|-------------|-------------------|----------------------|
| registerApplication sends `currency: "EUR"` | **Missing** | `tbi-pay.js` 29–55: no `currency` in `applicationData`. |
| All amounts to TBI in EUR | **Present** | `checkout.js` 459, 469, 485, 500: prices = BGN / 1.95583; `tbi-pay.js` 50 passes through. |
| GetCalculations: we send currency (if supported) | **Missing** | `tbiApi.js` 31–35: only `amount`, `category_id`; no `currency` param. |
| GetCalculations: we read response `currency` | **Missing** | `tbiApi.js` 59: `return data`; `tbi-calculate.js` uses `schemes` only; no `currency` read or forwarded. |
| Display amounts by returned `currency` | **Missing** | `TbiCreditCalculator.js` 173, 209, 214, 235: hardcoded `€`, no use of API `currency`. |
| Embedded calculator link with `currency=EUR` | **N/A** | No embedded calculator link in repo; only in-app calculator and cdn image. |

### Evidence snippets

- **applicationData (no currency):** `tbi-pay.js` lines 29–55 — object ends with `items: items.map(...)`, then conditional `period`, `promo`, redirects; no `currency`.
- **Prices in EUR:** `checkout.js` line 469: `price: (item.product.Price / EUR_RATE).toFixed(2)`; line 459: `EUR_RATE = 1.95583`.
- **GetCalculations no currency:** `tbiApi.js` lines 31–36: `params.append('amount', ...)`, `params.append('category_id', ...)`; no `currency`. Line 59: `return data` (no extraction of `currency`).
- **Hardcoded EUR in UI:** `TbiCreditCalculator.js` line 173: `€{parseFloat(minScheme.monthly_payment).toFixed(2)}`.

### Impact bullets

- Missing `currency: "EUR"` in registerApplication → after Jan 2026, TBI may reject or mis-handle applications; adding it aligns with doc and prevents rejection/mis-labeling.
- Not reading/using GetCalculations `currency` → we may show € for non-EUR data; using it “as-is” avoids mislabeling and aligns with doc.
- No embedded calculator link in use → no immediate impact; when/if added, use `currency=EUR` and amount in EUR.

### Minimal change plan (no patch)

1. **`src/pages/api/tbi-pay.js`:** Add `currency: 'EUR'` to `applicationData`.
2. **`src/lib/tbiApi.js`:** If GetCalculations supports a currency query param, add it (e.g. `currency=EUR`); parse and expose response `currency` (e.g. in return value or in a structure that tbi-calculate can forward).
3. **`src/pages/api/tbi-calculate.js`:** Forward `currency` from TBI response to the client response.
4. **`src/components/TbiCreditCalculator.js`:** Use returned `currency` for amount display (symbol/label); fallback to EUR if absent.
5. **Future:** Any new embedded TBI calculator URL must include `currency=EUR` and amount in EUR.

End of report.

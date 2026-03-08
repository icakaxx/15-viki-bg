## Section 1: `/api/tbi-pay` request body (redacted) + payloadTotal

**Client → `/api/tbi-pay` (from `submitTbiCredit` in `checkout.js`):**

```json
{
  "orderid": "<redacted-order-id>",
  "firstname": "<redacted>",
  "lastname": "<redacted>",
  "surname": "<redacted-or-empty>",
  "email": "<redacted>",
  "phone": "<redacted>",
  "deliveryaddress": {
    "country": "Bulgaria",
    "city": "<redacted>",
    "streetname": "<redacted>",
    "postalcode": "<redacted>"
  },
  "items": [
    {
      "name": "Brand Model",
      "description": "Main product",
      "qty": "Qp",
      "price": "(productPriceBGN / 1.95583).toFixed(2)",
      "sku": "productId",
      "category": 0,
      "imagelink": "https://..."
    },
    {
      "name": "Accessory 1",
      "description": "Accessory",
      "qty": "Qa1",
      "price": "(accessory1PriceBGN / 1.95583).toFixed(2)",
      "sku": "acc-…",
      "category": 0,
      "imagelink": "https://..."
    },
    {
      "name": "Монтаж",
      "description": "Професионален монтаж",
      "qty": "Qi",
      "price": "(installationPriceBGN / 1.95583).toFixed(2)",
      "sku": "installation-productId",
      "category": 0,
      "imagelink": ""
    }
    // ... one line per product, accessory, installation
  ],
  "period": "<selectedTbiScheme.period>",
  "successRedirectURL": "https://our-site/order-success?orderId=…",
  "failRedirectURL": "https://our-site/checkout?error=tbi_failed"
}
```

Where for each cart item:

- `productPriceBGN` = `item.product.Price` (BGN, per unit).
- `accessoryXPriceBGN` = `acc.Price` (BGN, per accessory unit).
- `installationPriceBGN` = `item.installationPrice` (BGN, per unit when installation selected).
- Quantities `Qp`, `QaX`, `Qi` are integers (`qty`, `accQty`, etc.).

**Server → TBI (`tbi-pay.js` + `tbiApi.js`):**

- `tbi-pay.js` builds:

```json
applicationData = {
  "orderid": "<same-as-client>",
  "firstname": "<redacted-or-empty>",
  "lastname": "<redacted-or-empty>",
  "surname": "<redacted-or-empty>",
  "email": "<redacted-or-empty>",
  "phone": "<redacted-or-empty>",
  "deliveryaddress": { ...same fields as client... },
  "items": items.map(i => ({
    "name": i.name,
    "description": i.description,
    "qty": String(i.qty),
    "price": String(i.price),
    "sku": i.sku,
    "category": i.category,
    "imagelink": i.imagelink
  })),
  "period": "<optional>",
  "promo": true|false,
  "successRedirectURL": "<url>",
  "failRedirectURL": "<url>",
  "statusURL": "<optional>"
}
```

- `tbiApi.registerApplication(applicationData)` then:
  - Encrypts `applicationData` JSON.
  - POSTs to `TBI_API_URL/RegisterApplication` with:

```json
{
  "reseller_code": "<TBI_RESELLER_CODE>",
  "reseller_key": "<TBI_RESELLER_KEY>",
  "data": "<encrypted applicationData>"
}
```

**Computed payloadTotal (what TBI sees numerically in `items`):**

Let:

- `cart.totalPrice` (BGN) = sum over all products, accessories, installation in the cart.
- `EUR_RATE = 1.95583`.

From `submitTbiCredit`, each monetary component in BGN is divided by `EUR_RATE` when placed into `items[].price`, with the same quantities as in the cart. Therefore:

- `payloadTotal = sum(Number(item.price) * Number(item.qty))`
- Algebraically:
  - `payloadTotal = cart.totalPrice / EUR_RATE`

So the **numerical total** that TBI receives in `items` equals the **full cart total converted to EUR**, to within rounding tolerance.

---

## Section 2: Comparison (payloadTotal vs expectedEUR vs expectedBGN)

Definitions:

- `payloadTotal = sum(Number(item.price) * Number(item.qty))`
- `expectedEUR = cart.totalPrice / 1.95583`
- `expectedBGN = cart.totalPrice`

Given how `submitTbiCredit` constructs `items`:

- `payloadTotal` is built from:
  - `(productPriceBGN / 1.95583) * productQty`
  - `+ Σ(accessoryPriceBGN / 1.95583 * accessoryQty)`
  - `+ (installationPriceBGN / 1.95583) * installationQty`
- Which simplifies to:  
  `payloadTotal = cart.totalPriceBGN / 1.95583 = expectedEUR`

Comparison:

| Metric        | Expression                                   | Currency unit | Relation                      |
|---------------|-----------------------------------------------|---------------|--------------------------------|
| payloadTotal  | sum(`item.price * item.qty`)                | **EUR**       | ≈ `cart.totalPrice / 1.95583` |
| expectedEUR   | `cart.totalPrice / 1.95583`                 | **EUR**       | ≈ `payloadTotal`              |
| expectedBGN   | `cart.totalPrice`                           | **BGN**       | ≈ `payloadTotal * 1.95583`    |

**Conclusion:** `payloadTotal` matches **expectedEUR** (EUR), **not** `expectedBGN`.

---

## Section 3: Root cause conclusion (A/B/C/D)

- We convert all cart BGN amounts to EUR in `submitTbiCredit` before sending them to `/api/tbi-pay`.
- The server passes `items[].price` through unchanged to TBI, and there is **no explicit currency field** in `applicationData`.
- The total amount on the TBI page numerically matches the **EUR** total from our cart (`cart.totalPrice / 1.95583`).
- In PROD, the TBI hosted page labels the currency as **BGN**, while DEV previously displayed **EUR**, using the same code path.

Given:

- Numbers match **EUR**.
- We do **not** send any currency flag.
- Different environments (DEV vs PROD) show different currency labels for the same kind of payload.

**Root cause:** **Case B** — *We are sending EUR, but TBI is configured to display BGN for the PROD merchant/account (or environment), while the DEV/beta configuration displays EUR.*

---

## Section 4: Fix plan summary (no code changes)

Because this is **Case B (TBI-side configuration)**, the primary fix is **coordination with TBI**, not a code change:

1. **Confirm currency with TBI for the PROD reseller code**
   - Provide TBI support with:
     - The **PROD `reseller_code`** value.
     - A sample `applicationData` JSON (before encryption) showing:
       - `items` with EUR-level amounts (e.g., product price ≈ 1034.99 instead of 2024.26).
       - The total `sum(price * qty)` and the corresponding cart total in BGN and EUR.
   - Ask TBI to confirm:
     - **Which currency** they assume for `items[].price` for this reseller.
     - Why the hosted page for this reseller is labeled **BGN** while the numbers correspond to **EUR**.

2. **Request TBI-side adjustment**
   - Ask TBI support to:
     - Configure the **PROD reseller account** so that:
       - Hosted pages **display EUR** as the currency for `items[].price`, or
       - They explicitly treat `items[].price` as **EUR**, consistent with our current integration.
   - Verify that:
     - DEV and PROD reseller configurations are aligned (same default currency, same expectations for amounts).

3. **Optional defensive improvements (only after TBI confirms behavior)**
   - If TBI documents a way to **explicitly specify currency** in the API:
     - Add a `currency` or equivalent field to `applicationData` (per TBI spec) and populate it with `"EUR"`.
   - Keep the current BGN→EUR conversion logic in `submitTbiCredit` so that:
     - `payloadTotal` continues to equal `cart.totalPrice / 1.95583`.

4. **Validation in both environments**
   - After TBI updates configuration:
     - Re-run an identical order in DEV and PROD.
     - Confirm:
       - Hosted TBI page shows the **same numeric financed amount**.
       - The **currency label is EUR** in both environments.


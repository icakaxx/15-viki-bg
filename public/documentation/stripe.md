here is some documentation
# Accept a payment

Securely accept payments online.

Build a payment form or use a prebuilt checkout page to start accepting online payments.

# Stripe-hosted page

> This is a Stripe-hosted page for when platform is web and ui is stripe-hosted. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=stripe-hosted.

Redirect to a Stripe-hosted payment page using [Stripe Checkout](https://docs.stripe.com/payments/checkout.md). See how this integration [compares to Stripe’s other integration types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

Redirect to Stripe-hosted payment page

- 20 preset fonts
- 3 preset border radius
- Custom background and border color
- Custom logo

Try it out

## Redirect your customer to Stripe Checkout

Add a checkout button to your website that calls a server-side endpoint to create a [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md).

You can also create a Checkout Session for an [existing customer](https://docs.stripe.com/payments/existing-customers.md?platform=web&ui=stripe-hosted), allowing you to prefill Checkout fields with known contact information and unify your purchase history for that customer.

```html
<html>
  <head>
    <title>Buy cool new product</title>
  </head>
  <body>
    <!-- Use action="/create-checkout-session.php" if your server is PHP based. -->
    <form action="/create-checkout-session" method="POST">
      <button type="submit">Checkout</button>
    </form>
  </body>
</html>
```

A Checkout Session is the programmatic representation of what your customer sees when they’re redirected to the payment form. You can configure it with options such as:

* [Line items](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-line_items) to charge
* Currencies to use

You must populate `success_url` with the URL value of a page on your website that Checkout returns your customer to after they complete the payment. You can optionally also provide a `cancel_url` value of a page on your website that Checkout returns your customer to if they terminate the payment process before completion.

Checkout Sessions expire 24 hours after creation by default.

After creating a Checkout Session, redirect your customer to the [URL](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-url) returned in the response.

```ruby
\# This example sets up an endpoint using the Sinatra framework.


require 'json'
require 'sinatra'
require 'stripe'
<<setup key>>

post '/create-checkout-session' do
  session = Stripe::Checkout::Session.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    # These placeholder URLs will be replaced in a following step.
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  })

  redirect session.url, 303
end
```

```python
\# This example sets up an endpoint using the Flask framework.
# Watch this video to get started: https://youtu.be/7Ul1vfmsDck.

import os
import stripe

from flask import Flask, redirect

app = Flask(__name__)

stripe.api_key = '<<secret key>>'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
  session = stripe.checkout.Session.create(
    line_items=[{
      'price_data': {
        'currency': 'usd',
        'product_data': {
          'name': 'T-shirt',
        },
        'unit_amount': 2000,
      },
      'quantity': 1,
    }],
    mode='payment',
    success_url='http://localhost:4242/success',
    cancel_url='http://localhost:4242/cancel',
  )

  return redirect(session.url, code=303)

if __name__== '__main__':
    app.run(port=4242)
```

```php
<?php

require 'vendor/autoload.php';

$stripe = new \Stripe\StripeClient('<<secret key>>');

$checkout_session = $stripe->checkout->sessions->create([
  'line_items' => [[
    'price_data' => [
      'currency' => 'usd',
      'product_data' => [
        'name' => 'T-shirt',
      ],
      'unit_amount' => 2000,
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'success_url' => 'http://localhost:4242/success',
  'cancel_url' => 'http://localhost:4242/cancel',
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkout_session->url);
?>
```

```java
import java.util.HashMap;
import java.util.Map;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);
    Stripe.apiKey = "<<secret key>>";

    post("/create-checkout-session", (request, response) -> {

      SessionCreateParams params =
        SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setSuccessUrl("http://localhost:4242/success")
          .setCancelUrl("http://localhost:4242/cancel")
          .addLineItem(
          SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
              SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(2000L)
                .setProductData(
                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                    .setName("T-shirt")
                    .build())
                .build())
            .build())
          .build();

      Session session = Session.create(params);

      response.redirect(session.getUrl(), 303);
      return "";
    });
  }
}
```

```javascript
// This example sets up an endpoint using the Express framework.

const express = require('express');
const app = express();
const stripe = require('stripe')('<<secret key>>')

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:4242/success',
    cancel_url: 'http://localhost:4242/cancel',
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
```

```go
package main

import (
  "net/http"

  "github.com/labstack/echo"
  "github.com/labstack/echo/middleware"
  "github.com/stripe/stripe-go/v{{golang.major_version}}"
  "github.com/stripe/stripe-go/v{{golang.major_version}}/checkout/session"
)

// This example sets up an endpoint using the Echo framework.
// Watch this video to get started: https://youtu.be/ePmEVBu8w6Y.

func main() {
  stripe.Key = "<<secret key>>"

  e := echo.New()
  e.Use(middleware.Logger())
  e.Use(middleware.Recover())

  e.POST("/create-checkout-session", createCheckoutSession)

  e.Logger.Fatal(e.Start("localhost:4242"))
}

func createCheckoutSession(c echo.Context) (err error) {
  params := &stripe.CheckoutSessionParams{
    Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
    LineItems: []*stripe.CheckoutSessionLineItemParams{
      &stripe.CheckoutSessionLineItemParams{
        PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
          Currency: stripe.String("usd"),
          ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
            Name: stripe.String("T-shirt"),
          },
          UnitAmount: stripe.Int64(2000),
        },
        Quantity: stripe.Int64(1),
      },
    },
    SuccessURL: stripe.String("http://localhost:4242/success"),
    CancelURL:  stripe.String("http://localhost:4242/cancel"),
  }

  s, _ := session.New(params)

  if err != nil {
    return err
  }

  return c.Redirect(http.StatusSeeOther, s.URL)
}
```

```dotnet
// This example sets up an endpoint using the ASP.NET MVC framework.
// Watch this video to get started: https://youtu.be/2-mMOB8MhmE.

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
  public class PaymentsController : Controller
  {
    public PaymentsController()
    {
      StripeConfiguration.ApiKey = "<<secret key>>";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession()
    {
      var options = new SessionCreateOptions
      {
        LineItems = new List<SessionLineItemOptions>
        {
          new SessionLineItemOptions
          {
            PriceData = new SessionLineItemPriceDataOptions
            {
              UnitAmount = 2000,
              Currency = "usd",
              ProductData = new SessionLineItemPriceDataProductDataOptions
              {
                Name = "T-shirt",
              },
            },
            Quantity = 1,
          },
        },
        Mode = "payment",
        SuccessUrl = "http://localhost:4242/success",
        CancelUrl = "http://localhost:4242/cancel",
      };

      var service = new SessionService();
      Session session = service.Create(options);

      Response.Headers.Add("Location", session.Url);
      return new StatusCodeResult(303);
    }
  }
}
```

### Payment methods

By default, Stripe enables cards and other common payment methods. You can turn individual payment methods on or off in the [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods). In Checkout, Stripe evaluates the currency and any restrictions, then dynamically presents the supported payment methods to the customer.

To see how your payment methods appear to customers, enter a transaction ID or set an order amount and currency in the Dashboard.

You can enable Apple Pay and Google Pay in your [payment methods settings](https://dashboard.stripe.com/settings/payment_methods). By default, Apple Pay is enabled and Google Pay is disabled. However, in some cases Stripe filters them out even when they’re enabled. We filter Google Pay if you [enable automatic tax](https://docs.stripe.com/tax/checkout.md) without collecting a shipping address.

Checkout’s Stripe-hosted pages don’t need integration changes to enable Apple Pay or Google Pay. Stripe handles these payments the same way as other card payments.

### Confirm your endpoint

Confirm your endpoint is accessible by starting your web server (for example, `localhost:4242`) and running the following command:

```bash
curl -X POST -is "http://localhost:4242/create-checkout-session" -d ""
```

You should see a response in your terminal that looks like this:

```bash
HTTP/1.1 303 See Other
Location: https://checkout.stripe.com/c/pay/cs_test_...
...
```

### Testing 

You should now have a working checkout button that redirects your customer to Stripe Checkout.

1. Click the checkout button.
1. You’re redirected to the Stripe Checkout payment form.

If your integration isn’t working:

1. Open the Network tab in your browser’s developer tools.
1. Click the checkout button and confirm it sent an XHR request to your server-side endpoint (`POST /create-checkout-session`).
1. Verify the request is returning a 200 status.
1. Use `console.log(session)` inside your button click listener to confirm the correct data returned.

## Show a success page

It’s important for your customer to see a success page after they successfully submit the payment form. Host this success page on your site.

Create a minimal success page:

```html
<html>
  <head><title>Thanks for your order!</title></head>
  <body>
    <h1>Thanks for your order!</h1>
    <p>
      We appreciate your business!
      If you have any questions, please email
      <a href="mailto:orders@example.com">orders@example.com</a>.
    </p>
  </body>
</html>
```

Next, update the Checkout Session creation endpoint to use this new page:

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions
        {
            PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
            {
                Currency = "usd",
                ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                {
                    Name = "T-shirt",
                },
                UnitAmount = 2000,
            },
            Quantity = 1,
        },
    },
    Mode = "payment",
    SuccessUrl = "http://localhost:4242/success.html",
    CancelUrl = "http://localhost:4242/cancel.html",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
        Currency: stripe.String(string(stripe.CurrencyUSD)),
        ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
          Name: stripe.String("T-shirt"),
        },
        UnitAmount: stripe.Int64(2000),
      },
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  SuccessURL: stripe.String("http://localhost:4242/success.html"),
  CancelURL: stripe.String("http://localhost:4242/cancel.html"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .addLineItem(
      SessionCreateParams.LineItem.builder()
        .setPriceData(
          SessionCreateParams.LineItem.PriceData.builder()
            .setCurrency("usd")
            .setProductData(
              SessionCreateParams.LineItem.PriceData.ProductData.builder()
                .setName("T-shirt")
                .build()
            )
            .setUnitAmount(2000L)
            .build()
        )
        .setQuantity(1L)
        .build()
    )
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .setSuccessUrl("http://localhost:4242/success.html")
    .setCancelUrl("http://localhost:4242/cancel.html")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'http://localhost:4242/success.html',
  cancel_url: 'http://localhost:4242/cancel.html',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  line_items=[
    {
      "price_data": {"currency": "usd", "product_data": {"name": "T-shirt"}, "unit_amount": 2000},
      "quantity": 1,
    },
  ],
  mode="payment",
  success_url="http://localhost:4242/success.html",
  cancel_url="http://localhost:4242/cancel.html",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'line_items' => [
    [
      'price_data' => [
        'currency' => 'usd',
        'product_data' => ['name' => 'T-shirt'],
        'unit_amount' => 2000,
      ],
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'success_url' => 'http://localhost:4242/success.html',
  'cancel_url' => 'http://localhost:4242/cancel.html',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {name: 'T-shirt'},
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'http://localhost:4242/success.html',
  cancel_url: 'http://localhost:4242/cancel.html',
})
```

If you want to customize your success page, read the [custom success page](https://docs.stripe.com/payments/checkout/custom-success-page.md) guide.

### Testing

1. Click your checkout button.
1. Fill out the payment details with the test card information:
   - Enter `4242 4242 4242 4242` as the card number.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Click **Pay**.
1. You’re redirected to your new success page.

Next, find the new payment in the Stripe Dashboard. Successful payments appear in the Dashboard’s [list of payments](https://dashboard.stripe.com/payments). When you click a payment, it takes you to the payment details page. The **Checkout summary** section contains billing information and the list of items purchased, which you can use to manually fulfill the order.

## Handle post-payment events

Stripe sends a [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed) event when a customer completes a Checkout Session payment. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive and handle these events, which might trigger you to:

* Send an order confirmation email to your customer.
* Log the sale in a database.
* Start a shipping workflow.

Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your Checkout landing page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

Learn more in our [fulfillment guide for Checkout](https://docs.stripe.com/checkout/fulfillment.md).

Handle the following events when collecting payments with the Checkout:

| Event                                                                                                                                        | Description                                                                                | Action                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed)                             | Sent when a customer successfully completes a Checkout Session.                            | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_succeeded](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_succeeded) | Sent when a payment made with a delayed payment method, such as ACH direct debt, succeeds. | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_failed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_failed)       | Sent when a payment made with a delayed payment method, such as ACH direct debt, fails.    | Notify the customer of the failure and bring them back on-session to attempt payment again. |

## Test your integration

To test your Stripe-hosted payment form integration:

1. Create a Checkout Session.
1. Fill out the payment details with a method from the following table.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Click **Pay**. You’re redirected to your `success_url`.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like a Checkout summary with billing information and the list of purchased items. You can use this information to fulfill the order.

Learn more about [testing your integration](https://docs.stripe.com/testing.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

### Test cards

| Number              | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| 4242 4242 4242 4242 | Succeeds and immediately processes the payment.               |
| 4000 0000 0000 3220 | Requires 3D Secure 2 authentication for a successful payment. |
| 4000 0000 0000 9995 | Always fails with a decline code of `insufficient_funds`.     |

## Create products and prices

You can [set up your Checkout Session](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) to accept tips and donations, or sell pay-what-you-want products and services.

Before you create a Checkout Session, you can create *Products* and *Prices* upfront. Use products to represent different physical goods or levels of service, and *Prices* to represent each product’s pricing.

For example, you can create a T-shirt as a product with a price of 20 USD. This allows you to update and add prices without needing to change the details of your underlying products. You can either create products and prices with the Stripe Dashboard or API. Learn more about [how products and prices work](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

The API only requires a `name` to create a [Product](https://docs.stripe.com/api/products.md). Checkout displays the product `name`, `description`, and `images` that you supply.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new ProductCreateOptions { Name = "T-shirt" };
var service = new ProductService();
Product product = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.ProductParams{Name: stripe.String("T-shirt")};
result, err := product.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

ProductCreateParams params = ProductCreateParams.builder().setName("T-shirt").build();

Product product = Product.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

product = stripe.Product.create(name="T-shirt")
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$product = $stripe->products->create(['name' => 'T-shirt']);
```

```ruby
Stripe.api_key = '<<secret key>>'

product = Stripe::Product.create({name: 'T-shirt'})
```

Next, create a [Price](https://docs.stripe.com/api/prices.md) to define how much to charge for your product. This includes how much the product costs and what currency to use.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PriceCreateOptions
{
    Product = "<<product>>",
    UnitAmount = 2000,
    Currency = "usd",
};
var service = new PriceService();
Price price = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PriceParams{
  Product: stripe.String("<<product>>"),
  UnitAmount: stripe.Int64(2000),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
};
result, err := price.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PriceCreateParams params =
  PriceCreateParams.builder()
    .setProduct("<<product>>")
    .setUnitAmount(2000L)
    .setCurrency("usd")
    .build();

Price price = Price.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const price = await stripe.prices.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

price = stripe.Price.create(
  product="<<product>>",
  unit_amount=2000,
  currency="usd",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$price = $stripe->prices->create([
  'product' => '<<product>>',
  'unit_amount' => 2000,
  'currency' => 'usd',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

price = Stripe::Price.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
})
```

Copy products created in a sandbox to live mode so that you don’t need to re-create them. In the Product detail view in the Dashboard, click **Copy to live mode** in the upper right corner. You can only do this once for each product created in a sandbox. Subsequent updates to the test product aren’t reflected for the live product.

Make sure you’re in a sandbox by clicking **Sandboxes** within the Dashboard account picker. Next, define the items you want to sell. To create a new product and price:

- Navigate to the [Products](https://dashboard.stripe.com/test/products) section in the Dashboard.
- Click **Add product**.
- Select **One time** when setting the price.

Checkout displays the product name, description, and images that you supply.

Each price you create has an ID. When you create a Checkout Session, reference the price ID and quantity. If you’re selling in multiple currencies, make your Price *multi-currency*. Checkout automatically [determines the customer’s local currency](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) and presents that currency if the Price supports it.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    SuccessUrl = "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
    CancelUrl = "https://example.com/cancel",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  SuccessURL: stripe.String("https://example.com/success?session_id={CHECKOUT_SESSION_ID}"),
  CancelURL: stripe.String("https://example.com/cancel"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setSuccessUrl("https://example.com/success?session_id={CHECKOUT_SESSION_ID}")
    .setCancelUrl("https://example.com/cancel")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  success_url="https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url="https://example.com/cancel",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'success_url' => 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => 'https://example.com/cancel',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
})
```

## Prefill customer data

If you’ve already collected your customer’s email and want to prefill it in the Checkout Session for them, pass [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) when creating a Checkout Session.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    CustomerEmail = "customer@example.com",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "<<price>>", Quantity = 1 },
    },
    Mode = "payment",
    SuccessUrl = "https://example.com/success",
    CancelUrl = "https://example.com/cancel",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  CustomerEmail: stripe.String("customer@example.com"),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("<<price>>"),
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  SuccessURL: stripe.String("https://example.com/success"),
  CancelURL: stripe.String("https://example.com/cancel"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setCustomerEmail("customer@example.com")
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("<<price>>").setQuantity(1L).build()
    )
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .setSuccessUrl("https://example.com/success")
    .setCancelUrl("https://example.com/cancel")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  customer_email="customer@example.com",
  line_items=[{"price": "<<price>>", "quantity": 1}],
  mode="payment",
  success_url="https://example.com/success",
  cancel_url="https://example.com/cancel",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'customer_email' => 'customer@example.com',
  'line_items' => [
    [
      'price' => '<<price>>',
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'success_url' => 'https://example.com/success',
  'cancel_url' => 'https://example.com/cancel',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
})
```

## Save payment method details

By default, payment methods used to make a one-time payment with Checkout aren’t available for future use.

### Save payment methods to charge them off-session

You can set Checkout to save payment methods used to make a one-time payment by passing the [payment_intent_data.setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) argument. This is useful if you need to capture a payment method on-file to use for future fees, such as cancellation or no-show fees.

If you use Checkout in `subscription` mode, Stripe automatically saves the payment method to charge it for subsequent payments. Card payment methods saved to customers using either `setup_future_usage` or `subscription` mode don’t appear for return purchases in Checkout (more on this below). We recommend using [custom text](https://docs.stripe.com/payments/checkout/customization/policies.md) to link out to any relevant terms regarding the usage of saved payment information.

Global privacy laws are complicated and nuanced. We recommend contacting your legal and privacy team prior to implementing [setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) because it might implicate your existing privacy compliance framework. Refer to [the guidance issued by the European Protection Board](https://edpb.europa.eu/system/files/2021-05/recommendations022021_on_storage_of_credit_card_data_en_1.pdf) to learn more about saving payment details.

### Save payment methods to prefill them in Checkout

By default, Checkout uses [Link](https://docs.stripe.com/payments/checkout/customization/behavior.md#link) to provide your customers with the option to securely save and reuse their payment information. If you prefer to manage payment methods yourself, use [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) when creating a Checkout Session to let your customers save their payment methods for future purchases in Checkout.

Passing this parameter in either [payment](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) or [subscription](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) mode displays an optional checkbox to let customers explicitly save their payment method for future purchases. When customers check this checkbox, Checkout saves the payment method with [allow_redisplay: always](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay). Checkout uses this parameter to determine whether a payment method can be prefilled on future purchases. When using `saved_payment_method_options.payment_method_save`, you don’t need to pass in `setup_future_usage` to save the payment method.

Using [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) requires a `Customer`. To save a new customer, set the Checkout Session’s [customer_creation](https://docs.stripe.com/api/checkout/sessions/create.md) to `always`. Otherwise, the session doesn’t save the customer or the payment method.

If `payment_method_save` isn’t passed in or if the customer doesn’t agree to save the payment method, Checkout still saves payment methods created in `subscription` mode or using `setup_future_usage`. These payment methods have an `allow_redisplay` value of `limited`, which prevents them from being prefilled for returning purchases and allows you to comply with card network rules and data protection regulations. Learn how to [change the default behavior enabled by these modes](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout) and how to change or override `allow_redisplay` behavior.

You can use Checkout to save cards and other payment methods to charge them off-session, but Checkout only prefills saved cards. Learn how to [prefill saved cards](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout). To save a payment method without an initial payment, [use Checkout in setup mode](https://docs.stripe.com/payments/save-and-reuse.md?platform=checkout).

## Separate authorization and capture

Stripe supports two-step card payments so you can first authorize a card, then capture funds later. When Stripe authorizes a payment, the card issuer guarantees the funds and places a hold for the payment amount on the customer’s card. You then have a certain amount of time to capture the funds, [depending on the card](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations)). If you don’t capture the payment before the authorization expires, the payment is cancelled and the issuer releases the held funds.

Separating authorization and capture is useful if you need to take additional actions between confirming that a customer is able to pay and collecting their payment. For example, if you’re selling stock-limited items, you may need to confirm that an item purchased by your customer using Checkout is still available before capturing their payment and fulfilling the purchase. Accomplish this using the following workflow:

1. Confirm that Stripe authorized the customer’s payment method.
1. Consult your inventory management system to confirm that the item is still available.
1. Update your inventory management system to indicate that a customer has purchased the item.
1. Capture the customer’s payment.
1. Inform your customer whether their purchase was successful on your confirmation page.

To indicate that you want to separate authorization and capture, you must set the value of [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) to `manual` when creating the Checkout Session. This instructs Stripe to only authorize the amount on the customer’s card.

To capture an uncaptured payment, you can use either the [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) or the [capture](https://docs.stripe.com/api/payment_intents/capture.md) endpoint. Programmatically capturing payments requires access to the PaymentIntent created during the Checkout Session, which you can get from the [Session](https://docs.stripe.com/api/payment_intents/capture.md) object.

## Customer account management

Let your customers [manage](https://docs.stripe.com/customer-management.md) their own accounts by sharing a link to your *customer portal*. The customer portal lets customers log in with their email to manage subscriptions, update payment methods, and so on.

## See Also

- [Add discounts](https://docs.stripe.com/payments/checkout/discounts.md)
- [Collect taxes](https://docs.stripe.com/payments/checkout/taxes.md)
- [Collect tax IDs](https://docs.stripe.com/tax/checkout/tax-ids.md)
- [Add shipping](https://docs.stripe.com/payments/collect-addresses.md?payment-ui=checkout)
- [Customize your branding](https://docs.stripe.com/payments/checkout/customization.md)
- [Customize your success page](https://docs.stripe.com/payments/checkout/custom-success-page.md)

# Embedded form

> This is a Embedded form for when platform is web and ui is embedded-form. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=embedded-form.

Embed a prebuilt payment form on your site using [Stripe Checkout](https://docs.stripe.com/payments/checkout.md). See how this integration [compares to Stripe’s other integration types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

Embed prebuilt payment form on your site

- 20 preset fonts
- 3 preset border radius
- Custom background and border color
- Custom logo

Use the [branding settings](https://dashboard.stripe.com/settings/branding/checkout) in the Stripe Dashboard to match Checkout to your site design.

## Create a Checkout Session

From your server, create a *Checkout Session* and set the [ui_mode](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-ui_mode) to `embedded`. You can configure the [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md) with [line items](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-line_items) to include and options such as [currency](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-currency).

You can also create a Checkout Session for an [existing customer](https://docs.stripe.com/payments/existing-customers.md?platform=web&ui=stripe-hosted), allowing you to prefill Checkout fields with known contact information and unify your purchase history for that customer.

To return customers to a custom page that you host on your website, specify that page’s URL in the [return_url](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-return_url) parameter. Include the `{CHECKOUT_SESSION_ID}` template variable in the URL to retrieve the session’s status on the return page. Checkout automatically substitutes the variable with the Checkout Session ID before redirecting.

Read more about [configuring the return page](https://docs.stripe.com/payments/accept-a-payment.md?platform=web&ui=embedded-form#return-page) and other options for [customizing redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-form).

After you create the Checkout Session, use the `client_secret` returned in the response to [mount Checkout](#mount-checkout).

```ruby
\# This example sets up an endpoint using the Sinatra framework.
# To learn more about Sinatra, watch this video: https://youtu.be/8aA9Enb8NVc.
require 'json'
require 'sinatra'
require 'stripe'
<<setup key>>

post '/create-checkout-session' do
  session = Stripe::Checkout::Session.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}'
  })

  {clientSecret: session.client_secret}.to_json
end
```

```python
\# This example sets up an endpoint using the Flask framework.
# To learn more about Flask, watch this video: https://youtu.be/7Ul1vfsmsDck.
import os
import stripe
from flask import Flask, redirect

app = Flask(__name__)

stripe.api_key = '<<secret key>>'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
  session = stripe.checkout.Session.create(
    line_items = [{
      'price_data': {
        'currency': 'usd',
        'product_data': {
          'name': 'T-shirt',
        },
        'unit_amount': 2000,
      },
      'quantity': 1,
    }],
    mode = 'payment',
    ui_mode = 'embedded',
    return_url = 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}',
  )

  return jsonify(clientSecret=session.client_secret)

if __name__ == '__main__':
  app.run(port=4242)
```

```php
<?php

require 'vendor/autoload.php';

$stripe = new \Stripe\StripeClient([
  "api_key" => '<<secret key>>'
]);

$checkout_session = $stripe->checkout->sessions->create([
  'line_items' => [[
    'price_data' => [
      'currency' => 'usd',
      'product_data' => [
        'name' => 'T-shirt',
      ],
      'unit_amount' => 2000,
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'ui_mode' => 'embedded',
  'return_url' => 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}',
]);

  echo json_encode(array('clientSecret' => $checkout_session->client_secret));
?>
```

```java
import java.util.HashMap;
import java.util.Map;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;
import com.google.gson.Gson;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);
    Stripe.apiKey = "<<secret key>>";

    Gson gson = new Gson();

    post("/create-checkout-session", (request, response) -> {

      SessionCreateParams params =
        SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
          .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
          .addLineItem(
          SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
              SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(2000L)
                .setProductData(
                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                    .setName("T-shirt")
                    .build())
                .build())
            .build())
          .build();

      Session session = Session.create(params);

      Map<String, String> map = new HashMap();
      map.put("clientSecret", session.getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString());

      return map;
    }, gson::toJson);
  }
}
```

```javascript
// This example sets up an endpoint using the Express framework.
const express = require('express');
const app = express();

const stripe = require('stripe')('<<secret key>>');

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}'
  });

  res.send({clientSecret: session.client_secret});
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
```

```go
package main

import (
  "net/http"

  "github.com/labstack/echo"
  "github.com/labstack/echo/middleware"
  "github.com/stripe/stripe-go/v{{golang.major_version}}"
  "github.com/stripe/stripe-go/v{{golang.major_version}}/checkout/session"
)

// This example sets up an endpoint using the Echo framework.
// To learn more about Echo, watch this video: https://youtu.be/ePmEVBu8w6Y.

func main() {
  stripe.Key = "<<secret key>>"

  e := echo.New()
  e.Use(middleware.Logger())
  e.Use(middleware.Recover())

  e.POST("/create-checkout-session", createCheckoutSession)

  e.Logger.Fatal(e.Start("localhost:4242"))
}

type CheckoutData struct {
  ClientSecret string `json:"clientSecret"`
}

func createCheckoutSession(c echo.Context) (err error) {
  params := &stripe.CheckoutSessionParams{
    Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
    UIMode: stripe.String("embedded"),
    ReturnURL: stripe.String("https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}"),
    LineItems: []*stripe.CheckoutSessionLineItemParams{
      &stripe.CheckoutSessionLineItemParams{
        PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
          Currency: stripe.String("usd"),
          ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
            Name: stripe.String("T-shirt"),
          },
          UnitAmount: stripe.Int64(2000),
        },
        Quantity: stripe.Int64(1),
      },
    },
  }

  s, _ := session.New(params)

  if err != nil {
    return err
  }

  data := CheckoutData{
    ClientSecret: s.ClientSecret,
  }

  return c.JSON(http.StatusOK, data)
}
```

```dotnet
// This example sets up an endpoint using the ASP.NET MVC framework.
// To learn more about ASP.NET MVC, watch this video: https://youtu.be/2-mMOB8MhmE.

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
  public class PaymentsController : Controller
  {
    public PaymentsController()
    {
      StripeConfiguration.ApiKey = "<<secret key>>";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession()
    {
      var options = new SessionCreateOptions
      {
        LineItems = new List<SessionLineItemOptions>
        {
          new SessionLineItemOptions
          {
            PriceData = new SessionLineItemPriceDataOptions
            {
              UnitAmount = 2000,
              Currency = "usd",
              ProductData = new SessionLineItemPriceDataProductDataOptions
              {
                Name = "T-shirt",
              },
            },
            Quantity = 1,
          },
        },
        Mode = "payment",
        UiMode = "embedded",
        ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
      };

      var service = new SessionService();
      Session session = service.Create(options);

      return Json(new {clientSecret = session.ClientSecret});
    }
  }
}
```

## Mount Checkout

Checkout is available as part of [Stripe.js](https://docs.stripe.com/js). Include the Stripe.js script on your page by adding it to the head of your HTML file. Next, create an empty DOM node (container) to use for mounting.

```html
<head>
  <script src="https://js.stripe.com/basil/stripe.js"></script>
</head>
<body>
  <div id="checkout">
    <!-- Checkout will insert the payment form here -->
  </div>
</body>
```

Initialize Stripe.js with your publishable API key.

Create an asynchronous `fetchClientSecret` function that makes a request to your server to create the Checkout Session and retrieve the client secret. Pass this function into `options` when you create the Checkout instance:

```javascript
// Initialize Stripe.js

initialize();

// Fetch Checkout Session and retrieve the client secret
async function initialize() {
  const fetchClientSecret = async () => {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  // Initialize Checkout
  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}
```

Install [react-stripe-js](https://docs.stripe.com/sdks/stripejs-react.md) and the Stripe.js loader from npm:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

To use the Embedded Checkout component, create an `EmbeddedCheckoutProvider`. Call `loadStripe` with your publishable API key and pass the returned `Promise` to the provider.

Create an asynchronous `fetchClientSecret` function that makes a request to your server to create the Checkout Session and retrieve the client secret. Pass this function into the `options` prop accepted by the provider.

```jsx
import * as React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_123');

const App = () => {
  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("/create-checkout-session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const options = {fetchClientSecret};

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
```

Checkout renders in an iframe that securely sends payment information to Stripe over an HTTPS connection.

Avoid placing Checkout within another iframe because some payment methods require redirecting to another page for payment confirmation.

### Customize appearance

Customize Checkout to match the design of your site by setting the background color, button color, border radius, and fonts in your account’s [branding settings](https://dashboard.stripe.com/settings/branding).

By default, Checkout renders with no external padding or margin. We recommend using a container element such as a div to apply your desired margin (for example, 16px on all sides).

## Show a return page

After your customer attempts payment, Stripe redirects them to a return page that you host on your site. When you created the Checkout Session, you specified the URL of the return page in the [return_url](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-return_url) parameter. Read more about other options for [customizing redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-form).

When rendering your return page, retrieve the Checkout Session status using the Checkout Session ID in the URL. Handle the result according to the session status as follows:

- `complete`: The payment succeeded. Use the information from the Checkout Session to render a success page.
- `open`: The payment failed or was canceled. Remount Checkout so that your customer can try again.

```ruby
get '/session-status' do
  session = Stripe::Checkout::Session.retrieve(params[:session_id])

  {status: session.status, customer_email:  session.customer_details.email}.to_json
end
```

```python
@app.route('/session-status', methods=['GET'])
def session_status():
  session = stripe.checkout.Session.retrieve(request.args.get('session_id'))

  return jsonify(status=session.status, customer_email=session.customer_details.email)
```

```php
try {
  // retrieve JSON from POST body
  $jsonStr = file_get_contents('php://input');
  $jsonObj = json_decode($jsonStr);

  $session = $stripe->checkout->sessions->retrieve($jsonObj->session_id);

  echo json_encode(['status' => $session->status, 'customer_email' => $session->customer_details->email]);
  http_response_code(200);
} catch (Error $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
```

```java
get("/session-status", (request, response) -> {
      Session session = Session.retrieve(request.queryParams("session_id"));

      Map<String, String> map = new HashMap();
      map.put("status", session.getRawJsonObject().getAsJsonPrimitive("status").getAsString());
      map.put("customer_email", session.getRawJsonObject().getAsJsonObject("customer_details").getAsJsonPrimitive("email").getAsString());

      return map;
    }, gson::toJson);
```

```javascript
app.get('/session_status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_details.email
  });
});
```

```go
func retrieveCheckoutSession(w http.ResponseWriter, r *http.Request) {
  s, _ := session.Get(r.URL.Query().Get("session_id"), nil)

  writeJSON(w, struct {
    Status string `json:"status"`
    CustomerEmail string `json:"customer_email"`
  }{
    Status: string(s.Status),
    CustomerEmail: string(s.CustomerDetails.Email),
  })
}
```

```dotnet
[Route("session-status")]
[ApiController]
public class SessionStatusController : Controller
{
    [HttpGet]
    public ActionResult SessionStatus([FromQuery] string session_id)
    {
        var sessionService = new SessionService();
        Session session = sessionService.Get(session_id);

        return Json(new {status = session.Status,  customer_email = session.CustomerDetails.Email});
    }
}
```

```javascript
const session = await fetch(`/session_status?session_id=${session_id}`)
if (session.status == 'open') {
  // Remount embedded Checkout
} else if (session.status == 'complete') {
  // Show success page
  // Optionally use session.payment_status or session.customer_email
  // to customize the success page
}
```

#### Redirect-based payment methods

During payment, some payment methods redirect the customer to an intermediate page, such as a bank authorization page. When they complete that page, Stripe redirects them to your return page.

Learn more about [redirect-based payment methods and redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-form#redirect-based-payment-methods).

## Handle post-payment events

Stripe sends a [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed) event when a customer completes a Checkout Session payment. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive and handle these events, which might trigger you to:

* Send an order confirmation email to your customer.
* Log the sale in a database.
* Start a shipping workflow.

Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your Checkout landing page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

Learn more in our [fulfillment guide for Checkout](https://docs.stripe.com/checkout/fulfillment.md).

Handle the following events when collecting payments with the Checkout:

| Event                                                                                                                                        | Description                                                                                | Action                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed)                             | Sent when a customer successfully completes a Checkout Session.                            | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_succeeded](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_succeeded) | Sent when a payment made with a delayed payment method, such as ACH direct debt, succeeds. | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_failed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_failed)       | Sent when a payment made with a delayed payment method, such as ACH direct debt, fails.    | Notify the customer of the failure and bring them back on-session to attempt payment again. |

## Test your integration

To test your embedded payment form integration:

1. Create an embedded Checkout Session and mount Checkout on your page.
1. Fill out the payment details with a method from the table below.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Click **Pay**. You’re redirected to your `return_url`.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like a Checkout summary with billing information and the list of purchased items. You can use this information to fulfill the order.

Learn more about [testing your integration](https://docs.stripe.com/testing.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Add more payment methods

By default, Checkout [supports many payment methods](https://docs.stripe.com/payments/payment-methods/integration-options.md#choose-how-to-add-payment-methods). You have to take additional steps to enable and display some methods, like Apple Pay, Google Pay, and buy now, pay later methods.

### Apple Pay and Google Pay

To accept payments from Apple Pay and Google Pay, you must:

* Enable them in your [payment methods settings](https://dashboard.stripe.com/settings/payment_methods). Apple Pay is enabled by default.
* Serve your application over HTTPS in development and production.
* [Register your domain](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).
* Serve your application over HTTPS in development and production. You can use a service like [ngrok](https://ngrok.com/) to serve your application for local testing.

In addition, a Checkout Session only displays the Apple Pay button to customers when _all_ of the following conditions are true:

- The customer’s device is running macOS version 17 or later or iOS version 17 or later.
- The customer is using the Safari browser.
- The customer has a valid card registered with Apple Pay.

A Checkout Session only displays the Google Pay button to customers when _all_ of the following conditions are true:

- The customer’s device is running Chrome 61 or newer.
- The customer has a valid card registered with Google Pay.

Stripe Checkout doesn’t support Apple Pay or Google Pay for Stripe accounts or customers in India. If your IP address is in India, you can’t test your Apple Pay or Google Pay integration, even if the Stripe account is outside India.

## Create products and prices

You can [set up your Checkout Session](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) to accept tips and donations, or sell pay-what-you-want products and services.

Before you create a Checkout Session, you can create *Products* and *Prices* upfront. Use products to represent different physical goods or levels of service, and *Prices* to represent each product’s pricing.

For example, you can create a T-shirt as a product with a price of 20 USD. This allows you to update and add prices without needing to change the details of your underlying products. You can either create products and prices with the Stripe Dashboard or API. Learn more about [how products and prices work](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

The API only requires a `name` to create a [Product](https://docs.stripe.com/api/products.md). Checkout displays the product `name`, `description`, and `images` that you supply.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new ProductCreateOptions { Name = "T-shirt" };
var service = new ProductService();
Product product = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.ProductParams{Name: stripe.String("T-shirt")};
result, err := product.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

ProductCreateParams params = ProductCreateParams.builder().setName("T-shirt").build();

Product product = Product.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

product = stripe.Product.create(name="T-shirt")
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$product = $stripe->products->create(['name' => 'T-shirt']);
```

```ruby
Stripe.api_key = '<<secret key>>'

product = Stripe::Product.create({name: 'T-shirt'})
```

Next, create a [Price](https://docs.stripe.com/api/prices.md) to define how much to charge for your product. This includes how much the product costs and what currency to use.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PriceCreateOptions
{
    Product = "<<product>>",
    UnitAmount = 2000,
    Currency = "usd",
};
var service = new PriceService();
Price price = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PriceParams{
  Product: stripe.String("<<product>>"),
  UnitAmount: stripe.Int64(2000),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
};
result, err := price.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PriceCreateParams params =
  PriceCreateParams.builder()
    .setProduct("<<product>>")
    .setUnitAmount(2000L)
    .setCurrency("usd")
    .build();

Price price = Price.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const price = await stripe.prices.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

price = stripe.Price.create(
  product="<<product>>",
  unit_amount=2000,
  currency="usd",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$price = $stripe->prices->create([
  'product' => '<<product>>',
  'unit_amount' => 2000,
  'currency' => 'usd',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

price = Stripe::Price.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
})
```

Copy products created in a sandbox to live mode so that you don’t need to re-create them. In the Product detail view in the Dashboard, click **Copy to live mode** in the upper right corner. You can only do this once for each product created in a sandbox. Subsequent updates to the test product aren’t reflected for the live product.

Make sure you’re in a sandbox by clicking **Sandboxes** within the Dashboard account picker. Next, define the items you want to sell. To create a new product and price:

- Navigate to the [Products](https://dashboard.stripe.com/test/products) section in the Dashboard.
- Click **Add product**.
- Select **One time** when setting the price.

Checkout displays the product name, description, and images that you supply.

Each price you create has an ID. When you create a Checkout Session, reference the price ID and quantity. If you’re selling in multiple currencies, make your Price *multi-currency*. Checkout automatically [determines the customer’s local currency](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) and presents that currency if the Price supports it.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    UiMode = "embedded",
    ReturnUrl = "https://example.com/return",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeEmbedded)),
  ReturnURL: stripe.String("https://example.com/return"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
    .setReturnUrl("https://example.com/return")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  ui_mode="embedded",
  return_url="https://example.com/return",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'ui_mode' => 'embedded',
  'return_url' => 'https://example.com/return',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
})
```

## Prefill customer data

If you’ve already collected your customer’s email and want to prefill it in the Checkout Session for them, pass [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) when creating a Checkout Session.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    CustomerEmail = "customer@example.com",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "<<price>>", Quantity = 1 },
    },
    Mode = "payment",
    UiMode = "embedded",
    ReturnUrl = "https://example.com/return",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  CustomerEmail: stripe.String("customer@example.com"),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("<<price>>"),
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeEmbedded)),
  ReturnURL: stripe.String("https://example.com/return"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setCustomerEmail("customer@example.com")
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("<<price>>").setQuantity(1L).build()
    )
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
    .setReturnUrl("https://example.com/return")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  customer_email="customer@example.com",
  line_items=[{"price": "<<price>>", "quantity": 1}],
  mode="payment",
  ui_mode="embedded",
  return_url="https://example.com/return",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'customer_email' => 'customer@example.com',
  'line_items' => [
    [
      'price' => '<<price>>',
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'ui_mode' => 'embedded',
  'return_url' => 'https://example.com/return',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
})
```

## Save payment method details

By default, payment methods used to make a one-time payment with Checkout aren’t available for future use.

### Save payment methods to charge them off-session

You can set Checkout to save payment methods used to make a one-time payment by passing the [payment_intent_data.setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) argument. This is useful if you need to capture a payment method on-file to use for future fees, such as cancellation or no-show fees.

If you use Checkout in `subscription` mode, Stripe automatically saves the payment method to charge it for subsequent payments. Card payment methods saved to customers using either `setup_future_usage` or `subscription` mode don’t appear for return purchases in Checkout (more on this below). We recommend using [custom text](https://docs.stripe.com/payments/checkout/customization/policies.md) to link out to any relevant terms regarding the usage of saved payment information.

Global privacy laws are complicated and nuanced. We recommend contacting your legal and privacy team prior to implementing [setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) because it might implicate your existing privacy compliance framework. Refer to [the guidance issued by the European Protection Board](https://edpb.europa.eu/system/files/2021-05/recommendations022021_on_storage_of_credit_card_data_en_1.pdf) to learn more about saving payment details.

### Save payment methods to prefill them in Checkout

By default, Checkout uses [Link](https://docs.stripe.com/payments/checkout/customization/behavior.md#link) to provide your customers with the option to securely save and reuse their payment information. If you prefer to manage payment methods yourself, use [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) when creating a Checkout Session to let your customers save their payment methods for future purchases in Checkout.

Passing this parameter in either [payment](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) or [subscription](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) mode displays an optional checkbox to let customers explicitly save their payment method for future purchases. When customers check this checkbox, Checkout saves the payment method with [allow_redisplay: always](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay). Checkout uses this parameter to determine whether a payment method can be prefilled on future purchases. When using `saved_payment_method_options.payment_method_save`, you don’t need to pass in `setup_future_usage` to save the payment method.

Using [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) requires a `Customer`. To save a new customer, set the Checkout Session’s [customer_creation](https://docs.stripe.com/api/checkout/sessions/create.md) to `always`. Otherwise, the session doesn’t save the customer or the payment method.

If `payment_method_save` isn’t passed in or if the customer doesn’t agree to save the payment method, Checkout still saves payment methods created in `subscription` mode or using `setup_future_usage`. These payment methods have an `allow_redisplay` value of `limited`, which prevents them from being prefilled for returning purchases and allows you to comply with card network rules and data protection regulations. Learn how to [change the default behavior enabled by these modes](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout) and how to change or override `allow_redisplay` behavior.

You can use Checkout to save cards and other payment methods to charge them off-session, but Checkout only prefills saved cards. Learn how to [prefill saved cards](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout). To save a payment method without an initial payment, [use Checkout in setup mode](https://docs.stripe.com/payments/save-and-reuse.md?platform=checkout).

## Customer account management

Let your customers [manage](https://docs.stripe.com/customer-management.md) their own accounts by sharing a link to your *customer portal*. The customer portal lets customers log in with their email to manage subscriptions, update payment methods, and so on.

## Separate authorization and capture

Stripe supports two-step card payments so you can first authorize a card, then capture funds later. When Stripe authorizes a payment, the card issuer guarantees the funds and places a hold for the payment amount on the customer’s card. You then have a certain amount of time to capture the funds, [depending on the card](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations)). If you don’t capture the payment before the authorization expires, the payment is cancelled and the issuer releases the held funds.

Separating authorization and capture is useful if you need to take additional actions between confirming that a customer is able to pay and collecting their payment. For example, if you’re selling stock-limited items, you may need to confirm that an item purchased by your customer using Checkout is still available before capturing their payment and fulfilling the purchase. Accomplish this using the following workflow:

1. Confirm that Stripe authorized the customer’s payment method.
1. Consult your inventory management system to confirm that the item is still available.
1. Update your inventory management system to indicate that a customer has purchased the item.
1. Capture the customer’s payment.
1. Inform your customer whether their purchase was successful on your confirmation page.

To indicate that you want to separate authorization and capture, you must set the value of [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) to `manual` when creating the Checkout Session. This instructs Stripe to only authorize the amount on the customer’s card.

To capture an uncaptured payment, you can use either the [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) or the [capture](https://docs.stripe.com/api/payment_intents/capture.md) endpoint. Programmatically capturing payments requires access to the PaymentIntent created during the Checkout Session, which you can get from the [Session](https://docs.stripe.com/api/payment_intents/capture.md) object.

## Order fulfillment

Learn how to [programmatically get a notification](https://docs.stripe.com/checkout/fulfillment.md) whenever a customer pays.

## See Also

- [Add discounts](https://docs.stripe.com/payments/checkout/discounts.md)
- [Collect taxes](https://docs.stripe.com/payments/checkout/taxes.md)
- [Collect tax IDs](https://docs.stripe.com/tax/checkout/tax-ids.md)
- [Add shipping](https://docs.stripe.com/payments/collect-addresses.md?payment-ui=checkout)
- [Customize your branding](https://docs.stripe.com/payments/checkout/customization.md)

# Embedded components

> This is a Embedded components for when platform is web and ui is embedded-components. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=embedded-components.

Build a checkout page on your website using [Stripe Elements](https://docs.stripe.com/payments/elements.md) and [Checkout Sessions](https://docs.stripe.com/api/checkout/sessions.md), an integration that manages tax, discounts, shipping rates, and more.

## Create a Checkout Session

Add an endpoint on your server that creates a [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md) and returns its [client secret](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-client_secret) to your front end. A Checkout Session represents your customer’s session as they pay for one-time purchases or subscriptions. Checkout Sessions expire 24 hours after creation.

```javascript
import express, {Express} from 'express';

const app: Express = express();

app.post('/create-checkout-session', async (req: Express.Request, res: Express.Response) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'custom',
    // The URL of your payment completion page
    return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}'
  });

  res.json({checkoutSessionClientSecret: session.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```javascript
const express = require('express');
const app = express();

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'custom',
    // The URL of your payment completion page
    return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}'
  });

  res.json({checkoutSessionClientSecret: session.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```ruby
require 'sinatra'
require 'stripe'

set :static, true
set :port, 4242

post '/create-checkout-session' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  session = Stripe::Checkout::Session.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {name: 'T-shirt'},
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'custom',
    return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
  })

  {
    checkoutSessionClientSecret: session.client_secret,
  }.to_json
end
```

```php
$stripe->checkout->sessions->create([
  'line_items' => [
    [
      'price_data' => [
        'currency' => 'usd',
        'product_data' => ['name' => 'T-shirt'],
        'unit_amount' => 2000,
      ],
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'ui_mode' => 'custom',
  'return_url' => 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
]);
```

```python
import json
import os
from flask import Flask, render_template, jsonify, request
app = Flask(__name__, static_folder='public',
            static_url_path='', template_folder='public')

@app.route('/create-checkout-session', methods=['POST'])
def checkout():
    try:
        session = stripe.checkout.Session.create(
          line_items=[
            {
              "price_data": {
                "currency": "usd",
                "product_data": {"name": "T-shirt"},
                "unit_amount": 2000,
              },
              "quantity": 1,
            },
          ],
          mode="payment",
          ui_mode="custom",
          # The URL of your payment completion page
          return_url="https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
        )
        return jsonify({
            'checkoutSessionClientSecret': session['client_secret']
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    app.run(port=4242)
```

```go
params := &stripe.CheckoutSessionParams{
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
        Currency: stripe.String(string(stripe.CurrencyUSD)),
        ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
          Name: stripe.String("T-shirt"),
        },
        UnitAmount: stripe.Int64(2000),
      },
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
  ReturnURL: stripe.String("https://example.com/return?session_id={CHECKOUT_SESSION_ID}"),
};
result, err := session.New(params);
```

```dotnet
// This example sets up an endpoint using the ASP.NET MVC framework.
// To learn more about ASP.NET MVC, watch this video: https://youtu.be/2-mMOB8MhmE.

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
  public class PaymentsController : Controller
  {
    public PaymentsController()
    {
      StripeConfiguration.ApiKey = "<<secret key>>";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession()
    {
      var options = new SessionCreateOptions
      {
        LineItems = new List<SessionLineItemOptions>
        {
          new SessionLineItemOptions
          {
            PriceData = new SessionLineItemPriceDataOptions
            {
              UnitAmount = 2000,
              Currency = "usd",
              ProductData = new SessionLineItemPriceDataProductDataOptions
              {
                Name = "T-shirt",
              },
            },
            Quantity = 1,
          },
        },
        Mode = "payment",
        UiMode = "custom",
        ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
      };

      var service = new SessionService();
      Session session = service.Create(options);

      return Json(new {checkoutSessionClientSecret = session.ClientSecret});
    }
  }
}
```

```java
import java.util.HashMap;
import java.util.Map;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;
import com.google.gson.Gson;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);
    Stripe.apiKey = "<<secret key>>";

    Gson gson = new Gson();

    post("/create-checkout-session", (request, response) -> {

      SessionCreateParams params =
        SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setUiMode(SessionCreateParams.UiMode.CUSTOM)
          .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
          .addLineItem(
          SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
              SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(2000L)
                .setProductData(
                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                    .setName("T-shirt")
                    .build())
                .build())
            .build())
          .build();

      Session session = Session.create(params);

      Map<String, String> map = new HashMap();
      map.put("checkoutSessionClientSecret", session.getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString());

      return map;
    }, gson::toJson);
  }
}
```

## Set up the front end

Include the Stripe.js script on your checkout page by adding it to the `head` of your HTML file. Always load Stripe.js directly from js.stripe.com to remain PCI compliant. Don’t include the script in a bundle or host a copy of it yourself.

You’ll need to update Stripe.js to `basil` from v3 by including the following script tag `<script src="https://js.stripe.com/basil/stripe.js"></script>`. Learn more about [Stripe.js versioning](https://docs.stripe.com/sdks/stripejs-versioning.md).

```html
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/basil/stripe.js"></script>
</head>
```

Stripe provides an npm package that you can use to load Stripe.js as a module. See the [project on GitHub](https://github.com/stripe/stripe-js). Version [7.0.0](https://www.npmjs.com/package/%40stripe/stripe-js/v/7.0.0) or later is required.

Initialize stripe.js.

```js
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = Stripe(
  '<<publishable key>>',
);
```

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry. You need at least version 3.6.0 for React Stripe.js and version 7.0.0 for the Stripe.js loader.

```bash
npm install --save @stripe/react-stripe-js@^3.6.0 @stripe/stripe-js@^7.0.0
```

Initialize a `stripe` instance on your front end with your publishable key.

```javascript
import {loadStripe} from '@stripe/stripe-js';
const stripe = loadStripe("<<publishable key>>");
```

## Initialize Checkout

Create a `fetchClientSecret` function. This function retrieves the client secret from your server and returns a promise that resolves with the client secret. Call [initCheckout](https://docs.stripe.com/js/custom_checkout/init), passing in `fetchClientSecret`. `initCheckout` returns a promise resolving to a [checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) instance.

The [checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) object acts as the foundation of your checkout page, containing data from the Checkout Session and methods to update the Session.

The object returned by [checkout.session()](https://docs.stripe.com/js/custom_checkout/session) contains your pricing information. We recommend reading and displaying the `total`, and `lineItems` from the session in your UI.

This lets you turn on new features with minimal code changes. For example, adding [manual currency prices](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) requires no UI changes if you display the `total`.

```javascript
const fetchClientSecret = () => {
  return fetch('/create-checkout-session', {method: 'POST'})
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret);
};
stripe.initCheckout({fetchClientSecret})
  .then((checkout) => {
    const checkoutContainer = document.getElementById('checkout-container');
    checkoutContainer.append(JSON.stringify(checkout.lineItems, null, 2));
    checkoutContainer.append(document.createElement('br'));
    checkoutContainer.append(`Total: ${checkout.session().total.total.amount}`);
  });
```

```html
<div id="checkout-container"></div>
```

Create a `fetchClientSecret` function to retrieve the client secret from your server and return a Promise that resolves with the client secret.

Wrap your application with the [CheckoutProvider](https://docs.stripe.com/js/custom_checkout/react/checkout_provider) component, passing in the `fetchClientSecret` function and the `stripe` instance.

Use the [useCheckout](https://docs.stripe.com/js/custom_checkout/react/use_checkout) hook in your components to get the [Checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) object, which contains data from the Checkout Session and methods to update the Session.

Use the `Checkout` object as the container for your prices. We recommend reading and displaying the `total` and `lineItems` from the `Checkout` object in your UI.

This lets you enable features with minimal code changes. For example, adding [manual currency prices](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) requires no UI changes if you display the `total`.

```jsx
import React from 'react';
import {CheckoutProvider} from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const fetchClientSecret = () => {
  return fetch('/create-checkout-session', {method: 'POST'})
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret)
};

const App = () => {
  return (
    <CheckoutProvider
      stripe={stripe}
      options={{fetchClientSecret}}
    >
      <CheckoutForm />
    </CheckoutProvider>
  );
};

export default App;
```

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  return (
    <pre>
      {JSON.stringify(checkout.lineItems, null, 2)}
      // A formatted total amount
      Total: {checkout.total.total.amount}
    </pre>
  )
};
```

## Collect customer email

If you already pass in an existing [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) or [Customer](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer) with a valid email set when creating the Checkout Session, you can skip this step.

If you implement your own email validation, you can pass in the validated email on [checkout.confirm](https://docs.stripe.com/js/custom_checkout/confirm) and skip this step.

Create an email input to collect your customer’s email address. Call [updateEmail](https://docs.stripe.com/js/custom_checkout/update_email) when your customer finishes the input to validate and save the email address.

Depending on the design of your checkout form, you can call `updateEmail` in the following ways:

* Directly before [submitting the payment](#submit-payment). You can also call `updateEmail` to validate earlier, such as on input blur.
* Before transitioning to the next step, such as clicking a **Save** button, if your form includes multiple steps.

```html
<input type="text" id="email" />
<div id="email-errors"></div>
```

```javascript
stripe.initCheckout({fetchClientSecret}).then((checkout) => {
  const emailInput = document.getElementById('email');
  const emailErrors = document.getElementById('email-errors');

  emailInput.addEventListener('input', () => {
    // Clear any validation errors
    emailErrors.textContent = '';
  });

  emailInput.addEventListener('blur', () => {
    const newEmail = emailInput.value;
    checkout.updateEmail(newEmail).then((result) => {
      if (result.error) {
        emailErrors.textContent = result.error.message;
      }
    });
  });
});
```

If you already pass in an existing [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) or [Customer](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer) with a valid email set when creating the Checkout Session, you can skip this step.

If you implement your own email validation, you can pass in the validated email on [confirm](https://docs.stripe.com/js/custom_checkout/react/confirm) and skip this step.

Create a component to collect your customer’s email address. Call [updateEmail](https://docs.stripe.com/js/custom_checkout/react/update_email) when your customer finishes the input to validate and save the email address.

Depending on the design of your checkout form, you can call `updateEmail` in the following ways:

* Directly before [submitting the payment](#submit-payment). You can also call `updateEmail` to validate earlier, such as on input blur.
* Before transitioning to the next step, such as clicking a **Save** button, if your form includes multiple steps.

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const EmailInput = () => {
  const checkout = useCheckout();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleBlur = () => {
    checkout.updateEmail(email).then((result) => {
      if (result.error) {
        setError(result.error);
      }
    })
  };

  const handleChange = (e) => {
    setError(null);
    setEmail(e.target.value);
  };
  return (
    <div>
      <input
        type="text"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <div>{error.message}</div>}
    </div>
  );
};

export default EmailInput;
```

## Collect payment details

Collect payment details on the client with the [Payment Element](https://docs.stripe.com/payments/payment-element.md). The Payment Element is a prebuilt UI component that simplifies collecting payment details for a variety of payment methods.

First, create a container DOM element to mount the [Payment Element](https://docs.stripe.com/payments/payment-element.md). Then create an instance of the `Payment Element` using [checkout.createPaymentElement](https://docs.stripe.com/js/custom_checkout/create_payment_element) and mount it by calling [element.mount](https://docs.stripe.com/js/element/mount), providing either a CSS selector or the container DOM element.

```html
<div id="payment-element"></div>
```

```javascript
const paymentElement = checkout.createPaymentElement();
paymentElement.mount('#payment-element');
```

See the [Stripe.js docs](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options) to view what options are supported.

You can [customize the appearance](https://docs.stripe.com/payments/checkout/customization/appearance.md) of all Elements by passing [elementsOptions.appearance](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-elementsOptions-appearance) when initializing Checkout on the front end.

Mount the [Payment Element](https://docs.stripe.com/payments/payment-element.md) component within the [CheckoutProvider](https://docs.stripe.com/js/custom_checkout/react/checkout_provider).

```jsx
import React from 'react';
import {PaymentElement, useCheckout} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  return (
    <form>
      <PaymentElement options={{layout: 'accordion'}}/>
    </form>
  )
};

export default CheckoutForm;
```

See the [Stripe.js docs](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options) to view what options are supported.

You can [customize the appearance](https://docs.stripe.com/payments/checkout/customization/appearance.md) of all Elements by passing [elementsOptions.appearance](https://docs.stripe.com/js/custom_checkout/react/checkout_provider#custom_checkout_react_checkout_provider-options-elementsOptions-appearance) to the [CheckoutProvider](https://docs.stripe.com/js/custom_checkout/react/checkout_provider).

## Submit the payment

Render a **Pay** button that calls [confirm](https://docs.stripe.com/js/custom_checkout/confirm) from the [checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) instance to submit the payment.

```html
<button id="pay-button">Pay</button>
<div id="confirm-errors"></div>
```

```js
stripe.initCheckout({fetchClientSecret}).then((checkout) => {
  const button = document.getElementById('pay-button');
  const errors = document.getElementById('confirm-errors');
  button.addEventListener('click', () => {
    // Clear any validation errors
    errors.textContent = '';

    checkout.confirm().then((result) => {
      if (result.type === 'error') {
        errors.textContent = result.error.message;
      }
    });
  });
});
```

Render a **Pay** button that calls [confirm](https://docs.stripe.com/js/custom_checkout/confirm) from [useCheckout](https://docs.stripe.com/js/custom_checkout/react/use_checkout) to submit the payment.

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const PayButton = () => {
  const {confirm} = useCheckout();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleClick = () => {
    setLoading(true);
    confirm().then((result) => {
      if (result.type === 'error') {
        setError(result.error)
      }
      setLoading(false);
    })
  };

  return (
    <div>
      <button disabled={loading} onClick={handleClick}>
        Pay
      </button>
      {error && <div>{error.message}</div>}
    </div>
  )
};

export default PayButton;
```

## Test your integration

1. Navigate to your checkout page.
1. Fill out the payment details with a payment method from the following table. For card payments:
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Submit the payment to Stripe.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like billing information and the list of purchased items. You can use this information to [fulfill the order](https://docs.stripe.com/checkout/fulfillment.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Create products and prices

You can [set up your Checkout Session](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) to accept tips and donations, or sell pay-what-you-want products and services.

Before you create a Checkout Session, you can create *Products* and *Prices* upfront. Use products to represent different physical goods or levels of service, and *Prices* to represent each product’s pricing.

For example, you can create a T-shirt as a product with a price of 20 USD. This allows you to update and add prices without needing to change the details of your underlying products. You can either create products and prices with the Stripe Dashboard or API. Learn more about [how products and prices work](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

The API only requires a `name` to create a [Product](https://docs.stripe.com/api/products.md). Checkout displays the product `name`, `description`, and `images` that you supply.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new ProductCreateOptions { Name = "T-shirt" };
var service = new ProductService();
Product product = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.ProductParams{Name: stripe.String("T-shirt")};
result, err := product.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

ProductCreateParams params = ProductCreateParams.builder().setName("T-shirt").build();

Product product = Product.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

product = stripe.Product.create(name="T-shirt")
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$product = $stripe->products->create(['name' => 'T-shirt']);
```

```ruby
Stripe.api_key = '<<secret key>>'

product = Stripe::Product.create({name: 'T-shirt'})
```

Next, create a [Price](https://docs.stripe.com/api/prices.md) to define how much to charge for your product. This includes how much the product costs and what currency to use.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PriceCreateOptions
{
    Product = "<<product>>",
    UnitAmount = 2000,
    Currency = "usd",
};
var service = new PriceService();
Price price = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PriceParams{
  Product: stripe.String("<<product>>"),
  UnitAmount: stripe.Int64(2000),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
};
result, err := price.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PriceCreateParams params =
  PriceCreateParams.builder()
    .setProduct("<<product>>")
    .setUnitAmount(2000L)
    .setCurrency("usd")
    .build();

Price price = Price.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const price = await stripe.prices.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

price = stripe.Price.create(
  product="<<product>>",
  unit_amount=2000,
  currency="usd",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$price = $stripe->prices->create([
  'product' => '<<product>>',
  'unit_amount' => 2000,
  'currency' => 'usd',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

price = Stripe::Price.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
})
```

Copy products created in a sandbox to live mode so that you don’t need to re-create them. In the Product detail view in the Dashboard, click **Copy to live mode** in the upper right corner. You can only do this once for each product created in a sandbox. Subsequent updates to the test product aren’t reflected for the live product.

Make sure you’re in a sandbox by clicking **Sandboxes** within the Dashboard account picker. Next, define the items you want to sell. To create a new product and price:

- Navigate to the [Products](https://dashboard.stripe.com/test/products) section in the Dashboard.
- Click **Add product**.
- Select **One time** when setting the price.

Checkout displays the product name, description, and images that you supply.

Each price you create has an ID. When you create a Checkout Session, reference the price ID and quantity. If you’re selling in multiple currencies, make your Price *multi-currency*. Checkout automatically [determines the customer’s local currency](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) and presents that currency if the Price supports it.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    UiMode = "custom",
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  ReturnURL: stripe.String("https://example.com/return?session_id={CHECKOUT_SESSION_ID}"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setUiMode(SessionCreateParams.UiMode.CUSTOM)
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  ui_mode="custom",
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  return_url="https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'ui_mode' => 'custom',
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'return_url' => 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
})
```

## Prefill customer data

If you’ve already collected your customer’s email and want to prefill it in the Checkout Session for them, pass [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) when creating a Checkout Session.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    CustomerEmail = "customer@example.com",
    UiMode = "custom",
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  CustomerEmail: stripe.String("customer@example.com"),
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  ReturnURL: stripe.String("https://example.com/return?session_id={CHECKOUT_SESSION_ID}"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setCustomerEmail("customer@example.com")
    .setUiMode(SessionCreateParams.UiMode.CUSTOM)
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  customer_email="customer@example.com",
  ui_mode="custom",
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  return_url="https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'customer_email' => 'customer@example.com',
  'ui_mode' => 'custom',
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'return_url' => 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  customer_email: 'customer@example.com',
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
})
```

## Save payment method details

Learn how to [accept a payment and save your customer’s payment details](https://docs.stripe.com/payments/checkout/save-during-payment.md?payment-ui=embedded-components) for future purchases.

## Listen for Checkout Session changes

### Listen for Checkout Session changes 

You can listen for changes to the [Checkout Session](https://docs.stripe.com/api/checkout/sessions.md) by adding an event listener on the `change` event with [checkout.on](https://docs.stripe.com/js/custom_checkout/change_event).

```javascript
checkout = await stripe.initCheckout({
  fetchClientSecret: () => promise,
  elementsOptions: { appearance },
});

checkout.on('change', (session) => {
  // Handle changes to the checkout session
});
```

```jsx
import React from 'react';
import { useCheckout } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  checkout.on('change', (session) => {
    // Handle changes to the checkout session
  });
};
```

## Collect billing and shipping addresses

## Collect a billing address 

By default, a Checkout Session collects the minimal billing details required for payment through the Payment Element.

### Using the Billing Address Element 

You can collect complete billing addresses using the Billing Address Element.

First, pass [billing_address_collection=required](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-billing_address_collection) when you create the Checkout Session.

Create a container DOM element to mount the Billing Address Element. Then create an instance of the Billing Address Element using [checkout.createBillingAddressElement](https://docs.stripe.com/js/custom_checkout/create_billing_address_element) and mount it by calling [element.mount](https://docs.stripe.com/js/element/mount), providing either a CSS selector or the container DOM element.

```html
<div id="billing-address"></div>
```

```javascript
const billingAddressElement = checkout.createBillingAddressElement();
billingAddressElement.mount('#billing-address');
```

The Billing Address Element supports the following options:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-display)

Mount the `AddressElement` component within the `CheckoutProvider`.

```jsx
import React from 'react';
import {AddressElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  return (
    <form>
      <AddressElement options={{mode: 'billing'}}/>
    </form>
  )
};
```

The Billing Address Element supports the following props:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-display)

### Using a custom form 

You can build your own form to collect billing addresses.

* If your checkout page has a distinct address collection step before confirmation, call [updateBillingAddress](https://docs.stripe.com/js/custom_checkout/react/update_billing_address) when your customer submits the address.
* Otherwise, you can submit the address when your customer clicks the “pay” button by passing [billingAddress](https://docs.stripe.com/js/custom_checkout/confirm#custom_checkout_session_confirm-options-billingAddress) to [confirm](https://docs.stripe.com/js/custom_checkout/confirm).

### Collect partial billing addresses

To collect partial billing addresses, such as only the country and postal code, pass [billing_address_collection=auto](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-billing_address_collection).

When collecting partial billing addresses, you must [collect addresses manually](#collect-billing-addresses-manually). By default, the Payment Element automatically collects the minimal billing details required for payment. To avoid double collection of billing details, pass [fields.billingDetails=never](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options-fields-billingDetails) when creating the Payment Element. If you only intend to collect a subset of billing details (such as the customer’s name), pass `never` for only the fields you intend to collect yourself.

## Collect a shipping address 

To collect a customer’s shipping address, pass the [shipping_address_collection](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-shipping_address_collection) parameter when you create the Checkout Session.

When you collect a shipping address, you must also specify which countries to allow shipping to. Configure the [allowed_countries](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-shipping_address_collection-allowed_countries) property with an array of [two-letter ISO country codes](https://www.nationsonline.org/oneworld/country_code_list.htm).

### How to use the Shipping Address Element 

You can collect complete shipping addresses with the Shipping Address Element.

Create a container DOM element to mount the Shipping Address Element. Then create an instance of the Shipping Address Element using [checkout.createShippingAddressElement](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element) and mount it by calling [element.mount](https://docs.stripe.com/js/element/mount), providing either a CSS selector or the container DOM element.

```html
<div id="shipping-address"></div>
```

```javascript
const shippingAddressElement = checkout.createShippingAddressElement();
shippingAddressElement.mount('#shipping-address');
```

The Shipping Address Element supports the following options:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-display)

Mount the `AddressElement` component within the `CheckoutProvider`.

```jsx
import React from 'react';
import {AddressElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  return (
    <form>
      <AddressElement options={{mode: 'shipping'}}/>
    </form>
  )
};
```

The Shipping Address Element supports the following props:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-display)

### Listen for Checkout Session changes 

You can listen for changes to the [Checkout Session](https://docs.stripe.com/api/checkout/sessions.md) by adding an event listener to handle address-related changes.

Use the [Session object](https://docs.stripe.com/js/custom_checkout/session_object) to render the shipping amount in your checkout form.

```html
<div>
  <h3> Totals </h3>
  <div id="subtotal" ></div>
  <div id="shipping" ></div>
  <div id="total" ></div>
</div>
```

```javascript
stripe.initCheckout({clientSecret}).then((checkout) => {
  const subtotal = document.getElementById('subtotal');
  const shipping = document.getElementById('shipping');
  const total = document.getElementById('total');

  checkout.on('change', (session) => {
    subtotal.textContent = `Subtotal: ${session.total.subtotal.amount}`;
    shipping.textContent = `Shipping: ${session.total.shippingRate.amount}`;
    total.textContent = `Total: ${session.total.total.amount}`;
  })
})
```

Use [useCheckout](https://docs.stripe.com/js/custom_checkout/react/use_checkout) to render the shipping cost in your checkout form.

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  const [subtotal, setSubtotal] = React.useState(checkout.total.subtotal.amount);
  const [shipping, setShipping] = React.useState(checkout.total.shippingRate.amount);
  const [total, setTotal] = React.useState(checkout.total.total.amount);

  checkout.on('change', (session) => {
    setSubtotal(session.total.subtotal.amount);
    setShipping(session.total.shippingRate.amount);
    setTotal(session.total.total.amount);
  });

  return (
    <div>
      <div>
        <form>
          <AddressElement options={{mode: 'shipping'}}/>
        </form>
      </div>
      <div>
        <h2>Checkout Summary</h2>
        <pre>
          {JSON.stringify(checkout.lineItems, null, 2)}
        </pre>
        <h3>Totals</h3>
        <pre>
          Subtotal: {subtotal}
          Shipping: {shipping}
          Total: {total}
        </pre>
      </div>
    </div>
  )
};
```

### Use a custom form 

You can build your own form to collect shipping addresses.

* If your checkout page has a distinct address collection step before confirmation, call [updateShippingAddress](https://docs.stripe.com/js/custom_checkout/react/update_shipping_address) when your customer submits the address.
* Otherwise, you can submit the address when your customer clicks the “pay” button by passing [shippingAddress](https://docs.stripe.com/js/custom_checkout/confirm#custom_checkout_session_confirm-options-shippingAddress) to [confirm](https://docs.stripe.com/js/custom_checkout/confirm).

## Separate authorization and capture

Stripe supports two-step card payments so you can first authorize a card, then capture funds later. When Stripe authorizes a payment, the card issuer guarantees the funds and places a hold for the payment amount on the customer’s card. You then have a certain amount of time to capture the funds, [depending on the card](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations)). If you don’t capture the payment before the authorization expires, the payment is cancelled and the issuer releases the held funds.

Separating authorization and capture is useful if you need to take additional actions between confirming that a customer is able to pay and collecting their payment. For example, if you’re selling stock-limited items, you may need to confirm that an item purchased by your customer using Checkout is still available before capturing their payment and fulfilling the purchase. Accomplish this using the following workflow:

1. Confirm that Stripe authorized the customer’s payment method.
1. Consult your inventory management system to confirm that the item is still available.
1. Update your inventory management system to indicate that a customer has purchased the item.
1. Capture the customer’s payment.
1. Inform your customer whether their purchase was successful on your confirmation page.

To indicate that you want to separate authorization and capture, you must set the value of [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) to `manual` when creating the Checkout Session. This instructs Stripe to only authorize the amount on the customer’s card.

To capture an uncaptured payment, you can use either the [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) or the [capture](https://docs.stripe.com/api/payment_intents/capture.md) endpoint. Programmatically capturing payments requires access to the PaymentIntent created during the Checkout Session, which you can get from the [Session](https://docs.stripe.com/api/payment_intents/capture.md) object.

## Customer account management

Let your customers [manage](https://docs.stripe.com/customer-management.md) their own accounts by sharing a link to your *customer portal*. The customer portal lets customers log in with their email to manage subscriptions, update payment methods, and so on.

## Order fulfillment

Learn how to [programmatically get a notification](https://docs.stripe.com/checkout/fulfillment.md?payment-ui=embedded-components) when a customer pays.

## See Also

- [Add discounts for one-time payments](https://docs.stripe.com/payments/checkout/discounts.md?payment-ui=embedded-components)
- [Collect taxes](https://docs.stripe.com/payments/checkout/taxes.md?payment-ui=embedded-components)
- [Enable adjustable line item quantities](https://docs.stripe.com/payments/checkout/adjustable-quantity.md?payment-ui=embedded-components)
- [Add one-click buttons](https://docs.stripe.com/checkout/one-click-payment-buttons.md?payment-ui=embedded-components)

# Advanced integration

> This is a Advanced integration for when platform is web and ui is elements. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=elements.

Build a custom payments integration by embedding UI components on your site, using [Stripe Elements](https://docs.stripe.com/payments/elements.md).
See how this integration [compares to Stripe’s other integration types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

The client-side and server-side code builds a checkout form that accepts various payment methods.

Combine UI components into a custom payment flow

CSS-level customization with the Appearance API

Stripe has a Payment Element integration that manages tax, discounts, shipping, and currency conversion for you. See [build a checkout page](https://docs.stripe.com/checkout/custom/quickstart.md) to learn more.

## Create a PaymentIntent

If you want to render the Payment Element without first creating a PaymentIntent, see [Collect payment details before creating an Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?type=payment).

The [PaymentIntent](https://docs.stripe.com/api/payment_intents.md) object represents your intent to collect payment from a customer and tracks charge attempts and state changes throughout the payment process.

### Create the PaymentIntent

Always decide how much to charge on the server side, a trusted environment, as opposed to the client. This prevents malicious customers from being able to choose their own prices.

### Retrieve the client secret

The {{intentKind}} includes a *client secret* that the client side uses to securely complete the payment process. You can use different approaches to pass the client secret to the client side.

Retrieve the client secret from an endpoint on your server, using the browser’s `fetch` function. This approach is best if your client side is a single-page application, particularly one built with a modern frontend framework like React. Create the server endpoint that serves the client secret:

```ruby
get '/secret' do
  intent = # ... Create or retrieve the {{intentKind}}
  {client_secret: intent.client_secret}.to_json
end
```

```python
from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/secret')
def secret():
  intent = # ... Create or retrieve the {{intentKind}}
  return jsonify(client_secret=intent.client_secret)
```

```php
<?php
    $intent = # ... Create or retrieve the {{intentKind}}
    echo json_encode(array('client_secret' => $intent->client_secret));
?>
```

```java
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.{{intentKind}};

import com.google.gson.Gson;

import static spark.Spark.get;

public class StripeJavaQuickStart {
  public static void main(String[] args) {
    Gson gson = new Gson();

    get("/secret", (request, response) -> {
      {{intentKind}} intent = // ... Fetch or create the {{intentKind}}

      Map<String, String> map = new HashMap();
      map.put("client_secret", intent.getClientSecret());

      return map;
    }, gson::toJson);
  }
}
```

```javascript
const express = require('express');
const app = express();

app.get('/secret', async (req, res) => {
  const intent = // ... Fetch or create the {{intentKind}}
  res.json({client_secret: intent.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```go
package main

import (
  "encoding/json"
  "net/http"

  stripe "github.com/stripe/stripe-go/v{{golang.major_version}}"
)

type CheckoutData struct {
  ClientSecret string `json:"client_secret"`
}

func main() {
  http.HandleFunc("/secret", func(w http.ResponseWriter, r *http.Request) {
    intent := // ... Fetch or create the {{intentKind}}
    data := CheckoutData{
      ClientSecret: intent.ClientSecret,
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(data)
  })

  http.ListenAndServe(":3000", nil)
}
```

```csharp
using System;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace StripeExampleApi.Controllers
{
  [Route("secret")]
  [ApiController]
  public class CheckoutApiController : Controller
  {
    [HttpGet]
    public ActionResult Get()
    {
      var intent = // ... Fetch or create the {{intentKind}}
      return Json(new {client_secret = intent.ClientSecret});
    }
  }
}
```

And then fetch the client secret with JavaScript on the client side:

```javascript
(async () => {
  const response = await fetch('/secret');
  const {client_secret: clientSecret} = await response.json();
  // Render the form using the clientSecret
})();
```

Pass the client secret to the client from your server. This approach works best if your application generates static content on the server before sending it to the browser.

```erb
<form id="payment-form" data-secret="<%= @intent.client_secret %>">
  <button id="submit">Submit</button>
</form>
```

```ruby
get '/checkout' do
  @intent = # ... Fetch or create the {{intentKind}}
  erb :checkout
end
```

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <button id="submit">Submit</button>
</form>
```

```python
@app.route('/checkout')
def checkout():
  intent = # ... Fetch or create the {{intentKind}}
  return render_template('checkout.html', client_secret=intent.client_secret)
```

```php
<?php
  $intent = # ... Fetch or create the {{intentKind}};
?>
...
<form id="payment-form" data-secret="<?= $intent->client_secret ?>">
  <button id="submit">Submit</button>
</form>
...
```

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <button id="submit">Submit</button>
</form>
```

```java
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.{{intentKind}};

import spark.ModelAndView;

import static spark.Spark.get;

public class StripeJavaQuickStart {
  public static void main(String[] args) {
    get("/checkout", (request, response) -> {
      {{intentKind}} intent = // ... Fetch or create the {{intentKind}}

      Map map = new HashMap();
      map.put("client_secret", intent.getClientSecret());

      return new ModelAndView(map, "checkout.hbs");
    }, new HandlebarsTemplateEngine());
  }
}
```

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <div id="payment-element">
    <!-- Elements will create form elements here -->
  </div>

  <button id="submit">Submit</button>
</form>
```

```javascript
const express = require('express');
const expressHandlebars = require('express-handlebars');
const app = express();

app.engine('.hbs', expressHandlebars({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.get('/checkout', async (req, res) => {
  const intent = // ... Fetch or create the {{intentKind}}
  res.render('checkout', { client_secret: intent.client_secret });
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```html
<form id="payment-form" data-secret="{{ .ClientSecret }}">
  <button id="submit">Submit</button>
</form>
```

```go
package main

import (
  "html/template"
  "net/http"

  stripe "github.com/stripe/stripe-go/v{{golang.major_version}}"
)

type CheckoutData struct {
  ClientSecret string
}

func main() {
  checkoutTmpl := template.Must(template.ParseFiles("views/checkout.html"))

  http.HandleFunc("/checkout", func(w http.ResponseWriter, r *http.Request) {
    intent := // ... Fetch or create the {{intentKind}}
    data := CheckoutData{
      ClientSecret: intent.ClientSecret,
    }
    checkoutTmpl.Execute(w, data)
  })

  http.ListenAndServe(":3000", nil)
}
```

```html
<form id="payment-form" data-secret="@ViewData["ClientSecret"]">
  <button id="submit">Submit</button>
</form>
```

```csharp
using System;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace StripeExampleApi.Controllers
{
  [Route("/[controller]")]
  public class CheckoutApiController : Controller
  {
    public IActionResult Index()
    {
      var intent = // ... Fetch or create the {{intentKind}}
      ViewData["ClientSecret"] = intent.ClientSecret;
      return View();
    }
  }
}
```

## Collect payment details

Collect payment details on the client with the [Payment Element](https://docs.stripe.com/payments/payment-element.md). The Payment Element is a prebuilt UI component that simplifies collecting payment details for a variety of payment methods.

The Payment Element contains an iframe that securely sends payment information to Stripe over an HTTPS connection. Avoid placing the Payment Element within another iframe because some payment methods require redirecting to another page for payment confirmation.

The checkout page address must start with `https://` rather than `http://` for your integration to work. You can test your integration without using HTTPS, but remember to [enable it](https://docs.stripe.com/security/guide.md#tls) when you’re ready to accept live payments.

### Set up Stripe.js

The Payment Element is automatically available as a feature of Stripe.js. Include the Stripe.js script on your checkout page by adding it to the `head` of your HTML file. Always load Stripe.js directly from js.stripe.com to remain PCI compliant. Don’t include the script in a bundle or host a copy of it yourself.

```html
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/basil/stripe.js"></script>
</head>
```

Create an instance of Stripe with the following JavaScript on your checkout page:

```javascript
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
```

### Add the Payment Element to your payment page

The Payment Element needs a place to live on your payment page. Create an empty DOM node (container) with a unique ID in your payment form:

```html
<form id="payment-form">
  <div id="payment-element">
    <!-- Elements will create form elements here -->
  </div>
  <button id="submit">Submit</button>
  <div id="error-message">
    <!-- Display error message to your customers here -->
  </div>
</form>
```

When the previous form loads, create an instance of the Payment Element and mount it to the container DOM node. Pass the  from the previous step into `options` when you create the [Elements](https://docs.stripe.com/js/elements_object/create) instance:

```javascript
const options = {
  clientSecret: '{{CLIENT_SECRET}}',
  // Fully customizable with appearance API.
  appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in a previous step
const elements = stripe.elements(options);

// Create and mount the Payment Element
const paymentElementOptions = { layout: 'accordion'};
const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');

```

### Set up Stripe.js

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

### Add and configure the Elements provider to your payment page

To use the Payment Element component, wrap your checkout page component in an [Elements provider](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider). Call `loadStripe` with your publishable key, and pass the returned `Promise` to the `Elements` provider. Also pass the [client secret](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) from the previous step as `options` to the `Elements` provider.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.

function App() {
  const options = {
    // passing the client secret obtained in step 3
    clientSecret: '{{CLIENT_SECRET}}',
    // Fully customizable with appearance API.
    appearance: {/*...*/},
  };

  return (
    <Elements stripe={stripePromise} options={options}>
    </Elements>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

### Add the Payment Element component

Use the `PaymentElement` component to build your form:

## Save and retrieve customer payment methods

You can configure the Payment Element to save your customer’s payment methods for future use. This section shows you how to integrate the [saved payment methods feature](https://docs.stripe.com/payments/save-customer-payment-methods.md), which enables the Payment Element to:

- Prompt buyers for consent to save a payment method
- Save payment methods when buyers provide consent
- Display saved payment methods to buyers for future purchases
- [Automatically update lost or expired cards](https://docs.stripe.com/payments/cards/overview.md#automatic-card-updates) when buyers replace them

![The Payment Element and a saved payment method checkbox](images/elements/spm-save.png)
Save payment methods.


![The Payment Element with a Saved payment method selected](images/elements/spm-saved.png)
Reuse a previously saved payment method.


### Enable saving the payment method in the Payment Element

You can specify `setup_future_usage` on a PaymentIntent or Checkout Session to override the default behavior for saving payment methods. This ensures that you automatically save the payment method for future use, even if the customer doesn’t explicitly choose to save it.

Allowing buyers to remove their saved payment methods by enabling [payment_method_remove](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components-payment_element-features-payment_method_remove) impacts subscriptions that depend on that payment method. Removing the payment method detaches the [PaymentMethod](https://docs.stripe.com/api/payment_methods.md) from that [Customer](https://docs.stripe.com/api/customers.md).

```javascript
// Create the CustomerSession and obtain its clientSecret
  method: "POST"
});

const {
  customer_session_client_secret: customerSessionclientSecret
} = await res.json();

const elementsOptions = {
  customerSessionClientSecret,
  // Fully customizable with appearance API.
  appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret
// and CustomerSession's client secret obtained in a previous step
const elements = stripe.elements(elementsOptions);

// Create and mount the Payment Element
const paymentElementOptions = { layout: 'accordion'};
const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');
```

### Detect the selection of a saved payment method

To control dynamic content when a saved payment method is selected, listen to the Payment Element `change` event, which is populated with the selected payment method.

```javascript
paymentElement.on('change', function(event) {
  if (event.value.payment_method) {
    // Control dynamic content if a saved payment method is selected
  }
})
```

## Link in your checkout page

Let your customer check out faster by using [Link](https://docs.stripe.com/payments/link.md) in the [Payment Element](https://docs.stripe.com/payments/payment-element.md). You can autofill information for any logged-in customer already using Link, regardless of whether they initially saved their information in Link with another business. The default Payment Element integration includes a Link prompt in the card form. To manage Link in the Payment Element, go to your [payment method settings](https://dashboard.stripe.com/settings/payment_methods).

![Authenticate or enroll with Link directly in the Payment Element during checkout](images/link/link-in-pe.png)
Collect a customer email address for Link authentication or enrollment


There are two ways you can integrate Link with the Payment Element. Of these, Stripe recommends passing a customer email address to the Payment Element if available. Remember to consider how your checkout flow works when deciding between these options:

| Integration option                                                                                                                                                    | Checkout flow                                                                                                                                                                        | Description                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Pass a customer email address](https://docs.stripe.com/payments/link/add-link-elements-integration.md?link-integration-type=before-payment) to the Payment Element   | * Your customer enters their email address before landing on the checkout page (in a previous account creation step, for example).
  * You prefer to use your own email input field. | Programmatically pass a customer email address to the Payment Element. In this scenario, a customer authenticates to Link directly in the payment form instead of a separate UI component.                                                                 |
| [Collect a customer email address](https://docs.stripe.com/payments/link/add-link-elements-integration.md?link-integration-type=collect-email) in the Payment Element | Your customers enter their email and authenticate or enroll with Link directly in the Payment Element during checkout.                                                               | If a customer hasn’t enrolled with Link and they choose a supported payment method in the Payment Element, they’re prompted to save their details using Link. For those who have already enrolled, Link automatically populates their payment information. |

## Fetch updates from the server

You might want to update attributes on the PaymentIntent after the Payment Element renders, such as the [amount](https://docs.stripe.com/api/payment_intents/update.md#update_payment_intent-amount) (for example, discount codes or shipping costs). You can [update the PaymentIntent](https://docs.stripe.com/api/payment_intents/update.md) on your server, then call [elements.fetchUpdates](https://docs.stripe.com/js/elements_object/fetch_updates) to see the new amount reflected in the Payment Element. This example shows you how to create the server endpoint that updates the amount on the PaymentIntent:

```ruby
get '/update' do
  intent = Stripe::PaymentIntent.update(
    '{{PAYMENT_INTENT_ID}}',
    {amount: 1499},
  )
  {status: intent.status}.to_json
end
```

```python
@app.route('/update')
def secret():
  intent = stripe.PaymentIntent.modify(
    "{{PAYMENT_INTENT_ID}}",
    amount=1499,
  )
  return jsonify(status=intent.status)
```

```php
<?php
    $intent = $stripe->paymentIntents->update(
      '{{PAYMENT_INTENT_ID}}',
      ['amount' => 1499]
    );
    echo json_encode(array('status' => $intent->status));
?>
```

```java
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.PaymentIntent;

import com.google.gson.Gson;

import static spark.Spark.get;

public class StripeJavaQuickStart {
  public static void main(String[] args) {
    Gson gson = new Gson();

    get("/update", (request, response) -> {
      PaymentIntent paymentIntent =
        PaymentIntent.retrieve(
          "{{PAYMENT_INTENT_ID}}"
        );

      Map<String, Object> params = new HashMap<>();
      params.put("amount", 1499);
      PaymentIntent updatedPaymentIntent =
        paymentIntent.update(params);

      Map<String, String> response = new HashMap();
      response.put("status", updatedPaymentIntent.getStatus());

      return map;
    }, gson::toJson);
  }
}
```

```javascript
app.get('/update', async (req, res) => {
  const intent = await stripe.paymentIntents.update(
    '{{PAYMENT_INTENT_ID}}',
    {amount: 1499}
  );
  res.json({status: intent.status});
});
```

```go
package main

import (
  "encoding/json"
  "net/http"

  stripe "github.com/stripe/stripe-go/v{{golang.major_version}}"
)

type UpdateData struct {
  Status string `json:"status"`
}

func main() {
  http.HandleFunc("/update", func(w http.ResponseWriter, r *http.Request) {
    params := &stripe.PaymentIntentParams{
      Amount: stripe.Int64(1499),
    }
    pi, _ := paymentintent.Update(
      "{{PAYMENT_INTENT_ID}}",
      params,
    )

    data := UpdateData{
      Status: pi.Status,
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(data)
  })

  http.ListenAndServe(":3000", nil)
}
```

```csharp
using System;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace StripeExampleApi.Controllers
{
  [Route("update")]
  [ApiController]
  public class CheckoutApiController : Controller
  {
    [HttpPost]
    public ActionResult Post()
    {
      var options = new PaymentIntentUpdateOptions
      {
        Amount = 1499,
      };
      var service = new PaymentIntentService();
      var intent = service.Update(
        "{{PAYMENT_INTENT_ID}}",
        options);
      return Json(new {status = intent.Status});
    }
  }
}
```

This example demonstrates how to update the UI to reflect these changes on the client side:

```javascript
(async () => {
  const response = await fetch('/update');
  if (response.status === 'requires_payment_method') {
    const {error} = await elements.fetchUpdates();
  }
})();
```

## Submit the payment to Stripe

Use [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment) to complete the payment using details from the Payment Element. Provide a [return_url](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-return_url) to this function to indicate where Stripe should redirect the user after they complete the payment. Your user may be first redirected to an intermediate site, like a bank authorization page, before being redirected to the `return_url`. Card payments immediately redirect to the `return_url` when a payment is successful.

```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: 'https://example.com/order/123/complete',
    },
  });

  if (error) {
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Show error to your customer (for example, payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer will be redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer will be redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});
```

To call [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment) from your payment form component, use the [useStripe](https://docs.stripe.com/sdks/stripejs-react.md#usestripe-hook) and [useElements](https://docs.stripe.com/sdks/stripejs-react.md#useelements-hook) hooks.

If you prefer traditional class components over hooks, you can instead use an [ElementsConsumer](https://docs.stripe.com/sdks/stripejs-react.md#elements-consumer).

```jsx
import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://example.com/order/123/complete',
      },
    });


    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
};

export default CheckoutForm;
```

Make sure the `return_url` corresponds to a page on your website that provides the status of the payment. When Stripe redirects the customer to the `return_url`, we provide the following URL query parameters:

| Parameter                      | Description                                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `payment_intent`               | The unique identifier for the `PaymentIntent`.                                                                                                |
| `payment_intent_client_secret` | The [client secret](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) of the `PaymentIntent` object. |

If you have tooling that tracks the customer’s browser session, you might need to add the `stripe.com` domain to the referrer exclude list. Redirects cause some tools to create new sessions, which prevents you from tracking the complete session.

Use one of the query parameters to retrieve the PaymentIntent. Inspect the [status of the PaymentIntent](https://docs.stripe.com/payments/paymentintents/lifecycle.md) to decide what to show your customers. You can also append your own query parameters when providing the `return_url`, which persist through the redirect process.

```javascript
// Initialize Stripe.js using your publishable key
const stripe = Stripe('<<publishable key>>');

// Retrieve the "payment_intent_client_secret" query parameter appended to
// your return_url by Stripe.js
const clientSecret = new URLSearchParams(window.location.search).get(
  'payment_intent_client_secret'
);

// Retrieve the PaymentIntent
stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
  const message = document.querySelector('#message')

  // Inspect the PaymentIntent `status` to indicate the status of the payment
  // to your customer.
  //
  // Some payment methods will [immediately succeed or fail][0] upon
  // confirmation, while others will first enter a `processing` state.
  //
  // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
  switch (paymentIntent.status) {
    case 'succeeded':
      message.innerText = 'Success! Payment received.';
      break;

    case 'processing':
      message.innerText = "Payment processing. We'll update you when payment is received.";
      break;

    case 'requires_payment_method':
      message.innerText = 'Payment failed. Please try another payment method.';
      // Redirect your user back to your payment page to attempt collecting
      // payment again
      break;

    default:
      message.innerText = 'Something went wrong.';
      break;
  }
});
```

```jsx
import React, {useState, useEffect} from 'react';
import {useStripe} from '@stripe/react-stripe-js';

const PaymentStatus = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter appended to
    // your return_url by Stripe.js
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    // Retrieve the PaymentIntent
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({paymentIntent}) => {
        // Inspect the PaymentIntent `status` to indicate the status of the payment
        // to your customer.
        //
        // Some payment methods will [immediately succeed or fail][0] upon
        // confirmation, while others will first enter a `processing` state.
        //
        // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Success! Payment received.');
            break;

          case 'processing':
            setMessage("Payment processing. We'll update you when payment is received.");
            break;

          case 'requires_payment_method':
            // Redirect your user back to your payment page to attempt collecting
            // payment again
            setMessage('Payment failed. Please try another payment method.');
            break;

          default:
            setMessage('Something went wrong.');
            break;
        }
      });
  }, [stripe]);


  return message;
};

export default PaymentStatus;
```

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test your integration

To test your custom payments integration:

1. Create a Payment Intent and retrieve the client secret.
1. Fill out the payment details with a method from the following table.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Submit the payment to Stripe. You’re redirected to your `return_url`.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like billing information and the list of purchased items. You can use this information to fulfill the order.

Learn more about [testing your integration](https://docs.stripe.com/testing.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Add more payment methods

The Payment Element [supports many payment methods](https://docs.stripe.com/payments/payment-methods/integration-options.md#choose-how-to-add-payment-methods) by default. You have to take additional steps to enable and display some payment methods.

### Affirm 

To begin using Affirm, you must enable it in the [Dashboard](https://dashboard.stripe.com/settings/payment_methods). When you create a PaymentIntent with the Affirm payment method, you need to include a [shipping address](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-shipping). This example suggests passing the shipping information on the client after the customer [selects their payment method](https://docs.stripe.com/payments/accept-a-payment.md#web-create-intent). Learn more about using [Affirm](https://docs.stripe.com/payments/affirm.md) with Stripe.

```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: 'https://my-site.com/order/123/complete',
      shipping: {
        name: 'Jenny Rosen',
        address: {
          line1: '1 Street',
          city: 'Seattle',
          state: 'WA',
          postal_code: '95123',
          country: 'US',
        },
      },

    },
  });

  if (error) {
    // This point is reached if there's an immediate error when
    // confirming the payment. Show error to your customer (e.g., payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer is redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer is redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});
```

```jsx
import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://my-site.com/order/123/complete',
        shipping: {
          name: 'Jenny Rosen',
          address: {
            line1: '1 Street',
            city: 'Seattle',
            state: 'WA',
            postal_code: '95123',
            country: 'US',
          },
        },

      },
    });


    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (e.g., payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
};

export default CheckoutForm;
```

#### Test Affirm 

Learn how to test different scenarios using the following table:

| Scenario                                                         | How to test                                                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Your customer successfully pays with Affirm.                     | Fill out the form (make sure to include a shipping address) and authenticate the payment. |
| Your customer fails to authenticate on the Affirm redirect page. | Fill out the form and click **Fail test payment** on the redirect page.                   |

### Afterpay (Clearpay) 

When you create a PaymentIntent with the Afterpay payment method, you need to include a [shipping address](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-shipping). Learn more about using [Afterpay](https://docs.stripe.com/payments/afterpay-clearpay.md) with Stripe.

You can manage payment methods from the [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe handles the return of eligible payment methods based on factors such as the transaction’s amount, currency, and payment flow. The example below uses the [automatic_payment_methods](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-automatic_payment_methods-enabled) attribute but you can list `afterpay_clearpay` with [payment method types](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-payment_method_types). In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default. Regardless of which option you choose, make sure that you enable Afterpay Clearpay in the [Dashboard](https://dashboard.stripe.com/settings/payment_methods).

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PaymentIntentCreateOptions
{
    Amount = 1099,
    Currency = "USD",
    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
    Shipping = new ChargeShippingOptions
    {
        Name = "Jenny Rosen",
        Address = new AddressOptions
        {
            Line1 = "1234 Main Street",
            City = "San Francisco",
            State = "CA",
            Country = "US",
            PostalCode = "94111",
        },
    },
};
var service = new PaymentIntentService();
PaymentIntent paymentIntent = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PaymentIntentParams{
  Amount: stripe.Int64(1099),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
  AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
    Enabled: stripe.Bool(true),
  },
  Shipping: &stripe.ShippingDetailsParams{
    Name: stripe.String("Jenny Rosen"),
    Address: &stripe.AddressParams{
      Line1: stripe.String("1234 Main Street"),
      City: stripe.String("San Francisco"),
      State: stripe.String("CA"),
      Country: stripe.String("US"),
      PostalCode: stripe.String("94111"),
    },
  },
};
result, err := paymentintent.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PaymentIntentCreateParams params =
  PaymentIntentCreateParams.builder()
    .setAmount(1099L)
    .setCurrency("USD")
    .setAutomaticPaymentMethods(
      PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
    )
    .setShipping(
      PaymentIntentCreateParams.Shipping.builder()
        .setName("Jenny Rosen")
        .setAddress(
          PaymentIntentCreateParams.Shipping.Address.builder()
            .setLine1("1234 Main Street")
            .setCity("San Francisco")
            .setState("CA")
            .setCountry("US")
            .setPostalCode("94111")
            .build()
        )
        .build()
    )
    .build();

PaymentIntent paymentIntent = PaymentIntent.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1099,
  currency: 'USD',
  automatic_payment_methods: {
    enabled: true,
  },
  shipping: {
    name: 'Jenny Rosen',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111',
    },
  },
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

payment_intent = stripe.PaymentIntent.create(
  amount=1099,
  currency="USD",
  automatic_payment_methods={"enabled": True},
  shipping={
    "name": "Jenny Rosen",
    "address": {
      "line1": "1234 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94111",
    },
  },
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$paymentIntent = $stripe->paymentIntents->create([
  'amount' => 1099,
  'currency' => 'USD',
  'automatic_payment_methods' => ['enabled' => true],
  'shipping' => [
    'name' => 'Jenny Rosen',
    'address' => [
      'line1' => '1234 Main Street',
      'city' => 'San Francisco',
      'state' => 'CA',
      'country' => 'US',
      'postal_code' => '94111',
    ],
  ],
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

payment_intent = Stripe::PaymentIntent.create({
  amount: 1099,
  currency: 'USD',
  automatic_payment_methods: {enabled: true},
  shipping: {
    name: 'Jenny Rosen',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111',
    },
  },
})
```

#### Test Afterpay (Clearpay) 

Learn how to test different scenarios using the following table:

| Scenario                                                           | How to test                                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Your customer successfully pays with Afterpay.                     | Fill out the form (make sure to include a shipping address) and authenticate the payment. |
| Your customer fails to authenticate on the Afterpay redirect page. | Fill out the form and click **Fail test payment** on the redirect page.                   |

### Apple Pay and Google Pay 

Stripe Elements doesn’t support Google Pay or Apple Pay for Stripe accounts and customers in India. Therefore, you can’t test your Google Pay or Apple Pay integration if the tester’s IP address is in India, even if the Stripe account is based outside India.

Learn more about using [Apple Pay](https://docs.stripe.com/apple-pay.md) and [Google Pay](https://docs.stripe.com/google-pay.md) with Stripe.

### ACH Direct Debit 

When using the Payment Element with the ACH Direct Debit payment method, follow these steps:

1. Create a [Customer object](https://docs.stripe.com/api/customers.md).

   ```dotnet
   StripeConfiguration.ApiKey = "<<secret key>>";
   
   var options = new CustomerCreateOptions();
   var service = new CustomerService();
   Customer customer = service.Create(options);
   ```

   ```go
   stripe.Key = "<<secret key>>"
   
   params := &stripe.CustomerParams{};
   result, err := customer.New(params);
   ```

   ```java
   Stripe.apiKey = "<<secret key>>";
   
   CustomerCreateParams params = CustomerCreateParams.builder().build();
   
   Customer customer = Customer.create(params);
   ```

   ```node
   const stripe = require('stripe')('<<secret key>>');
   
   const customer = await stripe.customers.create();
   ```

   ```python
   import stripe
   stripe.api_key = "<<secret key>>"
   
   customer = stripe.Customer.create()
   ```

   ```php
   $stripe = new \Stripe\StripeClient('<<secret key>>');
   
   $customer = $stripe->customers->create([]);
   ```

   ```ruby
   Stripe.api_key = '<<secret key>>'
   
   customer = Stripe::Customer.create()
   ```

1. Specify the customer ID when creating the `PaymentIntent`.

   ```dotnet
   StripeConfiguration.ApiKey = "<<secret key>>";
   
   var options = new PaymentIntentCreateOptions
   {
       Amount = 1099,
       Currency = "usd",
       SetupFutureUsage = "off_session",
       Customer = "{{CUSTOMER_ID}}",
       PaymentMethodTypes = new List<string> { "us_bank_account" },
   };
   var service = new PaymentIntentService();
   PaymentIntent paymentIntent = service.Create(options);
   ```

   ```go
   stripe.Key = "<<secret key>>"
   
   params := &stripe.PaymentIntentParams{
     Amount: stripe.Int64(1099),
     Currency: stripe.String(string(stripe.CurrencyUSD)),
     SetupFutureUsage: stripe.String(string(stripe.PaymentIntentSetupFutureUsageOffSession)),
     Customer: stripe.String("{{CUSTOMER_ID}}"),
     PaymentMethodTypes: []*string{stripe.String("us_bank_account")},
   };
   result, err := paymentintent.New(params);
   ```

   ```java
   Stripe.apiKey = "<<secret key>>";
   
   PaymentIntentCreateParams params =
     PaymentIntentCreateParams.builder()
       .setAmount(1099L)
       .setCurrency("usd")
       .setSetupFutureUsage(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION)
       .setCustomer("{{CUSTOMER_ID}}")
       .addPaymentMethodType("us_bank_account")
       .build();
   
   PaymentIntent paymentIntent = PaymentIntent.create(params);
   ```

   ```node
   const stripe = require('stripe')('<<secret key>>');
   
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 1099,
     currency: 'usd',
     setup_future_usage: 'off_session',
     customer: '{{CUSTOMER_ID}}',
     payment_method_types: ['us_bank_account'],
   });
   ```

   ```python
   import stripe
   stripe.api_key = "<<secret key>>"
   
   payment_intent = stripe.PaymentIntent.create(
     amount=1099,
     currency="usd",
     setup_future_usage="off_session",
     customer="{{CUSTOMER_ID}}",
     payment_method_types=["us_bank_account"],
   )
   ```

   ```php
   $stripe = new \Stripe\StripeClient('<<secret key>>');
   
   $paymentIntent = $stripe->paymentIntents->create([
     'amount' => 1099,
     'currency' => 'usd',
     'setup_future_usage' => 'off_session',
     'customer' => '{{CUSTOMER_ID}}',
     'payment_method_types' => ['us_bank_account'],
   ]);
   ```

   ```ruby
   Stripe.api_key = '<<secret key>>'
   
   payment_intent = Stripe::PaymentIntent.create({
     amount: 1099,
     currency: 'usd',
     setup_future_usage: 'off_session',
     customer: '{{CUSTOMER_ID}}',
     payment_method_types: ['us_bank_account'],
   })
   ```

1. Select a [verification method](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-payment_method_options-us_bank_account-verification_method).

When using the ACH Direct Debit payment method with the Payment Element, you can only select .

Learn more about using [ACH Direct Debit](https://docs.stripe.com/payments/ach-direct-debit.md) with Stripe.

#### Test ACH Direct Debit 

| Scenario                                                                           | How to test                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your customer successfully pays with a US bank account using instant verification. | Select **US bank account** and fill out the form. Click the test institution. Follow the instructions on the modal to link your bank account. Click your payment button.                                                                                                                                                                       |
| Your customer successfully pays with a US bank account using microdeposits.        | Select **US bank account** and fill out the form. Click **Enter bank details manually instead**. Follow the instructions on the modal to link your bank account. You may use these [test account numbers](https://docs.stripe.com/payments/ach-direct-debit/accept-a-payment.md?platform=web#test-account-numbers). Click your payment button. |
| Your customer fails to complete the bank account linking process.                  | Select **US bank account** and click the test institution or **Enter bank details manually instead**. Close the modal without completing it.                                                                                                                                                                                                   |

### QR code payment methods 

When using the Payment Element with a QR code based payment method (WeChat Pay, PayNow, Pix, PromptPay, Cash App Pay), the user can close the QR code modal. This triggers a redirect to your `return_url` and doesn’t return the user to the checkout page.

To handle users closing QR code modals, at the server-side handler for your `return_url`, inspect the Payment Intent’s `status` to see if it’s `succeeded` or still `requires_action` (meaning the user has closed the modal without paying), dealing with each case as needed.

Alternatively, prevent the automatic redirect to your `return_url` by passing the advanced optional parameter [`redirect=if_required`](https://docs.stripe.com/js/payment_intents/confirm_payment#confirm_payment_intent-options-redirect), which prevents the redirect when closing a QR code modal.

### Cash App Pay 

The Payment Element renders a dynamic form differently in desktop web or mobile web since it uses different customer authentication methods. Learn more about using [Cash App Pay](https://docs.stripe.com/payments/cash-app-pay.md) with Stripe.

Cash App Pay is a redirect based payment method in mobile web. It redirects your customer to Cash App in live mode or a test payment page in a test environment. After the payment is complete, they’re redirected to the `return_url`, regardless of whether you set `redirect=if_required` or not.

Cash App Pay is a QR code payment method in desktop web, where the Payment Element renders a QR code modal. Your customer needs to scan the QR code with a QR code scanning application or the Cash App mobile application.

In live mode, it redirects the customer to the `return_url` as soon as they’re redirected to the Cash App. In test environments, they can approve or decline the payment before being redirected to the `return_url`. Customers can also close the QR code modal before completing the payment, which triggers a redirect to your `return_url`.

Make sure the `return_url` corresponds to a page on your website to inspect the Payment Intent’s `status`. The Payment Intent’s `status` can be `succeeded`, `failed`, or `requires_action` (for example, the customer has closed the modal without scanning the QR code).

Alternatively, prevent the automatic redirect to your `return_url` by passing the advanced optional parameter `redirect=if_required`, which prevents the redirect when closing a QR code modal.

### PayPal 

To use PayPal, make sure you’re on a [registered domain](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).

## Disclose Stripe to your customers 

Stripe collects information on customer interactions with Elements to provide services to you, prevent fraud, and improve its services. This includes using cookies and IP addresses to identify which Elements a customer saw during a single checkout session. You’re responsible for disclosing and obtaining all rights and consents necessary for Stripe to use data in these ways. For more information, visit our [privacy center](https://stripe.com/legal/privacy-center#as-a-business-user-what-notice-do-i-provide-to-my-end-customers-about-stripe).

## See Also

- [Stripe Elements](https://docs.stripe.com/payments/elements.md)
- [Set up future payments](https://docs.stripe.com/payments/save-and-reuse.md)
- [Save payment details during payment](https://docs.stripe.com/payments/save-during-payment.md)
- [Calculate sales tax, GST and VAT in your payment flow](https://docs.stripe.com/tax/custom.md)

# In-app integration for iOS

> This is a In-app integration for iOS for when platform is ios. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=ios.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use our official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [Stripe iOS SDK](https://github.com/stripe/stripe-ios) is open source, [fully documented](https://stripe.dev/stripe-ios/index.html), and compatible with apps supporting iOS {{minimumiOSVersion}} or above.

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-ios/releases) page on GitHub. To receive notifications when a new release is published, [watch releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) for the repository.

## Enable payment methods

## Add an endpoint

## Collect payment details

## Set up a return URL

The customer might navigate away from your app to authenticate (for example, in Safari or their banking app). To allow them to automatically return to your app after authenticating, [configure a custom URL scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app) and set up your app delegate to forward the URL to the SDK. Stripe doesn’t support [universal links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content).

```swift
// This method handles opening custom URL schemes (for example, "your-app://stripe-redirect")
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else {
        return
    }
    let stripeHandled = StripeAPI.handleURLCallback(with: url)
    if (!stripeHandled) {
        // This was not a Stripe url – handle the URL normally as you would
    }
}

```

```swift
// This method handles opening custom URL schemes (for example, "your-app://stripe-redirect")
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    let stripeHandled = StripeAPI.handleURLCallback(with: url)
    if (stripeHandled) {
        return true
    } else {
        // This was not a Stripe url – handle the URL normally as you would
    }
    return false
}
```

```swift
@main
struct MyApp: App {
  var body: some Scene {
    WindowGroup {
      Text("Hello, world!")
        .onOpenURL { incomingURL in
          let stripeHandled = StripeAPI.handleURLCallback(with: incomingURL)
          if (!stripeHandled) {
            // This was not a Stripe url – handle the URL normally as you would
          }
        }
    }
  }
}
```

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable Link

Enable Link in your [Payment Method settings](https://dashboard.stripe.com/settings/payment_methods) to allow your customers to securely save and reuse their payment information using Link’s one-click express checkout button.

### Pass your customer’s email to the Mobile Payment Element

Link authenticates a customer using their email address. Stripe recommends prefilling as much information as possible to streamline the checkout process.

## Enable Apple Pay

If your checkout screen has a dedicated **Apple Pay button**, follow the [Apple Pay guide](https://docs.stripe.com/apple-pay.md#present-payment-sheet) and use `ApplePayContext` to collect payment from your Apple Pay button. You can use `PaymentSheet` to handle other payment method types.

### Register for an Apple Merchant ID

Obtain an Apple Merchant ID by [registering for a new identifier](https://developer.apple.com/account/resources/identifiers/add/merchant) on the Apple Developer website.

Fill out the form with a description and identifier. Your description is for your own records and you can modify it in the future. Stripe recommends using the name of your app as the identifier (for example, `merchant.com.{{YOUR_APP_NAME}}`).

### Create a new Apple Pay certificate

Create a certificate for your app to encrypt payment data.

Go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard, click **Add new application**, and follow the guide.

Download a Certificate Signing Request (CSR) file to get a secure certificate from Apple that allows you to use Apple Pay.

One CSR file must be used to issue exactly one certificate. If you switch your Apple Merchant ID, you must go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard to obtain a new CSR and certificate.

### Integrate with Xcode

Add the Apple Pay capability to your app. In Xcode, open your project settings, click the **Signing & Capabilities** tab, and add the **Apple Pay** capability. You might be prompted to log in to your developer account at this point. Select the merchant ID you created earlier, and your app is ready to accept Apple Pay.

![](images/mobile/ios/xcode.png)
Enable the Apple Pay capability in Xcode


### Add Apple Pay

To add Apple Pay to PaymentSheet, set [applePay](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:6Stripe12PaymentSheetC13ConfigurationV8applePayAC05ApplefD0VSgvp) after initializing `PaymentSheet.Configuration` with your Apple merchant ID and the [country code of your business](https://dashboard.stripe.com/settings/account).

Per [Apple’s guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) for recurring payments, you must also set additional attributes on the `PKPaymentRequest`. Add a handler in [ApplePayConfiguration.paymentRequestHandlers](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/applepayconfiguration/handlers/paymentrequesthandler) to configure the [PKPaymentRequest.paymentSummaryItems](https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems) with the amount you intend to charge (for example, 9.95 USD a month).

You can also adopt [merchant tokens](https://developer.apple.com/apple-pay/merchant-tokens/) by setting the `recurringPaymentRequest` or `automaticReloadPaymentRequest` properties on the `PKPaymentRequest`.

To learn more about how to use recurring payments with Apple Pay, see [Apple’s PassKit documentation](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

```swift
let customHandlers = PaymentSheet.ApplePayConfiguration.Handlers(
    paymentRequestHandler: { request in
        // PKRecurringPaymentSummaryItem is available on iOS 15 or later
        if #available(iOS 15.0, *) {
            let billing = PKRecurringPaymentSummaryItem(label: "My Subscription", amount: NSDecimalNumber(string: "59.99"))

            // Payment starts today
            billing.startDate = Date()

            // Payment ends in one year
            billing.endDate = Date().addingTimeInterval(60 * 60 * 24 * 365)

            // Pay once a month.
            billing.intervalUnit = .month
            billing.intervalCount = 1

            // recurringPaymentRequest is only available on iOS 16 or later
            if #available(iOS 16.0, *) {
                request.recurringPaymentRequest = PKRecurringPaymentRequest(paymentDescription: "Recurring",
                                                                            regularBilling: billing,
                                                                            managementURL: URL(string: "https://my-backend.example.com/customer-portal")!)
                request.recurringPaymentRequest?.billingAgreement = "You'll be billed $59.99 every month for the next 12 months. To cancel at any time, go to Account and click 'Cancel Membership.'"
            }
            request.paymentSummaryItems = [billing]
            request.currencyCode = "USD"
        } else {
            // On older iOS versions, set alternative summary items.
            request.paymentSummaryItems = [PKPaymentSummaryItem(label: "Monthly plan starting July 1, 2022", amount: NSDecimalNumber(string: "59.99"), type: .final)]
        }
        return request
    }
)
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(merchantId: "merchant.com.your_app_name",
                                merchantCountryCode: "US",
                                customHandlers: customHandlers)
```

### Order tracking

To add [order tracking](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) information in iOS 16 or later, configure an [authorizationResultHandler](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/applepayconfiguration/handlers/authorizationresulthandler) in your `PaymentSheet.ApplePayConfiguration.Handlers`. Stripe calls your implementation after the payment is complete, but before iOS dismisses the Apple Pay sheet.

In your `authorizationResultHandler` implementation, fetch the order details from your server for the completed order. Add the details to the provided [PKPaymentAuthorizationResult](https://developer.apple.com/documentation/passkit/pkpaymentauthorizationresult) and call the provided completion handler.

To learn more about order tracking, see [Apple’s Wallet Orders documentation](https://developer.apple.com/documentation/walletorders).

```swift
let customHandlers = PaymentSheet.ApplePayConfiguration.Handlers(
    authorizationResultHandler: { result, completion in
        // Fetch the order details from your service
        MyAPIClient.shared.fetchOrderDetails(orderID: orderID) { myOrderDetails
            result.orderDetails = PKPaymentOrderDetails(
                orderTypeIdentifier: myOrderDetails.orderTypeIdentifier, // "com.myapp.order"
                orderIdentifier: myOrderDetails.orderIdentifier, // "ABC123-AAAA-1111"
                webServiceURL: myOrderDetails.webServiceURL, // "https://my-backend.example.com/apple-order-tracking-backend"
                authenticationToken: myOrderDetails.authenticationToken) // "abc123"
            // Call the completion block on the main queue with your modified PKPaymentAuthorizationResult
            completion(result)
        }
    }
)
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(merchantId: "merchant.com.your_app_name",
                               merchantCountryCode: "US",
                               customHandlers: customHandlers)
```

## Enable card scanning

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

## Enable ACH payments

To enable ACH debit payments include `StripeFinancialConnections` as a dependency for your app.

The [Stripe iOS SDK](https://github.com/stripe/stripe-ios) is open source, [fully documented](https://stripe.dev/stripe-ios/index.html), and compatible with apps supporting iOS {{minimumiOSVersion}} or above.

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-ios/releases) page on GitHub. To receive notifications when a new release is published, [watch releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) for the repository.

## Customize the sheet

All customization is configured through the [PaymentSheet.Configuration](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html) object.

### Appearance

Customize colors, fonts, and so on to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=ios).

### Payment method layout

Configure the layout of payment methods in the sheet using [paymentMethodLayout](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/configuration-swift.struct/paymentmethodlayout). You can display them horizontally, vertically, or let Stripe optimize the layout automatically.

![](images/mobile/payment-sheet/ios-mpe-payment-method-layouts.png)

```swift
var configuration = PaymentSheet.Configuration()
configuration.paymentMethodLayout = .automatic
```

### Collect users addresses

Collect local and international shipping or billing addresses from your customers using the [Address Element](https://docs.stripe.com/elements/address-element.md?platform=ios).

### Merchant display name

Specify a customer-facing business name by setting [merchantDisplayName](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:18StripePaymentSheet0bC0C13ConfigurationV19merchantDisplayNameSSvp). By default, this is your app’s name.

```swift
var configuration = PaymentSheet.Configuration()
configuration.merchantDisplayName = "My app, Inc."
```

### Dark mode

`PaymentSheet` automatically adapts to the user’s system-wide appearance settings (light and dark mode). If your app doesn’t support dark mode, you can set [style](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:18StripePaymentSheet0bC0C13ConfigurationV5styleAC18UserInterfaceStyleOvp) to `alwaysLight` or `alwaysDark` mode.

```swift
var configuration = PaymentSheet.Configuration()
configuration.style = .alwaysLight
```

## Handle user logout

## Complete payment in your UI

You can present the Payment Sheet to only collect payment method details and then later call a `confirm` method to complete payment in your app’s UI. This is useful if you have a custom buy button or require additional steps after you collect payment details.

![](images/mobile/payment-sheet/ios-multi-step.png)
Complete the payment in your app’s UI


The following steps walk you through how to complete payment in your app’s UI. See our sample integration out on [GitHub](https://github.com/stripe/stripe-ios/blob/master/Example/PaymentSheet%20Example/PaymentSheet%20Example/ExampleCustomCheckoutViewController.swift).

1. First, initialize [PaymentSheet.FlowController](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller) instead of `PaymentSheet` and update your UI with its `paymentOption` property. This property contains an image and label representing the customer’s initially selected, default payment method.

```swift
PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration) { [weak self] result in
  switch result {
  case .failure(let error):
    print(error)
  case .success(let paymentSheetFlowController):
    self?.paymentSheetFlowController = paymentSheetFlowController
    // Update your UI using paymentSheetFlowController.paymentOption
  }
}
```

1. Next, call `presentPaymentOptions` to collect payment details. When completed, update your UI again with the `paymentOption` property.

```swift
paymentSheetFlowController.presentPaymentOptions(from: self) {
  // Update your UI using paymentSheetFlowController.paymentOption
}
```

1. Finally, call `confirm`.

```swift
paymentSheetFlowController.confirm(from: self) { paymentResult in
  // MARK: Handle the payment result
  switch paymentResult {
  case .completed:
    print("Payment complete!")
  case .canceled:
    print("Canceled!")
  case .failed(let error):
    print(error)
  }
}
```

The following steps walk you through how to complete payment in your app’s UI. See our sample integration out on [GitHub](https://github.com/stripe/stripe-ios/blob/master/Example/PaymentSheet%20Example/PaymentSheet%20Example/ExampleSwiftUICustomPaymentFlow.swift).

1. First, initialize [PaymentSheet.FlowController](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller) instead of `PaymentSheet`. Its `paymentOption` property contains an image and label representing the customer’s currently selected payment method, which you can use in your UI.

```swift
PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration) { [weak self] result in
  switch result {
  case .failure(let error):
    print(error)
  case .success(let paymentSheetFlowController):
    self?.paymentSheetFlowController = paymentSheetFlowController
    // Use the paymentSheetFlowController.paymentOption properties in your UI
    myPaymentMethodLabel = paymentSheetFlowController.paymentOption?.label ?? "Select a payment method"
    myPaymentMethodImage = paymentSheetFlowController.paymentOption?.image ?? UIImage(systemName: "square.and.pencil")!
  }
}
```

1. Use [PaymentSheet.FlowController.PaymentOptionsButton](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller/paymentoptionsbutton) to wrap the button that presents the sheet to collect payment details. When `PaymentSheet.FlowController` calls the `onSheetDismissed` argument, the `paymentOption` for the `PaymentSheet.FlowController` instance reflects the currently selected payment method.

```swift
PaymentSheet.FlowController.PaymentOptionsButton(
  paymentSheetFlowController: paymentSheetFlowController,
  onSheetDismissed: {
    myPaymentMethodLabel = paymentSheetFlowController.paymentOption?.label ?? "Select a payment method"
    myPaymentMethodImage = paymentSheetFlowController.paymentOption?.image ?? UIImage(systemName: "square.and.pencil")!
  },
  content: {
    /* An example button */
    HStack {
      Text(myPaymentMethodLabel)
      Image(uiImage: myPaymentMethodImage)
    }
  }
)
```

1. Use [PaymentSheet.FlowController.PaymentOptionsButton](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller/paymentoptionsbutton) to wrap the button that confirms the payment.

```swift
PaymentSheet.FlowController.ConfirmButton(
  paymentSheetFlowController: paymentSheetFlowController,
  onCompletion: { result in
    // MARK: Handle the payment result
    switch result {
    case .completed:
      print("Payment complete!")
    case .canceled:
      print("Canceled!")
    case .failed(let error):
      print(error)
    }
  },
  content: {
    /* An example button */
    Text("Pay")
  }
)
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

## Enable CVC recollection on confirmation

### Update parameters of the intent creation

# In-app integration for Android

> This is a In-app integration for Android for when platform is android. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=android.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use the official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

```kotlin
plugins {
    id("com.android.application")
}


dependencies {
  // ...

}
```

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

}
```

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-android/releases) page on GitHub. To receive notifications when a new release is published, [watch releases for the repository](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

## Enable payment methods

## Add an endpoint

## Collect payment details

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable Link

Enable Link in your [Payment Method settings](https://dashboard.stripe.com/settings/payment_methods) to allow your customers to securely save and reuse their payment information using Link’s one-click express checkout button.

### Pass your customer’s email to the Mobile Payment Element

Link authenticates a customer using their email address. Stripe recommends prefilling as much information as possible to streamline the checkout process.

## Enable Google Pay

### Set up your integration

To use Google Pay, first enable the Google Pay API by adding the following to the `<application>` tag of your **AndroidManifest.xml**:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

For more details, see Google Pay’s [Set up Google Pay API](https://developers.google.com/pay/api/android/guides/setup) for Android.

### Add Google Pay

### Test Google Pay

Google allows you to make test payments through their [Test card suite](https://developers.google.com/pay/api/android/guides/resources/test-card-suite). The test suite supports using stripe [test cards](https://docs.stripe.com/testing.md).

You can test Google Pay using a physical Android device. Make sure you have a device in a country where google pay is supported and log in to a Google account on your test device with a real card saved to Google Wallet.

## Enable card scanning

To enable card scanning support, add `stripecardscan` to the `dependencies` block of your [app/build.gradle](https://developer.android.com/studio/build/dependencies) file:

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation 'com.stripe:stripecardscan:21.20.2'
}
```

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation("com.stripe:stripecardscan:21.20.2")
}
```

## Enable ACH payments

To enable ACH debit payments include Financial Connections as a dependency for your app.

```kotlin
plugins {
    id("com.android.application")
}


dependencies {
  // ...

}
```

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

}
```

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-android/releases) page on GitHub. To receive notifications when a new release is published, [watch releases for the repository](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

## Customize the sheet

All customization is configured using the [PaymentSheet.Configuration](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html) object.

### Appearance

Customize colors, fonts, and more to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=android).

### Payment method layout

Configure the layout of payment methods in the sheet using [paymentMethodLayout](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/-builder/index.html#2123253356%2FFunctions%2F2002900378). You can display them horizontally, vertically, or let Stripe optimize the layout automatically.

![](images/mobile/payment-sheet/android-mpe-payment-method-layouts.png)

```kotlin
PaymentSheet.Configuration.Builder("Example, Inc.")
  .paymentMethodLayout(PaymentSheet.PaymentMethodLayout.Automatic)
  .build()
```

```java
new PaymentSheet.Configuration.Builder("Example, Inc.")
  .paymentMethodLayout(PaymentSheet.PaymentMethodLayout.Automatic)
  .build();
```

### Collect users addresses

Collect local and international shipping or billing addresses from your customers using the [Address Element](https://docs.stripe.com/elements/address-element.md?platform=android).

### Business display name

Specify a customer-facing business name by setting [merchantDisplayName](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html#-191101533%2FProperties%2F2002900378). By default, this is your app’s name.

```kotlin
PaymentSheet.Configuration.Builder(
  merchantDisplayName = "My app, Inc."
).build()
```

```java
new PaymentSheet.Configuration.Builder("My app, Inc.")
  .build();
```

### Dark mode

By default, `PaymentSheet` automatically adapts to the user’s system-wide appearance settings (light and dark mode). You can change this by setting light or dark mode on your app:

```kotlin
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

```java
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
```

## Handle user logout

## Complete payment in your UI

You can present Payment Sheet to only collect payment method details and complete the payment back in your app’s UI. This is useful if you have a custom buy button or require additional steps after payment details are collected.

![](images/mobile/payment-sheet/android-multi-step.png)

A sample integration is [available on our GitHub](https://github.com/stripe/stripe-android/blob/master/paymentsheet-example/src/main/java/com/stripe/android/paymentsheet/example/samples/ui/custom_flow/CustomFlowActivity.kt).

1. First, initialize [PaymentSheet.FlowController](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html) instead of `PaymentSheet` using one of the [Builder](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/-builder/index.html) methods.

```kotlin
class CheckoutActivity : AppCompatActivity() {
  private lateinit var flowController: PaymentSheet.FlowController

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    flowController = PaymentSheet.FlowController.Builder(
      paymentResultCallback = ::onPaymentSheetResult,
      paymentOptionCallback = ::onPaymentOption,
    ).build(this)
  }
}
```

```java
public class CheckoutActivity extends AppCompatActivity {
  private PaymentSheet.FlowController flowController;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    final PaymentOptionCallback paymentOptionCallback = paymentOption -> {
      onPaymentOption(paymentOption);
    };

    final PaymentSheetResultCallback paymentSheetResultCallback = paymentSheetResult -> {
      onPaymentSheetResult(paymentSheetResult);
    };

    flowController = new PaymentSheet.FlowController.Builder(
      paymentSheetResultCallback,
      paymentOptionCallback
    ).build(this);
  }
}
```

2. Next, call `configureWithPaymentIntent` with the Stripe object keys fetched from your backend and update your UI in the callback using [getPaymentOption()](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#-2091462043%2FFunctions%2F2002900378). This contains an image and label representing the customer’s currently selected payment method.

```kotlin
flowController.configureWithPaymentIntent(
  paymentIntentClientSecret = paymentIntentClientSecret,
  configuration = PaymentSheet.Configuration.Builder("Example, Inc.")
    .customer(PaymentSheet.CustomerConfiguration(
      id = customerId,
      ephemeralKeySecret = ephemeralKeySecret
    ))
    .build()
) { isReady, error ->
  if (isReady) {
    // Update your UI using `flowController.getPaymentOption()`
  } else {
    // handle FlowController configuration failure
  }
}
```

```java
flowController.configureWithPaymentIntent(
  paymentIntentClientSecret,
  new PaymentSheet.Configuration.Builder("Example, Inc.")
    .customer(new PaymentSheet.CustomerConfiguration(
      customerId,
      ephemeralKeySecret
    ))
    .build(),
  (success, error) -> {
    if (success) {
      // Update your UI using `flowController.getPaymentOption()`
    } else {
      // handle FlowController configuration failure
    }
  }
);
```

3. Next, call [presentPaymentOptions](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#449924733%2FFunctions%2F2002900378) to collect payment details. When the customer finishes, the sheet is dismissed and calls the [paymentOptionCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-option-callback/index.html) passed earlier in `create`. Implement this method to update your UI with the returned `paymentOption`.

```kotlin
// ...
  flowController.presentPaymentOptions()
// ...
  private fun onPaymentOption(paymentOption: PaymentOption?) {
    if (paymentOption != null) {
      paymentMethodButton.text = paymentOption.label
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        paymentOption.drawableResourceId,
        0,
        0,
        0
      )
    } else {
      paymentMethodButton.text = "Select"
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        null,
        null,
        null,
        null
      )
    }
  }
```

```java
// ...
    flowController.presentPaymentOptions());
// ...
  private void onPaymentOption(
    @Nullable PaymentOption paymentOption
  ) {
    if (paymentOption != null) {
      paymentMethodButton.setText(paymentOption.getLabel());
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        paymentOption.getDrawableResourceId(),
        0,
        0,
        0
      );
    } else {
      paymentMethodButton.setText("Select");
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        null,
        null,
        null,
        null
      );
    }
  }

  private void onCheckout() {
    // see below
  }
}
```

4. Finally, call [confirm](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#-479056656%2FFunctions%2F2002900378) to complete the payment. When the customer finishes, the sheet is dismissed and calls the [paymentResultCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result-callback/index.html#237248767%2FFunctions%2F2002900378) passed earlier in `create`.

```kotlin
// ...
    flowController.confirmPayment()
  // ...

  private fun onPaymentSheetResult(
    paymentSheetResult: PaymentSheetResult
  ) {
    when (paymentSheetResult) {
      is PaymentSheetResult.Canceled -> {
        // Payment canceled
      }
      is PaymentSheetResult.Failed -> {
        // Payment Failed. See logcat for details or inspect paymentSheetResult.error
      }
      is PaymentSheetResult.Completed -> {
        // Payment Complete
      }
    }
  }
```

```java
// ...
    flowController.confirmPayment();
  // ...

  private void onPaymentSheetResult(
    final PaymentSheetResult paymentSheetResult
  ) {
    if (paymentSheetResult instanceof PaymentSheetResult.Canceled) {
      // Payment Canceled
    } else if (paymentSheetResult instanceof PaymentSheetResult.Failed) {
      // Payment Failed. See logcat for details or inspect paymentSheetResult.getError()
    } else if (paymentSheetResult instanceof PaymentSheetResult.Completed) {
      // Payment Complete
    }
  }
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

## Enable CVC recollection on confirmation

### Update parameters of the intent creation

# In-app integration for React Native

> This is a In-app integration for React Native for when platform is react-native. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=react-native.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use the official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [React Native SDK](https://github.com/stripe/stripe-react-native) is open source and fully documented. Internally, it uses the [native iOS](https://github.com/stripe/stripe-ios) and [Android](https://github.com/stripe/stripe-android) SDKs. To install Stripe’s React Native SDK, run one of the following commands in your project’s directory (depending on which package manager you use):

```bash
yarn add @stripe/stripe-react-native
```

```bash
npm install @stripe/stripe-react-native
```

Next, install some other necessary dependencies:

- For iOS, navigate to the **ios** directory and run `pod install` to ensure that you also install the required native dependencies.
- For Android, there are no more dependencies to install.

We recommend following the [official TypeScript guide](https://reactnative.dev/docs/typescript#adding-typescript-to-an-existing-project) to add TypeScript support.

### Stripe initialization

To initialize Stripe in your React Native app, either wrap your payment screen with the `StripeProvider` component, or use the `initStripe` initialization method. Only the API [publishable key](https://docs.stripe.com/keys.md#obtain-api-keys) in `publishableKey` is required. The following example shows how to initialize Stripe using the `StripeProvider` component.

```jsx
import { useState, useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

function App() {
  const [publishableKey, setPublishableKey] = useState('');

  const fetchPublishableKey = async () => {
    const key = await fetchKey(); // fetch key from your server here
    setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      {/* Your app code here */}
    </StripeProvider>
  );
}
```

Use your API [test keys](https://docs.stripe.com/keys.md#obtain-api-keys) while you test and develop, and your [live mode](https://docs.stripe.com/keys.md#test-live-modes) keys when you publish your app.

## Enable payment methods

## Add an endpoint

## Collect payment details

Before displaying the mobile Payment Element, your checkout page should:

- Show the products being purchased and the total amount
- Collect any required shipping information
- Include a checkout button to present Stripe’s UI

In the checkout of your app, make a network request to the backend endpoint you created in the previous step and call `initPaymentSheet` from the `useStripe` hook.

```javascript
export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {
      paymentIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Jane Doe',
      }
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    // see below
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

When your customer taps the **Checkout** button, call `presentPaymentSheet()` to open the sheet. After the customer completes the payment, the sheet is dismissed and the promise resolves with an optional `StripeError<PaymentSheetError>`.

```javascript
export default function CheckoutScreen() {
  // continued from above

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
    }
  };

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

## Set up a return URL (iOS only)

When a customer exits your app (for example to authenticate in Safari or their banking app), provide a way for them to automatically return to your app. Many payment method types _require_ a return URL. If you don’t provide one, we can’t present payment methods that require a return URL to your users, even if you’ve enabled them.

To provide a return URL:

1. [Register](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme) a custom URL. Universal links aren’t supported.
1. [Configure](https://reactnative.dev/docs/linking) your custom URL.
1. Set up your root component to forward the URL to the Stripe SDK as shown below.

If you’re using Expo, [set your scheme](https://docs.expo.io/guides/linking/#in-a-standalone-app) in the `app.json` file.

```jsx
import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function MyApp() {
  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <View>
      <AwesomeAppComponent />
    </View>
  );
}
```

For more information on native URL schemes, refer to the [Android](https://developer.android.com/training/app-links/deep-linking) and [iOS](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app) docs.

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable Link

Enable Link in your [Payment Method settings](https://dashboard.stripe.com/settings/payment_methods) to allow your customers to securely save and reuse their payment information using Link’s one-click express checkout button.

### Pass your customer’s email to the Mobile Payment Element

Link authenticates a customer using their email address. Stripe recommends prefilling as much information as possible to streamline the checkout process.

## Enable Apple Pay

### Register for an Apple Merchant ID

Obtain an Apple Merchant ID by [registering for a new identifier](https://developer.apple.com/account/resources/identifiers/add/merchant) on the Apple Developer website.

Fill out the form with a description and identifier. Your description is for your own records and you can modify it in the future. Stripe recommends using the name of your app as the identifier (for example, `merchant.com.{{YOUR_APP_NAME}}`).

### Create a new Apple Pay certificate

Create a certificate for your app to encrypt payment data.

Go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard, click **Add new application**, and follow the guide.

Download a Certificate Signing Request (CSR) file to get a secure certificate from Apple that allows you to use Apple Pay.

One CSR file must be used to issue exactly one certificate. If you switch your Apple Merchant ID, you must go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard to obtain a new CSR and certificate.

### Integrate with Xcode

Add the Apple Pay capability to your app. In Xcode, open your project settings, click the **Signing & Capabilities** tab, and add the **Apple Pay** capability. You might be prompted to log in to your developer account at this point. Select the merchant ID you created earlier, and your app is ready to accept Apple Pay.

![](images/mobile/ios/xcode.png)
Enable the Apple Pay capability in Xcode


### Add Apple Pay

In accordance with [Apple’s guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) for recurring payments, you must also set a `cardItems` that includes a [RecurringCartSummaryItem](https://stripe.dev/stripe-react-native/api-reference/modules/ApplePay.html#RecurringCartSummaryItem) with the amount you intend to charge (for example, “$59.95 a month”).

You can also adopt [merchant tokens](https://developer.apple.com/apple-pay/merchant-tokens/) by setting the `request` with its `type` set to `PaymentRequestType.Recurring`

To learn more about how to use recurring payments with Apple Pay, see [Apple’s PassKit documentation](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

### Order tracking

To add [order tracking](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) information in iOS 16 or later, configure a `setOrderTracking` callback function. Stripe calls your implementation after the payment is complete, but before iOS dismisses the Apple Pay sheet.

In your implementation of `setOrderTracking` callback function, fetch the order details from your server for the completed order, and pass the details to the provided `completion` function.

To learn more about order tracking, see [Apple’s Wallet Orders documentation](https://developer.apple.com/documentation/walletorders).

## Enable Google Pay

### Set up your integration

To use Google Pay, first enable the Google Pay API by adding the following to the `<application>` tag of your **AndroidManifest.xml**:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

For more details, see Google Pay’s [Set up Google Pay API](https://developers.google.com/pay/api/android/guides/setup) for Android.

### Add Google Pay

## Enable card scanning (iOS only)

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

## Customize the sheet

### Appearance

Customize colors, fonts, and so on to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=react-native).

### Merchant display name

Specify a customer-facing business name by setting `merchantDisplayName`. By default, this is your app’s name.

### Dark mode

On Android, set light or dark mode on your app:

```
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

## Handle user logout

## Complete payment in your UI

You can present Payment Sheet to only collect payment method details and then later call a `confirm` method to complete payment in your app’s UI. This is useful if you have a custom buy button or require additional steps after payment details are collected.

![](images/mobile/payment-sheet/react-native-multi-step.png)

A sample integration is [available on our GitHub](https://github.com/stripe/stripe-react-native/blob/master/example/src/screens/PaymentsUICustomScreen.tsx).

1. First, call `initPaymentSheet` and pass `customFlow: true`. `initPaymentSheet` resolves with an initial payment option containing an image and label representing the customer’s payment method. Update your UI with these details.

```javascript
const {
  initPaymentSheet,
  presentPaymentSheet,
  confirmPaymentSheetPayment,
} = useStripe()

const { error, paymentOption } = await initPaymentSheet({
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  paymentIntentClientSecret: paymentIntent,
  customFlow: true,
  merchantDisplayName: 'Example Inc.',
});
// Update your UI with paymentOption
```

2. Use `presentPaymentSheet` to collect payment details. When the customer finishes, the sheet dismisses itself and resolves the promise. Update your UI with the selected payment method details.

```javascript
const { error, paymentOption } = await presentPaymentSheet();
```

3. Use `confirmPaymentSheetPayment` to confirm the payment. This resolves with the result of the payment.

```javascript
const { error } = await confirmPaymentSheetPayment();

if (error) {
  Alert.alert(`Error code: ${error.code}`, error.message);
} else {
  Alert.alert(
    'Success',
    'Your order is confirmed!'
  );
}
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

# Plugins

> This is a Plugins for when platform is plugins. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=plugins.

Collect Stripe payments in whichever publishing or e-commerce platform you use, with a Stripe plugin created by our partners. The Stripe developer community uses Stripe’s APIs to create plugins and extensions.

If you use a third-party platform to build and maintain a website, you can add Stripe payments with a plugin.

All plugins on this page are ready for *Strong Customer Authentication* (SCA).

## Get started


Check out our full list of [partners](https://stripe.partners) for a solution to your use case.

# Accept a payment

Securely accept payments online.

Build a payment form or use a prebuilt checkout page to start accepting online payments.

# Stripe-hosted page

> This is a Stripe-hosted page for when platform is web and ui is stripe-hosted. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=stripe-hosted.

Redirect to a Stripe-hosted payment page using [Stripe Checkout](https://docs.stripe.com/payments/checkout.md). See how this integration [compares to Stripe’s other integration types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

Redirect to Stripe-hosted payment page

- 20 preset fonts
- 3 preset border radius
- Custom background and border color
- Custom logo

Try it out

## Redirect your customer to Stripe Checkout

Add a checkout button to your website that calls a server-side endpoint to create a [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md).

You can also create a Checkout Session for an [existing customer](https://docs.stripe.com/payments/existing-customers.md?platform=web&ui=stripe-hosted), allowing you to prefill Checkout fields with known contact information and unify your purchase history for that customer.

```html
<html>
  <head>
    <title>Buy cool new product</title>
  </head>
  <body>
    <!-- Use action="/create-checkout-session.php" if your server is PHP based. -->
    <form action="/create-checkout-session" method="POST">
      <button type="submit">Checkout</button>
    </form>
  </body>
</html>
```

A Checkout Session is the programmatic representation of what your customer sees when they’re redirected to the payment form. You can configure it with options such as:

* [Line items](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-line_items) to charge
* Currencies to use

You must populate `success_url` with the URL value of a page on your website that Checkout returns your customer to after they complete the payment. You can optionally also provide a `cancel_url` value of a page on your website that Checkout returns your customer to if they terminate the payment process before completion.

Checkout Sessions expire 24 hours after creation by default.

After creating a Checkout Session, redirect your customer to the [URL](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-url) returned in the response.

```ruby
\# This example sets up an endpoint using the Sinatra framework.


require 'json'
require 'sinatra'
require 'stripe'
<<setup key>>

post '/create-checkout-session' do
  session = Stripe::Checkout::Session.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    # These placeholder URLs will be replaced in a following step.
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
  })

  redirect session.url, 303
end
```

```python
\# This example sets up an endpoint using the Flask framework.
# Watch this video to get started: https://youtu.be/7Ul1vfmsDck.

import os
import stripe

from flask import Flask, redirect

app = Flask(__name__)

stripe.api_key = '<<secret key>>'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
  session = stripe.checkout.Session.create(
    line_items=[{
      'price_data': {
        'currency': 'usd',
        'product_data': {
          'name': 'T-shirt',
        },
        'unit_amount': 2000,
      },
      'quantity': 1,
    }],
    mode='payment',
    success_url='http://localhost:4242/success',
    cancel_url='http://localhost:4242/cancel',
  )

  return redirect(session.url, code=303)

if __name__== '__main__':
    app.run(port=4242)
```

```php
<?php

require 'vendor/autoload.php';

$stripe = new \Stripe\StripeClient('<<secret key>>');

$checkout_session = $stripe->checkout->sessions->create([
  'line_items' => [[
    'price_data' => [
      'currency' => 'usd',
      'product_data' => [
        'name' => 'T-shirt',
      ],
      'unit_amount' => 2000,
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'success_url' => 'http://localhost:4242/success',
  'cancel_url' => 'http://localhost:4242/cancel',
]);

header("HTTP/1.1 303 See Other");
header("Location: " . $checkout_session->url);
?>
```

```java
import java.util.HashMap;
import java.util.Map;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);
    Stripe.apiKey = "<<secret key>>";

    post("/create-checkout-session", (request, response) -> {

      SessionCreateParams params =
        SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setSuccessUrl("http://localhost:4242/success")
          .setCancelUrl("http://localhost:4242/cancel")
          .addLineItem(
          SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
              SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(2000L)
                .setProductData(
                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                    .setName("T-shirt")
                    .build())
                .build())
            .build())
          .build();

      Session session = Session.create(params);

      response.redirect(session.getUrl(), 303);
      return "";
    });
  }
}
```

```javascript
// This example sets up an endpoint using the Express framework.

const express = require('express');
const app = express();
const stripe = require('stripe')('<<secret key>>')

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:4242/success',
    cancel_url: 'http://localhost:4242/cancel',
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
```

```go
package main

import (
  "net/http"

  "github.com/labstack/echo"
  "github.com/labstack/echo/middleware"
  "github.com/stripe/stripe-go/v{{golang.major_version}}"
  "github.com/stripe/stripe-go/v{{golang.major_version}}/checkout/session"
)

// This example sets up an endpoint using the Echo framework.
// Watch this video to get started: https://youtu.be/ePmEVBu8w6Y.

func main() {
  stripe.Key = "<<secret key>>"

  e := echo.New()
  e.Use(middleware.Logger())
  e.Use(middleware.Recover())

  e.POST("/create-checkout-session", createCheckoutSession)

  e.Logger.Fatal(e.Start("localhost:4242"))
}

func createCheckoutSession(c echo.Context) (err error) {
  params := &stripe.CheckoutSessionParams{
    Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
    LineItems: []*stripe.CheckoutSessionLineItemParams{
      &stripe.CheckoutSessionLineItemParams{
        PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
          Currency: stripe.String("usd"),
          ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
            Name: stripe.String("T-shirt"),
          },
          UnitAmount: stripe.Int64(2000),
        },
        Quantity: stripe.Int64(1),
      },
    },
    SuccessURL: stripe.String("http://localhost:4242/success"),
    CancelURL:  stripe.String("http://localhost:4242/cancel"),
  }

  s, _ := session.New(params)

  if err != nil {
    return err
  }

  return c.Redirect(http.StatusSeeOther, s.URL)
}
```

```dotnet
// This example sets up an endpoint using the ASP.NET MVC framework.
// Watch this video to get started: https://youtu.be/2-mMOB8MhmE.

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
  public class PaymentsController : Controller
  {
    public PaymentsController()
    {
      StripeConfiguration.ApiKey = "<<secret key>>";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession()
    {
      var options = new SessionCreateOptions
      {
        LineItems = new List<SessionLineItemOptions>
        {
          new SessionLineItemOptions
          {
            PriceData = new SessionLineItemPriceDataOptions
            {
              UnitAmount = 2000,
              Currency = "usd",
              ProductData = new SessionLineItemPriceDataProductDataOptions
              {
                Name = "T-shirt",
              },
            },
            Quantity = 1,
          },
        },
        Mode = "payment",
        SuccessUrl = "http://localhost:4242/success",
        CancelUrl = "http://localhost:4242/cancel",
      };

      var service = new SessionService();
      Session session = service.Create(options);

      Response.Headers.Add("Location", session.Url);
      return new StatusCodeResult(303);
    }
  }
}
```

### Payment methods

By default, Stripe enables cards and other common payment methods. You can turn individual payment methods on or off in the [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods). In Checkout, Stripe evaluates the currency and any restrictions, then dynamically presents the supported payment methods to the customer.

To see how your payment methods appear to customers, enter a transaction ID or set an order amount and currency in the Dashboard.

You can enable Apple Pay and Google Pay in your [payment methods settings](https://dashboard.stripe.com/settings/payment_methods). By default, Apple Pay is enabled and Google Pay is disabled. However, in some cases Stripe filters them out even when they’re enabled. We filter Google Pay if you [enable automatic tax](https://docs.stripe.com/tax/checkout.md) without collecting a shipping address.

Checkout’s Stripe-hosted pages don’t need integration changes to enable Apple Pay or Google Pay. Stripe handles these payments the same way as other card payments.

### Confirm your endpoint

Confirm your endpoint is accessible by starting your web server (for example, `localhost:4242`) and running the following command:

```bash
curl -X POST -is "http://localhost:4242/create-checkout-session" -d ""
```

You should see a response in your terminal that looks like this:

```bash
HTTP/1.1 303 See Other
Location: https://checkout.stripe.com/c/pay/cs_test_...
...
```

### Testing 

You should now have a working checkout button that redirects your customer to Stripe Checkout.

1. Click the checkout button.
1. You’re redirected to the Stripe Checkout payment form.

If your integration isn’t working:

1. Open the Network tab in your browser’s developer tools.
1. Click the checkout button and confirm it sent an XHR request to your server-side endpoint (`POST /create-checkout-session`).
1. Verify the request is returning a 200 status.
1. Use `console.log(session)` inside your button click listener to confirm the correct data returned.

## Show a success page

It’s important for your customer to see a success page after they successfully submit the payment form. Host this success page on your site.

Create a minimal success page:

```html
<html>
  <head><title>Thanks for your order!</title></head>
  <body>
    <h1>Thanks for your order!</h1>
    <p>
      We appreciate your business!
      If you have any questions, please email
      <a href="mailto:orders@example.com">orders@example.com</a>.
    </p>
  </body>
</html>
```

Next, update the Checkout Session creation endpoint to use this new page:

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions
        {
            PriceData = new Stripe.Checkout.SessionLineItemPriceDataOptions
            {
                Currency = "usd",
                ProductData = new Stripe.Checkout.SessionLineItemPriceDataProductDataOptions
                {
                    Name = "T-shirt",
                },
                UnitAmount = 2000,
            },
            Quantity = 1,
        },
    },
    Mode = "payment",
    SuccessUrl = "http://localhost:4242/success.html",
    CancelUrl = "http://localhost:4242/cancel.html",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
        Currency: stripe.String(string(stripe.CurrencyUSD)),
        ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
          Name: stripe.String("T-shirt"),
        },
        UnitAmount: stripe.Int64(2000),
      },
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  SuccessURL: stripe.String("http://localhost:4242/success.html"),
  CancelURL: stripe.String("http://localhost:4242/cancel.html"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .addLineItem(
      SessionCreateParams.LineItem.builder()
        .setPriceData(
          SessionCreateParams.LineItem.PriceData.builder()
            .setCurrency("usd")
            .setProductData(
              SessionCreateParams.LineItem.PriceData.ProductData.builder()
                .setName("T-shirt")
                .build()
            )
            .setUnitAmount(2000L)
            .build()
        )
        .setQuantity(1L)
        .build()
    )
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .setSuccessUrl("http://localhost:4242/success.html")
    .setCancelUrl("http://localhost:4242/cancel.html")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'http://localhost:4242/success.html',
  cancel_url: 'http://localhost:4242/cancel.html',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  line_items=[
    {
      "price_data": {"currency": "usd", "product_data": {"name": "T-shirt"}, "unit_amount": 2000},
      "quantity": 1,
    },
  ],
  mode="payment",
  success_url="http://localhost:4242/success.html",
  cancel_url="http://localhost:4242/cancel.html",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'line_items' => [
    [
      'price_data' => [
        'currency' => 'usd',
        'product_data' => ['name' => 'T-shirt'],
        'unit_amount' => 2000,
      ],
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'success_url' => 'http://localhost:4242/success.html',
  'cancel_url' => 'http://localhost:4242/cancel.html',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {name: 'T-shirt'},
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'http://localhost:4242/success.html',
  cancel_url: 'http://localhost:4242/cancel.html',
})
```

If you want to customize your success page, read the [custom success page](https://docs.stripe.com/payments/checkout/custom-success-page.md) guide.

### Testing

1. Click your checkout button.
1. Fill out the payment details with the test card information:
   - Enter `4242 4242 4242 4242` as the card number.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Click **Pay**.
1. You’re redirected to your new success page.

Next, find the new payment in the Stripe Dashboard. Successful payments appear in the Dashboard’s [list of payments](https://dashboard.stripe.com/payments). When you click a payment, it takes you to the payment details page. The **Checkout summary** section contains billing information and the list of items purchased, which you can use to manually fulfill the order.

## Handle post-payment events

Stripe sends a [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed) event when a customer completes a Checkout Session payment. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive and handle these events, which might trigger you to:

* Send an order confirmation email to your customer.
* Log the sale in a database.
* Start a shipping workflow.

Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your Checkout landing page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

Learn more in our [fulfillment guide for Checkout](https://docs.stripe.com/checkout/fulfillment.md).

Handle the following events when collecting payments with the Checkout:

| Event                                                                                                                                        | Description                                                                                | Action                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed)                             | Sent when a customer successfully completes a Checkout Session.                            | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_succeeded](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_succeeded) | Sent when a payment made with a delayed payment method, such as ACH direct debt, succeeds. | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_failed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_failed)       | Sent when a payment made with a delayed payment method, such as ACH direct debt, fails.    | Notify the customer of the failure and bring them back on-session to attempt payment again. |

## Test your integration

To test your Stripe-hosted payment form integration:

1. Create a Checkout Session.
1. Fill out the payment details with a method from the following table.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Click **Pay**. You’re redirected to your `success_url`.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like a Checkout summary with billing information and the list of purchased items. You can use this information to fulfill the order.

Learn more about [testing your integration](https://docs.stripe.com/testing.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

### Test cards

| Number              | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| 4242 4242 4242 4242 | Succeeds and immediately processes the payment.               |
| 4000 0000 0000 3220 | Requires 3D Secure 2 authentication for a successful payment. |
| 4000 0000 0000 9995 | Always fails with a decline code of `insufficient_funds`.     |

## Create products and prices

You can [set up your Checkout Session](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) to accept tips and donations, or sell pay-what-you-want products and services.

Before you create a Checkout Session, you can create *Products* and *Prices* upfront. Use products to represent different physical goods or levels of service, and *Prices* to represent each product’s pricing.

For example, you can create a T-shirt as a product with a price of 20 USD. This allows you to update and add prices without needing to change the details of your underlying products. You can either create products and prices with the Stripe Dashboard or API. Learn more about [how products and prices work](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

The API only requires a `name` to create a [Product](https://docs.stripe.com/api/products.md). Checkout displays the product `name`, `description`, and `images` that you supply.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new ProductCreateOptions { Name = "T-shirt" };
var service = new ProductService();
Product product = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.ProductParams{Name: stripe.String("T-shirt")};
result, err := product.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

ProductCreateParams params = ProductCreateParams.builder().setName("T-shirt").build();

Product product = Product.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

product = stripe.Product.create(name="T-shirt")
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$product = $stripe->products->create(['name' => 'T-shirt']);
```

```ruby
Stripe.api_key = '<<secret key>>'

product = Stripe::Product.create({name: 'T-shirt'})
```

Next, create a [Price](https://docs.stripe.com/api/prices.md) to define how much to charge for your product. This includes how much the product costs and what currency to use.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PriceCreateOptions
{
    Product = "<<product>>",
    UnitAmount = 2000,
    Currency = "usd",
};
var service = new PriceService();
Price price = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PriceParams{
  Product: stripe.String("<<product>>"),
  UnitAmount: stripe.Int64(2000),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
};
result, err := price.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PriceCreateParams params =
  PriceCreateParams.builder()
    .setProduct("<<product>>")
    .setUnitAmount(2000L)
    .setCurrency("usd")
    .build();

Price price = Price.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const price = await stripe.prices.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

price = stripe.Price.create(
  product="<<product>>",
  unit_amount=2000,
  currency="usd",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$price = $stripe->prices->create([
  'product' => '<<product>>',
  'unit_amount' => 2000,
  'currency' => 'usd',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

price = Stripe::Price.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
})
```

Copy products created in a sandbox to live mode so that you don’t need to re-create them. In the Product detail view in the Dashboard, click **Copy to live mode** in the upper right corner. You can only do this once for each product created in a sandbox. Subsequent updates to the test product aren’t reflected for the live product.

Make sure you’re in a sandbox by clicking **Sandboxes** within the Dashboard account picker. Next, define the items you want to sell. To create a new product and price:

- Navigate to the [Products](https://dashboard.stripe.com/test/products) section in the Dashboard.
- Click **Add product**.
- Select **One time** when setting the price.

Checkout displays the product name, description, and images that you supply.

Each price you create has an ID. When you create a Checkout Session, reference the price ID and quantity. If you’re selling in multiple currencies, make your Price *multi-currency*. Checkout automatically [determines the customer’s local currency](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) and presents that currency if the Price supports it.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    SuccessUrl = "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
    CancelUrl = "https://example.com/cancel",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  SuccessURL: stripe.String("https://example.com/success?session_id={CHECKOUT_SESSION_ID}"),
  CancelURL: stripe.String("https://example.com/cancel"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setSuccessUrl("https://example.com/success?session_id={CHECKOUT_SESSION_ID}")
    .setCancelUrl("https://example.com/cancel")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  success_url="https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url="https://example.com/cancel",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'success_url' => 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  'cancel_url' => 'https://example.com/cancel',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
})
```

## Prefill customer data

If you’ve already collected your customer’s email and want to prefill it in the Checkout Session for them, pass [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) when creating a Checkout Session.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    CustomerEmail = "customer@example.com",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "<<price>>", Quantity = 1 },
    },
    Mode = "payment",
    SuccessUrl = "https://example.com/success",
    CancelUrl = "https://example.com/cancel",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  CustomerEmail: stripe.String("customer@example.com"),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("<<price>>"),
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  SuccessURL: stripe.String("https://example.com/success"),
  CancelURL: stripe.String("https://example.com/cancel"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setCustomerEmail("customer@example.com")
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("<<price>>").setQuantity(1L).build()
    )
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .setSuccessUrl("https://example.com/success")
    .setCancelUrl("https://example.com/cancel")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  customer_email="customer@example.com",
  line_items=[{"price": "<<price>>", "quantity": 1}],
  mode="payment",
  success_url="https://example.com/success",
  cancel_url="https://example.com/cancel",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'customer_email' => 'customer@example.com',
  'line_items' => [
    [
      'price' => '<<price>>',
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'success_url' => 'https://example.com/success',
  'cancel_url' => 'https://example.com/cancel',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
})
```

## Save payment method details

By default, payment methods used to make a one-time payment with Checkout aren’t available for future use.

### Save payment methods to charge them off-session

You can set Checkout to save payment methods used to make a one-time payment by passing the [payment_intent_data.setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) argument. This is useful if you need to capture a payment method on-file to use for future fees, such as cancellation or no-show fees.

If you use Checkout in `subscription` mode, Stripe automatically saves the payment method to charge it for subsequent payments. Card payment methods saved to customers using either `setup_future_usage` or `subscription` mode don’t appear for return purchases in Checkout (more on this below). We recommend using [custom text](https://docs.stripe.com/payments/checkout/customization/policies.md) to link out to any relevant terms regarding the usage of saved payment information.

Global privacy laws are complicated and nuanced. We recommend contacting your legal and privacy team prior to implementing [setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) because it might implicate your existing privacy compliance framework. Refer to [the guidance issued by the European Protection Board](https://edpb.europa.eu/system/files/2021-05/recommendations022021_on_storage_of_credit_card_data_en_1.pdf) to learn more about saving payment details.

### Save payment methods to prefill them in Checkout

By default, Checkout uses [Link](https://docs.stripe.com/payments/checkout/customization/behavior.md#link) to provide your customers with the option to securely save and reuse their payment information. If you prefer to manage payment methods yourself, use [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) when creating a Checkout Session to let your customers save their payment methods for future purchases in Checkout.

Passing this parameter in either [payment](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) or [subscription](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) mode displays an optional checkbox to let customers explicitly save their payment method for future purchases. When customers check this checkbox, Checkout saves the payment method with [allow_redisplay: always](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay). Checkout uses this parameter to determine whether a payment method can be prefilled on future purchases. When using `saved_payment_method_options.payment_method_save`, you don’t need to pass in `setup_future_usage` to save the payment method.

Using [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) requires a `Customer`. To save a new customer, set the Checkout Session’s [customer_creation](https://docs.stripe.com/api/checkout/sessions/create.md) to `always`. Otherwise, the session doesn’t save the customer or the payment method.

If `payment_method_save` isn’t passed in or if the customer doesn’t agree to save the payment method, Checkout still saves payment methods created in `subscription` mode or using `setup_future_usage`. These payment methods have an `allow_redisplay` value of `limited`, which prevents them from being prefilled for returning purchases and allows you to comply with card network rules and data protection regulations. Learn how to [change the default behavior enabled by these modes](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout) and how to change or override `allow_redisplay` behavior.

You can use Checkout to save cards and other payment methods to charge them off-session, but Checkout only prefills saved cards. Learn how to [prefill saved cards](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout). To save a payment method without an initial payment, [use Checkout in setup mode](https://docs.stripe.com/payments/save-and-reuse.md?platform=checkout).

## Separate authorization and capture

Stripe supports two-step card payments so you can first authorize a card, then capture funds later. When Stripe authorizes a payment, the card issuer guarantees the funds and places a hold for the payment amount on the customer’s card. You then have a certain amount of time to capture the funds, [depending on the card](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations)). If you don’t capture the payment before the authorization expires, the payment is cancelled and the issuer releases the held funds.

Separating authorization and capture is useful if you need to take additional actions between confirming that a customer is able to pay and collecting their payment. For example, if you’re selling stock-limited items, you may need to confirm that an item purchased by your customer using Checkout is still available before capturing their payment and fulfilling the purchase. Accomplish this using the following workflow:

1. Confirm that Stripe authorized the customer’s payment method.
1. Consult your inventory management system to confirm that the item is still available.
1. Update your inventory management system to indicate that a customer has purchased the item.
1. Capture the customer’s payment.
1. Inform your customer whether their purchase was successful on your confirmation page.

To indicate that you want to separate authorization and capture, you must set the value of [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) to `manual` when creating the Checkout Session. This instructs Stripe to only authorize the amount on the customer’s card.

To capture an uncaptured payment, you can use either the [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) or the [capture](https://docs.stripe.com/api/payment_intents/capture.md) endpoint. Programmatically capturing payments requires access to the PaymentIntent created during the Checkout Session, which you can get from the [Session](https://docs.stripe.com/api/payment_intents/capture.md) object.

## Customer account management

Let your customers [manage](https://docs.stripe.com/customer-management.md) their own accounts by sharing a link to your *customer portal*. The customer portal lets customers log in with their email to manage subscriptions, update payment methods, and so on.

## See Also

- [Add discounts](https://docs.stripe.com/payments/checkout/discounts.md)
- [Collect taxes](https://docs.stripe.com/payments/checkout/taxes.md)
- [Collect tax IDs](https://docs.stripe.com/tax/checkout/tax-ids.md)
- [Add shipping](https://docs.stripe.com/payments/collect-addresses.md?payment-ui=checkout)
- [Customize your branding](https://docs.stripe.com/payments/checkout/customization.md)
- [Customize your success page](https://docs.stripe.com/payments/checkout/custom-success-page.md)

# Embedded form

> This is a Embedded form for when platform is web and ui is embedded-form. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=embedded-form.

Embed a prebuilt payment form on your site using [Stripe Checkout](https://docs.stripe.com/payments/checkout.md). See how this integration [compares to Stripe’s other integration types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

Embed prebuilt payment form on your site

- 20 preset fonts
- 3 preset border radius
- Custom background and border color
- Custom logo

Use the [branding settings](https://dashboard.stripe.com/settings/branding/checkout) in the Stripe Dashboard to match Checkout to your site design.

## Create a Checkout Session

From your server, create a *Checkout Session* and set the [ui_mode](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-ui_mode) to `embedded`. You can configure the [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md) with [line items](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-line_items) to include and options such as [currency](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-currency).

You can also create a Checkout Session for an [existing customer](https://docs.stripe.com/payments/existing-customers.md?platform=web&ui=stripe-hosted), allowing you to prefill Checkout fields with known contact information and unify your purchase history for that customer.

To return customers to a custom page that you host on your website, specify that page’s URL in the [return_url](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-return_url) parameter. Include the `{CHECKOUT_SESSION_ID}` template variable in the URL to retrieve the session’s status on the return page. Checkout automatically substitutes the variable with the Checkout Session ID before redirecting.

Read more about [configuring the return page](https://docs.stripe.com/payments/accept-a-payment.md?platform=web&ui=embedded-form#return-page) and other options for [customizing redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-form).

After you create the Checkout Session, use the `client_secret` returned in the response to [mount Checkout](#mount-checkout).

```ruby
\# This example sets up an endpoint using the Sinatra framework.
# To learn more about Sinatra, watch this video: https://youtu.be/8aA9Enb8NVc.
require 'json'
require 'sinatra'
require 'stripe'
<<setup key>>

post '/create-checkout-session' do
  session = Stripe::Checkout::Session.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}'
  })

  {clientSecret: session.client_secret}.to_json
end
```

```python
\# This example sets up an endpoint using the Flask framework.
# To learn more about Flask, watch this video: https://youtu.be/7Ul1vfsmsDck.
import os
import stripe
from flask import Flask, redirect

app = Flask(__name__)

stripe.api_key = '<<secret key>>'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
  session = stripe.checkout.Session.create(
    line_items = [{
      'price_data': {
        'currency': 'usd',
        'product_data': {
          'name': 'T-shirt',
        },
        'unit_amount': 2000,
      },
      'quantity': 1,
    }],
    mode = 'payment',
    ui_mode = 'embedded',
    return_url = 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}',
  )

  return jsonify(clientSecret=session.client_secret)

if __name__ == '__main__':
  app.run(port=4242)
```

```php
<?php

require 'vendor/autoload.php';

$stripe = new \Stripe\StripeClient([
  "api_key" => '<<secret key>>'
]);

$checkout_session = $stripe->checkout->sessions->create([
  'line_items' => [[
    'price_data' => [
      'currency' => 'usd',
      'product_data' => [
        'name' => 'T-shirt',
      ],
      'unit_amount' => 2000,
    ],
    'quantity' => 1,
  ]],
  'mode' => 'payment',
  'ui_mode' => 'embedded',
  'return_url' => 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}',
]);

  echo json_encode(array('clientSecret' => $checkout_session->client_secret));
?>
```

```java
import java.util.HashMap;
import java.util.Map;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;
import com.google.gson.Gson;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);
    Stripe.apiKey = "<<secret key>>";

    Gson gson = new Gson();

    post("/create-checkout-session", (request, response) -> {

      SessionCreateParams params =
        SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
          .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
          .addLineItem(
          SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
              SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(2000L)
                .setProductData(
                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                    .setName("T-shirt")
                    .build())
                .build())
            .build())
          .build();

      Session session = Session.create(params);

      Map<String, String> map = new HashMap();
      map.put("clientSecret", session.getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString());

      return map;
    }, gson::toJson);
  }
}
```

```javascript
// This example sets up an endpoint using the Express framework.
const express = require('express');
const app = express();

const stripe = require('stripe')('<<secret key>>');

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}'
  });

  res.send({clientSecret: session.client_secret});
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
```

```go
package main

import (
  "net/http"

  "github.com/labstack/echo"
  "github.com/labstack/echo/middleware"
  "github.com/stripe/stripe-go/v{{golang.major_version}}"
  "github.com/stripe/stripe-go/v{{golang.major_version}}/checkout/session"
)

// This example sets up an endpoint using the Echo framework.
// To learn more about Echo, watch this video: https://youtu.be/ePmEVBu8w6Y.

func main() {
  stripe.Key = "<<secret key>>"

  e := echo.New()
  e.Use(middleware.Logger())
  e.Use(middleware.Recover())

  e.POST("/create-checkout-session", createCheckoutSession)

  e.Logger.Fatal(e.Start("localhost:4242"))
}

type CheckoutData struct {
  ClientSecret string `json:"clientSecret"`
}

func createCheckoutSession(c echo.Context) (err error) {
  params := &stripe.CheckoutSessionParams{
    Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
    UIMode: stripe.String("embedded"),
    ReturnURL: stripe.String("https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}"),
    LineItems: []*stripe.CheckoutSessionLineItemParams{
      &stripe.CheckoutSessionLineItemParams{
        PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
          Currency: stripe.String("usd"),
          ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
            Name: stripe.String("T-shirt"),
          },
          UnitAmount: stripe.Int64(2000),
        },
        Quantity: stripe.Int64(1),
      },
    },
  }

  s, _ := session.New(params)

  if err != nil {
    return err
  }

  data := CheckoutData{
    ClientSecret: s.ClientSecret,
  }

  return c.JSON(http.StatusOK, data)
}
```

```dotnet
// This example sets up an endpoint using the ASP.NET MVC framework.
// To learn more about ASP.NET MVC, watch this video: https://youtu.be/2-mMOB8MhmE.

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
  public class PaymentsController : Controller
  {
    public PaymentsController()
    {
      StripeConfiguration.ApiKey = "<<secret key>>";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession()
    {
      var options = new SessionCreateOptions
      {
        LineItems = new List<SessionLineItemOptions>
        {
          new SessionLineItemOptions
          {
            PriceData = new SessionLineItemPriceDataOptions
            {
              UnitAmount = 2000,
              Currency = "usd",
              ProductData = new SessionLineItemPriceDataProductDataOptions
              {
                Name = "T-shirt",
              },
            },
            Quantity = 1,
          },
        },
        Mode = "payment",
        UiMode = "embedded",
        ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
      };

      var service = new SessionService();
      Session session = service.Create(options);

      return Json(new {clientSecret = session.ClientSecret});
    }
  }
}
```

## Mount Checkout

Checkout is available as part of [Stripe.js](https://docs.stripe.com/js). Include the Stripe.js script on your page by adding it to the head of your HTML file. Next, create an empty DOM node (container) to use for mounting.

```html
<head>
  <script src="https://js.stripe.com/basil/stripe.js"></script>
</head>
<body>
  <div id="checkout">
    <!-- Checkout will insert the payment form here -->
  </div>
</body>
```

Initialize Stripe.js with your publishable API key.

Create an asynchronous `fetchClientSecret` function that makes a request to your server to create the Checkout Session and retrieve the client secret. Pass this function into `options` when you create the Checkout instance:

```javascript
// Initialize Stripe.js

initialize();

// Fetch Checkout Session and retrieve the client secret
async function initialize() {
  const fetchClientSecret = async () => {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  // Initialize Checkout
  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}
```

Install [react-stripe-js](https://docs.stripe.com/sdks/stripejs-react.md) and the Stripe.js loader from npm:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

To use the Embedded Checkout component, create an `EmbeddedCheckoutProvider`. Call `loadStripe` with your publishable API key and pass the returned `Promise` to the provider.

Create an asynchronous `fetchClientSecret` function that makes a request to your server to create the Checkout Session and retrieve the client secret. Pass this function into the `options` prop accepted by the provider.

```jsx
import * as React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_123');

const App = () => {
  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("/create-checkout-session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const options = {fetchClientSecret};

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
```

Checkout renders in an iframe that securely sends payment information to Stripe over an HTTPS connection.

Avoid placing Checkout within another iframe because some payment methods require redirecting to another page for payment confirmation.

### Customize appearance

Customize Checkout to match the design of your site by setting the background color, button color, border radius, and fonts in your account’s [branding settings](https://dashboard.stripe.com/settings/branding).

By default, Checkout renders with no external padding or margin. We recommend using a container element such as a div to apply your desired margin (for example, 16px on all sides).

## Show a return page

After your customer attempts payment, Stripe redirects them to a return page that you host on your site. When you created the Checkout Session, you specified the URL of the return page in the [return_url](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-return_url) parameter. Read more about other options for [customizing redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-form).

When rendering your return page, retrieve the Checkout Session status using the Checkout Session ID in the URL. Handle the result according to the session status as follows:

- `complete`: The payment succeeded. Use the information from the Checkout Session to render a success page.
- `open`: The payment failed or was canceled. Remount Checkout so that your customer can try again.

```ruby
get '/session-status' do
  session = Stripe::Checkout::Session.retrieve(params[:session_id])

  {status: session.status, customer_email:  session.customer_details.email}.to_json
end
```

```python
@app.route('/session-status', methods=['GET'])
def session_status():
  session = stripe.checkout.Session.retrieve(request.args.get('session_id'))

  return jsonify(status=session.status, customer_email=session.customer_details.email)
```

```php
try {
  // retrieve JSON from POST body
  $jsonStr = file_get_contents('php://input');
  $jsonObj = json_decode($jsonStr);

  $session = $stripe->checkout->sessions->retrieve($jsonObj->session_id);

  echo json_encode(['status' => $session->status, 'customer_email' => $session->customer_details->email]);
  http_response_code(200);
} catch (Error $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
```

```java
get("/session-status", (request, response) -> {
      Session session = Session.retrieve(request.queryParams("session_id"));

      Map<String, String> map = new HashMap();
      map.put("status", session.getRawJsonObject().getAsJsonPrimitive("status").getAsString());
      map.put("customer_email", session.getRawJsonObject().getAsJsonObject("customer_details").getAsJsonPrimitive("email").getAsString());

      return map;
    }, gson::toJson);
```

```javascript
app.get('/session_status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_details.email
  });
});
```

```go
func retrieveCheckoutSession(w http.ResponseWriter, r *http.Request) {
  s, _ := session.Get(r.URL.Query().Get("session_id"), nil)

  writeJSON(w, struct {
    Status string `json:"status"`
    CustomerEmail string `json:"customer_email"`
  }{
    Status: string(s.Status),
    CustomerEmail: string(s.CustomerDetails.Email),
  })
}
```

```dotnet
[Route("session-status")]
[ApiController]
public class SessionStatusController : Controller
{
    [HttpGet]
    public ActionResult SessionStatus([FromQuery] string session_id)
    {
        var sessionService = new SessionService();
        Session session = sessionService.Get(session_id);

        return Json(new {status = session.Status,  customer_email = session.CustomerDetails.Email});
    }
}
```

```javascript
const session = await fetch(`/session_status?session_id=${session_id}`)
if (session.status == 'open') {
  // Remount embedded Checkout
} else if (session.status == 'complete') {
  // Show success page
  // Optionally use session.payment_status or session.customer_email
  // to customize the success page
}
```

#### Redirect-based payment methods

During payment, some payment methods redirect the customer to an intermediate page, such as a bank authorization page. When they complete that page, Stripe redirects them to your return page.

Learn more about [redirect-based payment methods and redirect behavior](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-form#redirect-based-payment-methods).

## Handle post-payment events

Stripe sends a [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed) event when a customer completes a Checkout Session payment. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive and handle these events, which might trigger you to:

* Send an order confirmation email to your customer.
* Log the sale in a database.
* Start a shipping workflow.

Listen for these events rather than waiting for your customer to be redirected back to your website. Triggering fulfillment only from your Checkout landing page is unreliable. Setting up your integration to listen for asynchronous events allows you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

Learn more in our [fulfillment guide for Checkout](https://docs.stripe.com/checkout/fulfillment.md).

Handle the following events when collecting payments with the Checkout:

| Event                                                                                                                                        | Description                                                                                | Action                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed)                             | Sent when a customer successfully completes a Checkout Session.                            | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_succeeded](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_succeeded) | Sent when a payment made with a delayed payment method, such as ACH direct debt, succeeds. | Send the customer an order confirmation and *fulfill* their order.                          |
| [checkout.session.async_payment_failed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_failed)       | Sent when a payment made with a delayed payment method, such as ACH direct debt, fails.    | Notify the customer of the failure and bring them back on-session to attempt payment again. |

## Test your integration

To test your embedded payment form integration:

1. Create an embedded Checkout Session and mount Checkout on your page.
1. Fill out the payment details with a method from the table below.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Click **Pay**. You’re redirected to your `return_url`.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like a Checkout summary with billing information and the list of purchased items. You can use this information to fulfill the order.

Learn more about [testing your integration](https://docs.stripe.com/testing.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Add more payment methods

By default, Checkout [supports many payment methods](https://docs.stripe.com/payments/payment-methods/integration-options.md#choose-how-to-add-payment-methods). You have to take additional steps to enable and display some methods, like Apple Pay, Google Pay, and buy now, pay later methods.

### Apple Pay and Google Pay

To accept payments from Apple Pay and Google Pay, you must:

* Enable them in your [payment methods settings](https://dashboard.stripe.com/settings/payment_methods). Apple Pay is enabled by default.
* Serve your application over HTTPS in development and production.
* [Register your domain](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).
* Serve your application over HTTPS in development and production. You can use a service like [ngrok](https://ngrok.com/) to serve your application for local testing.

In addition, a Checkout Session only displays the Apple Pay button to customers when _all_ of the following conditions are true:

- The customer’s device is running macOS version 17 or later or iOS version 17 or later.
- The customer is using the Safari browser.
- The customer has a valid card registered with Apple Pay.

A Checkout Session only displays the Google Pay button to customers when _all_ of the following conditions are true:

- The customer’s device is running Chrome 61 or newer.
- The customer has a valid card registered with Google Pay.

Stripe Checkout doesn’t support Apple Pay or Google Pay for Stripe accounts or customers in India. If your IP address is in India, you can’t test your Apple Pay or Google Pay integration, even if the Stripe account is outside India.

## Create products and prices

You can [set up your Checkout Session](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) to accept tips and donations, or sell pay-what-you-want products and services.

Before you create a Checkout Session, you can create *Products* and *Prices* upfront. Use products to represent different physical goods or levels of service, and *Prices* to represent each product’s pricing.

For example, you can create a T-shirt as a product with a price of 20 USD. This allows you to update and add prices without needing to change the details of your underlying products. You can either create products and prices with the Stripe Dashboard or API. Learn more about [how products and prices work](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

The API only requires a `name` to create a [Product](https://docs.stripe.com/api/products.md). Checkout displays the product `name`, `description`, and `images` that you supply.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new ProductCreateOptions { Name = "T-shirt" };
var service = new ProductService();
Product product = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.ProductParams{Name: stripe.String("T-shirt")};
result, err := product.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

ProductCreateParams params = ProductCreateParams.builder().setName("T-shirt").build();

Product product = Product.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

product = stripe.Product.create(name="T-shirt")
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$product = $stripe->products->create(['name' => 'T-shirt']);
```

```ruby
Stripe.api_key = '<<secret key>>'

product = Stripe::Product.create({name: 'T-shirt'})
```

Next, create a [Price](https://docs.stripe.com/api/prices.md) to define how much to charge for your product. This includes how much the product costs and what currency to use.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PriceCreateOptions
{
    Product = "<<product>>",
    UnitAmount = 2000,
    Currency = "usd",
};
var service = new PriceService();
Price price = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PriceParams{
  Product: stripe.String("<<product>>"),
  UnitAmount: stripe.Int64(2000),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
};
result, err := price.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PriceCreateParams params =
  PriceCreateParams.builder()
    .setProduct("<<product>>")
    .setUnitAmount(2000L)
    .setCurrency("usd")
    .build();

Price price = Price.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const price = await stripe.prices.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

price = stripe.Price.create(
  product="<<product>>",
  unit_amount=2000,
  currency="usd",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$price = $stripe->prices->create([
  'product' => '<<product>>',
  'unit_amount' => 2000,
  'currency' => 'usd',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

price = Stripe::Price.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
})
```

Copy products created in a sandbox to live mode so that you don’t need to re-create them. In the Product detail view in the Dashboard, click **Copy to live mode** in the upper right corner. You can only do this once for each product created in a sandbox. Subsequent updates to the test product aren’t reflected for the live product.

Make sure you’re in a sandbox by clicking **Sandboxes** within the Dashboard account picker. Next, define the items you want to sell. To create a new product and price:

- Navigate to the [Products](https://dashboard.stripe.com/test/products) section in the Dashboard.
- Click **Add product**.
- Select **One time** when setting the price.

Checkout displays the product name, description, and images that you supply.

Each price you create has an ID. When you create a Checkout Session, reference the price ID and quantity. If you’re selling in multiple currencies, make your Price *multi-currency*. Checkout automatically [determines the customer’s local currency](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) and presents that currency if the Price supports it.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    UiMode = "embedded",
    ReturnUrl = "https://example.com/return",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeEmbedded)),
  ReturnURL: stripe.String("https://example.com/return"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
    .setReturnUrl("https://example.com/return")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  ui_mode="embedded",
  return_url="https://example.com/return",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'ui_mode' => 'embedded',
  'return_url' => 'https://example.com/return',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
})
```

## Prefill customer data

If you’ve already collected your customer’s email and want to prefill it in the Checkout Session for them, pass [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) when creating a Checkout Session.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    CustomerEmail = "customer@example.com",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "<<price>>", Quantity = 1 },
    },
    Mode = "payment",
    UiMode = "embedded",
    ReturnUrl = "https://example.com/return",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  CustomerEmail: stripe.String("customer@example.com"),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("<<price>>"),
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeEmbedded)),
  ReturnURL: stripe.String("https://example.com/return"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setCustomerEmail("customer@example.com")
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("<<price>>").setQuantity(1L).build()
    )
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
    .setReturnUrl("https://example.com/return")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  customer_email="customer@example.com",
  line_items=[{"price": "<<price>>", "quantity": 1}],
  mode="payment",
  ui_mode="embedded",
  return_url="https://example.com/return",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'customer_email' => 'customer@example.com',
  'line_items' => [
    [
      'price' => '<<price>>',
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'ui_mode' => 'embedded',
  'return_url' => 'https://example.com/return',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '<<price>>',
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded',
  return_url: 'https://example.com/return',
})
```

## Save payment method details

By default, payment methods used to make a one-time payment with Checkout aren’t available for future use.

### Save payment methods to charge them off-session

You can set Checkout to save payment methods used to make a one-time payment by passing the [payment_intent_data.setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) argument. This is useful if you need to capture a payment method on-file to use for future fees, such as cancellation or no-show fees.

If you use Checkout in `subscription` mode, Stripe automatically saves the payment method to charge it for subsequent payments. Card payment methods saved to customers using either `setup_future_usage` or `subscription` mode don’t appear for return purchases in Checkout (more on this below). We recommend using [custom text](https://docs.stripe.com/payments/checkout/customization/policies.md) to link out to any relevant terms regarding the usage of saved payment information.

Global privacy laws are complicated and nuanced. We recommend contacting your legal and privacy team prior to implementing [setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage) because it might implicate your existing privacy compliance framework. Refer to [the guidance issued by the European Protection Board](https://edpb.europa.eu/system/files/2021-05/recommendations022021_on_storage_of_credit_card_data_en_1.pdf) to learn more about saving payment details.

### Save payment methods to prefill them in Checkout

By default, Checkout uses [Link](https://docs.stripe.com/payments/checkout/customization/behavior.md#link) to provide your customers with the option to securely save and reuse their payment information. If you prefer to manage payment methods yourself, use [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) when creating a Checkout Session to let your customers save their payment methods for future purchases in Checkout.

Passing this parameter in either [payment](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) or [subscription](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) mode displays an optional checkbox to let customers explicitly save their payment method for future purchases. When customers check this checkbox, Checkout saves the payment method with [allow_redisplay: always](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay). Checkout uses this parameter to determine whether a payment method can be prefilled on future purchases. When using `saved_payment_method_options.payment_method_save`, you don’t need to pass in `setup_future_usage` to save the payment method.

Using [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) requires a `Customer`. To save a new customer, set the Checkout Session’s [customer_creation](https://docs.stripe.com/api/checkout/sessions/create.md) to `always`. Otherwise, the session doesn’t save the customer or the payment method.

If `payment_method_save` isn’t passed in or if the customer doesn’t agree to save the payment method, Checkout still saves payment methods created in `subscription` mode or using `setup_future_usage`. These payment methods have an `allow_redisplay` value of `limited`, which prevents them from being prefilled for returning purchases and allows you to comply with card network rules and data protection regulations. Learn how to [change the default behavior enabled by these modes](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout) and how to change or override `allow_redisplay` behavior.

You can use Checkout to save cards and other payment methods to charge them off-session, but Checkout only prefills saved cards. Learn how to [prefill saved cards](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout). To save a payment method without an initial payment, [use Checkout in setup mode](https://docs.stripe.com/payments/save-and-reuse.md?platform=checkout).

## Customer account management

Let your customers [manage](https://docs.stripe.com/customer-management.md) their own accounts by sharing a link to your *customer portal*. The customer portal lets customers log in with their email to manage subscriptions, update payment methods, and so on.

## Separate authorization and capture

Stripe supports two-step card payments so you can first authorize a card, then capture funds later. When Stripe authorizes a payment, the card issuer guarantees the funds and places a hold for the payment amount on the customer’s card. You then have a certain amount of time to capture the funds, [depending on the card](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations)). If you don’t capture the payment before the authorization expires, the payment is cancelled and the issuer releases the held funds.

Separating authorization and capture is useful if you need to take additional actions between confirming that a customer is able to pay and collecting their payment. For example, if you’re selling stock-limited items, you may need to confirm that an item purchased by your customer using Checkout is still available before capturing their payment and fulfilling the purchase. Accomplish this using the following workflow:

1. Confirm that Stripe authorized the customer’s payment method.
1. Consult your inventory management system to confirm that the item is still available.
1. Update your inventory management system to indicate that a customer has purchased the item.
1. Capture the customer’s payment.
1. Inform your customer whether their purchase was successful on your confirmation page.

To indicate that you want to separate authorization and capture, you must set the value of [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) to `manual` when creating the Checkout Session. This instructs Stripe to only authorize the amount on the customer’s card.

To capture an uncaptured payment, you can use either the [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) or the [capture](https://docs.stripe.com/api/payment_intents/capture.md) endpoint. Programmatically capturing payments requires access to the PaymentIntent created during the Checkout Session, which you can get from the [Session](https://docs.stripe.com/api/payment_intents/capture.md) object.

## Order fulfillment

Learn how to [programmatically get a notification](https://docs.stripe.com/checkout/fulfillment.md) whenever a customer pays.

## See Also

- [Add discounts](https://docs.stripe.com/payments/checkout/discounts.md)
- [Collect taxes](https://docs.stripe.com/payments/checkout/taxes.md)
- [Collect tax IDs](https://docs.stripe.com/tax/checkout/tax-ids.md)
- [Add shipping](https://docs.stripe.com/payments/collect-addresses.md?payment-ui=checkout)
- [Customize your branding](https://docs.stripe.com/payments/checkout/customization.md)

# Embedded components

> This is a Embedded components for when platform is web and ui is embedded-components. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=embedded-components.

Build a checkout page on your website using [Stripe Elements](https://docs.stripe.com/payments/elements.md) and [Checkout Sessions](https://docs.stripe.com/api/checkout/sessions.md), an integration that manages tax, discounts, shipping rates, and more.

## Create a Checkout Session

Add an endpoint on your server that creates a [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md) and returns its [client secret](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-client_secret) to your front end. A Checkout Session represents your customer’s session as they pay for one-time purchases or subscriptions. Checkout Sessions expire 24 hours after creation.

```javascript
import express, {Express} from 'express';

const app: Express = express();

app.post('/create-checkout-session', async (req: Express.Request, res: Express.Response) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'custom',
    // The URL of your payment completion page
    return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}'
  });

  res.json({checkoutSessionClientSecret: session.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```javascript
const express = require('express');
const app = express();

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'custom',
    // The URL of your payment completion page
    return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}'
  });

  res.json({checkoutSessionClientSecret: session.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```ruby
require 'sinatra'
require 'stripe'

set :static, true
set :port, 4242

post '/create-checkout-session' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  session = Stripe::Checkout::Session.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {name: 'T-shirt'},
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ui_mode: 'custom',
    return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
  })

  {
    checkoutSessionClientSecret: session.client_secret,
  }.to_json
end
```

```php
$stripe->checkout->sessions->create([
  'line_items' => [
    [
      'price_data' => [
        'currency' => 'usd',
        'product_data' => ['name' => 'T-shirt'],
        'unit_amount' => 2000,
      ],
      'quantity' => 1,
    ],
  ],
  'mode' => 'payment',
  'ui_mode' => 'custom',
  'return_url' => 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
]);
```

```python
import json
import os
from flask import Flask, render_template, jsonify, request
app = Flask(__name__, static_folder='public',
            static_url_path='', template_folder='public')

@app.route('/create-checkout-session', methods=['POST'])
def checkout():
    try:
        session = stripe.checkout.Session.create(
          line_items=[
            {
              "price_data": {
                "currency": "usd",
                "product_data": {"name": "T-shirt"},
                "unit_amount": 2000,
              },
              "quantity": 1,
            },
          ],
          mode="payment",
          ui_mode="custom",
          # The URL of your payment completion page
          return_url="https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
        )
        return jsonify({
            'checkoutSessionClientSecret': session['client_secret']
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    app.run(port=4242)
```

```go
params := &stripe.CheckoutSessionParams{
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
        Currency: stripe.String(string(stripe.CurrencyUSD)),
        ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
          Name: stripe.String("T-shirt"),
        },
        UnitAmount: stripe.Int64(2000),
      },
      Quantity: stripe.Int64(1),
    },
  },
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
  ReturnURL: stripe.String("https://example.com/return?session_id={CHECKOUT_SESSION_ID}"),
};
result, err := session.New(params);
```

```dotnet
// This example sets up an endpoint using the ASP.NET MVC framework.
// To learn more about ASP.NET MVC, watch this video: https://youtu.be/2-mMOB8MhmE.

using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace server.Controllers
{
  public class PaymentsController : Controller
  {
    public PaymentsController()
    {
      StripeConfiguration.ApiKey = "<<secret key>>";
    }

    [HttpPost("create-checkout-session")]
    public ActionResult CreateCheckoutSession()
    {
      var options = new SessionCreateOptions
      {
        LineItems = new List<SessionLineItemOptions>
        {
          new SessionLineItemOptions
          {
            PriceData = new SessionLineItemPriceDataOptions
            {
              UnitAmount = 2000,
              Currency = "usd",
              ProductData = new SessionLineItemPriceDataProductDataOptions
              {
                Name = "T-shirt",
              },
            },
            Quantity = 1,
          },
        },
        Mode = "payment",
        UiMode = "custom",
        ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
      };

      var service = new SessionService();
      Session session = service.Create(options);

      return Json(new {checkoutSessionClientSecret = session.ClientSecret});
    }
  }
}
```

```java
import java.util.HashMap;
import java.util.Map;
import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;
import com.google.gson.Gson;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);
    Stripe.apiKey = "<<secret key>>";

    Gson gson = new Gson();

    post("/create-checkout-session", (request, response) -> {

      SessionCreateParams params =
        SessionCreateParams.builder()
          .setMode(SessionCreateParams.Mode.PAYMENT)
          .setUiMode(SessionCreateParams.UiMode.CUSTOM)
          .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
          .addLineItem(
          SessionCreateParams.LineItem.builder()
            .setQuantity(1L)
            .setPriceData(
              SessionCreateParams.LineItem.PriceData.builder()
                .setCurrency("usd")
                .setUnitAmount(2000L)
                .setProductData(
                  SessionCreateParams.LineItem.PriceData.ProductData.builder()
                    .setName("T-shirt")
                    .build())
                .build())
            .build())
          .build();

      Session session = Session.create(params);

      Map<String, String> map = new HashMap();
      map.put("checkoutSessionClientSecret", session.getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString());

      return map;
    }, gson::toJson);
  }
}
```

## Set up the front end

Include the Stripe.js script on your checkout page by adding it to the `head` of your HTML file. Always load Stripe.js directly from js.stripe.com to remain PCI compliant. Don’t include the script in a bundle or host a copy of it yourself.

You’ll need to update Stripe.js to `basil` from v3 by including the following script tag `<script src="https://js.stripe.com/basil/stripe.js"></script>`. Learn more about [Stripe.js versioning](https://docs.stripe.com/sdks/stripejs-versioning.md).

```html
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/basil/stripe.js"></script>
</head>
```

Stripe provides an npm package that you can use to load Stripe.js as a module. See the [project on GitHub](https://github.com/stripe/stripe-js). Version [7.0.0](https://www.npmjs.com/package/%40stripe/stripe-js/v/7.0.0) or later is required.

Initialize stripe.js.

```js
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = Stripe(
  '<<publishable key>>',
);
```

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry. You need at least version 3.6.0 for React Stripe.js and version 7.0.0 for the Stripe.js loader.

```bash
npm install --save @stripe/react-stripe-js@^3.6.0 @stripe/stripe-js@^7.0.0
```

Initialize a `stripe` instance on your front end with your publishable key.

```javascript
import {loadStripe} from '@stripe/stripe-js';
const stripe = loadStripe("<<publishable key>>");
```

## Initialize Checkout

Create a `fetchClientSecret` function. This function retrieves the client secret from your server and returns a promise that resolves with the client secret. Call [initCheckout](https://docs.stripe.com/js/custom_checkout/init), passing in `fetchClientSecret`. `initCheckout` returns a promise resolving to a [checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) instance.

The [checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) object acts as the foundation of your checkout page, containing data from the Checkout Session and methods to update the Session.

The object returned by [checkout.session()](https://docs.stripe.com/js/custom_checkout/session) contains your pricing information. We recommend reading and displaying the `total`, and `lineItems` from the session in your UI.

This lets you turn on new features with minimal code changes. For example, adding [manual currency prices](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) requires no UI changes if you display the `total`.

```javascript
const fetchClientSecret = () => {
  return fetch('/create-checkout-session', {method: 'POST'})
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret);
};
stripe.initCheckout({fetchClientSecret})
  .then((checkout) => {
    const checkoutContainer = document.getElementById('checkout-container');
    checkoutContainer.append(JSON.stringify(checkout.lineItems, null, 2));
    checkoutContainer.append(document.createElement('br'));
    checkoutContainer.append(`Total: ${checkout.session().total.total.amount}`);
  });
```

```html
<div id="checkout-container"></div>
```

Create a `fetchClientSecret` function to retrieve the client secret from your server and return a Promise that resolves with the client secret.

Wrap your application with the [CheckoutProvider](https://docs.stripe.com/js/custom_checkout/react/checkout_provider) component, passing in the `fetchClientSecret` function and the `stripe` instance.

Use the [useCheckout](https://docs.stripe.com/js/custom_checkout/react/use_checkout) hook in your components to get the [Checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) object, which contains data from the Checkout Session and methods to update the Session.

Use the `Checkout` object as the container for your prices. We recommend reading and displaying the `total` and `lineItems` from the `Checkout` object in your UI.

This lets you enable features with minimal code changes. For example, adding [manual currency prices](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) requires no UI changes if you display the `total`.

```jsx
import React from 'react';
import {CheckoutProvider} from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const fetchClientSecret = () => {
  return fetch('/create-checkout-session', {method: 'POST'})
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret)
};

const App = () => {
  return (
    <CheckoutProvider
      stripe={stripe}
      options={{fetchClientSecret}}
    >
      <CheckoutForm />
    </CheckoutProvider>
  );
};

export default App;
```

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  return (
    <pre>
      {JSON.stringify(checkout.lineItems, null, 2)}
      // A formatted total amount
      Total: {checkout.total.total.amount}
    </pre>
  )
};
```

## Collect customer email

If you already pass in an existing [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) or [Customer](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer) with a valid email set when creating the Checkout Session, you can skip this step.

If you implement your own email validation, you can pass in the validated email on [checkout.confirm](https://docs.stripe.com/js/custom_checkout/confirm) and skip this step.

Create an email input to collect your customer’s email address. Call [updateEmail](https://docs.stripe.com/js/custom_checkout/update_email) when your customer finishes the input to validate and save the email address.

Depending on the design of your checkout form, you can call `updateEmail` in the following ways:

* Directly before [submitting the payment](#submit-payment). You can also call `updateEmail` to validate earlier, such as on input blur.
* Before transitioning to the next step, such as clicking a **Save** button, if your form includes multiple steps.

```html
<input type="text" id="email" />
<div id="email-errors"></div>
```

```javascript
stripe.initCheckout({fetchClientSecret}).then((checkout) => {
  const emailInput = document.getElementById('email');
  const emailErrors = document.getElementById('email-errors');

  emailInput.addEventListener('input', () => {
    // Clear any validation errors
    emailErrors.textContent = '';
  });

  emailInput.addEventListener('blur', () => {
    const newEmail = emailInput.value;
    checkout.updateEmail(newEmail).then((result) => {
      if (result.error) {
        emailErrors.textContent = result.error.message;
      }
    });
  });
});
```

If you already pass in an existing [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) or [Customer](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer) with a valid email set when creating the Checkout Session, you can skip this step.

If you implement your own email validation, you can pass in the validated email on [confirm](https://docs.stripe.com/js/custom_checkout/react/confirm) and skip this step.

Create a component to collect your customer’s email address. Call [updateEmail](https://docs.stripe.com/js/custom_checkout/react/update_email) when your customer finishes the input to validate and save the email address.

Depending on the design of your checkout form, you can call `updateEmail` in the following ways:

* Directly before [submitting the payment](#submit-payment). You can also call `updateEmail` to validate earlier, such as on input blur.
* Before transitioning to the next step, such as clicking a **Save** button, if your form includes multiple steps.

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const EmailInput = () => {
  const checkout = useCheckout();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState(null);

  const handleBlur = () => {
    checkout.updateEmail(email).then((result) => {
      if (result.error) {
        setError(result.error);
      }
    })
  };

  const handleChange = (e) => {
    setError(null);
    setEmail(e.target.value);
  };
  return (
    <div>
      <input
        type="text"
        value={email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <div>{error.message}</div>}
    </div>
  );
};

export default EmailInput;
```

## Collect payment details

Collect payment details on the client with the [Payment Element](https://docs.stripe.com/payments/payment-element.md). The Payment Element is a prebuilt UI component that simplifies collecting payment details for a variety of payment methods.

First, create a container DOM element to mount the [Payment Element](https://docs.stripe.com/payments/payment-element.md). Then create an instance of the `Payment Element` using [checkout.createPaymentElement](https://docs.stripe.com/js/custom_checkout/create_payment_element) and mount it by calling [element.mount](https://docs.stripe.com/js/element/mount), providing either a CSS selector or the container DOM element.

```html
<div id="payment-element"></div>
```

```javascript
const paymentElement = checkout.createPaymentElement();
paymentElement.mount('#payment-element');
```

See the [Stripe.js docs](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options) to view what options are supported.

You can [customize the appearance](https://docs.stripe.com/payments/checkout/customization/appearance.md) of all Elements by passing [elementsOptions.appearance](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-elementsOptions-appearance) when initializing Checkout on the front end.

Mount the [Payment Element](https://docs.stripe.com/payments/payment-element.md) component within the [CheckoutProvider](https://docs.stripe.com/js/custom_checkout/react/checkout_provider).

```jsx
import React from 'react';
import {PaymentElement, useCheckout} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  return (
    <form>
      <PaymentElement options={{layout: 'accordion'}}/>
    </form>
  )
};

export default CheckoutForm;
```

See the [Stripe.js docs](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options) to view what options are supported.

You can [customize the appearance](https://docs.stripe.com/payments/checkout/customization/appearance.md) of all Elements by passing [elementsOptions.appearance](https://docs.stripe.com/js/custom_checkout/react/checkout_provider#custom_checkout_react_checkout_provider-options-elementsOptions-appearance) to the [CheckoutProvider](https://docs.stripe.com/js/custom_checkout/react/checkout_provider).

## Submit the payment

Render a **Pay** button that calls [confirm](https://docs.stripe.com/js/custom_checkout/confirm) from the [checkout](https://docs.stripe.com/js/custom_checkout/checkout_object) instance to submit the payment.

```html
<button id="pay-button">Pay</button>
<div id="confirm-errors"></div>
```

```js
stripe.initCheckout({fetchClientSecret}).then((checkout) => {
  const button = document.getElementById('pay-button');
  const errors = document.getElementById('confirm-errors');
  button.addEventListener('click', () => {
    // Clear any validation errors
    errors.textContent = '';

    checkout.confirm().then((result) => {
      if (result.type === 'error') {
        errors.textContent = result.error.message;
      }
    });
  });
});
```

Render a **Pay** button that calls [confirm](https://docs.stripe.com/js/custom_checkout/confirm) from [useCheckout](https://docs.stripe.com/js/custom_checkout/react/use_checkout) to submit the payment.

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const PayButton = () => {
  const {confirm} = useCheckout();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleClick = () => {
    setLoading(true);
    confirm().then((result) => {
      if (result.type === 'error') {
        setError(result.error)
      }
      setLoading(false);
    })
  };

  return (
    <div>
      <button disabled={loading} onClick={handleClick}>
        Pay
      </button>
      {error && <div>{error.message}</div>}
    </div>
  )
};

export default PayButton;
```

## Test your integration

1. Navigate to your checkout page.
1. Fill out the payment details with a payment method from the following table. For card payments:
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Submit the payment to Stripe.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like billing information and the list of purchased items. You can use this information to [fulfill the order](https://docs.stripe.com/checkout/fulfillment.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Create products and prices

You can [set up your Checkout Session](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) to accept tips and donations, or sell pay-what-you-want products and services.

Before you create a Checkout Session, you can create *Products* and *Prices* upfront. Use products to represent different physical goods or levels of service, and *Prices* to represent each product’s pricing.

For example, you can create a T-shirt as a product with a price of 20 USD. This allows you to update and add prices without needing to change the details of your underlying products. You can either create products and prices with the Stripe Dashboard or API. Learn more about [how products and prices work](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

The API only requires a `name` to create a [Product](https://docs.stripe.com/api/products.md). Checkout displays the product `name`, `description`, and `images` that you supply.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new ProductCreateOptions { Name = "T-shirt" };
var service = new ProductService();
Product product = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.ProductParams{Name: stripe.String("T-shirt")};
result, err := product.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

ProductCreateParams params = ProductCreateParams.builder().setName("T-shirt").build();

Product product = Product.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

product = stripe.Product.create(name="T-shirt")
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$product = $stripe->products->create(['name' => 'T-shirt']);
```

```ruby
Stripe.api_key = '<<secret key>>'

product = Stripe::Product.create({name: 'T-shirt'})
```

Next, create a [Price](https://docs.stripe.com/api/prices.md) to define how much to charge for your product. This includes how much the product costs and what currency to use.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PriceCreateOptions
{
    Product = "<<product>>",
    UnitAmount = 2000,
    Currency = "usd",
};
var service = new PriceService();
Price price = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PriceParams{
  Product: stripe.String("<<product>>"),
  UnitAmount: stripe.Int64(2000),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
};
result, err := price.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PriceCreateParams params =
  PriceCreateParams.builder()
    .setProduct("<<product>>")
    .setUnitAmount(2000L)
    .setCurrency("usd")
    .build();

Price price = Price.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const price = await stripe.prices.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

price = stripe.Price.create(
  product="<<product>>",
  unit_amount=2000,
  currency="usd",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$price = $stripe->prices->create([
  'product' => '<<product>>',
  'unit_amount' => 2000,
  'currency' => 'usd',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

price = Stripe::Price.create({
  product: '<<product>>',
  unit_amount: 2000,
  currency: 'usd',
})
```

Copy products created in a sandbox to live mode so that you don’t need to re-create them. In the Product detail view in the Dashboard, click **Copy to live mode** in the upper right corner. You can only do this once for each product created in a sandbox. Subsequent updates to the test product aren’t reflected for the live product.

Make sure you’re in a sandbox by clicking **Sandboxes** within the Dashboard account picker. Next, define the items you want to sell. To create a new product and price:

- Navigate to the [Products](https://dashboard.stripe.com/test/products) section in the Dashboard.
- Click **Add product**.
- Select **One time** when setting the price.

Checkout displays the product name, description, and images that you supply.

Each price you create has an ID. When you create a Checkout Session, reference the price ID and quantity. If you’re selling in multiple currencies, make your Price *multi-currency*. Checkout automatically [determines the customer’s local currency](https://docs.stripe.com/payments/currencies/localize-prices/manual-currency-prices.md) and presents that currency if the Price supports it.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    UiMode = "custom",
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  ReturnURL: stripe.String("https://example.com/return?session_id={CHECKOUT_SESSION_ID}"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setUiMode(SessionCreateParams.UiMode.CUSTOM)
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  ui_mode="custom",
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  return_url="https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'ui_mode' => 'custom',
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'return_url' => 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
})
```

## Prefill customer data

If you’ve already collected your customer’s email and want to prefill it in the Checkout Session for them, pass [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) when creating a Checkout Session.

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new Stripe.Checkout.SessionCreateOptions
{
    CustomerEmail = "customer@example.com",
    UiMode = "custom",
    Mode = "payment",
    LineItems = new List<Stripe.Checkout.SessionLineItemOptions>
    {
        new Stripe.Checkout.SessionLineItemOptions { Price = "{{PRICE_ID}}", Quantity = 1 },
    },
    ReturnUrl = "https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
};
var service = new Stripe.Checkout.SessionService();
Stripe.Checkout.Session session = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.CheckoutSessionParams{
  CustomerEmail: stripe.String("customer@example.com"),
  UIMode: stripe.String(string(stripe.CheckoutSessionUIModeCustom)),
  Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
  LineItems: []*stripe.CheckoutSessionLineItemParams{
    &stripe.CheckoutSessionLineItemParams{
      Price: stripe.String("{{PRICE_ID}}"),
      Quantity: stripe.Int64(1),
    },
  },
  ReturnURL: stripe.String("https://example.com/return?session_id={CHECKOUT_SESSION_ID}"),
};
result, err := session.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

SessionCreateParams params =
  SessionCreateParams.builder()
    .setCustomerEmail("customer@example.com")
    .setUiMode(SessionCreateParams.UiMode.CUSTOM)
    .setMode(SessionCreateParams.Mode.PAYMENT)
    .addLineItem(
      SessionCreateParams.LineItem.builder().setPrice("{{PRICE_ID}}").setQuantity(1L).build()
    )
    .setReturnUrl("https://example.com/return?session_id={CHECKOUT_SESSION_ID}")
    .build();

Session session = Session.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

session = stripe.checkout.Session.create(
  customer_email="customer@example.com",
  ui_mode="custom",
  mode="payment",
  line_items=[{"price": "{{PRICE_ID}}", "quantity": 1}],
  return_url="https://example.com/return?session_id={CHECKOUT_SESSION_ID}",
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$session = $stripe->checkout->sessions->create([
  'customer_email' => 'customer@example.com',
  'ui_mode' => 'custom',
  'mode' => 'payment',
  'line_items' => [
    [
      'price' => '{{PRICE_ID}}',
      'quantity' => 1,
    ],
  ],
  'return_url' => 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

session = Stripe::Checkout::Session.create({
  customer_email: 'customer@example.com',
  ui_mode: 'custom',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
})
```

## Save payment method details

Learn how to [accept a payment and save your customer’s payment details](https://docs.stripe.com/payments/checkout/save-during-payment.md?payment-ui=embedded-components) for future purchases.

## Listen for Checkout Session changes

### Listen for Checkout Session changes 

You can listen for changes to the [Checkout Session](https://docs.stripe.com/api/checkout/sessions.md) by adding an event listener on the `change` event with [checkout.on](https://docs.stripe.com/js/custom_checkout/change_event).

```javascript
checkout = await stripe.initCheckout({
  fetchClientSecret: () => promise,
  elementsOptions: { appearance },
});

checkout.on('change', (session) => {
  // Handle changes to the checkout session
});
```

```jsx
import React from 'react';
import { useCheckout } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  checkout.on('change', (session) => {
    // Handle changes to the checkout session
  });
};
```

## Collect billing and shipping addresses

## Collect a billing address 

By default, a Checkout Session collects the minimal billing details required for payment through the Payment Element.

### Using the Billing Address Element 

You can collect complete billing addresses using the Billing Address Element.

First, pass [billing_address_collection=required](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-billing_address_collection) when you create the Checkout Session.

Create a container DOM element to mount the Billing Address Element. Then create an instance of the Billing Address Element using [checkout.createBillingAddressElement](https://docs.stripe.com/js/custom_checkout/create_billing_address_element) and mount it by calling [element.mount](https://docs.stripe.com/js/element/mount), providing either a CSS selector or the container DOM element.

```html
<div id="billing-address"></div>
```

```javascript
const billingAddressElement = checkout.createBillingAddressElement();
billingAddressElement.mount('#billing-address');
```

The Billing Address Element supports the following options:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-display)

Mount the `AddressElement` component within the `CheckoutProvider`.

```jsx
import React from 'react';
import {AddressElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  return (
    <form>
      <AddressElement options={{mode: 'billing'}}/>
    </form>
  )
};
```

The Billing Address Element supports the following props:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-display)

### Using a custom form 

You can build your own form to collect billing addresses.

* If your checkout page has a distinct address collection step before confirmation, call [updateBillingAddress](https://docs.stripe.com/js/custom_checkout/react/update_billing_address) when your customer submits the address.
* Otherwise, you can submit the address when your customer clicks the “pay” button by passing [billingAddress](https://docs.stripe.com/js/custom_checkout/confirm#custom_checkout_session_confirm-options-billingAddress) to [confirm](https://docs.stripe.com/js/custom_checkout/confirm).

### Collect partial billing addresses

To collect partial billing addresses, such as only the country and postal code, pass [billing_address_collection=auto](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-billing_address_collection).

When collecting partial billing addresses, you must [collect addresses manually](#collect-billing-addresses-manually). By default, the Payment Element automatically collects the minimal billing details required for payment. To avoid double collection of billing details, pass [fields.billingDetails=never](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options-fields-billingDetails) when creating the Payment Element. If you only intend to collect a subset of billing details (such as the customer’s name), pass `never` for only the fields you intend to collect yourself.

## Collect a shipping address 

To collect a customer’s shipping address, pass the [shipping_address_collection](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-shipping_address_collection) parameter when you create the Checkout Session.

When you collect a shipping address, you must also specify which countries to allow shipping to. Configure the [allowed_countries](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-shipping_address_collection-allowed_countries) property with an array of [two-letter ISO country codes](https://www.nationsonline.org/oneworld/country_code_list.htm).

### How to use the Shipping Address Element 

You can collect complete shipping addresses with the Shipping Address Element.

Create a container DOM element to mount the Shipping Address Element. Then create an instance of the Shipping Address Element using [checkout.createShippingAddressElement](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element) and mount it by calling [element.mount](https://docs.stripe.com/js/element/mount), providing either a CSS selector or the container DOM element.

```html
<div id="shipping-address"></div>
```

```javascript
const shippingAddressElement = checkout.createShippingAddressElement();
shippingAddressElement.mount('#shipping-address');
```

The Shipping Address Element supports the following options:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-display)

Mount the `AddressElement` component within the `CheckoutProvider`.

```jsx
import React from 'react';
import {AddressElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  return (
    <form>
      <AddressElement options={{mode: 'shipping'}}/>
    </form>
  )
};
```

The Shipping Address Element supports the following props:

- [contacts](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-contacts)
- [display](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-display)

### Listen for Checkout Session changes 

You can listen for changes to the [Checkout Session](https://docs.stripe.com/api/checkout/sessions.md) by adding an event listener to handle address-related changes.

Use the [Session object](https://docs.stripe.com/js/custom_checkout/session_object) to render the shipping amount in your checkout form.

```html
<div>
  <h3> Totals </h3>
  <div id="subtotal" ></div>
  <div id="shipping" ></div>
  <div id="total" ></div>
</div>
```

```javascript
stripe.initCheckout({clientSecret}).then((checkout) => {
  const subtotal = document.getElementById('subtotal');
  const shipping = document.getElementById('shipping');
  const total = document.getElementById('total');

  checkout.on('change', (session) => {
    subtotal.textContent = `Subtotal: ${session.total.subtotal.amount}`;
    shipping.textContent = `Shipping: ${session.total.shippingRate.amount}`;
    total.textContent = `Total: ${session.total.total.amount}`;
  })
})
```

Use [useCheckout](https://docs.stripe.com/js/custom_checkout/react/use_checkout) to render the shipping cost in your checkout form.

```jsx
import React from 'react';
import {useCheckout} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const checkout = useCheckout();
  const [subtotal, setSubtotal] = React.useState(checkout.total.subtotal.amount);
  const [shipping, setShipping] = React.useState(checkout.total.shippingRate.amount);
  const [total, setTotal] = React.useState(checkout.total.total.amount);

  checkout.on('change', (session) => {
    setSubtotal(session.total.subtotal.amount);
    setShipping(session.total.shippingRate.amount);
    setTotal(session.total.total.amount);
  });

  return (
    <div>
      <div>
        <form>
          <AddressElement options={{mode: 'shipping'}}/>
        </form>
      </div>
      <div>
        <h2>Checkout Summary</h2>
        <pre>
          {JSON.stringify(checkout.lineItems, null, 2)}
        </pre>
        <h3>Totals</h3>
        <pre>
          Subtotal: {subtotal}
          Shipping: {shipping}
          Total: {total}
        </pre>
      </div>
    </div>
  )
};
```

### Use a custom form 

You can build your own form to collect shipping addresses.

* If your checkout page has a distinct address collection step before confirmation, call [updateShippingAddress](https://docs.stripe.com/js/custom_checkout/react/update_shipping_address) when your customer submits the address.
* Otherwise, you can submit the address when your customer clicks the “pay” button by passing [shippingAddress](https://docs.stripe.com/js/custom_checkout/confirm#custom_checkout_session_confirm-options-shippingAddress) to [confirm](https://docs.stripe.com/js/custom_checkout/confirm).

## Separate authorization and capture

Stripe supports two-step card payments so you can first authorize a card, then capture funds later. When Stripe authorizes a payment, the card issuer guarantees the funds and places a hold for the payment amount on the customer’s card. You then have a certain amount of time to capture the funds, [depending on the card](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations)). If you don’t capture the payment before the authorization expires, the payment is cancelled and the issuer releases the held funds.

Separating authorization and capture is useful if you need to take additional actions between confirming that a customer is able to pay and collecting their payment. For example, if you’re selling stock-limited items, you may need to confirm that an item purchased by your customer using Checkout is still available before capturing their payment and fulfilling the purchase. Accomplish this using the following workflow:

1. Confirm that Stripe authorized the customer’s payment method.
1. Consult your inventory management system to confirm that the item is still available.
1. Update your inventory management system to indicate that a customer has purchased the item.
1. Capture the customer’s payment.
1. Inform your customer whether their purchase was successful on your confirmation page.

To indicate that you want to separate authorization and capture, you must set the value of [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) to `manual` when creating the Checkout Session. This instructs Stripe to only authorize the amount on the customer’s card.

To capture an uncaptured payment, you can use either the [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) or the [capture](https://docs.stripe.com/api/payment_intents/capture.md) endpoint. Programmatically capturing payments requires access to the PaymentIntent created during the Checkout Session, which you can get from the [Session](https://docs.stripe.com/api/payment_intents/capture.md) object.

## Customer account management

Let your customers [manage](https://docs.stripe.com/customer-management.md) their own accounts by sharing a link to your *customer portal*. The customer portal lets customers log in with their email to manage subscriptions, update payment methods, and so on.

## Order fulfillment

Learn how to [programmatically get a notification](https://docs.stripe.com/checkout/fulfillment.md?payment-ui=embedded-components) when a customer pays.

## See Also

- [Add discounts for one-time payments](https://docs.stripe.com/payments/checkout/discounts.md?payment-ui=embedded-components)
- [Collect taxes](https://docs.stripe.com/payments/checkout/taxes.md?payment-ui=embedded-components)
- [Enable adjustable line item quantities](https://docs.stripe.com/payments/checkout/adjustable-quantity.md?payment-ui=embedded-components)
- [Add one-click buttons](https://docs.stripe.com/checkout/one-click-payment-buttons.md?payment-ui=embedded-components)

# Advanced integration

> This is a Advanced integration for when platform is web and ui is elements. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=elements.

Build a custom payments integration by embedding UI components on your site, using [Stripe Elements](https://docs.stripe.com/payments/elements.md).
See how this integration [compares to Stripe’s other integration types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

The client-side and server-side code builds a checkout form that accepts various payment methods.

Combine UI components into a custom payment flow

CSS-level customization with the Appearance API

Stripe has a Payment Element integration that manages tax, discounts, shipping, and currency conversion for you. See [build a checkout page](https://docs.stripe.com/checkout/custom/quickstart.md) to learn more.

## Create a PaymentIntent

If you want to render the Payment Element without first creating a PaymentIntent, see [Collect payment details before creating an Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?type=payment).

The [PaymentIntent](https://docs.stripe.com/api/payment_intents.md) object represents your intent to collect payment from a customer and tracks charge attempts and state changes throughout the payment process.

### Create the PaymentIntent

Always decide how much to charge on the server side, a trusted environment, as opposed to the client. This prevents malicious customers from being able to choose their own prices.

### Retrieve the client secret

The {{intentKind}} includes a *client secret* that the client side uses to securely complete the payment process. You can use different approaches to pass the client secret to the client side.

Retrieve the client secret from an endpoint on your server, using the browser’s `fetch` function. This approach is best if your client side is a single-page application, particularly one built with a modern frontend framework like React. Create the server endpoint that serves the client secret:

```ruby
get '/secret' do
  intent = # ... Create or retrieve the {{intentKind}}
  {client_secret: intent.client_secret}.to_json
end
```

```python
from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/secret')
def secret():
  intent = # ... Create or retrieve the {{intentKind}}
  return jsonify(client_secret=intent.client_secret)
```

```php
<?php
    $intent = # ... Create or retrieve the {{intentKind}}
    echo json_encode(array('client_secret' => $intent->client_secret));
?>
```

```java
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.{{intentKind}};

import com.google.gson.Gson;

import static spark.Spark.get;

public class StripeJavaQuickStart {
  public static void main(String[] args) {
    Gson gson = new Gson();

    get("/secret", (request, response) -> {
      {{intentKind}} intent = // ... Fetch or create the {{intentKind}}

      Map<String, String> map = new HashMap();
      map.put("client_secret", intent.getClientSecret());

      return map;
    }, gson::toJson);
  }
}
```

```javascript
const express = require('express');
const app = express();

app.get('/secret', async (req, res) => {
  const intent = // ... Fetch or create the {{intentKind}}
  res.json({client_secret: intent.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```go
package main

import (
  "encoding/json"
  "net/http"

  stripe "github.com/stripe/stripe-go/v{{golang.major_version}}"
)

type CheckoutData struct {
  ClientSecret string `json:"client_secret"`
}

func main() {
  http.HandleFunc("/secret", func(w http.ResponseWriter, r *http.Request) {
    intent := // ... Fetch or create the {{intentKind}}
    data := CheckoutData{
      ClientSecret: intent.ClientSecret,
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(data)
  })

  http.ListenAndServe(":3000", nil)
}
```

```csharp
using System;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace StripeExampleApi.Controllers
{
  [Route("secret")]
  [ApiController]
  public class CheckoutApiController : Controller
  {
    [HttpGet]
    public ActionResult Get()
    {
      var intent = // ... Fetch or create the {{intentKind}}
      return Json(new {client_secret = intent.ClientSecret});
    }
  }
}
```

And then fetch the client secret with JavaScript on the client side:

```javascript
(async () => {
  const response = await fetch('/secret');
  const {client_secret: clientSecret} = await response.json();
  // Render the form using the clientSecret
})();
```

Pass the client secret to the client from your server. This approach works best if your application generates static content on the server before sending it to the browser.

```erb
<form id="payment-form" data-secret="<%= @intent.client_secret %>">
  <button id="submit">Submit</button>
</form>
```

```ruby
get '/checkout' do
  @intent = # ... Fetch or create the {{intentKind}}
  erb :checkout
end
```

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <button id="submit">Submit</button>
</form>
```

```python
@app.route('/checkout')
def checkout():
  intent = # ... Fetch or create the {{intentKind}}
  return render_template('checkout.html', client_secret=intent.client_secret)
```

```php
<?php
  $intent = # ... Fetch or create the {{intentKind}};
?>
...
<form id="payment-form" data-secret="<?= $intent->client_secret ?>">
  <button id="submit">Submit</button>
</form>
...
```

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <button id="submit">Submit</button>
</form>
```

```java
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.{{intentKind}};

import spark.ModelAndView;

import static spark.Spark.get;

public class StripeJavaQuickStart {
  public static void main(String[] args) {
    get("/checkout", (request, response) -> {
      {{intentKind}} intent = // ... Fetch or create the {{intentKind}}

      Map map = new HashMap();
      map.put("client_secret", intent.getClientSecret());

      return new ModelAndView(map, "checkout.hbs");
    }, new HandlebarsTemplateEngine());
  }
}
```

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <div id="payment-element">
    <!-- Elements will create form elements here -->
  </div>

  <button id="submit">Submit</button>
</form>
```

```javascript
const express = require('express');
const expressHandlebars = require('express-handlebars');
const app = express();

app.engine('.hbs', expressHandlebars({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.get('/checkout', async (req, res) => {
  const intent = // ... Fetch or create the {{intentKind}}
  res.render('checkout', { client_secret: intent.client_secret });
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

```html
<form id="payment-form" data-secret="{{ .ClientSecret }}">
  <button id="submit">Submit</button>
</form>
```

```go
package main

import (
  "html/template"
  "net/http"

  stripe "github.com/stripe/stripe-go/v{{golang.major_version}}"
)

type CheckoutData struct {
  ClientSecret string
}

func main() {
  checkoutTmpl := template.Must(template.ParseFiles("views/checkout.html"))

  http.HandleFunc("/checkout", func(w http.ResponseWriter, r *http.Request) {
    intent := // ... Fetch or create the {{intentKind}}
    data := CheckoutData{
      ClientSecret: intent.ClientSecret,
    }
    checkoutTmpl.Execute(w, data)
  })

  http.ListenAndServe(":3000", nil)
}
```

```html
<form id="payment-form" data-secret="@ViewData["ClientSecret"]">
  <button id="submit">Submit</button>
</form>
```

```csharp
using System;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace StripeExampleApi.Controllers
{
  [Route("/[controller]")]
  public class CheckoutApiController : Controller
  {
    public IActionResult Index()
    {
      var intent = // ... Fetch or create the {{intentKind}}
      ViewData["ClientSecret"] = intent.ClientSecret;
      return View();
    }
  }
}
```

## Collect payment details

Collect payment details on the client with the [Payment Element](https://docs.stripe.com/payments/payment-element.md). The Payment Element is a prebuilt UI component that simplifies collecting payment details for a variety of payment methods.

The Payment Element contains an iframe that securely sends payment information to Stripe over an HTTPS connection. Avoid placing the Payment Element within another iframe because some payment methods require redirecting to another page for payment confirmation.

The checkout page address must start with `https://` rather than `http://` for your integration to work. You can test your integration without using HTTPS, but remember to [enable it](https://docs.stripe.com/security/guide.md#tls) when you’re ready to accept live payments.

### Set up Stripe.js

The Payment Element is automatically available as a feature of Stripe.js. Include the Stripe.js script on your checkout page by adding it to the `head` of your HTML file. Always load Stripe.js directly from js.stripe.com to remain PCI compliant. Don’t include the script in a bundle or host a copy of it yourself.

```html
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/basil/stripe.js"></script>
</head>
```

Create an instance of Stripe with the following JavaScript on your checkout page:

```javascript
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
```

### Add the Payment Element to your payment page

The Payment Element needs a place to live on your payment page. Create an empty DOM node (container) with a unique ID in your payment form:

```html
<form id="payment-form">
  <div id="payment-element">
    <!-- Elements will create form elements here -->
  </div>
  <button id="submit">Submit</button>
  <div id="error-message">
    <!-- Display error message to your customers here -->
  </div>
</form>
```

When the previous form loads, create an instance of the Payment Element and mount it to the container DOM node. Pass the  from the previous step into `options` when you create the [Elements](https://docs.stripe.com/js/elements_object/create) instance:

```javascript
const options = {
  clientSecret: '{{CLIENT_SECRET}}',
  // Fully customizable with appearance API.
  appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in a previous step
const elements = stripe.elements(options);

// Create and mount the Payment Element
const paymentElementOptions = { layout: 'accordion'};
const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');

```

### Set up Stripe.js

Install [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) and the [Stripe.js loader](https://www.npmjs.com/package/@stripe/stripe-js) from the npm public registry:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

### Add and configure the Elements provider to your payment page

To use the Payment Element component, wrap your checkout page component in an [Elements provider](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider). Call `loadStripe` with your publishable key, and pass the returned `Promise` to the `Elements` provider. Also pass the [client secret](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) from the previous step as `options` to the `Elements` provider.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.

function App() {
  const options = {
    // passing the client secret obtained in step 3
    clientSecret: '{{CLIENT_SECRET}}',
    // Fully customizable with appearance API.
    appearance: {/*...*/},
  };

  return (
    <Elements stripe={stripePromise} options={options}>
    </Elements>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

### Add the Payment Element component

Use the `PaymentElement` component to build your form:

## Save and retrieve customer payment methods

You can configure the Payment Element to save your customer’s payment methods for future use. This section shows you how to integrate the [saved payment methods feature](https://docs.stripe.com/payments/save-customer-payment-methods.md), which enables the Payment Element to:

- Prompt buyers for consent to save a payment method
- Save payment methods when buyers provide consent
- Display saved payment methods to buyers for future purchases
- [Automatically update lost or expired cards](https://docs.stripe.com/payments/cards/overview.md#automatic-card-updates) when buyers replace them

![The Payment Element and a saved payment method checkbox](images/elements/spm-save.png)
Save payment methods.


![The Payment Element with a Saved payment method selected](images/elements/spm-saved.png)
Reuse a previously saved payment method.


### Enable saving the payment method in the Payment Element

You can specify `setup_future_usage` on a PaymentIntent or Checkout Session to override the default behavior for saving payment methods. This ensures that you automatically save the payment method for future use, even if the customer doesn’t explicitly choose to save it.

Allowing buyers to remove their saved payment methods by enabling [payment_method_remove](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components-payment_element-features-payment_method_remove) impacts subscriptions that depend on that payment method. Removing the payment method detaches the [PaymentMethod](https://docs.stripe.com/api/payment_methods.md) from that [Customer](https://docs.stripe.com/api/customers.md).

```javascript
// Create the CustomerSession and obtain its clientSecret
  method: "POST"
});

const {
  customer_session_client_secret: customerSessionclientSecret
} = await res.json();

const elementsOptions = {
  customerSessionClientSecret,
  // Fully customizable with appearance API.
  appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret
// and CustomerSession's client secret obtained in a previous step
const elements = stripe.elements(elementsOptions);

// Create and mount the Payment Element
const paymentElementOptions = { layout: 'accordion'};
const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');
```

### Detect the selection of a saved payment method

To control dynamic content when a saved payment method is selected, listen to the Payment Element `change` event, which is populated with the selected payment method.

```javascript
paymentElement.on('change', function(event) {
  if (event.value.payment_method) {
    // Control dynamic content if a saved payment method is selected
  }
})
```

## Link in your checkout page

Let your customer check out faster by using [Link](https://docs.stripe.com/payments/link.md) in the [Payment Element](https://docs.stripe.com/payments/payment-element.md). You can autofill information for any logged-in customer already using Link, regardless of whether they initially saved their information in Link with another business. The default Payment Element integration includes a Link prompt in the card form. To manage Link in the Payment Element, go to your [payment method settings](https://dashboard.stripe.com/settings/payment_methods).

![Authenticate or enroll with Link directly in the Payment Element during checkout](images/link/link-in-pe.png)
Collect a customer email address for Link authentication or enrollment


There are two ways you can integrate Link with the Payment Element. Of these, Stripe recommends passing a customer email address to the Payment Element if available. Remember to consider how your checkout flow works when deciding between these options:

| Integration option                                                                                                                                                    | Checkout flow                                                                                                                                                                        | Description                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Pass a customer email address](https://docs.stripe.com/payments/link/add-link-elements-integration.md?link-integration-type=before-payment) to the Payment Element   | * Your customer enters their email address before landing on the checkout page (in a previous account creation step, for example).
  * You prefer to use your own email input field. | Programmatically pass a customer email address to the Payment Element. In this scenario, a customer authenticates to Link directly in the payment form instead of a separate UI component.                                                                 |
| [Collect a customer email address](https://docs.stripe.com/payments/link/add-link-elements-integration.md?link-integration-type=collect-email) in the Payment Element | Your customers enter their email and authenticate or enroll with Link directly in the Payment Element during checkout.                                                               | If a customer hasn’t enrolled with Link and they choose a supported payment method in the Payment Element, they’re prompted to save their details using Link. For those who have already enrolled, Link automatically populates their payment information. |

## Fetch updates from the server

You might want to update attributes on the PaymentIntent after the Payment Element renders, such as the [amount](https://docs.stripe.com/api/payment_intents/update.md#update_payment_intent-amount) (for example, discount codes or shipping costs). You can [update the PaymentIntent](https://docs.stripe.com/api/payment_intents/update.md) on your server, then call [elements.fetchUpdates](https://docs.stripe.com/js/elements_object/fetch_updates) to see the new amount reflected in the Payment Element. This example shows you how to create the server endpoint that updates the amount on the PaymentIntent:

```ruby
get '/update' do
  intent = Stripe::PaymentIntent.update(
    '{{PAYMENT_INTENT_ID}}',
    {amount: 1499},
  )
  {status: intent.status}.to_json
end
```

```python
@app.route('/update')
def secret():
  intent = stripe.PaymentIntent.modify(
    "{{PAYMENT_INTENT_ID}}",
    amount=1499,
  )
  return jsonify(status=intent.status)
```

```php
<?php
    $intent = $stripe->paymentIntents->update(
      '{{PAYMENT_INTENT_ID}}',
      ['amount' => 1499]
    );
    echo json_encode(array('status' => $intent->status));
?>
```

```java
import java.util.HashMap;
import java.util.Map;

import com.stripe.model.PaymentIntent;

import com.google.gson.Gson;

import static spark.Spark.get;

public class StripeJavaQuickStart {
  public static void main(String[] args) {
    Gson gson = new Gson();

    get("/update", (request, response) -> {
      PaymentIntent paymentIntent =
        PaymentIntent.retrieve(
          "{{PAYMENT_INTENT_ID}}"
        );

      Map<String, Object> params = new HashMap<>();
      params.put("amount", 1499);
      PaymentIntent updatedPaymentIntent =
        paymentIntent.update(params);

      Map<String, String> response = new HashMap();
      response.put("status", updatedPaymentIntent.getStatus());

      return map;
    }, gson::toJson);
  }
}
```

```javascript
app.get('/update', async (req, res) => {
  const intent = await stripe.paymentIntents.update(
    '{{PAYMENT_INTENT_ID}}',
    {amount: 1499}
  );
  res.json({status: intent.status});
});
```

```go
package main

import (
  "encoding/json"
  "net/http"

  stripe "github.com/stripe/stripe-go/v{{golang.major_version}}"
)

type UpdateData struct {
  Status string `json:"status"`
}

func main() {
  http.HandleFunc("/update", func(w http.ResponseWriter, r *http.Request) {
    params := &stripe.PaymentIntentParams{
      Amount: stripe.Int64(1499),
    }
    pi, _ := paymentintent.Update(
      "{{PAYMENT_INTENT_ID}}",
      params,
    )

    data := UpdateData{
      Status: pi.Status,
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(data)
  })

  http.ListenAndServe(":3000", nil)
}
```

```csharp
using System;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace StripeExampleApi.Controllers
{
  [Route("update")]
  [ApiController]
  public class CheckoutApiController : Controller
  {
    [HttpPost]
    public ActionResult Post()
    {
      var options = new PaymentIntentUpdateOptions
      {
        Amount = 1499,
      };
      var service = new PaymentIntentService();
      var intent = service.Update(
        "{{PAYMENT_INTENT_ID}}",
        options);
      return Json(new {status = intent.Status});
    }
  }
}
```

This example demonstrates how to update the UI to reflect these changes on the client side:

```javascript
(async () => {
  const response = await fetch('/update');
  if (response.status === 'requires_payment_method') {
    const {error} = await elements.fetchUpdates();
  }
})();
```

## Submit the payment to Stripe

Use [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment) to complete the payment using details from the Payment Element. Provide a [return_url](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-return_url) to this function to indicate where Stripe should redirect the user after they complete the payment. Your user may be first redirected to an intermediate site, like a bank authorization page, before being redirected to the `return_url`. Card payments immediately redirect to the `return_url` when a payment is successful.

```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: 'https://example.com/order/123/complete',
    },
  });

  if (error) {
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Show error to your customer (for example, payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer will be redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer will be redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});
```

To call [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment) from your payment form component, use the [useStripe](https://docs.stripe.com/sdks/stripejs-react.md#usestripe-hook) and [useElements](https://docs.stripe.com/sdks/stripejs-react.md#useelements-hook) hooks.

If you prefer traditional class components over hooks, you can instead use an [ElementsConsumer](https://docs.stripe.com/sdks/stripejs-react.md#elements-consumer).

```jsx
import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://example.com/order/123/complete',
      },
    });


    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
};

export default CheckoutForm;
```

Make sure the `return_url` corresponds to a page on your website that provides the status of the payment. When Stripe redirects the customer to the `return_url`, we provide the following URL query parameters:

| Parameter                      | Description                                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `payment_intent`               | The unique identifier for the `PaymentIntent`.                                                                                                |
| `payment_intent_client_secret` | The [client secret](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) of the `PaymentIntent` object. |

If you have tooling that tracks the customer’s browser session, you might need to add the `stripe.com` domain to the referrer exclude list. Redirects cause some tools to create new sessions, which prevents you from tracking the complete session.

Use one of the query parameters to retrieve the PaymentIntent. Inspect the [status of the PaymentIntent](https://docs.stripe.com/payments/paymentintents/lifecycle.md) to decide what to show your customers. You can also append your own query parameters when providing the `return_url`, which persist through the redirect process.

```javascript
// Initialize Stripe.js using your publishable key
const stripe = Stripe('<<publishable key>>');

// Retrieve the "payment_intent_client_secret" query parameter appended to
// your return_url by Stripe.js
const clientSecret = new URLSearchParams(window.location.search).get(
  'payment_intent_client_secret'
);

// Retrieve the PaymentIntent
stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
  const message = document.querySelector('#message')

  // Inspect the PaymentIntent `status` to indicate the status of the payment
  // to your customer.
  //
  // Some payment methods will [immediately succeed or fail][0] upon
  // confirmation, while others will first enter a `processing` state.
  //
  // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
  switch (paymentIntent.status) {
    case 'succeeded':
      message.innerText = 'Success! Payment received.';
      break;

    case 'processing':
      message.innerText = "Payment processing. We'll update you when payment is received.";
      break;

    case 'requires_payment_method':
      message.innerText = 'Payment failed. Please try another payment method.';
      // Redirect your user back to your payment page to attempt collecting
      // payment again
      break;

    default:
      message.innerText = 'Something went wrong.';
      break;
  }
});
```

```jsx
import React, {useState, useEffect} from 'react';
import {useStripe} from '@stripe/react-stripe-js';

const PaymentStatus = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter appended to
    // your return_url by Stripe.js
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    // Retrieve the PaymentIntent
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({paymentIntent}) => {
        // Inspect the PaymentIntent `status` to indicate the status of the payment
        // to your customer.
        //
        // Some payment methods will [immediately succeed or fail][0] upon
        // confirmation, while others will first enter a `processing` state.
        //
        // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Success! Payment received.');
            break;

          case 'processing':
            setMessage("Payment processing. We'll update you when payment is received.");
            break;

          case 'requires_payment_method':
            // Redirect your user back to your payment page to attempt collecting
            // payment again
            setMessage('Payment failed. Please try another payment method.');
            break;

          default:
            setMessage('Something went wrong.');
            break;
        }
      });
  }, [stripe]);


  return message;
};

export default PaymentStatus;
```

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test your integration

To test your custom payments integration:

1. Create a Payment Intent and retrieve the client secret.
1. Fill out the payment details with a method from the following table.
   - Enter any future date for card expiry.
   - Enter any 3-digit number for CVC.
   - Enter any billing postal code.
1. Submit the payment to Stripe. You’re redirected to your `return_url`.
1. Go to the Dashboard and look for the payment on the [Transactions page](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). If your payment succeeded, you’ll see it in that list.
1. Click your payment to see more details, like billing information and the list of purchased items. You can use this information to fulfill the order.

Learn more about [testing your integration](https://docs.stripe.com/testing.md).

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Add more payment methods

The Payment Element [supports many payment methods](https://docs.stripe.com/payments/payment-methods/integration-options.md#choose-how-to-add-payment-methods) by default. You have to take additional steps to enable and display some payment methods.

### Affirm 

To begin using Affirm, you must enable it in the [Dashboard](https://dashboard.stripe.com/settings/payment_methods). When you create a PaymentIntent with the Affirm payment method, you need to include a [shipping address](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-shipping). This example suggests passing the shipping information on the client after the customer [selects their payment method](https://docs.stripe.com/payments/accept-a-payment.md#web-create-intent). Learn more about using [Affirm](https://docs.stripe.com/payments/affirm.md) with Stripe.

```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: 'https://my-site.com/order/123/complete',
      shipping: {
        name: 'Jenny Rosen',
        address: {
          line1: '1 Street',
          city: 'Seattle',
          state: 'WA',
          postal_code: '95123',
          country: 'US',
        },
      },

    },
  });

  if (error) {
    // This point is reached if there's an immediate error when
    // confirming the payment. Show error to your customer (e.g., payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer is redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer is redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});
```

```jsx
import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://my-site.com/order/123/complete',
        shipping: {
          name: 'Jenny Rosen',
          address: {
            line1: '1 Street',
            city: 'Seattle',
            state: 'WA',
            postal_code: '95123',
            country: 'US',
          },
        },

      },
    });


    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (e.g., payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
};

export default CheckoutForm;
```

#### Test Affirm 

Learn how to test different scenarios using the following table:

| Scenario                                                         | How to test                                                                               |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Your customer successfully pays with Affirm.                     | Fill out the form (make sure to include a shipping address) and authenticate the payment. |
| Your customer fails to authenticate on the Affirm redirect page. | Fill out the form and click **Fail test payment** on the redirect page.                   |

### Afterpay (Clearpay) 

When you create a PaymentIntent with the Afterpay payment method, you need to include a [shipping address](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-shipping). Learn more about using [Afterpay](https://docs.stripe.com/payments/afterpay-clearpay.md) with Stripe.

You can manage payment methods from the [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe handles the return of eligible payment methods based on factors such as the transaction’s amount, currency, and payment flow. The example below uses the [automatic_payment_methods](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-automatic_payment_methods-enabled) attribute but you can list `afterpay_clearpay` with [payment method types](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-payment_method_types). In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default. Regardless of which option you choose, make sure that you enable Afterpay Clearpay in the [Dashboard](https://dashboard.stripe.com/settings/payment_methods).

```dotnet
StripeConfiguration.ApiKey = "<<secret key>>";

var options = new PaymentIntentCreateOptions
{
    Amount = 1099,
    Currency = "USD",
    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
    Shipping = new ChargeShippingOptions
    {
        Name = "Jenny Rosen",
        Address = new AddressOptions
        {
            Line1 = "1234 Main Street",
            City = "San Francisco",
            State = "CA",
            Country = "US",
            PostalCode = "94111",
        },
    },
};
var service = new PaymentIntentService();
PaymentIntent paymentIntent = service.Create(options);
```

```go
stripe.Key = "<<secret key>>"

params := &stripe.PaymentIntentParams{
  Amount: stripe.Int64(1099),
  Currency: stripe.String(string(stripe.CurrencyUSD)),
  AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
    Enabled: stripe.Bool(true),
  },
  Shipping: &stripe.ShippingDetailsParams{
    Name: stripe.String("Jenny Rosen"),
    Address: &stripe.AddressParams{
      Line1: stripe.String("1234 Main Street"),
      City: stripe.String("San Francisco"),
      State: stripe.String("CA"),
      Country: stripe.String("US"),
      PostalCode: stripe.String("94111"),
    },
  },
};
result, err := paymentintent.New(params);
```

```java
Stripe.apiKey = "<<secret key>>";

PaymentIntentCreateParams params =
  PaymentIntentCreateParams.builder()
    .setAmount(1099L)
    .setCurrency("USD")
    .setAutomaticPaymentMethods(
      PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
    )
    .setShipping(
      PaymentIntentCreateParams.Shipping.builder()
        .setName("Jenny Rosen")
        .setAddress(
          PaymentIntentCreateParams.Shipping.Address.builder()
            .setLine1("1234 Main Street")
            .setCity("San Francisco")
            .setState("CA")
            .setCountry("US")
            .setPostalCode("94111")
            .build()
        )
        .build()
    )
    .build();

PaymentIntent paymentIntent = PaymentIntent.create(params);
```

```node
const stripe = require('stripe')('<<secret key>>');

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1099,
  currency: 'USD',
  automatic_payment_methods: {
    enabled: true,
  },
  shipping: {
    name: 'Jenny Rosen',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111',
    },
  },
});
```

```python
import stripe
stripe.api_key = "<<secret key>>"

payment_intent = stripe.PaymentIntent.create(
  amount=1099,
  currency="USD",
  automatic_payment_methods={"enabled": True},
  shipping={
    "name": "Jenny Rosen",
    "address": {
      "line1": "1234 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94111",
    },
  },
)
```

```php
$stripe = new \Stripe\StripeClient('<<secret key>>');

$paymentIntent = $stripe->paymentIntents->create([
  'amount' => 1099,
  'currency' => 'USD',
  'automatic_payment_methods' => ['enabled' => true],
  'shipping' => [
    'name' => 'Jenny Rosen',
    'address' => [
      'line1' => '1234 Main Street',
      'city' => 'San Francisco',
      'state' => 'CA',
      'country' => 'US',
      'postal_code' => '94111',
    ],
  ],
]);
```

```ruby
Stripe.api_key = '<<secret key>>'

payment_intent = Stripe::PaymentIntent.create({
  amount: 1099,
  currency: 'USD',
  automatic_payment_methods: {enabled: true},
  shipping: {
    name: 'Jenny Rosen',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111',
    },
  },
})
```

#### Test Afterpay (Clearpay) 

Learn how to test different scenarios using the following table:

| Scenario                                                           | How to test                                                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Your customer successfully pays with Afterpay.                     | Fill out the form (make sure to include a shipping address) and authenticate the payment. |
| Your customer fails to authenticate on the Afterpay redirect page. | Fill out the form and click **Fail test payment** on the redirect page.                   |

### Apple Pay and Google Pay 

Stripe Elements doesn’t support Google Pay or Apple Pay for Stripe accounts and customers in India. Therefore, you can’t test your Google Pay or Apple Pay integration if the tester’s IP address is in India, even if the Stripe account is based outside India.

Learn more about using [Apple Pay](https://docs.stripe.com/apple-pay.md) and [Google Pay](https://docs.stripe.com/google-pay.md) with Stripe.

### ACH Direct Debit 

When using the Payment Element with the ACH Direct Debit payment method, follow these steps:

1. Create a [Customer object](https://docs.stripe.com/api/customers.md).

   ```dotnet
   StripeConfiguration.ApiKey = "<<secret key>>";
   
   var options = new CustomerCreateOptions();
   var service = new CustomerService();
   Customer customer = service.Create(options);
   ```

   ```go
   stripe.Key = "<<secret key>>"
   
   params := &stripe.CustomerParams{};
   result, err := customer.New(params);
   ```

   ```java
   Stripe.apiKey = "<<secret key>>";
   
   CustomerCreateParams params = CustomerCreateParams.builder().build();
   
   Customer customer = Customer.create(params);
   ```

   ```node
   const stripe = require('stripe')('<<secret key>>');
   
   const customer = await stripe.customers.create();
   ```

   ```python
   import stripe
   stripe.api_key = "<<secret key>>"
   
   customer = stripe.Customer.create()
   ```

   ```php
   $stripe = new \Stripe\StripeClient('<<secret key>>');
   
   $customer = $stripe->customers->create([]);
   ```

   ```ruby
   Stripe.api_key = '<<secret key>>'
   
   customer = Stripe::Customer.create()
   ```

1. Specify the customer ID when creating the `PaymentIntent`.

   ```dotnet
   StripeConfiguration.ApiKey = "<<secret key>>";
   
   var options = new PaymentIntentCreateOptions
   {
       Amount = 1099,
       Currency = "usd",
       SetupFutureUsage = "off_session",
       Customer = "{{CUSTOMER_ID}}",
       PaymentMethodTypes = new List<string> { "us_bank_account" },
   };
   var service = new PaymentIntentService();
   PaymentIntent paymentIntent = service.Create(options);
   ```

   ```go
   stripe.Key = "<<secret key>>"
   
   params := &stripe.PaymentIntentParams{
     Amount: stripe.Int64(1099),
     Currency: stripe.String(string(stripe.CurrencyUSD)),
     SetupFutureUsage: stripe.String(string(stripe.PaymentIntentSetupFutureUsageOffSession)),
     Customer: stripe.String("{{CUSTOMER_ID}}"),
     PaymentMethodTypes: []*string{stripe.String("us_bank_account")},
   };
   result, err := paymentintent.New(params);
   ```

   ```java
   Stripe.apiKey = "<<secret key>>";
   
   PaymentIntentCreateParams params =
     PaymentIntentCreateParams.builder()
       .setAmount(1099L)
       .setCurrency("usd")
       .setSetupFutureUsage(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION)
       .setCustomer("{{CUSTOMER_ID}}")
       .addPaymentMethodType("us_bank_account")
       .build();
   
   PaymentIntent paymentIntent = PaymentIntent.create(params);
   ```

   ```node
   const stripe = require('stripe')('<<secret key>>');
   
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 1099,
     currency: 'usd',
     setup_future_usage: 'off_session',
     customer: '{{CUSTOMER_ID}}',
     payment_method_types: ['us_bank_account'],
   });
   ```

   ```python
   import stripe
   stripe.api_key = "<<secret key>>"
   
   payment_intent = stripe.PaymentIntent.create(
     amount=1099,
     currency="usd",
     setup_future_usage="off_session",
     customer="{{CUSTOMER_ID}}",
     payment_method_types=["us_bank_account"],
   )
   ```

   ```php
   $stripe = new \Stripe\StripeClient('<<secret key>>');
   
   $paymentIntent = $stripe->paymentIntents->create([
     'amount' => 1099,
     'currency' => 'usd',
     'setup_future_usage' => 'off_session',
     'customer' => '{{CUSTOMER_ID}}',
     'payment_method_types' => ['us_bank_account'],
   ]);
   ```

   ```ruby
   Stripe.api_key = '<<secret key>>'
   
   payment_intent = Stripe::PaymentIntent.create({
     amount: 1099,
     currency: 'usd',
     setup_future_usage: 'off_session',
     customer: '{{CUSTOMER_ID}}',
     payment_method_types: ['us_bank_account'],
   })
   ```

1. Select a [verification method](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-payment_method_options-us_bank_account-verification_method).

When using the ACH Direct Debit payment method with the Payment Element, you can only select .

Learn more about using [ACH Direct Debit](https://docs.stripe.com/payments/ach-direct-debit.md) with Stripe.

#### Test ACH Direct Debit 

| Scenario                                                                           | How to test                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Your customer successfully pays with a US bank account using instant verification. | Select **US bank account** and fill out the form. Click the test institution. Follow the instructions on the modal to link your bank account. Click your payment button.                                                                                                                                                                       |
| Your customer successfully pays with a US bank account using microdeposits.        | Select **US bank account** and fill out the form. Click **Enter bank details manually instead**. Follow the instructions on the modal to link your bank account. You may use these [test account numbers](https://docs.stripe.com/payments/ach-direct-debit/accept-a-payment.md?platform=web#test-account-numbers). Click your payment button. |
| Your customer fails to complete the bank account linking process.                  | Select **US bank account** and click the test institution or **Enter bank details manually instead**. Close the modal without completing it.                                                                                                                                                                                                   |

### QR code payment methods 

When using the Payment Element with a QR code based payment method (WeChat Pay, PayNow, Pix, PromptPay, Cash App Pay), the user can close the QR code modal. This triggers a redirect to your `return_url` and doesn’t return the user to the checkout page.

To handle users closing QR code modals, at the server-side handler for your `return_url`, inspect the Payment Intent’s `status` to see if it’s `succeeded` or still `requires_action` (meaning the user has closed the modal without paying), dealing with each case as needed.

Alternatively, prevent the automatic redirect to your `return_url` by passing the advanced optional parameter [`redirect=if_required`](https://docs.stripe.com/js/payment_intents/confirm_payment#confirm_payment_intent-options-redirect), which prevents the redirect when closing a QR code modal.

### Cash App Pay 

The Payment Element renders a dynamic form differently in desktop web or mobile web since it uses different customer authentication methods. Learn more about using [Cash App Pay](https://docs.stripe.com/payments/cash-app-pay.md) with Stripe.

Cash App Pay is a redirect based payment method in mobile web. It redirects your customer to Cash App in live mode or a test payment page in a test environment. After the payment is complete, they’re redirected to the `return_url`, regardless of whether you set `redirect=if_required` or not.

Cash App Pay is a QR code payment method in desktop web, where the Payment Element renders a QR code modal. Your customer needs to scan the QR code with a QR code scanning application or the Cash App mobile application.

In live mode, it redirects the customer to the `return_url` as soon as they’re redirected to the Cash App. In test environments, they can approve or decline the payment before being redirected to the `return_url`. Customers can also close the QR code modal before completing the payment, which triggers a redirect to your `return_url`.

Make sure the `return_url` corresponds to a page on your website to inspect the Payment Intent’s `status`. The Payment Intent’s `status` can be `succeeded`, `failed`, or `requires_action` (for example, the customer has closed the modal without scanning the QR code).

Alternatively, prevent the automatic redirect to your `return_url` by passing the advanced optional parameter `redirect=if_required`, which prevents the redirect when closing a QR code modal.

### PayPal 

To use PayPal, make sure you’re on a [registered domain](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).

## Disclose Stripe to your customers 

Stripe collects information on customer interactions with Elements to provide services to you, prevent fraud, and improve its services. This includes using cookies and IP addresses to identify which Elements a customer saw during a single checkout session. You’re responsible for disclosing and obtaining all rights and consents necessary for Stripe to use data in these ways. For more information, visit our [privacy center](https://stripe.com/legal/privacy-center#as-a-business-user-what-notice-do-i-provide-to-my-end-customers-about-stripe).

## See Also

- [Stripe Elements](https://docs.stripe.com/payments/elements.md)
- [Set up future payments](https://docs.stripe.com/payments/save-and-reuse.md)
- [Save payment details during payment](https://docs.stripe.com/payments/save-during-payment.md)
- [Calculate sales tax, GST and VAT in your payment flow](https://docs.stripe.com/tax/custom.md)

# In-app integration for iOS

> This is a In-app integration for iOS for when platform is ios. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=ios.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use our official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [Stripe iOS SDK](https://github.com/stripe/stripe-ios) is open source, [fully documented](https://stripe.dev/stripe-ios/index.html), and compatible with apps supporting iOS {{minimumiOSVersion}} or above.

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-ios/releases) page on GitHub. To receive notifications when a new release is published, [watch releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) for the repository.

## Enable payment methods

## Add an endpoint

## Collect payment details

## Set up a return URL

The customer might navigate away from your app to authenticate (for example, in Safari or their banking app). To allow them to automatically return to your app after authenticating, [configure a custom URL scheme](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app) and set up your app delegate to forward the URL to the SDK. Stripe doesn’t support [universal links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content).

```swift
// This method handles opening custom URL schemes (for example, "your-app://stripe-redirect")
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else {
        return
    }
    let stripeHandled = StripeAPI.handleURLCallback(with: url)
    if (!stripeHandled) {
        // This was not a Stripe url – handle the URL normally as you would
    }
}

```

```swift
// This method handles opening custom URL schemes (for example, "your-app://stripe-redirect")
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    let stripeHandled = StripeAPI.handleURLCallback(with: url)
    if (stripeHandled) {
        return true
    } else {
        // This was not a Stripe url – handle the URL normally as you would
    }
    return false
}
```

```swift
@main
struct MyApp: App {
  var body: some Scene {
    WindowGroup {
      Text("Hello, world!")
        .onOpenURL { incomingURL in
          let stripeHandled = StripeAPI.handleURLCallback(with: incomingURL)
          if (!stripeHandled) {
            // This was not a Stripe url – handle the URL normally as you would
          }
        }
    }
  }
}
```

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable Link

Enable Link in your [Payment Method settings](https://dashboard.stripe.com/settings/payment_methods) to allow your customers to securely save and reuse their payment information using Link’s one-click express checkout button.

### Pass your customer’s email to the Mobile Payment Element

Link authenticates a customer using their email address. Stripe recommends prefilling as much information as possible to streamline the checkout process.

## Enable Apple Pay

If your checkout screen has a dedicated **Apple Pay button**, follow the [Apple Pay guide](https://docs.stripe.com/apple-pay.md#present-payment-sheet) and use `ApplePayContext` to collect payment from your Apple Pay button. You can use `PaymentSheet` to handle other payment method types.

### Register for an Apple Merchant ID

Obtain an Apple Merchant ID by [registering for a new identifier](https://developer.apple.com/account/resources/identifiers/add/merchant) on the Apple Developer website.

Fill out the form with a description and identifier. Your description is for your own records and you can modify it in the future. Stripe recommends using the name of your app as the identifier (for example, `merchant.com.{{YOUR_APP_NAME}}`).

### Create a new Apple Pay certificate

Create a certificate for your app to encrypt payment data.

Go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard, click **Add new application**, and follow the guide.

Download a Certificate Signing Request (CSR) file to get a secure certificate from Apple that allows you to use Apple Pay.

One CSR file must be used to issue exactly one certificate. If you switch your Apple Merchant ID, you must go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard to obtain a new CSR and certificate.

### Integrate with Xcode

Add the Apple Pay capability to your app. In Xcode, open your project settings, click the **Signing & Capabilities** tab, and add the **Apple Pay** capability. You might be prompted to log in to your developer account at this point. Select the merchant ID you created earlier, and your app is ready to accept Apple Pay.

![](images/mobile/ios/xcode.png)
Enable the Apple Pay capability in Xcode


### Add Apple Pay

To add Apple Pay to PaymentSheet, set [applePay](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:6Stripe12PaymentSheetC13ConfigurationV8applePayAC05ApplefD0VSgvp) after initializing `PaymentSheet.Configuration` with your Apple merchant ID and the [country code of your business](https://dashboard.stripe.com/settings/account).

Per [Apple’s guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) for recurring payments, you must also set additional attributes on the `PKPaymentRequest`. Add a handler in [ApplePayConfiguration.paymentRequestHandlers](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/applepayconfiguration/handlers/paymentrequesthandler) to configure the [PKPaymentRequest.paymentSummaryItems](https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems) with the amount you intend to charge (for example, 9.95 USD a month).

You can also adopt [merchant tokens](https://developer.apple.com/apple-pay/merchant-tokens/) by setting the `recurringPaymentRequest` or `automaticReloadPaymentRequest` properties on the `PKPaymentRequest`.

To learn more about how to use recurring payments with Apple Pay, see [Apple’s PassKit documentation](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

```swift
let customHandlers = PaymentSheet.ApplePayConfiguration.Handlers(
    paymentRequestHandler: { request in
        // PKRecurringPaymentSummaryItem is available on iOS 15 or later
        if #available(iOS 15.0, *) {
            let billing = PKRecurringPaymentSummaryItem(label: "My Subscription", amount: NSDecimalNumber(string: "59.99"))

            // Payment starts today
            billing.startDate = Date()

            // Payment ends in one year
            billing.endDate = Date().addingTimeInterval(60 * 60 * 24 * 365)

            // Pay once a month.
            billing.intervalUnit = .month
            billing.intervalCount = 1

            // recurringPaymentRequest is only available on iOS 16 or later
            if #available(iOS 16.0, *) {
                request.recurringPaymentRequest = PKRecurringPaymentRequest(paymentDescription: "Recurring",
                                                                            regularBilling: billing,
                                                                            managementURL: URL(string: "https://my-backend.example.com/customer-portal")!)
                request.recurringPaymentRequest?.billingAgreement = "You'll be billed $59.99 every month for the next 12 months. To cancel at any time, go to Account and click 'Cancel Membership.'"
            }
            request.paymentSummaryItems = [billing]
            request.currencyCode = "USD"
        } else {
            // On older iOS versions, set alternative summary items.
            request.paymentSummaryItems = [PKPaymentSummaryItem(label: "Monthly plan starting July 1, 2022", amount: NSDecimalNumber(string: "59.99"), type: .final)]
        }
        return request
    }
)
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(merchantId: "merchant.com.your_app_name",
                                merchantCountryCode: "US",
                                customHandlers: customHandlers)
```

### Order tracking

To add [order tracking](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) information in iOS 16 or later, configure an [authorizationResultHandler](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/applepayconfiguration/handlers/authorizationresulthandler) in your `PaymentSheet.ApplePayConfiguration.Handlers`. Stripe calls your implementation after the payment is complete, but before iOS dismisses the Apple Pay sheet.

In your `authorizationResultHandler` implementation, fetch the order details from your server for the completed order. Add the details to the provided [PKPaymentAuthorizationResult](https://developer.apple.com/documentation/passkit/pkpaymentauthorizationresult) and call the provided completion handler.

To learn more about order tracking, see [Apple’s Wallet Orders documentation](https://developer.apple.com/documentation/walletorders).

```swift
let customHandlers = PaymentSheet.ApplePayConfiguration.Handlers(
    authorizationResultHandler: { result, completion in
        // Fetch the order details from your service
        MyAPIClient.shared.fetchOrderDetails(orderID: orderID) { myOrderDetails
            result.orderDetails = PKPaymentOrderDetails(
                orderTypeIdentifier: myOrderDetails.orderTypeIdentifier, // "com.myapp.order"
                orderIdentifier: myOrderDetails.orderIdentifier, // "ABC123-AAAA-1111"
                webServiceURL: myOrderDetails.webServiceURL, // "https://my-backend.example.com/apple-order-tracking-backend"
                authenticationToken: myOrderDetails.authenticationToken) // "abc123"
            // Call the completion block on the main queue with your modified PKPaymentAuthorizationResult
            completion(result)
        }
    }
)
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(merchantId: "merchant.com.your_app_name",
                               merchantCountryCode: "US",
                               customHandlers: customHandlers)
```

## Enable card scanning

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

## Enable ACH payments

To enable ACH debit payments include `StripeFinancialConnections` as a dependency for your app.

The [Stripe iOS SDK](https://github.com/stripe/stripe-ios) is open source, [fully documented](https://stripe.dev/stripe-ios/index.html), and compatible with apps supporting iOS {{minimumiOSVersion}} or above.

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-ios/releases) page on GitHub. To receive notifications when a new release is published, [watch releases](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) for the repository.

## Customize the sheet

All customization is configured through the [PaymentSheet.Configuration](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html) object.

### Appearance

Customize colors, fonts, and so on to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=ios).

### Payment method layout

Configure the layout of payment methods in the sheet using [paymentMethodLayout](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/configuration-swift.struct/paymentmethodlayout). You can display them horizontally, vertically, or let Stripe optimize the layout automatically.

![](images/mobile/payment-sheet/ios-mpe-payment-method-layouts.png)

```swift
var configuration = PaymentSheet.Configuration()
configuration.paymentMethodLayout = .automatic
```

### Collect users addresses

Collect local and international shipping or billing addresses from your customers using the [Address Element](https://docs.stripe.com/elements/address-element.md?platform=ios).

### Merchant display name

Specify a customer-facing business name by setting [merchantDisplayName](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:18StripePaymentSheet0bC0C13ConfigurationV19merchantDisplayNameSSvp). By default, this is your app’s name.

```swift
var configuration = PaymentSheet.Configuration()
configuration.merchantDisplayName = "My app, Inc."
```

### Dark mode

`PaymentSheet` automatically adapts to the user’s system-wide appearance settings (light and dark mode). If your app doesn’t support dark mode, you can set [style](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:18StripePaymentSheet0bC0C13ConfigurationV5styleAC18UserInterfaceStyleOvp) to `alwaysLight` or `alwaysDark` mode.

```swift
var configuration = PaymentSheet.Configuration()
configuration.style = .alwaysLight
```

## Handle user logout

## Complete payment in your UI

You can present the Payment Sheet to only collect payment method details and then later call a `confirm` method to complete payment in your app’s UI. This is useful if you have a custom buy button or require additional steps after you collect payment details.

![](images/mobile/payment-sheet/ios-multi-step.png)
Complete the payment in your app’s UI


The following steps walk you through how to complete payment in your app’s UI. See our sample integration out on [GitHub](https://github.com/stripe/stripe-ios/blob/master/Example/PaymentSheet%20Example/PaymentSheet%20Example/ExampleCustomCheckoutViewController.swift).

1. First, initialize [PaymentSheet.FlowController](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller) instead of `PaymentSheet` and update your UI with its `paymentOption` property. This property contains an image and label representing the customer’s initially selected, default payment method.

```swift
PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration) { [weak self] result in
  switch result {
  case .failure(let error):
    print(error)
  case .success(let paymentSheetFlowController):
    self?.paymentSheetFlowController = paymentSheetFlowController
    // Update your UI using paymentSheetFlowController.paymentOption
  }
}
```

1. Next, call `presentPaymentOptions` to collect payment details. When completed, update your UI again with the `paymentOption` property.

```swift
paymentSheetFlowController.presentPaymentOptions(from: self) {
  // Update your UI using paymentSheetFlowController.paymentOption
}
```

1. Finally, call `confirm`.

```swift
paymentSheetFlowController.confirm(from: self) { paymentResult in
  // MARK: Handle the payment result
  switch paymentResult {
  case .completed:
    print("Payment complete!")
  case .canceled:
    print("Canceled!")
  case .failed(let error):
    print(error)
  }
}
```

The following steps walk you through how to complete payment in your app’s UI. See our sample integration out on [GitHub](https://github.com/stripe/stripe-ios/blob/master/Example/PaymentSheet%20Example/PaymentSheet%20Example/ExampleSwiftUICustomPaymentFlow.swift).

1. First, initialize [PaymentSheet.FlowController](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller) instead of `PaymentSheet`. Its `paymentOption` property contains an image and label representing the customer’s currently selected payment method, which you can use in your UI.

```swift
PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration) { [weak self] result in
  switch result {
  case .failure(let error):
    print(error)
  case .success(let paymentSheetFlowController):
    self?.paymentSheetFlowController = paymentSheetFlowController
    // Use the paymentSheetFlowController.paymentOption properties in your UI
    myPaymentMethodLabel = paymentSheetFlowController.paymentOption?.label ?? "Select a payment method"
    myPaymentMethodImage = paymentSheetFlowController.paymentOption?.image ?? UIImage(systemName: "square.and.pencil")!
  }
}
```

1. Use [PaymentSheet.FlowController.PaymentOptionsButton](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller/paymentoptionsbutton) to wrap the button that presents the sheet to collect payment details. When `PaymentSheet.FlowController` calls the `onSheetDismissed` argument, the `paymentOption` for the `PaymentSheet.FlowController` instance reflects the currently selected payment method.

```swift
PaymentSheet.FlowController.PaymentOptionsButton(
  paymentSheetFlowController: paymentSheetFlowController,
  onSheetDismissed: {
    myPaymentMethodLabel = paymentSheetFlowController.paymentOption?.label ?? "Select a payment method"
    myPaymentMethodImage = paymentSheetFlowController.paymentOption?.image ?? UIImage(systemName: "square.and.pencil")!
  },
  content: {
    /* An example button */
    HStack {
      Text(myPaymentMethodLabel)
      Image(uiImage: myPaymentMethodImage)
    }
  }
)
```

1. Use [PaymentSheet.FlowController.PaymentOptionsButton](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller/paymentoptionsbutton) to wrap the button that confirms the payment.

```swift
PaymentSheet.FlowController.ConfirmButton(
  paymentSheetFlowController: paymentSheetFlowController,
  onCompletion: { result in
    // MARK: Handle the payment result
    switch result {
    case .completed:
      print("Payment complete!")
    case .canceled:
      print("Canceled!")
    case .failed(let error):
      print(error)
    }
  },
  content: {
    /* An example button */
    Text("Pay")
  }
)
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

## Enable CVC recollection on confirmation

### Update parameters of the intent creation

# In-app integration for Android

> This is a In-app integration for Android for when platform is android. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=android.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use the official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

```kotlin
plugins {
    id("com.android.application")
}


dependencies {
  // ...

}
```

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

}
```

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-android/releases) page on GitHub. To receive notifications when a new release is published, [watch releases for the repository](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

## Enable payment methods

## Add an endpoint

## Collect payment details

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable Link

Enable Link in your [Payment Method settings](https://dashboard.stripe.com/settings/payment_methods) to allow your customers to securely save and reuse their payment information using Link’s one-click express checkout button.

### Pass your customer’s email to the Mobile Payment Element

Link authenticates a customer using their email address. Stripe recommends prefilling as much information as possible to streamline the checkout process.

## Enable Google Pay

### Set up your integration

To use Google Pay, first enable the Google Pay API by adding the following to the `<application>` tag of your **AndroidManifest.xml**:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

For more details, see Google Pay’s [Set up Google Pay API](https://developers.google.com/pay/api/android/guides/setup) for Android.

### Add Google Pay

### Test Google Pay

Google allows you to make test payments through their [Test card suite](https://developers.google.com/pay/api/android/guides/resources/test-card-suite). The test suite supports using stripe [test cards](https://docs.stripe.com/testing.md).

You can test Google Pay using a physical Android device. Make sure you have a device in a country where google pay is supported and log in to a Google account on your test device with a real card saved to Google Wallet.

## Enable card scanning

To enable card scanning support, add `stripecardscan` to the `dependencies` block of your [app/build.gradle](https://developer.android.com/studio/build/dependencies) file:

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation 'com.stripe:stripecardscan:21.20.2'
}
```

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

  // StripeCardScan
  implementation("com.stripe:stripecardscan:21.20.2")
}
```

## Enable ACH payments

To enable ACH debit payments include Financial Connections as a dependency for your app.

```kotlin
plugins {
    id("com.android.application")
}


dependencies {
  // ...

}
```

```groovy
apply plugin: 'com.android.application'

android { ... }

dependencies {
  // ...

}
```

For details on the latest SDK release and past versions, see the [Releases](https://github.com/stripe/stripe-android/releases) page on GitHub. To receive notifications when a new release is published, [watch releases for the repository](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

## Customize the sheet

All customization is configured using the [PaymentSheet.Configuration](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html) object.

### Appearance

Customize colors, fonts, and more to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=android).

### Payment method layout

Configure the layout of payment methods in the sheet using [paymentMethodLayout](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/-builder/index.html#2123253356%2FFunctions%2F2002900378). You can display them horizontally, vertically, or let Stripe optimize the layout automatically.

![](images/mobile/payment-sheet/android-mpe-payment-method-layouts.png)

```kotlin
PaymentSheet.Configuration.Builder("Example, Inc.")
  .paymentMethodLayout(PaymentSheet.PaymentMethodLayout.Automatic)
  .build()
```

```java
new PaymentSheet.Configuration.Builder("Example, Inc.")
  .paymentMethodLayout(PaymentSheet.PaymentMethodLayout.Automatic)
  .build();
```

### Collect users addresses

Collect local and international shipping or billing addresses from your customers using the [Address Element](https://docs.stripe.com/elements/address-element.md?platform=android).

### Business display name

Specify a customer-facing business name by setting [merchantDisplayName](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html#-191101533%2FProperties%2F2002900378). By default, this is your app’s name.

```kotlin
PaymentSheet.Configuration.Builder(
  merchantDisplayName = "My app, Inc."
).build()
```

```java
new PaymentSheet.Configuration.Builder("My app, Inc.")
  .build();
```

### Dark mode

By default, `PaymentSheet` automatically adapts to the user’s system-wide appearance settings (light and dark mode). You can change this by setting light or dark mode on your app:

```kotlin
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

```java
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
```

## Handle user logout

## Complete payment in your UI

You can present Payment Sheet to only collect payment method details and complete the payment back in your app’s UI. This is useful if you have a custom buy button or require additional steps after payment details are collected.

![](images/mobile/payment-sheet/android-multi-step.png)

A sample integration is [available on our GitHub](https://github.com/stripe/stripe-android/blob/master/paymentsheet-example/src/main/java/com/stripe/android/paymentsheet/example/samples/ui/custom_flow/CustomFlowActivity.kt).

1. First, initialize [PaymentSheet.FlowController](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html) instead of `PaymentSheet` using one of the [Builder](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/-builder/index.html) methods.

```kotlin
class CheckoutActivity : AppCompatActivity() {
  private lateinit var flowController: PaymentSheet.FlowController

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    flowController = PaymentSheet.FlowController.Builder(
      paymentResultCallback = ::onPaymentSheetResult,
      paymentOptionCallback = ::onPaymentOption,
    ).build(this)
  }
}
```

```java
public class CheckoutActivity extends AppCompatActivity {
  private PaymentSheet.FlowController flowController;

  @Override
  protected void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    final PaymentOptionCallback paymentOptionCallback = paymentOption -> {
      onPaymentOption(paymentOption);
    };

    final PaymentSheetResultCallback paymentSheetResultCallback = paymentSheetResult -> {
      onPaymentSheetResult(paymentSheetResult);
    };

    flowController = new PaymentSheet.FlowController.Builder(
      paymentSheetResultCallback,
      paymentOptionCallback
    ).build(this);
  }
}
```

2. Next, call `configureWithPaymentIntent` with the Stripe object keys fetched from your backend and update your UI in the callback using [getPaymentOption()](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#-2091462043%2FFunctions%2F2002900378). This contains an image and label representing the customer’s currently selected payment method.

```kotlin
flowController.configureWithPaymentIntent(
  paymentIntentClientSecret = paymentIntentClientSecret,
  configuration = PaymentSheet.Configuration.Builder("Example, Inc.")
    .customer(PaymentSheet.CustomerConfiguration(
      id = customerId,
      ephemeralKeySecret = ephemeralKeySecret
    ))
    .build()
) { isReady, error ->
  if (isReady) {
    // Update your UI using `flowController.getPaymentOption()`
  } else {
    // handle FlowController configuration failure
  }
}
```

```java
flowController.configureWithPaymentIntent(
  paymentIntentClientSecret,
  new PaymentSheet.Configuration.Builder("Example, Inc.")
    .customer(new PaymentSheet.CustomerConfiguration(
      customerId,
      ephemeralKeySecret
    ))
    .build(),
  (success, error) -> {
    if (success) {
      // Update your UI using `flowController.getPaymentOption()`
    } else {
      // handle FlowController configuration failure
    }
  }
);
```

3. Next, call [presentPaymentOptions](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#449924733%2FFunctions%2F2002900378) to collect payment details. When the customer finishes, the sheet is dismissed and calls the [paymentOptionCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-option-callback/index.html) passed earlier in `create`. Implement this method to update your UI with the returned `paymentOption`.

```kotlin
// ...
  flowController.presentPaymentOptions()
// ...
  private fun onPaymentOption(paymentOption: PaymentOption?) {
    if (paymentOption != null) {
      paymentMethodButton.text = paymentOption.label
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        paymentOption.drawableResourceId,
        0,
        0,
        0
      )
    } else {
      paymentMethodButton.text = "Select"
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        null,
        null,
        null,
        null
      )
    }
  }
```

```java
// ...
    flowController.presentPaymentOptions());
// ...
  private void onPaymentOption(
    @Nullable PaymentOption paymentOption
  ) {
    if (paymentOption != null) {
      paymentMethodButton.setText(paymentOption.getLabel());
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        paymentOption.getDrawableResourceId(),
        0,
        0,
        0
      );
    } else {
      paymentMethodButton.setText("Select");
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        null,
        null,
        null,
        null
      );
    }
  }

  private void onCheckout() {
    // see below
  }
}
```

4. Finally, call [confirm](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#-479056656%2FFunctions%2F2002900378) to complete the payment. When the customer finishes, the sheet is dismissed and calls the [paymentResultCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result-callback/index.html#237248767%2FFunctions%2F2002900378) passed earlier in `create`.

```kotlin
// ...
    flowController.confirmPayment()
  // ...

  private fun onPaymentSheetResult(
    paymentSheetResult: PaymentSheetResult
  ) {
    when (paymentSheetResult) {
      is PaymentSheetResult.Canceled -> {
        // Payment canceled
      }
      is PaymentSheetResult.Failed -> {
        // Payment Failed. See logcat for details or inspect paymentSheetResult.error
      }
      is PaymentSheetResult.Completed -> {
        // Payment Complete
      }
    }
  }
```

```java
// ...
    flowController.confirmPayment();
  // ...

  private void onPaymentSheetResult(
    final PaymentSheetResult paymentSheetResult
  ) {
    if (paymentSheetResult instanceof PaymentSheetResult.Canceled) {
      // Payment Canceled
    } else if (paymentSheetResult instanceof PaymentSheetResult.Failed) {
      // Payment Failed. See logcat for details or inspect paymentSheetResult.getError()
    } else if (paymentSheetResult instanceof PaymentSheetResult.Completed) {
      // Payment Complete
    }
  }
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

## Enable CVC recollection on confirmation

### Update parameters of the intent creation

# In-app integration for React Native

> This is a In-app integration for React Native for when platform is react-native. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=react-native.

## Set up Stripe

### Server-side 

This integration requires endpoints on your server that talk to the Stripe API. Use the official libraries for access to the Stripe API from your server:

```bash
\# Available as a gem
sudo gem install stripe
```

```ruby
\# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

```bash
\# Install through pip
pip3 install --upgrade stripe
```

```bash
\# Or find the Stripe package on http://pypi.python.org/pypi/stripe/
```

```python
\# Find the version you want to pin:
# https://github.com/stripe/stripe-python/blob/master/CHANGELOG.md
# Specify that version in your requirements.txt file
stripe>=5.0.0
```

```bash
\# Install the PHP library with Composer
composer require stripe/stripe-php
```

```bash
\# Or download the source directly: https://github.com/stripe/stripe-php/releases
```

```java
/*
  For Gradle, add the following dependency to your build.gradle and replace with
  the version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
*/
implementation "com.stripe:stripe-java:29.0.0"
```

```xml
<!--
  For Maven, add the following dependency to your POM and replace with the
  version number you want to use from:
  - https://mvnrepository.com/artifact/com.stripe/stripe-java or
  - https://github.com/stripe/stripe-java/releases/latest
-->
<dependency>
  <groupId>com.stripe</groupId>
  <artifactId>stripe-java</artifactId>
  <version>29.0.0</version>
</dependency>
```

```bash
\# For other environments, manually install the following JARs:
# - The Stripe JAR from https://github.com/stripe/stripe-java/releases/latest
# - Google Gson from https://github.com/google/gson
```

```bash
\# Install with npm
npm install stripe --save
```

```bash
\# Make sure your project is using Go Modules
go mod init
# Install stripe-go
go get -u github.com/stripe/stripe-go/v82
```

```go
// Then import the package
import (
  "github.com/stripe/stripe-go/v82"
)
```

```bash
\# Install with dotnet
dotnet add package Stripe.net
dotnet restore
```

```bash
\# Or install with NuGet
Install-Package Stripe.net
```

### Client-side 

The [React Native SDK](https://github.com/stripe/stripe-react-native) is open source and fully documented. Internally, it uses the [native iOS](https://github.com/stripe/stripe-ios) and [Android](https://github.com/stripe/stripe-android) SDKs. To install Stripe’s React Native SDK, run one of the following commands in your project’s directory (depending on which package manager you use):

```bash
yarn add @stripe/stripe-react-native
```

```bash
npm install @stripe/stripe-react-native
```

Next, install some other necessary dependencies:

- For iOS, navigate to the **ios** directory and run `pod install` to ensure that you also install the required native dependencies.
- For Android, there are no more dependencies to install.

We recommend following the [official TypeScript guide](https://reactnative.dev/docs/typescript#adding-typescript-to-an-existing-project) to add TypeScript support.

### Stripe initialization

To initialize Stripe in your React Native app, either wrap your payment screen with the `StripeProvider` component, or use the `initStripe` initialization method. Only the API [publishable key](https://docs.stripe.com/keys.md#obtain-api-keys) in `publishableKey` is required. The following example shows how to initialize Stripe using the `StripeProvider` component.

```jsx
import { useState, useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

function App() {
  const [publishableKey, setPublishableKey] = useState('');

  const fetchPublishableKey = async () => {
    const key = await fetchKey(); // fetch key from your server here
    setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      {/* Your app code here */}
    </StripeProvider>
  );
}
```

Use your API [test keys](https://docs.stripe.com/keys.md#obtain-api-keys) while you test and develop, and your [live mode](https://docs.stripe.com/keys.md#test-live-modes) keys when you publish your app.

## Enable payment methods

## Add an endpoint

## Collect payment details

Before displaying the mobile Payment Element, your checkout page should:

- Show the products being purchased and the total amount
- Collect any required shipping information
- Include a checkout button to present Stripe’s UI

In the checkout of your app, make a network request to the backend endpoint you created in the previous step and call `initPaymentSheet` from the `useStripe` hook.

```javascript
export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {
      paymentIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Jane Doe',
      }
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    // see below
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

When your customer taps the **Checkout** button, call `presentPaymentSheet()` to open the sheet. After the customer completes the payment, the sheet is dismissed and the promise resolves with an optional `StripeError<PaymentSheetError>`.

```javascript
export default function CheckoutScreen() {
  // continued from above

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
    }
  };

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

## Set up a return URL (iOS only)

When a customer exits your app (for example to authenticate in Safari or their banking app), provide a way for them to automatically return to your app. Many payment method types _require_ a return URL. If you don’t provide one, we can’t present payment methods that require a return URL to your users, even if you’ve enabled them.

To provide a return URL:

1. [Register](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme) a custom URL. Universal links aren’t supported.
1. [Configure](https://reactnative.dev/docs/linking) your custom URL.
1. Set up your root component to forward the URL to the Stripe SDK as shown below.

If you’re using Expo, [set your scheme](https://docs.expo.io/guides/linking/#in-a-standalone-app) in the `app.json` file.

```jsx
import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function MyApp() {
  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <View>
      <AwesomeAppComponent />
    </View>
  );
}
```

For more information on native URL schemes, refer to the [Android](https://developer.android.com/training/app-links/deep-linking) and [iOS](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app) docs.

## Handle post-payment events

Stripe sends a [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) event when the payment completes. Use the [Dashboard webhook tool](https://dashboard.stripe.com/webhooks) or follow the [webhook guide](https://docs.stripe.com/webhooks/quickstart.md) to receive these events and run actions, such as sending an order confirmation email to your customer, logging the sale in a database, or starting a shipping workflow.

Listen for these events rather than waiting on a callback from the client. On the client, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response. Setting up your integration to listen for asynchronous events is what enables you to accept [different types of payment methods](https://stripe.com/payments/payment-methods-guide) with a single integration.

In addition to handling the `payment_intent.succeeded` event, we recommend handling these other events when collecting payments with the Payment Element:

| Event                                                                                                                           | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Sent when a customer successfully completes a payment.                                                                                                                                                                                                                              | Send the customer an order confirmation and *fulfill* their order.                                                                                                              |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Sent when a customer successfully initiates a payment, but the payment has yet to complete. This event is most commonly sent when the customer initiates a bank debit. It’s followed by either a `payment_intent.succeeded` or `payment_intent.payment_failed` event in the future. | Send the customer an order confirmation that indicates their payment is pending. For digital goods, you might want to fulfill the order before waiting for payment to complete. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Sent when a customer attempts a payment, but the payment fails.                                                                                                                                                                                                                     | If a payment transitions from `processing` to `payment_failed`, offer the customer another attempt to pay.                                                                      |

## Test the integration

| Card number         | Scenario                                                            | How to test                                                                                           |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4242424242424242    | The card payment succeeds and doesn’t require authentication.       | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000002500003155    | The card payment requires *authentication*.                         | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 4000000000009995    | The card is declined with a decline code like `insufficient_funds`. | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |
| 6205500000000000004 | The UnionPay card has a variable length of 13-19 digits.            | Fill out the credit card form using the credit card number with any expiration, CVC, and postal code. |

| Payment method | Scenario                                                                                                                                                                   | How to test                                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                | Your customer fails to authenticate on the redirect page for a redirect-based and immediate notification payment method.                                                   | Choose any redirect-based payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page. |
| Pay by Bank    | Your customer successfully pays with a redirect-based and [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment method. | Choose the payment method, fill out the required details, and confirm the payment. Then click **Complete test payment** on the redirect page.            |
| Pay by Bank    | Your customer fails to authenticate on the redirect page for a redirect-based and delayed notification payment method.                                                     | Choose the payment method, fill out the required details, and confirm the payment. Then click **Fail test payment** on the redirect page.                |

| Payment method    | Scenario                                                                                          | How to test                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEPA Direct Debit | Your customer successfully pays with SEPA Direct Debit.                                           | Fill out the form using the account number `AT321904300235473204`. The confirmed PaymentIntent initially transitions to processing, then transitions to the succeeded status three minutes later. |
| SEPA Direct Debit | Your customer’s payment intent status transitions from `processing` to `requires_payment_method`. | Fill out the form using the account number `AT861904300235473202`.                                                                                                                                |

See [Testing](https://docs.stripe.com/testing.md) for additional information to test your integration.

## Enable Link

Enable Link in your [Payment Method settings](https://dashboard.stripe.com/settings/payment_methods) to allow your customers to securely save and reuse their payment information using Link’s one-click express checkout button.

### Pass your customer’s email to the Mobile Payment Element

Link authenticates a customer using their email address. Stripe recommends prefilling as much information as possible to streamline the checkout process.

## Enable Apple Pay

### Register for an Apple Merchant ID

Obtain an Apple Merchant ID by [registering for a new identifier](https://developer.apple.com/account/resources/identifiers/add/merchant) on the Apple Developer website.

Fill out the form with a description and identifier. Your description is for your own records and you can modify it in the future. Stripe recommends using the name of your app as the identifier (for example, `merchant.com.{{YOUR_APP_NAME}}`).

### Create a new Apple Pay certificate

Create a certificate for your app to encrypt payment data.

Go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard, click **Add new application**, and follow the guide.

Download a Certificate Signing Request (CSR) file to get a secure certificate from Apple that allows you to use Apple Pay.

One CSR file must be used to issue exactly one certificate. If you switch your Apple Merchant ID, you must go to the [iOS Certificate Settings](https://dashboard.stripe.com/settings/ios_certificates) in the Dashboard to obtain a new CSR and certificate.

### Integrate with Xcode

Add the Apple Pay capability to your app. In Xcode, open your project settings, click the **Signing & Capabilities** tab, and add the **Apple Pay** capability. You might be prompted to log in to your developer account at this point. Select the merchant ID you created earlier, and your app is ready to accept Apple Pay.

![](images/mobile/ios/xcode.png)
Enable the Apple Pay capability in Xcode


### Add Apple Pay

In accordance with [Apple’s guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) for recurring payments, you must also set a `cardItems` that includes a [RecurringCartSummaryItem](https://stripe.dev/stripe-react-native/api-reference/modules/ApplePay.html#RecurringCartSummaryItem) with the amount you intend to charge (for example, “$59.95 a month”).

You can also adopt [merchant tokens](https://developer.apple.com/apple-pay/merchant-tokens/) by setting the `request` with its `type` set to `PaymentRequestType.Recurring`

To learn more about how to use recurring payments with Apple Pay, see [Apple’s PassKit documentation](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

### Order tracking

To add [order tracking](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) information in iOS 16 or later, configure a `setOrderTracking` callback function. Stripe calls your implementation after the payment is complete, but before iOS dismisses the Apple Pay sheet.

In your implementation of `setOrderTracking` callback function, fetch the order details from your server for the completed order, and pass the details to the provided `completion` function.

To learn more about order tracking, see [Apple’s Wallet Orders documentation](https://developer.apple.com/documentation/walletorders).

## Enable Google Pay

### Set up your integration

To use Google Pay, first enable the Google Pay API by adding the following to the `<application>` tag of your **AndroidManifest.xml**:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

For more details, see Google Pay’s [Set up Google Pay API](https://developers.google.com/pay/api/android/guides/setup) for Android.

### Add Google Pay

## Enable card scanning (iOS only)

To enable card scanning support, set the `NSCameraUsageDescription` (**Privacy - Camera Usage Description**) in the Info.plist of your application, and provide a reason for accessing the camera (for example, “To scan cards”). Devices with iOS 13 or higher support card scanning.

## Customize the sheet

### Appearance

Customize colors, fonts, and so on to match the look and feel of your app by using the [appearance API](https://docs.stripe.com/elements/appearance-api.md?platform=react-native).

### Merchant display name

Specify a customer-facing business name by setting `merchantDisplayName`. By default, this is your app’s name.

### Dark mode

On Android, set light or dark mode on your app:

```
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

## Handle user logout

## Complete payment in your UI

You can present Payment Sheet to only collect payment method details and then later call a `confirm` method to complete payment in your app’s UI. This is useful if you have a custom buy button or require additional steps after payment details are collected.

![](images/mobile/payment-sheet/react-native-multi-step.png)

A sample integration is [available on our GitHub](https://github.com/stripe/stripe-react-native/blob/master/example/src/screens/PaymentsUICustomScreen.tsx).

1. First, call `initPaymentSheet` and pass `customFlow: true`. `initPaymentSheet` resolves with an initial payment option containing an image and label representing the customer’s payment method. Update your UI with these details.

```javascript
const {
  initPaymentSheet,
  presentPaymentSheet,
  confirmPaymentSheetPayment,
} = useStripe()

const { error, paymentOption } = await initPaymentSheet({
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  paymentIntentClientSecret: paymentIntent,
  customFlow: true,
  merchantDisplayName: 'Example Inc.',
});
// Update your UI with paymentOption
```

2. Use `presentPaymentSheet` to collect payment details. When the customer finishes, the sheet dismisses itself and resolves the promise. Update your UI with the selected payment method details.

```javascript
const { error, paymentOption } = await presentPaymentSheet();
```

3. Use `confirmPaymentSheetPayment` to confirm the payment. This resolves with the result of the payment.

```javascript
const { error } = await confirmPaymentSheetPayment();

if (error) {
  Alert.alert(`Error code: ${error.code}`, error.message);
} else {
  Alert.alert(
    'Success',
    'Your order is confirmed!'
  );
}
```

Setting `allowsDelayedPaymentMethods` to true allows [delayed notification](https://docs.stripe.com/payments/payment-methods.md#payment-notification) payment methods like US bank accounts. For these payment methods, the final payment status isn’t known when the `PaymentSheet` completes, and instead succeeds or fails later. If you support these types of payment methods, inform the customer their order is confirmed and only fulfill their order (for example, ship their product) when the payment is successful.

# Plugins

> This is a Plugins for when platform is plugins. View the original doc at https://docs.stripe.com/payments/accept-a-payment?platform=plugins.

Collect Stripe payments in whichever publishing or e-commerce platform you use, with a Stripe plugin created by our partners. The Stripe developer community uses Stripe’s APIs to create plugins and extensions.

If you use a third-party platform to build and maintain a website, you can add Stripe payments with a plugin.

All plugins on this page are ready for *Strong Customer Authentication* (SCA).

## Get started

Check out our full list of [partners](https://stripe.partners) for a solution to your use case.
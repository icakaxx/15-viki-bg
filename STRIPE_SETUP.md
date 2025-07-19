# Stripe Integration Setup Guide

## Overview
This guide explains how to set up Stripe payment processing for the checkout page. The integration allows customers to pay online using credit/debit cards directly on your website.

## Features
- ✅ Embedded Stripe Elements (no redirect to Stripe)
- ✅ Real-time card validation
- ✅ Secure payment processing
- ✅ Support for Bulgarian Lev (BGN)
- ✅ Responsive design
- ✅ Error handling and user feedback

## Setup Steps

### 1. Get Stripe API Keys
1. Sign up for a Stripe account at https://stripe.com
2. Go to the Stripe Dashboard
3. Navigate to Developers → API Keys
4. Copy your **Publishable Key** and **Secret Key**

### 2. Configure Environment Variables
1. Copy `env.example` to `.env.local`
2. Replace the placeholder keys with your actual Stripe keys:

```bash
# For testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_key_here

# For production (when ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
STRIPE_SECRET_KEY=sk_live_your_actual_key_here
```

### 3. Test the Integration
1. Start your development server: `npm run dev`
2. Go to the checkout page
3. Select "Online Payment" as payment method
4. The Stripe payment form will appear below
5. Use Stripe's test card numbers for testing:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits

## How It Works

### User Flow
1. User fills out checkout form
2. Selects "Online Payment" as payment method
3. Stripe payment form appears below
4. User enters card details
5. Payment is processed securely
6. On successful payment, user can complete order
7. Order is submitted with payment confirmation

### Technical Implementation
- **Frontend**: React components with Stripe Elements
- **Backend**: Next.js API routes for payment intent creation
- **Security**: Card data never touches your server
- **Currency**: Bulgarian Lev (BGN) by default

## Files Added/Modified

### New Files
- `src/components/StripePaymentForm.js` - Main Stripe component
- `src/pages/api/create-payment-intent.js` - Payment intent API
- `src/styles/Component Styles/StripePaymentForm.module.css` - Stripe styles
- `env.example` - Environment variables template
- `STRIPE_SETUP.md` - This setup guide

### Modified Files
- `src/pages/checkout.js` - Added Stripe integration
- `src/styles/Page Styles/CheckoutPage.module.css` - Added Stripe section styles
- `public/locales/bg/common.json` - Added Bulgarian translations
- `public/locales/en/common.json` - Added English translations

## Security Notes
- ✅ Card data is processed directly by Stripe
- ✅ No sensitive data stored on your server
- ✅ HTTPS required for production
- ✅ Environment variables for API keys
- ✅ Server-side payment intent creation

## Troubleshooting

### Common Issues
1. **"Stripe is not configured" error**
   - Check that `.env.local` exists and has correct keys
   - Restart development server after adding environment variables

2. **Payment fails**
   - Verify you're using test keys for development
   - Check Stripe Dashboard for error details
   - Ensure currency is set to BGN

3. **Form doesn't appear**
   - Check browser console for JavaScript errors
   - Verify Stripe packages are installed correctly

### Support
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing#cards

## Production Deployment
1. Replace test keys with live keys in `.env.local`
2. Ensure HTTPS is enabled
3. Test with small amounts first
4. Monitor Stripe Dashboard for transactions
5. Set up webhook endpoints if needed

## Next Steps
- Add webhook handling for payment confirmations
- Implement order status updates
- Add payment method saving for returning customers
- Set up Stripe Dashboard monitoring 
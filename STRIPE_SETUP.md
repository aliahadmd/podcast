# Stripe Setup Guide

## Error: "Neither apiKey nor config.authenticator provided"

This error occurs when the Stripe secret key is not configured. Follow these steps to set up Stripe:

## 🔑 Getting Your Stripe API Keys

### 1. **Create a Stripe Account** (if you don't have one)
   - Go to [https://stripe.com](https://stripe.com)
   - Click "Sign up" and create your account
   - Complete the registration process

### 2. **Get Your API Keys**
   - Log in to your Stripe Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Click on "Developers" in the left sidebar
   - Click on "API keys"
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_...`) - Already configured ✓
     - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key" to see it

### 3. **Configure Your Local Environment**

#### Option A: Using `.dev.vars` (Recommended for Wrangler)
Edit the `.dev.vars` file in your project root:

```bash
# Replace with your actual Stripe secret key
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# You can leave this as is for now (needed for webhooks later)
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

#### Option B: Using `wrangler.jsonc`
You can also update the `vars` section in `wrangler.jsonc`:

```json
"vars": {
  "STRIPE_SECRET_KEY": "sk_test_YOUR_SECRET_KEY_HERE",
  "STRIPE_WEBHOOK_SECRET": "whsec_your-webhook-secret-here"
}
```

### 4. **Create Stripe Products & Prices** (Optional but Recommended)

For the subscription to work properly, you should create products in Stripe:

1. Go to Stripe Dashboard → Products → Add Product
2. Create two products:
   - **Monthly Plan**: $9.99/month
   - **Yearly Plan**: $99.99/year
3. Copy the Price IDs (they start with `price_...`)
4. Update `lib/stripe.ts` with your actual Price IDs:

```typescript
export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: 999,
    interval: 'month',
    priceId: 'price_YOUR_MONTHLY_PRICE_ID', // Replace this
  },
  yearly: {
    name: 'Yearly Plan',
    price: 9999,
    interval: 'year',
    priceId: 'price_YOUR_YEARLY_PRICE_ID', // Replace this
  },
};
```

### 5. **Restart Your Development Server**

After configuring the keys:

```bash
npm run dev
```

## 🧪 Testing the Subscription Flow

### Test Mode
- Use Stripe's test mode (keys starting with `pk_test_` and `sk_test_`)
- Use test card numbers for payments:
  - **Success**: `4242 4242 4242 4242`
  - **Decline**: `4000 0000 0000 0002`
  - Any future expiry date (e.g., 12/34)
  - Any 3-digit CVC

### Test the Flow
1. Go to your app → Profile page
2. Click "Upgrade to Premium"
3. Select a plan (Monthly or Yearly)
4. You'll be redirected to Stripe Checkout
5. Use the test card number above
6. Complete the purchase
7. You should be redirected back to your app

## 🔔 Setting Up Webhooks (Optional - for Production)

Webhooks allow Stripe to notify your app about payment events:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/subscription/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_...`)
7. Add it to your `.dev.vars` or `wrangler.jsonc`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## 🚀 Production Deployment

For production, use Wrangler secrets instead of environment variables:

```bash
wrangler secret put STRIPE_SECRET_KEY
# Enter your production secret key when prompted

wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter your webhook secret when prompted
```

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## ❓ Troubleshooting

### "Neither apiKey nor config.authenticator provided"
- ✅ Make sure `STRIPE_SECRET_KEY` is set in `.dev.vars` or `wrangler.jsonc`
- ✅ Restart your dev server after adding the key

### "No such price: price_monthly"
- ✅ Create products and prices in Stripe Dashboard
- ✅ Update the `priceId` values in `lib/stripe.ts`

### "Invalid API Key"
- ✅ Make sure you're using the correct key (starts with `sk_test_` for test mode)
- ✅ Check for extra spaces or characters when copying the key
- ✅ Regenerate the key in Stripe Dashboard if needed

### Webhook Not Receiving Events
- ✅ Make sure your webhook URL is publicly accessible
- ✅ Check the webhook signing secret matches
- ✅ Use Stripe CLI for local webhook testing: `stripe listen --forward-to localhost:3000/api/subscription/webhook`

## 🎯 Quick Start Checklist

- [ ] Create Stripe account
- [ ] Get your secret key from Stripe Dashboard
- [ ] Add `STRIPE_SECRET_KEY` to `.dev.vars`
- [ ] (Optional) Create products and prices in Stripe
- [ ] (Optional) Update price IDs in `lib/stripe.ts`
- [ ] Restart development server
- [ ] Test subscription flow with test card `4242 4242 4242 4242`
- [ ] (Production) Set up webhooks
- [ ] (Production) Use `wrangler secret put` for sensitive keys

---

Need help? Check the [Stripe documentation](https://stripe.com/docs) or contact support.


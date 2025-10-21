# 🚀 Stripe + Cloudflare Workers - Quick Start Guide

## 📌 TL;DR

When using Stripe SDK in Cloudflare Workers, you MUST use `Stripe.createFetchHttpClient()` instead of the default Node.js HTTP client.

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(apiKey, {
  httpClient: Stripe.createFetchHttpClient(), // ← This is REQUIRED!
  apiVersion: '2025-02-24.acacia',
});
```

**Without this:** Connection timeouts, "Request was retried 2 times" errors  
**With this:** ✅ Works perfectly in Cloudflare Workers

---

## 🎯 The Problem

### Why Standard Stripe SDK Fails in Workers

Cloudflare Workers use **V8 JavaScript engine** with Web APIs, not full Node.js:

| Environment | HTTP Client | Result |
|-------------|-------------|--------|
| Node.js | `http`, `https`, `net` modules | ✅ Works |
| Cloudflare Workers | Only Web `fetch()` API | ❌ Fails without config |
| Cloudflare Workers + `createFetchHttpClient()` | Web `fetch()` API | ✅ Works |

**The Error You'll See:**
```json
{
  "error": "An error occurred with our connection to Stripe. Request was retried 2 times.",
  "details": "StripeConnectionError"
}
```

---

## ✅ The Solution

### 1. Install Stripe SDK

```bash
npm install stripe
```

**Minimum Version:** `stripe@8.0.0` or higher (with multi-environment support)

### 2. Initialize Stripe Correctly

```typescript
import Stripe from 'stripe';

// ✅ CORRECT - For Cloudflare Workers
export function getStripeInstance(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia', // Use latest version
    httpClient: Stripe.createFetchHttpClient(), // Required for Workers!
  });
}

// ❌ WRONG - Will fail in Workers
export function getStripeInstance(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
    // Missing httpClient - defaults to Node.js http module
  });
}
```

### 3. Use in Your API Routes

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_xxx',
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'https://your-domain.com/success',
      cancel_url: 'https://your-domain.com/cancel',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📋 Complete Setup Checklist

### Step 1: Environment Variables

In `wrangler.jsonc` or `.dev.vars`:

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

**⚠️ Important:** 
- Add `wrangler.jsonc` to `.gitignore` if it contains secrets
- Or use `wrangler secret put STRIPE_SECRET_KEY` for production

### Step 2: Create Stripe Prices

Instead of creating prices dynamically (slow), pre-create them:

```bash
# Visit Stripe Dashboard
https://dashboard.stripe.com/test/products

# Or use Stripe CLI
stripe prices create \
  --unit-amount=999 \
  --currency=usd \
  --recurring[interval]=month \
  --product-data[name]="Monthly Plan"
```

**Copy the Price ID:** `price_1234567890abcdef`

### Step 3: Use Price IDs in Code

```typescript
const PRICES = {
  monthly: 'price_1234567890abcdef',
  yearly: 'price_0987654321fedcba',
};

// Use in checkout
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: PRICES.monthly, // Pre-created price
    quantity: 1,
  }],
  mode: 'subscription',
  // ...
});
```

### Step 4: Test Locally

```bash
npm run dev
# Visit http://localhost:3000
```

**Test Card:** `4242 4242 4242 4242`

### Step 5: Deploy to Production

```bash
npm run deploy
```

---

## 🔒 Optional: Webhook Verification

If you need webhooks (for automatic subscription updates):

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
  cryptoProvider: Stripe.createSubtleCryptoProvider(), // For webhook verification
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'customer.subscription.created':
        // Handle subscription created
        break;
      case 'customer.subscription.updated':
        // Handle subscription updated
        break;
      // ... more events
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }
}
```

**Note:** For simpler apps, you can skip webhooks and verify subscriptions client-side after checkout.

---

## 🎯 Best Practices

### ✅ DO:

1. **Always use `createFetchHttpClient()`** in Workers environment
2. **Pre-create Stripe Prices** instead of creating them dynamically
3. **Use environment variables** for API keys
4. **Test in production** (not just local dev) - Workers behave differently
5. **Use latest Stripe SDK** (v8.0+)

### ❌ DON'T:

1. **Don't** use default Stripe initialization without `httpClient`
2. **Don't** create products/prices on every request (slow!)
3. **Don't** commit API keys to git
4. **Don't** assume local dev = production behavior
5. **Don't** use deprecated API versions

---

## 🐛 Troubleshooting

### Problem: "Connection timeout" errors

**Cause:** Not using `createFetchHttpClient()`

**Fix:**
```typescript
const stripe = new Stripe(apiKey, {
  httpClient: Stripe.createFetchHttpClient(), // Add this!
});
```

### Problem: "Request was retried 2 times"

**Cause:** Same as above - SDK trying to use Node.js `http` module

**Fix:** Same - use `createFetchHttpClient()`

### Problem: Slow checkout (10-30 seconds)

**Cause:** Creating prices dynamically

**Fix:** Pre-create prices in Stripe Dashboard, use Price IDs

### Problem: Webhooks not verifying

**Cause:** Missing `cryptoProvider`

**Fix:**
```typescript
const stripe = new Stripe(apiKey, {
  httpClient: Stripe.createFetchHttpClient(),
  cryptoProvider: Stripe.createSubtleCryptoProvider(), // Add this!
});
```

---

## 📚 Official Resources

### Essential Links

- **Stripe Workers Template:** https://github.com/stripe-samples/stripe-node-cloudflare-worker-template
- **Cloudflare Blog:** https://blog.cloudflare.com/stripe-workers-integration/
- **Stripe SDK Docs:** https://github.com/stripe/stripe-node
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/

### Key Documentation

1. **Stripe Multi-Environment Support:**  
   https://github.com/stripe/stripe-node#usage-with-typescript

2. **Cloudflare Node.js Compatibility:**  
   https://developers.cloudflare.com/workers/runtime-apis/nodejs/

3. **Stripe API Versions:**  
   https://stripe.com/docs/api/versioning

---

## 🎓 Quick Reference

### Minimal Working Example

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2025-02-24.acacia',
});

// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe';

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: 'price_xxx', quantity: 1 }],
    mode: 'subscription',
    success_url: 'https://your-app.com/success',
    cancel_url: 'https://your-app.com/cancel',
  });

  return Response.json({ url: session.url });
}
```

### Environment Setup

```bash
# .dev.vars (local development)
STRIPE_SECRET_KEY=sk_test_xxx

# wrangler.jsonc (production)
{
  "vars": {
    "STRIPE_PUBLISHABLE_KEY": "pk_test_xxx",
    "STRIPE_SECRET_KEY": "sk_test_xxx"
  }
}
```

### Test & Deploy

```bash
# Test locally
npm run dev

# Deploy to Workers
npm run deploy

# View logs
npx wrangler tail
```

---

## 🎉 Success Checklist

Your Stripe + Workers integration is working when:

- [ ] ✅ No connection timeout errors
- [ ] ✅ Checkout sessions create in <1 second
- [ ] ✅ Can complete test payment with `4242 4242 4242 4242`
- [ ] ✅ Subscription status updates correctly
- [ ] ✅ Works in both local dev AND production
- [ ] ✅ No "retried 2 times" errors

---

## 💡 Key Takeaway

**The ONE thing to remember:**

```typescript
// ✅ This line makes Stripe work in Cloudflare Workers
httpClient: Stripe.createFetchHttpClient()
```

Without it, Stripe SDK tries to use Node.js modules that don't exist in Workers.  
With it, everything works perfectly! 🚀

---

## 📞 Need Help?

**Common Issues:**
1. Check you're using `createFetchHttpClient()` ✅
2. Verify Stripe SDK version is 8.0+ ✅
3. Test in production, not just local ✅
4. Check Cloudflare Workers logs: `npx wrangler tail` ✅

**Still stuck?**
- Check [Stripe Workers Template](https://github.com/stripe-samples/stripe-node-cloudflare-worker-template)
- Read [Cloudflare Blog Post](https://blog.cloudflare.com/stripe-workers-integration/)
- Review [Stripe SDK Docs](https://github.com/stripe/stripe-node)

---

**Last Updated:** October 2025  
**Tested With:** 
- Stripe SDK: v17.6.0
- Next.js: 15.4.6
- Cloudflare Workers: wrangler 4.43.0
- Node.js: 18+

✅ **Verified Working Configuration**


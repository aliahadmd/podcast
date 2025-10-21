import Stripe from 'stripe';
import { getCloudflareEnv } from './cloudflare';
import { DatabaseHelper } from './db';
import { v4 as uuidv4 } from 'uuid';

export function getStripeInstance(): Stripe {
  const env = getCloudflareEnv();
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
    httpClient: Stripe.createFetchHttpClient(), // ✅ Required for Cloudflare Workers!
    // Optional: Use Web Crypto for Workers environment
    // cryptoProvider: Stripe.createSubtleCryptoProvider(),
  });
}

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: 999, // $9.99
    interval: 'month' as const,
    priceId: 'price_1SKTBrJIRKEOvHYHWdzJpRec', // Will be created dynamically - or replace with actual Stripe Price ID
  },
  yearly: {
    name: 'Yearly Plan',
    price: 9999, // $99.99
    interval: 'year' as const,
    priceId: 'price_1SKTEKJIRKEOvHYHxW6lKh1V', // Will be created dynamically - or replace with actual Stripe Price ID
  },
};

// Cache for dynamically created price IDs
const priceIdCache: { [key: string]: string } = {};

export class StripeHelper {
  private stripe: Stripe;
  private db: DatabaseHelper;

  constructor() {
    this.stripe = getStripeInstance();
    this.db = new DatabaseHelper();
  }

  async createCustomer(email: string, userId: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    return customer.id;
  }

  async getOrCreatePrice(planType: 'monthly' | 'yearly'): Promise<string> {
    const plan = SUBSCRIPTION_PLANS[planType];
    
    // If price ID is already configured, use it
    if (plan.priceId) {
      console.log(`Using pre-configured price ID for ${planType}: ${plan.priceId}`);
      return plan.priceId;
    }

    // Check cache
    if (priceIdCache[planType]) {
      console.log(`Using cached price ID for ${planType}: ${priceIdCache[planType]}`);
      return priceIdCache[planType];
    }

    // Create product and price dynamically
    console.log(`[Stripe] Creating product and price for ${planType} plan...`);
    
    try {
      const product = await this.stripe.products.create({
        name: `PodcastApp Premium - ${plan.name}`,
        description: `${plan.name} subscription to PodcastApp`,
      });
      console.log(`[Stripe] Created product: ${product.id}`);

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: {
          interval: plan.interval,
        },
      });
      console.log(`[Stripe] Created price: ${price.id}`);

      // Cache the price ID
      priceIdCache[planType] = price.id;
      
      return price.id;
    } catch (error: any) {
      console.error(`[Stripe] Error creating price for ${planType}:`, error.message);
      throw new Error(`Failed to create Stripe price: ${error.message}`);
    }
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    planType: 'monthly' | 'yearly',
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    console.log(`[Stripe] Creating checkout session for user ${userId}, plan: ${planType}`);
    
    // Get or create Stripe customer
    let subscription = await this.db.getSubscriptionByUserId(userId);
    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      console.log(`[Stripe] Creating new customer for ${email}`);
      customerId = await this.createCustomer(email, userId);
      console.log(`[Stripe] Created customer: ${customerId}`);
      
      // Update subscription with customer ID
      if (subscription) {
        await this.db.updateSubscription(userId, {
          stripe_customer_id: customerId,
        });
      } else {
        await this.db.createSubscription({
          id: uuidv4(),
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: null,
          plan_type: null,
          status: 'inactive',
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: 0,
        });
      }
    } else {
      console.log(`[Stripe] Using existing customer: ${customerId}`);
    }

    // Get or create the price
    console.log(`[Stripe] Getting price for ${planType}`);
    const priceId = await this.getOrCreatePrice(planType);
    console.log(`[Stripe] Using price: ${priceId}`);

    console.log(`[Stripe] Creating checkout session...`);
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planType,
      },
    });

    console.log(`[Stripe] Checkout session created: ${session.id}`);
    return session.url!;
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  async verifyAndActivateSession(sessionId: string, userId: string): Promise<void> {
    // Retrieve the checkout session
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session.subscription) {
      throw new Error('No subscription found in session');
    }

    // Get subscription details
    const subscription = session.subscription as Stripe.Subscription;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (!customerId) {
      throw new Error('Customer ID not found');
    }

    // Determine plan type
    const planType = subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly';

    // Prepare subscription data with explicit type conversions
    const subscriptionData = {
      stripe_customer_id: String(customerId),
      stripe_subscription_id: String(subscription.id),
      plan_type: planType as 'monthly' | 'yearly',
      status: subscription.status === 'active' ? 'active' as const : 'inactive' as const,
      current_period_start: Number(subscription.current_period_start) * 1000,
      current_period_end: Number(subscription.current_period_end) * 1000,
      cancel_at_period_end: subscription.cancel_at_period_end ? 1 : 0,
    };

    // Update or create subscription in database
    const existingSubscription = await this.db.getSubscriptionByUserId(userId);

    if (existingSubscription) {
      await this.db.updateSubscription(userId, subscriptionData);
    } else {
      await this.db.createSubscription({
        id: uuidv4(),
        user_id: userId,
        ...subscriptionData,
      });
    }

    // Send confirmation email
    if (subscription.status === 'active') {
      try {
        const user = await this.db.getUserById(userId);
        if (user) {
          const { EmailHelper } = await import('./email');
          const emailHelper = new EmailHelper();
          await emailHelper.sendSubscriptionConfirmation(user.email, user.name, planType);
        }
      } catch (error) {
        console.error('Failed to send subscription confirmation email:', error);
      }
    }
  }

}


import Stripe from 'stripe';
import { log } from '../vite';

if (!process.env.STRIPE_SECRET_KEY) {
  log('Missing required Stripe secret: STRIPE_SECRET_KEY', 'stripe');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Creates a payment intent for a one-time payment
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
    
    return paymentIntent;
  } catch (error) {
    log(`Failed to create Stripe payment intent: ${error}`, 'stripe');
    throw new Error('Failed to create Stripe payment intent');
  }
}

/**
 * Retrieves a payment intent by ID
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    log(`Failed to retrieve Stripe payment intent: ${error}`, 'stripe');
    throw new Error('Failed to retrieve Stripe payment intent');
  }
}

/**
 * Creates a customer in Stripe
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    return customer;
  } catch (error) {
    log(`Failed to create Stripe customer: ${error}`, 'stripe');
    throw new Error('Failed to create Stripe customer');
  }
}

/**
 * Creates a subscription for a customer
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });
    
    return subscription;
  } catch (error) {
    log(`Failed to create Stripe subscription: ${error}`, 'stripe');
    throw new Error('Failed to create Stripe subscription');
  }
}

/**
 * Retrieves a subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    log(`Failed to retrieve Stripe subscription: ${error}`, 'stripe');
    throw new Error('Failed to retrieve Stripe subscription');
  }
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    log(`Failed to cancel Stripe subscription: ${error}`, 'stripe');
    throw new Error('Failed to cancel Stripe subscription');
  }
}

/**
 * Creates a refund for a payment intent
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    if (reason) {
      refundParams.reason = reason;
    }
    
    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    log(`Failed to create Stripe refund: ${error}`, 'stripe');
    throw new Error('Failed to create Stripe refund');
  }
}

/**
 * Handles Stripe webhook events
 */
export function constructEventFromPayload(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    
    return event;
  } catch (error) {
    log(`Failed to verify Stripe webhook signature: ${error}`, 'stripe');
    throw new Error('Failed to verify Stripe webhook signature');
  }
}
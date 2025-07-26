# Stripe Integration Documentation

## Overview
This document provides comprehensive Stripe integration patterns for the **deKliK** platform, based on our current implementation and Stripe Node.js best practices.

## Current Implementation

### Configuration
```typescript
// lib/stripe/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Latest API version used in project
  typescript: true,
});
```

### Key Integration Points

#### 1. **Checkout Sessions**
Used for challenge payment processing:

```typescript
// Creating checkout session for challenge payment
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Défi Personnel',
        description: challenge.title,
      },
      unit_amount: Math.round(challenge.amount * 100), // Convert to cents
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
  metadata: {
    challengeId: challenge.id,
    userId: challenge.user_id,
  },
});
```

#### 2. **Webhook Event Handling**
Essential for updating challenge status:

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentConfirmation(paymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response('Success', { status: 200 });
}
```

#### 3. **Refunds for Successful Challenges**
When users complete their challenges (96% refund):

```typescript
// Refund processing for successful challenges
async function processRefund(challengeId: string) {
  const challenge = await getChallengeById(challengeId);
  const refundAmount = Math.round(challenge.amount * 0.96 * 100); // 96% in cents
  
  try {
    const refund = await stripe.refunds.create({
      payment_intent: challenge.payment_intent_id,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        challengeId: challenge.id,
        refundType: 'successful_challenge',
      },
    });
    
    return refund;
  } catch (error) {
    console.error('Refund failed:', error);
    throw error;
  }
}
```

## Security Best Practices

### 1. **Webhook Signature Verification**
Always verify webhook signatures to ensure events come from Stripe:

```typescript
const event = stripe.webhooks.constructEvent(
  webhookRawBody,
  webhookStripeSignatureHeader,
  webhookSecret
);
```

### 2. **Idempotency**
Use idempotency keys for critical operations:

```typescript
stripe.charges.refund(chargeId, {
  amount: 500
}, {
  idempotencyKey: refundIdempotencyKey
});
```

### 3. **Error Handling**
Implement comprehensive error handling:

```typescript
try {
  const customer = await stripe.customers.create(params);
} catch (error) {
  if (error instanceof Stripe.errors.StripeError) {
    // Handle Stripe-specific errors
    console.error('Stripe error:', error.type, error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Environment Variables

Required environment variables for Stripe integration:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...

# Business Configuration
COMMISSION_RATE=0.04 # 4% platform fee
MIN_PAYMENT_AMOUNT_EUR=10
MAX_PAYMENT_AMOUNT_EUR=500
```

## Testing with Stripe CLI

### Local Development Setup
1. Install Stripe CLI and login:
```bash
stripe login
```

2. Forward webhooks to local development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Trigger test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
```

## Payment Flow Architecture

### 1. **Challenge Creation Flow**
```
User Creates Challenge (draft) → 
Stripe Checkout Session → 
Payment Success → 
Webhook Updates Challenge (active)
```

### 2. **Challenge Completion Flow**
```
User Marks Challenge Complete → 
Validation Logic → 
Success: 96% Refund OR Failure: 100% Donation
```

## API Version Considerations

Currently using `2025-05-28.basil` API version with these key features:
- Updated Checkout Sessions for subscriptions
- Deprecated `total_count` property on lists
- Enhanced billing capabilities

## Error Types and Handling

Common Stripe errors in our implementation:

```typescript
// Handle different error types
if (error instanceof Stripe.errors.StripeCardError) {
  // Card was declined
} else if (error instanceof Stripe.errors.StripeRateLimitError) {
  // Rate limiting
} else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
  // Invalid parameters
} else if (error instanceof Stripe.errors.StripeAuthenticationError) {
  // Authentication failed
} else if (error instanceof Stripe.errors.StripeConnectionError) {
  // Network error
}
```

## Best Practices for deKliK

1. **Always validate amounts** - Convert EUR to cents, validate min/max
2. **Use metadata extensively** - Store challengeId, userId for webhook processing
3. **Implement proper logging** - Track all payment events for debugging
4. **Handle webhook retries** - Stripe will retry failed webhooks
5. **Test edge cases** - Failed payments, partial refunds, disputed charges

## Monitoring and Telemetry

Configure request monitoring:

```typescript
const stripe = new Stripe('sk_test_...', {
  maxNetworkRetries: 2,
  timeout: 20 * 1000, // 20 seconds
  telemetry: true, // Enable for Stripe analytics
});

// Monitor requests and responses
stripe.on('request', (request) => {
  console.log('Stripe request:', request.method, request.path);
});

stripe.on('response', (response) => {
  console.log('Stripe response:', response.status, response.request_id);
});
```
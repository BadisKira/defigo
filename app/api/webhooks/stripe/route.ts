/**
 * Stripe Webhook Handler - deKliK Platform
 * Clean and functional webhook processing
 */

import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/stripe';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  console.log('🔗 Webhook received');
  
  try {
    // 1. Parse request body and signature
    const body = await req.text();
    const headersList = await headers();  
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable');
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`✅ Processing webhook event: ${event.type} (${event.id})`);

    // 3. Simple idempotency check
    const supabase = createServiceRoleSupabaseClient();
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`⚠️ Event ${event.id} already processed, skipping`);
      return Response.json({ received: true, duplicate: true });
    }

    // 4. Record webhook event
    const { error: recordError } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        stripe_data: event,
        stripe_created_at: new Date(event.created * 1000).toISOString(),
        received_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      });

    if (recordError) {
      console.error('❌ Failed to record webhook event:', recordError);
      // Continue processing even if recording fails
    }

    // 5. Process event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        break;
    }

    console.log(`✅ Webhook ${event.id} processed successfully`);
    return Response.json({ 
      received: true, 
      processed: true,
      eventType: event.type
    });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    return Response.json({ 
      error: 'Webhook processing failed'
    }, { status: 500 });
  }
}

/**
 * Handles successful checkout session completion
 * Updates challenge status from draft to active
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`📝 Processing checkout session completed: ${session.id}`);
  
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const challengeId = session.metadata?.challengeId;
    const userId = session.metadata?.userId;
    
    if (!challengeId) {
      throw new Error('Missing challengeId in session metadata');
    }
    if (!userId) {
      throw new Error('Missing userId in session metadata');
    }

    console.log(`🎯 Processing payment for challenge: ${challengeId}, user: ${userId}`);

    // 1. Update challenge status to active
    const { error: challengeError } = await supabase
      .from('challenges')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .eq('status', 'draft'); // Only update if still in draft

    if (challengeError) {
      console.error('❌ Failed to update challenge status:', challengeError);
      throw challengeError;
    }

    console.log(`✅ Challenge ${challengeId} status updated to active`);

    // 2. Update transaction status to succeeded
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: session.payment_intent as string,
        metadata: {
          stripe_session_id: session.id,
          completed_at: new Date().toISOString()
        },
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('challenge_id', challengeId)
      .eq('status', 'pending');

    if (transactionError) {
      console.error('❌ Failed to update transaction status:', transactionError);
      throw transactionError;
    }

    console.log(`✅ Transaction updated for challenge ${challengeId}`);

  } catch (error) {
    console.error(`❌ Error processing checkout session ${session.id}:`, error);
    throw error;
  }
}

/**
 * Handles successful payment intent (backup processing)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`💳 Processing payment intent succeeded: ${paymentIntent.id}`);
  
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const challengeId = paymentIntent.metadata.challengeId;
    
    if (!challengeId) {
      console.log('ℹ️ No challengeId in payment intent metadata, skipping');
      return;
    }

    // Update transaction with charge ID
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({
        stripe_charge_id: paymentIntent.latest_charge as string,
        updated_at: new Date().toISOString()
      })
      .eq('challenge_id', challengeId)
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (transactionError) {
      console.error('❌ Failed to update transaction with charge ID:', transactionError);
    } else {
      console.log(`✅ Transaction updated with charge ID for challenge ${challengeId}`);
    }

  } catch (error) {
    console.error(`❌ Error processing payment intent ${paymentIntent.id}:`, error);
  }
}

/**
 * Handles failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`❌ Processing payment intent failed: ${paymentIntent.id}`);
  
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const challengeId = paymentIntent.metadata.challengeId;
    
    if (!challengeId) {
      console.log('ℹ️ No challengeId in payment intent metadata, skipping');
      return;
    }

    // Reset challenge to draft status
    await supabase
      .from('challenges')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId);

    // Update transaction status to failed
    await supabase
      .from('transactions')
      .update({
        status: 'failed',
        stripe_payment_intent_id: paymentIntent.id,
        failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('challenge_id', challengeId)
      .eq('status', 'pending');

    console.log(`✅ Challenge ${challengeId} reset to draft after payment failure`);

  } catch (error) {
    console.error(`❌ Error processing failed payment ${paymentIntent.id}:`, error);
  }
}

/**
 * Handles expired checkout session
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`⏰ Processing checkout session expired: ${session.id}`);
  
  const supabase = createServiceRoleSupabaseClient();
  
  try {
    const challengeId = session.metadata?.challengeId;
    
    if (!challengeId) {
      console.log('ℹ️ No challengeId in session metadata, skipping');
      return;
    }

    // Reset challenge to draft status
    await supabase
      .from('challenges')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', challengeId);

    // Mark transaction as failed
    await supabase
      .from('transactions')
      .update({
        status: 'failed',
        failure_reason: 'Checkout session expired',
        metadata: { 
          stripe_session_id: session.id, 
          expired_at: new Date().toISOString() 
        },
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('challenge_id', challengeId)
      .eq('status', 'pending');

    console.log(`✅ Challenge ${challengeId} reset after session expiration`);

  } catch (error) {
    console.error(`❌ Error processing expired session ${session.id}:`, error);
  }
}
// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import {stripe} from "@/lib/stripe/stripe";
import { createServiceRoleSupabaseClient } from '@/lib/supabase';

const supabase = createServiceRoleSupabaseClient();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    // Vérification de la signature Stripe
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(' Webhook signature verification failed:', err);
    return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }


  try {
    // Vérifier si l'événement a déjà été traité (idempotence)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`✅ Event ${event.id} already processed`);
      return Response.json({ received: true });
    }

    // Enregistrer l'événement webhook
    await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        metadata: event.data,
      });

    // Traiter selon le type d'événement
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
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: 'Webhook processing failed' + error}, { status: 500 });
  }
}



async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Processing payment_intent.succeeded');
  try {
    await supabase
      .from('transactions')
      .update({
        stripe_payment_id: paymentIntent.id,
        status:paymentIntent.status,
        webhook_received_at: new Date().toISOString(),
      })
      .eq('challenge_id', paymentIntent.metadata.challengeId);

    console.log('✅ Payment intent updated successfully');
  } catch (error) {
    console.error('❌ Error in handlePaymentIntentSucceeded:', error);
  }
}



async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {  
  
  try {
    // Récupération de la transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('challenge_id', session.metadata!.challenge_id)
      .single();

    if (transactionError || !transaction) {
      console.error('❌ Transaction not found for session:', session.id);
      return;
    }

    console.log('la transaction que j ai récupp => ', transaction );

    const sessionAmount = session.amount_total! / 100; // -> stripe utilise les centimes
    if (Math.abs(Number(transaction.amount) - sessionAmount) > 0.01) {
      console.error('❌ Amount mismatch detected:', {
        expected: transaction.amount,
        received: sessionAmount
      });
      
      // Marquer la transaction comme suspecte
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          webhook_received_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);
      return;
    }

    // Utilisation de votre fonction Supabase existante
    const { data: result, error: rpcError } = await supabase.rpc('complete_payment_debug', {
      p_challenge_id: transaction.challenge_id,
      p_clerk_user_id: transaction.clerk_user_id,
      p_session_id: session.id
    });

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError);
      return;
    }

    if (!result?.success) {
      console.error('❌ Payment completion failed:', result);
      return;
    }

    console.log('✅ Challenge payment completed successfully:', result);

    // Normalement je delete ça
    if (transaction.status === 'initiated') {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: "paid",
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string,
          webhook_received_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Could not update original transaction:', updateError);
      } else {
        console.log('Original transaction updated to completed');
      }
    }
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error);
  }
}


async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Processing payment_intent.payment_failed');
  
  try {
    // Marquer la transaction comme échouée
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        stripe_payment_id: paymentIntent.id,
        webhook_received_at: new Date().toISOString(),
      })
      .eq('stripe_payment_id', paymentIntent.id);

    if (error) {
      console.error('❌ Failed to update failed payment:', error);
      return;
    }

    console.log('✅ Failed payment processed successfully');
  } catch (error) {
    console.error('❌ Error in handlePaymentIntentFailed:', error);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('⏰ Processing checkout.session.expired');
  
  try {
    // Marquer la transaction comme annulée
    await supabase
      .from('transactions')
      .update({
        status: 'cancelled',
        webhook_received_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id);

    console.log('✅ Expired session processed successfully');
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionExpired:', error);
  }
}


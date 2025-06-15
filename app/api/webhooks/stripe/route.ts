// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import { stripe } from "@/lib/stripe/stripe";
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { TransactionStatus } from '@/types/transaction.types';
import { ChallengeStatus } from '@/types/challenge.types';

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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: 'Webhook processing failed' + error }, { status: 500 });
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
      console.error('Transaction not found for session:', session.id);
      return;
    }


    await supabase
      .from('transactions')
      .update({
        stripe_session_id: session.id,
        stripe_payment_id: session.payment_intent,
        payment_method_id: session.payment_method_configuration_details?.id,
      
      })
      .eq('id', transaction.id);

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}





async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    await supabase
      .from('transactions')
      .update({
        stripe_payment_id: paymentIntent.id,
        status: "paid" as TransactionStatus,
      })
      .eq('challenge_id', paymentIntent.metadata.challengeId);




      await supabase
      .from('challenges')
      .update({
        status: 'active' as ChallengeStatus,
        stripe_payment_status: paymentIntent.status,
        
      })
      .eq('id', paymentIntent.metadata.challenge_id);

    console.log('Payment intent updated successfully');
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
  }
}





async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Marquer la transaction comme échouée
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'failed' as TransactionStatus,
        stripe_payment_id: paymentIntent.id,
        webhook_received_at: new Date().toISOString(),
      })
      .eq('stripe_payment_id', paymentIntent.id);

    
    const {error :challengeError} = await supabase.from("challenges")
    .update({
      status:"draft",
      stripe_payment_id: paymentIntent.id,
    });

    if(challengeError){
      console.error("Failed to update challenge to draft after paiment failed",challengeError);
      return;
    }

    if (error) {
      console.error('Failed to update failed payment:', error);
      return;
    }

    console.log('Failed payment processed successfully');
  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error);
  }
}




async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  try {

    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('challenge_id', session.metadata!.challenge_id)
      .single();

    // Marquer la transaction comme annulée
    await supabase
      .from('transactions')
      .update({
        status: 'failed', // je suis pas sur de ça
        webhook_received_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

      await supabase.
      from("")

    console.log('Expired session processed successfully');
  } catch (error) {
    console.error('Error in handleCheckoutSessionExpired:', error);
  }
}


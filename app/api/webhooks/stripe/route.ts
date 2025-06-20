// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import { stripe } from "@/lib/stripe/stripe";
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { TransactionStatus } from '@/types/transaction.types';

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
  console.log("Processing checkout session completed:", session.id);
  
  try {
    const { data: result, error } = await supabase
      .rpc('update_payment_status_atomic_v2', {
        p_challenge_id: session.metadata!.challenge_id,
        p_stripe_payment_id: session.payment_intent as string,
        p_payment_status: 'paid',
        p_stripe_session_id: session.id,
        p_payment_method_id: session.payment_method_configuration_details?.id || null
      });

    if (error) {
      console.error('Database error in handleCheckoutSessionCompleted:', error);
      return;
    }

    if (!result.success) {
      console.error('Function error:', result.error);
      return;
    }

    console.log('Checkout session processed successfully:', result);
    
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment intent succeeded:", paymentIntent.id);

  try {
    const challengeId = paymentIntent.metadata.challengeId || paymentIntent.metadata.challenge_id;
    
    if (!challengeId) {
      console.error('No challenge_id found in payment intent metadata');
      return;
    }

    const { data: result, error } = await supabase
      .rpc('update_payment_status_atomic_v2', {
        p_challenge_id: challengeId,
        p_stripe_payment_id: paymentIntent.id,
        p_payment_status: 'paid'
      });

    if (error) {
      console.error('Database error in handlePaymentIntentSucceeded:', error);
      return;
    }

    if (!result.success) {
      console.error('Function error:', result.error);
      return;
    }

    console.log('Payment intent processed successfully:', result);
    
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
  }
}

// Fonction utilitaire pour vérifier et corriger les transactions bloquées
// async function fixStuckTransactions() {
//   console.log("Checking for stuck transactions...");
  
//   try {
//     // Récupérer les transactions "initiated" avec un payment_intent Stripe réussi
//     const { data: stuckTransactions, error: fetchError } = await supabase
//       .from('transactions')
//       .select('*, challenges(*)')
//       .eq('status', 'initiated')
//       .not('stripe_payment_id', 'is', null);

//     if (fetchError) {
//       console.error('Error fetching stuck transactions:', fetchError);
//       return;
//     }

//     console.log(`Found ${stuckTransactions?.length || 0} potentially stuck transactions`);

//     // Pour chaque transaction bloquée, vérifier le statut sur Stripe
//     for (const transaction of stuckTransactions || []) {
//       try {
//         // Ici vous pouvez ajouter une vérification avec l'API Stripe
//         // const paymentIntent = await stripe.paymentIntents.retrieve(transaction.stripe_payment_id);
        
//         // Si le paiement est réussi sur Stripe, corriger la base de données
//         const { data: result, error } = await supabase
//           .rpc('update_payment_status_atomic_v2', {
//             p_challenge_id: transaction.challenge_id,
//             p_stripe_payment_id: transaction.stripe_payment_id,
//             p_payment_status: 'paid'
//           });

//         if (error) {
//           console.error(`Error fixing transaction ${transaction.id}:`, error);
//         } else if (result.success) {
//           console.log(`Fixed stuck transaction ${transaction.id}`);
//         }
        
//       } catch (error) {
//         console.error(`Error processing stuck transaction ${transaction.id}:`, error);
//       }
//     }
    
//   } catch (error) {
//     console.error('Error in fixStuckTransactions:', error);
//   }
// }





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



/**
 * async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("AAAAAAAAAAAAAAH");
  console.log("payment Intent ==> ", paymentIntent);

  try {
    // Récupération de la transaction existante
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('challenge_id', paymentIntent.metadata.challengeId)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id);
      return;
    }

    // Mise à jour de la transaction avec toutes les informations de paiement
    await supabase
      .from('transactions')
      .update({
        stripe_payment_id: paymentIntent.id,
        status: "paid" as TransactionStatus,
        // Mise à jour des champs de session si disponibles dans les métadonnées
        ...(paymentIntent.metadata.sessionId && { 
          stripe_session_id: paymentIntent.metadata.sessionId 
        }),
        ...(paymentIntent.metadata.paymentMethodId && { 
          payment_method_id: paymentIntent.metadata.paymentMethodId 
        }),
      })
      .eq('id', transaction.id);

    // Mise à jour du challenge
    await supabase
      .from('challenges')
      .update({
        status: 'active' as ChallengeStatus,
        stripe_payment_status: paymentIntent.status,
      })
      .eq('id', paymentIntent.metadata.challengeId);

    console.log('Payment intent and transaction updated successfully');
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
  }
}
 */
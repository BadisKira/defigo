import { stripe } from '@/lib/stripe/stripe';
import {
    isWebhookAlreadyProcessed,
    markWebhookAsProcessed
} from '@/lib/stripe/stripe-security';
import { createSupabaseClient } from '@/lib/supabase';
import {headers} from "next/headers";
import Stripe from 'stripe';


export async function POST(request: Request) {

    const headersList =  await headers();
    const signature = headersList.get('stripe-signature') as string;
    

    if (!signature) {
        return Response.json({ error: 'Signature manquante' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        const body = await request.text();
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Erreur webhook signature:', err);
        return Response.json({ error: 'Signature invalide' }, { status: 400 });
    }

    try {
        // Déduplication
        if (await isWebhookAlreadyProcessed(event.id)) {
            return Response.json({ received: true });
        }

        // Traitement des événements
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                break;
            default:
                console.log(`Événement non géré: ${event.type}`);
        }

        await markWebhookAsProcessed(event.id, event.type);
        return Response.json({ received: true });

    } catch (error) {
        console.error('Erreur webhook:', error);
        return Response.json({ error: 'Erreur traitement' }, { status: 500 });
    }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { challenge_id: challengeId, user_id: userId } = session.metadata || {};

    if (!challengeId || !userId) {
        throw new Error('Métadonnées manquantes');
    }

    const supabase = createSupabaseClient();

    // Transaction atomique avec Supabase
    const { error } = await supabase.rpc('complete_payment', {
        p_challenge_id: challengeId,
        p_user_id: userId,
        p_session_id: session.id
    });

    if (error) {
        throw new Error(`Erreur completion: ${error.message}`);
    }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const supabase = createSupabaseClient();

    await supabase
        .from('transactions')
        .update({
            status: 'completed',
            webhook_received_at: new Date().toISOString()
        })
        .eq('stripe_payment_id', paymentIntent.id);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const supabase = createSupabaseClient();

    await supabase
        .from('transactions')
        .update({
            status: 'failed',
            webhook_received_at: new Date().toISOString()
        })
        .eq('stripe_payment_id', paymentIntent.id);
}
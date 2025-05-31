import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/stripe';
import {
  validatePaymentAmount,
  verifyUserOwnsChallenge,
  calculateCommission,
  checkRateLimit
} from '@/lib/stripe/stripe-security';
import { createSupabaseClient } from '@/lib/supabase';



export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Rate limiting moderne
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor?.split(',')[0] || 'unknown';

    if (!checkRateLimit(`${userId}-${clientIP}`, 3, 300000)) {
      return Response.json({ error: 'Trop de requêtes' }, { status: 429 });
    }

    // 3. Validation des données avec Next.js 15
    const body = await request.json();
    const { challengeId, amount } = body;

    if (!challengeId || !amount || typeof amount !== 'number') {
      return Response.json({ error: 'Données invalides' }, { status: 400 });
    }

    if (!validatePaymentAmount(amount)) {
      return Response.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // 4. Vérifications de sécurité
    const ownsChallenge = await verifyUserOwnsChallenge(challengeId, userId);
    if (!ownsChallenge) {
      return Response.json({ error: 'Challenge non trouvé' }, { status: 404 });
    }

    const supabase = createSupabaseClient();
    // 5. Vérifier paiement existant
    const { data: existingPayment } = await supabase
      .from('transactions')
      .select('stripe_session_id, status')
      .eq('challenge_id', challengeId)
      .eq('clerk_user_id', userId)
      .in('status', ['pending', 'completed'])
      .maybeSingle(); // Utilise maybeSingle() au lieu de single()

    if (existingPayment) {
      return Response.json(
        { error: 'Paiement déjà en cours ou complété' },
        { status: 409 }
      );
    }

    // 6. Récupérer challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('title, association_name')
      .eq('id', challengeId)
      .single();

    // 7. Calculs
    const commission = calculateCommission(amount);
    const netAmount = amount - commission;

    // 8. URL de base moderne
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 9. Création session Stripe avec API moderne
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Engagement: ${challenge?.title || 'Défi personnel'}`,
            description: `Bénéficiaire: ${challenge?.association_name || 'Non spécifiée'}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel?challenge_id=${challengeId}`,
      metadata: {
        challenge_id: challengeId,
        user_id: userId,
        net_amount: netAmount.toString(),
        commission: commission.toString(),
      },
      // Sécurité renforcée
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      customer_creation: 'always',
      invoice_creation: { enabled: true },
    });

    // 10. Transaction en base
    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        challenge_id: challengeId,
        clerk_user_id: userId,
        stripe_payment_id: session.payment_intent,
        stripe_session_id: session.id,
        amount: amount,
        commission: commission,
        status: 'pending',
        payment_type: 'engagement'
      });

    if (insertError) {
      console.error('Erreur insertion transaction:', insertError);
      return Response.json(
        { error: 'Erreur création paiement' },
        { status: 500 }
      );
    }

    // 11. Mise à jour challenge
    await supabase
      .from('challenges')
      .update({ stripe_payment_status: 'processing' })
      .eq('id', challengeId);

    return Response.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Erreur session Stripe:', error);
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
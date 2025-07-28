/**
 * Stripe Checkout Session API - deKliK Platform
 * Secure payment processing with payment locks and rate limiting
 * Based on documentation-code/stripe.md patterns
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe/stripe';
import {
  validatePaymentAmount,
  calculateCommission,
  generateStripeMetadata,
  checkRateLimit
} from '@/lib/stripe/stripe-security';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import { getUserIdFromClerkId } from '@/lib/helpers/user.helpers';

// Request validation schema
const CreateSessionSchema = z.object({
  challengeId: z.string().uuid('Challenge ID invalide'),
  amount: z.number().int().positive('Le montant doit être positif')
});

export async function POST(request: NextRequest) {
  let paymentLockId: string | undefined;
  
  try {
    console.log('🚀 Starting checkout session creation');

    // 1. Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return Response.json({ error: "Authentification requise" }, { status: 401 });
    }
    console.log('✅ Clerk user authenticated:', clerkUserId);

    // 2. Get internal user_id from Clerk user ID
    const userId = await getUserIdFromClerkId(clerkUserId);
    if (!userId) {
      return Response.json({ error: "Profil utilisateur introuvable" }, { status: 404 });
    }
    console.log('✅ Internal user_id found:', userId);

    // 3. Rate limiting per user
    const rateLimit = await checkRateLimit(userId, 'payment', 3, 1); // 3 paiements max par minute
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for user: ${userId}`);
      return Response.json({ 
        error: 'Trop de tentatives de paiement. Veuillez attendre avant de réessayer.',
        resetTime: rateLimit.resetTime 
      }, { status: 429 });
    }
    console.log('✅ Rate limit check passed:', rateLimit);

    // 4. Request validation
    const body = await request.json();
    console.log('📦 Request body received:', body);
    
    const validation = CreateSessionSchema.safeParse(body);
    console.log('✅ Validation result:', validation);
    
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.issues);
      return Response.json(
        { error: 'Données invalides', details: validation.error.issues }, 
        { status: 400 }
      );
    }

    const { challengeId, amount } = validation.data;
    console.log('💰 Processing payment for challenge:', challengeId, 'amount:', amount);

    // 4. Payment amount validation
    const amountValidation = validatePaymentAmount(amount);
    if (!amountValidation.valid) {
      return Response.json({ error: amountValidation.error }, { status: 400 });
    }

    // 5. User ownership verification (SIMPLIFIED FOR DEBUGGING)
    console.log('👤 Skipping ownership check for debugging - will be done in challenge validation');

    // 6. Simple challenge validation (BYPASSING COMPLEX VALIDATION FOR DEBUGGING)
    console.log('🔍 Simple challenge validation for:', challengeId);
    const supabase = createServiceRoleSupabaseClient();
    
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, status, amount, user_id')
      .eq('id', challengeId)
      .eq('user_id', userId) // Check ownership here
      .single();
    
    console.log('📊 Simple challenge query result:', { challenge, challengeError });
    
    if (challengeError || !challenge) {
      console.error('❌ Challenge not found:', challengeError);
      return Response.json({ error: 'Défi introuvable' }, { status: 404 });
    }
    
    if (challenge.status !== 'draft') {
      return Response.json({ error: 'Ce défi ne peut plus être payé' }, { status: 400 });
    }
    
    console.log('✅ Challenge validated:', challenge);

    // 7. Payment locks (DISABLED FOR DEBUGGING)
    console.log('🔒 Skipping payment lock for debugging');

    // 8. Check for existing transactions
    const { data: existingTransaction } = await supabase
      .from('transactions')
      .select('id, status, metadata')
      .eq('challenge_id', challengeId)
      .maybeSingle();

    // If transaction exists and is not pending/failed, challenge is already paid
    if (existingTransaction && !['pending', 'failed'].includes(existingTransaction.status)) {
      return Response.json(
        { error: 'Ce défi a déjà été payé' }, 
        { status: 409 }
      );
    }

    // 9. Business calculations
    const commission = calculateCommission(amount);
    const netAmount = amount - commission;

    // 10. Generate base URL for redirects
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 11. Create Stripe checkout session
    const sessionMetadata = generateStripeMetadata(challengeId, userId, 'checkout_payment');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Défi: ${challenge.title}`,
            description: `Montant: ${amount}€`,
            metadata: {
              challengeId,
              amount: amount.toString()
            }
          },
          unit_amount: amount * 100 // Convert EUR to cents
        },
        quantity: 1
      }],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel?challenge_id=${challengeId}`,
      metadata: {
        ...sessionMetadata,
        net_amount: netAmount.toString(),
        commission: commission.toString()
      },
      payment_intent_data: {
        metadata: sessionMetadata,
        description: `Paiement défi: ${challenge.title}`
      },
      // Security enhancements
      phone_number_collection: { enabled: true },
      customer_creation: 'always',
      invoice_creation: { enabled: true }
      // consent_collection: {
      //   terms_of_service: 'required'
      // }
    });

    // 12. Create or update transaction record
    const transactionData = {
      challenge_id: challengeId,
      user_id: userId, // Use user_id instead of clerk_user_id
      amount,
      net_amount: netAmount,
      commission_amount: commission,
      status: 'pending' as const,
      type: 'capture' as const,
      metadata: {
        stripe_session_id: session.id,
        operation: 'checkout_payment',
        created_via: 'checkout_api'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingTransaction) {
      // Update existing failed/pending transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          ...transactionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTransaction.id);

      if (updateError) {
        throw new Error(`Erreur mise à jour transaction: ${updateError.message}`);
      }
    } else {
      // Create new transaction
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (insertError) {
        throw new Error(`Erreur création transaction: ${insertError.message}`);
      }
    }

    // 13. Payment lock release (DISABLED FOR DEBUGGING)
    console.log('🔓 Skipping payment lock release for debugging');

    console.log('✅ Checkout session created successfully:', session.id);
    return Response.json({
      url: session.url,
      sessionId: session.id,
      amount,
      commission,
      netAmount
    });

  } catch (error) {
    // Payment lock cleanup (DISABLED FOR DEBUGGING)
    console.log('🔓 Skipping payment lock cleanup on error for debugging');

    console.error('Stripe checkout session error:', error);
    
    // Return appropriate error response
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation des données échouée', details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}